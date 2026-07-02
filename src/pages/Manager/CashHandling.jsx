/**
 * ManagerCashApproval.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Manager-facing page. Once the Admin has accepted a transfer and handed it
 * off (cash_transfers_to_admin.status = "Accepted" AND
 * manager_proof_status = "Pending"), it shows up here for the manager to:
 *   1. Confirm receipt of the cash (manager_proof_status -> "Accepted"),
 *      choosing at that moment whether it was deposited to the bank or is
 *      being kept as cash (bank_deposit boolean).
 *   2. Optionally flip a "Not Deposited" record to "Deposited" later.
 *   3. Once bank_deposit = true, the choice is PERMANENTLY LOCKED — the
 *      switch becomes disabled and no further mutation is allowed for that
 *      record, enforced both in the UI and again right before the mutation
 *      fires (defense in depth against stale UI state).
 *   4. Dispute/reject a handoff (manager_proof_status -> "Rejected"),
 *      which is only allowed before the cash has been marked deposited.
 *
 * SCOPE ASSUMPTION: a manager oversees a single branch, so the main query
 * filters by branch_id = the logged-in manager's staff.branch_id. If your
 * managers should see multiple/all branches, remove the `filter` block in
 * LOAD_MANAGER_TRANSFERS (see comment at that query).
 *
 * Mirrors the fixes already applied to AdminCashTransferApproval.jsx:
 *  - orderBy is a LIST: [{ created_at: DescNullsLast }] (pg_graphql requires
 *    an array; a bare object silently kills the whole query).
 *  - useLazyQuery results are read via the returned `data`/`error` +
 *    useEffect, NOT the onCompleted/onError options — those were removed
 *    in Apollo Client 4 (the "@apollo/client/react" import path) and are a
 *    silent no-op there.
 *  - Mutation row filters use `BigInt!`, matching the bigint `id` column —
 *    not `ID!`, which is reserved for the opaque nodeId field.
 */

import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import {
    BankOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    ExclamationCircleOutlined,
    LockOutlined,
    ReloadOutlined,
    SafetyCertificateOutlined,
    WalletOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../const/functions";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const { Text } = Typography;

const MANAGER_PROOF = {
    AWAITING: "Awaiting", // admin hasn't handed it off yet — never shown here
    PENDING: "Pending", // handed off, waiting on manager confirmation
    ACCEPTED: "Accepted", // manager confirmed receipt
    REJECTED: "Rejected", // manager disputed / rejected
};

const managerProofColors = {
    [MANAGER_PROOF.PENDING]: "orange",
    [MANAGER_PROOF.ACCEPTED]: "green",
    [MANAGER_PROOF.REJECTED]: "red",
};
const managerProofIcons = {
    [MANAGER_PROOF.PENDING]: <ClockCircleOutlined />,
    [MANAGER_PROOF.ACCEPTED]: <CheckCircleOutlined />,
    [MANAGER_PROOF.REJECTED]: <CloseCircleOutlined />,
};

const normalize = (v) => (v || "").toString().trim().toLowerCase();

// ── Only rows already accepted by admin and handed to this manager ──
// Filtered to the manager's own branch. Remove the `filter` block below if
// managers should see every branch's transfers instead.
const LOAD_MANAGER_TRANSFERS = gql`
    query getManagerCashTransfers($branchId: Int!) {
        cash_transfers_to_adminCollection(
            filter: { branch_id: { eq: $branchId } }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    by
                    amount
                    note
                    created_at
                    cash_type_id
                    branch_id
                    manager_proof_status
                    manager_proof_at
                    bank_deposit
                    cash_transfer_status {
                        id
                        status
                    }
                }
            }
        }
    }
`;

const LOAD_TYPE_LOOKUP = gql`
    query getCashTypes {
        cash_typeCollection {
            edges {
                node {
                    id
                    type
                }
            }
        }
    }
`;

const LOAD_STAFF_LOOKUP = gql`
    query getStaffNames {
        staffCollection {
            edges {
                node {
                    id
                    first_name
                    last_name
                }
            }
        }
    }
`;

// Manager confirms receipt (or disputes it) and sets the deposit choice.
// $id is BigInt! to match the bigint `id` column — not ID!.
const SET_MANAGER_DECISION = gql`
    mutation setManagerDecision(
        $id: BigInt!
        $managerProofStatus: String!
        $managerProofAt: Datetime!
        $bankDeposit: Boolean!
    ) {
        updatecash_transfers_to_adminCollection(
            filter: { id: { eq: $id } }
            set: {
                manager_proof_status: $managerProofStatus
                manager_proof_at: $managerProofAt
                bank_deposit: $bankDeposit
            }
        ) {
            records {
                id
                manager_proof_status
                manager_proof_at
                bank_deposit
            }
        }
    }
`;

// Used only to flip an already-accepted, not-yet-deposited record to
// deposited. Guarded in code so it can never fire once bank_deposit = true.
const SET_BANK_DEPOSIT = gql`
    mutation setBankDeposit($id: BigInt!, $bankDeposit: Boolean!) {
        updatecash_transfers_to_adminCollection(
            filter: { id: { eq: $id }, bank_deposit: { eq: false } }
            set: { bank_deposit: $bankDeposit }
        ) {
            records {
                id
                bank_deposit
            }
        }
    }
`;

function ManagerCashApproval() {
    const { staff } = useAuth();

    const [transfers, setTransfers] = useState([]);
    const [rawEdgeCount, setRawEdgeCount] = useState(null); // null = not run yet, -1 = errored

    const [typeLookup, setTypeLookup] = useState([]);
    const [staffLookup, setStaffLookup] = useState([]);

    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");

    const [confirmSubmittingId, setConfirmSubmittingId] = useState(null);
    const [depositTogglingId, setDepositTogglingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null); // record being confirmed
    const [modalDeposit, setModalDeposit] = useState(false);

    // ── Main query, scoped to this manager's branch ──
    const [loadTransfers, { data: transfersData, loading: transfersLoading, error: transfersError }] =
        useLazyQuery(LOAD_MANAGER_TRANSFERS, { fetchPolicy: "network-only" });

    const [lastEdges, setLastEdges] = useState(null);

    const buildRows = (edges) => {
        setLastEdges(edges);
        const typeMap = new Map(typeLookup.map((t) => [String(t.id), t.type]));
        const staffMap = new Map(
            staffLookup.map((s) => [String(s.id), `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim()])
        );

        setTransfers(
            edges
                // Only ever show rows admin has actually accepted & handed off.
                .filter(({ node }) => normalize(node.manager_proof_status) !== normalize(MANAGER_PROOF.AWAITING))
                .map(({ node }) => {
                    const managerProofStatus = node.manager_proof_status ?? MANAGER_PROOF.PENDING;
                    return {
                        key: node.id,
                        id: node.id,
                        submittedBy: staffMap.get(String(node.by)) || `Staff #${node.by}`,
                        amount: node.amount ?? 0,
                        date: node.created_at ? dayjs(node.created_at).format("YYYY-MM-DD HH:mm") : "—",
                        note: node.note ?? "—",
                        cashType:
                            typeMap.get(String(node.cash_type_id)) ||
                            (node.cash_type_id ? `Type #${node.cash_type_id}` : "Unknown"),
                        managerProofStatus,
                        managerProofNorm: normalize(managerProofStatus),
                        managerProofAt: node.manager_proof_at
                            ? dayjs(node.manager_proof_at).format("YYYY-MM-DD HH:mm")
                            : "—",
                        bankDeposit: node.bank_deposit ?? false,
                    };
                })
        );
    };

    useEffect(() => {
        if (transfersData) {
            const edges = transfersData?.cash_transfers_to_adminCollection?.edges || [];
            setRawEdgeCount(edges.length);
            buildRows(edges);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transfersData]);

    useEffect(() => {
        if (transfersError) {
            setRawEdgeCount(-1);
            console.error("❌ getManagerCashTransfers error:", transfersError);
        }
    }, [transfersError]);

    // Re-map once a lookup arrives after the transfers already loaded.
    useEffect(() => {
        if (lastEdges) buildRows(lastEdges);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeLookup, staffLookup]);

    // ── Cosmetic lookups ──
    const [loadTypeLookup, { data: typeLookupData }] = useLazyQuery(LOAD_TYPE_LOOKUP, {
        fetchPolicy: "network-only",
    });
    useEffect(() => {
        if (typeLookupData) setTypeLookup((typeLookupData?.cash_typeCollection?.edges || []).map((e) => e.node));
    }, [typeLookupData]);

    const [loadStaffLookup, { data: staffLookupData }] = useLazyQuery(LOAD_STAFF_LOOKUP, {
        fetchPolicy: "network-only",
    });
    useEffect(() => {
        if (staffLookupData) setStaffLookup((staffLookupData?.staffCollection?.edges || []).map((e) => e.node));
    }, [staffLookupData]);

    const [setManagerDecision] = useMutation(SET_MANAGER_DECISION);
    const [setBankDeposit] = useMutation(SET_BANK_DEPOSIT);

    // ── Fire everything once we have an authenticated, branch-scoped staff record ──
    useEffect(() => {
        if (staff?.id && staff?.branch_id) {
            loadTransfers({ variables: { branchId: staff.branch_id } });
            loadTypeLookup();
            loadStaffLookup();
        }
    }, [staff?.id, staff?.branch_id]);

    const refreshData = () => {
        if (!staff?.id || !staff?.branch_id) {
            message.warning("Still waiting for your session to load — try again shortly.");
            return;
        }
        loadTransfers({ variables: { branchId: staff.branch_id } });
        loadTypeLookup();
        loadStaffLookup();
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const filteredTransfers = useMemo(() => {
        return transfers.filter((t) => {
            if (filterStatus !== "All" && normalize(t.managerProofStatus) !== normalize(filterStatus)) return false;
            if (filterType !== "All" && t.cashType !== filterType) return false;
            return true;
        });
    }, [transfers, filterStatus, filterType]);

    const awaitingConfirmation = transfers.filter((t) => t.managerProofNorm === normalize(MANAGER_PROOF.PENDING));
    const acceptedNotDeposited = transfers.filter(
        (t) => t.managerProofNorm === normalize(MANAGER_PROOF.ACCEPTED) && !t.bankDeposit
    );
    const deposited = transfers.filter(
        (t) => t.managerProofNorm === normalize(MANAGER_PROOF.ACCEPTED) && t.bankDeposit
    );
    const rejected = transfers.filter((t) => t.managerProofNorm === normalize(MANAGER_PROOF.REJECTED));
    const sum = (list) => list.reduce((s, t) => s + t.amount, 0);

    const statCards = [
        {
            title: "Awaiting Your Confirmation",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(awaitingConfirmation))} (${awaitingConfirmation.length})`,
            accent: "#faad14",
            subtitle: "Handed off by admin, needs your confirmation",
            customIcon: <ClockCircleOutlined style={{ color: "#faad14", fontSize: 22 }} />,
        },
        {
            title: "Accepted — Not Deposited",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(acceptedNotDeposited))} (${acceptedNotDeposited.length})`,
            accent: "#1677ff",
            subtitle: "Confirmed, held as cash",
            customIcon: <WalletOutlined style={{ color: "#1677ff", fontSize: 22 }} />,
        },
        {
            title: "Deposited to Bank",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(deposited))} (${deposited.length})`,
            accent: "#52c41a",
            subtitle: "Locked — cannot be changed",
            customIcon: <SafetyCertificateOutlined style={{ color: "#52c41a", fontSize: 22 }} />,
        },
        {
            title: "Rejected",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(rejected))} (${rejected.length})`,
            accent: "#ff4d4f",
            subtitle: "Disputed and returned to admin",
            customIcon: <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />,
        },
    ];

    // ── Open the confirm/dispute modal ──
    const openConfirmModal = (record) => {
        setModalDeposit(false);
        setConfirmModal(record);
    };

    const handleConfirmSubmit = async (decision) => {
        if (!confirmModal) return;
        const isAccept = decision === "accept";
        setConfirmSubmittingId(confirmModal.id);
        try {
            await setManagerDecision({
                variables: {
                    id: confirmModal.id,
                    managerProofStatus: isAccept ? MANAGER_PROOF.ACCEPTED : MANAGER_PROOF.REJECTED,
                    managerProofAt: dayjs().toISOString(),
                    // Reject always leaves bank_deposit false; accept uses the toggle.
                    bankDeposit: isAccept ? modalDeposit : false,
                },
            });
            message.success(
                isAccept
                    ? modalDeposit
                        ? "Cash confirmed and marked as deposited to the bank. This is now locked."
                        : "Cash confirmed and recorded as held (not yet deposited)."
                    : "Transfer disputed and sent back to admin."
            );
            setConfirmModal(null);
            refreshData();
        } catch (err) {
            console.error("❌ Manager decision mutation error:", err);
            message.error("Failed to record your decision: " + err.message);
        } finally {
            setConfirmSubmittingId(null);
        }
    };

    // ── Flip an already-accepted, not-yet-deposited record to deposited ──
    // Guarded: the mutation itself only matches rows where bank_deposit is
    // still false (filter: { bank_deposit: { eq: false } }), so even a
    // stale UI / race condition can never re-open a locked record.
    const handleMarkDeposited = (record) => {
        if (record.bankDeposit) return; // already locked, should be unreachable via UI
        Modal.confirm({
            title: "Mark this cash as deposited to the bank?",
            icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
            content: (
                <div>
                    <p>
                        Transfer <strong>#{record.id}</strong> — <strong>{formatCurrency(record.amount)}</strong>
                    </p>
                    <p style={{ color: "#ff4d4f", fontSize: 12 }}>
                        ⚠ This cannot be undone. Once marked as deposited, this record is permanently locked.
                    </p>
                </div>
            ),
            okText: "Yes, Mark Deposited",
            cancelText: "Cancel",
            okButtonProps: { style: { background: "#52c41a", borderColor: "#52c41a" } },
            onOk: async () => {
                setDepositTogglingId(record.id);
                try {
                    const result = await setBankDeposit({ variables: { id: record.id, bankDeposit: true } });
                    const updated = result?.data?.updatecash_transfers_to_adminCollection?.records || [];
                    if (updated.length === 0) {
                        // The filter's bank_deposit: { eq: false } matched nothing —
                        // someone else already locked it first.
                        message.warning("This record was already marked as deposited by someone else.");
                    } else {
                        message.success("Marked as deposited to the bank. This is now locked.");
                    }
                    refreshData();
                } catch (err) {
                    console.error("❌ Mark-deposited mutation error:", err);
                    message.error("Failed to update: " + err.message);
                } finally {
                    setDepositTogglingId(null);
                }
            },
        });
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span>,
        },
        { title: "From (Officer)", dataIndex: "submittedBy", key: "submittedBy" },
        {
            title: "Type",
            dataIndex: "cashType",
            key: "cashType",
            render: (v) => <Tag color={/recovery/i.test(v) ? "geekblue" : "purple"}>{v}</Tag>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>,
            sorter: (a, b) => a.amount - b.amount,
        },
        { title: "Handed Off", dataIndex: "date", key: "date", render: (v) => <span style={{ color: "#8c8c8c" }}>{v}</span> },
        { title: "Note", dataIndex: "note", key: "note", render: (v) => <span style={{ color: "#595959" }}>{v}</span> },
        {
            title: "Your Status",
            key: "managerProof",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag
                        icon={managerProofIcons[record.managerProofStatus]}
                        color={managerProofColors[record.managerProofStatus] || "default"}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                        {record.managerProofStatus}
                    </Tag>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}>{record.managerProofAt}</span>
                </Space>
            ),
        },
        {
            title: "Deposit",
            key: "deposit",
            render: (_, record) => {
                if (record.managerProofNorm !== normalize(MANAGER_PROOF.ACCEPTED)) {
                    return <span style={{ color: "#bfbfbf" }}>—</span>;
                }
                if (record.bankDeposit) {
                    return (
                        <Tag color="cyan" icon={<LockOutlined />}>
                            Deposited (locked)
                        </Tag>
                    );
                }
                return (
                    <Space direction="vertical" size={4}>
                        <Tag color="default">Held as cash</Tag>
                        <Button
                            size="small"
                            icon={<BankOutlined />}
                            loading={depositTogglingId === record.id}
                            onClick={() => handleMarkDeposited(record)}
                        >
                            Mark Deposited
                        </Button>
                    </Space>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 200,
            render: (_, record) => {
                if (record.managerProofNorm === normalize(MANAGER_PROOF.PENDING)) {
                    return (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            loading={confirmSubmittingId === record.id}
                            onClick={() => openConfirmModal(record)}
                            style={{ background: "#1677ff", borderColor: "#1677ff" }}
                        >
                            Confirm Receipt
                        </Button>
                    );
                }
                if (record.managerProofNorm === normalize(MANAGER_PROOF.ACCEPTED)) {
                    return record.bankDeposit ? (
                        <Tag color="green" style={{ fontSize: 11 }}>✓ Deposited</Tag>
                    ) : (
                        <Tag color="blue" style={{ fontSize: 11 }}>✓ Confirmed</Tag>
                    );
                }
                if (record.managerProofNorm === normalize(MANAGER_PROOF.REJECTED)) {
                    return <Tag color="red" style={{ fontSize: 11 }}>✕ Disputed</Tag>;
                }
                return (
                    <Button size="small" disabled>
                        —
                    </Button>
                );
            },
        },
    ];

    if (!staff?.id) {
        return (
            <div className="m-5" style={{ textAlign: "center", padding: "80px 0" }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: "#8c8c8c" }}>Loading your session…</div>
            </div>
        );
    }

    return (
        <div className="m-5">
            {/* ── Diagnostic banner ── */}
            <Alert
                style={{ marginBottom: 16 }}
                showIcon
                type={transfersError ? "error" : rawEdgeCount === 0 ? "warning" : rawEdgeCount > 0 ? "success" : "info"}
                message={
                    transfersError
                        ? "Failed to load cash transfers — GraphQL error below"
                        : rawEdgeCount === null
                            ? "Loading cash transfers…"
                            : rawEdgeCount === 0
                                ? "Query succeeded but returned 0 rows"
                                : `Loaded ${rawEdgeCount} cash transfer row(s) for your branch`
                }
                description={
                    <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                        {transfersError && (
                            <div style={{ color: "#ff4d4f", marginBottom: 4 }}>
                                {transfersError.message}
                                {transfersError.graphQLErrors?.length > 0 && (
                                    <div>
                                        GraphQL detail: {transfersError.graphQLErrors.map((e) => e.message).join(" | ")}
                                    </div>
                                )}
                            </div>
                        )}
                        {!transfersError && rawEdgeCount === 0 && (
                            <div>
                                Either nothing has been handed off to you yet, or Row Level
                                Security is blocking the manager role from reading{" "}
                                <code>cash_transfers_to_admin</code>. Check:
                                <br />
                                <code>
                                    select * from pg_policies where schemaname='vision_expert'
                                    and tablename='cash_transfers_to_admin';
                                </code>
                            </div>
                        )}
                        <div style={{ color: "#8c8c8c", marginTop: 4 }}>
                            Logged in as staff #{staff?.id}
                            {staff?.branch_id ? ` · Branch #${staff.branch_id}` : " · No branch on your staff record — query cannot run"}
                        </div>
                    </div>
                }
            />

            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]} align="stretch">
                {statCards.map((item) => (
                    <Col xs={24} sm={12} md={12} lg={6} xl={6} key={item.title}>
                        <Card
                            bordered={false}
                            style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderLeft: `5px solid ${item.accent}`, height: "100%" }}
                            bodyStyle={{ padding: 20, height: "100%" }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "100%" }}>
                                <div>
                                    <div style={{ color: "#8c8c8c", fontSize: 13, marginBottom: 6 }}>{item.title}</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#1f1f1f" }}>{item.value}</div>
                                    <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>{item.subtitle}</div>
                                </div>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: `${item.accent}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {item.customIcon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Transfer Table ── */}
            <Row className="mt-5">
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <DollarOutlined style={{ color: "#1677ff" }} />
                                <span>Cash Handed Off To You</span>
                                <Tag color="blue">{transfers.length} records</Tag>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        extra={
                            <Space wrap>
                                {["All", MANAGER_PROOF.PENDING, MANAGER_PROOF.ACCEPTED, MANAGER_PROOF.REJECTED].map((status) => (
                                    <Button
                                        key={status}
                                        size="small"
                                        type={filterStatus === status ? "primary" : "default"}
                                        style={filterStatus === status ? { background: "#1677ff", borderColor: "#1677ff" } : {}}
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status}
                                    </Button>
                                ))}
                                <Select
                                    size="small"
                                    style={{ minWidth: 160 }}
                                    value={filterType}
                                    onChange={setFilterType}
                                    options={[{ value: "All", label: "All Types" }, ...typeLookup.map((t) => ({ value: t.type, label: t.type }))]}
                                />
                                <Button size="small" icon={<ReloadOutlined />} onClick={refreshData} loading={transfersLoading}>
                                    Refresh
                                </Button>
                            </Space>
                        }
                    >
                        <Table
                            dataSource={filteredTransfers}
                            columns={columns}
                            loading={transfersLoading}
                            pagination={{ pageSize: 8, size: "small" }}
                            size="middle"
                            scroll={{ x: 1300 }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description={
                                            transfersLoading
                                                ? "Loading..."
                                                : transfersError
                                                    ? "Failed to load data — see banner above"
                                                    : "No transfers handed off to you yet"
                                        }
                                    />
                                ),
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── Confirm Receipt Modal ── */}
            <Modal
                title={
                    <Space>
                        <CheckCircleOutlined style={{ color: "#1677ff" }} />
                        <span>Confirm Cash Receipt</span>
                    </Space>
                }
                open={!!confirmModal}
                onCancel={() => setConfirmModal(null)}
                footer={null}
                width={460}
                centered
                destroyOnClose
            >
                {confirmModal && (
                    <div>
                        <div style={{ background: "#f0f5ff", border: "1px solid #adc6ff", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                            <p style={{ margin: 0 }}>
                                Transfer <strong>#{confirmModal.id}</strong> — <strong>{formatCurrency(confirmModal.amount)}</strong>
                            </p>
                            <p style={{ margin: "4px 0 0", color: "#8c8c8c", fontSize: 12 }}>
                                From {confirmModal.submittedBy} · {confirmModal.cashType}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div>
                                <Text strong>Deposit to bank now?</Text>
                                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                                    Turn this on only if you're depositing immediately — it locks permanently.
                                </div>
                            </div>
                            <Switch checked={modalDeposit} onChange={setModalDeposit} />
                        </div>

                        <div
                            style={{
                                background: modalDeposit ? "#fff1f0" : "#fffbe6",
                                border: `1px solid ${modalDeposit ? "#ffccc7" : "#ffe58f"}`,
                                borderRadius: 8,
                                padding: "8px 14px",
                                marginBottom: 20,
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 8,
                            }}
                        >
                            {modalDeposit ? (
                                <>
                                    <LockOutlined style={{ color: "#ff4d4f", marginTop: 2 }} />
                                    <Text style={{ color: "#a8071a", fontSize: 12 }}>
                                        Once you confirm with deposit ON, this record is locked forever — it can never
                                        be marked as "not deposited" again.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <ExclamationCircleOutlined style={{ color: "#faad14", marginTop: 2 }} />
                                    <Text style={{ color: "#875800", fontSize: 12 }}>
                                        You can still mark this as deposited later from the table if you leave this off.
                                    </Text>
                                </>
                            )}
                        </div>

                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                            <Button
                                danger
                                loading={confirmSubmittingId === confirmModal.id}
                                onClick={() => handleConfirmSubmit("reject")}
                            >
                                Dispute / Reject
                            </Button>
                            <Space>
                                <Button onClick={() => setConfirmModal(null)}>Cancel</Button>
                                <Button
                                    type="primary"
                                    loading={confirmSubmittingId === confirmModal.id}
                                    onClick={() => handleConfirmSubmit("accept")}
                                    style={{ background: "#1677ff", borderColor: "#1677ff" }}
                                >
                                    Confirm Receipt
                                </Button>
                            </Space>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default ManagerCashApproval;