import { useState } from "react";
import {
  Table, Button, Tag, Badge, Typography, Space, Card,
  Modal, Input, Select, Alert, Tooltip, ConfigProvider, message, Form,
} from "antd";
import {
  PlusOutlined, PlayCircleOutlined, FileTextOutlined, InfoCircleFilled,
  ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, FileProtectOutlined,
  QuestionCircleOutlined, CloseOutlined, CloseCircleFilled, HistoryOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const descMax = 500;

// GraphQL Queries

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
          }
        }
      }
    }
  }
`;

const GET_WARRANTY_CLAIMS = gql`
  query GetWarrantyClaims {
    complaintCollection(orderBy: { created_at: DescNullsLast }) {
      edges {
        node {
          id
          created_at
          complaint
          complaint_status {
            id
            status
          }
          order {
            id
            clinic_attend_customer {
              customer_has_branch {
                customer {
                  first_name
                  last_name
                  contact_no
                }
              }
            }
          }
        }
      }
    }
  }
`;

const GET_COMPLAINT_STATUSES = gql`
  query GetComplaintStatuses {
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

//  Mutations 
const INSERT_COMPLAINT = gql`
  mutation InsertComplaint(
    $orderId: BigInt!
    $complaint: String!
    $statusId: BigInt!
  ) {
    insertIntocomplaintCollection(
      objects: {
        order_id: $orderId
        complaint: $complaint
        complaint_status_id: $statusId
      }
    ) {
      records {
        id
        complaint
        complaint_status {
          id
          status
        }
      }
    }
  }
`;

const UPDATE_COMPLAINT_STATUS = gql`
  mutation UpdateComplaintStatus($claimId: BigInt!, $statusId: BigInt!) {
    updatecomplaintCollection(
      set: { complaint_status_id: $statusId }
      filter: { id: { eq: $claimId } }
    ) {
      records {
        id
        complaint_status {
          id
          status
        }
      }
    }
  }
`;


const issueTagColor = {
  "Lens Damage": "cyan",
  "Frame Damage": "blue",
  "Prescription Error": "purple",
  Other: "default",
};

function getStatusCfg(status = "") {
  const s = status.toLowerCase();
  if (s.includes("progress"))
    return { color: "processing", icon: <SyncOutlined spin />, antStatus: "processing" };
  if (s.includes("resolv") || s.includes("complet"))
    return { color: "success", icon: <CheckCircleOutlined />, antStatus: "success" };
  // default → Pending
  return { color: "warning", icon: <ClockCircleOutlined />, antStatus: "warning" };
}

const prevClaimColors = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("progress")) return { bg: "#E6F4FF", text: "#0958D9", border: "#91CAFF" };
  if (s.includes("resolv"))   return { bg: "#F6FFED", text: "#389E0D", border: "#B7EB8F" };
  return                               { bg: "#FFF7E6", text: "#D46B08", border: "#FFD591" };
};

function parseOrderNode(node) {
  const customer =
    node?.clinic_attend_customer?.customer_has_branch?.customer;
  return {
    orderId:        `OD${node.id}`,
    rawId:          node.id,
    customer:       `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
    phone:          customer?.contact_no ?? "",
    warrantyFor:    "—",
    warrantyMonths: node?.warranty?.month ?? 0,
    orderDate:      node.placed_at,
  };
}

// Update Status Modal

function UpdateStatusModal({ open, onClose, claim, statuses, onSuccess }) {
  const [form] = Form.useForm();
  const [updateStatus, { loading }] = useMutation(UPDATE_COMPLAINT_STATUS);

  if (!claim) return null;

  const handleSave = async (values) => {
    try {
      await updateStatus({
        variables: { claimId: claim.rawId, statusId: values.statusId },
      });
      message.success("Claim status updated");
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
          <span style={{ fontWeight: 700 }}>Update Claim — {claim.id}</span>
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
        <Form.Item label="Issue">
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
  const [claimError, setClaimError]           = useState("");
  const [canSubmit, setCanSubmit]             = useState(false);
  const [messageApi, contextHolder]           = message.useMessage();

  // ── Queries ──
  const { data: orderData, loading: orderLoading, error: orderError } = useQuery(GET_ORDERS);

  const {data: claimsData, loading: claimsLoading, error: claimsError,
    refetch: refetchClaims,} = useQuery(GET_WARRANTY_CLAIMS, { fetchPolicy: "network-only" });

  const { data: statusData } = useQuery(GET_COMPLAINT_STATUSES);

  // ── Derived data ──
  const statuses = (statusData?.complaint_statusCollection?.edges ?? []).map(
    (e) => e.node
  );

  // Resolve the "Pending" status ID dynamically
  const pendingStatus = statuses.find((s) =>
    s.status?.toLowerCase().includes("pending")
  );

  // Resolve "In Progress" status ID for the Start button
  const inProgressStatus = statuses.find((s) =>
    s.status?.toLowerCase().includes("progress")
  );

  const claims = (claimsData?.complaintCollection?.edges ?? []).map(({ node }) => {
    const customer =
      node?.order?.clinic_attend_customer?.customer_has_branch?.customer;
    return {
      key:         `DB-${node.id}`,
      rawId:       node.id,
      rawStatusId: node.complaint_status?.id,
      id:          `WC${node.id}`,
      orderId:     `OD${node.order?.id}`,
      customer:    `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
      phone:       customer?.contact_no ?? "",
      issueType:   node.complaint,
      claimDate:   node.created_at?.split("T")[0] ?? "",
      status:      node.complaint_status?.status ?? "Pending",
    };
  });

  const previousClaims = selectedOrderId
    ? claims.filter((c) => c.orderId === selectedOrderId)
    : [];

  // ── Mutations ──
  const [insertComplaint, { loading: submitting }] = useMutation(INSERT_COMPLAINT, {
    onCompleted: () => {
      messageApi.success("Warranty claim submitted successfully");
      refetchClaims();
      handleCloseModal();
    },
    onError: (err) => {
      console.error(err);
      messageApi.error("Failed to submit claim: " + err.message);
    },
  });

  const [updateStatus] = useMutation(UPDATE_COMPLAINT_STATUS, {
    onCompleted: () => {
      messageApi.success("Claim moved to In Progress");
      refetchClaims();
    },
    onError: (err) => {
      console.error(err);
      messageApi.error("Failed to update status");
    },
  });

  // ── Handlers ──
  const handleOrderChange = (value) => {
    setSelectedOrderId(value);
    setSelectedOrder(null);
    setClaimError("");
    setCanSubmit(false);

    const node = orderData?.orderCollection?.edges?.find(
      ({ node }) => `OD${node.id}` === value
    )?.node;
    if (!node) return;

    const order = parseOrderNode(node);
    setSelectedOrder(order);

    // Active claim check
    const activeClaim = claims.find(
      (c) =>
        c.orderId === value &&
        !c.status?.toLowerCase().includes("resolv")
    );
    if (activeClaim) {
      setClaimError(
        `This order already has a ${activeClaim.status} warranty claim (${activeClaim.id}).`
      );
      return;
    }

    // Warranty expiry check
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

  const handleSubmitClaim = async () => {
    if (!selectedOrder || !issueType || !description.trim()) {
      messageApi.error("Please fill all required fields");
      return;
    }
    if (!pendingStatus) {
      messageApi.error("Could not resolve default status. Please try again.");
      return;
    }

    // Combine issueType + description into the complaint text
    const complaintText = `[${issueType}] ${description.trim()}`;

    await insertComplaint({
      variables: {
        orderId:  selectedOrder.rawId,
        complaint: complaintText,
        statusId: pendingStatus.id,
      },
    });
  };

  const handleStart = async (record) => {
    if (!inProgressStatus) {
      messageApi.error("Could not resolve 'In Progress' status.");
      return;
    }
    await updateStatus({
      variables: { claimId: record.rawId, statusId: inProgressStatus.id },
    });
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

  // ── Table columns ──
  const columns = [
    {
      title: "Claim ID",
      dataIndex: "id",
      render: (id) => <Text strong>{id}</Text>,
      width: 100,
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      render: (v) => <Text strong>{v}</Text>,
      width: 100,
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
      width: 200,
      render: (text) => {
        // Extract the issue tag from "[Lens Damage] description…" format
        const match = text?.match(/^\[(.+?)\]/);
        const tag   = match ? match[1] : text;
        const rest  = match ? text.slice(match[0].length).trim() : null;
        return (
          <Space direction="vertical" size={2}>
            <Tag
              color={issueTagColor[tag] || "default"}
              style={{ borderRadius: 20, fontWeight: 600 }}
            >
              {tag}
            </Tag>
            {rest && (
              <Text type="secondary" style={{ fontSize: 11 }} ellipsis={{ tooltip: rest }}>
                {rest.length > 40 ? rest.slice(0, 40) + "…" : rest}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Claim Date",
      dataIndex: "claimDate",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      render: (status) => {
        const cfg = getStatusCfg(status);
        return (
          <Badge
            status={cfg.antStatus}
            text={
              <Tag
                icon={cfg.icon}
                color={cfg.color}
                style={{ borderRadius: 20, fontWeight: 600 }}
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

  if (orderError) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="error"
          showIcon
          message="Failed to load orders"
          description={orderError.message}
        />
      </div>
    );
  }

  // ── Render ──
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#1d6df0", borderRadius: 10 } }}>
      {contextHolder}

      <div style={{ minHeight: "100vh", background: "#f4f6fb", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
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

          {/* Policy */}
          <Alert
            message="Warranty Policy"
            description="Warranty period is determined by the warranty configuration attached to each order."
            type="info"
            showIcon
            icon={<InfoCircleFilled />}
            style={{ marginBottom: 20, borderRadius: 12 }}
          />

          {/* Table */}
          <Card style={{ borderRadius: 16 }}>
            {claimsError && (
              <Alert
                type="error"
                showIcon
                message="Failed to load warranty claims"
                description={claimsError.message}
                style={{ marginBottom: 16, borderRadius: 8 }}
              />
            )}
            <Table
              columns={columns}
              dataSource={claims}
              pagination={{ pageSize: 10 }}
              rowKey="key"
              loading={claimsLoading}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </div>
      </div>

      {/* ── New Claim Modal ── */}
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
        {/* Modal header */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-gray-100">
          <span className="text-lg font-semibold text-gray-800 tracking-tight">
            + Submit New Warranty Claim
          </span>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Order select */}
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

          {/* Previous claims */}
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
                      const colors = prevClaimColors(claim.status);
                      return (
                        <div
                          key={claim.id}
                          className="bg-white rounded-lg p-3 border border-red-100 shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-blue-600 font-semibold text-sm">
                              {claim.id}
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {claimError && (
            <Alert
              type="error"
              showIcon
              message={claimError}
              style={{ borderRadius: 8 }}
            />
          )}

          {/* Customer info (auto-filled) */}
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

          {/* Warranty info (auto-filled) */}
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
                  readOnly
                  size="large"
                />
              </div>
            </div>
          )}

          {/* Issue type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="text-red-500 mr-0.5">*</span> Issue Type
            </label>
            <Select
              placeholder="Select issue type"
              value={issueType}
              onChange={setIssueType}
              className="w-full"
              size="large"
              disabled={!canSubmit}
            >
              <Option value="Lens Damage">Lens Damage</Option>
              <Option value="Frame Damage">Frame Damage</Option>
              <Option value="Prescription Error">Prescription Error</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>

          {/* Description */}
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
                disabled={!canSubmit}
                style={{ paddingBottom: "28px" }}
              />
              <span className="absolute bottom-2 right-3 text-xs text-gray-400 select-none">
                {description.length} / {descMax}
              </span>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 px-6 pb-5 pt-1">
          <Button size="large" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={!canSubmit || !issueType || !description.trim()}
            loading={submitting}
            onClick={handleSubmitClaim}
          >
            Submit Claim
          </Button>
        </div>
      </Modal>

      {/* ── Update Status Modal ── */}
      <UpdateStatusModal
        open={updateModal.open}
        claim={updateModal.claim}
        statuses={statuses}
        onClose={() => setUpdateModal({ open: false, claim: null })}
        onSuccess={refetchClaims}
      />

      {/* Help button */}
      <div style={{ position: "fixed", bottom: 28, right: 28 }}>
        <Tooltip title="Help & Support">
          <Button shape="circle" size="large" icon={<QuestionCircleOutlined />} />
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}