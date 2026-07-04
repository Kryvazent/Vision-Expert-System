import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message } from "antd";
import { SendOutlined, InboxOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const LOAD_IN_LAB_ORDERS = gql`
    query getInLabOrders($branchId: Int!) {
        orderCollection(
            filter: {
                order_status_id: { eq: 7 }
            }
            orderBy: [{ placed_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    placed_at
                    total_price
                    balance_amount
                    sent_to_lab_at
                    received_from_lab_at
                    intended_send_to_lab_date
                    intended_receive_from_lab_date
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

const UPDATE_SEND_TO_LAB = gql`
    mutation updateSendToLab($orderId: BigInt!, $sentAt: Datetime!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: { sent_to_lab_at: $sentAt }
        ) {
            records {
                id
                sent_to_lab_at
            }
        }
    }
`;

const UPDATE_RECEIVED_FROM_LAB = gql`
    mutation updateReceivedFromLab($orderId: BigInt!, $receivedAt: Datetime!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: { 
                received_from_lab_at: $receivedAt
                order_status_id: 8
            }
        ) {
            records {
                id
                received_from_lab_at
                order_status {
                    id
                    status
                }
            }
        }
    }
`;

export default function LabTracking() {
    const { staff } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [receiveModalVisible, setReceiveModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [receiveDate, setReceiveDate] = useState(null);

    const [loadOrders, { data: ordersData, refetch }] = useLazyQuery(LOAD_IN_LAB_ORDERS, {
        fetchPolicy: "network-only",
    });

    const [updateSendToLab] = useMutation(UPDATE_SEND_TO_LAB);
    const [updateReceivedFromLab] = useMutation(UPDATE_RECEIVED_FROM_LAB);

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
                    sentToLabAt: node.sent_to_lab_at ? dayjs(node.sent_to_lab_at).format("YYYY-MM-DD HH:mm") : null,
                    receivedFromLabAt: node.received_from_lab_at ? dayjs(node.received_from_lab_at).format("YYYY-MM-DD HH:mm") : null,
                    intendedSendDate: node.intended_send_to_lab_date ? dayjs(node.intended_send_to_lab_date).format("YYYY-MM-DD") : "-",
                    intendedReceiveDate: node.intended_receive_from_lab_date ? dayjs(node.intended_receive_from_lab_date).format("YYYY-MM-DD") : "-",
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

    const handleSendToLab = async (order) => {
        try {
            await updateSendToLab({
                variables: {
                    orderId: order.id,
                    sentAt: dayjs().toISOString(),
                },
            });
            message.success(`Order #${order.id} marked as sent to lab`);
            refetch();
        } catch (error) {
            console.error("Error sending to lab:", error);
            message.error("Failed to update: " + error.message);
        }
    };

    const handleReceiveFromLabClick = (order) => {
        setSelectedOrder(order);
        setReceiveDate(dayjs());
        setReceiveModalVisible(true);
    };

    const handleReceiveFromLab = async () => {
        if (!selectedOrder || !receiveDate) return;

        try {
            await updateReceivedFromLab({
                variables: {
                    orderId: selectedOrder.id,
                    receivedAt: receiveDate.toISOString(),
                },
            });
            message.success(`Order #${selectedOrder.id} marked as received from lab`);
            setReceiveModalVisible(false);
            setSelectedOrder(null);
            refetch();
        } catch (error) {
            console.error("Error receiving from lab:", error);
            message.error("Failed to update: " + error.message);
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
        },
        {
            title: "Frame",
            dataIndex: "frameSerial",
            key: "frameSerial",
        },
        {
            title: "Intended Send",
            dataIndex: "intendedSendDate",
            key: "intendedSendDate",
        },
        {
            title: "Actual Send",
            dataIndex: "sentToLabAt",
            key: "sentToLabAt",
            render: (v) => (v ? <Tag color="green">{v}</Tag> : <Tag color="orange">Pending</Tag>),
        },
        {
            title: "Intended Receive",
            dataIndex: "intendedReceiveDate",
            key: "intendedReceiveDate",
        },
        {
            title: "Actual Receive",
            dataIndex: "receivedFromLabAt",
            key: "receivedFromLabAt",
            render: (v) => (v ? <Tag color="green">{v}</Tag> : <Tag color="orange">Pending</Tag>),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space>
                    {!record.sentToLabAt && (
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handleSendToLab(record)}
                        >
                            Send to Lab
                        </Button>
                    )}
                    {record.sentToLabAt && !record.receivedFromLabAt && (
                        <Button
                            type="primary"
                            icon={<InboxOutlined />}
                            onClick={() => handleReceiveFromLabClick(record)}
                        >
                            Receive from Lab
                        </Button>
                    )}
                    {record.receivedFromLabAt && (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Completed
                        </Tag>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="m-5">
            <Card
                title="Lab Tracking"
                extra={
                    <Space>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>
                            {orders.length} Orders in Lab
                        </Tag>
                        <Tag color="orange">
                            {orders.filter((o) => !o.sentToLabAt).length} Pending Send
                        </Tag>
                        <Tag color="green">
                            {orders.filter((o) => o.sentToLabAt && !o.receivedFromLabAt).length} Awaiting Receive
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
                        <InboxOutlined />
                        <span>Receive Order #{selectedOrder?.id} from Lab</span>
                    </Space>
                }
                open={receiveModalVisible}
                onOk={handleReceiveFromLab}
                onCancel={() => {
                    setReceiveModalVisible(false);
                    setSelectedOrder(null);
                }}
                okText="Mark as Received"
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
                                    <p><strong>Frame:</strong> {selectedOrder.frameSerial}</p>
                                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalPrice)}</p>
                                </Col>
                            </Row>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Actual Receive Date</label>
                            <DatePicker
                                style={{ width: "100%" }}
                                value={receiveDate}
                                onChange={setReceiveDate}
                                disabledDate={(d) => d && d < dayjs().startOf("day")}
                                format="YYYY-MM-DD HH:mm"
                                showTime
                            />
                        </div>

                        <Card size="small" title="Timeline Comparison">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Intended Send:</strong> {selectedOrder.intendedSendDate}</p>
                                    <p><strong>Actual Send:</strong> {selectedOrder.sentToLabAt}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Intended Receive:</strong> {selectedOrder.intendedReceiveDate}</p>
                                    <p><strong>Actual Receive:</strong> {receiveDate ? receiveDate.format("YYYY-MM-DD HH:mm") : "-"}</p>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}
