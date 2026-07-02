/**
 * AdminCashTransferApproval.jsx
 * ─────────────────────────────────────────────────────────────────────────
 * Admin-facing page for approving / rejecting cash transfers
 * (vision_expert.cash_transfers_to_admin + vision_expert.cash_transfer_status)
 * and, once accepted, handing that cash on to a Manager
 * (manager_proof_status column).
 *
 * FIX #1 (root cause of "no rows displayed"):
 * pg_graphql's `orderBy` argument is typed as a LIST
 * ([cash_transfers_to_adminOrderBy!]), not a bare object. The previous
 * version sent `orderBy: { created_at: DescNullsLast }`, which fails
 * GraphQL input validation on the server, the query errors out, and
 * cash_transfers_to_adminCollection comes back empty — so the table
 * always looked blank regardless of RLS or data. Fixed by wrapping it
 * in an array: `orderBy: [{ created_at: DescNullsLast }]`.
 *
 * FIX #2 (approve / reject / transfer-to-manager silently not working):
 * The mutations filtered on `id: { eq: $id }` typed as `ID!`. The `id`
 * column on cash_transfers_to_admin is `bigint`, and pg_graphql's row
 * filters expect `BigInt` for that column — `ID` is reserved for the
 * opaque Relay-style `nodeId` field, not the raw id filter. Fixed by
 * declaring `$id: BigInt!` in both mutations.
 *
 * Everything else (independent cosmetic lookups for staff/branch/type
 * names, the diagnostic banner, RLS troubleshooting hint) is unchanged.
 */

import {
    Button,
    Card,
    Col,
    Row,
    Space,
    Table,
    Tag,
    Select,
    Switch,
    Typography,
    Modal,
    message,
    Empty,
    Spin,
    Alert,
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    BankOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    UserSwitchOutlined,
    SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../const/functions";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const { Text } = Typography;

// ── Status text constants (edit if your DB uses different wording) ──
const STATUS_TEXT = { PENDING: "Pending", ACCEPTED: "Accepted", REJECTED: "Rejected" };
const ADMIN_PROOF = { AWAITING: "Awaiting", ACCEPTED: "Accepted", REJECTED: "Rejected" };
const MANAGER_PROOF = {
    AWAITING: "Awaiting", // not yet handed to manager
    PENDING: "Pending", // admin handed off, waiting on manager confirmation
    ACCEPTED: "Accepted", // manager confirmed receipt
    REJECTED: "Rejected", // manager disputed / rejected
};

const statusColors = {
    [STATUS_TEXT.PENDING]: "orange",
    [STATUS_TEXT.ACCEPTED]: "green",
    [STATUS_TEXT.REJECTED]: "red",
};
const statusIcons = {
    [STATUS_TEXT.PENDING]: <ClockCircleOutlined />,
    [STATUS_TEXT.ACCEPTED]: <CheckCircleOutlined />,
    [STATUS_TEXT.REJECTED]: <CloseCircleOutlined />,
};
const adminProofColors = {
    [ADMIN_PROOF.AWAITING]: "orange",
    [ADMIN_PROOF.ACCEPTED]: "green",
    [ADMIN_PROOF.REJECTED]: "red",
};
const managerProofColors = {
    [MANAGER_PROOF.AWAITING]: "default",
    [MANAGER_PROOF.PENDING]: "orange",
    [MANAGER_PROOF.ACCEPTED]: "green",
    [MANAGER_PROOF.REJECTED]: "red",
};

// Case/whitespace-insensitive compare — these are free-text DB columns.
const normalize = (v) => (v || "").toString().trim().toLowerCase();

// ── Core query: ONLY cash_transfers_to_admin + cash_transfer_status ──
// FIX: orderBy must be a LIST in pg_graphql, e.g. [{ created_at: DescNullsLast }]
// Sending a bare object here is what silently killed every row.
const LOAD_ALL_TRANSFERS = gql`
    query getAllCashTransfers {
        cash_transfers_to_adminCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    by
                    amount
                    note
                    created_at
                    cash_type_id
                    branch_id
                    admin_proof_status
                    admin_proof_at
                    manager_proof_status
                    manager_proof_at
                    reviewed_at
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

// Needed to resolve cash_transfer_status_id when the admin accepts/rejects.
const LOAD_STATUS_LOOKUP = gql`
    query getCashTransferStatuses {
        cash_transfer_statusCollection {
            edges {
                node {
                    id
                    status
                }
            }
        }
    }
`;

// Cosmetic only — used to turn cash_type_id into a readable label.
// Independent query: if it fails, the table still renders with "Type #3".
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

// Cosmetic only — used to turn branch_id into a readable label.
const LOAD_BRANCH_LOOKUP = gql`
    query getBranches {
        branchCollection {
            edges {
                node {
                    id
                    branch_name
                }
            }
        }
    }
`;

// Cosmetic only — used to turn `by` (staff id) into a readable name.
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

// Admin accept/reject decision.
// FIX: $id is BigInt! (matches cash_transfers_to_admin.id column type),
// not ID! — ID is only valid for the opaque nodeId field, and using it
// against a BigInt filter caused this mutation to fail/target nothing.
const SET_ADMIN_DECISION = gql`
    mutation setAdminDecision(
        $id: BigInt!
        $statusId: BigInt!
        $adminProofStatus: String!
        $adminProofAt: Datetime!
        $reviewedAt: Datetime!
    ) {
        updatecash_transfers_to_adminCollection(
            filter: { id: { eq: $id } }
            set: {
                cash_transfer_status_id: $statusId
                admin_proof_status: $adminProofStatus
                admin_proof_at: $adminProofAt
                reviewed_at: $reviewedAt
            }
        ) {
            records {
                id
                admin_proof_status
                admin_proof_at
                reviewed_at
                cash_transfer_status {
                    id
                    status
                }
            }
        }
    }
`;

// Admin hands the (already-accepted) cash on to the manager.
// FIX: same BigInt correction as above.
const TRANSFER_TO_MANAGER = gql`
    mutation transferToManager($id: BigInt!, $managerProofStatus: String!, $bankDeposit: Boolean!) {
        updatecash_transfers_to_adminCollection(
            filter: { id: { eq: $id } }
            set: { manager_proof_status: $managerProofStatus, bank_deposit: $bankDeposit }
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

function AdminCashTransferApproval() {
    const { staff } = useAuth();

    const [transfers, setTransfers] = useState([]);
    const [rawEdgeCount, setRawEdgeCount] = useState(null); // null = not run yet, -1 = errored

    const [statusLookup, setStatusLookup] = useState([]);
    const [typeLookup, setTypeLookup] = useState([]);
    const [branchLookup, setBranchLookup] = useState([]);
    const [staffLookup, setStaffLookup] = useState([]);

    const [filterStatus, setFilterStatus] = useState("All");
    const [filterType, setFilterType] = useState("All");
    const [filterBranch, setFilterBranch] = useState("All");

    const [decisionSubmittingId, setDecisionSubmittingId] = useState(null);
    const [managerModal, setManagerModal] = useState(null);
    const [bankDeposit, setBankDeposit] = useState(false);
    const [managerSubmitting, setManagerSubmitting] = useState(false);

    // ── The one query that actually has to work ──
    // NOTE: Apollo Client 4 (the "@apollo/client/react" import path) removed
    // the onCompleted/onError callback options from useLazyQuery entirely.
    // Passing them here is a silent no-op — the request still fires and
    // completes, but nothing ever reads the result, which is why the page
    // got stuck showing "Loading cash transfers…" forever with 0 records.
    // Fix: read `data`/`error`/`loading` straight off the hook tuple and
    // sync them into local state with useEffect.
    const [loadTransfers, { data: transfersData, loading: transfersLoading, error: transfersError }] =
        useLazyQuery(LOAD_ALL_TRANSFERS, { fetchPolicy: "network-only" });

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
            console.error("❌ getAllCashTransfers error:", transfersError);
        }
    }, [transfersError]);

    // ── Independent lookups — each can fail without affecting the others ──
    const [loadStatusLookup, { data: statusLookupData, error: statusLookupError }] =
        useLazyQuery(LOAD_STATUS_LOOKUP, { fetchPolicy: "network-only" });

    useEffect(() => {
        if (statusLookupData) {
            setStatusLookup((statusLookupData?.cash_transfer_statusCollection?.edges || []).map((e) => e.node));
        }
    }, [statusLookupData]);

    useEffect(() => {
        if (statusLookupError) console.error("❌ getCashTransferStatuses error:", statusLookupError);
    }, [statusLookupError]);

    const [loadTypeLookup, { data: typeLookupData }] = useLazyQuery(LOAD_TYPE_LOOKUP, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (typeLookupData) {
            setTypeLookup((typeLookupData?.cash_typeCollection?.edges || []).map((e) => e.node));
        }
    }, [typeLookupData]);

    const [loadBranchLookup, { data: branchLookupData }] = useLazyQuery(LOAD_BRANCH_LOOKUP, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (branchLookupData) {
            setBranchLookup((branchLookupData?.branchCollection?.edges || []).map((e) => e.node));
        }
    }, [branchLookupData]);

    const [loadStaffLookup, { data: staffLookupData }] = useLazyQuery(LOAD_STAFF_LOOKUP, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        if (staffLookupData) {
            setStaffLookup((staffLookupData?.staffCollection?.edges || []).map((e) => e.node));
        }
    }, [staffLookupData]);

    const [setAdminDecision] = useMutation(SET_ADMIN_DECISION);
    const [transferToManager] = useMutation(TRANSFER_TO_MANAGER);

    // ── Build table rows from the last transfers response + whatever
    // lookups have loaded so far (re-run whenever a lookup arrives late) ──
    const [lastEdges, setLastEdges] = useState(null);
    const buildRows = (edges) => {
        setLastEdges(edges);
        const typeMap = new Map(typeLookup.map((t) => [String(t.id), t.type]));
        const branchMap = new Map(branchLookup.map((b) => [String(b.id), b.branch_name]));
        const staffMap = new Map(
            staffLookup.map((s) => [String(s.id), `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim()])
        );

        setTransfers(
            edges.map(({ node }) => {
                const status = node.cash_transfer_status?.status ?? STATUS_TEXT.PENDING;
                const adminProofStatus = node.admin_proof_status ?? ADMIN_PROOF.AWAITING;
                const managerProofStatus = node.manager_proof_status ?? MANAGER_PROOF.AWAITING;
                return {
                    key: node.id,
                    id: node.id,
                    submittedBy: staffMap.get(String(node.by)) || `Staff #${node.by}`,
                    amount: node.amount ?? 0,
                    date: node.created_at ? dayjs(node.created_at).format("YYYY-MM-DD HH:mm") : "—",
                    note: node.note ?? "—",
                    cashTypeId: node.cash_type_id,
                    cashType:
                        typeMap.get(String(node.cash_type_id)) ||
                        (node.cash_type_id ? `Type #${node.cash_type_id}` : "Unknown"),
                    branchId: node.branch_id,
                    branchName:
                        branchMap.get(String(node.branch_id)) ||
                        (node.branch_id ? `Branch #${node.branch_id}` : "—"),
                    status,
                    statusNorm: normalize(status),
                    adminProofStatus,
                    adminProofAt: node.admin_proof_at
                        ? dayjs(node.admin_proof_at).format("YYYY-MM-DD HH:mm")
                        : "—",
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

    // Re-map once a lookup arrives after the transfers already loaded.
    useEffect(() => {
        if (lastEdges) buildRows(lastEdges);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeLookup, branchLookup, staffLookup]);

    // ── Fire everything once we have an authenticated staff record ──
    useEffect(() => {
        if (staff?.id) {
            loadTransfers();
            loadStatusLookup();
            loadTypeLookup();
            loadBranchLookup();
            loadStaffLookup();
        }
    }, [staff?.id]);

    const refreshData = () => {
        if (!staff?.id) {
            message.warning("Still waiting for your session to load — try again shortly.");
            return;
        }
        loadTransfers();
        loadStatusLookup();
        loadTypeLookup();
        loadBranchLookup();
        loadStaffLookup();
    };

    const statusIdFor = (text) => {
        const match = statusLookup.find((s) => normalize(s.status) === normalize(text));
        if (!match) {
            console.warn(`⚠️ No cash_transfer_status row matches "${text}".`);
        }
        return match?.id;
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const branchOptions = useMemo(() => {
        const seen = new Map();
        transfers.forEach((t) => {
            if (t.branchId != null && !seen.has(t.branchId)) seen.set(t.branchId, t.branchName);
        });
        return Array.from(seen, ([id, name]) => ({ id, name }));
    }, [transfers]);

    const filteredTransfers = useMemo(() => {
        return transfers.filter((t) => {
            if (filterStatus !== "All" && normalize(t.status) !== normalize(filterStatus)) return false;
            if (filterType !== "All" && t.cashType !== filterType) return false;
            if (filterBranch !== "All" && t.branchId !== filterBranch) return false;
            return true;
        });
    }, [transfers, filterStatus, filterType, filterBranch]);

    const pendingAdminReview = transfers.filter((t) => t.statusNorm === normalize(STATUS_TEXT.PENDING));
    const awaitingManagerHandoff = transfers.filter(
        (t) => t.statusNorm === normalize(STATUS_TEXT.ACCEPTED) && t.managerProofNorm === normalize(MANAGER_PROOF.AWAITING)
    );
    const withManager = transfers.filter(
        (t) => t.managerProofNorm === normalize(MANAGER_PROOF.PENDING) || t.managerProofNorm === normalize(MANAGER_PROOF.ACCEPTED)
    );
    const rejected = transfers.filter((t) => t.statusNorm === normalize(STATUS_TEXT.REJECTED));
    const sum = (list) => list.reduce((s, t) => s + t.amount, 0);

    const statCards = [
        {
            title: "Awaiting Admin Review",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(pendingAdminReview))} (${pendingAdminReview.length})`,
            accent: "#faad14",
            subtitle: "Needs accept / reject decision",
            customIcon: <ClockCircleOutlined style={{ color: "#faad14", fontSize: 22 }} />,
        },
        {
            title: "Accepted — Awaiting Manager",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(awaitingManagerHandoff))} (${awaitingManagerHandoff.length})`,
            accent: "#1677ff",
            subtitle: "Ready to transfer to manager",
            customIcon: <UserSwitchOutlined style={{ color: "#1677ff", fontSize: 22 }} />,
        },
        {
            title: "With Manager",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(withManager))} (${withManager.length})`,
            accent: "#52c41a",
            subtitle: "Handed off / confirmed by manager",
            customIcon: <SafetyCertificateOutlined style={{ color: "#52c41a", fontSize: 22 }} />,
        },
        {
            title: "Rejected",
            value: transfersLoading ? "Loading..." : `${formatCurrency(sum(rejected))} (${rejected.length})`,
            accent: "#ff4d4f",
            subtitle: "Returned to submitting staff",
            customIcon: <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />,
        },
    ];

    const handleDecision = (record, decision) => {
        const isAccept = decision === "accept";
        const targetStatusText = isAccept ? STATUS_TEXT.ACCEPTED : STATUS_TEXT.REJECTED;
        const targetAdminProof = isAccept ? ADMIN_PROOF.ACCEPTED : ADMIN_PROOF.REJECTED;

        Modal.confirm({
            title: isAccept ? "Accept this transfer?" : "Reject this transfer?",
            icon: <ExclamationCircleOutlined style={{ color: isAccept ? "#52c41a" : "#ff4d4f" }} />,
            content: (
                <div>
                    <p>
                        Transfer <strong>#{record.id}</strong> from <strong>{record.submittedBy}</strong> ({record.cashType})
                    </p>
                    <p style={{ color: "#8c8c8c", fontSize: 12 }}>Amount: {formatCurrency(record.amount)}</p>
                    {!isAccept && (
                        <p style={{ color: "#ff4d4f", fontSize: 12 }}>
                            ⚠ Rejecting returns this amount to {record.submittedBy}'s responsibility.
                        </p>
                    )}
                </div>
            ),
            okText: isAccept ? "Yes, Accept" : "Yes, Reject",
            cancelText: "Cancel",
            okButtonProps: isAccept
                ? { style: { background: "#52c41a", borderColor: "#52c41a" } }
                : { danger: true },
            onOk: async () => {
                const statusId = statusIdFor(targetStatusText);
                if (!statusId) {
                    message.error(
                        `Could not resolve cash_transfer_status id for "${targetStatusText}". Check the cash_transfer_status table has this value.`
                    );
                    return;
                }
                setDecisionSubmittingId(record.id);
                try {
                    const now = dayjs().toISOString();
                    await setAdminDecision({
                        variables: {
                            id: record.id,
                            statusId,
                            adminProofStatus: targetAdminProof,
                            adminProofAt: now,
                            reviewedAt: now,
                        },
                    });
                    message.success(isAccept ? "Transfer accepted." : "Transfer rejected and returned to staff.");
                    loadTransfers();
                } catch (err) {
                    console.error("❌ Decision mutation error:", err);
                    message.error("Failed to update transfer: " + err.message);
                } finally {
                    setDecisionSubmittingId(null);
                }
            },
        });
    };

    const openManagerModal = (record) => {
        setBankDeposit(record.bankDeposit || false);
        setManagerModal(record);
    };

    const handleTransferToManagerSubmit = async () => {
        if (!managerModal) return;
        setManagerSubmitting(true);
        try {
            await transferToManager({
                variables: { id: managerModal.id, managerProofStatus: MANAGER_PROOF.PENDING, bankDeposit },
            });
            message.success(
                bankDeposit
                    ? "Marked as bank-deposited and sent for manager confirmation."
                    : "Cash handed off — awaiting manager confirmation."
            );
            setManagerModal(null);
            loadTransfers();
        } catch (err) {
            console.error("❌ Transfer-to-manager mutation error:", err);
            message.error("Failed to transfer to manager: " + err.message);
        } finally {
            setManagerSubmitting(false);
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span>,
        },
        { title: "Submitted By", dataIndex: "submittedBy", key: "submittedBy" },
        {
            title: "Type",
            dataIndex: "cashType",
            key: "cashType",
            render: (v) => <Tag color={/recovery/i.test(v) ? "geekblue" : "purple"}>{v}</Tag>,
        },
        { title: "Branch", dataIndex: "branchName", key: "branchName" },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>,
            sorter: (a, b) => a.amount - b.amount,
        },
        { title: "Date", dataIndex: "date", key: "date", render: (v) => <span style={{ color: "#8c8c8c" }}>{v}</span> },
        { title: "Note", dataIndex: "note", key: "note", render: (v) => <span style={{ color: "#595959" }}>{v}</span> },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (v) => (
                <Tag icon={statusIcons[v]} color={statusColors[v] || "blue"} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {v}
                </Tag>
            ),
        },
        {
            title: "Admin Proof",
            key: "adminProof",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color={adminProofColors[record.adminProofStatus] || "blue"}>{record.adminProofStatus}</Tag>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}>{record.adminProofAt}</span>
                </Space>
            ),
        },
        {
            title: "Manager Proof",
            key: "managerProof",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color={managerProofColors[record.managerProofStatus] || "default"}>{record.managerProofStatus}</Tag>
                    <span style={{ fontSize: 11, color: "#8c8c8c" }}>{record.managerProofAt}</span>
                    {record.bankDeposit && (
                        <Tag color="cyan" style={{ fontSize: 10 }} icon={<BankOutlined />}>
                            Bank Deposit
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 220,
            render: (_, record) => {
                if (record.statusNorm === normalize(STATUS_TEXT.PENDING)) {
                    return (
                        <Space>
                            <Button
                                size="small"
                                loading={decisionSubmittingId === record.id}
                                onClick={() => handleDecision(record, "accept")}
                                style={{ background: "#f6ffed", borderColor: "#b7eb8f", color: "#52c41a" }}
                            >
                                Accept
                            </Button>
                            <Button
                                size="small"
                                danger
                                loading={decisionSubmittingId === record.id}
                                onClick={() => handleDecision(record, "reject")}
                                style={{ background: "#fff1f0", borderColor: "#ffccc7" }}
                            >
                                Reject
                            </Button>
                        </Space>
                    );
                }
                if (
                    record.statusNorm === normalize(STATUS_TEXT.ACCEPTED) &&
                    record.managerProofNorm === normalize(MANAGER_PROOF.AWAITING)
                ) {
                    return (
                        <Button
                            size="small"
                            type="primary"
                            icon={<UserSwitchOutlined />}
                            onClick={() => openManagerModal(record)}
                            style={{ background: "#1677ff", borderColor: "#1677ff" }}
                        >
                            Transfer to Manager
                        </Button>
                    );
                }
                if (record.managerProofNorm === normalize(MANAGER_PROOF.PENDING)) {
                    return <Tag color="orange" style={{ fontSize: 11 }}>Awaiting Manager Confirmation</Tag>;
                }
                if (record.managerProofNorm === normalize(MANAGER_PROOF.ACCEPTED)) {
                    return <Tag color="green" style={{ fontSize: 11 }}>✓ Confirmed by Manager</Tag>;
                }
                if (record.managerProofNorm === normalize(MANAGER_PROOF.REJECTED)) {
                    return <Tag color="red" style={{ fontSize: 11 }}>✕ Disputed by Manager</Tag>;
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
            {/* ── Always-visible status banner — tells you exactly what happened ── */}
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
                                : `Loaded ${rawEdgeCount} cash transfer row(s) from the server`
                }
                description={
                    <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                        {transfersError && (
                            <div style={{ color: "#ff4d4f", marginBottom: 4 }}>
                                {transfersError.message}
                                {transfersError.graphQLErrors?.length > 0 && (
                                    <div>
                                        GraphQL detail:{" "}
                                        {transfersError.graphQLErrors.map((e) => e.message).join(" | ")}
                                    </div>
                                )}
                            </div>
                        )}
                        {!transfersError && rawEdgeCount === 0 && (
                            <div>
                                The query ran successfully and the server sent back an empty
                                list. This almost always means Row Level Security is scoping
                                <code> cash_transfers_to_admin</code> to the submitting officer
                                only, and hasn't been granted for the admin role. Run in your DB:
                                <br />
                                <code>
                                    select * from pg_policies where schemaname='vision_expert'
                                    and tablename='cash_transfers_to_admin';
                                </code>{" "}
                                and add a SELECT (and UPDATE) policy for the admin role if one
                                isn't listed.
                            </div>
                        )}
                        <div style={{ color: "#8c8c8c", marginTop: 4 }}>
                            Logged in as staff #{staff?.id}
                            {statusLookupError && (
                                <span style={{ color: "#ff4d4f" }}>
                                    {" "}
                                    · cash_transfer_status lookup failed: {statusLookupError.message}
                                </span>
                            )}
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
                                <span>Cash Transfer Approvals</span>
                                <Tag color="blue">{transfers.length} records</Tag>
                            </Space>
                        }
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                        extra={
                            <Space wrap>
                                {["All", STATUS_TEXT.PENDING, STATUS_TEXT.ACCEPTED, STATUS_TEXT.REJECTED].map((status) => (
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
                                <Select
                                    size="small"
                                    style={{ minWidth: 160 }}
                                    value={filterBranch}
                                    onChange={setFilterBranch}
                                    options={[{ value: "All", label: "All Branches" }, ...branchOptions.map((b) => ({ value: b.id, label: b.name }))]}
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
                            scroll={{ x: 1400 }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        description={
                                            transfersLoading
                                                ? "Loading..."
                                                : transfersError
                                                    ? "Failed to load data — see banner above"
                                                    : "No transfers found"
                                        }
                                    />
                                ),
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── Transfer to Manager Modal ── */}
            <Modal
                title={
                    <Space>
                        <UserSwitchOutlined style={{ color: "#1677ff" }} />
                        <span>Transfer Cash to Manager</span>
                    </Space>
                }
                open={!!managerModal}
                onCancel={() => setManagerModal(null)}
                footer={null}
                width={440}
                centered
                destroyOnClose
            >
                {managerModal && (
                    <div>
                        <div style={{ background: "#f0f5ff", border: "1px solid #adc6ff", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
                            <p style={{ margin: 0 }}>
                                Transfer <strong>#{managerModal.id}</strong> — <strong>{formatCurrency(managerModal.amount)}</strong>
                            </p>
                            <p style={{ margin: "4px 0 0", color: "#8c8c8c", fontSize: 12 }}>
                                From {managerModal.submittedBy} · {managerModal.cashType} · {managerModal.branchName}
                            </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div>
                                <Text strong>Deposited to bank instead?</Text>
                                <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                                    Toggle on if this cash was deposited directly to the bank rather than handed over in person.
                                </div>
                            </div>
                            <Switch checked={bankDeposit} onChange={setBankDeposit} />
                        </div>

                        <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
                            <ExclamationCircleOutlined style={{ color: "#faad14", marginTop: 2 }} />
                            <Text style={{ color: "#875800", fontSize: 12 }}>
                                This marks the transfer as <strong>awaiting manager confirmation</strong>. The manager's own screen will update this to Accepted / Rejected once they confirm.
                            </Text>
                        </div>

                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button onClick={() => setManagerModal(null)}>Cancel</Button>
                            <Button type="primary" loading={managerSubmitting} onClick={handleTransferToManagerSubmit} style={{ background: "#1677ff", borderColor: "#1677ff" }}>
                                Confirm Transfer
                            </Button>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default AdminCashTransferApproval;