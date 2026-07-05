import { Card, Col, Row, Select, DatePicker } from "antd";
import {
  DollarOutlined,
  WalletOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const { Option } = Select;
const { RangePicker } = DatePicker;

const GET_BRANCHES = gql`
  query GetBranches {
    branchCollection {
      edges {
        node {
          branch_name
        }
      }
    }
  }
`;

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    orderCollection {
      edges {
        node {
          id
          placed_at
          estimated_delivery
          total_price
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
                balance_amount
                payment_received
                payment_type
                status
              }
            }
          }
          clinic_attend_customer {
            customer_has_branch {
              branch {
                branch_name
              }
            }
          }
        }
      }
    }
  }
`;

export default function AccountantDashboard() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDates, setSelectedDates] = useState([]);

  const { data: branchData } = useQuery(GET_BRANCHES);
  const { data: dashboardData, loading } = useQuery(GET_DASHBOARD_DATA);

  // ── Filtered orders ──
  const filteredOrders = (dashboardData?.orderCollection?.edges ?? []).filter(
    (item) => {
      const branchName =
        item?.node?.clinic_attend_customer?.customer_has_branch?.branch
          ?.branch_name;
      const orderDate = new Date(item?.node?.placed_at);
      const branchMatch =
        selectedBranch === "all" || branchName === selectedBranch;
      let dateMatch = true;
      if (
        Array.isArray(selectedDates) &&
        selectedDates.length === 2 &&
        selectedDates[0] &&
        selectedDates[1]
      ) {
        dateMatch =
          orderDate >= new Date(selectedDates[0]) &&
          orderDate <= new Date(selectedDates[1]);
      }
      return branchMatch && dateMatch;
    },
  );

  // ── Derived metrics ──
  const totalRevenue = filteredOrders.reduce(
    (s, { node }) => s + (Number(node.total_price) || 0),
    0,
  );
  const amountReceived = filteredOrders.reduce((sum, { node }) => {
    // Advance payment
    const advance =
      Number(node.paymentCollection?.edges?.[0]?.node?.advance) || 0;

    // Sum of all delivery payments
    const deliveryPayments =
      node.delivery_orderCollection?.edges?.reduce(
        (total, payment) => total + (Number(payment.node.paid_amount) || 0),
        0,
      ) || 0;

    return sum + advance + deliveryPayments;
  }, 0);
  const pendingCollections = filteredOrders.reduce((sum, { node }) => {
    const totalPrice = Number(node.total_price) || 0;

    // Advance payment
    const advance =
      Number(node.paymentCollection?.edges?.[0]?.node?.advance) || 0;

    // Sum all delivery payments
    const deliveryPayments =
      node.delivery_orderCollection?.edges?.reduce(
        (total, payment) => total + (Number(payment.node.paid_amount) || 0),
        0,
      ) || 0;

    const amountReceived = advance + deliveryPayments;

    return sum + (totalPrice - amountReceived);
  }, 0);
  const totalOrders = filteredOrders.length;

  const avgDeliveryTime =
    filteredOrders.length === 0
      ? 0
      : (
          filteredOrders.reduce((s, { node }) => {
            const placed = new Date(node.placed_at);
            const delivery = new Date(node.estimated_delivery);
            return s + (delivery - placed) / (1000 * 60 * 60 * 24);
          }, 0) / filteredOrders.length
        ).toFixed(0);

  // Best branch (from all orders, not filtered)
  const branchTotals = {};
  (dashboardData?.orderCollection?.edges ?? []).forEach(({ node }) => {
    const name =
      node.clinic_attend_customer?.customer_has_branch?.branch?.branch_name;
    if (!name) return;
    branchTotals[name] =
      (branchTotals[name] || 0) + (Number(node.total_price) || 0);
  });
  const bestBranch =
    Object.entries(branchTotals).reduce(
      (best, [b, r]) => (r > (best[1] ?? 0) ? [b, r] : best),
      [null, 0],
    )[0] ?? "—";

  const completedOrders = filteredOrders.filter(({ node }) => {
    const totalPrice = Number(node.total_price) || 0;

    // Advance payment
    const advance =
      Number(node.paymentCollection?.edges?.[0]?.node?.advance) || 0;

    // Sum of all delivery payments
    const deliveryPayments =
      node.delivery_orderCollection?.edges?.reduce(
        (total, payment) => total + (Number(payment.node.paid_amount) || 0),
        0,
      ) || 0;

    const amountReceived = advance + deliveryPayments;

    return amountReceived >= totalPrice;
  }).length;

  const fmt = (n) => `Rs. ${Number(n).toLocaleString()}`;

  const topCards = [
    {
      title: "Total Order Value",
      value: fmt(totalRevenue),
      icon: <DollarOutlined />,
      accent: "#1677ff",
    },
    {
      title: "Amount Received",
      value: fmt(amountReceived),
      icon: <WalletOutlined />,
      accent: "#52c41a",
    },
    {
      title: "Outstanding Balance",
      value: fmt(pendingCollections),
      icon: <CreditCardOutlined />,
      accent: "#ff4d4f",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: <ShoppingOutlined />,
      accent: "#faad14",
    },
  ];

  const bottomCards = [
    {
      title: "Avg Delivery Time",
      value: `${avgDeliveryTime} days`,
      icon: <ClockCircleOutlined />,
      accent: "#13c2c2",
      subtitle: "Delivery analysis",
    },
    {
      title: "Best Performing Branch",
      value: bestBranch,
      icon: <TrophyOutlined />,
      accent: "#faad14",
      subtitle: "Highest order value",
    },
    {
      title: "Orders Completed (Paid)",
      value: completedOrders,
      icon: <CheckCircleOutlined />,
      accent: "#52c41a",
      subtitle: "Fully paid orders",
    },
  ];

  const filters = (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Select
        defaultValue="all"
        style={{ width: 180 }}
        onChange={setSelectedBranch}
        loading={!branchData}
      >
        <Option value="all">All Branches</Option>
        {branchData?.branchCollection?.edges?.map(({ node: b }) => (
          <Option key={b.branch_name} value={b.branch_name}>
            {b.branch_name}
          </Option>
        ))}
      </Select>
      <RangePicker
        style={{ width: 260 }}
        allowClear
        onChange={(dates, strings) => setSelectedDates(dates ? strings : [])}
      />
    </div>
  );

  return (
    <PageLayout
      title="Accountant Dashboard"
      subtitle="Financial overview with branch and date filtering"
      extra={filters}
    >
      {/* ── Top metric cards ── */}
      <Row gutter={[16, 16]}>
        {topCards.map((c) => (
          <Col xs={24} sm={12} xl={6} key={c.title}>
            <StatCard {...c} loading={loading} />
          </Col>
        ))}
      </Row>

      {/* ── Branch performance heading ── */}
      <div style={{ margin: "28px 0 16px" }}>
        <p className="ve-section-title">Branch Performance Analysis</p>
      </div>

      {/* ── Bottom metric cards ── */}
      <Row gutter={[16, 16]}>
        {bottomCards.map((c) => (
          <Col xs={24} sm={12} lg={8} key={c.title}>
            <StatCard {...c} loading={loading} />
          </Col>
        ))}
      </Row>
    </PageLayout>
  );
}
