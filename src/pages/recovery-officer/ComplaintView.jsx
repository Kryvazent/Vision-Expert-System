import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const { TextArea } = Input;

const LOAD_MY_COMPLAINTS = gql`
    query getMyComplaints($assignedTo: Int!) {
        complaintCollection(
            filter: { assigned_to: { eq: $assignedTo } }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    complaint
                    created_at
                    assigned_to
                    assigned_at
                    resolution_description
                    resolved_at
                    complaint_status {
                        id
                        status
                    }
                    order {
                        id
                        clinic_attend_customer {
                            customer_has_branch {
                                customer {
                                    first_name
                                    last_name
                                    contact_no
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const UPDATE_COMPLAINT_STATUS = gql`
    mutation UpdateComplaintStatus($id: BigInt!, $statusId: BigInt!) {
        updatecomplaintCollection(
            filter: {id: {eq: $id}},
            set: {complaint_status_id: $statusId}
        ) {
            records {
                id
                complaint_status{
                    id
                    status
                }
            }
        }
    }
`;

const RESOLVE_COMPLAINT = gql`
    mutation ResolveComplaint($id: BigInt!, $resolutionDescription: String!, $resolvedAt: Datetime!, $statusId: BigInt!) {
        updatecomplaintCollection(
            filter: {id: {eq: $id}},
            set: {
                resolution_description: $resolutionDescription,
                resolved_at: $resolvedAt,
                complaint_status_id: $statusId
            }
        ) {
            records {
                id
                resolution_description
                resolved_at
                complaint_status{
                    id
                    status
                }
            }
        }
    }
`;

const LOAD_COMPLAINT_STATUSES = gql`
    query LoadComplaintStatuses {
        complaint_statusCollection {
            edges {
                node {
                    id
                    status
                }
            }
        }
    }
`;

export default function ComplaintView() {
    const { staff } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [resolveModalVisible, setResolveModalVisible] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionDescription, setResolutionDescription] = useState("");
    const [statusUpdating, setStatusUpdating] = useState(false);

    const [loadComplaints, { data: complaintsData, loading, refetch }] = useLazyQuery(
        LOAD_MY_COMPLAINTS,
        {
            fetchPolicy: "network-only",
            onError: (error) => {
                console.error("Error loading recovery complaints:", error);
                message.error("Failed to load complaints: " + error.message);
            },
        }
    );
    const [updateComplaintStatus] = useMutation(UPDATE_COMPLAINT_STATUS);
    const [resolveComplaint] = useMutation(RESOLVE_COMPLAINT);
    const { data: complaintStatusesData } = useQuery(LOAD_COMPLAINT_STATUSES, {
        fetchPolicy: "network-only",
        onError: (error) => {
            console.error("Error loading complaint statuses:", error);
            message.error("Failed to load complaint statuses: " + error.message);
        },
    });

    useEffect(() => {
        if (staff?.id) {
            loadComplaints({ variables: { assignedTo: staff.id } });
        }
    }, [loadComplaints, staff]);

    useEffect(() => {
        if (complaintsData) {
            const edges = complaintsData?.complaintCollection?.edges || [];
            setComplaints(edges.map((e) => e.node));
        }
    }, [complaintsData]);

    const statusMap = {};
    complaintStatusesData?.complaint_statusCollection?.edges?.forEach((edge) => {
        statusMap[edge.node.status] = edge.node.id;
    });

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleResolveClick = (complaint) => {
        setSelectedComplaint(complaint);
        setResolutionDescription("");
        setResolveModalVisible(true);
    };

    const handleResolve = async () => {
        if (!selectedComplaint || !resolutionDescription) {
            message.error("Please provide a resolution description");
            return;
        }

        try {
            const resolvedStatusId = statusMap["Resolved"];
            if (!resolvedStatusId) {
                message.error("Resolved status not found.");
                return;
            }

            await resolveComplaint({
                variables: {
                    id: selectedComplaint.id,
                    resolutionDescription: resolutionDescription,
                    resolvedAt: dayjs().toISOString(),
                    statusId: resolvedStatusId,
                }
            });
            await refetch();
            message.success("Complaint resolved successfully");
            setResolveModalVisible(false);
            setSelectedComplaint(null);
            setResolutionDescription("");
        } catch (error) {
            console.error("Error resolving complaint:", error);
            message.error("Failed to resolve complaint.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setStatusUpdating(true);
        try {
            const statusId = statusMap[newStatus];
            if (!statusId) {
                message.error("Invalid status selected.");
                return;
            }
            await updateComplaintStatus({
                variables: {
                    id: id,
                    statusId: statusId,
                }
            });
            await refetch();
            message.success(`Complaint status updated to ${newStatus}!`);
        } catch (error) {
            console.error("Error updating complaint status:", error);
            message.error("Failed to update complaint status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const getStatusTag = (status) => {
        switch(status){
            case "Pending":
                return <Tag color="orange">Pending</Tag>
            case "Assigned":
                return <Tag color="blue">Assigned</Tag>
            case "In Progress":
                return <Tag color="blue">In Progress</Tag>
            case "Resolved":
                return <Tag color="green">Resolved</Tag>
            case "Closed":
                return <Tag color="red">Closed</Tag>
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.complaint_status?.status === "Assigned" || c.complaint_status?.status === "In Progress").length,
        resolved: complaints.filter(c => c.complaint_status?.status === "Resolved").length,
        closed: complaints.filter(c => c.complaint_status?.status === "Closed").length,
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "order",
            key: "order",
            render: (v) => v?.id || "-",
        },
        {
            title: "Customer",
            key: "customer",
            render: (_, record) => `${record.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ""} ${record.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ""}`.trim(),
        },
        {
            title: "Contact",
            key: "contact",
            render: (_, record) => record.order?.clinic_attend_customer?.customer_has_branch?.customer?.contact_no || "-",
        },
        {
            title: "Complaint",
            dataIndex: "complaint",
            key: "complaint",
            ellipsis: true,
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD"),
        },
        {
            title: "Status",
            dataIndex: "complaint_status",
            key: "complaint_status",
            render: (v) => getStatusTag(v?.status),
        },
        {
            title: "Assigned At",
            dataIndex: "assigned_at",
            key: "assigned_at",
            render: (v) => v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    {(record.complaint_status?.status === "Assigned" || record.complaint_status?.status === "In Progress") && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleResolveClick(record)}
                        >
                            Resolve
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="m-5">
            <Card title="My Complaints">
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Statistic
                            title="Total Assigned"
                            value={stats.total}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Resolved"
                            value={stats.resolved}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Closed"
                            value={stats.closed}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title="Complaint List" style={{ marginTop: 16 }}>
                <Table
                    columns={columns}
                    dataSource={complaints}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Resolve Complaint"
                open={resolveModalVisible}
                onOk={handleResolve}
                onCancel={() => {
                    setResolveModalVisible(false);
                    setSelectedComplaint(null);
                    setResolutionDescription("");
                }}
                okText="Resolve"
                cancelText="Cancel"
                centered
            >
                {selectedComplaint && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Customer:</strong> {selectedComplaint.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name} {selectedComplaint.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name}</p>
                                    <p><strong>Contact:</strong> {selectedComplaint.order?.clinic_attend_customer?.customer_has_branch?.customer?.contact_no}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Order ID:</strong> {selectedComplaint.order?.id}</p>
                                    <p><strong>Assigned At:</strong> {selectedComplaint.assigned_at ? dayjs(selectedComplaint.assigned_at).format("YYYY-MM-DD HH:mm") : "-"}</p>
                                </Col>
                            </Row>
                            <p><strong>Complaint:</strong> {selectedComplaint.complaint}</p>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Resolution Description</label>
                            <TextArea
                                rows={4}
                                placeholder="Describe how the complaint was resolved..."
                                value={resolutionDescription}
                                onChange={(e) => setResolutionDescription(e.target.value)}
                                maxLength={500}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
