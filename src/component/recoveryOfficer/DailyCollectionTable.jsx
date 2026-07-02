import { useState, useEffect, useMemo } from 'react';
import {
  Typography, Select, DatePicker, Table, Card, Button,
  InputNumber, Space, message,
} from 'antd';
import dayjs from 'dayjs';
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const { Title, Text } = Typography;
const { Option } = Select;

// ── Payment status values for the Received Payment column ──
const PAYMENT_FULL = "full";
const PAYMENT_PARTIAL = "partial";
const RECEIVED_YES = "received";
const RECEIVED_NO = "not_received";

// The exact lab_follow_up_status.status text that means "received from
// the lab" — only orders whose lab_follow_up row has this status are
// eligible to appear on the Daily Collection sheet, since only received
// orders can be delivered.
const LAB_RECEIVED_STATUS = "Received";

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND QUERY
//
// Root: clinic, filtered by venue (Select Center) + date (Select Date) —
// clinic.venue and clinic.date are direct scalars, so this part is a
// reliable, genuine server-side filter (same as the working GET_CENTERS
// pattern elsewhere in this file).
//
// From clinic, walk to lab_follow_up (FK: lab_follow_up.clinic_id ->
// clinic.id — FK lives on the CHILD, so this is a reverse/plural
// relation exposed as clinic.lab_follow_upCollection). This is the one
// relation name in this query that's a guess rather than a confirmed
// fact — if it's wrong, the GraphQL error will name the exact field to
// fix here.
//
// Everything below lab_follow_up is a forward/singular relation (FK
// lives on lab_follow_up or order, pointing outward), which has been
// reliable throughout this schema:
//   lab_follow_up.order                  (lab_follow_up.order_id -> order.id)
//   lab_follow_up.lab_follow_up_status   (lab_follow_up.lab_follow_up_status_id -> ...id)
//   order.clinic_attend_customer         (order.clinic_attend_customer_id -> ...id)
//   clinic_attend_customer.customer_has_branch
//   customer_has_branch.customer
//   order.order_status
//   order.paymentCollection              (reverse, but already confirmed working)
// ─────────────────────────────────────────────────────────────────────────────
const GET_DAILY_COLLECTION = gql`
  query GetDailyCollection($center: String!, $date: Date!) {
    clinicCollection(
      filter: {
        venue: { eq: $center }
        date: { eq: $date }
      }
    ) {
      edges {
        node {
          id
          venue
          date
          lab_follow_upCollection {
            edges {
              node {
                id
                received_date
                lab_follow_up_status {
                  status
                }
                order {
                  id
                  estimated_delivery
                  remarks
                  total_price
                  order_status {
                    status
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
      }
    }
  }
`;

// Flatten clinic -> lab_follow_up (Received only) -> order -> customer
// into one row per delivery-eligible order.
function flattenDailyCollection(clinicEdges) {
  const rows = [];

  for (const { node: clinic } of clinicEdges ?? []) {
    const followUpEdges = clinic?.lab_follow_upCollection?.edges ?? [];

    for (const { node: followUp } of followUpEdges) {
      // Only orders whose lab follow-up is marked Received are eligible
      // for delivery / collection — anything still at the lab is
      // excluded from this sheet entirely.
      const labStatus = followUp?.lab_follow_up_status?.status;
      if (labStatus !== LAB_RECEIVED_STATUS) continue;

      const order = followUp?.order;
      if (!order) continue;

      const customer = order?.clinic_attend_customer?.customer_has_branch?.customer;
      const customerName = `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`.trim();
      const phone = customer?.contact_no ?? "";
      const address = customer?.address ?? "";

      const paymentEdges = order?.paymentCollection?.edges ?? [];
      const totalPayment = paymentEdges.reduce(
        (sum, { node: p }) => sum + (p.total_payment ?? 0), 0
      );
      const totalAdvance = paymentEdges.reduce(
        (sum, { node: p }) => sum + (p.advance ?? 0), 0
      );

      const estimatedDelivery = order?.estimated_delivery
        ? dayjs(order.estimated_delivery)
        : null;

      const totalAmount = order?.total_price ?? 0;
      const amountPaidSoFar = paymentEdges.length > 0 ? totalPayment : totalAdvance;
      const balanceAmount = totalAmount - amountPaidSoFar;

      rows.push({
        id: order.id,
        orderId: `OD${order.id}`,
        deliveryDate: estimatedDelivery ? estimatedDelivery.format("D MMM YYYY") : "—",
        deliveryTime: estimatedDelivery ? estimatedDelivery.format("h:mm A") : "—",
        customerName: customerName || "—",
        phone,
        customerAddress: address || "—",
        totalAmount,
        advanceAmount: totalAdvance,
        balanceAmount: balanceAmount > 0 ? balanceAmount : 0,
        remarks: order?.remarks ?? "",
        orderStatus: order?.order_status?.status ?? "—",
        labFollowUpReceivedDate: followUp?.received_date ?? null,
        clinicId: clinic.id,
      });
    }
  }

  return rows;
}

/**
 * Received Payment cell.
 * - Full Payment  -> shows a Received / Not Received select underneath.
 * - Not Full Payment -> shows an amount-paid input underneath.
 */
function ReceivedPaymentCell({ record, rowState, onChangeStatus, onChangeAmount, onChangeReceived }) {
  const state = rowState[record.id] ?? {};
  const status = state.paymentStatus ?? PAYMENT_FULL;
  const amountPaid = state.amountPaid ?? record.totalAmount ?? 0;
  const received = state.received ?? RECEIVED_NO;

  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Select
        value={status}
        size="small"
        style={{ width: "100%" }}
        onChange={(value) => onChangeStatus(record.id, value)}
      >
        <Option value={PAYMENT_FULL}>Full Payment</Option>
        <Option value={PAYMENT_PARTIAL}>Not Full Payment</Option>
      </Select>

      {status === PAYMENT_PARTIAL && (
        <InputNumber
          size="small"
          min={0}
          max={record.totalAmount}
          value={amountPaid}
          placeholder="Amount paid"
          style={{ width: "100%" }}
          onChange={(value) => onChangeAmount(record.id, value)}
        />
      )}

      {status === PAYMENT_FULL && (
        <Select
          value={received}
          size="small"
          style={{ width: "100%" }}
          onChange={(value) => onChangeReceived(record.id, value)}
        >
          <Option value={RECEIVED_NO}>Not Received</Option>
          <Option value={RECEIVED_YES}>Received</Option>
        </Select>
      )}
    </Space>
  );
}

function DailyCollectionTable({
    selectedCenter,
    setSelectedCenter,
    selectedDate,
    setSelectedDate,
    data,
    extraColumns = []
}) {

    const formattedDate =
        selectedDate?.format("D MMM YYYY");

    const [messageApi, contextHolder] = message.useMessage();

    const GET_CENTERS = gql`
      query getCenters {
        clinicCollection {
          edges {
            node {
              venue
            }
          }
        }
      }
    `;

    const [loadCenterData, { data: centerData, loading: centerLoading }] = useLazyQuery(GET_CENTERS);

    useEffect(() => {
        loadCenterData();
    }, []);

    const centers =
    centerData?.clinicCollection?.edges?.map((item) => ({
    value: item.node.venue,
    label: item.node.venue,
  })) || [];

    // ── Delivery-eligible (Received) orders for the selected center + date ──
    const [
      loadOrderData,
      { data: collectionData, loading: ordersLoading, error: ordersError },
    ] = useLazyQuery(GET_DAILY_COLLECTION, { fetchPolicy: "network-only" });

    const fetchedRows = useMemo(() => {
        const edges = collectionData?.clinicCollection?.edges ?? [];
        return flattenDailyCollection(edges);
    }, [collectionData]);

    // If the parent passed `data` directly, prefer it (keeps this
    // component usable standalone or as a controlled child); otherwise
    // fall back to what GET_DAILY_COLLECTION just fetched.
    const tableData = data ?? fetchedRows;

    const handleLoadOrders = () => {
        if (!selectedCenter || !selectedDate) return;
        loadOrderData({
          variables: {
            center: selectedCenter,
            date: selectedDate.format("YYYY-MM-DD"),
          },
        });
    };

    // ── Local editable state, keyed by row id ──
    const [rowState, setRowState] = useState({});

    useEffect(() => {
        if (!tableData) return;
        setRowState((prev) => {
            const next = { ...prev };
            tableData.forEach((record) => {
                if (!next[record.id]) {
                    next[record.id] = {
                        paymentStatus: PAYMENT_FULL,
                        amountPaid: record.advanceAmount ?? record.totalAmount ?? 0,
                        received: RECEIVED_NO,
                    };
                }
            });
            return next;
        });
    }, [tableData]);

    const handleChangeStatus = (id, status) => {
        setRowState((prev) => {
            const current = prev[id] ?? {};
            return {
                ...prev,
                [id]: {
                    ...current,
                    paymentStatus: status,
                    amountPaid: status === PAYMENT_PARTIAL ? (current.amountPaid ?? 0) : current.amountPaid,
                    received: status === PAYMENT_FULL ? (current.received ?? RECEIVED_NO) : RECEIVED_NO,
                },
            };
        });
    };

    const handleChangeAmount = (id, amount) => {
        setRowState((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? {}), amountPaid: amount ?? 0 },
        }));
    };

    const handleChangeReceived = (id, received) => {
        setRowState((prev) => ({
            ...prev,
            [id]: { ...(prev[id] ?? {}), received },
        }));
    };

    // Print Bill is only ever enabled once payment is Full AND marked
    // Received.
    const canPrintBill = (record) => {
        const state = rowState[record.id] ?? {};
        return state.paymentStatus === PAYMENT_FULL && state.received === RECEIVED_YES;
    };

    const handleAction = (record) => {
        messageApi.info(`Print Bill for ${record.orderId ?? record.id} — printing not yet wired up.`);
    };

    const columns = [
        { title: 'Order ID', dataIndex: 'orderId', key: 'orderId', width: 150 },
        { title: 'Delivery Date', dataIndex: 'deliveryDate', key: 'deliveryDate', width: 150 },
        { title: 'Delivery Time', dataIndex: 'deliveryTime', key: 'deliveryTime', width: 150 },
        { title: 'Customer Name', dataIndex: 'customerName', key: 'customerName', width: 180 },
        { title: 'Phone', dataIndex: 'phone', key: 'phone', width: 150 },
        { title: 'Customer Address', dataIndex: 'customerAddress', key: 'customerAddress', width: 200 },
        { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 150 },
        { title: 'Advance Amount', dataIndex: 'advanceAmount', key: 'advanceAmount', width: 150 },
        { title: 'Balance Amount', dataIndex: 'balanceAmount', key: 'balanceAmount', width: 180 },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', width: 150 },
        {
            title: 'Received Payment',
            dataIndex: 'paymentReceived',
            key: 'paymentReceived',
            width: 200,
            render: (_, record) => (
                <ReceivedPaymentCell
                    record={record}
                    rowState={rowState}
                    onChangeStatus={handleChangeStatus}
                    onChangeAmount={handleChangeAmount}
                    onChangeReceived={handleChangeReceived}
                />
            ),
        },
        { title: 'Delivered', dataIndex: 'orderStatus', key: 'delivered', width: 120 },
        {
            title: 'Actions', dataIndex: 'actions', key: 'actions', width: 150, render: (_, record) => (
                <Button
                    type="primary"
                    disabled={!canPrintBill(record)}
                    onClick={() => handleAction(record)}
                >
                    Print Bill
                </Button>
            )
        },
    ];

    return (
        <div className='min-h-screen bg-gray-100 flex items-start justify-center py-10 px-4'>
            {contextHolder}
            <div className='bg-white rounded-3xl shadow-lg w-full max-w-6xl p-10'>

                {/* Header */}
                <div className='text-center mb-3'>
                    <Title level={2} style={{
                        fontWeight: 800,
                        color: "#1a237e",
                        textTransform: 'uppercase'
                    }}>
                        DAILY COLLECTION SHEET
                    </Title>
                </div>

                {/* Divider */}
                <div style={{
                    height: '2px',
                    background: 'linear-gradient(to right, #1a237e, #90caf9)',
                    margin: '18px 0 28px'
                }} />

                {/* Filters */}
                <div className='rounded-xl p-6 mb-6' style={{ background: '#e8eaf6' }}>
                    <div className='flex gap-8 flex-wrap'>

                        {/* Center */}
                        <div className='flex-1 min-w-48'>
                            <Text strong>Select Center</Text>
                            <Select
                                value={selectedCenter}
                                onChange={setSelectedCenter}
                                options={centers}
                                loading={centerLoading}
                                style={{ width: "100%", height: 44 }}
                            />
                        </div>

                        {/* Date */}
                        <div className='flex-1 min-w-48'>
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
                            style={{ width: "20%", height: 44, alignSelf: 'flex-end' }}
                            onClick={handleLoadOrders}
                            >
  Load Orders
</Button>

                    </div>
                </div>

                {ordersError && (
                    <div style={{ marginBottom: 16, color: "#cf1322" }}>
                        Failed to load orders: {ordersError.message}
                    </div>
                )}

                {/* Table Styles */}
                <style>
                    {`
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
                    }

                    .collection-table .ant-table-tbody > tr:hover > td {
                        background: #f5f9ff;
                    }
                    `}
                </style>

                {/* Table */}
                <Table
                    dataSource={tableData}
                    columns={[...columns, ...extraColumns]}
                    className='collection-table'
                    rowKey="id"
                    loading={ordersLoading}
                    pagination={false}
                    scroll={{ x: 'max-content', y: 300 }}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: 8,
                        marginTop: 30
                    }}
                />
            </div>
        </div>
    );
}

export default DailyCollectionTable;