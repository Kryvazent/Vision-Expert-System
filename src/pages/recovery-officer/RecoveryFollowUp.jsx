import { useState, useEffect } from "react";
import {
  Typography, Select, Table, Button,
  InputNumber, Space, message, Tag,
} from "antd";
import { gql } from "@apollo/client";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import dayjs from "dayjs";
import PaymentBill from "../../component/recoveryOfficer/PaymentBill";
import { useAuth } from "../../const/functions";

const { Title, Text } = Typography;
const { Option } = Select;

const PAYMENT_FULL         = "full";
const PAYMENT_PARTIAL      = "partial";
const STATUS_DELIVERED     = "Delivered";
const STATUS_NOT_DELIVERED = "Not Delivered";

// ── GraphQL ───────────────────────────────────────────────────────────────────

const GET_CENTERS = gql`
  query GetCenters {
    clinicCollection {
      edges {
        node {
          id
          venue
        }
      }
    }
  }
`;

// No variable — fetch all follow-up orders, filter by clinic in JS.
// This filter already returns exactly what we need:
//   - payment_type = "partial"  (any partial payment order)
//   - OR payment_type = "full" AND status = "Not Delivered" (full payment, not yet delivered)
const GET_FOLLOWUP_ORDERS = gql`
  query GetFollowUpOrders {
    delivery_orderCollection(
      filter: {
        or: [
          { payment_type: { eq: "partial" } }
          {
            and: [
              { payment_type: { eq: "full" } }
              { status: { eq: "Not Delivered" } }
            ]
          }
        ]
      }
    ) {
      edges {
        node {
          id
          payment_type
          paid_amount
          balance_amount
          payment_received
          status
          order {
            id
            estimated_delivery
            remarks
            clinic_attend_customer {
              clinic {
                id
                venue
              }
              customer_has_branch {
                customer {
                  first_name
                  last_name
                  contact_no
                  address
                }
              }
            }
            paymentCollection {
              edges {
                node {
                  total_payment
                  advance
                }
              }
            }
          }
        }
      }
    }
  }
`;

const UPDATE_DELIVERY_ORDER = gql`
  mutation UpdateDeliveryOrder(
    $id: BigInt!
    $deliveredBy: BigInt!
    $paymentType: String!
    $paidAmount: Float!
    $balanceAmount: Float!
    $paymentReceived: Boolean!
    $status: String!
    $updatedDate: Datetime!
  ) {
    updatedelivery_orderCollection(
      set: {
        delivered_by:     $deliveredBy
        payment_type:     $paymentType
        paid_amount:      $paidAmount
        balance_amount:   $balanceAmount
        payment_received: $paymentReceived
        status:           $status
        updated_date:     $updatedDate
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
        payment_type
        paid_amount
        balance_amount
        status
      }
    }
  }
`;

// ── FollowUpPaymentCell ───────────────────────────────────────────────────────

function FollowUpPaymentCell({
  record,
  rowState,
  onChangeAmount,
  onChangeDeliveryStatus,
}) {
  const state          = rowState[record.deliveryOrderId] ?? {};
  const saved          = state.saved          ?? false;
  const isPartial      = record.originalPaymentType === PAYMENT_PARTIAL;
  const deliveryStatus = state.deliveryStatus ?? STATUS_NOT_DELIVERED;
  const additionalPaid = state.additionalPaid ?? 0;
  const newBalance     = state.newBalance     ?? record.currentBalance;

  // Locked read-only after confirm
  if (saved) {
    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Tag color={isPartial ? "orange" : "blue"} style={{ borderRadius: 20 }}>
          {isPartial ? "Partial Payment" : "Full Payment"}
        </Tag>
        {isPartial ? (
          <>
            <Text style={{ fontSize: 12 }}>
              Paid: <Text strong>Rs. {additionalPaid.toLocaleString()}</Text>
            </Text>
            <Text style={{ fontSize: 12, color: newBalance > 0 ? "#cf1322" : "#389e0d" }}>
              Balance:{" "}
              <Text strong style={{ color: newBalance > 0 ? "#cf1322" : "#389e0d" }}>
                Rs. {newBalance.toLocaleString()}
              </Text>
            </Text>
          </>
        ) : (
          <Tag
            color={deliveryStatus === STATUS_DELIVERED ? "green" : "red"}
            style={{ borderRadius: 20 }}
          >
            {deliveryStatus}
          </Tag>
        )}
        <Tag color="success" style={{ borderRadius: 20, fontSize: 10 }}>✓ Confirmed</Tag>
      </Space>
    );
  }

  // Full + Not Delivered → delivery dropdown
  if (!isPartial) {
    return (
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Select
          value={deliveryStatus}
          size="small"
          style={{ width: "100%" }}
          onChange={(val) => onChangeDeliveryStatus(record.deliveryOrderId, val)}
        >
          <Option value={STATUS_DELIVERED}>Delivered</Option>
          <Option value={STATUS_NOT_DELIVERED}>Not Delivered</Option>
        </Select>
      </Space>
    );
  }

  // Partial → additional amount input + live balance
  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <InputNumber
        size="small"
        min={0}
        max={record.currentBalance}
        value={additionalPaid}
        placeholder="Enter amount paid"
        style={{ width: "100%" }}
        onChange={(val) =>
          onChangeAmount(record.deliveryOrderId, val ?? 0, record.currentBalance)
        }
      />
      <div
        style={{
          background: newBalance > 0 ? "#fff1f0" : "#f6ffed",
          border: `1px solid ${newBalance > 0 ? "#ffa39e" : "#b7eb8f"}`,
          borderRadius: 6,
          padding: "3px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 11, color: "#595959" }}>Balance:</Text>
        <Text strong style={{ fontSize: 12, color: newBalance > 0 ? "#cf1322" : "#389e0d" }}>
          Rs. {newBalance.toLocaleString()}
        </Text>
      </div>
    </Space>
  );
}

// ── RecoveryFollowUp ──────────────────────────────────────────────────────────

function RecoveryFollowUp() {
  const { staff } = useAuth();
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [data,           setData]           = useState([]);
  const [rowState,       setRowState]       = useState({});
  const [savingId,       setSavingId]       = useState(null);
  const [messageApi,     contextHolder]     = message.useMessage();
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [billData,       setBillData]       = useState(null);

  // ── Queries ──
  const { data: centerData, loading: centersLoading } = useQuery(GET_CENTERS);

  const [loadFollowUps, { data: followUpData, loading: followUpLoading }] =
    useLazyQuery(GET_FOLLOWUP_ORDERS, { fetchPolicy: "network-only" });

  const [updateDeliveryOrder] = useMutation(UPDATE_DELIVERY_ORDER);

  const centers = (centerData?.clinicCollection?.edges ?? []).map(({ node }) => ({
    label: node.venue,
    value: Number(node.id),
  }));

  // ── Build rows — filter by selected center only.
  //    (Payment/delivery condition is already applied by the GraphQL query.)
  useEffect(() => {
    if (!followUpData || !selectedCenter) return;

    const rows = [];

    followUpData.delivery_orderCollection.edges.forEach(({ node }) => {
      const order = node.order;
      if (!order) return;

      const clinic = order.clinic_attend_customer?.clinic;

      // Filter by selected center
      if (Number(clinic?.id) !== Number(selectedCenter)) return;

      const customer = order.clinic_attend_customer?.customer_has_branch?.customer;
      const payment  = order.paymentCollection?.edges?.[0]?.node;

      const totalAmount   = payment?.total_payment ?? 0;
      const advanceAmount = payment?.advance       ?? 0;

      rows.push({
        deliveryOrderId:     node.id,
        orderId:             order.id,
        estimatedDelivery:   order.estimated_delivery
          ? dayjs(order.estimated_delivery).format("DD/MM/YYYY")
          : "-",
        customerName:        `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
        phone:               customer?.contact_no ?? "",
        customerAddress:     customer?.address    ?? "",
        totalAmount,
        advanceAmount,
        balanceAmount:       totalAmount - advanceAmount,
        remarks:             order.remarks ?? "",
        originalPaymentType: node.payment_type,
        paidSoFar:           node.paid_amount    ?? 0,
        currentBalance:      node.balance_amount ?? 0,
        currentStatus:       node.status         ?? STATUS_NOT_DELIVERED,
      });
    });

    setData(rows);
  }, [followUpData, selectedCenter]);

  // ── Init rowState ──
  useEffect(() => {
    if (!data.length) return;
    setRowState((prev) => {
      const next = { ...prev };
      data.forEach((record) => {
        const key = record.deliveryOrderId;
        if (!next[key]) {
          next[key] = {
            additionalPaid: 0,
            newBalance:     record.currentBalance,
            deliveryStatus: record.currentStatus,
            saved:          false,
          };
        }
      });
      return next;
    });
  }, [data]);

  // ── Load button handler ──
  const handleLoadOrders = () => {
    if (!selectedCenter) return;
    setData([]);
    setRowState({});
    loadFollowUps();
  };

  // ── Cell handlers ──
  const handleChangeAmount = (id, amount, currentBalance) => {
    if (rowState[id]?.saved) return;
    const additionalPaid = Math.min(amount, currentBalance);
    const newBalance     = Math.max(currentBalance - additionalPaid, 0);
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), additionalPaid, newBalance, saved: false },
    }));
  };

  const handleChangeDeliveryStatus = (id, deliveryStatus) => {
    if (rowState[id]?.saved) return;
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), deliveryStatus, saved: false },
    }));
  };

  const canConfirm = (record) => {
    const state = rowState[record.deliveryOrderId] ?? {};
    if (state.saved) return false;
    if (record.originalPaymentType === PAYMENT_PARTIAL) {
      return (state.additionalPaid ?? 0) > 0;
    }
    return (state.deliveryStatus ?? STATUS_NOT_DELIVERED) === STATUS_DELIVERED;
  };

  const handleConfirm = async (record) => {
    const state     = rowState[record.deliveryOrderId] ?? {};
    const isPartial = record.originalPaymentType === PAYMENT_PARTIAL;

    let newPaymentType, newPaidAmount, newBalance, newStatus, newPaymentReceived;

    if (isPartial) {
      const additionalPaid = state.additionalPaid ?? 0;
      newBalance           = Math.max(record.currentBalance - additionalPaid, 0);
      newPaidAmount        = record.paidSoFar + additionalPaid;
      newPaymentType       = newBalance === 0 ? "full"            : "partial";
      newStatus            = newBalance === 0 ? STATUS_DELIVERED  : STATUS_NOT_DELIVERED;
      newPaymentReceived   = newBalance === 0;
    } else {
      newPaymentType     = "full";
      newPaidAmount      = record.totalAmount;
      newBalance         = 0;
      newStatus          = state.deliveryStatus ?? STATUS_NOT_DELIVERED;
      newPaymentReceived = newStatus === STATUS_DELIVERED;
    }

    setSavingId(record.deliveryOrderId);
    try {
      await updateDeliveryOrder({
        variables: {
          id:              record.deliveryOrderId,
          deliveredBy:     staff.id,
          paymentType:     newPaymentType,
          paidAmount:      newPaidAmount,
          balanceAmount:   newBalance,
          paymentReceived: newPaymentReceived,
          status:          newStatus,
          updatedDate:     dayjs().toISOString(),
        },
      });

      setRowState((prev) => ({
        ...prev,
        [record.deliveryOrderId]: {
          ...(prev[record.deliveryOrderId] ?? {}),
          newBalance,
          saved: true,
        },
      }));

      // Show bill modal after successful save
      setBillData({
        orderId: record.orderId,
        customerName: record.customerName,
        phone: record.phone,
        customerAddress: record.customerAddress,
        totalAmount: record.totalAmount,
        advanceAmount: record.advanceAmount,
        balanceAmount: record.balanceAmount,
        paymentType: isPartial ? "Partial Payment" : "Full Payment",
        paidAmount: isPartial ? (state.additionalPaid ?? 0) : newPaidAmount,
        remainingBalance: newBalance,
        deliveryStatus: newStatus,
        remarks: record.remarks,
      });
      setBillModalVisible(true);

      messageApi.success(`Saved for Order #${record.orderId}`);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to save: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  // ── Columns — same order as RecoverySheet + Est. Delivery + Partial Amount ──
  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Est. Delivery Date",
      dataIndex: "estimatedDelivery",
      key: "estimatedDelivery",
      width: 140,
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
      key: "customerName",
      width: 160,
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "Customer Address",
      dataIndex: "customerAddress",
      key: "customerAddress",
      width: 180,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      render: (v) => `Rs. ${v.toLocaleString()}`,
    },
    {
      title: "Advance Amount",
      dataIndex: "advanceAmount",
      key: "advanceAmount",
      width: 130,
      render: (v) => (
        <Text style={{ color: "#1677ff" }}>Rs. {v.toLocaleString()}</Text>
      ),
    },
    {
      title: "Balance Amount",
      dataIndex: "balanceAmount",
      key: "balanceAmount",
      width: 130,
      render: (v) => (
        <Text style={{ color: v > 0 ? "#cf1322" : "#389e0d" }}>
          Rs. {v.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Partial Amount",
      dataIndex: "paidSoFar",
      key: "paidSoFar",
      width: 130,
      render: (v, record) =>
        record.originalPaymentType !== PAYMENT_PARTIAL ? (
          <Text type="secondary">—</Text>
        ) : (
          <Text style={{ color: "#389e0d" }}>Rs. {v.toLocaleString()}</Text>
        ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 130,
    },
    {
      title: "Received Payment",
      key: "receivedPayment",
      width: 220,
      render: (_, record) => (
        <FollowUpPaymentCell
          record={record}
          rowState={rowState}
          onChangeAmount={handleChangeAmount}
          onChangeDeliveryStatus={handleChangeDeliveryStatus}
        />
      ),
    },
    {
      title: "Delivery Status",
      key: "deliveryStatus",
      width: 140,
      render: (_, record) => {
        const state     = rowState[record.deliveryOrderId] ?? {};
        const isPartial = record.originalPaymentType === PAYMENT_PARTIAL;
        if (isPartial) return <Tag color="orange">N/A (Partial)</Tag>;
        const status = state.deliveryStatus ?? record.currentStatus;
        return (
          <Tag color={status === STATUS_DELIVERED ? "green" : "red"}>{status}</Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 130,
      render: (_, record) => {
        const isSaving = savingId === record.deliveryOrderId;
        const saved    = rowState[record.deliveryOrderId]?.saved ?? false;
        return (
          <Button
            type="primary"
            size="small"
            disabled={!canConfirm(record) || isSaving}
            loading={isSaving}
            style={saved ? { background: "#52c41a", borderColor: "#52c41a" } : {}}
            onClick={() => handleConfirm(record)}
          >
            {saved ? "Saved ✓" : "Confirm"}
          </Button>
        );
      },
    },
  ];

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      {contextHolder}

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl p-10">

        {/* Header */}
        <div className="text-center mb-3">
          <Title level={2} style={{ fontWeight: 800, color: "#1a237e", textTransform: "uppercase" }}>
            RECOVERY FOLLOW-UP SHEET
          </Title>
        </div>

        {/* Divider */}
        <div style={{
          height: "2px",
          background: "linear-gradient(to right, #1a237e, #90caf9)",
          margin: "18px 0 28px",
        }} />

        {/* Filter bar — same layout as RecoverySheet */}
        <div className="rounded-xl p-6 mb-6" style={{ background: "#e8eaf6" }}>
          <div className="flex gap-8 flex-wrap">
            <div className="flex-1 min-w-48">
              <Text strong>Select Center</Text>
              <Select
                value={selectedCenter}
                onChange={setSelectedCenter}
                options={centers}
                loading={centersLoading}
                placeholder="Select a center"
                style={{ width: "100%", height: 44 }}
              />
            </div>
            {/* Load Orders button — same as RecoverySheet */}
            <Button
              type="primary"
              disabled={!selectedCenter}
              loading={followUpLoading}
              style={{ width: "20%", height: 44, alignSelf: "flex-end" }}
              onClick={handleLoadOrders}
            >
              Load Orders
            </Button>
          </div>
        </div>

        {/* Table styles — identical to RecoverySheet */}
        <style>{`
          .followup-table .ant-table-thead > tr > th {
            background-color: #092258 !important;
            color: white !important;
            font-weight: 600 !important;
            text-align: center;
            white-space: nowrap;
          }
          .followup-table .ant-table-tbody > tr > td {
            text-align: center;
            white-space: nowrap;
            vertical-align: top;
            padding-top: 12px !important;
          }
          .followup-table .ant-table-tbody > tr:hover > td {
            background: #f5f9ff;
          }
        `}</style>

        {/* Table */}
        <Table
          dataSource={data}
          columns={columns}
          className="followup-table"
          rowKey="deliveryOrderId"
          loading={followUpLoading}
          pagination={false}
          scroll={{ x: "max-content", y: 400 }}
          style={{ border: "1px solid #ddd", borderRadius: 8, marginTop: 30 }}
          locale={{ emptyText: "Select a center and click Load Orders" }}
        />
      </div>

      <PaymentBill
        visible={billModalVisible}
        onClose={() => setBillModalVisible(false)}
        billData={billData}
      />
    </div>
  );
}

export default RecoveryFollowUp;
