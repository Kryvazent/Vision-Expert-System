import { Button, Card, Col, DatePicker, Row, Space, Table, Tag, message, Statistic, Select, Typography } from "antd";
import { DollarOutlined, ArrowUpOutlined, ArrowDownOutlined, FilterOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { headerStyles, buttonStyles, cardStyles, formStyles } from "../../const/designSystem";

const { Title, Text } = Typography;

const { Option } = Select;
const { RangePicker } = DatePicker;

const GET_CASH_TRANSFERS = gql`
    query getCashTransfers {
        cash_transfers_to_adminCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    created_at
                    by
                    amount
                    cash_type_id
                    branch_id
                    note
                    cash_transfer_status_id
                    branch {
                        id
                        branch_name
                    }
                    cash_transfer_status {
                        id
                        status
                    }
                }
            }
        }
    }
`;

const GET_PETTY_CASH = gql`
    query getPettyCash {
        petty_cashCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    created_at
                    type
                    amount
                    description
                    date
                    category
                    branch_id
                    branch {
                        id
                        branch_name
                    }
                }
            }
        }
    }
`;

const GET_ORDER_PAYMENTS = gql`
    query getOrderPayments {
        order_paymentCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    amount
                    created_at
                    payment_method
                    notes
                    order_id
                    order {
                        id
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
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const GET_CASH_TYPES = gql`
    query getCashTypes {
        cash_typeCollection {
            edges {
                node {
                    id
                    type
                }
            }
        }
    }
`;

const GET_STAFF = gql`
    query getStaff {
        staffCollection {
            edges {
                node {
                    id
                    first_name
                    last_name
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
                    branch_name
                }
            }
        }
    }
`;

export default function CashflowView() {
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [cashTransfers, setCashTransfers] = useState([]);
    const [pettyCash, setPettyCash] = useState([]);
    const [orderPayments, setOrderPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [getCashTransfers, { data: cashTransfersData, refetch: refetchCashTransfers }] = useLazyQuery(GET_CASH_TRANSFERS);
    const [getPettyCash, { data: pettyCashData, refetch: refetchPettyCash }] = useLazyQuery(GET_PETTY_CASH);
    const [getOrderPayments, { data: orderPaymentsData, refetch: refetchOrderPayments }] = useLazyQuery(GET_ORDER_PAYMENTS);
    const [getBranches, { data: branchesData }] = useLazyQuery(GET_BRANCHES);
    const [getCashTypes, { data: cashTypesData }] = useLazyQuery(GET_CASH_TYPES);
    const [getStaff, { data: staffData }] = useLazyQuery(GET_STAFF);

    useEffect(() => {
        getBranches();
        getCashTypes();
        getStaff();
        handleLoadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cashTransfersData) {
            const edges = cashTransfersData?.cash_transfers_to_adminCollection?.edges || [];
            setCashTransfers(edges.map((e) => e.node));
        }
    }, [cashTransfersData]);

    useEffect(() => {
        if (pettyCashData) {
            const edges = pettyCashData?.petty_cashCollection?.edges || [];
            setPettyCash(edges.map((e) => e.node));
        }
    }, [pettyCashData]);

    useEffect(() => {
        if (orderPaymentsData) {
            const edges = orderPaymentsData?.order_paymentCollection?.edges || [];
            setOrderPayments(edges.map((e) => e.node));
        }
    }, [orderPaymentsData]);

    const handleLoadData = () => {
        setLoading(true);

        Promise.all([
            getCashTransfers({ fetchPolicy: "network-only" }),
            getPettyCash({ fetchPolicy: "network-only" }),
            getOrderPayments({ fetchPolicy: "network-only" }),
        ]).then(() => {
            setLoading(false);
        }).catch((error) => {
            console.error("Error loading cashflow data:", error);
            message.error("Failed to load cashflow data");
            setLoading(false);
        });
    };

    const branchMatches = (branchId) => !selectedBranch || Number(branchId) === Number(selectedBranch);
    const dateMatches = (value) => {
        if (dateRange.length !== 2) return true;
        const date = dayjs(value);
        return date.isValid()
            && !date.isBefore(dayjs(dateRange[0]).startOf("day"))
            && !date.isAfter(dayjs(dateRange[1]).endOf("day"));
    };

    const cashTypeMap = useMemo(() => {
        const edges = cashTypesData?.cash_typeCollection?.edges || [];
        return new Map(edges.map(({ node }) => [String(node.id), node.type]));
    }, [cashTypesData]);

    const staffMap = useMemo(() => {
        const edges = staffData?.staffCollection?.edges || [];
        return new Map(
            edges.map(({ node }) => [
                String(node.id),
                `${node.first_name || ""} ${node.last_name || ""}`.trim() || `Staff #${node.id}`,
            ])
        );
    }, [staffData]);

    const filteredCashTransfers = useMemo(
        () => cashTransfers.filter((item) => branchMatches(item.branch_id) && dateMatches(item.created_at)),
        [cashTransfers, selectedBranch, dateRange]
    );

    const filteredPettyCash = useMemo(
        () => pettyCash.filter((item) => branchMatches(item.branch_id) && dateMatches(item.date || item.created_at)),
        [pettyCash, selectedBranch, dateRange]
    );

    const filteredOrderPayments = useMemo(
        () => orderPayments.filter((item) => {
            const branchId = item.order?.clinic_attend_customer?.clinic?.branch?.id;
            return branchMatches(branchId) && dateMatches(item.created_at);
        }),
        [orderPayments, selectedBranch, dateRange]
    );

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const cashTransferColumns = [
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
            title: "Type",
            dataIndex: "cash_type_id",
            key: "cash_type",
            render: (v) => cashTypeMap.get(String(v)) || (v ? `Type #${v}` : "-"),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "By",
            dataIndex: "by",
            key: "by_staff",
            render: (v) => staffMap.get(String(v)) || (v ? `Staff #${v}` : "-"),
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Note",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
        },
    ];

    const pettyCashColumns = [
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
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (v) => <Tag color={v === "Expense" ? "red" : "green"}>{v}</Tag>,
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (v) => v ? dayjs(v).format("YYYY-MM-DD") : "-",
        },
    ];

    const orderPaymentColumns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Order ID",
            dataIndex: "order_id",
            key: "order_id",
            render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span>,
        },
        {
            title: "Customer",
            key: "customer",
            render: (_, record) => `${record.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ""} ${record.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ""}`.trim(),
        },
        {
            title: "Branch",
            key: "branch",
            render: (_, record) => record.order?.clinic_attend_customer?.clinic?.branch?.branch_name || "-",
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
    ];

    const stats = {
        totalCashTransfers: filteredCashTransfers.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalPettyCashExpenses: filteredPettyCash.filter(p => p.type === "Expense").reduce((sum, p) => sum + (p.amount || 0), 0),
        totalPettyCashReplenishment: filteredPettyCash.filter(p => p.type === "Replenishment").reduce((sum, p) => sum + (p.amount || 0), 0),
        totalOrderPayments: filteredOrderPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={headerStyles.container}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={2} style={headerStyles.title}>
                            Cashflow View
                        </Title>
                        <Text type="secondary" style={headerStyles.subtitle}>
                            Monitor cash transfers, payments, and petty cash across branches
                        </Text>
                    </Col>
                </Row>
            </div>

            <Card style={cardStyles.default}>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                        <Statistic
                            title="Total Cash Transfers"
                            value={stats.totalCashTransfers}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#1890ff" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Total Order Payments"
                            value={stats.totalOrderPayments}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#52c41a" }}
                            prefix={<DollarOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Petty Cash Expenses"
                            value={stats.totalPettyCashExpenses}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#ff4d4f" }}
                            prefix={<ArrowDownOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Petty Cash Replenishment"
                            value={stats.totalPettyCashReplenishment}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#faad14" }}
                            prefix={<ArrowUpOutlined />}
                        />
                    </Col>
                </Row>

                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                        <Col span={8}>
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
                                        {edge.node.branch_name || `Branch ${edge.node.id}`}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={8}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>Date Range</label>
                            <RangePicker
                                style={{ width: "100%" }}
                                value={dateRange}
                                onChange={setDateRange}
                            />
                        </Col>
                        <Col span={8}>
                            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>&nbsp;</label>
                            <Button
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={handleLoadData}
                                loading={loading}
                                block
                            >
                                Load Data
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </Card>

            <Card title="Cash Transfers" style={{ marginTop: 16 }}>
                <Table
                    columns={cashTransferColumns}
                    dataSource={filteredCashTransfers}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="Petty Cash Transactions" style={{ marginTop: 16 }}>
                <Table
                    columns={pettyCashColumns}
                    dataSource={filteredPettyCash}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="Order Payments" style={{ marginTop: 16 }}>
                <Table
                    columns={orderPaymentColumns}
                    dataSource={filteredOrderPayments}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>
        </div>
    );
}
