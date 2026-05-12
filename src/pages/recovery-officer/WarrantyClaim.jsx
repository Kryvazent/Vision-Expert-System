import { useState } from "react";

import {
  Table, Button, Tag, Badge, Typography, Space, Card,
  Modal, Input, Select, Alert, Tooltip, ConfigProvider, message,
} from "antd";

import {
  PlusOutlined, PlayCircleOutlined, FileTextOutlined, InfoCircleFilled,
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, FileProtectOutlined,
  QuestionCircleOutlined, CloseOutlined, CloseCircleFilled, HistoryOutlined,
} from "@ant-design/icons";

import { gql} from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const descMax = 500;

/*
  SCHEMA ANALYSIS:
  ─────────────────────────────────────────────────────────────────
  order
    id, placed_at, warranty_id, clinic_attend_customer_id, ...

  order.clinic_attend_customer_id
    → clinic_attend_customer (id, customer_has_branch_id, clinic_id)
        → customer_has_branch (id, customer_id, branch_id)
              → customer (first_name, last_name, contact_no)

  order.warranty_id
    → warranty (id, month, warranty_for_id)
        → warranty_for (warranty_for)   ← "Frame" / "Lens" / etc.

  order_item
    customer_order_id → customer_order.id   (NOT order.id)
    ∴ order has NO order_itemCollection

  To get product type we must go through customer_order:
    customer_orderCollection (no direct relation from order either)

  ✅ Simplest correct approach:
     Query order + its warranty + customer via clinic_attend_customer.
     Product type is NOT reachable from order in one query,
     so we derive warranty label from warranty_for.warranty_for instead.
  ─────────────────────────────────────────────────────────────────
*/

const GET_ORDERS = gql`
  query GetOrders {
    orderCollection {
      edges {
        node {
          id
          placed_at

          clinic_attend_customer {
            customer_has_branch {
              customer {
                first_name
                last_name
                contact_no
              }
            }
          }

          warranty {
            month
            warranty_for {
              warranty_for
            }
          }
        }
      }
    }
  }
`;

/* =========================================================
   MOCK WARRANTY CLAIMS
========================================================= */

const initialClaims = [
  {
    key: "WC001", id: "WC001", orderId: "OD2",
    customer: "John Doe", phone: "0779876543",
    issueType: "Lens Damage", claimDate: "2024-02-24", status: "Pending",
  },
  {
    key: "WC002", id: "WC002", orderId: "OD5",
    customer: "James Brown", phone: "0772345678",
    issueType: "Frame Damage", claimDate: "2024-02-22", status: "In Progress",
  },
  {
    key: "WC003", id: "WC003", orderId: "OD10",
    customer: "Bell Smith", phone: "0773456789",
    issueType: "Prescription Error", claimDate: "2024-02-20", status: "Resolved",
  },
];

/* =========================================================
   COLORS / STATUS CONFIG
========================================================= */

const issueTagColor = {
  "Lens Damage": "cyan",
  "Frame Damage": "blue",
  "Prescription Error": "purple",
  Other: "default",
};

const statusMap = {
  Pending:       { color: "warning",    icon: <ClockCircleOutlined />, antStatus: "warning"    },
  "In Progress": { color: "processing", icon: <SyncOutlined spin />,   antStatus: "processing" },
  Resolved:      { color: "success",    icon: <CheckCircleOutlined />, antStatus: "success"    },
};

const prevClaimColors = {
  Pending:       { bg: "#FFF7E6", text: "#D46B08", border: "#FFD591" },
  "In Progress": { bg: "#E6F4FF", text: "#0958D9", border: "#91CAFF" },
  Resolved:      { bg: "#F6FFED", text: "#389E0D", border: "#B7EB8F" },
};

/* =========================================================
   HELPER — flatten a GraphQL order node
========================================================= */

function parseOrderNode(node) {
  const customer =
    node?.clinic_attend_customer
      ?.customer_has_branch
      ?.customer;

  const warrantyMonths  = node?.warranty?.month ?? 0;
  const warrantyFor     = node?.warranty?.warranty_for?.warranty_for ?? "Unknown";

  return {
    orderId:        `OD${node.id}`,
    customer:       `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
    phone:          customer?.contact_no ?? "",
    warrantyFor,
    warrantyMonths,
    orderDate:      node.placed_at,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function WarrantyClaim() {
  const [claims, setClaims]                   = useState(initialClaims);
  const [modalOpen, setModalOpen]             = useState(false);
  const [issueType, setIssueType]             = useState(null);
  const [description, setDescription]         = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [claimError, setClaimError]           = useState("");
  const [canSubmit, setCanSubmit]             = useState(false);

  const { data: orderData, loading: orderLoading, error: orderError } =
    useQuery(GET_ORDERS);

  const previousClaims = selectedOrderId
    ? claims.filter((c) => c.orderId === selectedOrderId)
    : [];

  /* =========================================================
     HANDLERS
  ========================================================= */

  const handleStart = (id) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "In Progress" } : c))
    );
    message.success("Claim moved to In Progress");
  };

  const handleOrderChange = (value) => {
    setSelectedOrderId(value);
    setSelectedOrder(null);
    setClaimError("");
    setCanSubmit(false);

    const node = orderData?.orderCollection?.edges
      ?.find(({ node }) => `OD${node.id}` === value)?.node;

    if (!node) return;

    const order = parseOrderNode(node);
    setSelectedOrder(order);

    /* active claim check */
    const activeClaim = claims.find(
      (c) =>
        c.orderId === value &&
        (c.status === "Pending" || c.status === "In Progress")
    );
    if (activeClaim) {
      setClaimError(`This order already has a ${activeClaim.status} warranty claim.`);
      return;
    }

    /* warranty expiry check — using warranty.month from DB */
    const today  = new Date();
    const expiry = new Date(order.orderDate);
    expiry.setMonth(expiry.getMonth() + order.warrantyMonths);

    if (today > expiry) {
      setClaimError(
        `Warranty expired (${order.warrantyFor}, ${order.warrantyMonths} month${order.warrantyMonths !== 1 ? "s" : ""}).`
      );
      return;
    }

    setCanSubmit(true);
  };

  const handleSubmitClaim = () => {
    if (!selectedOrder || !issueType || !description) {
      message.error("Please fill all required fields");
      return;
    }

    const newClaim = {
      key:       "WC" + Date.now(),
      id:        "WC" + String(Date.now()).slice(-4),
      orderId:   selectedOrder.orderId,
      customer:  selectedOrder.customer,
      phone:     selectedOrder.phone,
      issueType,
      claimDate: new Date().toISOString().split("T")[0],
      status:    "Pending",
    };

    setClaims((prev) => [newClaim, ...prev]);
    message.success("Warranty claim submitted successfully");
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setSelectedOrderId(null);
    setIssueType(null);
    setDescription("");
    setClaimError("");
    setCanSubmit(false);
  };

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = [
    {
      title: "Claim ID",
      dataIndex: "id",
      render: (id) => <Text strong>{id}</Text>,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Customer",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.customer}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text>
        </Space>
      ),
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      render: (type) => (
        <Tag color={issueTagColor[type] || "default"}
          style={{ borderRadius: 20, fontWeight: 600 }}>
          {type}
        </Tag>
      ),
    },
    { title: "Claim Date", dataIndex: "claimDate" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const cfg = statusMap[status];
        return (
          <Badge status={cfg.antStatus} text={
            <Tag icon={cfg.icon} color={cfg.color}
              style={{ borderRadius: 20, fontWeight: 600 }}>
              {status}
            </Tag>
          } />
        );
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          {record.status === "Pending" && (
            <Button type="primary" size="small" icon={<PlayCircleOutlined />}
              onClick={() => handleStart(record.id)}>
              Start
            </Button>
          )}
          {record.status !== "Resolved" && (
            <Button size="small" icon={<FileTextOutlined />}>Update</Button>
          )}
        </Space>
      ),
    },
  ];

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (orderError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" showIcon
          message="Failed to load orders"
          description={orderError.message} />
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1d6df0", borderRadius: 10 } }}>
      <div style={{ minHeight: "100vh", background: "#f4f6fb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* HEADER */}
          <Card style={{ marginBottom: 20, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                <FileProtectOutlined style={{ fontSize: 24, color: "#1d6df0" }} />
                <Title level={4} style={{ margin: 0 }}>Warranty Claims</Title>
              </Space>
              <Button type="primary" size="large" icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}>
                New Claim
              </Button>
            </div>
          </Card>

          {/* POLICY */}
          <Alert
            message="Warranty Policy"
            description="Warranty period is determined by the warranty configuration attached to each order."
            type="info" showIcon icon={<InfoCircleFilled />}
            style={{ marginBottom: 20, borderRadius: 12 }}
          />

          {/* TABLE */}
          <Card style={{ borderRadius: 16 }}>
            <Table columns={columns} dataSource={claims} pagination={false} rowKey="key" />
          </Card>
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      <Modal
        open={modalOpen} footer={null} onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />} width={560} centered
        styles={{ content: { borderRadius: 12, padding: 0, overflow: "hidden" }, body: { padding: 0 } }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-100">
          <span className="text-lg font-semibold text-gray-800 tracking-tight">
            + Submit New Warranty Claim
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ORDER SELECT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Order ID (Job No)
            </label>
            <Select
              value={selectedOrderId}
              placeholder="Select Order"
              onChange={handleOrderChange}
              className="w-full" size="large"
              loading={orderLoading}
              showSearch optionFilterProp="children"
            >
              {orderData?.orderCollection?.edges?.map(({ node }) => {
                const cust = node?.clinic_attend_customer?.customer_has_branch?.customer;
                const label = cust
                  ? `${cust.first_name ?? ""} ${cust.last_name ?? ""}`.trim()
                  : "Unknown";
                return (
                  <Option key={node.id} value={`OD${node.id}`}>
                    {`OD${node.id}`} — {label}
                  </Option>
                );
              })}
            </Select>
          </div>

          {/* PREVIOUS CLAIMS */}
          {previousClaims.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <CloseCircleFilled className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <HistoryOutlined className="text-gray-500 text-sm" />
                    <span className="text-sm font-semibold text-gray-700">
                      Previous Warranty Claims Found ({previousClaims.length})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {previousClaims.map((claim) => {
                      const colors = prevClaimColors[claim.status] ?? prevClaimColors["Pending"];
                      return (
                        <div key={claim.id}
                          className="bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600 font-semibold text-sm">{claim.id}</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
                              {claim.status}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">{claim.claimDate}</span>
                          </div>
                          <p className="text-sm text-gray-500">{claim.issueType}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ERROR */}
          {claimError && (
            <Alert type="error" showIcon message={claimError} style={{ borderRadius: 8 }} />
          )}

          {/* CUSTOMER (auto-filled, read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span> Customer Name
              </label>
              <Input value={selectedOrder?.customer ?? ""} readOnly size="large" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="text-red-500 mr-0.5">*</span> Customer Mobile
              </label>
              <Input value={selectedOrder?.phone ?? ""} readOnly size="large" />
            </div>
          </div>

          {/* WARRANTY INFO (auto-filled, read-only) */}
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Warranty For
                </label>
                <Input value={selectedOrder.warrantyFor} readOnly size="large" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Warranty Period
                </label>
                <Input
                  value={`${selectedOrder.warrantyMonths} month${selectedOrder.warrantyMonths !== 1 ? "s" : ""}`}
                  readOnly size="large"
                />
              </div>
            </div>
          )}

          {/* ISSUE TYPE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Issue Type
            </label>
            <Select
              placeholder="Select issue type" value={issueType}
              onChange={setIssueType} className="w-full" size="large"
            >
              <Option value="Lens Damage">Lens Damage</Option>
              <Option value="Frame Damage">Frame Damage</Option>
              <Option value="Prescription Error">Prescription Error</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Issue Description
            </label>
            <div className="relative">
              <TextArea
                rows={4} value={description}
                placeholder="Describe the defect or problem in detail..."
                onChange={(e) => setDescription(e.target.value.slice(0, descMax))}
                style={{ paddingBottom: "28px" }}
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400 select-none">
                {description.length} / {descMax}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-6 pb-5 pt-1">
          <Button size="large" onClick={handleCloseModal}>Cancel</Button>
          <Button type="primary" size="large" disabled={!canSubmit} onClick={handleSubmitClaim}>
            Submit Claim
          </Button>
        </div>
      </Modal>

      {/* HELP */}
      <div style={{ position: "fixed", bottom: 28, right: 28 }}>
        <Tooltip title="Help & Support">
          <Button shape="circle" size="large" icon={<QuestionCircleOutlined />} />
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}