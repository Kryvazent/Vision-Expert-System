
import { useState } from "react";
import {
  Table, Button, Tag, Badge, Typography, Space, Card, Modal,
  Form, Input, Select, DatePicker, Statistic, Row, Col, Alert,
  Tooltip, Divider, ConfigProvider
} from "antd";
import {
  PlusOutlined, EyeOutlined, PlayCircleOutlined, FileTextOutlined,
  InfoCircleFilled, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined,
  FileProtectOutlined, QuestionCircleOutlined
} from "@ant-design/icons";
 
const { Title, Text } = Typography;
 
const initialClaims = [
  {
    key: "WC001",
    id: "WC001",
    orderId: "OD1234",
    customer: "David Kim",
    phone: "0771234567",
    issueType: "Lens Damage",
    claimDate: "2024-02-24",
    status: "Pending",
  },
  {
    key: "WC002",
    id: "WC002",
    orderId: "OD1230",
    customer: "James Brown",
    phone: "0772345678",
    issueType: "Frame Damage",
    claimDate: "2024-02-22",
    status: "In Progress",
  },
  {
    key: "WC003",
    id: "WC003",
    orderId: "OD1232",
    customer: "Bell Smith",
    phone: "0773456789",
    issueType: "Prescription Error",
    claimDate: "2024-02-20",
    status: "Resolved",
  },
];
 
const issueTagColor = {
  "Lens Damage": "cyan",
  "Frame Damage": "blue",
  "Prescription Error": "purple",
};
 
const statusMap = {
  Pending: { color: "warning", icon: <ClockCircleOutlined />, antStatus: "warning" },
  "In Progress": { color: "processing", icon: <SyncOutlined spin />, antStatus: "processing" },
  Resolved: { color: "success", icon: <CheckCircleOutlined />, antStatus: "success" },
};
 
export default function WarrantyClaim() {
  const [claims, setClaims] = useState(initialClaims);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
 
  const handleStart = (id) => {
    setClaims(cs =>
      cs.map(c => c.id === id ? { ...c, status: "In Progress" } : c)
    );
  };
 
  const handleAdd = (values) => {
    const newClaim = {
      key: "WC" + Date.now(),
      id: "WC" + String(Date.now()).slice(-4),
      orderId: values.orderId,
      customer: values.customer,
      phone: values.phone,
      issueType: values.issueType,
      claimDate: values.claimDate.format("YYYY-MM-DD"),
      status: "Pending",
    };
    setClaims(cs => [...cs, newClaim]);
    setModalOpen(false);
    form.resetFields();
  };
 
  const columns = [
    {
      title: "Claim ID",
      dataIndex: "id",
      key: "id",
      render: (id, record) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 700 }}
          onClick={() => setDetailRecord(record)}
        >
          {id}
        </Button>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.phone}</Text>
        </Space>
      ),
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      key: "issueType",
      render: (type) => (
        <Tag color={issueTagColor[type] || "default"} style={{ borderRadius: 20, fontWeight: 600 }}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Claim Date",
      dataIndex: "claimDate",
      key: "claimDate",
      render: (d) => <Text style={{ fontSize: 13 }}>{d}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const cfg = statusMap[status] || {};
        return (
          <Badge
            status={cfg.antStatus}
            text={
              <Tag
                icon={cfg.icon}
                color={cfg.color}
                style={{ borderRadius: 20, fontWeight: 600, marginLeft: 4 }}
              >
                {status}
              </Tag>
            }
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="View Details">
          </Tooltip>
          {record.status === "Pending" && (
            <Tooltip title="Start processing this claim">
              <Button
                size="small"
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record.id)}
              >
                Start
              </Button>
            </Tooltip>
          )}
          {record.status !== "Resolved" && (
            <Tooltip title="Update claim">
              <Button
                size="small"
                icon={<FileTextOutlined />}
              >
                Update
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];
 
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1d6df0",
          borderRadius: 10,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        },
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { background: #f4f6fb !important; }
        .ant-table-thead > tr > th {
          background: #f8f9fb !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #6b7280 !important;
          letter-spacing: 0.3px !important;
        }
        .ant-table-row:hover > td { background: #f9fafb !important; }
        .claim-card { box-shadow: 0 2px 16px rgba(0,0,0,0.07) !important; border-radius: 16px !important; border: none !important; }
        .stat-card { border-radius: 12px !important; border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.05) !important; }
      `}</style>
 
      <div style={{ minHeight: "100vh", background: "#f4f6fb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
 
          {/* Header */}
          <Card className="claim-card" style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Space align="center">
                <FileProtectOutlined style={{ fontSize: 24, color: "#1d6df0" }} />
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>
                  Warranty Claims
                </Title>
              </Space>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                style={{ fontWeight: 700, borderRadius: 10 }}
              >
                New Claim
              </Button>
            </div>
          </Card>
 
          {/* Policy Banner */}
          <Alert
            message={<Text strong style={{ color: "#1e3a6e" }}>Warranty Policy</Text>}
            description="Frames: 2 years warranty | Lenses: 1 year warranty. Coverage is for manufacturing defects only. Physical damage, misuse, or accidental damage is not covered."
            type="info"
            icon={<InfoCircleFilled style={{ color: "#1d6df0" }} />}
            showIcon
            style={{
              marginBottom: 20,
              borderRadius: 12,
              border: "1px solid #c3d8fd",
              background: "#eef4ff",
            }}
          />
 
          {/* Table Card */}
          <Card className="claim-card" style={{ marginBottom: 20 }}>
            <Table
              columns={columns}
              dataSource={claims}
              pagination={false}
              rowKey="key"
              size="middle"
            />
          </Card>
        </div>
      </div>
 
      {/* New Claim Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined style={{ color: "#1d6df0" }} />
            <span style={{ fontWeight: 700 }}>New Warranty Claim</span>
          </Space>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Add Claim"
        okButtonProps={{ style: { fontWeight: 700 } }}
        cancelButtonProps={{ style: { fontWeight: 600 } }}
        width={440}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <Divider style={{ margin: "12px 0" }} />
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
          requiredMark={false}
        >
          <Form.Item label="Customer Name" name="customer" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. John Doe" />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone">
            <Input placeholder="e.g. 0771234567" />
          </Form.Item>
          <Form.Item label="Order ID" name="orderId" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="e.g. OD1234" />
          </Form.Item>
          <Form.Item label="Issue Type" name="issueType" rules={[{ required: true }]} initialValue="Lens Damage">
            <Select>
              <Select.Option value="Lens Damage">Lens Damage</Select.Option>
              <Select.Option value="Frame Damage">Frame Damage</Select.Option>
              <Select.Option value="Prescription Error">Prescription Error</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Claim Date" name="claimDate" rules={[{ required: true, message: "Required" }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
 
      
 
      {/* Help Button */}
      <div style={{ position: "fixed", bottom: 28, right: 28 }}>
        <Tooltip title="Help & Support">
          <Button
            shape="circle"
            size="large"
            icon={<QuestionCircleOutlined />}
            style={{
              width: 48, height: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              background: "#fff", border: "none", fontSize: 20,
            }}
          />
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}
 
