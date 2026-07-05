import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Statistic } from "antd";
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const { TextArea } = Input;

const LOAD_MY_REQUESTS = gql`
    query getMyRequests($requestedBy: BigInt!) {
        petty_cash_requestCollection(
            filter: { requested_by: { eq: $requestedBy } }
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
                    reviewed_at
                    reviewed_by
                    rejection_reason
                    branch {
                        id
                        branch_name
                        address
                    }
                    requested_by_staff {
                        id
                        first_name
                        last_name
                    }
                    reviewed_by_staff {
                        id
                        first_name
                        last_name
                    }
                }
            }
        }
    }
`;

const CREATE_REQUEST = gql`
    mutation createRequest(
        $requestedBy: BigInt!
        $branchId: Int!
        $amount: Float!
        $reason: String!
    ) {
        insertIntopetty_cash_requestCollection(
            objects: {
                requested_by: $requestedBy
                branch_id: $branchId
                amount: $amount
                reason: $reason
                request_status: "Pending"
            }
        ) {
            records {
                id
            }
        }
    }
`;

export default function PettyCashRequest() {
    const { staff } = useAuth();
    const branchId = staff?.branch?.id || staff?.branch_id;
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");

    const [loadRequests, { data: requestsData, refetch }] = useLazyQuery(LOAD_MY_REQUESTS);
    const [createRequest] = useMutation(CREATE_REQUEST);

    useEffect(() => {
        if (staff?.id) {
            loadRequests({ variables: { requestedBy: staff.id } });
        }
    }, [loadRequests, staff]);

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

    const handleCreateRequest = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            message.error("Please enter a valid amount");
            return;
        }

        if (!reason) {
            message.error("Please provide a reason for the request");
            return;
        }

        if (!branchId) {
            message.error("No branch assigned to this staff account");
            return;
        }

        try {
            await createRequest({
                variables: {
                    requestedBy: staff.id,
                    branchId,
                    amount: parseFloat(amount),
                    reason: reason,
                },
            });
            message.success("Petty cash request submitted successfully");
            setRequestModalVisible(false);
            setAmount("");
            setReason("");
            refetch();
        } catch (error) {
            console.error("Error creating request:", error);
            message.error("Failed to submit request: " + error.message);
        }
    };

    const stats = useMemo(() => {
        const pending = requests.filter((r) => r.request_status === "Pending").length;
        const approved = requests.filter((r) => r.request_status === "Approved").length;
        const rejected = requests.filter((r) => r.request_status === "Rejected").length;
        const totalRequested = requests
            .filter((r) => r.request_status === "Approved")
            .reduce((sum, r) => sum + (r.amount || 0), 0);

        return { pending, approved, rejected, totalRequested };
    }, [requests]);

    const columns = [
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
            render: (v) => v?.branch_name || "-",
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
            title: "Status",
            dataIndex: "request_status",
            key: "request_status",
            render: (v) => {
                const color = v === "Approved" ? "green" : v === "Rejected" ? "red" : "orange";
                const icon = v === "Approved" ? <CheckCircleOutlined /> : v === "Rejected" ? <CloseCircleOutlined /> : <ClockCircleOutlined />;
                return <Tag icon={icon} color={color}>{v}</Tag>;
            },
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Reviewed By",
            dataIndex: "reviewed_by_staff",
            key: "reviewed_by_staff",
            render: (v) => (v ? `${v.first_name} ${v.last_name}` : "-"),
        },
        {
            title: "Rejection Reason",
            dataIndex: "rejection_reason",
            key: "rejection_reason",
            ellipsis: true,
            render: (v) => v || "-",
        },
    ];

    return (
        <div className="m-5">
            <Card
                title="Petty Cash Requests"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setRequestModalVisible(true)}
                    >
                        Request Petty Cash
                    </Button>
                }
            >
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Approved"
                            value={stats.approved}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Rejected"
                            value={stats.rejected}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Total Approved"
                            value={stats.totalRequested}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="My Requests" style={{ marginTop: 16 }}>
                <Table
                    columns={columns}
                    dataSource={requests}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Request Petty Cash"
                open={requestModalVisible}
                onOk={handleCreateRequest}
                onCancel={() => setRequestModalVisible(false)}
                okText="Submit Request"
                cancelText="Cancel"
                centered
            >
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Branch</label>
                    <Input value={staff?.branch?.branch_name || staff?.branch?.name || ""} disabled />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Amount (LKR)</label>
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Reason</label>
                    <TextArea
                        rows={4}
                        placeholder="Enter reason for requesting petty cash..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={500}
                    />
                </div>
            </Modal>
        </div>
    );
}
