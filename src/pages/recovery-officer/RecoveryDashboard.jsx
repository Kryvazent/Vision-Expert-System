import { Layout, Card, Table, Typography } from "antd";
import { useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";

import StatCard from "../../component/recoveryOfficer/StatCard";

const { Content } = Layout;
const { Text, Title } = Typography;

// ── GraphQL ──────────────────────────────────────────────────────────────────

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

// Inject global CSS once for the navy header and gray summary row.
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
`;

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

  // Build grouped rows from raw order data.
  const groupedData = useMemo(() => {
    if (!data) return [];

    const map = {};

    data.orderCollection.edges.forEach(({ node }) => {
      const deliveryDate = dayjs(node.estimated_delivery);

      // Only past / today deliveries (overdue).
      if (deliveryDate.isAfter(dayjs())) return;

      const clinic = node.clinic_attend_customer?.clinic;
      if (!clinic) return;

      const payment = node.paymentCollection?.edges?.[0]?.node;
      const balance = (payment?.total_payment || 0) - (payment?.advance || 0);

      const key = `${deliveryDate.format("YYYY-MM-DD")}_${clinic.id}`;

      if (!map[key]) {
        map[key] = {
          key,
          date:         deliveryDate.format("DD/MM/YYYY"),
          centerName:   clinic.venue,
          time:         `${clinic.from} - ${clinic.to}`,
          totalUnits:   0,
          totalRevenue: 0,
        };
      }

      map[key].totalUnits++;
      map[key].totalRevenue += balance;
    });

    return Object.values(map);
  }, [data]);

  // Derived stat values — all computed inside the component.
  const tableData = groupedData.map((item) => ({
    key:          item.key,
    date:         item.date,
    centerName:   item.centerName,
    time:         item.time,
    totalUnits:   item.totalUnits,
    totalRevenue: `Rs. ${item.totalRevenue.toLocaleString()}`,
  }));

  const todayDeliveries = tableData.length;

  const totalUnits = groupedData.reduce((sum, item) => sum + item.totalUnits, 0);

  const pendingPayments = groupedData.reduce((sum, item) => sum + item.totalRevenue, 0);

  const overdueUnits = totalUnits;

  // Table summary row.
  const summaryRow = () => {
    const totalOrders  = groupedData.reduce((sum, row) => sum + row.totalUnits, 0);
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
  if (error)   return <h2>{error.message}</h2>;

  return (
    <Content className="p-8">
      {/* Inject table styles */}
      <style>{tableStyle}</style>

      {/* Stat cards */}
      <div className="flex gap-15 align-items-left mb-5">
        <StatCard
          iconType="shopping"
          title="Today's Deliveries"
          value={todayDeliveries}
        />
        <StatCard
          iconType="user"
          title="Total Units"
          value={totalUnits}
        />
        <StatCard
          iconType="dollar"
          title="Pending Payments"
          value={`Rs. ${pendingPayments.toLocaleString()}`}
        />
        <StatCard
          iconType="file"
          title="Overdue Units"
          value={overdueUnits}
        />
      </div>

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