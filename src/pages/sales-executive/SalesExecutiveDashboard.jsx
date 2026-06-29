import {
  Button,
  Card,
  Col,
  Modal,
  Popconfirm,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { SpectacleVisualization } from "../../component/sales-executive/dashboard/SpectacleVisualization";

import order from "../../assets/icons/sales-executive/order.png";
import active from "../../assets/icons/sales-executive/active-order.png";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

function SalesExecutiveDashboard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [filterStatus, setFilterStatus] = useState("All");

  const { staff } = useAuth();

  const statusColors = {
    Active: "green",
    Hold: "orange",
    Cancelled: "red",
    Completed: "green",
    Pending: "blue",
  };

  const statusStrokeColors = {
    Active: "#52c41a",
    Hold: "#faad14",
    Cancelled: "#ff4d4f",
    Completed: "#52c41a",
    Pending: "#1677ff",
  };

  // ── Load Orders Query ──
  const LOAD_NOT_COMPLETED_ORDERS = gql`
    query getOrders($branchId: ID!) {
      customerCollection {
        edges {
          node {
            id
            first_name
            last_name
            contact_no
            customer_has_branchCollection(
              filter: { branch_id: { eq: $branchId } }
            ) {
              edges {
                node {
                  id
                  clinic_attend_customerCollection {
                    edges {
                      node {
                        id
                        clinic {
                          id
                          date
                        }
                        orderCollection(
                          filter: { order_status_id: { neq: 4 } }
                        ) {
                          edges {
                            node {
                              id
                              placed_at
                              total_price
                              order_status {
                                id
                                status
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
    }
  `;

  const [loadOrders, { data: orderData, loading, error }] = useLazyQuery(
    LOAD_NOT_COMPLETED_ORDERS,
    {
      fetchPolicy: "network-only", 
    }
  );

  useEffect(() => {
    if (staff?.branch?.id) {
      loadOrders({ variables: { branchId: staff.branch.id } });
    }
  }, [loadOrders, staff?.branch?.id]);

  const orders = useMemo(() => {
    if (!orderData?.customerCollection?.edges) return [];

    const result = [];

    orderData.customerCollection.edges.forEach(({ node: customer }) => {
      const customerName =
        `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim();

      customer.customer_has_branchCollection?.edges?.forEach(
        ({ node: branch }) => {
          branch.clinic_attend_customerCollection?.edges?.forEach(
            ({ node: clinicAttend }) => {
              clinicAttend.orderCollection?.edges?.forEach(
                ({ node: orderNode }) => {
                  result.push({
                    key: orderNode.id,
                    orderId: orderNode.id,
                    customer: customerName,
                    contactNo: customer.contact_no,
                    amount: orderNode.total_price ?? 0,
                    status: orderNode.order_status?.status ?? "Unknown",
                    createdAt: orderNode.placed_at
                      ? new Date(orderNode.placed_at).toLocaleDateString(
                        "en-LK"
                      )
                      : "-",
                    clinicDate: clinicAttend.clinic?.date
                      ? new Date(clinicAttend.clinic.date).toLocaleDateString(
                        "en-LK"
                      )
                      : "-",
                  });
                }
              );
            }
          );
        }
      );
    });

    return result;
  }, [orderData]);

  const canHold = (status) => status.toLowerCase() === "pending";

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status.toLowerCase() === "pending").length;
  const activeOrders = orders.filter((o) => o.status.toLowerCase() === "active").length;
  const cancelledOrders = orders.filter((o) => o.status.toLowerCase() === "cancelled").length;
  const holdOrders = orders.filter((o) => o.status.toLowerCase() === "hold").length;

  const totalRevenue = orders
    .filter((o) => o.status.toLowerCase() === "active" || o.status.toLowerCase() === "completed")
    .reduce((sum, o) => sum + o.amount, 0);

  // ── Filtered Orders ──
  const filteredOrders = useMemo(() => {
    if (filterStatus === "All") return orders;
    return orders.filter(
      (o) => o.status.toLowerCase() === filterStatus.toLowerCase()
    );
  }, [filterStatus, orders]);

  // ── Hold Order Mutation ──
  const HOLD_ORDER = gql`
    mutation holdOrder($orderId: ID!) {
      updateorderCollection(
        filter: { id: { eq: $orderId } }
        set: { order_status_id: 3 }
        atMost: 1
      ) {
        records {
          id
        }
      }
    }
  `;

  const [holdOrder, { loading: holdLoading }] = useMutation(HOLD_ORDER, {
    refetchQueries: [
      {
        query: LOAD_NOT_COMPLETED_ORDERS,
        variables: { branchId: staff?.branch?.id },
      },
    ],
    awaitRefetchQueries: true, 
  });

  const handleHoldOrder = async (record) => {
    try {
      await holdOrder({ variables: { orderId: record.orderId } });

      messageApi.open({
        type: "warning",
        content: `Order #${record.orderId} has been placed on hold.`,
        duration: 3,
      });
    } catch (err) {
      console.error("Hold Order Error:", err);
      messageApi.open({
        type: "error",
        content: `Failed to hold order #${record.orderId}. Please try again.`,
        duration: 3,
      });
    }
  };

  const statCards = [
    {
      title: "Pending Orders",
      value: newOrders,
      icon: order,
      accent: "#1677ff",
      subtitle: "Awaiting processing",
    },
    {
      title: "Active Orders",
      value: activeOrders,
      icon: active,
      accent: "#52c41a",
      subtitle: "In progress",
    },
    {
      title: "Money on Hand",
      value: formatCurrency(totalRevenue),
      icon: null,
      accent: "#faad14",
      subtitle: "From active & completed",
      customIcon: (
        <DollarOutlined style={{ color: "#faad14", fontSize: 22 }} />
      ),
    },
  ];

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (v) => (
        <span style={{ fontWeight: 700, color: "#1677ff" }}>#{v}</span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Contact No",
      dataIndex: "contactNo",
      key: "contactNo",
      render: (v) => <span style={{ color: "#595959" }}>{v ?? "-"}</span>,
    },
    {
      title: "Clinic Date",
      dataIndex: "clinicDate",
      key: "clinicDate",
      render: (v) => <span style={{ color: "#8c8c8c" }}>{v}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(v)}</span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag color={statusColors[v] || "blue"}>{v}</Tag>,
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => <span style={{ color: "#8c8c8c" }}>{v}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const holdable = canHold(record.status);

        if (holdable) {
          return (
            <Popconfirm
              title="Hold this order?"
              description={`Order #${record.orderId} will be placed on hold.`}
              onConfirm={() => handleHoldOrder(record)}
              okText="Yes, Hold"
              cancelText="Cancel"
              icon={
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              }
              okButtonProps={{
                loading: holdLoading, 
                style: { background: "#faad14", borderColor: "#faad14" },
              }}
            >
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                loading={holdLoading} // ✅ Show loading state on button
                style={{
                  color: "#faad14",
                  borderColor: "#ffe58f",
                  background: "#fffbe6",
                }}
              >
                Hold Order
              </Button>
            </Popconfirm>
          );
        }

        return (
          <Tooltip
            title={
              record.status === "Hold"
                ? "Already on hold"
                : `Cannot hold a ${record.status} order`
            }
          >
            <Button size="small" icon={<PauseCircleOutlined />} disabled>
              Hold Order
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div className="m-5">
      {contextHolder}

      {/* ── Stat Cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderLeft: `5px solid ${item.accent}`,
                height: "100%",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#8c8c8c",
                      fontSize: 13,
                      marginBottom: 6,
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: "#1f1f1f",
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}
                  >
                    {item.subtitle}
                  </div>
                </div>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${item.accent}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon ? (
                    <img
                      src={item.icon}
                      alt={item.title}
                      style={{ width: 24, height: 24 }}
                    />
                  ) : (
                    item.customIcon
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Status Breakdown ── */}
      <Row gutter={[16, 16]} className="mt-5">
        <Col span={24}>
          <Card
            title="Order Status Overview"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <Row gutter={[16, 16]}>
              {[
                { label: "Active", value: activeOrders },
                { label: "Pending", value: newOrders },
                { label: "Hold", value: holdOrders },
                { label: "Cancelled", value: cancelledOrders },
              ].map((item) => {
                const percent = totalOrders
                  ? Math.round((item.value / totalOrders) * 100)
                  : 0;
                return (
                  <Col xs={24} md={12} xl={6} key={item.label}>
                    <div
                      style={{
                        marginBottom: 8,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Tag
                        color={statusColors[item.label] || "blue"}
                        style={{ margin: 0 }}
                      >
                        {item.label}
                      </Tag>
                      <span style={{ fontWeight: 600 }}>
                        {item.value} order{item.value !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <Progress
                      percent={percent}
                      showInfo={false}
                      strokeWidth={8}
                      strokeColor={statusStrokeColors[item.label] || "#1677ff"}
                      trailColor="#f0f0f0"
                    />
                  </Col>
                );
              })}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* ── Orders Table ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card
            title="Recent Orders"
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
            extra={
              <Space wrap>
                {["All", "Active", "Pending", "Hold", "Cancelled"].map(
                  (status) => (
                    <Button
                      key={status}
                      size="small"
                      type={filterStatus === status ? "primary" : "default"}
                      style={
                        filterStatus === status
                          ? { background: "#1677ff", borderColor: "#1677ff" }
                          : {}
                      }
                      onClick={() => setFilterStatus(status)}
                    >
                      {status}
                    </Button>
                  )
                )}
              </Space>
            }
          >
            <Table
              dataSource={filteredOrders}
              columns={columns}
              pagination={{ pageSize: 5, size: "small" }}
              size="middle"
              scroll={{ x: 900 }}
              loading={loading || holdLoading} // ✅ Show loading during hold too
              locale={{
                emptyText: error
                  ? `Error loading orders: ${error.message}`
                  : "No orders found",
              }}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
}

export default SalesExecutiveDashboard;