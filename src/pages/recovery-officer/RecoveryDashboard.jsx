import { Layout, Card, Table, Typography, Row, Col } from "antd";
import { useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";
import { ShopOutlined, InboxOutlined, DollarCircleOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Text, Title } = Typography;

// ── GraphQL ──────────────────────────────────────────────────────────────────
// delivery_orderCollection added (reverse relation via delivery_order.order_id)
// so we can tell whether an order has been delivered, partially paid, or
// not delivered at all — this drives the "Pending Payments" stat.

const GET_PENDING_DELIVERIES = gql`
  query GetPendingDeliveries {
    orderCollection {
      edges {
        node {
          id
          estimated_delivery
          clinic_attend_customer {
            clinic {
              id
              venue
              from
              to
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
          delivery_orderCollection {
            edges {
              node {
                id
                payment_received
                paid_amount
                balance_amount
                status
              }
            }
          }
        }
      }
    }
  }
`;

// ── Table styling ─────────────────────────────────────────────────────────────

const TABLE_HEADER_STYLE = {
  backgroundColor: "#0f2a4a",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: 14,
  borderBottom: "none",
  padding: "14px 16px",
};

// Inject global CSS once: the navy table header/summary row, PLUS the
// "collection stub" stat card design (ticket-stub shape with a perforated
// edge — a nod to the paper collection slips a recovery officer deals with
// day to day, instead of a generic icon+number card).
const tableStyle = `
  .recovery-table .ant-table-thead > tr > th {
    background-color: #0f2a4a !important;
    color: #ffffff !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    border-bottom: none !important;
    padding: 14px 16px !important;
  }
  .recovery-table .ant-table-thead > tr > th::before {
    background-color: rgba(255,255,255,0.2) !important;
  }
  .recovery-table .ant-table-tbody > tr > td {
    padding: 16px 16px !important;
    border-bottom: 1px solid #f0f0f0 !important;
    color: #1a1a1a !important;
  }
  .recovery-table .ant-table-tbody > tr:hover > td {
    background-color: #f0f5ff !important;
  }
  .recovery-table .ant-table-summary > tr > td {
    background-color: #e8eaed !important;
    font-weight: 600 !important;
    padding: 14px 16px !important;
    border-top: 1px solid #d0d0d0 !important;
  }
  .recovery-table .ant-table {
    border-radius: 12px !important;
    overflow: hidden !important;
  }

  /* ── Stat card: clean left-border card (icon badge top-right) ── */
  .stc-card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    min-height: 108px;
    background: #ffffff;
    border-radius: 16px;
    border-left: 4px solid var(--stc-accent);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    padding: 20px 22px;
    transition: transform 160ms ease, box-shadow 160ms ease;
  }
  .stc-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.09);
  }
  .stc-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .stc-eyebrow {
    font-size: 13px;
    color: #8c8c8c;
    margin-bottom: 6px;
  }
  .stc-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f1f1f;
    line-height: 1.2;
  }
  .stc-subtitle {
    margin-top: 6px;
    font-size: 12px;
    color: #8c8c8c;
  }
  .stc-icon {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--stc-wash);
    color: var(--stc-accent);
    font-size: 20px;
  }
  @media (prefers-reduced-motion: reduce) {
    .stc-card { transition: none !important; }
    .stc-card:hover { transform: none; }
  }
`;

// ── Stat card accents (left-border color + icon badge color) ─────────────────

const STAT_ACCENTS = {
  indigo: { accent: "#1677ff", wash: "rgba(22, 119, 255, 0.1)" },
  teal: { accent: "#13a8a8", wash: "rgba(19, 168, 168, 0.1)" },
  amber: { accent: "#faad14", wash: "rgba(250, 173, 20, 0.12)" },
};

// Clean left-border stat card: icon badge top-right, label, big value,
// muted subtitle underneath — matches the CashTransferToAdmin stat cards
// so both pages share one visual language. CSS lives in tableStyle above.
function StatCard({ icon, accent = "indigo", title, value, subtitle }) {
  const palette = STAT_ACCENTS[accent] || STAT_ACCENTS.indigo;

  return (
    <div
      className="stc-card"
      style={{ "--stc-accent": palette.accent, "--stc-wash": palette.wash }}
    >
      <div className="stc-top">
        <div>
          <div className="stc-eyebrow">{title}</div>
          <div className="stc-value">{value}</div>
        </div>
        <div className="stc-icon" aria-hidden="true">
          {icon}
        </div>
      </div>
      <div className="stc-subtitle">{subtitle}</div>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────

const columns = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Center Name",
    dataIndex: "centerName",
    key: "centerName",
    render: (val) => <Text strong>{val}</Text>,
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "Total Units",
    dataIndex: "totalUnits",
    key: "totalUnits",
  },
  {
    title: "Total Revenue",
    dataIndex: "totalRevenue",
    key: "totalRevenue",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

function RecoveryDashboard() {
  const { data, loading, error } = useQuery(GET_PENDING_DELIVERIES);

  const now = dayjs();

  // Build:
  //  - groupedData: table rows for orders due today-or-earlier that are still
  //    partially paid or not delivered ("Pending Deliveries" table).
  //  - todayCentersCount: distinct clinics with a delivery scheduled today.
  //  - todayOrdersCount: number of orders scheduled for delivery today.
  //  - pendingPaymentsTotal: outstanding amount across all partial /
  //    not-yet-delivered orders (due today or earlier).
  const {
    groupedData,
    todayCentersCount,
    todayOrdersCount,
    pendingPaymentsTotal,
  } = useMemo(() => {
    if (!data) {
      return {
        groupedData: [],
        todayCentersCount: 0,
        todayOrdersCount: 0,
        pendingPaymentsTotal: 0,
      };
    }

    const map = {};
    const todayCenterIds = new Set();
    let todayOrders = 0;
    let pendingTotal = 0;

    data.orderCollection.edges.forEach(({ node }) => {
      const deliveryDate = dayjs(node.estimated_delivery);
      const clinic = node.clinic_attend_customer?.clinic;
      if (!clinic) return;

      const payment = node.paymentCollection?.edges?.[0]?.node;
      const totalPrice = payment?.total_payment || 0;
      const advance = payment?.advance || 0;

      // Most recent / relevant delivery attempt for this order (if any).
      const deliveryRecord = node.delivery_orderCollection?.edges?.[0]?.node;

      // Outstanding balance for this order:
      //  - not delivered yet -> full amount (total_payment - advance) is pending
      //  - delivered with a remaining balance -> that balance is pending (partial payment)
      //  - delivered and fully paid -> nothing pending
      let outstanding = 0;
      let isSettled = false;

      if (deliveryRecord) {
        outstanding = deliveryRecord.balance_amount ?? 0;
        isSettled =
          deliveryRecord.status === "Delivered" &&
          deliveryRecord.payment_received === true &&
          outstanding <= 0;
      } else {
        outstanding = totalPrice - advance;
      }

      // ── Today's schedule (for the top stat cards) ──
      if (deliveryDate.isSame(now, "day")) {
        todayCenterIds.add(clinic.id);
        todayOrders += 1;
      }

      // ── Pending / overdue orders (partial or not delivered), due today or earlier ──
      if (!deliveryDate.isAfter(now) && !isSettled) {
        const key = `${deliveryDate.format("YYYY-MM-DD")}_${clinic.id}`;

        if (!map[key]) {
          map[key] = {
            key,
            date: deliveryDate.format("DD/MM/YYYY"),
            centerName: clinic.venue,
            time: `${clinic.from} - ${clinic.to}`,
            totalUnits: 0,
            totalRevenue: 0,
          };
        }

        map[key].totalUnits += 1;
        map[key].totalRevenue += outstanding;
        pendingTotal += outstanding;
      }
    });

    return {
      groupedData: Object.values(map),
      todayCentersCount: todayCenterIds.size,
      todayOrdersCount: todayOrders,
      pendingPaymentsTotal: pendingTotal,
    };
  }, [data, now]);

  // Derived table rows.
  const tableData = groupedData.map((item) => ({
    key: item.key,
    date: item.date,
    centerName: item.centerName,
    time: item.time,
    totalUnits: item.totalUnits,
    totalRevenue: `Rs. ${item.totalRevenue.toLocaleString()}`,
  }));

  // Table summary row.
  const summaryRow = () => {
    const totalOrders = groupedData.reduce((sum, row) => sum + row.totalUnits, 0);
    const totalBalance = groupedData.reduce((sum, row) => sum + row.totalRevenue, 0);

    return (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={3}>
            <Text strong>Total</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={3}>
            <Text strong>{totalOrders}</Text>
          </Table.Summary.Cell>
          <Table.Summary.Cell index={4}>
            <Text strong>
              Rs. {totalBalance.toLocaleString()}
            </Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  // Loading / error states returned AFTER all hooks and derived values.
  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>{error.message}</h2>;

  return (
    <Content className="p-8">
      {/* Inject table + stat card styles */}
      <style>{tableStyle}</style>

      {/* Stat cards — 3 "collection stub" cards, evenly filling the full
          page width. Icon + accent color are chosen to match what each
          stat actually represents. */}
      <Row gutter={[16, 16]} className="mb-5" align="stretch">
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <StatCard
            icon={<ShopOutlined />}
            accent="indigo"
            title="Today's Deliveries"
            value={todayCentersCount}
            subtitle="Centers scheduled today"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <StatCard
            icon={<InboxOutlined />}
            accent="teal"
            title="Total Units"
            value={todayOrdersCount}
            subtitle="Orders scheduled today"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <StatCard
            icon={<DollarCircleOutlined />}
            accent="amber"
            title="Pending Payments"
            value={`Rs. ${pendingPaymentsTotal.toLocaleString()}`}
            subtitle="Partial or undelivered orders"
          />
        </Col>
      </Row>

      {/* Table */}
      <Card
        className="rounded-2xl shadow-sm border border-gray-100"
        style={{ padding: "28px" }}
      >
        <div className="flex items-center justify-between mb-6">
          <Title level={5} className="mb-0!" style={{ fontWeight: 600 }}>
            Pending Deliveries
          </Title>
        </div>

        <Table
          className="recovery-table"
          columns={columns}
          dataSource={tableData}
          pagination={false}
          summary={summaryRow}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>
    </Content>
  );
}

export default RecoveryDashboard;