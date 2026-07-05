import { Card, Col, Row, Table, Tag, Button, Space, Progress, Popconfirm, Tooltip, message, Select } from "antd";
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
import dayjs from "dayjs";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";
import DateClinicSessionModal from "../../component/optimetrist/dashboard/DateClinicSessionModal";
import MonthClinicSessionModal from "../../component/optimetrist/dashboard/MonthClinicSessionModal";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: index,
  label: dayjs().month(index).format("MMM"),
}));
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

const GET_VISIBLE_CLINICS = gql`
  query GetVisibleClinics($startDate: Date!, $endDate: Date!, $branchId: Int!) {
    clinicCollection(filter: { date: { gte: $startDate, lte: $endDate }, branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          date
          venue
          from
          to
          project { id project_name branch_id }
          responsible_person_01
          responsible_person_02
          responsible_person_01_contact_no
          responsible_person_02_contact_no
          clinic_status { id status }
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
                id venue from to date
                responsible_person_01
                responsible_person_02
                responsible_person_01_contact_no
                responsible_person_02_contact_no
                clinic_status { id status }
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
  const branchId = Number(staff?.branch?.id ?? staff?.branch_id);
  const [modelType, setModelType] = useState("date");
  const [showModal, setShowModal] = useState(false);
  const [calendarClinics, setCalendarClinics] = useState({});
  const [currentPanelDate, setCurrentPanelDate] = useState(dayjs());
  const [startDate, setStartDate] = useState("");
  const [dateClinicModalData, setDateClinicModalData] = useState(null);

  const [loadOrders, { data: orderData, loading, error }] = useLazyQuery(LOAD_ORDERS, { fetchPolicy: "network-only" });
  const [getVisibleClinics] = useLazyQuery(GET_VISIBLE_CLINICS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const grouped = {};
      data?.clinicCollection?.edges?.forEach(({ node }) => {
        if (!grouped[node.date]) grouped[node.date] = [];
        grouped[node.date].push(node);
      });
      setCalendarClinics(grouped);
    },
    onError: () => setCalendarClinics({}),
  });
  const [getClinicsAndSessionsByDate] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (branchId) loadOrders({ variables: { branchId } });
  }, [loadOrders, branchId]);

  useEffect(() => {
    if (!branchId) return;
    const startOfMonth = currentPanelDate.startOf("month");
    const start = startOfMonth.startOf("week");
    const end = start.add(41, "day");
    getVisibleClinics({
      variables: {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        branchId,
      },
    });
  }, [currentPanelDate, branchId, getVisibleClinics]);

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

  const daySelected = async (date) => {
    if (!branchId) return;

    setModelType("date");
    const formattedDate = date.format("YYYY-MM-DD");
    setStartDate(formattedDate);
    setDateClinicModalData({
      date: formattedDate,
      projectCount: 0,
      clinicCount: 0,
      description: "",
      projectAndClinicList: [],
    });
    setShowModal(true);

    const result = await getClinicsAndSessionsByDate({
      variables: { date: formattedDate, branchId },
    });

    const projectEdges = result.data?.projectCollection?.edges ?? [];
    const projectsWithClinics = projectEdges.filter(
      (project) => (project.node.clinicCollection?.edges?.length ?? 0) > 0
    );
    const clinicCount = projectsWithClinics.reduce(
      (total, project) => total + (project.node.clinicCollection?.edges?.length ?? 0),
      0
    );

    setDateClinicModalData({
      date: formattedDate,
      projectCount: projectsWithClinics.length,
      clinicCount,
      description: projectsWithClinics?.[0]?.node?.description ?? "",
      projectAndClinicList: projectsWithClinics.map((project) => ({
        projectName: project.node.project_name,
        description: project.node.description,
        clinics: project.node.clinicCollection?.edges?.map(({ node: clinic }) => ({
          id: clinic.id,
          venue: clinic.venue,
          from: clinic.from,
          to: clinic.to,
          responsiblePerson1: clinic.responsible_person_01,
          responsiblePerson2: clinic.responsible_person_02,
          responsiblePerson1Contact: clinic.responsible_person_01_contact_no,
          responsiblePerson2Contact: clinic.responsible_person_02_contact_no,
          status: clinic.clinic_status?.status,
        })) ?? [],
      })),
    });
  };

  const getDateCounts = (date) => {
    const key = date.format("YYYY-MM-DD");
    const clinics = calendarClinics[key] ?? [];
    const projectCount = new Set(clinics.map((clinic) => clinic.project?.id).filter(Boolean)).size;

    return {
      projectCount,
      clinicCount: clinics.length,
    };
  };

  const calendarDays = useMemo(() => {
    const start = currentPanelDate.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
  }, [currentPanelDate]);

  const yearOptions = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 15 }, (_, index) => {
      const year = currentYear - 5 + index;
      return { value: year, label: String(year) };
    });
  }, []);

  const setCalendarYear = (year) => {
    setCurrentPanelDate((prev) => prev.year(year));
  };

  const setCalendarMonth = (month) => {
    setCurrentPanelDate((prev) => prev.month(month));
  };

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
          <Card title="Branch Schedule">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginBottom: 26,
                flexWrap: "wrap",
              }}
            >
              <Select
                value={currentPanelDate.year()}
                options={yearOptions}
                onChange={setCalendarYear}
                style={{ width: 100 }}
              />
              <Select
                value={currentPanelDate.month()}
                options={MONTH_OPTIONS}
                onChange={setCalendarMonth}
                style={{ width: 100 }}
              />
              <Button.Group>
                <Button type="primary">Month</Button>
                <Button
                  onClick={() => {
                    setModelType("month");
                    setShowModal(true);
                  }}
                >
                  Year
                </Button>
              </Button.Group>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
                gap: "0 10px",
                overflowX: "auto",
              }}
            >
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  style={{
                    minWidth: 120,
                    textAlign: "right",
                    padding: "0 10px 8px",
                    fontSize: 16,
                    color: "#262626",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((date) => {
                const key = date.format("YYYY-MM-DD");
                const isCurrentMonth = date.isSame(currentPanelDate, "month");
                const isSelected = startDate === key;
                const isToday = date.isSame(dayjs(), "day");
                const { projectCount, clinicCount } = getDateCounts(date);
                const hasEvents = projectCount > 0 || clinicCount > 0;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => daySelected(date)}
                    style={{
                      minWidth: 120,
                      minHeight: 128,
                      border: "none",
                      borderTop: isSelected ? "2px solid #1677ff" : "1px solid #edf0f3",
                      background: isSelected ? "#e6f4ff" : "#fff",
                      padding: "10px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        alignSelf: "flex-end",
                        color: isToday ? "#1677ff" : isCurrentMonth ? "#262626" : "#bfbfbf",
                        fontWeight: isToday ? 700 : 400,
                        fontSize: 16,
                      }}
                    >
                      {date.format("DD")}
                    </span>

                    {hasEvents && (
                      <span
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {projectCount > 0 && (
                          <Tag color="blue" style={{ marginInlineEnd: 0, borderRadius: 14, fontWeight: 600 }}>
                            {projectCount} Project{projectCount !== 1 ? "s" : ""}
                          </Tag>
                        )}
                        {clinicCount > 0 && (
                          <Tag color="green" style={{ marginInlineEnd: 0, borderRadius: 14, fontWeight: 600 }}>
                            {clinicCount} Clinic{clinicCount !== 1 ? "s" : ""}
                          </Tag>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
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

      {modelType === "date" && showModal && dateClinicModalData && (
        <DateClinicSessionModal show={showModal} setShow={setShowModal} dateClinicModalData={dateClinicModalData} />
      )}
      {modelType === "month" && showModal && (
        <MonthClinicSessionModal show={showModal} setShow={setShowModal} />
      )}
    </PageLayout>
  );
}
