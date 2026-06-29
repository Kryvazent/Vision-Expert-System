import { useState, useMemo } from "react";
import {
  Table, Button, Tag, Badge, Typography, Space, Card,
  Modal, Input, Select, Alert, Tooltip, ConfigProvider, message, Form,
} from "antd";
import {
  PlusOutlined, PlayCircleOutlined, FileTextOutlined, InfoCircleFilled,
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, FileProtectOutlined,
  QuestionCircleOutlined, CloseOutlined, CloseCircleFilled, HistoryOutlined,
  EditOutlined, SearchOutlined,
} from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const descMax = 500;



const ISSUE_TYPES = ["Frame Damage", "Lens Damage", "Prescription Error", "Other"];

// Resolve which order column governs expiry for a given issue type.
function getCoverageMonths(order, issueType) {
  if (issueType === "Frame Damage") return order?.frameWarrantyMonths ?? 0;
  // Lens Damage, Prescription Error, and Other all fall back to the lens
  // coverage column — there's no dedicated column for the latter two.
  return order?.lenseWarrantyMonths ?? 0;
}

const GET_ORDERS = gql`
  query GetOrders {
    orderCollection(orderBy: { placed_at: DescNullsLast }) {
      edges {
        node {
          id
          placed_at
          frame_warranty_month
          lense_warranty_month
          clinic_attend_customer {
            customer_has_branch {
              customer {
                first_name
                last_name
                contact_no
              }
            }
          }
          warrantyCollection {
            edges {
              node {
                id
                created_at
                Issue_type
                description
                status_id
              }
            }
          }
        }
      }
    }
  }
`;


//server-side filtered query)
const GET_ORDER_BY_ID = gql`
  query GetOrderById($orderId: BigInt!) {
    orderCollection(filter: { id: { eq: $orderId } }) {
      edges {
        node {
          id
          placed_at
          frame_warranty_month
          lense_warranty_month
          clinic_attend_customer {
            customer_has_branch {
              customer {
                first_name
                last_name
                contact_no
              }
            }
          }
          warrantyCollection {
            edges {
              node {
                id
                created_at
                Issue_type
                description
                status_id
              }
            }
          }
        }
      }
    }
  }
`;

const GET_STATUSES = gql`
  query GetStatuses {
    complaint_statusCollection {
      edges {
        node {
          id
          status
        }
      }
    }
  }
`;


const INSERT_WARRANTY_CLAIM = gql`
  mutation InsertWarrantyClaim(
    $orderId: BigInt!
    $issueType: String!
    $description: String!
    $statusId: BigInt!
  ) {
    insertIntowarrantyCollection(
      objects: {
        order_id: $orderId
        Issue_type: $issueType
        description: $description
        status_id: $statusId
      }
    ) {
      records {
        id
        Issue_type
        status_id
      }
    }
  }
`;

const UPDATE_WARRANTY_STATUS = gql`
  mutation UpdateWarrantyStatus($warrantyId: BigInt!, $statusId: BigInt!) {
    updatewarrantyCollection(
      set: { status_id: $statusId }
      filter: { id: { eq: $warrantyId } }
    ) {
      records {
        id
        status_id
      }
    }
  }
`;

const issueTagColor = {
  "Lens Damage":        "cyan",
  "Frame Damage":       "blue",
  "Prescription Error": "purple",
  Other:                "default",
};

function getStatusCfg(status = "") {
  const s = status.toLowerCase();
  if (s.includes("progress"))
    return { color: "processing", icon: <SyncOutlined spin />, antStatus: "processing" };
  if (s.includes("resolv") || s.includes("complet"))
    return { color: "success", icon: <CheckCircleOutlined />, antStatus: "success" };
  return { color: "warning", icon: <ClockCircleOutlined />, antStatus: "warning" };
}

const prevClaimColors = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("progress")) return { bg: "#E6F4FF", text: "#0958D9", border: "#91CAFF" };
  if (s.includes("resolv"))   return { bg: "#F6FFED", text: "#389E0D", border: "#B7EB8F" };
  return                               { bg: "#FFF7E6", text: "#D46B08", border: "#FFD591" };
};

function parseOrderNode(node) {
  const customer = node?.clinic_attend_customer?.customer_has_branch?.customer;
  return {
    orderId:             `OD${node.id}`,
    rawId:               node.id,
    customer:            `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
    phone:               customer?.contact_no ?? "",
    frameWarrantyMonths: node.frame_warranty_month ?? 0,
    lenseWarrantyMonths:  node.lense_warranty_month ?? 0,
    orderDate:           node.placed_at,
  };
}

// Flatten an order node + ALL of its warranty (claim) rows into one row
// per claim, for the main table. An order with 3 claims produces 3 rows.
function buildClaimRows(node, statusById) {
  const customer = node?.clinic_attend_customer?.customer_has_branch?.customer;
  const customerName = `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim();
  const phone = customer?.contact_no ?? "";
  const claims = node?.warrantyCollection?.edges ?? [];

  return claims.map(({ node: w }) => ({
    key:            `W-${w.id}`,
    rawOrderId:     node.id,
    orderId:        `OD${node.id}`,
    orderDate:      node.placed_at,
    customer:       customerName,
    phone:          phone,
    warrantyId:     w.id,
    rawStatusId:    w.status_id ?? null,
    issueType:      w.Issue_type ?? "—",
    description:    w.description ?? "",
    status:         w.status_id != null ? (statusById.get(w.status_id) ?? null) : null,
    claimDate:      w.created_at?.split("T")[0] ?? "",
    frameWarrantyMonths: node.frame_warranty_month ?? 0,
    lenseWarrantyMonths:  node.lense_warranty_month ?? 0,
  }));
}

function UpdateStatusModal({ open, onClose, claim, statuses, onSuccess }) {
  const [form] = Form.useForm();
  const [updateWarrantyStatus, { loading }] = useMutation(UPDATE_WARRANTY_STATUS);

  if (!claim) return null;

  const handleSave = async (values) => {
    try {
      await updateWarrantyStatus({
        variables: { warrantyId: claim.warrantyId, statusId: values.statusId },
      });
      message.success("Warranty status updated");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update status");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title={
        <Space>
          <EditOutlined style={{ color: "#1d6df0" }} />
          <span style={{ fontWeight: 700 }}>Update Warranty — W{claim.warrantyId}</span>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ statusId: claim.rawStatusId }}
        onFinish={handleSave}
        style={{ marginTop: 16 }}
      >
        <Form.Item label="Customer">
          <Input value={claim.customer} readOnly size="large" />
        </Form.Item>
        <Form.Item label="Issue Type">
          <Input value={claim.issueType} readOnly size="large" />
        </Form.Item>
        <Form.Item
          label="New Status"
          name="statusId"
          rules={[{ required: true, message: "Select a status" }]}
        >
          <Select size="large" placeholder="Select status">
            {statuses.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.status}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ background: "#1d6df0" }}
          >
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

export default function WarrantyClaim() {
  const [modalOpen, setModalOpen]             = useState(false);
  const [updateModal, setUpdateModal]         = useState({ open: false, claim: null });
  const [issueType, setIssueType]             = useState(null);
  const [description, setDescription]         = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [issueError, setIssueError]           = useState("");
  const [orderError, setOrderError]           = useState("");
  const [messageApi, contextHolder]           = message.useMessage();

  // ── Search state ──
  const [searchField, setSearchField] = useState("orderId");
  const [searchTerm, setSearchTerm]   = useState("");
  const [appliedSearch, setAppliedSearch] = useState(null); // { field, term } | null

  const {
    data: orderData,
    loading: orderLoading,
    error: orderQueryError,
    refetch: refetchOrders,
  } = useQuery(GET_ORDERS, { fetchPolicy: "network-only" });

  const [
    searchOrderById,
    { data: searchData, loading: searchLoading, error: searchError },
  ] = useLazyQuery(GET_ORDER_BY_ID, { fetchPolicy: "network-only" });

  const { data: statusData } = useQuery(GET_STATUSES);

  const statuses = (statusData?.complaint_statusCollection?.edges ?? []).map((e) => e.node);

  const pendingStatus    = statuses.find((s) => s.status?.toLowerCase().includes("pending"));
  const inProgressStatus = statuses.find((s) => s.status?.toLowerCase().includes("progress"));

  const statusById = useMemo(() => {
    const map = new Map();
    statuses.forEach((s) => map.set(s.id, s.status));
    return map;
  }, [statuses]);

  // One row per CLAIM (not per order) — an order with multiple claims
  // contributes multiple rows.
  const warranties = useMemo(() => {
    const edges = orderData?.orderCollection?.edges ?? [];
    return edges.flatMap(({ node }) => buildClaimRows(node, statusById));
  }, [orderData, statusById]);

  // ── Search results ──
  const orderIdSearchResults = useMemo(() => {
    if (appliedSearch?.field !== "orderId") return null;
    const edges = searchData?.orderCollection?.edges ?? [];
    return edges.flatMap(({ node }) => buildClaimRows(node, statusById));
  }, [appliedSearch, searchData, statusById]);

  const customerNameSearchResults = useMemo(() => {
    if (appliedSearch?.field !== "customerName") return null;
    const needle = appliedSearch.term.trim().toLowerCase();
    if (!needle) return warranties;
    return warranties.filter((w) => w.customer.toLowerCase().includes(needle));
  }, [appliedSearch, warranties]);

  const tableData = appliedSearch
    ? (appliedSearch.field === "orderId" ? orderIdSearchResults : customerNameSearchResults) ?? []
    : warranties;

  const tableLoading = appliedSearch?.field === "orderId" ? searchLoading : orderLoading;

  // History of existing claims for the selected order. Now that only one
  // claim is allowed per order (enforced by a UNIQUE constraint on
  // warranty.order_id), any existing claim blocks a new submission.
  const previousClaims = selectedOrderId
    ? warranties.filter((w) => w.orderId === selectedOrderId)
    : [];

  const hasExistingClaim = previousClaims.length > 0;

  // Expiry is evaluated against whichever coverage column applies to the
  // chosen Issue Type — so it can only be computed once an issue type is
  // selected.
  const isExpired = useMemo(() => {
    if (!selectedOrder || !issueType) return false;
    const months = getCoverageMonths(selectedOrder, issueType);
    const expiry = new Date(selectedOrder.orderDate);
    expiry.setMonth(expiry.getMonth() + months);
    return new Date() > expiry;
  }, [selectedOrder, issueType]);

  const canSubmit =
    !!selectedOrder &&
    !!issueType &&
    !hasExistingClaim &&
    !isExpired &&
    description.trim().length > 0;

  const [insertWarrantyClaim, { loading: submitting }] = useMutation(INSERT_WARRANTY_CLAIM, {
    onCompleted: () => {
      messageApi.success("Warranty claim submitted successfully");
      refetchOrders();
      handleCloseModal();
    },
    onError: (err) => {
      console.error(err);
      messageApi.error("Failed to submit claim: " + err.message);
    },
  });

  const [updateWarrantyStatus] = useMutation(UPDATE_WARRANTY_STATUS, {
    onCompleted: () => {
      messageApi.success("Warranty moved to In Progress");
      refetchOrders();
    },
    onError: (err) => {
      console.error(err);
      messageApi.error("Failed to update status");
    },
  });

  // ── Search handlers ──
  const handleRunSearch = () => {
    const term = searchTerm.trim();
    if (!term) {
      messageApi.error("Enter a value to search for");
      return;
    }

    if (searchField === "orderId") {
      const digits = term.replace(/\D/g, "");
      if (!digits) {
        messageApi.error("Enter a valid Order ID, e.g. OD42");
        return;
      }
      setAppliedSearch({ field: "orderId", term });
      searchOrderById({ variables: { orderId: digits } });
    } else {
      setAppliedSearch({ field: "customerName", term });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearch(null);
  };

  const handleOrderChange = (value) => {
    setSelectedOrderId(value);
    setSelectedOrder(null);
    setIssueType(null);
    setIssueError("");
    setOrderError("");

    const node = orderData?.orderCollection?.edges?.find(
      ({ node }) => `OD${node.id}` === value
    )?.node;
    if (!node) return;

    setSelectedOrder(parseOrderNode(node));

    // One claim per order: `warranties` is derived straight from the
    // already-loaded query data, so it's safe to check synchronously
    // here rather than waiting on `previousClaims` to recompute on the
    // next render.
    const existing = warranties.filter((w) => w.orderId === value);
    if (existing.length > 0) {
      setOrderError(
        `This order already has a warranty claim on file (W${existing[0].warrantyId}, status: ${existing[0].status ?? "Pending"}). Only one claim is allowed per order.`
      );
    }
  };

  const handleIssueTypeChange = (value) => {
    setIssueType(value);
    setIssueError("");

    if (!selectedOrder) return;

    const months = getCoverageMonths(selectedOrder, value);
    const expiry = new Date(selectedOrder.orderDate);
    expiry.setMonth(expiry.getMonth() + months);

    if (new Date() > expiry) {
      setIssueError(
        `Warranty for "${value}" has expired. Coverage was ${months} month${months !== 1 ? "s" : ""}, ending ${expiry.toLocaleDateString()}.`
      );
    }
  };

  const handleSubmitClaim = async () => {
    if (!selectedOrder || !issueType || !description.trim()) {
      messageApi.error("Please fill all required fields");
      return;
    }
    if (hasExistingClaim) {
      messageApi.error("This order already has a warranty claim on file.");
      return;
    }
    if (isExpired) {
      messageApi.error("Warranty period has expired for this issue type.");
      return;
    }
    if (!pendingStatus) {
      messageApi.error("Could not resolve default status. Please try again.");
      return;
    }

    await insertWarrantyClaim({
      variables: {
        orderId:     selectedOrder.rawId,
        issueType:   issueType,
        description: description.trim(),
        statusId:    pendingStatus.id,
      },
    });
  };

  const handleStart = async (record) => {
    if (!inProgressStatus) {
      messageApi.error("Could not resolve 'In Progress' status.");
      return;
    }
    await updateWarrantyStatus({
      variables: { warrantyId: record.warrantyId, statusId: inProgressStatus.id },
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setSelectedOrderId(null);
    setIssueType(null);
    setDescription("");
    setIssueError("");
    setOrderError("");
  };

  const columns = [
    {
      title: "Warranty ID",
      dataIndex: "warrantyId",
      render: (id) => <Text strong>W{id}</Text>,
      width: 110,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      render: (v) => <Text strong>{v}</Text>,
      width: 110,
    },
    {
      title: "Customer",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.customer}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.phone}</Text>
        </Space>
      ),
      width: 180,
    },
    {
      title: "Issue Type",
      dataIndex: "issueType",
      width: 180,
      render: (tag) => (
        <Tag
          color={issueTagColor[tag] || "default"}
          style={{ borderRadius: 20, fontWeight: 600 }}
        >
          {tag}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      width: 240,
      render: (text) => (
        <Text
          type="secondary"
          style={{ fontSize: 13 }}
          ellipsis={{ tooltip: text }}
        >
          {text && text.length > 50 ? text.slice(0, 50) + "…" : (text || "—")}
        </Text>
      ),
    },
    {
      title: "Claim Date",
      dataIndex: "claimDate",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 160,
      render: (status) => {
        const cfg = getStatusCfg(status ?? "");
        return (
          <Badge
            status={cfg.antStatus}
            text={
              <Tag
                icon={cfg.icon}
                color={cfg.color}
                style={{ borderRadius: 20, fontWeight: 600 }}
              >
                {status ?? "Pending"}
              </Tag>
            }
          />
        );
      },
    },
    {
      title: "Actions",
      width: 160,
      render: (_, record) => {
        const isResolved = record.status?.toLowerCase().includes("resolv");
        const isPending  = record.status?.toLowerCase().includes("pending");
        return (
          <Space>
            {isPending && (
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record)}
                style={{ background: "#1d6df0" }}
              >
                Start
              </Button>
            )}
            {!isResolved && (
              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => setUpdateModal({ open: true, claim: record })}
              >
                Update
              </Button>
            )}
            {isResolved && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Resolved
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  if (orderQueryError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          message="Failed to load orders"
          description={orderQueryError.message}
        />
      </div>
    );
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1d6df0", borderRadius: 10 } }}>
      {contextHolder}

      <div style={{ minHeight: "100vh", background: "#f4f6fb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          <Card style={{ marginBottom: 20, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space>
                <FileProtectOutlined style={{ fontSize: 24, color: "#1d6df0" }} />
                <Title level={4} style={{ margin: 0 }}>Warranty Claims</Title>
              </Space>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                New Claim
              </Button>
            </div>
          </Card>

          <Alert
            message="Warranty Policy"
            description="Frame damage and lens damage have separate coverage periods set on each order. Prescription error and other issues use the lens coverage period. Only one warranty claim is allowed per order."
            type="info"
            showIcon
            icon={<InfoCircleFilled />}
            style={{ marginBottom: 20, borderRadius: 12 }}
          />

          {/* ── Search bar ── */}
          <Card style={{ marginBottom: 20, borderRadius: 16 }}>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                value={searchField}
                onChange={(v) => {
                  setSearchField(v);
                  setSearchTerm("");
                }}
                style={{ width: 180 }}
                size="large"
              >
                <Option value="orderId">Order ID</Option>
                <Option value="customerName">Customer Name</Option>
              </Select>
              <Input
                size="large"
                placeholder={
                  searchField === "orderId"
                    ? "e.g. OD42 or 42"
                    : "e.g. John Silva"
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleRunSearch}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleRunSearch}
              >
                Search
              </Button>
              {appliedSearch && (
                <Button size="large" onClick={handleClearSearch}>
                  Clear
                </Button>
              )}
            </Space.Compact>
            {appliedSearch && (
              <div style={{ marginTop: 10 }}>
                <Text type="secondary">
                  Showing results for {appliedSearch.field === "orderId" ? "Order ID" : "Customer Name"}:{" "}
                  <Text strong>{appliedSearch.term}</Text>
                </Text>
              </div>
            )}
            {searchError && (
              <Alert
                type="error"
                showIcon
                message="Search failed"
                description={searchError.message}
                style={{ marginTop: 12, borderRadius: 8 }}
              />
            )}
          </Card>

          <Card style={{ borderRadius: 16 }}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 10 }}
              rowKey="key"
              loading={tableLoading}
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: appliedSearch
                  ? "No matching claims found."
                  : "No warranty claims yet.",
              }}
            />
          </Card>
        </div>
      </div>

      <Modal
        open={modalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        width={560}
        centered
        styles={{
          content: { borderRadius: 12, padding: 0, overflow: "hidden" },
          body: { padding: 0 },
        }}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-100">
          <span className="text-lg font-semibold text-gray-800 tracking-tight">
            + Submit New Warranty Claim
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Order ID (Job No)
            </label>
            <Select
              value={selectedOrderId}
              placeholder="Select Order"
              onChange={handleOrderChange}
              className="w-full"
              size="large"
              loading={orderLoading}
              showSearch
              optionFilterProp="children"
            >
              {orderData?.orderCollection?.edges?.map(({ node }) => {
                const cust =
                  node?.clinic_attend_customer?.customer_has_branch?.customer;
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

          {/* Existing claim on this order — blocks new submissions, since
              only one claim is allowed per order. */}
          {previousClaims.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <CloseCircleFilled className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <HistoryOutlined className="text-gray-500 text-sm" />
                    <span className="text-sm font-semibold text-gray-700">
                      Existing Warranty Claim — New claims not allowed for this order
                    </span>
                  </div>
                  <div className="space-y-3">
                    {previousClaims.map((claim) => {
                      const colors = prevClaimColors(claim.status ?? "");
                      return (
                        <div
                          key={claim.warrantyId}
                          className="bg-white rounded-lg p-3 border border-red-100 shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600 font-semibold text-sm">
                              W{claim.warrantyId}
                            </span>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                                border: `1px solid ${colors.border}`,
                              }}
                            >
                              {claim.status}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {claim.claimDate}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{claim.issueType}</p>
                          {claim.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {claim.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {orderError && (
            <Alert type="error" showIcon message={orderError} style={{ borderRadius: 8 }} />
          )}

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

          {/* Issue type — disabled once a claim already exists for this
              order (one claim per order, enforced). */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Issue Type
            </label>
            <Select
              placeholder="Select issue type"
              value={issueType}
              onChange={handleIssueTypeChange}
              className="w-full"
              size="large"
              disabled={!selectedOrder || hasExistingClaim}
            >
              {ISSUE_TYPES.map((t) => (
                <Option key={t} value={t}>{t}</Option>
              ))}
            </Select>
          </div>

          {/* Coverage period for the chosen issue type, derived from the
              order's frame_warranty_month / lense_warranty_month columns. */}
          {selectedOrder && issueType && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Order Date
                </label>
                <Input
                  value={new Date(selectedOrder.orderDate).toLocaleDateString()}
                  readOnly
                  size="large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Warranty Period
                </label>
                <Input
                  value={(() => {
                    const m = getCoverageMonths(selectedOrder, issueType);
                    return `${m} month${m !== 1 ? "s" : ""}`;
                  })()}
                  readOnly
                  size="large"
                />
              </div>
            </div>
          )}

          {issueError && (
            <Alert type="error" showIcon message={issueError} style={{ borderRadius: 8 }} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Issue Description
            </label>
            <div className="relative">
              <TextArea
                rows={4}
                value={description}
                placeholder="Describe the defect or problem in detail..."
                onChange={(e) => setDescription(e.target.value.slice(0, descMax))}
                disabled={!selectedOrder || hasExistingClaim || !issueType || isExpired}
                style={{ paddingBottom: "28px" }}
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400 select-none">
                {description.length} / {descMax}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-5 pt-1">
          <Button size="large" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={!canSubmit}
            loading={submitting}
            onClick={handleSubmitClaim}
          >
            Submit Claim
          </Button>
        </div>
      </Modal>

      <UpdateStatusModal
        open={updateModal.open}
        claim={updateModal.claim}
        statuses={statuses}
        onClose={() => setUpdateModal({ open: false, claim: null })}
        onSuccess={refetchOrders}
      />

      <div style={{ position: "fixed", bottom: 28, right: 28 }}>
        <Tooltip title="Help & Support">
          <Button shape="circle" size="large" icon={<QuestionCircleOutlined />} />
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}