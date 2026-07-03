import { Button, Card, Col, DatePicker, Row, Space, Table, Tag, message, Statistic, Select, Timeline } from "antd";
import { ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, FilterOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const { Option } = Select;
const { RangePicker } = DatePicker;

const GET_ORDERS = gql`
    query getOrders($branchId: Int, $statusId: BigInt, $dateFrom: Datetime, $dateTo: Datetime) {
        orderCollection(
            filter: {
                clinic_attend_customer: {
                    clinic: { branch_id: { eq: $branchId } }
                }
                order_status_id: { eq: $statusId }
                created_at: { gte: $dateFrom, lte: $dateTo }
            }
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    total_price
                    advance_payment
                    balance_amount
                    placed_at
                    estimated_delivery
                    created_at
                    remarks
                    order_status {
                        id
                        status
                        deesc
                    }
                    clinic_attend_customer {
                        clinic {
                            id
                            venue
                            date
                            from
                            to
                            branch {
                                id
                                branch_name
                            }
                        }
                        customer_has_branch {
                            customer {
                                id
                                first_name
                                last_name
                                contact_no
                            }
                        }
                    }
                    prescription {
                        id
                        right_sph
                        right_cyl
                        right_axis
                        left_sph
                        left_cyl
                        left_axis
                    }
                    lens_type {
                        id
                        type
                    }
                    frame_type {
                        id
                        type
                    }
                    frame {
                        id
                        product {
                            id
                            name
                            sku
                        }
                    }
                    order_status_id
                    customer_confirmed_by
                    customer_confirmed_at
                    intended_customer_confirmed_date
                    sent_to_lab_at
                    intended_send_to_lab_date
                    received_from_lab_at
                    intended_receive_from_lab_date
                    first_reminder_call_at
                    intended_first_reminder_call_date
                    second_reminder_call_at
                    intended_second_reminder_call_date
                    delivered_at
                    intended_delivery_date
                    delivered_by
                    order_paymentCollection {
                        edges {
                            node {
                                id
                                amount
                                payment_date
                                payment_method
                            }
                        }
                    }
                }
            }
        }
    }
`;

const GET_BRANCHES = gql`
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

const GET_ORDER_STATUSES = gql`
    query getOrderStatuses {
        order_statusCollection {
            edges {
                node {
                    id
                    status
                    deesc
                }
            }
        }
    }
`;

export default function OrderFlowView() {
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const [getOrders, { data: ordersData, refetch }] = useLazyQuery(GET_ORDERS);
    const [getBranches, { data: branchesData }] = useLazyQuery(GET_BRANCHES);
    const [getStatuses, { data: statusesData }] = useLazyQuery(GET_ORDER_STATUSES);

    useEffect(() => {
        getBranches();
        getStatuses();
    }, [getBranches, getStatuses]);

    useEffect(() => {
        if (ordersData?.orderCollection?.edges) {
            setOrders(ordersData.orderCollection.edges.map((e) => e.node));
        }
    }, [ordersData]);

    const handleLoadOrders = () => {
        setLoading(true);
        const variables = {};

        if (selectedBranch) variables.branchId = selectedBranch;
        if (selectedStatus) variables.statusId = selectedStatus;
        if (dateRange.length === 2) {
            variables.dateFrom = dayjs(dateRange[0]).startOf('day').toISOString();
            variables.dateTo = dayjs(dateRange[1]).endOf('day').toISOString();
        }

        getOrders({ variables }).then(() => {
            setLoading(false);
        }).catch((error) => {
            console.error("Error loading order flow data:", error);
            message.error("Failed to load order flow data");
            setLoading(false);
        });
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const getStatusTag = (status) => {
        const colorMap = {
            "Pending": "default",
            "Hold": "orange",
            "Cancelled": "red",
            "Confirmed": "blue",
            "In Lab": "purple",
            "Ready for Delivery": "cyan",
            "Delivered": "green",
            "Final Delivered": "success",
        };
        return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
    };

    const getTimelineItems = (order) => {
        const items = [];

        items.push({
            color: order.created_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Order Placed</strong></p>
                    <p>{order.created_at ? dayjs(order.created_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                </div>
            ),
        });

        items.push({
            color: order.customer_confirmed_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Customer Confirmed</strong></p>
                    <p>Actual: {order.customer_confirmed_at ? dayjs(order.customer_confirmed_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_customer_confirmed_date ? dayjs(order.intended_customer_confirmed_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        items.push({
            color: order.sent_to_lab_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Sent to Lab</strong></p>
                    <p>Actual: {order.sent_to_lab_at ? dayjs(order.sent_to_lab_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_send_to_lab_date ? dayjs(order.intended_send_to_lab_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        items.push({
            color: order.received_from_lab_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Received from Lab</strong></p>
                    <p>Actual: {order.received_from_lab_at ? dayjs(order.received_from_lab_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_receive_from_lab_date ? dayjs(order.intended_receive_from_lab_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        items.push({
            color: order.first_reminder_call_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>First Reminder Call</strong></p>
                    <p>Actual: {order.first_reminder_call_at ? dayjs(order.first_reminder_call_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_first_reminder_call_date ? dayjs(order.intended_first_reminder_call_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        items.push({
            color: order.second_reminder_call_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Second Reminder Call</strong></p>
                    <p>Actual: {order.second_reminder_call_at ? dayjs(order.second_reminder_call_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_second_reminder_call_date ? dayjs(order.intended_second_reminder_call_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        items.push({
            color: order.delivered_at ? "green" : "gray",
            children: (
                <div>
                    <p><strong>Delivered</strong></p>
                    <p>Actual: {order.delivered_at ? dayjs(order.delivered_at).format("YYYY-MM-DD HH:mm") : "Not completed"}</p>
                    <p>Intended: {order.intended_delivery_date ? dayjs(order.intended_delivery_date).format("YYYY-MM-DD") : "-"}</p>
                </div>
            ),
        });

        return items;
    };

    const orderColumns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Customer",
            key: "customer",
            render: (_, record) => `${record.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ""} ${record.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ""}`.trim(),
        },
        {
            title: "Contact",
            key: "contact",
            render: (_, record) => record.clinic_attend_customer?.customer_has_branch?.customer?.contact_no || "-",
        },
        {
            title: "Branch",
            key: "branch",
            render: (_, record) => record.clinic_attend_customer?.clinic?.branch?.branch_name || "-",
        },
        {
            title: "Total",
            dataIndex: "total_price",
            key: "total_price",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Status",
            dataIndex: "order_status",
            key: "order_status",
            render: (v) => getStatusTag(v?.status),
        },
        {
            title: "Created Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD"),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => handleViewDetails(record)}
                >
                    View Flow
                </Button>
            ),
        },
    ];

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.order_status?.status === "Pending" || o.order_status?.status === "Hold").length,
        inProgress: orders.filter(o => o.order_status?.status === "Confirmed" || o.order_status?.status === "In Lab").length,
        completed: orders.filter(o => o.order_status?.status === "Delivered" || o.order_status?.status === "Final Delivered").length,
        totalValue: orders.reduce((sum, o) => sum + (o.total_price || 0), 0),
    };

    return (
        <div className="m-5">
            <Card title="Order Flow View">
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={5}>
                        <Statistic
                            title="Total Orders"
                            value={stats.total}
                            valueStyle={{ color: "#1890ff" }}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            valueStyle={{ color: "#faad14" }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="In Progress"
                            value={stats.inProgress}
                            valueStyle={{ color: "#722ed1" }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={5}>
                        <Statistic
                            title="Completed"
                            value={stats.completed}
                            valueStyle={{ color: "#52c41a" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Total Value"
                            value={stats.totalValue}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#13c2c2" }}
                        />
                    </Col>
                </Row>

                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Branch</label>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="All branches"
                                value={selectedBranch}
                                onChange={setSelectedBranch}
                                allowClear
                            >
                                {branchesData?.branchCollection?.edges?.map((edge) => (
                                    <Option key={edge.node.id} value={edge.node.id}>
                                        {edge.node.name} - {edge.node.location}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Status</label>
                            <Select
                                style={{ width: "100%" }}
                                placeholder="All statuses"
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                allowClear
                            >
                                {statusesData?.order_statusCollection?.edges?.map((edge) => (
                                    <Option key={edge.node.id} value={edge.node.id}>
                                        {edge.node.status}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Date Range</label>
                            <RangePicker
                                style={{ width: "100%" }}
                                value={dateRange}
                                onChange={setDateRange}
                            />
                        </Col>
                        <Col span={6}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>&nbsp;</label>
                            <Button
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={handleLoadOrders}
                                loading={loading}
                                block
                            >
                                Load Orders
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Card>

            <Card title="Orders" style={{ marginTop: 16 }}>
                <Table
                    columns={orderColumns}
                    dataSource={orders}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Modal
                title={`Order #${selectedOrder?.id} Flow Details`}
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedOrder(null);
                }}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Customer:</strong> {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.first_name} {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.last_name}</p>
                                    <p><strong>Contact:</strong> {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.contact_no}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Branch:</strong> {selectedOrder.clinic_attend_customer?.clinic?.branch?.name}</p>
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total_price)}</p>
                                </Col>
                            </Row>
                        </Card>

                        <Timeline items={getTimelineItems(selectedOrder)} />
                    </div>
                )}
            </Modal>
        </div>
    );
}
