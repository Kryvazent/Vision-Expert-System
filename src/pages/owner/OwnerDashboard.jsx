import { Card, Col, Row, Typography } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const { Title } = Typography;

const GET_OWNER_DASHBOARD = gql`
  query GetOwnerDashboard {
    orderCollection {
      edges {
        node {
          id
          placed_at
          total_price
          order_status_id

          paymentCollection {
            edges {
              node {
                advance
              }
            }
          }

          delivery_orderCollection {
            edges {
              node {
                paid_amount
              }
            }
          }

          order_status {
            status
          }

          clinic_attend_customer {
            customer_has_branch {
              customer {
                id
              }

              branch {
                branch_name
              }
            }
          }
        }
      }
    }

    productCollection {
      edges {
        node {
          id
          purchased_quantity

          product_type {
            type
          }
        }
      }
    }
  }
`;
const CHART_COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#a0d911",
  "#fa541c",
  "#2f54eb",
];

export default function OwnerDashboard() {
  const { data, loading, error } = useQuery(GET_OWNER_DASHBOARD);

  if (loading)
    return (
      <PageLayout>
        <div className="ve-loading-center">
          <span>Loading dashboard…</span>
        </div>
      </PageLayout>
    );
  if (error)
    return (
      <PageLayout>
        <div className="ve-loading-center">
          <span>Error: {error.message}</span>
        </div>
      </PageLayout>
    );

  const orders = data?.orderCollection?.edges ?? [];
  const products = data?.productCollection?.edges ?? [];

  // ── Metrics ──
  const totalRevenue = orders.reduce(
    (s, { node }) => s + (Number(node.total_price) || 0),
    0,
  );
  const totalOrders = orders.length;
  const uniqueCustomers = new Set(
    orders.map(
      ({ node }) =>
        node.clinic_attend_customer?.customer_has_branch?.customer?.id,
    ),
  ).size;
 const pendingPayments = orders.reduce((sum, { node }) => {
  const advance =
    Number(node.paymentCollection?.edges?.[0]?.node?.advance) || 0;

  const deliveryPayments =
    node.delivery_orderCollection?.edges?.reduce(
      (total, item) => total + (Number(item?.node?.paid_amount) || 0),
      0
    ) || 0;

  const totalPaid = advance + deliveryPayments;

  return sum + Math.max(0, Number(node.total_price) - totalPaid);
}, 0);
 const completedOrders = orders.filter(({ node }) =>
  node.order_status?.status?.toLowerCase() === "delivered"
).length;

  // ── Branch performance ──
  const branchTotals = {};
  orders.forEach(({ node }) => {
    const branch =
      node.clinic_attend_customer?.customer_has_branch?.branch?.branch_name;
    if (!branch) return;
    branchTotals[branch] =
      (branchTotals[branch] || 0) + (Number(node.total_price) || 0);
  });
  const branchChartData = Object.entries(branchTotals).map(
    ([branch, revenue]) => ({ branch, revenue }),
  );
  const maxRevenue = Math.max(...branchChartData.map((b) => b.revenue), 1);
  const bestBranch =
    branchChartData.reduce(
      (best, b) => (b.revenue > (best?.revenue ?? 0) ? b : best),
      null,
    )?.branch ?? "—";

  // ── Payment overview ──
 const totalPaid = orders.reduce((sum, { node }) => {
  const advance =
    Number(node.paymentCollection?.edges?.[0]?.node?.advance) || 0;

  const deliveryPayments =
    node.delivery_orderCollection?.edges?.reduce(
      (total, item) => total + (Number(item?.node?.paid_amount) || 0),
      0
    ) || 0;

  return sum + advance + deliveryPayments;
}, 0);
  const paymentOverviewData = [
    { name: "Received", value: totalPaid },
    { name: "Pending", value: pendingPayments },
  ];

  // ── Product distribution ──
  const productTypeTotals = {};
  products.forEach(({ node }) => {
    const type = node.product_type?.type;
    if (!type) return;
    productTypeTotals[type] =
      (productTypeTotals[type] || 0) + (Number(node.purchased_quantity) || 0);
  });
  const productDistribution = Object.entries(productTypeTotals).map(
    ([name, value]) => ({ name, value }),
  );

  const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;

  const statCards = [
    {
      title: "Total Revenue",
      value: fmt(totalRevenue),
      icon: <DollarOutlined />,
      accent: "#52c41a",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingOutlined />,
      accent: "#1677ff",
    },
    {
      title: "Total Customers",
      value: uniqueCustomers,
      icon: <UserOutlined />,
      accent: "#faad14",
    },
    {
      title: "Pending Payments",
      value: fmt(pendingPayments),
      icon: <CreditCardOutlined />,
      accent: "#ff4d4f",
    },
  ];

  return (
    <PageLayout
      title="Owner Dashboard"
      subtitle="Business overview across all branches"
    >
      {/* ── Stat Cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} xl={6} key={card.title}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      {/* ── Charts ── */}
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} lg={12}>
          <Card title="Payments Overview">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={paymentOverviewData}
                  dataKey="value"
                  outerRadius={80}
                  label
                >
                  {paymentOverviewData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#52c41a" : "#ff4d4f"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Branch Performance">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={branchChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="revenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ── Bottom section ── */}
      <Row gutter={[16, 16]} className="mt-5">
        <Col xs={24} lg={12}>
          <Card title="Product Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={productDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {productDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Branch Overview">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {branchChartData.map((b) => (
                <div key={b.branch}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{b.branch}</span>
                    <span style={{ color: "var(--ve-text-muted)" }}>
                      {fmt(b.revenue)}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--ve-border-light)",
                      borderRadius: 4,
                      height: 8,
                    }}
                  >
                    <div
                      style={{
                        width: `${(b.revenue / maxRevenue) * 100}%`,
                        background: "#1677ff",
                        borderRadius: 4,
                        height: 8,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── Insights ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Business Insights">
            <Row gutter={[12, 12]}>
              {[
                {
                  bg: "#f6ffed",
                  color: "#52c41a",
                  icon: <TrophyOutlined />,
                  label: "Best Branch",
                  body: `${bestBranch} generated the highest revenue`,
                },
                {
                  bg: "#fffbe6",
                  color: "#faad14",
                  icon: <WarningOutlined />,
                  label: "Pending Payments",
                  body: `${fmt(pendingPayments)} outstanding`,
                },
                {
                  bg: "#f6ffed",
                  color: "#52c41a",
                  icon: <RiseOutlined />,
                  label: "Customer Growth",
                  body: `${uniqueCustomers} active customers`,
                },
                {
                  bg: "#e6f4ff",
                  color: "#1677ff",
                  icon: <CheckCircleOutlined />,
                  label: "Completed Orders",
                  body: `${completedOrders} fully completed`,
                },
              ].map((item) => (
                <Col xs={24} sm={12} xl={6} key={item.label}>
                  <div
                    style={{
                      background: item.bg,
                      borderRadius: "var(--ve-radius-lg)",
                      padding: "16px",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{ color: item.color, fontSize: 20, flexShrink: 0 }}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          margin: "0 0 2px",
                          fontSize: 14,
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          color: "var(--ve-text-secondary)",
                        }}
                      >
                        {item.body}
                      </p>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}
