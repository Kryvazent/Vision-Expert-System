import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Space,
    Table,
    Tag,
    DatePicker,
    Typography,
    message,
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    SendOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../const/functions";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const { Text } = Typography;

const statusColors = {
    Pending: "orange",
    Accepted: "green",
    Rejected: "red",
};

const statusIcons = {
    Pending: <ClockCircleOutlined />,
    Accepted: <CheckCircleOutlined />,
    Rejected: <CloseCircleOutlined />,
};

// ── Queries & Mutations ──
const LOAD_NOT_COMPLETED_ORDERS = gql`
    query getOrders($branchId: ID!) {
        customerCollection {
            edges {
                node {
                    id
                    first_name
                    last_name
                    contact_no
                    customer_has_branchCollection(
                        filter: { branch_id: { eq: $branchId } }
                    ) {
                        edges {
                            node {
                                id
                                clinic_attend_customerCollection {
                                    edges {
                                        node {
                                            id
                                            clinic {
                                                id
                                                date
                                            }
                                            orderCollection(
                                                filter: { order_status_id: { neq: 4 } }
                                            ) {
                                                edges {
                                                    node {
                                                        id
                                                        placed_at
                                                        total_price
                                                        order_status {
                                                            id
                                                            status
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const LOAD_CASH_TRANSFERS = gql`
    query getCashTransfers($staffId: ID!) {
        cash_transfers_to_adminCollection(
            filter: { by: { eq: $staffId } }
            orderBy: { created_at: DescNullsLast }
        ) {
            edges {
                node {
                    id
                    amount
                    note
                    created_at
                    cash_transfer_status {
                        id
                        status
                    }
                }
            }
        }
    }
`;

const NEW_MONEY_TRANSFER = gql`
    mutation addMoneyTransfer($staffId: ID!, $amount: Float!, $note: String) {
        insertIntocash_transfers_to_adminCollection(
            objects: {
                by: $staffId
                amount: $amount
                note: $note
            }
        ) {
            records {
                id
                amount
                note
                created_at
                cash_transfer_status {
                    id
                    status
                }
            }
        }
    }
`;

const CANCEL_TRANSFER = gql`
    mutation cancelTransfer($transferId: ID!) {
        deleteFromcash_transfers_to_adminCollection(
            filter: { id: { eq: $transferId } }
            atMost: 1
        ) {
            records {
                id
            }
        }
    }
`;

function CashTransferToAdmin() {
    const { staff } = useAuth();

    const [transfers, setTransfers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [submitting, setSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [form] = Form.useForm();

    // ── Load Orders ──
    const [loadOrders, { data: orderData, loading: ordersLoading }] =
        useLazyQuery(LOAD_NOT_COMPLETED_ORDERS, {
            fetchPolicy: "network-only",
        });

    // ── Load Cash Transfers ──
    const [
        loadTransfers,
        { data: transferData, loading: transfersLoading, error: transferError },
    ] = useLazyQuery(LOAD_CASH_TRANSFERS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            mapAndSetTransfers(data);
        },
        onError: (err) => {
            console.error("❌ Transfer query error:", err);
            message.error("Failed to load transfers: " + err.message);
        },
    });

    // ── Add Transfer Mutation ──
    const [addMoneyTransfer] = useMutation(NEW_MONEY_TRANSFER);

    // ── Cancel Transfer Mutation ──
    const [cancelTransfer] = useMutation(CANCEL_TRANSFER, {
        onCompleted: () => {
            message.success("Transfer cancelled successfully.");
            // ── Reload transfers after cancel ──
            if (staff?.id) {
                loadTransfers({ variables: { staffId: staff.id } });
            }
        },
        onError: (err) => {
            console.error("❌ Cancel mutation error:", err);
            message.error("Failed to cancel transfer: " + err.message);
        },
    });

    // ── Helper: map raw GQL data → table rows ──
    const mapAndSetTransfers = (data) => {
        const edges = data?.cash_transfers_to_adminCollection?.edges;

        if (!edges) {
            console.warn("⚠️ No edges found in transfer data:", data);
            return;
        }

        const mapped = edges.map(({ node }) => ({
            key: node.id,
            id: node.id,
            amount: node.amount ?? 0,
            date: node.created_at
                ? dayjs(node.created_at).format("YYYY-MM-DD")
                : "—",
            note: node.note ?? "—",
            status: node.cash_transfer_status?.status ?? "Pending",
        }));

        setTransfers(mapped);
    };

    // ── Initial Data Load ──
    useEffect(() => {
        if (staff?.branch?.id) {
            loadOrders({ variables: { branchId: staff.branch.id } });
        }
    }, [loadOrders, staff?.branch?.id]);

    useEffect(() => {
        if (staff?.id) {
            loadTransfers({ variables: { staffId: staff.id } });
        }
    }, [loadTransfers, staff?.id]);

    // ── Fallback: handle transferData change ──
    useEffect(() => {
        if (transferData) {
            mapAndSetTransfers(transferData);
        }
    }, [transferData]);

    // ── Flatten Orders ──
    const orders = useMemo(() => {
        if (!orderData?.customerCollection?.edges) return [];
        const result = [];
        orderData.customerCollection.edges.forEach(({ node: customer }) => {
            customer.customer_has_branchCollection?.edges?.forEach(
                ({ node: branch }) => {
                    branch.clinic_attend_customerCollection?.edges?.forEach(
                        ({ node: clinicAttend }) => {
                            clinicAttend.orderCollection?.edges?.forEach(
                                ({ node: orderNode }) => {
                                    result.push({
                                        amount: orderNode.total_price ?? 0,
                                        status: orderNode.order_status?.status ?? "Unknown",
                                    });
                                }
                            );
                        }
                    );
                }
            );
        });
        return result;
    }, [orderData]);

    // ── Cash on Hand ──
    const cashOnHand = useMemo(() => {
        return orders
            .filter(
                (o) =>
                    o.status.toLowerCase() === "active" ||
                    o.status.toLowerCase() === "completed"
            )
            .reduce((sum, o) => sum + o.amount, 0);
    }, [orders]);

    // ── Refresh All Data ──
    const refreshData = () => {
        if (staff?.branch?.id) {
            loadOrders({ variables: { branchId: staff.branch.id } });
        }
        if (staff?.id) {
            loadTransfers({ variables: { staffId: staff.id } });
        }
    };

    // ── Format Currency ──
    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    // ── Transfer Totals ──
    const totalPending = transfers
        .filter((t) => t.status === "Pending")
        .reduce((s, t) => s + t.amount, 0);

    const totalRejected = transfers
        .filter((t) => t.status === "Rejected")
        .reduce((s, t) => s + t.amount, 0);

    // ── Stat Cards ──
    const statCards = [
        {
            title: "Cash on Hand",
            value: ordersLoading ? "Loading..." : formatCurrency(cashOnHand),
            accent: "#1677ff",
            subtitle: "From active & completed orders",
            customIcon: (
                <DollarOutlined style={{ color: "#1677ff", fontSize: 22 }} />
            ),
        },
        {
            title: "Pending Transfers",
            value: formatCurrency(totalPending),
            accent: "#faad14",
            subtitle: "Awaiting admin acceptance",
            customIcon: (
                <ClockCircleOutlined style={{ color: "#faad14", fontSize: 22 }} />
            ),
        },
        {
            title: "Rejected Transfers",
            value: formatCurrency(totalRejected),
            accent: "#ff4d4f",
            subtitle: "Returned to your responsibility",
            customIcon: (
                <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 22 }} />
            ),
        },
    ];

    // ── Filtered Table Data ──
    const filteredTransfers = useMemo(() => {
        if (filterStatus === "All") return transfers;
        return transfers.filter((t) => t.status === filterStatus);
    }, [filterStatus, transfers]);

    // ── Submit New Transfer ──
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            await addMoneyTransfer({
                variables: {
                    staffId: staff.id,
                    amount: values.amount,
                    note: values.note || "",
                },
            });

            // ── Close modal and reset form ──
            setShowModal(false);
            form.resetFields();

            // ── Reload transfers ──
            await loadTransfers({ variables: { staffId: staff.id } });

            Modal.success({
                title: "Transfer Submitted!",
                content: (
                    <div>
                        <p style={{ color: "#595959" }}>
                            Your cash transfer request has been sent to the admin.
                        </p>
                        <div
                            style={{
                                background: "#fffbe6",
                                border: "1px solid #ffe58f",
                                borderRadius: 8,
                                padding: "8px 12px",
                                marginTop: 10,
                            }}
                        >
                            <ExclamationCircleOutlined
                                style={{ color: "#faad14", marginRight: 6 }}
                            />
                            <Text style={{ color: "#875800", fontSize: 12 }}>
                                This amount remains your responsibility until the admin
                                accepts it.
                            </Text>
                        </div>
                    </div>
                ),
                okButtonProps: {
                    style: { background: "#1677ff", borderColor: "#1677ff" },
                },
            });
        } catch (error) {
            console.error("❌ Error submitting transfer:", error);
            message.error("Failed to submit transfer: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Cancel Pending Transfer (calls GraphQL mutation) ──
    const handleCancel = (record) => {
        Modal.confirm({
            title: "Cancel Transfer?",
            icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
            content: (
                <div>
                    <p>Are you sure you want to cancel transfer <strong>#{record.id}</strong>?</p>
                    <p style={{ color: "#8c8c8c", fontSize: 12 }}>
                        Amount: {formatCurrency(record.amount)}
                    </p>
                    <p style={{ color: "#ff4d4f", fontSize: 12 }}>
                        ⚠ This action cannot be undone.
                    </p>
                </div>
            ),
            okText: "Yes, Cancel Transfer",
            cancelText: "No, Keep It",
            okButtonProps: { danger: true },
            // ── Call the GraphQL mutation on confirm ──
            onOk: async () => {
                setCancellingId(record.id);
                try {
                    await cancelTransfer({
                        variables: { transferId: record.id },
                    });
                } catch (err) {
                    // error handled in onError above
                    console.log("❌ Cancel transfer error:", err);
                } finally {
                    setCancellingId(null);
                }
            },
        });
    };

    // ── Table Columns ──
    const columns = [
        {
            title: "Transfer ID",
            dataIndex: "id",
            key: "id",
            render: (v) => (
                <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span>
            ),
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (v) => (
                <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (v) => <span style={{ color: "#8c8c8c" }}>{v}</span>,
        },
        {
            title: "Note",
            dataIndex: "note",
            key: "note",
            render: (v) => <span style={{ color: "#595959" }}>{v}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (v) => (
                <Tag
                    icon={statusIcons[v]}
                    color={statusColors[v] || "blue"}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                    {v}
                </Tag>
            ),
        },
        {
            title: "Responsibility",
            key: "responsibility",
            render: (_, record) => {
                if (record.status === "Pending") {
                    return (
                        <Tag color="orange" style={{ fontSize: 11 }}>
                            ⚠ Still Your Responsibility
                        </Tag>
                    );
                }
                if (record.status === "Accepted") {
                    return (
                        <Tag color="green" style={{ fontSize: 11 }}>
                            ✓ No Longer Responsible
                        </Tag>
                    );
                }
                return (
                    <Tag color="red" style={{ fontSize: 11 }}>
                        ✕ Returned to You
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => {
                if (record.status.toLowerCase() === "pending") {
                    return (
                        <Button
                            size="small"
                            danger
                            loading={cancellingId === record.id}
                            onClick={() => handleCancel(record)}
                            style={{
                                background: "#fff1f0",
                                borderColor: "#ffccc7",
                                color: "#ff4d4f",
                            }}
                        >
                            Cancel
                        </Button>
                    );
                }
                return (
                    <Button size="small" disabled>
                        —
                    </Button>
                );
            },
        },
    ];

    return (
        <div className="m-5">
            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]}>
                {statCards.map((item) => (
                    <Col xs={24} sm={12} xl={6} key={item.title}>
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                borderLeft: `5px solid ${item.accent}`,
                                height: "100%",
                            }}
                            bodyStyle={{ padding: 20 }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            color: "#8c8c8c",
                                            fontSize: 13,
                                            marginBottom: 6,
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: "#1f1f1f",
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginTop: 4,
                                        }}
                                    >
                                        {item.subtitle}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 12,
                                        background: `${item.accent}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.customIcon}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Transfer Table ── */}
            <Row className="mt-5">
                <Col span={24}>
                    <Card
                        title={
                            <Space>
                                <DollarOutlined style={{ color: "#1677ff" }} />
                                <span>Cash Transfer History</span>
                                <Tag color="blue">{transfers.length} records</Tag>
                            </Space>
                        }
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}
                        extra={
                            <Space wrap>
                                {["All", "Pending", "Accepted", "Rejected"].map((status) => (
                                    <Button
                                        key={status}
                                        size="small"
                                        type={filterStatus === status ? "primary" : "default"}
                                        style={
                                            filterStatus === status
                                                ? {
                                                    background: "#1677ff",
                                                    borderColor: "#1677ff",
                                                }
                                                : {}
                                        }
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status}
                                    </Button>
                                ))}
                                <Button
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={refreshData}
                                    loading={transfersLoading}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={() => setShowModal(true)}
                                    style={{
                                        background: "#1677ff",
                                        borderColor: "#1677ff",
                                        marginLeft: 8,
                                    }}
                                >
                                    New Transfer
                                </Button>
                            </Space>
                        }
                    >
                        {/* ── Responsibility Notice ── */}
                        <div
                            style={{
                                background: "#fffbe6",
                                border: "1px solid #ffe58f",
                                borderRadius: 8,
                                padding: "8px 14px",
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                            <Text style={{ color: "#875800", fontSize: 12 }}>
                                Pending transfers are still{" "}
                                <strong>your responsibility</strong> until the admin accepts
                                them. Once accepted, you are no longer accountable for that
                                amount.
                            </Text>
                        </div>

                        {/* ── Error State ── */}
                        {transferError && (
                            <div
                                style={{
                                    background: "#fff2f0",
                                    border: "1px solid #ffccc7",
                                    borderRadius: 8,
                                    padding: "8px 14px",
                                    marginBottom: 16,
                                    color: "#ff4d4f",
                                    fontSize: 12,
                                }}
                            >
                                ❌ Error loading transfers: {transferError.message}
                            </div>
                        )}

                        <Table
                            dataSource={filteredTransfers}
                            columns={columns}
                            loading={transfersLoading}
                            pagination={{ pageSize: 5, size: "small" }}
                            size="middle"
                            scroll={{ x: 900 }}
                            locale={{
                                emptyText: transfersLoading
                                    ? "Loading..."
                                    : transferError
                                        ? "Failed to load data"
                                        : "No transfers found",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* ── New Transfer Modal ── */}
            <Modal
                title={
                    <Space>
                        <SendOutlined style={{ color: "#1677ff" }} />
                        <span>New Cash Transfer to Admin</span>
                    </Space>
                }
                open={showModal}
                onCancel={() => {
                    setShowModal(false);
                    form.resetFields();
                }}
                footer={null}
                width={480}
                centered
                destroyOnClose
            >
                <div
                    style={{
                        background: "#fffbe6",
                        border: "1px solid #ffe58f",
                        borderRadius: 8,
                        padding: "8px 14px",
                        marginBottom: 20,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                    }}
                >
                    <ExclamationCircleOutlined
                        style={{ color: "#faad14", marginTop: 2 }}
                    />
                    <Text style={{ color: "#875800", fontSize: 12 }}>
                        You remain responsible for this amount until the admin{" "}
                        <strong>accepts</strong> the transfer.
                    </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Transfer Amount (LKR)"
                        name="amount"
                        rules={[
                            { required: true, message: "Please enter the amount" },
                            {
                                type: "number",
                                min: 1,
                                message: "Amount must be greater than 0",
                            },
                        ]}
                    >
                        <InputNumber
                            prefix={<DollarOutlined style={{ color: "#8c8c8c" }} />}
                            placeholder="Enter amount"
                            style={{ width: "100%" }}
                            formatter={(v) =>
                                `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(v) => v.replace(/,/g, "")}
                            min={1}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Transfer Date"
                        name="date"
                        initialValue={dayjs()}
                        rules={[{ required: true, message: "Please select a date" }]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            disabledDate={(d) => d && d > dayjs().endOf("day")}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span>
                                Note{" "}
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    (Optional)
                                </Text>
                            </span>
                        }
                        name="note"
                        rules={[
                            {
                                max: 200,
                                message: "Note cannot exceed 200 characters",
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="e.g. Weekly sales collection, client payments..."
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                            <Button
                                onClick={() => {
                                    setShowModal(false);
                                    form.resetFields();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<SendOutlined />}
                                style={{
                                    background: "#1677ff",
                                    borderColor: "#1677ff",
                                }}
                            >
                                Submit Transfer
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CashTransferToAdmin;