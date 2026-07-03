import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Tabs, Divider } from "antd";
import { PrinterOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const { TextArea } = Input;

const LOAD_TODAY_DELIVERIES = gql`
    query getTodayDeliveries($branchId: Int!, $todayDate: Datetime!) {
        orderCollection(
            filter: {
                order_status_id: { eq: 9 }
                intended_delivery_date: { eq: $todayDate }
            }
            orderBy: [{ placed_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    placed_at
                    total_price
                    balance_amount
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
                    order_paymentCollection {
                        edges {
                            node {
                                id
                                amount
                                payment_method
                                payment_type
                                notes
                                created_at
                                received_by
                            }
                        }
                    }
                }
            }
        }
    }
`;

const LOAD_UNDELIVERED_ORDERS = gql`
    query getUndeliveredOrders($branchId: Int!, $beforeDate: Datetime!) {
        orderCollection(
            filter: {
                order_status_id: { eq: 9 }
                intended_delivery_date: { lt: $beforeDate }
            }
            orderBy: [{ intended_delivery_date: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    placed_at
                    total_price
                    balance_amount
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
                    order_paymentCollection {
                        edges {
                            node {
                                id
                                amount
                                payment_method
                                payment_type
                                notes
                                created_at
                                received_by
                            }
                        }
                    }
                }
            }
        }
    }
`;

const ADD_PAYMENT = gql`
    mutation addOrderPayment(
        $orderId: BigInt!
        $amount: Float!
        $paymentMethod: String!
        $paymentType: String!
        $notes: String
        $receivedBy: BigInt!
    ) {
        insertIntoorder_paymentCollection(
            objects: {
                order_id: $orderId
                amount: $amount
                payment_method: $paymentMethod
                payment_type: $paymentType
                notes: $notes
                received_by: $receivedBy
            }
        ) {
            records {
                id
            }
        }
    }
`;

const MARK_DELIVERED = gql`
    mutation markDelivered($orderId: BigInt!, $deliveredBy: BigInt!, $deliveredAt: Datetime!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: {
                order_status_id: 10
                delivered_by: $deliveredBy
                delivered_at: $deliveredAt
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

const CREATE_CASH_TRANSFER = gql`
    mutation createCashTransfer(
      $by: BigInt!
      $amount: Float!
      $cashTypeId: Int!
      $branchId: Int!
      $note: String!
    ) {
      insertIntocash_transfers_to_adminCollection(
        objects: {
          by: $by
          amount: $amount
          cash_type_id: $cashTypeId
          branch_id: $branchId
          note: $note
          cash_transfer_status_id: 1
        }
      ) {
        records {
          id
        }
      }
    }
`;

export default function DeliveryManagement() {
    const { staff } = useAuth();
    const [todayDeliveries, setTodayDeliveries] = useState([]);
    const [undeliveredOrders, setUndeliveredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [paymentNotes, setPaymentNotes] = useState("");
    const [paymentHistory, setPaymentHistory] = useState([]);

    const [loadTodayDeliveries, { data: todayData, refetch: refetchToday }] = useLazyQuery(LOAD_TODAY_DELIVERIES, {
        fetchPolicy: "network-only",
    });

    const [loadUndeliveredOrders, { data: undeliveredData, refetch: refetchUndelivered }] = useLazyQuery(LOAD_UNDELIVERED_ORDERS, {
        fetchPolicy: "network-only",
    });

    const [addPayment] = useMutation(ADD_PAYMENT);
    const [markDelivered] = useMutation(MARK_DELIVERED);
    const [createCashTransfer] = useMutation(CREATE_CASH_TRANSFER);

    const today = dayjs().startOf("day");

    useEffect(() => {
        if (staff?.branch?.id) {
            loadTodayDeliveries({
                variables: {
                    branchId: staff.branch.id,
                    todayDate: today.toISOString(),
                },
            });
            loadUndeliveredOrders({
                variables: {
                    branchId: staff.branch.id,
                    beforeDate: today.toISOString(),
                },
            });
        }
    }, [loadTodayDeliveries, loadUndeliveredOrders, staff, today]);

    useEffect(() => {
        if (todayData) {
            const edges = todayData?.orderCollection?.edges || [];
            const mappedOrders = edges.map(({ node }) => mapOrderData(node));
            setTodayDeliveries(mappedOrders);
        }
    }, [todayData]);

    useEffect(() => {
        if (undeliveredData) {
            const edges = undeliveredData?.orderCollection?.edges || [];
            const mappedOrders = edges.map(({ node }) => mapOrderData(node));
            setUndeliveredOrders(mappedOrders);
        }
    }, [undeliveredData]);

    const mapOrderData = (node) => {
        const customer = node?.clinic_attend_customer?.customer_has_branch?.customer;
        const clinic = node?.clinic_attend_customer?.clinic;
        const payments = node?.order_paymentCollection?.edges?.map((e) => e.node) || [];
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
            paidAmount: totalPaid,
            frameSerial: node.frame?.serial_no || "-",
            frameType: node.frame?.frame_type?.type || "-",
            lenseType: node.lense_type?.type || "-",
            intendedDelivery: node.intended_delivery_date ? dayjs(node.intended_delivery_date).format("YYYY-MM-DD") : "-",
            payments: payments,
        };
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleAddPayment = (order) => {
        setSelectedOrder(order);
        setPaymentAmount("");
        setPaymentMethod("cash");
        setPaymentNotes("");
        setPaymentModalVisible(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedOrder || !paymentAmount || parseFloat(paymentAmount) <= 0) {
            message.error("Please enter a valid payment amount");
            return;
        }

        try {
            const paymentResult = await addPayment({
                variables: {
                    orderId: selectedOrder.id,
                    amount: parseFloat(paymentAmount),
                    paymentMethod: paymentMethod,
                    paymentType: "partial",
                    notes: paymentNotes,
                    receivedBy: staff.id,
                },
            });

            const paymentId = paymentResult.data.insertIntoorder_paymentCollection.records[0].id;

            // Connect to cash workflow
            try {
                await createCashTransfer({
                    variables: {
                        by: staff.id,
                        amount: parseFloat(paymentAmount),
                        cashTypeId: 2, // Recovery cash type
                        branchId: staff.branch.id,
                        note: `Payment collection for order #${selectedOrder.id}`,
                    },
                });
            } catch (cashError) {
                console.error("Error creating cash transfer:", cashError);
                // Don't fail the payment if cash transfer fails, just log it
            }

            message.success(`Payment of ${formatCurrency(parseFloat(paymentAmount))} recorded`);
            setPaymentModalVisible(false);
            setSelectedOrder(null);
            refetchToday();
            refetchUndelivered();
        } catch (error) {
            console.error("Error adding payment:", error);
            message.error("Failed to add payment: " + error.message);
        }
    };

    const handleMarkDelivered = async (order) => {
        if (order.balanceAmount > 0) {
            message.warning("Cannot deliver order with outstanding balance. Please collect full payment first.");
            return;
        }

        Modal.confirm({
            title: "Confirm Delivery",
            content: `Are you sure you want to mark order #${order.id} as delivered?`,
            onOk: async () => {
                try {
                    await markDelivered({
                        variables: {
                            orderId: order.id,
                            deliveredBy: staff.id,
                            deliveredAt: dayjs().toISOString(),
                        },
                    });
                    message.success(`Order #${order.id} marked as delivered`);
                    refetchToday();
                    refetchUndelivered();
                } catch (error) {
                    console.error("Error marking delivered:", error);
                    message.error("Failed to mark as delivered: " + error.message);
                }
            },
        });
    };

    const handleViewHistory = (order) => {
        setSelectedOrder(order);
        setPaymentHistory(order.payments || []);
        setHistoryModalVisible(true);
    };

    const handlePrintReceipt = (payment) => {
        const receiptContent = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="text-align: center;">Payment Receipt</h2>
                <p><strong>Receipt ID:</strong> ${payment.id}</p>
                <p><strong>Date:</strong> ${dayjs(payment.created_at).format("YYYY-MM-DD HH:mm")}</p>
                <p><strong>Order ID:</strong> #${selectedOrder?.id}</p>
                <p><strong>Customer:</strong> ${selectedOrder?.customerName}</p>
                <hr style="margin: 15px 0;">
                <p><strong>Amount:</strong> ${formatCurrency(payment.amount)}</p>
                <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
                <p><strong>Payment Type:</strong> ${payment.payment_type}</p>
                ${payment.notes ? `<p><strong>Notes:</strong> ${payment.notes}</p>` : ""}
                <hr style="margin: 15px 0;">
                <p style="text-align: center; font-size: 12px;">Thank you for your payment!</p>
            </div>
        `;
        const printWindow = window.open("", "_blank");
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        printWindow.print();
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
        },
        {
            title: "Address",
            dataIndex: "customerAddress",
            key: "customerAddress",
            ellipsis: true,
        },
        {
            title: "Total",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Paid",
            dataIndex: "paidAmount",
            key: "paidAmount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Balance",
            dataIndex: "balanceAmount",
            key: "balanceAmount",
            render: (v) => <span style={{ color: v > 0 ? "#ff4d4f" : "#52c41a", fontWeight: 600 }}>{formatCurrency(v)}</span>,
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
                <Space direction="vertical" size="small">
                    <Button
                        type="primary"
                        icon={<DollarOutlined />}
                        onClick={() => handleAddPayment(record)}
                    >
                        Add Payment
                    </Button>
                    <Button
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleMarkDelivered(record)}
                        disabled={record.balanceAmount > 0}
                    >
                        Mark Delivered
                    </Button>
                    <Button
                        icon={<PrinterOutlined />}
                        onClick={() => handleViewHistory(record)}
                    >
                        View History
                    </Button>
                </Space>
            ),
        },
    ];

    const undeliveredColumns = [
        ...columns.slice(0, -1),
        {
            title: "Days Overdue",
            key: "daysOverdue",
            render: (_, record) => {
                const days = dayjs().diff(dayjs(record.intendedDelivery), "day");
                return <Tag color={days > 3 ? "red" : "orange"}>{days} days</Tag>;
            },
        },
        columns[columns.length - 1],
    ];

    return (
        <div className="m-5">
            <Card
                title="Delivery Management"
                extra={
                    <Space>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {todayDeliveries.length} Today's Deliveries
                        </Tag>
                        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                            {undeliveredOrders.length} Undelivered
                        </Tag>
                    </Space>
                }
            >
                <Tabs
                    defaultActiveKey="today"
                    items={[
                        {
                            key: "today",
                            label: "Today's Deliveries",
                            children: (
                                <Table
                                    columns={columns}
                                    dataSource={todayDeliveries}
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                    scroll={{ x: true }}
                                />
                            ),
                        },
                        {
                            key: "undelivered",
                            label: "Undelivered Orders",
                            children: (
                                <Table
                                    columns={undeliveredColumns}
                                    dataSource={undeliveredOrders}
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                    scroll={{ x: true }}
                                />
                            ),
                        },
                    ]}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <DollarOutlined />
                        <span>Add Payment - Order #{selectedOrder?.id}</span>
                    </Space>
                }
                open={paymentModalVisible}
                onOk={handlePaymentSubmit}
                onCancel={() => {
                    setPaymentModalVisible(false);
                    setSelectedOrder(null);
                }}
                okText="Record Payment"
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
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalPrice)}</p>
                                    <p><strong>Paid:</strong> {formatCurrency(selectedOrder.paidAmount)}</p>
                                    <p><strong>Balance:</strong> {formatCurrency(selectedOrder.balanceAmount)}</p>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Payment Amount</label>
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                style={{ marginBottom: 8 }}
                            />
                            <small>Maximum: {formatCurrency(selectedOrder.balanceAmount)}</small>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{ width: "100%", padding: 8, border: "1px solid #d9d9d9", borderRadius: 4 }}
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="bank_transfer">Bank Transfer</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Notes</label>
                            <TextArea
                                rows={3}
                                placeholder="Optional notes..."
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                maxLength={200}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <Space>
                        <PrinterOutlined />
                        <span>Payment History - Order #{selectedOrder?.id}</span>
                    </Space>
                }
                open={historyModalVisible}
                onCancel={() => {
                    setHistoryModalVisible(false);
                    setSelectedOrder(null);
                }}
                footer={[
                    <Button key="close" onClick={() => setHistoryModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={800}
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
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalPrice)}</p>
                                    <p><strong>Paid:</strong> {formatCurrency(selectedOrder.paidAmount)}</p>
                                    <p><strong>Balance:</strong> {formatCurrency(selectedOrder.balanceAmount)}</p>
                                </Col>
                            </Row>
                        </Card>

                        <Divider>Payment History</Divider>

                        {paymentHistory.length === 0 ? (
                            <p style={{ textAlign: "center", color: "#999" }}>No payments recorded yet</p>
                        ) : (
                            <Table
                                dataSource={paymentHistory}
                                columns={[
                                    {
                                        title: "Date",
                                        dataIndex: "created_at",
                                        key: "created_at",
                                        render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
                                    },
                                    {
                                        title: "Amount",
                                        dataIndex: "amount",
                                        key: "amount",
                                        render: (v) => formatCurrency(v),
                                    },
                                    {
                                        title: "Method",
                                        dataIndex: "payment_method",
                                        key: "payment_method",
                                    },
                                    {
                                        title: "Type",
                                        dataIndex: "payment_type",
                                        key: "payment_type",
                                    },
                                    {
                                        title: "Action",
                                        key: "action",
                                        render: (_, record) => (
                                            <Button
                                                size="small"
                                                icon={<PrinterOutlined />}
                                                onClick={() => handlePrintReceipt(record)}
                                            >
                                                Print Receipt
                                            </Button>
                                        ),
                                    },
                                ]}
                                pagination={false}
                                size="small"
                            />
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
