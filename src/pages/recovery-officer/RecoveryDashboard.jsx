import { Card, Col, Row, Table, Typography } from "antd";
import { ShopOutlined, InboxOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import dayjs from "dayjs";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const { Text } = Typography;

const GET_PENDING_DELIVERIES = gql`
  query GetPendingDeliveries {
    orderCollection {
      edges {
        node {
          id
          estimated_delivery
          clinic_attend_customer {
            clinic { id venue from to }
          }
          paymentCollection {
            edges { node { total_payment advance } }
          }
          delivery_orderCollection {
            edges {
              node { id payment_received paid_amount balance_amount status }
            }
          }
        }
      }
    }
  }
`;

const columns = [
  { title: "Date",         dataIndex: "date",         key: "date" },
  { title: "Center Name",  dataIndex: "centerName",   key: "centerName", render: (v) => <Text strong>{v}</Text> },
  { title: "Time",         dataIndex: "time",         key: "time" },
  { title: "Total Units",  dataIndex: "totalUnits",   key: "totalUnits" },
  { title: "Total Revenue",dataIndex: "totalRevenue", key: "totalRevenue" },
];

export default function RecoveryDashboard() {
  const { data, loading, error } = useQuery(GET_PENDING_DELIVERIES);
  const now = dayjs();

  const { groupedData, todayCentersCount, todayOrdersCount, pendingPaymentsTotal } = useMemo(() => {
    if (!data) return { groupedData: [], todayCentersCount: 0, todayOrdersCount: 0, pendingPaymentsTotal: 0 };

    const map = {};
    const todayCenterIds = new Set();
    let todayOrders = 0, pendingTotal = 0;

    data.orderCollection.edges.forEach(({ node }) => {
      const deliveryDate = dayjs(node.estimated_delivery);
      const clinic       = node.clinic_attend_customer?.clinic;
      if (!clinic) return;

      const payment        = node.paymentCollection?.edges?.[0]?.node;
      const totalPrice     = payment?.total_payment || 0;
      const advance        = payment?.advance || 0;
      const deliveryRecord = node.delivery_orderCollection?.edges?.[0]?.node;

      let outstanding = 0;
      let isSettled   = false;
      if (deliveryRecord) {
        outstanding = deliveryRecord.balance_amount ?? 0;
        isSettled   = deliveryRecord.status === "Delivered" && deliveryRecord.payment_received === true && outstanding <= 0;
      } else {
        outstanding = totalPrice - advance;
      }

      if (deliveryDate.isSame(now, "day")) {
        todayCenterIds.add(clinic.id);
        todayOrders += 1;
      }

      if (!deliveryDate.isAfter(now) && !isSettled) {
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
        map[key].totalUnits    += 1;
        map[key].totalRevenue  += outstanding;
        pendingTotal           += outstanding;
      }
    });

    return {
      groupedData:          Object.values(map),
      todayCentersCount:    todayCenterIds.size,
      todayOrdersCount:     todayOrders,
      pendingPaymentsTotal: pendingTotal,
    };
  }, [data, now]);

  const tableData = groupedData.map((item) => ({
    ...item,
    totalRevenue: `Rs. ${item.totalRevenue.toLocaleString()}`,
  }));

  const summaryRow = () => {
    const totalUnits   = groupedData.reduce((s, r) => s + r.totalUnits, 0);
    const totalBalance = groupedData.reduce((s, r) => s + r.totalRevenue, 0);
    return (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={3}><Text strong>Total</Text></Table.Summary.Cell>
          <Table.Summary.Cell index={3}><Text strong>{totalUnits}</Text></Table.Summary.Cell>
          <Table.Summary.Cell index={4}><Text strong>Rs. {totalBalance.toLocaleString()}</Text></Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  if (loading) return <PageLayout><div className="ve-loading-center"><span>Loading…</span></div></PageLayout>;
  if (error)   return <PageLayout><div className="ve-loading-center"><span>{error.message}</span></div></PageLayout>;

  const statCards = [
    { title: "Today's Deliveries", value: todayCentersCount,                             icon: <ShopOutlined />,         accent: "#1677ff", subtitle: "Centers scheduled today" },
    { title: "Total Units Today",  value: todayOrdersCount,                              icon: <InboxOutlined />,        accent: "#13c2c2", subtitle: "Orders scheduled today" },
    { title: "Pending Payments",   value: `Rs. ${pendingPaymentsTotal.toLocaleString()}`,icon: <DollarCircleOutlined />, accent: "#faad14", subtitle: "Partial or undelivered" },
  ];

  return (
    <PageLayout title="Recovery Dashboard" subtitle="Pending deliveries and collection overview">
      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((c) => (
          <Col xs={24} sm={8} key={c.title}>
            <StatCard {...c} />
          </Col>
        ))}
      </Row>

      {/* ── Pending deliveries table ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Pending Deliveries">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              summary={summaryRow}
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}
