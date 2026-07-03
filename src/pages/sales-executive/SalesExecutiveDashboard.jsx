import { Card, Col, Row, Table, Tag, Button, Space, Progress, Popconfirm, Tooltip, message } from "antd";
import {
  DollarOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { getOrderStatusLabel, normalizeOrderStatus, useAuth } from "../../const/functions";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const STATUS_COLORS = {
  active:    "success",
  hold:      "warning",
  canceled:  "error",
  completed: "success",
  pending:   "processing",
};

const STATUS_STROKE = {
  active: "#52c41a", hold: "#faad14", canceled: "#ff4d4f", completed: "#52c41a", pending: "#1677ff",
};

const LOAD_ORDERS = gql`
  query getOrders($branchId: ID!) {
    customerCollection {
      edges {
        node {
          id first_name last_name contact_no
          customer_has_branchCollection(filter: { branch_id: { eq: $branchId } }) {
            edges {
              node {
                id
                clinic_attend_customerCollection {
                  edges {
                    node {
                      id
                      clinic { id date }
                      orderCollection(filter: { order_status_id: { neq: 4 } }) {
                        edges {
                          node {
                            id placed_at total_price
                            order_status { id status }
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
    }
  }
`;

const HOLD_ORDER = gql`
  mutation holdOrder($orderId: ID!) {
    updateorderCollection(filter: { id: { eq: $orderId } }, set: { order_status_id: 3 }, atMost: 1) {
      records { id }
    }
  }
`;

const fmt = (v) =>
  new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(v);

export default function SalesExecutiveDashboard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [filterStatus, setFilterStatus] = useState("All");
  const { staff } = useAuth();

  const [loadOrders, { data: orderData, loading, error }] = useLazyQuery(LOAD_ORDERS, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (staff?.branch?.id) loadOrders({ variables: { branchId: staff.branch.id } });
  }, [loadOrders, staff?.branch?.id]);

  const orders = useMemo(() => {
    if (!orderData?.customerCollection?.edges) return [];
    const result = [];
    orderData.customerCollection.edges.forEach(({ node: customer }) => {
      const name = `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();
      customer.customer_has_branchCollection?.edges?.forEach(({ node: branch }) => {
        branch.clinic_attend_customerCollection?.edges?.forEach(({ node: ca }) => {
          ca.orderCollection?.edges?.forEach(({ node: o }) => {
            result.push({
              key:        o.id,
              orderId:    o.id,
              customer:   name,
              contactNo:  customer.contact_no,
              amount:     o.total_price ?? 0,
              status:     o.order_status?.status ?? "Unknown",
              statusKey:  normalizeOrderStatus(o.order_status?.status),
              createdAt:  o.placed_at ? new Date(o.placed_at).toLocaleDateString("en-LK") : "—",
              clinicDate: ca.clinic?.date ? new Date(ca.clinic.date).toLocaleDateString("en-LK") : "—",
            });
          });
        });
      });
    });
    return result;
  }, [orderData]);

  const totalOrders     = orders.length;
  const pendingOrders   = orders.filter((o) => o.statusKey === "pending").length;
  const activeOrders    = orders.filter((o) => o.statusKey === "active").length;
  const cancelledOrders = orders.filter((o) => o.statusKey === "canceled").length;
  const holdOrders      = orders.filter((o) => o.statusKey === "hold").length;
  const totalRevenue    = orders.filter((o) => ["active", "completed"].includes(o.statusKey)).reduce((s, o) => s + o.amount, 0);

  const filteredOrders = useMemo(() =>
    filterStatus === "All" ? orders : orders.filter((o) => o.statusKey === normalizeOrderStatus(filterStatus)),
    [filterStatus, orders]
  );

  const [holdOrder, { loading: holdLoading }] = useMutation(HOLD_ORDER, {
    refetchQueries: [{ query: LOAD_ORDERS, variables: { branchId: staff?.branch?.id } }],
    awaitRefetchQueries: true,
  });

  const handleHold = async (record) => {
    try {
      await holdOrder({ variables: { orderId: record.orderId } });
      messageApi.warning(`Order #${record.orderId} placed on hold.`);
    } catch {
      messageApi.error(`Failed to hold order #${record.orderId}.`);
    }
  };

  const statCards = [
    { title: "Pending Orders",  value: pendingOrders,    icon: <ShoppingCartOutlined />, accent: "#1677ff", subtitle: "Awaiting processing" },
    { title: "Active Orders",   value: activeOrders,     icon: <CheckCircleOutlined />,  accent: "#52c41a", subtitle: "In progress" },
    { title: "Money on Hand",   value: fmt(totalRevenue),icon: <DollarOutlined />,       accent: "#faad14", subtitle: "Active & completed" },
  ];

  const statusBreakdown = [
    { label: "Active",    value: activeOrders },
    { label: "Pending",   value: pendingOrders },
    { label: "Hold",      value: holdOrders },
    { label: "Canceled",  value: cancelledOrders },
  ];

  const columns = [
    { title: "Order ID",   dataIndex: "orderId",   render: (v) => <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span> },
    { title: "Customer",   dataIndex: "customer",  render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
    { title: "Contact",    dataIndex: "contactNo", render: (v) => <span style={{ color: "var(--ve-text-muted)" }}>{v ?? "—"}</span> },
    { title: "Clinic Date",dataIndex: "clinicDate",render: (v) => <span style={{ color: "var(--ve-text-muted)" }}>{v}</span> },
    {
      title: "Amount", dataIndex: "amount",
      render: (v) => <span style={{ fontWeight: 600 }}>{fmt(v)}</span>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status", dataIndex: "status",
      render: (v) => <Tag color={STATUS_COLORS[normalizeOrderStatus(v)] || "default"}>{getOrderStatusLabel(v)}</Tag>,
    },
    { title: "Order Date", dataIndex: "createdAt", render: (v) => <span style={{ color: "var(--ve-text-muted)" }}>{v}</span> },
    {
      title: "Action", key: "action",
      render: (_, record) => {
        const canHold = record.statusKey === "pending";
        if (canHold) {
          return (
            <Popconfirm
              title="Hold this order?"
              description={`Order #${record.orderId} will be placed on hold.`}
              onConfirm={() => handleHold(record)}
              okText="Yes, Hold"
              cancelText="Cancel"
              icon={<ExclamationCircleOutlined style={{ color: "#faad14" }} />}
              okButtonProps={{ loading: holdLoading, style: { background: "#faad14", borderColor: "#faad14" } }}
            >
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                loading={holdLoading}
                style={{ color: "#faad14", borderColor: "#ffe58f", background: "#fffbe6" }}
              >
                Hold
              </Button>
            </Popconfirm>
          );
        }
        return (
          <Tooltip title={record.statusKey === "hold" ? "Already on hold" : `Cannot hold a ${record.status} order`}>
            <Button size="small" icon={<PauseCircleOutlined />} disabled>Hold</Button>
          </Tooltip>
        );
      },
    },
  ];

  const filterButtons = (
    <Space wrap>
      {["All", "Active", "Pending", "Hold", "Completed", "Canceled"].map((s) => (
        <Button
          key={s} size="small"
          type={filterStatus === s ? "primary" : "default"}
          onClick={() => setFilterStatus(s)}
        >
          {s}
        </Button>
      ))}
    </Space>
  );

  return (
    <PageLayout title="Sales Executive Dashboard" subtitle="Order overview and management">
      {contextHolder}

      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((c) => (
          <Col xs={24} sm={12} xl={8} key={c.title}>
            <StatCard {...c} loading={loading} />
          </Col>
        ))}
      </Row>

      {/* ── Status breakdown ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Order Status Overview">
            <Row gutter={[16, 16]}>
              {statusBreakdown.map((item) => {
                const pct = totalOrders ? Math.round((item.value / totalOrders) * 100) : 0;
                const key = normalizeOrderStatus(item.label);
                return (
                  <Col xs={24} md={12} xl={6} key={item.label}>
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                      <Tag color={STATUS_COLORS[key] || "default"} style={{ margin: 0 }}>{item.label}</Tag>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{item.value} order{item.value !== 1 ? "s" : ""}</span>
                    </div>
                    <Progress
                      percent={pct}
                      showInfo={false}
                      strokeWidth={8}
                      strokeColor={STATUS_STROKE[key] || "#1677ff"}
                      trailColor="#f0f0f0"
                    />
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Orders table ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Recent Orders" extra={filterButtons}>
            <Table
              dataSource={filteredOrders}
              columns={columns}
              pagination={{ pageSize: 8, size: "small" }}
              size="middle"
              scroll={{ x: 900 }}
              loading={loading || holdLoading}
              locale={{ emptyText: error ? `Error: ${error.message}` : "No orders found" }}
            />
          </Card>
        </Col>
      </Row>
    </PageLayout>
  );
}
