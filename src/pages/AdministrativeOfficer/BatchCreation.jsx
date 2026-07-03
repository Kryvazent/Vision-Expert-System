import { Button, Card, Col, DatePicker, Input, Modal, Row, Space, Table, Tag, message, Checkbox } from "antd";
import { PlusOutlined, SendOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

const LOAD_CONFIRMED_ORDERS = gql`
    query getConfirmedOrders($branchId: Int!) {
        orderCollection(
            filter: {
                order_status_id: { eq: 6 }
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

const CREATE_BATCH = gql`
    mutation createBatch($branchId: Int!, $createdBy: BigInt!) {
        insertIntobatchCollection(
            objects: {
                branch_id: $branchId
                created_by: $createdBy
            }
        ) {
            records {
                id
            }
        }
    }
`;

const ADD_ORDER_TO_BATCH = gql`
    mutation addOrderToBatch($batchId: BigInt!, $orderId: String!, $placedDate: Datetime!) {
        insertIntobatch_orderCollection(
            objects: {
                batch_id: $batchId
                order_id: $orderId
                placed_date: $placedDate
            }
        ) {
            records {
                id
            }
        }
    }
`;

const UPDATE_ORDER_STATUS = gql`
    mutation updateOrderStatus($orderId: BigInt!, $statusId: BigInt!) {
        updateorderCollection(
            filter: { id: { eq: $orderId } }
            set: { order_status_id: $statusId }
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

export default function BatchCreation() {
    const { staff } = useAuth();
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creatingBatch, setCreatingBatch] = useState(false);

    const [loadOrders, { data: ordersData, refetch }] = useLazyQuery(LOAD_CONFIRMED_ORDERS, {
        fetchPolicy: "network-only",
    });

    const [createBatch] = useMutation(CREATE_BATCH);
    const [addOrderToBatch] = useMutation(ADD_ORDER_TO_BATCH);
    const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

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
                    remarks: node.remarks || "-",
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

    const handleCreateBatch = async () => {
        if (selectedOrders.length === 0) {
            message.warning("Please select at least one order to create a batch");
            return;
        }

        setCreatingBatch(true);
        try {
            // Create batch
            const batchResult = await createBatch({
                variables: {
                    branchId: staff.branch.id,
                    createdBy: staff.id,
                },
            });

            const batchId = batchResult.data.insertIntobatchCollection.records[0].id;

            // Add orders to batch
            for (const order of selectedOrders) {
                await addOrderToBatch({
                    variables: {
                        batchId: batchId,
                        orderId: String(order.id),
                        placedDate: dayjs().toISOString(),
                    },
                });

                // Update order status to "In Lab"
                await updateOrderStatus({
                    variables: {
                        orderId: order.id,
                        statusId: 7, // In Lab status
                    },
                });
            }

            message.success(`Batch #${batchId} created with ${selectedOrders.length} orders`);
            setSelectedOrders([]);
            refetch();
        } catch (error) {
            console.error("Error creating batch:", error);
            message.error("Failed to create batch: " + error.message);
        } finally {
            setCreatingBatch(false);
        }
    };

    const columns = [
        {
            title: "Select",
            key: "select",
            render: (_, record) => (
                <Checkbox
                    checked={selectedOrders.some((o) => o.id === record.id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, record]);
                        } else {
                            setSelectedOrders(selectedOrders.filter((o) => o.id !== record.id));
                        }
                    }}
                />
            ),
        },
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
            title: "Frame",
            dataIndex: "frameSerial",
            key: "frameSerial",
        },
        {
            title: "Total",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Balance",
            dataIndex: "balanceAmount",
            key: "balanceAmount",
            render: (v) => <span style={{ color: v > 0 ? "#ff4d4f" : "#52c41a", fontWeight: 600 }}>{formatCurrency(v)}</span>,
        },
    ];

    const totalAmount = selectedOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <div className="m-5">
            <Card
                title="Create Batch from Confirmed Orders"
                extra={
                    <Space>
                        <Tag color="blue">
                            {orders.length} Confirmed Orders
                        </Tag>
                        <Tag color="green">
                            {selectedOrders.length} Selected
                        </Tag>
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleCreateBatch}
                            loading={creatingBatch}
                            disabled={selectedOrders.length === 0}
                        >
                            Create & Send to Lab
                        </Button>
                    </Space>
                }
            >
                {selectedOrders.length > 0 && (
                    <Card size="small" style={{ marginBottom: 16, background: "#e6f7ff", border: "1px solid #91d5ff" }}>
                        <Row gutter={16}>
                            <Col span={8}>
                                <p><strong>Selected Orders:</strong> {selectedOrders.length}</p>
                            </Col>
                            <Col span={8}>
                                <p><strong>Total Amount:</strong> {formatCurrency(totalAmount)}</p>
                            </Col>
                            <Col span={8}>
                                <p><strong>Estimated Lab Return:</strong> {dayjs().add(8, "day").format("YYYY-MM-DD")}</p>
                            </Col>
                        </Row>
                    </Card>
                )}

                <Table
                    columns={columns}
                    dataSource={orders}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                    rowSelection={null}
                />
            </Card>
        </div>
    );
}
