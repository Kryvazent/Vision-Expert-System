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
  query GetVisibleClinics($startDate: Date!, $endDate: Date!, $branchId: ID!) {
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
  query GetProjectsAndClinicsByDate($date: Date!, $branchId: ID!) {
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
  const [getClinicsAndSessionsByDate, { data: selectedDateData }] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE);

  useEffect(() => {
    if (staff?.branch?.id) loadLowStock({ variables: { branchId: staff.branch.id } });
  }, [loadLowStock, staff]);

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
    getVisibleClinics({ variables: { startDate: start, endDate: end, branchId: staff.branch.id } });
  }, [currentPanelDate, staff?.branch?.id, getVisibleClinics]);

  const daySelected = (date) => {
    setModelType("date");
    const formattedDate = date.format("YYYY-MM-DD");
    setStartDate(formattedDate);
    getClinicsAndSessionsByDate({ variables: { date: formattedDate, branchId: staff.branch.id } });

    const projectCount = selectedDateData?.projectCollection?.edges?.length ?? 0;
    const clinicCount  = selectedDateData?.projectCollection?.edges?.reduce(
      (t, p) => t + (p.node.clinicCollection?.edges?.length ?? 0), 0
    ) ?? 0;

    setDateClinicModalData({
      date: formattedDate,
      projectCount,
      clinicCount,
      description: selectedDateData?.projectCollection?.edges?.[0]?.node?.description ?? "",
      projectAndClinicList: selectedDateData?.projectCollection?.edges?.map((project) => ({
        projectName: project.node.project_name,
        clinics: project.node.clinicCollection?.edges?.map(({ node: c }) => ({
          id: c.id, venue: c.venue, from: c.from, to: c.to,
          responsiblePerson1: c.responsible_person_01,
          responsiblePerson2: c.responsible_person_02,
          responsiblePerson1Contact: c.responsible_person_01_contact_no,
          responsiblePerson2Contact: c.responsible_person_02_contact_no,
          status: c.clinic_status?.status,
        })) ?? [],
      })) ?? [],
    });

    setShowModal(true);
  };

  const dateCellRender = (date) => {
    const clinics = calendarClinics[date.format("YYYY-MM-DD")] ?? [];
    if (!clinics.length) return null;
    return (
      <div style={{ marginTop: 2 }}>
        <Badge
          count={`${clinics.length} Clinic${clinics.length > 1 ? "s" : ""}`}
          style={{ backgroundColor: "var(--ve-primary)", fontSize: 10 }}
        />
      </div>
    );
  };

  const cellRender = (current, info) =>
    info.type === "date" ? dateCellRender(current) : info.originNode;

  const statCards = [
    { title: "Low Stock Items",  value: lowStockItems.length, accent: "#faad14", subtitle: "Items below threshold" },
    { title: "Damaged Stock",    value: 0,                    accent: "#ff4d4f", subtitle: "Reported damaged" },
    { title: "Today's Clinics",  value: 0,                    accent: "#1677ff", subtitle: "Clinics scheduled today" },
    { title: "Today's Sessions", value: 0,                    accent: "#52c41a", subtitle: "Sessions scheduled today" },
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
