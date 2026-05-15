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
import { useMemo, useState } from "react";
import { SpectacleVisualization } from "../../component/sales-executive/dashboard/SpectacleVisualization";

import order from "../../assets/icons/sales-executive/order.png";
import active from "../../assets/icons/sales-executive/active-order.png";

function SalesExecutiveDashboard() {

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [messageApi, contextHolder] = message.useMessage();

  const [orders, setOrders] = useState([
    {
      key: "1",
      orderId: "001",
      customer: "Mike",
      status: "Active",
      priority: "High",
      amount: 12500,
      createdAt: "2026-04-11",
      id: "RX-001",
      optometrist: "Dr. Silva",
      customerName: "Mike",
      date: "2026-04-11",
      pd: "62",
      notes: "Wear full time",
      rightEye: { sphere: "-1.25", cylinder: "-0.50", axis: "90", add: "1.00" },
      leftEye: { sphere: "-1.00", cylinder: "-0.25", axis: "80", add: "1.00" },
    },
    {
      key: "2",
      orderId: "002",
      customer: "Sarah",
      status: "Pending",
      priority: "Medium",
      amount: 9800,
      createdAt: "2026-04-10",
      id: "RX-002",
      optometrist: "Dr. Perera",
      customerName: "Sarah",
      date: "2026-04-10",
      pd: "60",
      notes: "Reading glasses only",
      rightEye: { sphere: "+0.75", cylinder: "-0.25", axis: "45", add: "0.75" },
      leftEye: { sphere: "+1.00", cylinder: "-0.50", axis: "60", add: "0.75" },
    },
    {
      key: "3",
      orderId: "003",
      customer: "David",
      status: "Completed",
      priority: "Low",
      amount: 15200,
      createdAt: "2026-04-09",
      id: "RX-003",
      optometrist: "Dr. Silva",
      customerName: "David",
      date: "2026-04-09",
      pd: "64",
      notes: "Outdoor use",
      rightEye: { sphere: "-2.00", cylinder: "-0.75", axis: "120", add: "1.50" },
      leftEye: { sphere: "-1.75", cylinder: "-0.50", axis: "110", add: "1.50" },
    },
    {
      key: "4",
      orderId: "004",
      customer: "Amara",
      status: "Hold",
      priority: "High",
      amount: 6400,
      createdAt: "2026-04-08",
      id: "RX-004",
      optometrist: "Dr. Nair",
      customerName: "Amara",
      date: "2026-04-08",
      pd: "58",
      notes: "Allergic to preservatives",
      rightEye: { sphere: "-0.50", cylinder: "0.00", axis: "0", add: "0.00" },
      leftEye: { sphere: "-0.75", cylinder: "0.00", axis: "0", add: "0.00" },
    },
    {
      key: "5",
      orderId: "005",
      customer: "James",
      status: "Cancelled",
      priority: "Low",
      amount: 4200,
      createdAt: "2026-04-07",
      id: "RX-005",
      optometrist: "Dr. Perera",
      customerName: "James",
      date: "2026-04-07",
      pd: "63",
      notes: "N/A",
      rightEye: { sphere: "+2.00", cylinder: "0.00", axis: "0", add: "2.00" },
      leftEye: { sphere: "+2.25", cylinder: "0.00", axis: "0", add: "2.00" },
    },
  ]);

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

  const priorityColors = {
    High: "red",
    Medium: "orange",
    Low: "green",
  };

  const canHold = (status) => status === "Active" || status === "Pending";

  const handleHoldOrder = (record) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.key === record.key ? { ...o, status: "Hold" } : o
      )
    );
    messageApi.open({
      type: "warning",
      content: `Order #${record.orderId} has been placed on hold.`,
      duration: 3,
    });
  };

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "Pending").length;
  const activeOrders = orders.filter((o) => o.status === "Active").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;
  const holdOrders = orders.filter((o) => o.status === "Hold").length;

  const totalRevenue = orders
    .filter((o) => o.status === "Active" || o.status === "Completed")
    .reduce((sum, o) => sum + o.amount, 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(value);


  const filteredOrders = useMemo(() => {
    if (filterStatus === "All") return orders;
    return orders.filter((o) => o.status === filterStatus);
  }, [filterStatus, orders]);


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
      render: (v) => (
        <Tag color={statusColors[v] || "blue"}>{v}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (
        <span style={{ color: "#8c8c8c" }}>{v}</span>
      ),
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
                style: { background: "#faad14", borderColor: "#faad14" },
              }}
            >
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
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
            <Button
              size="small"
              icon={<PauseCircleOutlined />}
              disabled
            >
              Hold Order
            </Button>
          </Tooltip>
        );
      },
    },
  ];


  return (
    <div className="m-5">

      {/* ── Stat cards ── */}
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
                  <div style={{ color: "#8c8c8c", fontSize: 13, marginBottom: 6 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#1f1f1f" }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: 4 }}>
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

      {/* ── Status breakdown ── */}
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
                { label: "Completed", value: completedOrders },
                { label: "Hold", value: holdOrders },
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

      {/* ── Orders table ── */}
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
                {["All", "Active", "Pending", "Completed", "Hold", "Cancelled"].map(
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
              pagination={{ pageSize: 3, size: "small" }}
              size="middle"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Prescription modal ── */}
      <Modal
        title={null}
        open={showPrescriptionModal}
        onCancel={() => {
          setShowPrescriptionModal(false);
          setSelectedPrescription(null);
        }}
        footer={[
          <Button key="print" onClick={() => window.print()}>
            Print Prescription
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setShowPrescriptionModal(false)}
            style={{ background: "#1677ff", borderColor: "#1677ff" }}
          >
            Close
          </Button>,
        ]}
        width={900}
        centered
        destroyOnClose
      >
        {selectedPrescription && (
          <SpectacleVisualization prescription={selectedPrescription} />
        )}
      </Modal>
    </div>
  );
}

export default SalesExecutiveDashboard;