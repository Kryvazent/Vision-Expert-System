import { Card, Select, DatePicker, Table, Spin, Empty, Alert, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const { RangePicker } = DatePicker;

const LOAD_DEPOSITED_TRANSFERS = gql`
    query getDepositedTransfers {
        cash_transfers_to_adminCollection(
            filter: { bank_deposit: { eq: true } }
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
                    rejection_reason
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

export default function OwnerCashHandling() {
    const [transfers, setTransfers] = useState([]);
    const [typeLookup, setTypeLookup] = useState([]);
    const [branchLookup, setBranchLookup] = useState([]);
    const [staffLookup, setStaffLookup] = useState([]);

    const [filterDateRange, setFilterDateRange] = useState(null);
    const [filterBranch, setFilterBranch] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const [loadTransfers, { data: transfersData, loading: transfersLoading, error: transfersError }] =
        useLazyQuery(LOAD_DEPOSITED_TRANSFERS, { fetchPolicy: "network-only" });

    const [loadTypeLookup, { data: typeLookupData }] = useLazyQuery(LOAD_TYPE_LOOKUP, {
        fetchPolicy: "network-only",
    });
    const [loadBranchLookup, { data: branchLookupData }] = useLazyQuery(LOAD_BRANCH_LOOKUP, {
        fetchPolicy: "network-only",
    });
    const [loadStaffLookup, { data: staffLookupData }] = useLazyQuery(LOAD_STAFF_LOOKUP, {
        fetchPolicy: "network-only",
    });

    useEffect(() => {
        loadTransfers();
        loadTypeLookup();
        loadBranchLookup();
        loadStaffLookup();
    }, []);

    useEffect(() => {
        if (typeLookupData) setTypeLookup((typeLookupData?.cash_typeCollection?.edges || []).map((e) => e.node));
    }, [typeLookupData]);

    useEffect(() => {
        if (branchLookupData) setBranchLookup((branchLookupData?.branchCollection?.edges || []).map((e) => e.node));
    }, [branchLookupData]);

    useEffect(() => {
        if (staffLookupData) setStaffLookup((staffLookupData?.staffCollection?.edges || []).map((e) => e.node));
    }, [staffLookupData]);

    useEffect(() => {
        if (transfersData) {
            const edges = transfersData?.cash_transfers_to_adminCollection?.edges || [];
            const typeMap = new Map(typeLookup.map((t) => [String(t.id), t.type]));
            const branchMap = new Map(branchLookup.map((b) => [String(b.id), b.branch_name]));
            const staffMap = new Map(
                staffLookup.map((s) => [String(s.id), `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim()])
            );

            setTransfers(
                edges.map(({ node }) => ({
                    key: node.id,
                    id: node.id,
                    submittedBy: staffMap.get(String(node.by)) || `Staff #${node.by}`,
                    amount: node.amount ?? 0,
                    date: node.created_at ? dayjs(node.created_at).format("YYYY-MM-DD HH:mm") : "—",
                    note: node.note ?? "—",
                    cashType: typeMap.get(String(node.cash_type_id)) || `Type #${node.cash_type_id}`,
                    branchName: branchMap.get(String(node.branch_id)) || `Branch #${node.branch_id}`,
                    managerProofAt: node.manager_proof_at ? dayjs(node.manager_proof_at).format("YYYY-MM-DD HH:mm") : "—",
                    rejectionReason: node.rejection_reason ?? null,
                }))
            );
        }
    }, [transfersData, typeLookup, branchLookup, staffLookup]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const filteredTransfers = useMemo(() => {
        return transfers.filter((t) => {
            if (filterDateRange && filterDateRange.length === 2) {
                const transferDate = dayjs(t.date);
                if (transferDate.isBefore(filterDateRange[0]) || transferDate.isAfter(filterDateRange[1])) {
                    return false;
                }
            }
            if (filterBranch !== "all" && t.branchName !== filterBranch) return false;
            if (filterType !== "all" && t.cashType !== filterType) return false;
            return true;
        });
    }, [transfers, filterDateRange, filterBranch, filterType]);

    const totalAmount = filteredTransfers.reduce((sum, t) => sum + t.amount, 0);

    const columns = [
        { title: "Transfer ID", dataIndex: "id", key: "id", render: (v) => <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span> },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Branch", dataIndex: "branchName", key: "branchName" },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => <span style={{ fontWeight: 600, color: "#1677ff" }}>{formatCurrency(v)}</span>,
            sorter: (a, b) => a.amount - b.amount,
        },
        { title: "Cash Type", dataIndex: "cashType", key: "cashType" },
        { title: "Submitted By", dataIndex: "submittedBy", key: "submittedBy" },
        { title: "Deposited At", dataIndex: "managerProofAt", key: "managerProofAt" },
        { title: "Note", dataIndex: "note", key: "note" },
    ];

    return (
        <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

            {/* ── Summary Cards ── */}
            <div className="flex flex-wrap gap-4">
                <Card className="flex-1 min-w-[200px]">
                    <p className="text-gray-500">Total Deposited Transfers</p>
                    <h2 className="text-xl font-bold text-blue-500">{filteredTransfers.length}</h2>
                </Card>

                <Card className="flex-1 min-w-[200px]">
                    <p className="text-gray-500">Total Amount</p>
                    <h2 className="text-xl font-bold text-blue-500">{formatCurrency(totalAmount)}</h2>
                </Card>
            </div>

            {/* ── Filter Section ── */}
            <Card>
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px] space-y-2">
                        <p className="font-medium">Filter by Date Range</p>
                        <RangePicker className="w-full" onChange={setFilterDateRange} />
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                        <p className="font-medium">Filter by Branch</p>
                        <Select
                            className="w-full"
                            value={filterBranch}
                            onChange={setFilterBranch}
                            options={[
                                { value: "all", label: "All Branches" },
                                ...branchLookup.map((b) => ({ value: b.branch_name, label: b.branch_name })),
                            ]}
                        />
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                        <p className="font-medium">Filter by Cash Type</p>
                        <Select
                            className="w-full"
                            value={filterType}
                            onChange={setFilterType}
                            options={[
                                { value: "all", label: "All Types" },
                                ...typeLookup.map((t) => ({ value: t.type, label: t.type })),
                            ]}
                        />
                    </div>
                </div>
            </Card>

            {/* ── Error Banner ── */}
            {transfersError && (
                <Alert
                    type="error"
                    message="Failed to load cash transfers"
                    description={transfersError.message}
                    showIcon
                />
            )}

            {/* ── Table ── */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredTransfers}
                    loading={transfersLoading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    locale={{
                        emptyText: (
                            <Empty
                                description={
                                    transfersLoading
                                        ? "Loading..."
                                        : transfersError
                                            ? "Failed to load data"
                                            : "No deposited transfers found"
                                }
                            />
                        ),
                    }}
                />
            </Card>
        </div>
    );
}
