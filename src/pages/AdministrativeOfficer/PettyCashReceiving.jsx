import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const LOAD_BRANCH_ALLOCATIONS = gql`
    query getBranchAllocations($branchId: Int!) {
        petty_cash_allocationCollection(
            filter: { branch_id: { eq: $branchId } }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    created_at
                    allocated_by
                    branch_id
                    amount
                    notes
                    month
                    year
                    branch {
                        id
                        name
                        location
                    }
                    allocated_by_staff {
                        id
                        first_name
                        last_name
                    }
                }
            }
        }
    }
`;

const LOAD_PETTY_CASH = gql`
    query getPettyCash($branchId: Int!) {
        petty_cashCollection(
            filter: { branch_id: { eq: $branchId } }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    created_at
                    type
                    amount
                    description
                    date
                    category
                    received_by
                    branch_id
                    allocation_id
                    allocation {
                        id
                        month
                        year
                        amount
                    }
                }
            }
        }
    }
`;

const RECEIVE_ALLOCATION = gql`
    mutation receiveAllocation(
        $allocationId: BigInt!
        $receivedBy: BigInt!
        $receivedAt: Datetime!
    ) {
        insertIntopetty_cashCollection(
            objects: {
                type: "Replenishment"
                amount: 0
                description: "Received petty cash allocation"
                date: $receivedAt
                category: "Allocation"
                received_by: $receivedBy
                branch_id: 0
                allocation_id: $allocationId
            }
        ) {
            records {
                id
            }
        }
    }
`;

export default function PettyCashReceiving() {
    const { staff } = useAuth();
    const [allocations, setAllocations] = useState([]);
    const [pettyCash, setPettyCash] = useState([]);
    const [loading, setLoading] = useState(false);
    const [receiveModalVisible, setReceiveModalVisible] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState(null);

    const [loadAllocations, { data: allocationsData, refetch: refetchAllocations }] = useLazyQuery(LOAD_BRANCH_ALLOCATIONS);
    const [loadPettyCash, { data: pettyCashData, refetch: refetchPettyCash }] = useLazyQuery(LOAD_PETTY_CASH);
    const [receiveAllocation] = useMutation(RECEIVE_ALLOCATION);

    useEffect(() => {
        if (staff?.branch?.id) {
            loadAllocations({ variables: { branchId: staff.branch.id } });
            loadPettyCash({ variables: { branchId: staff.branch.id } });
        }
    }, [loadAllocations, loadPettyCash, staff]);

    useEffect(() => {
        if (allocationsData) {
            const edges = allocationsData?.petty_cash_allocationCollection?.edges || [];
            setAllocations(edges.map((e) => e.node));
        }
    }, [allocationsData]);

    useEffect(() => {
        if (pettyCashData) {
            const edges = pettyCashData?.petty_cashCollection?.edges || [];
            setPettyCash(edges.map((e) => e.node));
        }
    }, [pettyCashData]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleReceiveClick = (allocation) => {
        setSelectedAllocation(allocation);
        setReceiveModalVisible(true);
    };

    const handleReceive = async () => {
        if (!selectedAllocation) return;

        try {
            await receiveAllocation({
                variables: {
                    allocationId: selectedAllocation.id,
                    receivedBy: staff.id,
                    receivedAt: dayjs().toISOString(),
                },
            });
            message.success("Petty cash received successfully");
            setReceiveModalVisible(false);
            setSelectedAllocation(null);
            refetchAllocations();
            refetchPettyCash();
        } catch (error) {
            console.error("Error receiving allocation:", error);
            message.error("Failed to receive petty cash: " + error.message);
        }
    };

    // Calculate current balance
    const totals = useMemo(() => {
        const totalExpenses = pettyCash
            .filter((item) => item.type === "Expense")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0);

        const totalReplenishment = pettyCash
            .filter((item) => item.type === "Replenishment")
            .reduce((sum, item) => {
                // If it's linked to an allocation, use the allocation amount
                if (item.allocation) {
                    return sum + Number(item.allocation.amount || 0);
                }
                return sum + Number(item.amount || 0);
            }, 0);

        const currentBalance = totalReplenishment - totalExpenses;

        return {
            totalExpenses,
            totalReplenishment,
            currentBalance,
        };
    }, [pettyCash]);

    // Filter allocations that haven't been received yet
    const receivedAllocationIds = pettyCash
        .filter((pc) => pc.allocation_id)
        .map((pc) => pc.allocation_id);

    const pendingAllocations = allocations.filter((a) => !receivedAllocationIds.includes(a.id));

    const allocationColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Allocated By",
            dataIndex: "allocated_by_staff",
            key: "allocated_by_staff",
            render: (v) => `${v?.first_name || ""} ${v?.last_name || ""}`.trim() || "-",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Month",
            key: "month",
            render: (_, record) => `${dayjs().month(record.month - 1).format("MMMM")} ${record.year}`,
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            ellipsis: true,
        },
        {
            title: "Status",
            key: "status",
            render: (_, record) => {
                const isReceived = receivedAllocationIds.includes(record.id);
                return isReceived ? (
                    <Tag icon={<CheckCircleOutlined />} color="success">
                        Received
                    </Tag>
                ) : (
                    <Tag icon={<ClockCircleOutlined />} color="orange">
                        Pending
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => {
                const isReceived = receivedAllocationIds.includes(record.id);
                return !isReceived ? (
                    <Button
                        type="primary"
                        onClick={() => handleReceiveClick(record)}
                    >
                        Receive
                    </Button>
                ) : null;
            },
        },
    ];

    const pettyCashColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (v) => (
                <Tag color={v === "Expense" ? "red" : "green"}>{v}</Tag>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (v) => dayjs(v).format("YYYY-MM-DD"),
        },
    ];

    return (
        <div className="m-5">
            <Card title="Petty Cash Receiving">
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Statistic
                            title="Current Balance"
                            value={totals.currentBalance}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Total Expenses"
                            value={totals.totalExpenses}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#cf1322" }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Total Received"
                            value={totals.totalReplenishment}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Pending Allocations" style={{ marginTop: 16 }}>
                <Table
                    columns={allocationColumns}
                    dataSource={pendingAllocations}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="All Allocations" style={{ marginTop: 16 }}>
                <Table
                    columns={allocationColumns}
                    dataSource={allocations}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="Petty Cash History" style={{ marginTop: 16 }}>
                <Table
                    columns={pettyCashColumns}
                    dataSource={pettyCash}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Receive Petty Cash Allocation"
                open={receiveModalVisible}
                onOk={handleReceive}
                onCancel={() => {
                    setReceiveModalVisible(false);
                    setSelectedAllocation(null);
                }}
                okText="Receive"
                cancelText="Cancel"
                centered
            >
                {selectedAllocation && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Allocated By:</strong> {selectedAllocation.allocated_by_staff?.first_name} {selectedAllocation.allocated_by_staff?.last_name}</p>
                                    <p><strong>Month:</strong> {dayjs().month(selectedAllocation.month - 1).format("MMMM")} {selectedAllocation.year}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Amount:</strong> {formatCurrency(selectedAllocation.amount)}</p>
                                    <p><strong>Date:</strong> {dayjs(selectedAllocation.created_at).format("YYYY-MM-DD HH:mm")}</p>
                                </Col>
                            </Row>
                        </Card>

                        {selectedAllocation.notes && (
                            <div style={{ marginBottom: 16 }}>
                                <p><strong>Notes:</strong> {selectedAllocation.notes}</p>
                            </div>
                        )}

                        <p style={{ color: "#1890ff", fontWeight: 600 }}>
                            This will add {formatCurrency(selectedAllocation.amount)} to your petty cash balance.
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
