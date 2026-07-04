import React, { useMemo } from "react";
import {
  Progress, Spin, Alert, Modal, Form,
  InputNumber, Button, message, Empty, Row, Col, Card,
} from "antd";
import {
  TrophyOutlined,
  DollarCircleOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const GET_BRANCH_PERFORMANCE = gql`
  query GetBranchPerformance($branchId: Int!, $monthStart: Datetime!, $monthEnd: Datetime!) {
    branchCollection(filter: { id: { eq: $branchId } }) {
      edges {
        node {
          id
          revenue_target
          order_target
        }
      }
    }
    orderCollection(
      filter: {
        clinic_attend_customer: { clinic: { branch_id: { eq: $branchId } } }
        placed_at: { gte: $monthStart, lt: $monthEnd }
      }
    ) {
      edges {
        node {
          id
          total_price
          delivery_orderCollection {
            edges { node { status } }
          }
        }
      }
    }
  }
`;

const SET_BRANCH_TARGET = gql`
  mutation SetBranchTarget($branchId: Int!, $revenueTarget: Float!, $orderTarget: BigInt!) {
    setBranchTarget(branchId: $branchId, revenueTarget: $revenueTarget, orderTarget: $orderTarget) {
      id
      revenue_target
      order_target
    }
  }
`;

const fmt = (n) => `LKR ${Number(n ?? 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
const fmtInput = (v) => (v == null || v === "" ? "" : `LKR ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
const parseInput = (v) => (v ? v.replace(/LKR\s?|,/g, "") : "");
const pct = (a, t) => (!t ? 0 : Math.round((a / t) * 100));
const DELIVERED = "Delivered";

export default function ManagerDashboard() {
  const { staff } = useAuth();
  const branchId = staff?.branch?.id;

  const [targetModalOpen, setTargetModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  const now        = dayjs();
  const monthStart = now.startOf("month");
  const monthEnd   = monthStart.add(1, "month");

  const { data, loading, error, refetch } = useQuery(GET_BRANCH_PERFORMANCE, {
    variables: { branchId, monthStart: monthStart.toISOString(), monthEnd: monthEnd.toISOString() },
    skip: !branchId,
    fetchPolicy: "network-only",
  });

  const branch    = data?.branchCollection?.edges?.[0]?.node;
  const hasTarget = branch?.revenue_target != null && branch?.order_target != null;

  const performance = useMemo(() => {
    if (!branch || !data?.orderCollection) return null;
    const orders = data.orderCollection.edges.map((e) => e.node);
    let revenueAchieved = 0, deliveriesAchieved = 0;
    orders.forEach((order) => {
      const isDelivered = order.delivery_orderCollection.edges.some((d) => d.node.status === DELIVERED);
      if (isDelivered) { deliveriesAchieved += 1; revenueAchieved += order.total_price || 0; }
    });
    return {
      revenue_target:    branch.revenue_target,
      revenue_achieved:  revenueAchieved,
      revenue_pct:       pct(revenueAchieved, branch.revenue_target),
      order_target:      branch.order_target,
      orders_achieved:   orders.length,
      order_pct:         pct(orders.length, branch.order_target),
      deliveries_achieved: deliveriesAchieved,
      total_orders:      orders.length,
      delivery_pct:      pct(deliveriesAchieved, orders.length),
    };
  }, [branch, data]);

  const overallPct = performance
    ? Math.min(Math.round((performance.revenue_pct + performance.order_pct + performance.delivery_pct) / 3), 100)
    : 0;

  const [setBranchTarget, { loading: savingTarget }] = useMutation(SET_BRANCH_TARGET, {
    onCompleted: (result) => {
      if (!result?.setBranchTarget?.id) { message.error("Branch target could not be saved."); return; }
      message.success("Monthly target saved");
      setTargetModalOpen(false);
      form.resetFields();
      refetch();
    },
    onError: (err) => message.error(`Failed to save target: ${err.message}`),
  });

  const handleSaveTarget = (values) =>
    setBranchTarget({ variables: { branchId, revenueTarget: values.revenue_target, orderTarget: values.order_target } });

  // Stat cards — shown even without a target
  const statCards = performance
    ? [
        { title: "Revenue Achieved",  value: fmt(performance.revenue_achieved),   icon: <DollarCircleOutlined />, accent: "#1677ff",  subtitle: `Target: ${fmt(performance.revenue_target)}` },
        { title: "Orders This Month", value: performance.orders_achieved,          icon: <ShoppingOutlined />,    accent: "#52c41a",  subtitle: `Target: ${performance.order_target} orders` },
        { title: "Deliveries Made",   value: performance.deliveries_achieved,      icon: <CheckCircleOutlined />, accent: "#722ed1",  subtitle: `${performance.delivery_pct}% of orders` },
        { title: "Overall Progress",  value: `${overallPct}%`,                     icon: <RiseOutlined />,        accent: "#faad14",  subtitle: "Avg across all targets" },
      ]
    : [];

  const metrics = performance
    ? [
        { icon: <DollarCircleOutlined style={{ fontSize: 28, color: "#1677ff" }} />, label: "Revenue Target",  display: `${fmt(performance.revenue_achieved)} / ${fmt(performance.revenue_target).replace("LKR ", "")}`, pct: Math.min(performance.revenue_pct, 100), remaining: `Remaining: ${fmt(Math.max(performance.revenue_target - performance.revenue_achieved, 0))}`, color: "#1677ff" },
        { icon: <ShoppingOutlined     style={{ fontSize: 28, color: "#52c41a" }} />, label: "Orders Target",   display: `${performance.orders_achieved} / ${performance.order_target}`,                                   pct: Math.min(performance.order_pct, 100),    remaining: `Remaining: ${Math.max(performance.order_target - performance.orders_achieved, 0)} orders`,      color: "#52c41a" },
        { icon: <CheckCircleOutlined  style={{ fontSize: 28, color: "#722ed1" }} />, label: "Deliveries",      display: `${performance.deliveries_achieved} / ${performance.total_orders}`,                                pct: Math.min(performance.delivery_pct, 100), remaining: `Remaining: ${Math.max(performance.total_orders - performance.deliveries_achieved, 0)} to deliver`, color: "#722ed1" },
      ]
    : [];

  const editBtn = (
    <Button icon={<SettingOutlined />} onClick={() => setTargetModalOpen(true)}>
      {hasTarget ? "Edit Target" : "Set Target"}
    </Button>
  );

  return (
    <PageLayout
      title={`Monthly Performance — ${now.format("MMMM YYYY")}`}
      subtitle="Branch targets vs. achievements for the current month"
      extra={editBtn}
    >
      {loading && (
        <div className="ve-loading-center"><Spin size="large" /></div>
      )}

      {!loading && error && (
        <Alert type="error" message="Failed to load performance data" description={error.message} showIcon />
      )}

      {!loading && !error && !hasTarget && (
        <Card>
          <Empty description={`No target set for ${now.format("MMMM YYYY")} yet.`} style={{ padding: "48px 0" }}>
            <Button type="primary" onClick={() => setTargetModalOpen(true)}>
              Set Monthly Target
            </Button>
          </Empty>
        </Card>
      )}

      {!loading && !error && hasTarget && performance && (
        <>
          {/* Stat summary cards */}
          <Row gutter={[16, 16]}>
            {statCards.map((c) => (
              <Col xs={24} sm={12} xl={6} key={c.title}>
                <StatCard {...c} />
              </Col>
            ))}
          </Row>

          {/* Detailed progress bars */}
          <Row gutter={[16, 16]} className="mt-5">
            {metrics.map((m, i) => (
              <Col xs={24} md={8} key={i}>
                <Card>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8 }}>
                    {m.icon}
                    <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{m.label}</p>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: 16, whiteSpace: "pre-line", lineHeight: 1.4 }}>
                      {m.display}
                    </p>
                    <div style={{ width: "100%" }}>
                      <Progress
                        percent={m.pct}
                        strokeColor={m.color}
                        trailColor="#e8e8e8"
                        size="small"
                        format={(p) => <span style={{ fontSize: 12, color: "var(--ve-text-muted)" }}>{p}%</span>}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ve-text-muted)" }}>{m.remaining}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Overall bar */}
          <Row className="mt-5">
            <Col span={24}>
              <Card>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <RiseOutlined style={{ fontSize: 22, color: "#1677ff" }} />
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>Overall Performance</p>
                      <p style={{ fontSize: 13, color: "var(--ve-text-muted)", margin: 0 }}>
                        Average achievement across all targets
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "#1677ff" }}>{overallPct}%</span>
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Set / Edit Target Modal */}
      <Modal
        title={`Set Target — ${now.format("MMMM YYYY")}`}
        open={targetModalOpen}
        onCancel={() => setTargetModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={savingTarget}
        okText="Save Target"
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveTarget}
          initialValues={{ revenue_target: branch?.revenue_target, order_target: branch?.order_target }}
          style={{ marginTop: 8 }}
        >
          <Form.Item label="Revenue Target (LKR)" name="revenue_target" rules={[{ required: true, message: "Revenue target is required" }]}>
            <InputNumber min={0} step={1000} style={{ width: "100%" }} formatter={fmtInput} parser={parseInput} />
          </Form.Item>
          <Form.Item label="Orders Target" name="order_target" rules={[{ required: true, message: "Orders target is required" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
}
