import { useState, useEffect } from "react";
import {
  Typography, Select, DatePicker, Table,
  Button, InputNumber, Space, message, Tag,
} from "antd";
import { gql } from "@apollo/client";
import { useQuery, useLazyQuery, useMutation } from "@apollo/client/react";
import dayjs from "dayjs";

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
          }
        }
      }
    }
  }
`;

const INSERT_DELIVERY_ORDER = gql`
  mutation InsertDeliveryOrder(
    $orderId: BigInt!
    $paymentReceived: Boolean!
    $paymentType: String!
    $paidAmount: Float!
    $balanceAmount: Float!
    $status: String!
  ) {
    insertIntodelivery_orderCollection(
      objects: {
        order_id: $orderId
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

  // For partial: paidAmount starts at 0 when switching to partial
  // balanceAmount is always recomputed: totalAmount - paidAmount
  const paidAmount    = state.paidAmount    ?? 0;
  const balanceAmount = state.balanceAmount ?? record.balanceAmount ?? 0;

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
            max={record.totalAmount}
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
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDate,   setSelectedDate]   = useState(null);
  const [data,           setData]           = useState([]);
  const [rowState,       setRowState]       = useState({});
  const [savingId,       setSavingId]       = useState(null);
  const [messageApi,     contextHolder]     = message.useMessage();

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

      const customer      = order.clinic_attend_customer?.customer_has_branch?.customer;
      const payment       = order.paymentCollection?.edges?.[0]?.node;
      const totalAmount   = payment?.total_payment ?? 0;
      const advanceAmount = payment?.advance ?? 0;
      const balanceAmount = totalAmount - advanceAmount;

      rows.push({
        id:              order.id,
        orderId:         order.id,
        deliveryDate:    delivery.format("DD/MM/YYYY"),
        deliveryTime:    delivery.format("hh:mm A"),
        customerName:    `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim(),
        phone:           customer?.contact_no ?? "",
        customerAddress: customer?.address ?? "",
        totalAmount,
        advanceAmount,
        balanceAmount,   // the pre-existing balance from DB (total - advance)
        remarks:         order.remarks ?? "",
      });
    });

    setData(rows);
  }, [orderData, selectedDate]);

  // ── Init rowState per row ──
  useEffect(() => {
    if (!data.length) return;

    setRowState((prev) => {
      const next = { ...prev };
      data.forEach((record) => {
        if (!next[record.id]) {
          next[record.id] = {
            paymentType:    PAYMENT_FULL,
            // For partial: starts at 0 paid, full balance outstanding
            paidAmount:     0,
            // balanceAmount shown in partial mode = totalAmount - paidAmount
            // starts equal to totalAmount since nothing paid yet
            balanceAmount:  record.totalAmount,
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
    const record      = data.find((r) => r.id === id);
    const totalAmount = record?.totalAmount ?? 0;
    const isFull      = paymentType === PAYMENT_FULL;

    setRowState((prev) => {
      const current = prev[id] ?? {};
      return {
        ...prev,
        [id]: {
          ...current,
          paymentType,
          // When switching to partial: reset paid to 0 → balance = totalAmount
          // When switching to full: paidAmount irrelevant, balanceAmount = 0
          paidAmount:     isFull ? totalAmount : 0,
          balanceAmount:  isFull ? 0 : totalAmount,
          deliveryStatus: isFull ? STATUS_NOT_DELIVERED : null,
          saved:          false,
        },
      };
    });
  };

  // Live recalculation: as the user types, balance = total - paid
  const handleChangeAmount = (id, amount) => {
    const record      = data.find((r) => r.id === id);
    const totalAmount = record?.totalAmount ?? 0;
    const paidAmount  = amount ?? 0;
    const balanceAmount = Math.max(totalAmount - paidAmount, 0);

    setRowState((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        paidAmount,
        balanceAmount,  // ← recomputed live so ReceivedPaymentCell shows it instantly
        saved: false,
      },
    }));
  };

  const handleChangeDeliveryStatus = (id, deliveryStatus) => {
    setRowState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), deliveryStatus, saved: false },
    }));
  };

  const handlePrintBill = async (record) => {
    const state          = rowState[record.id] ?? {};
    const paymentType    = state.paymentType   ?? PAYMENT_FULL;
    const isFull         = paymentType === PAYMENT_FULL;
    const paidAmount     = isFull ? record.totalAmount : (state.paidAmount ?? 0);
    const balanceAmount  = isFull ? 0 : Math.max(record.totalAmount - paidAmount, 0);
    const deliveryStatus = isFull ? (state.deliveryStatus ?? STATUS_NOT_DELIVERED) : STATUS_NOT_DELIVERED;
    const paymentReceived = isFull && deliveryStatus === STATUS_DELIVERED;

    setSavingId(record.id);
    try {
      await insertDeliveryOrder({
        variables: {
          orderId:        record.id,
          paymentReceived,
          paymentType:    isFull ? "full" : "partial",
          paidAmount,
          balanceAmount,
          status:         deliveryStatus,
        },
      });

      setRowState((prev) => ({
        ...prev,
        [record.id]: { ...(prev[record.id] ?? {}), saved: true },
      }));

      messageApi.success(`Saved & printing bill for Order #${record.orderId}`);
    } catch (err) {
      console.error(err);
      messageApi.error("Failed to save: " + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const canPrintBill = (record) => {
    const state       = rowState[record.id] ?? {};
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
      render: (val) => (
        <Text style={{ color: val > 0 ? "#cf1322" : "#389e0d" }}>
          Rs. {val.toLocaleString()}
        </Text>
      ),
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
    </div>
  );
}

export default RecoverySheet;