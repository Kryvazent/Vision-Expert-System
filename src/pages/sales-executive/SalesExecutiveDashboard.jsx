import { Card, Col, Row, Table, Tag, Button, Space, Progress, Popconfirm, Tooltip, message, DatePicker, Collapse, Empty, Typography } from "antd";
import {
  DollarOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { getOrderStatusLabel, normalizeOrderStatus, useAuth } from "../../const/functions";
import dayjs from "dayjs";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const { Text } = Typography;

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
  query getOrders($branchId: Int!) {
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

const GET_PROJECTS_AND_CLINICS_BY_DATE = gql`
  query GetProjectsAndClinicsByDate($date: Date!, $branchId: Int!) {
    projectCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          project_name
          description
          clinicCollection(filter: { date: { eq: $date } }) {
            edges {
              node {
                id
                venue
                from
                to
                date
                responsible_person_01
                responsible_person_02
                responsible_person_01_contact_no
                responsible_person_02_contact_no
                clinic_status { id status }
                clinic_attend_customerCollection {
                  edges {
                    node {
                      id
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

function mapProjectsByDate(data) {
  const projectEdges = data?.projectCollection?.edges ?? [];

  return projectEdges
    .map(({ node: project }) => ({
      id: project.id,
      projectName: project.project_name,
      description: project.description,
      clinics: project.clinicCollection?.edges?.map(({ node: clinic }) => ({
        id: clinic.id,
        venue: clinic.venue,
        from: clinic.from,
        to: clinic.to,
        responsiblePerson1: clinic.responsible_person_01,
        responsiblePerson2: clinic.responsible_person_02,
        responsiblePerson1Contact: clinic.responsible_person_01_contact_no,
        responsiblePerson2Contact: clinic.responsible_person_02_contact_no,
        status: clinic.clinic_status?.status,
        sessionCount: clinic.clinic_attend_customerCollection?.edges?.length ?? 0,
      })) ?? [],
    }))
    .filter((project) => project.clinics.length > 0);
}

function ScheduleDetails({ projects, loading }) {
  if (loading) {
    return <Empty description="Loading schedule..." style={{ padding: "24px 0" }} />;
  }

  if (!projects.length) {
    return <Empty description="No clinics or projects scheduled for this date." style={{ padding: "24px 0" }} />;
  }

  return (
    <Collapse
      defaultActiveKey={projects.map((_, index) => String(index))}
      expandIconPosition="end"
    >
      {projects.map((project, index) => (
        <Collapse.Panel
          key={String(index)}
          header={
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingRight: 8 }}>
              <Text strong>{project.projectName}</Text>
              <Tag color="green" style={{ marginInlineEnd: 0 }}>
                <TeamOutlined /> {project.clinics.length} Clinic{project.clinics.length !== 1 ? "s" : ""}
              </Tag>
            </div>
          }
        >
          <div
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              background: "#f5f7fb",
              borderLeft: "4px solid #1677ff",
              borderRadius: 6,
            }}
          >
            <Text type="secondary">{project.description || "No project description."}</Text>
          </div>

          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {project.clinics.map((clinic, clinicIndex) => (
              <div
                key={clinic.id ?? clinicIndex}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #f0f0f0",
                }}
              >
                <Space wrap>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#e6f4ff",
                      color: "#1677ff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {clinicIndex + 1}
                  </span>
                  <Text strong>{clinic.venue || "No Venue"}</Text>
                  <Tag color="blue">{clinic.sessionCount} Session{clinic.sessionCount !== 1 ? "s" : ""}</Tag>
                  {clinic.status && <Tag color="purple">{clinic.status}</Tag>}
                </Space>
                <Space>
                  <ClockCircleOutlined style={{ color: "#13a37f" }} />
                  <Text>{clinic.from || "--:--"} &rarr; {clinic.to || "--:--"}</Text>
                </Space>
              </div>
            ))}
          </Space>
        </Collapse.Panel>
      ))}
    </Collapse>
  );
}

export default function SalesExecutiveDashboard() {
  const [messageApi, contextHolder] = message.useMessage();
  const [filterStatus, setFilterStatus] = useState("All");
  const { staff } = useAuth();
  const branchId = Number(staff?.branch?.id ?? staff?.branch_id);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const selectedDateKey = selectedDate.format("YYYY-MM-DD");

  const [loadOrders, { data: orderData, loading, error }] = useLazyQuery(LOAD_ORDERS, { fetchPolicy: "network-only" });
  const [loadSchedule, { data: scheduleData, loading: scheduleLoading }] = useLazyQuery(
    GET_PROJECTS_AND_CLINICS_BY_DATE,
    { fetchPolicy: "network-only" }
  );

  useEffect(() => {
    if (branchId) loadOrders({ variables: { branchId } });
  }, [loadOrders, branchId]);

  useEffect(() => {
    if (!branchId) return;
    loadSchedule({ variables: { branchId, date: selectedDateKey } });
  }, [branchId, selectedDateKey, loadSchedule]);

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
    refetchQueries: branchId ? [{ query: LOAD_ORDERS, variables: { branchId } }] : [],
    awaitRefetchQueries: true,
  });

  const scheduledProjects = useMemo(() => mapProjectsByDate(scheduleData), [scheduleData]);
  const selectedClinicCount = scheduledProjects.reduce((sum, project) => sum + project.clinics.length, 0);
  const selectedSessionCount = scheduledProjects.reduce(
    (sum, project) => sum + project.clinics.reduce((clinicSum, clinic) => clinicSum + clinic.sessionCount, 0),
    0
  );

  const handleHold = async (record) => {
    try {
      await holdOrder({ variables: { orderId: record.orderId } });
      messageApi.warning(`Order #${record.orderId} placed on hold.`);
    } catch {
      messageApi.error(`Failed to hold order #${record.orderId}.`);
    }
  };

  const statCards = [
    {
      title: "Selected Date Clinics",
      value: selectedClinicCount,
      icon: <CalendarOutlined />,
      accent: "#1677ff",
      subtitle: selectedDateKey,
    },
    {
      title: "Selected Date Patients",
      value: selectedSessionCount,
      icon: <TeamOutlined />,
      accent: "#52c41a",
      subtitle: "Expected appointments",
    },
    {
      title: "Projects",
      value: scheduledProjects.length,
      icon: <DollarOutlined />,
      accent: "#eb2f96",
      subtitle: "Scheduled on selected date",
    },
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

      {/* ── Clinic Schedule ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card
            title="Clinic Schedule"
            extra={
              <DatePicker
                allowClear={false}
                value={selectedDate}
                format="YYYY-MM-DD"
                onChange={(date) => setSelectedDate(date || dayjs())}
                style={{ width: 180 }}
              />
            }
          >
            <Space size={10} wrap style={{ marginBottom: 18 }}>
              <Text strong>{selectedDateKey}</Text>
              <Tag color="blue">{scheduledProjects.length} Project{scheduledProjects.length !== 1 ? "s" : ""}</Tag>
              <Tag color="green">{selectedClinicCount} Clinic{selectedClinicCount !== 1 ? "s" : ""}</Tag>
              <Tag color="purple">{selectedSessionCount} Session{selectedSessionCount !== 1 ? "s" : ""}</Tag>
            </Space>

            <ScheduleDetails projects={scheduledProjects} loading={scheduleLoading} />
          </Card>
        </Col>
      </Row>

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
