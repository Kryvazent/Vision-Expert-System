import { Button, Card, Col, Descriptions, Input, Row, Space, Table, Tag, message, Statistic } from "antd";
import { SearchOutlined, DollarOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../const/functions";

const normalizeSearchValue = (value) =>
    String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const GET_ORDER_BY_ID = gql`
    query getOrderById($orderId: BigInt!) {
        orderCollection(filter: { id: { eq: $orderId } }) {
            edges {
                node {
                    id
                    total_price
                    balance_amount
                    placed_at
                    estimated_delivery
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
                                address
                                nic
                            }
                        }
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
                    lense_type {
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
                    intended_customer_confirm_date
                    sent_to_lab_at
                    intended_send_to_lab_date
                    received_from_lab_at
                    intended_receive_from_lab_date
                    first_reminder_call_at
                    intended_first_reminder_date
                    second_reminder_call_at
                    intended_second_reminder_date
                    delivered_at
                    intended_delivery_date
                    delivered_by
                    order_paymentCollection {
                        edges {
                            node {
                                id
                                amount
                                created_at
                                payment_method
                                notes
                                received_by
                            }
                        }
                    }
                }
            }
        }
    }
`;

const GET_ALL_ORDERS = gql`
    query getAllOrders {
        orderCollection(orderBy: [{ placed_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    total_price
                    balance_amount
                    placed_at
                    estimated_delivery
                    order_status_id
                    order_status {
                        id
                        status
                        deesc
                    }
                    clinic_attend_customer {
                        clinic {
                            branch {
                                id
                                branch_name
                            }
                        }
                        customer_has_branch {
                            customer {
                                first_name
                                last_name
                                contact_no
                                nic
                            }
                        }
                    }
                }
            }
        }
    }
`;

export default function OrderLookup() {
    const { staff } = useAuth();
    const [searchOrderId, setSearchOrderId] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("search");
    const [deliverySortDirection, setDeliverySortDirection] = useState("asc");

    const [getOrderById, { data: orderData }] = useLazyQuery(GET_ORDER_BY_ID);
    const [getAllOrders, { data: ordersData }] = useLazyQuery(GET_ALL_ORDERS);
    const roleName = String(staff?.role?.role_name || "").toLowerCase();
    const staffBranchId = Number(staff?.branch?.id ?? staff?.branch_id);
    const canViewAllBranches = roleName === "owner" || roleName === "accountant";
    const effectiveBranch = canViewAllBranches ? null : staffBranchId;
    const orderNodes = ordersData?.orderCollection?.edges?.map((edge) => edge.node) || [];

    useEffect(() => {
        const order = orderData?.orderCollection?.edges?.[0]?.node;

        if (!order) {
            setSelectedOrder(null);
            return;
        }

        const orderBranchId = Number(order.clinic_attend_customer?.clinic?.branch?.id);
        if (!canViewAllBranches && staffBranchId && orderBranchId !== staffBranchId) {
            setSelectedOrder(null);
            message.error("This order does not belong to your branch.");
            return;
        }

        setSelectedOrder(order);
    }, [orderData, canViewAllBranches, staffBranchId]);

    const filterOrdersForCurrentScope = (orders) =>
        orders.filter((order) => {
            if (effectiveBranch && Number(order.clinic_attend_customer?.clinic?.branch?.id) !== Number(effectiveBranch)) {
                return false;
            }
            return true;
        });

    const orderMatchesSearch = (order, searchText) => {
        const customer = order.clinic_attend_customer?.customer_has_branch?.customer;
        const normalizedSearch = normalizeSearchValue(searchText);
        const plainSearch = String(searchText ?? "").trim().toLowerCase();

        return [
            String(order.id ?? "").toLowerCase(),
            String(customer?.nic ?? "").toLowerCase(),
            String(customer?.contact_no ?? "").toLowerCase(),
        ].some((value) => value.includes(plainSearch)) ||
            [
                order.id,
                customer?.nic,
                customer?.contact_no,
            ].some((value) => normalizeSearchValue(value).includes(normalizedSearch));
    };

    const loadOrderDetails = (orderId) => {
        setLoading(true);
        getOrderById({
            variables: { orderId: Number(orderId) },
        }).then(() => {
            setLoading(false);
        }).catch((error) => {
            console.error("Error loading order details:", error);
            message.error("Failed to load order details");
            setLoading(false);
        });
    };

    const handleSearch = async () => {
        const searchText = searchOrderId.trim();

        if (!searchText) {
            message.error("Please enter an order ID, NIC, or mobile number");
            return;
        }

        setLoading(true);
        setSelectedOrder(null);
        setSearchResults([]);

        try {
            const { data } = await getAllOrders({ fetchPolicy: "network-only" });
            const matches = filterOrdersForCurrentScope(
                data?.orderCollection?.edges?.map((edge) => edge.node) || []
            ).filter((order) => orderMatchesSearch(order, searchText));

            setSearchResults(matches);

            if (matches.length === 0) {
                message.error("No matching orders found");
            } else if (matches.length === 1) {
                loadOrderDetails(matches[0].id);
            }
        } catch (error) {
            console.error("Error searching order:", error);
            message.error("Failed to find order");
        } finally {
            setLoading(false);
        }
    };

    const handleLoadAllOrders = () => {
        if (!canViewAllBranches && !staffBranchId) {
            message.error("No branch is assigned to your account.");
            return;
        }

        setLoading(true);
        getAllOrders().then(() => {
            setLoading(false);
        }).catch((error) => {
            console.error("Error loading orders:", error);
            message.error("Failed to load orders");
            setLoading(false);
        });
    };

    useEffect(() => {
        if ((viewMode === "tomorrowDeliveries" || viewMode === "nextWeekDeliveries") && !ordersData) {
            handleLoadAllOrders();
        }
    }, [viewMode, ordersData]);

    const filterOrdersByDeliveryWindow = (orders, startDate, endDate) =>
        orders.filter((order) => {
            if (effectiveBranch && Number(order.clinic_attend_customer?.clinic?.branch?.id) !== Number(effectiveBranch)) {
                return false;
            }

            if (!order.estimated_delivery) {
                return false;
            }

            const deliveryDate = dayjs(order.estimated_delivery);
            return (
                deliveryDate.isSame(startDate, "day") ||
                deliveryDate.isSame(endDate, "day") ||
                (deliveryDate.isAfter(startDate, "day") && deliveryDate.isBefore(endDate, "day"))
            );
        });

    const sortOrdersByDeliveryDate = (orders) =>
        [...orders].sort((a, b) => {
            const first = dayjs(a.estimated_delivery).valueOf();
            const second = dayjs(b.estimated_delivery).valueOf();
            return deliverySortDirection === "asc" ? first - second : second - first;
        });

    const tomorrowDeliveryOrders = sortOrdersByDeliveryDate(
        filterOrdersByDeliveryWindow(orderNodes, dayjs().add(1, "day"), dayjs().add(1, "day"))
    );
    const nextWeekDeliveryOrders = sortOrdersByDeliveryDate(
        filterOrdersByDeliveryWindow(orderNodes, dayjs().add(2, "day"), dayjs().add(8, "day"))
    );

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setSelectedOrder(null);
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
            title: "Date",
            dataIndex: "placed_at",
            key: "placed_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD"),
        },
        {
            title: "Estimated Delivery",
            dataIndex: "estimated_delivery",
            key: "estimated_delivery",
            render: (v) => v ? dayjs(v).format("YYYY-MM-DD") : "-",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                        loadOrderDetails(record.id);
                    }}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const paymentColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Payment Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-",
        },
        {
            title: "Method",
            dataIndex: "payment_method",
            key: "payment_method",
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            ellipsis: true,
        },
    ];

    return (
        <div className="m-5">
            <Card
                title="Order Lookup"
                extra={
                    <Space wrap>
                        <Button
                            size="small"
                            type={viewMode === "search" ? "primary" : "default"}
                            onClick={() => handleViewModeChange("search")}
                        >
                            Search
                        </Button>
                        <Button
                            size="small"
                            type={viewMode === "tomorrowDeliveries" ? "primary" : "default"}
                            onClick={() => handleViewModeChange("tomorrowDeliveries")}
                        >
                            Tomorrow Deliveries
                        </Button>
                        <Button
                            size="small"
                            type={viewMode === "nextWeekDeliveries" ? "primary" : "default"}
                            onClick={() => handleViewModeChange("nextWeekDeliveries")}
                        >
                            Next 7 Days
                        </Button>
                    </Space>
                }
            >
                {(viewMode === "tomorrowDeliveries" || viewMode === "nextWeekDeliveries") && (
                    <Space style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            onClick={handleLoadAllOrders}
                            loading={loading}
                        >
                            Refresh Deliveries
                        </Button>
                        <Button
                            onClick={() => setDeliverySortDirection((prev) => prev === "asc" ? "desc" : "asc")}
                        >
                            {deliverySortDirection === "asc" ? "Ascending" : "Descending"}
                        </Button>
                    </Space>
                )}

                {viewMode === "search" && (
                    <div style={{ marginBottom: 24 }}>
                        <Space>
                            <Input
                                placeholder="Enter order ID, NIC, or mobile number"
                                value={searchOrderId}
                                onChange={(e) => setSearchOrderId(e.target.value)}
                                style={{ width: 200 }}
                                onPressEnter={handleSearch}
                            />
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={handleSearch}
                                loading={loading}
                            >
                                Search
                            </Button>
                        </Space>
                        {searchResults.length > 1 && (
                            <Card title="Matching Orders" size="small" style={{ marginTop: 16 }}>
                                <Table
                                    columns={orderColumns}
                                    dataSource={searchResults}
                                    loading={loading}
                                    pagination={{ pageSize: 5 }}
                                    rowKey="id"
                                    size="small"
                                />
                            </Card>
                        )}
                    </div>
                )}

            </Card>

            {viewMode === "tomorrowDeliveries" && (
                <Card title="Tomorrow Deliveries" style={{ marginTop: 16 }}>
                    <Table
                        columns={orderColumns}
                        dataSource={tomorrowDeliveryOrders}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                    />
                </Card>
            )}

            {viewMode === "nextWeekDeliveries" && (
                <Card title="Next 7 Days Deliveries" style={{ marginTop: 16 }}>
                    <Table
                        columns={orderColumns}
                        dataSource={nextWeekDeliveryOrders}
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        rowKey="id"
                    />
                </Card>
            )}

            {selectedOrder && (
                <div style={{ marginTop: 16 }}>
                    <Card title={`Order #${selectedOrder.id} Details`}>
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={6}>
                                <Statistic
                                    title="Total Amount"
                                    value={selectedOrder.total_price}
                                    formatter={(value) => formatCurrency(value)}
                                    valueStyle={{ color: "#1890ff" }}
                                    prefix={<DollarOutlined />}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Balance"
                                    value={selectedOrder.balance_amount}
                                    formatter={(value) => formatCurrency(value)}
                                    valueStyle={{ color: "#faad14" }}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Status"
                                    value={selectedOrder.order_status?.status}
                                    formatter={(value) => getStatusTag(value)}
                                    valueStyle={{ fontSize: 16 }}
                                />
                            </Col>
                        </Row>

                        <Descriptions title="Customer Information" bordered column={2}>
                            <Descriptions.Item label="Name">
                                {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.first_name} {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.last_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Contact">
                                {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.contact_no}
                            </Descriptions.Item>
                            <Descriptions.Item label="NIC">
                                {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.nic || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Address">
                                {selectedOrder.clinic_attend_customer?.customer_has_branch?.customer?.address || "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Branch">
                                {selectedOrder.clinic_attend_customer?.clinic?.branch?.branch_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Clinic Venue">
                                {selectedOrder.clinic_attend_customer?.clinic?.venue}
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Order Details" bordered column={2} style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Order Date">
                                {dayjs(selectedOrder.placed_at).format("YYYY-MM-DD HH:mm")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Estimated Delivery">
                                {dayjs(selectedOrder.estimated_delivery).format("YYYY-MM-DD")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lens Type">
                                {selectedOrder.lense_type?.type}
                            </Descriptions.Item>
                            <Descriptions.Item label="Frame Type">
                                {selectedOrder.frame_type?.type}
                            </Descriptions.Item>
                            <Descriptions.Item label="Frame">
                                {selectedOrder.frame?.product?.name} ({selectedOrder.frame?.product?.sku})
                            </Descriptions.Item>
                            <Descriptions.Item label="Remarks">
                                {selectedOrder.remarks || "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Prescription Details" bordered column={3} style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Right SPH">{selectedOrder.prescription?.right_sph}</Descriptions.Item>
                            <Descriptions.Item label="Right CYL">{selectedOrder.prescription?.right_cyl}</Descriptions.Item>
                            <Descriptions.Item label="Right AXIS">{selectedOrder.prescription?.right_axis}</Descriptions.Item>
                            <Descriptions.Item label="Right ADD">{selectedOrder.prescription?.right_add}</Descriptions.Item>
                            <Descriptions.Item label="Left SPH">{selectedOrder.prescription?.left_sph}</Descriptions.Item>
                            <Descriptions.Item label="Left CYL">{selectedOrder.prescription?.left_cyl}</Descriptions.Item>
                            <Descriptions.Item label="Left AXIS">{selectedOrder.prescription?.left_axis}</Descriptions.Item>
                            <Descriptions.Item label="Left ADD">{selectedOrder.prescription?.left_add}</Descriptions.Item>
                            <Descriptions.Item label="PD">{selectedOrder.prescription?.pupillary_distance}</Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Order Timeline" bordered column={2} style={{ marginTop: 16 }}>
                            <Descriptions.Item label="Customer Confirmed At">
                                {selectedOrder.customer_confirmed_at ? dayjs(selectedOrder.customer_confirmed_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended Confirmation Date">
                                {selectedOrder.intended_customer_confirm_date ? dayjs(selectedOrder.intended_customer_confirm_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sent to Lab At">
                                {selectedOrder.sent_to_lab_at ? dayjs(selectedOrder.sent_to_lab_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended Send to Lab Date">
                                {selectedOrder.intended_send_to_lab_date ? dayjs(selectedOrder.intended_send_to_lab_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Received from Lab At">
                                {selectedOrder.received_from_lab_at ? dayjs(selectedOrder.received_from_lab_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended Receive from Lab Date">
                                {selectedOrder.intended_receive_from_lab_date ? dayjs(selectedOrder.intended_receive_from_lab_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="First Reminder Call At">
                                {selectedOrder.first_reminder_call_at ? dayjs(selectedOrder.first_reminder_call_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended First Reminder Date">
                                {selectedOrder.intended_first_reminder_date ? dayjs(selectedOrder.intended_first_reminder_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Second Reminder Call At">
                                {selectedOrder.second_reminder_call_at ? dayjs(selectedOrder.second_reminder_call_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended Second Reminder Date">
                                {selectedOrder.intended_second_reminder_date ? dayjs(selectedOrder.intended_second_reminder_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Delivered At">
                                {selectedOrder.delivered_at ? dayjs(selectedOrder.delivered_at).format("YYYY-MM-DD HH:mm") : "-"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Intended Delivery Date">
                                {selectedOrder.intended_delivery_date ? dayjs(selectedOrder.intended_delivery_date).format("YYYY-MM-DD") : "-"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Card title="Payment History" style={{ marginTop: 16 }}>
                            <Table
                                columns={paymentColumns}
                                dataSource={selectedOrder.order_paymentCollection?.edges?.map((e) => e.node) || []}
                                pagination={false}
                                rowKey="id"
                                size="small"
                            />
                        </Card>
                    </Card>
                </div>
            )}
        </div>
    );
}
