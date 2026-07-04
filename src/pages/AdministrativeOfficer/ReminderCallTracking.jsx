import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Checkbox } from "antd";
import { PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const { TextArea } = Input;

const LOAD_READY_ORDERS = gql`
    query getReadyOrders($branchId: Int!) {
        orderCollection(
            filter: {
                order_status_id: { eq: 8 }
            }
            orderBy: [{ placed_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    placed_at
                    total_price
                    balance_amount
                    first_reminder_call_at
                    second_reminder_call_at
                    intended_first_reminder_date
                    intended_second_reminder_date
                    intended_delivery_date
                    frame {
                        id
                        serial_no
                        color
                        product {
                            name
                            sku
                        }
                        frame_type {
                            type
                        }
                    }
                    lense_type {
                        id
                        type
                    }
                    clinic_attend_customer {
                        id
                        clinic {
                            id
                            name
                        }
                        customer_has_branch {
                            customer {
                                id
                                first_name
                                last_name
                                contact_no
                                address
                            }
                        }
                    }
                }
            }
        }
    }
`;

const UPDATE_FIRST_CALL = gql`
    mutation updateFirstCall($orderId: BigInt!, $callAt: Datetime!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: { first_reminder_call_at: $callAt }
        ) {
            records {
                id
                first_reminder_call_at
            }
        }
    }
`;

const UPDATE_SECOND_CALL = gql`
    mutation updateSecondCall($orderId: BigInt!, $callAt: Datetime!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: { 
                second_reminder_call_at: $callAt
                order_status_id: 9
            }
        ) {
            records {
                id
                second_reminder_call_at
                order_status {
                    id
                    status
                }
            }
        }
    }
`;

export default function ReminderCallTracking() {
    const { staff } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [callModalVisible, setCallModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [callType, setCallType] = useState(null); // 'first' or 'second'
    const [callNotes, setCallNotes] = useState("");
    const [customerAnswered, setCustomerAnswered] = useState(true);

    const [loadOrders, { data: ordersData, refetch }] = useLazyQuery(LOAD_READY_ORDERS, {
        fetchPolicy: "network-only",
    });

    const [updateFirstCall] = useMutation(UPDATE_FIRST_CALL);
    const [updateSecondCall] = useMutation(UPDATE_SECOND_CALL);

    useEffect(() => {
        if (staff?.branch?.id) {
            loadOrders({ variables: { branchId: staff.branch.id } });
        }
    }, [loadOrders, staff]);

    useEffect(() => {
        if (ordersData) {
            const edges = ordersData?.orderCollection?.edges || [];
            const mappedOrders = edges.map(({ node }) => {
                const customer = node?.clinic_attend_customer?.customer_has_branch?.customer;
                const clinic = node?.clinic_attend_customer?.clinic;

                return {
                    key: node.id,
                    id: node.id,
                    customerName: `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim(),
                    customerMobile: customer?.contact_no || "-",
                    customerAddress: customer?.address || "-",
                    clinicName: clinic?.name || "-",
                    placedAt: node.placed_at ? dayjs(node.placed_at).format("YYYY-MM-DD HH:mm") : "-",
                    totalPrice: node.total_price || 0,
                    balanceAmount: node.balance_amount || 0,
                    frameSerial: node.frame?.serial_no || "-",
                    frameType: node.frame?.frame_type?.type || "-",
                    lenseType: node.lense_type?.type || "-",
                    firstCallAt: node.first_reminder_call_at ? dayjs(node.first_reminder_call_at).format("YYYY-MM-DD HH:mm") : null,
                    secondCallAt: node.second_reminder_call_at ? dayjs(node.second_reminder_call_at).format("YYYY-MM-DD HH:mm") : null,
                    intendedFirstCall: node.intended_first_reminder_date ? dayjs(node.intended_first_reminder_date).format("YYYY-MM-DD") : "-",
                    intendedSecondCall: node.intended_second_reminder_date ? dayjs(node.intended_second_reminder_date).format("YYYY-MM-DD") : "-",
                    intendedDelivery: node.intended_delivery_date ? dayjs(node.intended_delivery_date).format("YYYY-MM-DD") : "-",
                };
            });
            setOrders(mappedOrders);
        }
    }, [ordersData]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleCallClick = (order, type) => {
        setSelectedOrder(order);
        setCallType(type);
        setCallNotes("");
        setCustomerAnswered(true);
        setCallModalVisible(true);
    };

    const handleRecordCall = async () => {
        if (!selectedOrder || !callType) return;

        try {
            const now = dayjs().toISOString();
            if (callType === "first") {
                await updateFirstCall({
                    variables: {
                        orderId: selectedOrder.id,
                        callAt: now,
                    },
                });
                message.success(`First reminder call recorded for order #${selectedOrder.id}`);
            } else {
                await updateSecondCall({
                    variables: {
                        orderId: selectedOrder.id,
                        callAt: now,
                    },
                });
                message.success(`Second reminder call recorded for order #${selectedOrder.id}`);
            }
            setCallModalVisible(false);
            setSelectedOrder(null);
            setCallType(null);
            refetch();
        } catch (error) {
            console.error("Error recording call:", error);
            message.error("Failed to record call: " + error.message);
        }
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span>,
        },
        {
            title: "Customer",
            dataIndex: "customerName",
            key: "customerName",
        },
        {
            title: "Mobile",
            dataIndex: "customerMobile",
            key: "customerMobile",
            render: (v) => (
                <Space>
                    <PhoneOutlined />
                    {v}
                </Space>
            ),
        },
        {
            title: "Address",
            dataIndex: "customerAddress",
            key: "customerAddress",
            ellipsis: true,
        },
        {
            title: "Balance",
            dataIndex: "balanceAmount",
            key: "balanceAmount",
            render: (v) => <span style={{ color: v > 0 ? "#ff4d4f" : "#52c41a", fontWeight: 600 }}>{formatCurrency(v)}</span>,
        },
        {
            title: "1st Call Intended",
            dataIndex: "intendedFirstCall",
            key: "intendedFirstCall",
        },
        {
            title: "1st Call Actual",
            dataIndex: "firstCallAt",
            key: "firstCallAt",
            render: (v) => (v ? <Tag color="green">{v}</Tag> : <Tag color="orange">Pending</Tag>),
        },
        {
            title: "2nd Call Intended",
            dataIndex: "intendedSecondCall",
            key: "intendedSecondCall",
        },
        {
            title: "2nd Call Actual",
            dataIndex: "secondCallAt",
            key: "secondCallAt",
            render: (v) => (v ? <Tag color="green">{v}</Tag> : <Tag color="orange">Pending</Tag>),
        },
        {
            title: "Intended Delivery",
            dataIndex: "intendedDelivery",
            key: "intendedDelivery",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    {!record.firstCallAt && (
                        <Button
                            type="primary"
                            icon={<PhoneOutlined />}
                            onClick={() => handleCallClick(record, "first")}
                        >
                            1st Call
                        </Button>
                    )}
                    {record.firstCallAt && !record.secondCallAt && (
                        <Button
                            type="primary"
                            icon={<PhoneOutlined />}
                            onClick={() => handleCallClick(record, "second")}
                        >
                            2nd Call
                        </Button>
                    )}
                    {record.secondCallAt && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Ready for Delivery
                        </Tag>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="m-5">
            <Card
                title="Customer Reminder Calls"
                extra={
                    <Space>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {orders.length} Orders Ready
                        </Tag>
                        <Tag color="orange">
                            {orders.filter((o) => !o.firstCallAt).length} Awaiting 1st Call
                        </Tag>
                        <Tag color="green">
                            {orders.filter((o) => o.firstCallAt && !o.secondCallAt).length} Awaiting 2nd Call
                        </Tag>
                    </Space>
                }
            >
                <Table
                    columns={columns}
                    dataSource={orders}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <PhoneOutlined />
                        <span>Record {callType === "first" ? "First" : "Second"} Reminder Call - Order #{selectedOrder?.id}</span>
                    </Space>
                }
                open={callModalVisible}
                onOk={handleRecordCall}
                onCancel={() => {
                    setCallModalVisible(false);
                    setSelectedOrder(null);
                    setCallType(null);
                }}
                okText="Record Call"
                cancelText="Cancel"
                centered
            >
                {selectedOrder && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                                    <p><strong>Mobile:</strong> {selectedOrder.customerMobile}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Balance:</strong> {formatCurrency(selectedOrder.balanceAmount)}</p>
                                    <p><strong>Intended Delivery:</strong> {selectedOrder.intendedDelivery}</p>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <Checkbox
                                checked={customerAnswered}
                                onChange={(e) => setCustomerAnswered(e.target.checked)}
                            >
                                Customer answered the call
                            </Checkbox>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Call Notes</label>
                            <TextArea
                                rows={4}
                                placeholder="Enter notes from the call..."
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                maxLength={500}
                                showCount
                            />
                        </div>

                        <Card size="small" title="Call Timeline">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Intended 1st Call:</strong> {selectedOrder.intendedFirstCall}</p>
                                    <p><strong>Actual 1st Call:</strong> {selectedOrder.firstCallAt || "Not yet"}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Intended 2nd Call:</strong> {selectedOrder.intendedSecondCall}</p>
                                    <p><strong>Actual 2nd Call:</strong> {selectedOrder.secondCallAt || "Not yet"}</p>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}
