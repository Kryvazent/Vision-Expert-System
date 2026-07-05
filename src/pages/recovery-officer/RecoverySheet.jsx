import { useState, useEffect } from "react";
import {
  Typography, Select, DatePicker, Table,
  Button, InputNumber, Space, message, Tag,
} from "antd";
import { gql } from "@apollo/client";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import dayjs from "dayjs";
import PaymentBill from "../../component/recoveryOfficer/PaymentBill";
import { useAuth } from "../../const/functions";

const { Title, Text } = Typography;
const { Option } = Select;

// ── Constants ─────────────────────────────────────────────────────────────────
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

// NOTE: added order.delivery_orderCollection so we can detect if this order
// already has a payment/delivery record saved — this is the key fix.
// Also pull discount + additional_fee so the balance calculation is accurate.
const GET_RECOVERY_ORDERS = gql`
  query GetRecoveryOrders($clinicId: BigInt!) {
    lab_follow_upCollection(
      filter: {
        clinic_id: { eq: $clinicId }
        lab_follow_up_status_id: { eq: 3 }
      }
    ) {
      edges {
        node {
          received_date
          clinic {
            venue
          }
          order {
            id
            estimated_delivery
            remarks
            paymentCollection {
              edges {
                node {
                  total_payment
                  advance
                  discount
                  additional_fee
                }
              }
            }
            clinic_attend_customer {
              customer_has_branch {
                customer {
                  first_name
                  last_name
                  contact_no
                  address
                }
              }
            }
            delivery_orderCollection {
              edges {
                node {
                  id
                  payment_type
                  paid_amount
                  balance_amount
                  status
                  payment_received
                }
              }
            }
          }
        }
      }
    }
  }
`;

const INSERT_DELIVERY_ORDER = gql`
  mutation InsertDeliveryOrder(
    $orderId: BigInt!
    $deliveredBy: BigInt!
    $paymentReceived: Boolean!
    $paymentType: String!
    $paidAmount: Float!
    $balanceAmount: Float!
    $status: String!
  ) {
    insertIntodelivery_orderCollection(
      objects: {
        order_id: $orderId
        delivered_by: $deliveredBy
        payment_received: $paymentReceived
        payment_type: $paymentType
        paid_amount: $paidAmount
        balance_amount: $balanceAmount
        status: $status
      }
    ) {
      records {
        id
        order_id
        payment_type
        paid_amount
        balance_amount
        status
      }
    }
  }
`;

// ── ReceivedPaymentCell ───────────────────────────────────────────────────────

function ReceivedPaymentCell({
  record,
  rowState,
  onChangePaymentType,
  onChangeAmount,
  onChangeDeliveryStatus,
}) {
  const state          = rowState[record.id] ?? {};
  const paymentType    = state.paymentType    ?? PAYMENT_FULL;
  const deliveryStatus = state.deliveryStatus ?? STATUS_NOT_DELIVERED;
  const saved          = state.saved          ?? false; // once saved, lock all inputs

  const paidAmount    = state.paidAmount    ?? 0;
  const balanceAmount = state.balanceAmount ?? record.balanceAmount ?? 0;

  // When saved (either just now, or already saved before refresh), show a
  // locked summary instead of editable controls
  if (saved) {
    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Tag color={paymentType === PAYMENT_FULL ? "blue" : "orange"} style={{ borderRadius: 20 }}>
          {paymentType === PAYMENT_FULL ? "Full Payment" : "Partial Payment"}
        </Tag>
        {paymentType === PAYMENT_PARTIAL && (
          <>
            <Text style={{ fontSize: 12 }}>Paid: <Text strong>Rs. {paidAmount.toLocaleString()}</Text></Text>
            <Text style={{ fontSize: 12, color: balanceAmount > 0 ? "#cf1322" : "#389e0d" }}>
              Balance: <Text strong style={{ color: balanceAmount > 0 ? "#cf1322" : "#389e0d" }}>
                Rs. {balanceAmount.toLocaleString()}
              </Text>
            </Text>
          </>
        )}
        {paymentType === PAYMENT_FULL && (
          <Tag color={deliveryStatus === STATUS_DELIVERED ? "green" : "red"} style={{ borderRadius: 20 }}>
            {deliveryStatus}
          </Tag>
        )}
        <Tag color="success" style={{ borderRadius: 20, fontSize: 10 }}>✓ Confirmed</Tag>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>

      {/* Payment type */}
      <Select
        value={paymentType}
        size="small"
        style={{ width: "100%" }}
        onChange={(value) => onChangePaymentType(record.id, value)}
      >
        <Option value={PAYMENT_FULL}>Full Payment</Option>
        <Option value={PAYMENT_PARTIAL}>Partial Payment</Option>
      </Select>

      {/* Full payment → delivery status selector */}
      {paymentType === PAYMENT_FULL && (
        <Select
          value={deliveryStatus}
          size="small"
          style={{ width: "100%" }}
          onChange={(value) => onChangeDeliveryStatus(record.id, value)}
        >
          <Option value={STATUS_DELIVERED}>Delivered</Option>
          <Option value={STATUS_NOT_DELIVERED}>Not Delivered</Option>
        </Select>
      )}

      {/* Partial payment → amount input + live balance */}
      {paymentType === PAYMENT_PARTIAL && (
        <>
          <InputNumber
            size="small"
            min={0}
            max={record.balanceAmount}
            value={paidAmount}
            placeholder="Enter amount paid"
            style={{ width: "100%" }}
            onChange={(value) => onChangeAmount(record.id, value ?? 0)}
          />
          {/* Balance auto-updates as user types */}
          <div
            style={{
              background: balanceAmount > 0 ? "#fff1f0" : "#f6ffed",
              border: `1px solid ${balanceAmount > 0 ? "#ffa39e" : "#b7eb8f"}`,
              borderRadius: 6,
              padding: "3px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 11, color: "#595959" }}>Balance:</Text>
            <Text
              strong
              style={{
                fontSize: 12,
                color: balanceAmount > 0 ? "#cf1322" : "#389e0d",
              }}
            >
              Rs. {balanceAmount.toLocaleString()}
            </Text>
          </div>
        </>
      )}
    </Space>
  );
}

// ── RecoverySheet ─────────────────────────────────────────────────────────────

function RecoverySheet() {
  const { staff } = useAuth();
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [data,           setData]           = useState([]);
  const [rowState,       setRowState]       = useState({});
  const [savingId,       setSavingId]       = useState(null);
  const [messageApi,     contextHolder]     = message.useMessage();
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [billData,       setBillData]       = useState(null);

  const { data: centerData, loading: centersLoading } = useQuery(GET_CENTERS);

  const [loadOrders, { data: orderData, loading: ordersLoading }] =
    useLazyQuery(GET_RECOVERY_ORDERS, { fetchPolicy: "network-only" });

  const [insertDeliveryOrder] = useMutation(INSERT_DELIVERY_ORDER);

  const centers = (centerData?.clinicCollection?.edges ?? []).map(({ node }) => ({
    label: node.venue,
    value: Number(node.id),
  }));

  // ── Build rows ──
  useEffect(() => {
    if (!orderData || !selectedDate) return;

    const rows = [];

    orderData.lab_follow_upCollection.edges.forEach(({ node }) => {
      const order    = node.order;
      const delivery = dayjs(order.estimated_delivery);

      if (delivery.format("YYYY-MM-DD") !== selectedDate.format("YYYY-MM-DD")) return;

      const customer     = order.clinic_attend_customer?.customer_has_branch?.customer;
      const payment      = order.paymentCollection?.edges?.[0]?.node;

      // Raw figures from the payment record
      const rawTotal      = payment?.total_payment  ?? 0;
      const discount      = payment?.discount       ?? 0;
      const additionalFee = payment?.additional_fee ?? 0;
      const advanceAmount = payment?.advance        ?? 0;

      // Net total actually owed for this order, after discount / additional fee.
      const totalAmount = rawTotal - discount + additionalFee;

      // What's left after the advance already paid — this is the real
      // outstanding balance a partial payment should be deducted from.
      const balanceAmount = Math.max(totalAmount - advanceAmount, 0);

      // If a delivery_order already exists for this order, it means
      // payment/delivery was already recorded — this row must be locked.
      const existingDeliveryOrder =
        order.delivery_orderCollection?.edges?.[0]?.node ?? null;

      rows.push({
        id:              order.id,
        orderId:         order.id,
        deliveryDate:    delivery.format("DD/MM/YYYY"),
        deliveryTime:    delivery.format("hh:mm A"),
        customerName:    `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
        phone:           customer?.contact_no ?? "",
        customerAddress: customer?.address ?? "",
        totalAmount,     // net total after discount/fee
        advanceAmount,
        balanceAmount,   // net total - advance (original / DB value)
        remarks:         order.remarks ?? "",
        existingDeliveryOrder,
      });
    });

    setData(rows);
  }, [orderData, selectedDate]);

  // ── Init rowState per row ──
  // If the order already has a delivery_order record (from a previous save),
  // initialize the row as locked ("saved: true") using the real stored values
  // instead of the blank defaults. This is what prevents re-payment after refresh.
  useEffect(() => {
    if (!data.length) return;

    setRowState((prev) => {
      const next = { ...prev };
      data.forEach((record) => {
        if (next[record.id]) return; // already initialized this session

        const existing = record.existingDeliveryOrder;

        if (existing) {
          next[record.id] = {
            paymentType:    existing.payment_type ?? PAYMENT_FULL,
            paidAmount:     existing.paid_amount    ?? 0,
            balanceAmount:  existing.balance_amount ?? 0,
            deliveryStatus: existing.status ?? STATUS_NOT_DELIVERED,
            saved:          true, // lock it — payment already recorded
          };
        } else {
          next[record.id] = {
            paymentType:    PAYMENT_FULL,
            paidAmount:     0,
            balanceAmount:  record.balanceAmount,
            deliveryStatus: STATUS_NOT_DELIVERED,
            saved:          false,
          };
        }
      });
      return next;
    });
  }, [data]);

  // ── Handlers ──
  const handleLoadOrdersClick = () => {
    if (!selectedCenter || !selectedDate) return;
    setData([]);
    setRowState({});
    loadOrders({ variables: { clinicId: selectedCenter } });
  };

  const handleChangePaymentType = (id, paymentType) => {
    if (rowState[id]?.saved) return; // locked after Print Bill / already paid
    const record        = data.find((r) => r.id === id);
    const totalAmount   = record?.totalAmount   ?? 0; // net total (after discount/fee)
    const dbBalance     = record?.balanceAmount ?? 0; // net total - advance
    const isFull        = paymentType === PAYMENT_FULL;

    setRowState((prev) => {
      const current = prev[id] ?? {};
      return {
        ...prev,
        [id]: {
          ...current,
          paymentType,
          paidAmount:     isFull ? totalAmount : 0,
          balanceAmount:  isFull ? 0 : dbBalance,
          deliveryStatus: isFull ? STATUS_NOT_DELIVERED : null,
          saved:          false,
        },
      };
    });
  };

  // Live: balance = record.balanceAmount (net total - advance) minus what user enters.
  // This is the single source of truth that both the payment cell AND the
  // "Balance Amount" table column now read from via rowState.
  const handleChangeAmount = (id, amount) => {
    if (rowState[id]?.saved) return; // locked after Print Bill / already paid
    const record         = data.find((r) => r.id === id);
    const dbBalance       = record?.balanceAmount ?? 0;

    // Don't let the entered amount exceed what's actually owed
    const cappedAmount    = Math.min(Math.max(amount ?? 0, 0), dbBalance);
    const balanceAmount   = Math.max(dbBalance - cappedAmount, 0);

    setRowState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        paidAmount: cappedAmount,
        balanceAmount,
        saved: false,
      },
    }));
  };

  const handleChangeDeliveryStatus = (id, deliveryStatus) => {
    if (rowState[id]?.saved) return; // locked after Print Bill / already paid
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), deliveryStatus, saved: false },
    }));
  };

  const handlePrintBill = async (record) => {
    // Extra safety net: never insert twice for the same order, even if
    // something stale slipped through the UI state.
    if (rowState[record.id]?.saved || record.existingDeliveryOrder) {
      messageApi.warning("Payment for this order has already been recorded.");
      return;
    }

    const state          = rowState[record.id] ?? {};
    const paymentType    = state.paymentType   ?? PAYMENT_FULL;
    const isFull         = paymentType === PAYMENT_FULL;
    const paidAmount     = isFull ? record.totalAmount : (state.paidAmount ?? 0);
    const balanceAmount  = isFull ? 0 : Math.max((record.balanceAmount ?? 0) - paidAmount, 0);
    const deliveryStatus = isFull ? (state.deliveryStatus ?? STATUS_NOT_DELIVERED) : STATUS_NOT_DELIVERED;
    const paymentReceived = isFull && deliveryStatus === STATUS_DELIVERED;

    setSavingId(record.id);
    try {
      await insertDeliveryOrder({
        variables: {
          orderId:        record.id,
          deliveredBy:    staff.id,
          paymentReceived,
          paymentType:    isFull ? "full" : "partial",
          paidAmount,
          balanceAmount,
          status:         deliveryStatus,
        },
      });

      setRowState((prev) => ({
        ...prev,
        [record.id]: {
          ...(prev[record.id] ?? {}),
          paymentType,
          paidAmount,
          balanceAmount,
          deliveryStatus,
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
        paymentType: isFull ? "Full Payment" : "Partial Payment",
        paidAmount: paidAmount,
        remainingBalance: balanceAmount,
        deliveryStatus: deliveryStatus,
        remarks: record.remarks,
      });
      setBillModalVisible(true);

      messageApi.success(`Saved & printing bill for Order #${record.orderId}`);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to save: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const canPrintBill = (record) => {
    const state = rowState[record.id] ?? {};
    // Locked if already saved this session OR a delivery_order already
    // existed for this order when it was loaded (i.e. after a refresh).
    if (state.saved || record.existingDeliveryOrder) return false;
    const paymentType = state.paymentType ?? PAYMENT_FULL;
    // Partial: must have paid > 0
    if (paymentType === PAYMENT_PARTIAL) return (state.paidAmount ?? 0) > 0;
    return true;
  };

  // ── Columns ──
  const columns = [
    { title: "Order ID",         dataIndex: "orderId",         key: "orderId",         width: 100 },
    { title: "Delivery Date",    dataIndex: "deliveryDate",    key: "deliveryDate",     width: 120 },
    { title: "Delivery Time",    dataIndex: "deliveryTime",    key: "deliveryTime",     width: 120 },
    {
      title: "Customer Name", dataIndex: "customerName", key: "customerName", width: 160,
      render: (val) => <Text strong>{val}</Text>,
    },
    { title: "Phone",            dataIndex: "phone",           key: "phone",            width: 130 },
    { title: "Customer Address", dataIndex: "customerAddress", key: "customerAddress",  width: 180 },
    {
      title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount", width: 120,
      render: (val) => `Rs. ${val.toLocaleString()}`,
    },
    {
      title: "Advance Amount", dataIndex: "advanceAmount", key: "advanceAmount", width: 130,
      render: (val) => (
        <Text style={{ color: "#1677ff" }}>Rs. {val.toLocaleString()}</Text>
      ),
    },
    {
      title: "Balance Amount", dataIndex: "balanceAmount", key: "balanceAmount", width: 130,
      render: (val, record) => {
        // Read the LIVE balance from rowState so this column stays in sync
        // with what the user is typing in the "Received Payment" cell.
        // Falls back to the original DB value if the row hasn't been touched.
        const liveBalance = rowState[record.id]?.balanceAmount ?? val;
        return (
          <Text style={{ color: liveBalance > 0 ? "#cf1322" : "#389e0d" }}>
            Rs. {liveBalance.toLocaleString()}
          </Text>
        );
      },
    },
    { title: "Remarks", dataIndex: "remarks", key: "remarks", width: 130 },
    {
      title: "Received Payment", key: "paymentReceived", width: 220,
      render: (_, record) => (
        <ReceivedPaymentCell
          record={record}
          rowState={rowState}
          onChangePaymentType={handleChangePaymentType}
          onChangeAmount={handleChangeAmount}
          onChangeDeliveryStatus={handleChangeDeliveryStatus}
        />
      ),
    },
    {
      title: "Delivery Status", key: "deliveryStatus", width: 140,
      render: (_, record) => {
        const state       = rowState[record.id] ?? {};
        const paymentType = state.paymentType ?? PAYMENT_FULL;

        if (paymentType === PAYMENT_PARTIAL) {
          return <Tag color="orange">N/A (Partial)</Tag>;
        }

        const status = state.deliveryStatus ?? STATUS_NOT_DELIVERED;
        return (
          <Tag color={status === STATUS_DELIVERED ? "green" : "red"}>{status}</Tag>
        );
      },
    },
    {
      title: "Actions", key: "actions", width: 130,
      render: (_, record) => {
        const isSaving = savingId === record.id;
        const saved    = rowState[record.id]?.saved ?? false;

        return (
          <Button
            type="primary"
            size="small"
            disabled={!canPrintBill(record) || isSaving}
            loading={isSaving}
            style={saved ? { background: "#52c41a", borderColor: "#52c41a" } : {}}
            onClick={() => handlePrintBill(record)}
          >
            {saved ? "Saved ✓" : "Print Bill"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4">
      {contextHolder}

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-7xl p-10">

        <div className="text-center mb-3">
          <Title level={2} style={{ fontWeight: 800, color: "#1a237e", textTransform: "uppercase" }}>
            DAILY COLLECTION SHEET
          </Title>
        </div>

        <div style={{
          height: "2px",
          background: "linear-gradient(to right, #1a237e, #90caf9)",
          margin: "18px 0 28px",
        }} />

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
            <div className="flex-1 min-w-48">
              <Text strong>Select Date</Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ width: "100%", height: 44 }}
              />
            </div>
            <Button
              type="primary"
              disabled={!selectedCenter || !selectedDate}
              loading={ordersLoading}
              style={{ width: "20%", height: 44, alignSelf: "flex-end" }}
              onClick={handleLoadOrdersClick}
            >
              Load Orders
            </Button>
          </div>
        </div>

        <style>{`
          .collection-table .ant-table-thead > tr > th {
            background-color: #092258 !important;
            color: white !important;
            font-weight: 600 !important;
            text-align: center;
            white-space: nowrap;
          }
          .collection-table .ant-table-tbody > tr > td {
            text-align: center;
            white-space: nowrap;
            vertical-align: top;
            padding-top: 12px !important;
          }
          .collection-table .ant-table-tbody > tr:hover > td {
            background: #f5f9ff;
          }
        `}</style>

        <Table
          dataSource={data}
          columns={columns}
          className="collection-table"
          rowKey="id"
          loading={ordersLoading}
          pagination={false}
          scroll={{ x: "max-content", y: 400 }}
          style={{ border: "1px solid #ddd", borderRadius: 8, marginTop: 30 }}
          locale={{ emptyText: "Select a center and date, then click Load Orders" }}
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

export default RecoverySheet;
