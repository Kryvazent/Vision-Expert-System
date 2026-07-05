import { Button, Card, Col, Row, Space, Table, Tag, Statistic, Select, Typography, message } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { headerStyles, buttonStyles, cardStyles, formStyles } from "../../const/designSystem";

const { Title, Text } = Typography;

const { Option } = Select;

const LOAD_ALL_ALLOCATIONS = gql`
    query getAllAllocations {
        petty_cash_allocationCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    created_at
                    allocated_by
                    branch_id
                    amount
                    notes
                    month
                    year
                    branch {
                        id
                        branch_name
                        address
                    }
                }
            }
        }
    }
`;

const LOAD_ALL_REQUESTS = gql`
    query getAllRequests {
        petty_cash_requestCollection(orderBy: [{ created_at: DescNullsLast }]) {
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
                }
            }
        }
    }
`;

const LOAD_BRANCHES = gql`
    query getBranches {
        branchCollection {
            edges {
                node {
                    id
                    branch_name
                    address
                }
            }
        }
    }
`;

export default function PettyCashHistory() {
    const [allocations, setAllocations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);

    const [loadAllocations, { data: allocationsData, loading: allocationsLoading, refetch: refetchAllocations }] = useLazyQuery(
        LOAD_ALL_ALLOCATIONS,
        {
            fetchPolicy: "network-only",
            onError: (error) => {
                console.error("Error loading petty cash allocation history:", error);
                message.error("Failed to load petty cash allocation history: " + error.message);
            },
        }
    );
    const [loadRequests, { data: requestsData, loading: requestsLoading, refetch: refetchRequests }] = useLazyQuery(
        LOAD_ALL_REQUESTS,
        {
            fetchPolicy: "network-only",
            onError: (error) => {
                console.error("Error loading petty cash request history:", error);
                message.error("Failed to load petty cash request history: " + error.message);
            },
        }
    );
    const [loadBranches, { data: branchesData, loading: branchesLoading }] = useLazyQuery(
        LOAD_BRANCHES,
        {
            fetchPolicy: "network-only",
            onError: (error) => {
                console.error("Error loading branches:", error);
                message.error("Failed to load branches: " + error.message);
            },
        }
    );

    useEffect(() => {
        loadAllocations();
        loadRequests();
        loadBranches();
    }, [loadAllocations, loadRequests, loadBranches]);

    useEffect(() => {
        if (allocationsData) {
            const edges = allocationsData?.petty_cash_allocationCollection?.edges || [];
            setAllocations(edges.map((e) => e.node));
        }
    }, [allocationsData]);

    useEffect(() => {
        if (requestsData) {
            const edges = requestsData?.petty_cash_requestCollection?.edges || [];
            setRequests(edges.map((e) => e.node));
        }
    }, [requestsData]);

    useEffect(() => {
        if (branchesData) {
            const edges = branchesData?.branchCollection?.edges || [];
            setBranches(edges.map((e) => e.node));
        }
    }, [branchesData]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    const handleFilter = () => {
        refetchAllocations?.();
        refetchRequests?.();
    };

    const handleReset = () => {
        setSelectedBranch(null);
        setSelectedMonth(null);
        setSelectedYear(null);
        refetchAllocations?.();
        refetchRequests?.();
    };

    // Client-side filtering for month/year
    const filteredAllocations = allocations.filter((a) => {
        if (selectedMonth && a.month !== selectedMonth) return false;
        if (selectedYear && a.year !== selectedYear) return false;
        if (selectedBranch && Number(a.branch_id) !== Number(selectedBranch)) return false;
        return true;
    });

    const filteredRequests = requests.filter((r) => {
        if (selectedBranch && Number(r.branch_id) !== Number(selectedBranch)) return false;
        return true;
    });

    const stats = useMemo(() => {
        const totalAllocated = filteredAllocations.reduce((sum, a) => sum + (a.amount || 0), 0);
        const totalRequested = filteredRequests.reduce((sum, r) => sum + (r.amount || 0), 0);
        const approvedRequests = filteredRequests.filter((r) => r.request_status === "Approved").length;
        const pendingRequests = filteredRequests.filter((r) => r.request_status === "Pending").length;
        const rejectedRequests = filteredRequests.filter((r) => r.request_status === "Rejected").length;

        return {
            totalAllocated,
            totalRequested,
            approvedRequests,
            pendingRequests,
            rejectedRequests,
        };
    }, [filteredAllocations, filteredRequests]);

    const allocationColumns = [
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
            title: "Location",
            dataIndex: "branch",
            key: "location",
            render: (v) => v?.address || "-",
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => formatCurrency(v),
        },
        {
            title: "Month",
            key: "month",
            render: (_, record) => `${dayjs().month(record.month - 1).format("MMMM")} ${record.year}`,
        },
        {
            title: "Allocated By",
            dataIndex: "allocated_by_staff",
            key: "allocated_by_staff",
            render: (_, record) => record.allocated_by ? `Staff #${record.allocated_by}` : "-",
        },
        {
            title: "Date",
            dataIndex: "created_at",
            key: "created_at",
            render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            ellipsis: true,
        },
    ];

    const requestColumns = [
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
            title: "Requested By",
            dataIndex: "requested_by_staff",
            key: "requested_by_staff",
            render: (_, record) => record.requested_by ? `Staff #${record.requested_by}` : "-",
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
                return <Tag color={color}>{v}</Tag>;
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
            render: (_, record) => record.reviewed_by ? `Staff #${record.reviewed_by}` : "-",
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
        <div style={{ padding: 24 }}>
            <div style={headerStyles.container}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={2} style={headerStyles.title}>
                            Petty Cash History
                        </Title>
                        <Text type="secondary" style={headerStyles.subtitle}>
                            View petty cash allocation and request history
                        </Text>
                    </Col>
                </Row>
            </div>

            <Card style={cardStyles.default}>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={4}>
                        <Statistic
                            title="Total Allocated"
                            value={stats.totalAllocated}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#3f8600" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Total Requested"
                            value={stats.totalRequested}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Approved"
                            value={stats.approvedRequests}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Pending"
                            value={stats.pendingRequests}
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Col>
                    <Col span={4}>
                        <Statistic
                            title="Rejected"
                            value={stats.rejectedRequests}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Col>
                </Row>

                <Card size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16} align="middle">
                        <Col span={6}>
                            <label style={formStyles.label}>Branch</label>
                            <Select
                                style={formStyles.select}
                                placeholder="All branches"
                                value={selectedBranch}
                                onChange={setSelectedBranch}
                                allowClear
                                loading={branchesLoading}
                            >
                                {branches.map((branch) => (
                                    <Option key={branch.id} value={branch.id}>
                                        {branch.branch_name}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <label style={formStyles.label}>Month</label>
                            <Select
                                style={formStyles.select}
                                placeholder="All months"
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                                allowClear
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Option key={i + 1} value={i + 1}>
                                        {dayjs().month(i).format("MMMM")}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <label style={formStyles.label}>Year</label>
                            <Select
                                style={formStyles.select}
                                placeholder="All years"
                                value={selectedYear}
                                onChange={setSelectedYear}
                                allowClear
                            >
                                {[2024, 2025, 2026, 2027].map((year) => (
                                    <Option key={year} value={year}>
                                        {year}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={6}>
                            <Space style={{ marginTop: 24 }}>
                                <Button type="primary" icon={<FilterOutlined />} onClick={handleFilter} style={buttonStyles.primary}>
                                    Filter
                                </Button>
                                <Button onClick={handleReset}>Reset</Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Card>

            <Card title="Allocation History" style={{ ...cardStyles.default, marginTop: 16 }}>
                <Table
                    columns={allocationColumns}
                    dataSource={filteredAllocations}
                    loading={allocationsLoading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>

            <Card title="Request History" style={{ ...cardStyles.default, marginTop: 16 }}>
                <Table
                    columns={requestColumns}
                    dataSource={filteredRequests}
                    loading={requestsLoading}
                    pagination={{ pageSize: 10 }}
                    rowKey="id"
                />
            </Card>
        </div>
    );
}
