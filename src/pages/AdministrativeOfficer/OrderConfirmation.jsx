import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Checkbox } from "antd";
import { PhoneOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const { TextArea } = Input;

const LOAD_PENDING_ORDERS = gql`
    query getPendingOrders($branchId: Int!) {
        orderCollection(
            filter: {
                order_status_id: { in: [1, 4] }
            }
            orderBy: [{ placed_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    placed_at
                    total_price
                    balance_amount
                    remarks
                    agrahara_applied
                    estimated_delivery
                    frame_warranty_month
                    lense_warranty_month
                    order_status {
                        id
                        status
                    }
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
                    prescription {
                        id
                        right_sph
                        right_cyl
                        right_axis
                        right_add
                        left_sph
                        left_cyl
                        left_axis
                        left_add
                        pupillary_distance
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
                    paymentCollection {
                        edges {
                            node {
                                id
                                total_payment
                                advance
                                discount
                                additional_fee
                            }
                        }
                    }
                }
            }
        }
    }
`;

const CONFIRM_ORDER = gql`
    mutation confirmOrder(
        $orderId: BigInt!
        $confirmedBy: BigInt!
        $confirmedAt: Datetime!
        $intendedConfirmDate: Datetime!
        $intendedSendToLabDate: Datetime!
        $intendedReceiveFromLabDate: Datetime!
        $intendedFirstReminderDate: Datetime!
        $intendedSecondReminderDate: Datetime!
        $intendedDeliveryDate: Datetime!
    ) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: {
                order_status_id: 6
                customer_confirmed_by: $confirmedBy
                customer_confirmed_at: $confirmedAt
                intended_customer_confirm_date: $intendedConfirmDate
                intended_send_to_lab_date: $intendedSendToLabDate
                intended_receive_from_lab_date: $intendedReceiveFromLabDate
                intended_first_reminder_date: $intendedFirstReminderDate
                intended_second_reminder_date: $intendedSecondReminderDate
                intended_delivery_date: $intendedDeliveryDate
            }
        ) {
            records {
                id
                order_status {
                    id
                    status
                }
            }
        }
    }
`;

export default function OrderConfirmation() {
    const { staff } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [callNotes, setCallNotes] = useState("");
    const [customerAnswered, setCustomerAnswered] = useState(true);

    const [loadOrders, { data: ordersData }] = useLazyQuery(LOAD_PENDING_ORDERS, {
        fetchPolicy: "network-only",
    });

    const [confirmOrder, { loading: confirming }] = useMutation(CONFIRM_ORDER);

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
                const payments = node?.paymentCollection?.edges?.map((e) => e.node) || [];
                const totalPaid = payments.reduce((sum, p) => sum + (p.total_payment || 0), 0);
                const advance = payments.reduce((sum, p) => sum + (p.advance || 0), 0);

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
                    advance: advance,
                    paidAmount: totalPaid,
                    status: node.order_status?.status || "-",
                    statusId: node.order_status?.id,
                    frameSerial: node.frame?.serial_no || "-",
                    frameType: node.frame?.frame_type?.type || "-",
                    lenseType: node.lense_type?.type || "-",
                    remarks: node.remarks || "-",
                    agraharaApplied: node.agrahara_applied,
                    estimatedDelivery: node.estimated_delivery ? dayjs(node.estimated_delivery).format("YYYY-MM-DD") : "-",
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

    const handleConfirmClick = (order) => {
        setSelectedOrder(order);
        setCallNotes("");
        setCustomerAnswered(true);
        setConfirmModalVisible(true);
    };

    const handleConfirmOrder = async () => {
        if (!selectedOrder) return;

        const now = dayjs();
        const intendedConfirmDate = now;
        const intendedSendToLabDate = now.add(1, "day");
        const intendedReceiveFromLabDate = now.add(8, "day"); // 7 days after sending
        const intendedFirstReminderDate = now.add(9, "day"); // 1 day after receiving
        const intendedSecondReminderDate = now.add(10, "day"); // 2 days after receiving
        const intendedDeliveryDate = now.add(11, "day"); // 1 day after second call

        try {
            await confirmOrder({
                variables: {
                    orderId: selectedOrder.id,
                    confirmedBy: staff.id,
                    confirmedAt: now.toISOString(),
                    intendedConfirmDate: intendedConfirmDate.toISOString(),
                    intendedSendToLabDate: intendedSendToLabDate.toISOString(),
                    intendedReceiveFromLabDate: intendedReceiveFromLabDate.toISOString(),
                    intendedFirstReminderDate: intendedFirstReminderDate.toISOString(),
                    intendedSecondReminderDate: intendedSecondReminderDate.toISOString(),
                    intendedDeliveryDate: intendedDeliveryDate.toISOString(),
                },
            });
            message.success(`Order #${selectedOrder.id} confirmed successfully`);
            setConfirmModalVisible(false);
            setSelectedOrder(null);
            // Refresh orders
            if (staff?.branch?.id) {
                loadOrders({ variables: { branchId: staff.branch.id } });
            }
        } catch (error) {
            console.error("Error confirming order:", error);
            message.error("Failed to confirm order: " + error.message);
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
            title: "Placed At",
            dataIndex: "placedAt",
            key: "placedAt",
        },
        {
            title: "Total",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Advance",
            dataIndex: "advance",
            key: "advance",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Balance",
            dataIndex: "balanceAmount",
            key: "balanceAmount",
            render: (v) => <span style={{ color: v > 0 ? "#ff4d4f" : "#52c41a", fontWeight: 600 }}>{formatCurrency(v)}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (v) => {
                const color = v === "Hold" ? "orange" : v === "Pending" ? "blue" : "default";
                return <Tag color={color}>{v}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<PhoneOutlined />}
                    onClick={() => handleConfirmClick(record)}
                >
                    Call & Confirm
                </Button>
            ),
        },
    ];

    return (
        <div className="m-5">
            <Card
                title="Order Confirmation"
                extra={
                    <Space>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {orders.filter((o) => o.status === "Pending").length} Pending
                        </Tag>
                        <Tag color="orange" icon={<ClockCircleOutlined />}>
                            {orders.filter((o) => o.status === "Hold").length} On Hold
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
                        <span>Confirm Order #{selectedOrder?.id}</span>
                    </Space>
                }
                open={confirmModalVisible}
                onOk={handleConfirmOrder}
                onCancel={() => {
                    setConfirmModalVisible(false);
                    setSelectedOrder(null);
                }}
                okText="Confirm Order"
                cancelText="Cancel"
                okButtonProps={{ loading: confirming, disabled: !customerAnswered }}
                width={700}
                centered
            >
                {selectedOrder && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                                    <p><strong>Mobile:</strong> {selectedOrder.customerMobile}</p>
                                    <p><strong>Address:</strong> {selectedOrder.customerAddress}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalPrice)}</p>
                                    <p><strong>Advance:</strong> {formatCurrency(selectedOrder.advance)}</p>
                                    <p><strong>Balance:</strong> {formatCurrency(selectedOrder.balanceAmount)}</p>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <Checkbox
                                checked={customerAnswered}
                                onChange={(e) => setCustomerAnswered(e.target.checked)}
                            >
                                Customer answered the call and confirmed the order
                            </Checkbox>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Call Notes</label>
                            <TextArea
                                rows={4}
                                placeholder="Enter notes from the customer call..."
                                value={callNotes}
                                onChange={(e) => setCallNotes(e.target.value)}
                                maxLength={500}
                                showCount
                            />
                        </div>

                        <Card size="small" title="Intended Timeline">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Confirm Date:</strong> {dayjs().format("YYYY-MM-DD")}</p>
                                    <p><strong>Send to Lab:</strong> {dayjs().add(1, "day").format("YYYY-MM-DD")}</p>
                                    <p><strong>Receive from Lab:</strong> {dayjs().add(8, "day").format("YYYY-MM-DD")}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>1st Reminder:</strong> {dayjs().add(9, "day").format("YYYY-MM-DD")}</p>
                                    <p><strong>2nd Reminder:</strong> {dayjs().add(10, "day").format("YYYY-MM-DD")}</p>
                                    <p><strong>Delivery:</strong> {dayjs().add(11, "day").format("YYYY-MM-DD")}</p>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}
