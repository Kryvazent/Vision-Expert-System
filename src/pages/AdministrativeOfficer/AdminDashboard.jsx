import React, { useState, useEffect } from "react";
import { Layout, Col, Row, Typography, Calendar, Alert, Tag, Badge, Card } from "antd";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import dayjs from "dayjs";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";
import DateClinicSessionModal from "../../component/optimetrist/dashboard/DateClinicSessionModal";
import MonthClinicSessionModal from "../../component/optimetrist/dashboard/MonthClinicSessionModal";

const { Content } = Layout;

const LOAD_LOW_STOCK = gql`
  query getLowStock($branchId: Int!) {
    branch_low_stockCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          branch_id
          product_id
          product_name
          product_sku
          frame_type
          in_stock_count
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

const GET_DASHBOARD_CARD_STATS = gql`
  query GetDashboardCardStats($branchId: Int!, $today: Date!) {
    damaged_stockCollection {
      edges {
        node {
          id
          damaged_quantity
          stock {
            branch_id
          }
        }
      }
    }
    frameCollection(filter: { branch_id: { eq: $branchId }, status: { eq: "damaged" } }) {
      edges {
        node {
          id
        }
      }
    }
    clinicCollection(filter: { branch_id: { eq: $branchId }, date: { eq: $today } }) {
      edges {
        node {
          id
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
`;

export default function AdminDashboard() {
  const { staff } = useAuth();
  const [modelType, setModelType]           = useState("date");
  const [showModal, setShowModal]           = useState(false);
  const [lowStockItems, setLowStockItems]   = useState([]);
  const [calendarClinics, setCalendarClinics] = useState({});
  const [currentPanelDate, setCurrentPanelDate] = useState(dayjs());
  const [startDate, setStartDate]           = useState("");
  const [dateClinicModalData, setDateClinicModalData] = useState(null);

  const [loadLowStock, { data: lowStockData }] = useLazyQuery(LOAD_LOW_STOCK, { fetchPolicy: "network-only" });
  const [loadCardStats, { data: cardStatsData }] = useLazyQuery(GET_DASHBOARD_CARD_STATS, { fetchPolicy: "network-only" });
  const [getVisibleClinics]                    = useLazyQuery(GET_VISIBLE_CLINICS, {
    onCompleted: (data) => {
      const grouped = {};
      data?.clinicCollection?.edges?.forEach(({ node }) => {
        if (!grouped[node.date]) grouped[node.date] = [];
        grouped[node.date].push(node);
      });
      setCalendarClinics(grouped);
    },
  });
  const [getClinicsAndSessionsByDate] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (!staff?.branch?.id) return;

    const branchId = Number(staff.branch.id);
    loadLowStock({ variables: { branchId } });
    loadCardStats({ variables: { branchId, today: dayjs().format("YYYY-MM-DD") } });
  }, [loadLowStock, loadCardStats, staff?.branch?.id]);

  useEffect(() => {
    if (lowStockData) {
      setLowStockItems((lowStockData?.branch_low_stockCollection?.edges ?? []).map((e) => e.node));
    }
  }, [lowStockData]);

  useEffect(() => {
    if (!staff?.branch?.id) return;
    const startOfMonth = currentPanelDate.startOf("month");
    const start = startOfMonth.startOf("week");
    const end   = start.add(41, "day");
    getVisibleClinics({
      variables: {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        branchId: Number(staff.branch.id),
      },
    });
  }, [currentPanelDate, staff?.branch?.id, getVisibleClinics]);

  const daySelected = async (date) => {
    if (!staff?.branch?.id) return;

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
      variables: { date: formattedDate, branchId: Number(staff.branch.id) },
    });

    const projectEdges = result.data?.projectCollection?.edges ?? [];
    const projectsWithClinics = projectEdges.filter(
      (project) => (project.node.clinicCollection?.edges?.length ?? 0) > 0
    );
    const clinicCount = projectsWithClinics.reduce(
      (t, p) => t + (p.node.clinicCollection?.edges?.length ?? 0), 0
    );

    setDateClinicModalData({
      date: formattedDate,
      projectCount: projectsWithClinics.length,
      clinicCount,
      description: projectsWithClinics?.[0]?.node?.description ?? "",
      projectAndClinicList: projectsWithClinics.map((project) => ({
        projectName: project.node.project_name,
        description: project.node.description,
        clinics: project.node.clinicCollection?.edges?.map(({ node: c }) => ({
          id: c.id, venue: c.venue, from: c.from, to: c.to,
          responsiblePerson1: c.responsible_person_01,
          responsiblePerson2: c.responsible_person_02,
          responsiblePerson1Contact: c.responsible_person_01_contact_no,
          responsiblePerson2Contact: c.responsible_person_02_contact_no,
          status: c.clinic_status?.status,
        })) ?? [],
      })),
    });
  };

  const dateCellRender = (date) => {
    const key = date.format("YYYY-MM-DD");
    const clinics = calendarClinics[key] ?? [];
    const isCurrentMonth = date.month() === currentPanelDate.month();
    const isToday = date.isSame(dayjs(), "day");

    return (
      <div
        style={{
          minHeight: 118,
          height: "100%",
          padding: "8px 10px",
          borderTop: isToday ? "2px solid #1677ff" : "1px solid #f0f0f0",
          background: clinics.length ? "#F8FBFF" : "transparent",
        }}
      >
        <div
          style={{
            textAlign: "right",
            color: isCurrentMonth ? "#262626" : "#bfbfbf",
            fontWeight: isToday ? 700 : 400,
          }}
        >
          {date.format("DD")}
        </div>

        {clinics.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <Badge
              count={`${clinics.length} clinic${clinics.length > 1 ? "s" : ""}`}
              style={{ backgroundColor: "#1677ff", fontSize: 10 }}
            />
            {clinics.slice(0, 2).map((clinic) => (
              <Tag
                key={clinic.id}
                color="blue"
                style={{
                  marginInlineEnd: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {clinic.venue || "Clinic"}
              </Tag>
            ))}
            {clinics.length > 2 && <Tag style={{ marginInlineEnd: 0 }}>+{clinics.length - 2} more</Tag>}
          </div>
        )}
      </div>
    );
  };

  const cellRender = (current, info) =>
    info.type === "date" ? dateCellRender(current) : info.originNode;

  const branchId = Number(staff?.branch?.id);
  const damagedStockCount = cardStatsData?.damaged_stockCollection?.edges
    ?.filter(({ node }) => Number(node.stock?.branch_id) === branchId)
    ?.reduce((sum, { node }) => sum + Number(node.damaged_quantity || 0), 0) || 0;
  const damagedFrameCount = cardStatsData?.frameCollection?.edges?.length || 0;
  const todayClinicEdges = cardStatsData?.clinicCollection?.edges || [];
  const todayClinicCount = todayClinicEdges.length;
  const todaySessionCount = todayClinicEdges.reduce(
    (sum, { node }) => sum + (node.clinic_attend_customerCollection?.edges?.length || 0),
    0
  );

  const statCards = [
    { title: "Low Stock Items",  value: lowStockItems.length, accent: "#faad14", subtitle: "Items below threshold" },
    { title: "Damaged Stock",    value: damagedStockCount + damagedFrameCount, accent: "#ff4d4f", subtitle: "Reported damaged" },
    { title: "Today's Clinics",  value: todayClinicCount, accent: "#1677ff", subtitle: "Clinics scheduled today" },
    { title: "Today's Sessions", value: todaySessionCount, accent: "#52c41a", subtitle: "Customer sessions today" },
  ];

  return (
    <PageLayout title="Admin Dashboard" subtitle="Branch schedule and inventory overview">
      {/* ── Low stock alert ── */}
      {lowStockItems.length > 0 && (
        <Alert
          message="Low Stock Alert"
          description={
            <div>
              <p style={{ marginBottom: 8 }}>The following items are below 200 units:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {lowStockItems.map((item) => (
                  <Tag key={item.product_id} color="orange">
                    {item.product_name} ({item.product_sku}) — {item.in_stock_count} units
                  </Tag>
                ))}
              </div>
            </div>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((c) => (
          <Col xs={24} sm={12} xl={6} key={c.title}>
            <StatCard {...c} />
          </Col>
        ))}
      </Row>

      {/* ── Calendar ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Branch Schedule">
            <Calendar
              fullscreen
              cellRender={cellRender}
              onSelect={daySelected}
              onPanelChange={(date) => setCurrentPanelDate(date)}
              style={{ borderRadius: "var(--ve-radius-lg)", overflow: "hidden" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Modals ── */}
      {modelType === "date" && showModal && dateClinicModalData && (
        <DateClinicSessionModal show={showModal} setShow={setShowModal} dateClinicModalData={dateClinicModalData} />
      )}
      {modelType === "month" && showModal && (
        <MonthClinicSessionModal show={showModal} setShow={setShowModal} />
      )}
    </PageLayout>
  );
}
