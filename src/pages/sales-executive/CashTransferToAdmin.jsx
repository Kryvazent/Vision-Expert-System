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
} from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DollarOutlined,
    SendOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useMemo, useState } from "react";
import dayjs from "dayjs";

const { Text } = Typography;

const mockTransfers = [
    {
        key: "1",
        id: "TRF001",
        amount: 15000,
        date: "2024-01-15",
        status: "Pending",
        note: "January sales revenue",
    },
    {
        key: "2",
        id: "TRF002",
        amount: 8500,
        date: "2024-01-10",
        status: "Accepted",
        note: "Weekly collection",
    },
    {
        key: "3",
        id: "TRF003",
        amount: 22000,
        date: "2024-01-08",
        status: "Rejected",
        note: "Client payment batch",
    },
];

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

function CashTransferToAdmin() {
    
    const [transfers, setTransfers] = useState(mockTransfers);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("All");
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 0,
        }).format(value);

    // ── Summary values ──
    const totalPending = transfers
        .filter((t) => t.status === "Pending")
        .reduce((s, t) => s + t.amount, 0);

    const totalAccepted = transfers
        .filter((t) => t.status === "Accepted")
        .reduce((s, t) => s + t.amount, 0);

    const totalRejected = transfers
        .filter((t) => t.status === "Rejected")
        .reduce((s, t) => s + t.amount, 0);

    const statCards = [
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
            title: "Accepted Transfers",
            value: formatCurrency(totalAccepted),
            accent: "#52c41a",
            subtitle: "No longer your responsibility",
            customIcon: (
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 22 }} />
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

    // ── Filtered table data ──
    const filteredTransfers = useMemo(() => {
        if (filterStatus === "All") return transfers;
        return transfers.filter((t) => t.status === filterStatus);
    }, [filterStatus, transfers]);

    // ── Submit new transfer ──
    const handleSubmit = (values) => {
        setSubmitting(true);
        setTimeout(() => {
            const newTransfer = {
                key: String(transfers.length + 1),
                id: `TRF${String(transfers.length + 1).padStart(3, "0")}`,
                amount: values.amount,
                date: values.date.format("YYYY-MM-DD"),
                status: "Pending",
                note: values.note || "—",
            };
            setTransfers([newTransfer, ...transfers]);
            form.resetFields();
            setShowModal(false);
            setSubmitting(false);

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
        }, 1200);
    };

    // ── Cancel pending transfer ──
    const handleCancel = (record) => {
        Modal.confirm({
            title: "Cancel Transfer?",
            icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
            content: `Are you sure you want to cancel transfer #${record.id}?`,
            okText: "Yes, Cancel",
            cancelText: "No",
            okButtonProps: {
                danger: true,
            },
            onOk: () => {
                setTransfers(transfers.filter((t) => t.key !== record.key));
            },
        });
    };

    // ── Table columns ──
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
                if (record.status === "Pending") {
                    return (
                        <Button
                            size="small"
                            danger
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
                    <Col xs={24} sm={12} xl={8} key={item.title}>
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
                            </Space>
                        }
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}
                        extra={
                            <Space wrap>
                                {/* Filter buttons */}
                                {["All", "Pending", "Accepted", "Rejected"].map((status) => (
                                    <Button
                                        key={status}
                                        size="small"
                                        type={filterStatus === status ? "primary" : "default"}
                                        style={
                                            filterStatus === status
                                                ? { background: "#1677ff", borderColor: "#1677ff" }
                                                : {}
                                        }
                                        onClick={() => setFilterStatus(status)}
                                    >
                                        {status}
                                    </Button>
                                ))}

                                {/* New Transfer button */}
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
                        {/* Responsibility notice */}
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

                        <Table
                            dataSource={filteredTransfers}
                            columns={columns}
                            pagination={{ pageSize: 5, size: "small" }}
                            size="middle"
                            scroll={{ x: 900 }}
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
                {/* Warning inside modal */}
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
                    {/* Amount */}
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

                    {/* Date */}
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

                    {/* Note */}
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

                    {/* Footer buttons */}
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