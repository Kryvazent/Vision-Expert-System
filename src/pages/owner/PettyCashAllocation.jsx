import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Select, Statistic, Typography } from "antd";
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import { headerStyles, buttonStyles, cardStyles, modalStyles, formStyles, statusColors } from "../../const/designSystem";

const { Title, Text } = Typography;

const { TextArea } = Input;
const { Option } = Select;

const LOAD_BRANCHES = gql`
    query getBranches {
        branchCollection {
            edges {
                node {
                    id
                    name
                    location
                }
            }
        }
    }
`;

const LOAD_ALLOCATIONS = gql`
    query getAllocations {
        petty_cash_allocationCollection(orderBy: [{ created_at: DescNullsLast }]) {
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

const LOAD_REQUESTS = gql`
    query getRequests {
        petty_cash_requestCollection(
            filter: { request_status: { eq: "Pending" } }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    created_at
                    requested_by
                    branch_id
                    amount
                    reason
                    request_status
                    branch {
                        id
                        name
                        location
                    }
                    requested_by_staff {
                        id
                        first_name
                        last_name
                    }
                }
            }
        }
    }
`;

const CREATE_ALLOCATION = gql`
    mutation createAllocation(
        $allocatedBy: BigInt!
        $branchId: Int!
        $amount: Float!
        $notes: String!
        $month: Int!
        $year: Int!
    ) {
        insertIntopetty_cash_allocationCollection(
            objects: {
                allocated_by: $allocatedBy
                branch_id: $branchId
                amount: $amount
                notes: $notes
                month: $month
                year: $year
            }
        ) {
            records {
                id
            }
        }
    }
`;

const APPROVE_REQUEST = gql`
    mutation approveRequest(
        $requestId: BigInt!
        $allocatedBy: BigInt!
        $branchId: Int!
        $amount: Float!
        $notes: String!
        $month: Int!
        $year: Int!
        $reviewedBy: BigInt!
        $reviewedAt: Datetime!
    ) {
        # First, approve the request
        updatepetty_cash_requestCollection(
            filter: { id: { eq: $requestId } }
            set: {
                request_status: "Approved"
                reviewed_by: $reviewedBy
                reviewed_at: $reviewedAt
            }
        ) {
            records {
                id
            }
        }
        
        # Then create the allocation
        insertIntopetty_cash_allocationCollection(
            objects: {
                allocated_by: $allocatedBy
                branch_id: $branchId
                amount: $amount
                notes: $notes
                month: $month
                year: $year
            }
        ) {
            records {
                id
            }
        }
    }
`;

const REJECT_REQUEST = gql`
    mutation rejectRequest(
        $requestId: BigInt!
        $reviewedBy: BigInt!
        $reviewedAt: Datetime!
        $rejectionReason: String!
    ) {
        updatepetty_cash_requestCollection(
            filter: { id: { eq: $requestId } }
            set: {
                request_status: "Rejected"
                reviewed_by: $reviewedBy
                reviewed_at: $reviewedAt
                rejection_reason: $rejectionReason
            }
        ) {
            records {
                id
            }
        }
    }
`;

export default function PettyCashAllocation() {
    const { staff } = useAuth();
    const [branches, setBranches] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allocationModalVisible, setAllocationModalVisible] = useState(false);
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const [loadBranches, { data: branchesData }] = useLazyQuery(LOAD_BRANCHES);
    const [loadAllocations, { data: allocationsData, refetch: refetchAllocations }] = useLazyQuery(LOAD_ALLOCATIONS);
    const [loadRequests, { data: requestsData, refetch: refetchRequests }] = useLazyQuery(LOAD_REQUESTS);

    const [createAllocation] = useMutation(CREATE_ALLOCATION);
    const [approveRequest] = useMutation(APPROVE_REQUEST);
    const [rejectRequest] = useMutation(REJECT_REQUEST);

    useEffect(() => {
        loadBranches();
        loadAllocations();
        loadRequests();
    }, [loadBranches, loadAllocations, loadRequests]);

    useEffect(() => {
        if (branchesData) {
            const edges = branchesData?.branchCollection?.edges || [];
            setBranches(edges.map((e) => e.node));
        }
    }, [branchesData]);

    useEffect(() => {
        if (allocationsData) {
            const edges = allocationsData?.petty_cash_allocationCollection?.edges || [];
            setAllocations(edges.map((e) => e.node));
        }
    }, [allocationsData]);

    useEffect(() => {
        if (requestsData) {
            const edges = requestsData?.petty_cash_requestCollection?.edges || [];
            setRequests(edges.map((e) => e.node));
        }
    }, [requestsData]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleCreateAllocation = async () => {
        if (!selectedBranch || !amount || parseFloat(amount) <= 0) {
            message.error("Please select a branch and enter a valid amount");
            return;
        }

        try {
            await createAllocation({
                variables: {
                    allocatedBy: staff.id,
                    branchId: selectedBranch,
                    amount: parseFloat(amount),
                    notes: notes,
                    month: selectedMonth.month() + 1,
                    year: selectedMonth.year(),
                },
            });
            message.success("Petty cash allocated successfully");
            setAllocationModalVisible(false);
            setSelectedBranch(null);
            setAmount("");
            setNotes("");
            setSelectedMonth(dayjs());
            refetchAllocations();
        } catch (error) {
            console.error("Error creating allocation:", error);
            message.error("Failed to allocate petty cash: " + error.message);
        }
    };

    const handleApproveRequest = async (request) => {
        try {
            await approveRequest({
                variables: {
                    requestId: request.id,
                    allocatedBy: staff.id,
                    branchId: request.branch_id,
                    amount: request.amount,
                    notes: `Approved request from ${request.requested_by_staff?.first_name} ${request.requested_by_staff?.last_name}`,
                    month: dayjs().month() + 1,
                    year: dayjs().year(),
                    reviewedBy: staff.id,
                    reviewedAt: dayjs().toISOString(),
                },
            });
            message.success("Request approved and petty cash allocated");
            refetchRequests();
            refetchAllocations();
        } catch (error) {
            console.error("Error approving request:", error);
            message.error("Failed to approve request: " + error.message);
        }
    };

    const handleRejectRequestClick = (request) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setRejectionModalVisible(true);
    };

    const handleRejectRequest = async () => {
        if (!rejectionReason) {
            message.error("Please provide a rejection reason");
            return;
        }

        try {
            await rejectRequest({
                variables: {
                    requestId: selectedRequest.id,
                    reviewedBy: staff.id,
                    reviewedAt: dayjs().toISOString(),
                    rejectionReason: rejectionReason,
                },
            });
            message.success("Request rejected");
            setRejectionModalVisible(false);
            setSelectedRequest(null);
            setRejectionReason("");
            refetchRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
            message.error("Failed to reject request: " + error.message);
        }
    };

    const totalAllocated = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
    const totalPending = requests.reduce((sum, r) => sum + (r.amount || 0), 0);

    const allocationColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
            render: (v) => v?.name || "-",
        },
        {
            title: "Location",
            dataIndex: "branch",
            key: "location",
            render: (v) => v?.location || "-",
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
            title: "Allocated By",
            dataIndex: "allocated_by_staff",
            key: "allocated_by_staff",
            render: (v) => `${v?.first_name || ""} ${v?.last_name || ""}`.trim() || "-",
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
    ];

    const requestColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Branch",
            dataIndex: "branch",
            key: "branch",
            render: (v) => v?.name || "-",
        },
        {
            title: "Requested By",
            dataIndex: "requested_by_staff",
            key: "requested_by_staff",
            render: (v) => `${v?.first_name || ""} ${v?.last_name || ""}`.trim() || "-",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Reason",
            dataIndex: "reason",
            key: "reason",
            ellipsis: true,
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApproveRequest(record)}
                    >
                        Approve
                    </Button>
                    <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleRejectRequestClick(record)}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={headerStyles.container}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={2} style={headerStyles.title}>
                            Petty Cash Management
                        </Title>
                        <Text type="secondary" style={headerStyles.subtitle}>
                            Allocate and manage petty cash across branches
                        </Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setAllocationModalVisible(true)}
                            style={buttonStyles.primary}
                        >
                            Allocate Petty Cash
                        </Button>
                    </Col>
                </Row>
            </div>

            <Card style={cardStyles.default}>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                        <Statistic
                            title="Total Allocated"
                            value={totalAllocated}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Pending Requests"
                            value={totalPending}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#cf1322" }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Total Requests"
                            value={requests.length}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Pending Requests" style={{ ...cardStyles.default, marginTop: 16 }}>
                <Table
                    columns={requestColumns}
                    dataSource={requests}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="Allocation History" style={{ ...cardStyles.default, marginTop: 16 }}>
                <Table
                    columns={allocationColumns}
                    dataSource={allocations}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Allocate Petty Cash"
                open={allocationModalVisible}
                onOk={handleCreateAllocation}
                onCancel={() => setAllocationModalVisible(false)}
                okText="Allocate"
                cancelText="Cancel"
                {...modalStyles.default}
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Branch</label>
                    <Select
                        style={formStyles.select}
                        placeholder="Select branch"
                        value={selectedBranch}
                        onChange={setSelectedBranch}
                    >
                        {branches.map((branch) => (
                            <Option key={branch.id} value={branch.id}>
                                {branch.branch_name}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Month</label>
                    <DatePicker
                        style={formStyles.datePicker}
                        picker="month"
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        format="MMMM YYYY"
                        disabledDate={(d) => d && d < dayjs().startOf("month")}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Amount (LKR)</label>
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={formStyles.input}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={formStyles.label}>Notes</label>
                    <TextArea
                        rows={3}
                        placeholder="Optional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        maxLength={200}
                    />
                </div>
            </Modal>

            <Modal
                title="Reject Request"
                open={rejectionModalVisible}
                onOk={handleRejectRequest}
                onCancel={() => {
                    setRejectionModalVisible(false);
                    setSelectedRequest(null);
                    setRejectionReason("");
                }}
                okText="Reject"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                {...modalStyles.default}
            >
                {selectedRequest && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Branch:</strong> {selectedRequest.branch?.branch_name}</p>
                                    <p><strong>Requested By:</strong> {selectedRequest.requested_by_staff?.first_name} {selectedRequest.requested_by_staff?.last_name}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Amount:</strong> {formatCurrency(selectedRequest.amount)}</p>
                                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={formStyles.label}>Rejection Reason</label>
                            <TextArea
                                rows={4}
                                placeholder="Enter rejection reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                maxLength={500}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
