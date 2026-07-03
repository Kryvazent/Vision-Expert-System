import { Badge, Card, Col, Row, Calendar } from "antd";
import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";
import DateClinicSessionModal from "../../component/optimetrist/dashboard/DateClinicSessionModal";
import MonthClinicSessionModal from "../../component/optimetrist/dashboard/MonthClinicSessionModal";

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

const GET_VISIBLE_CLINICS = gql`
  query GetVisibleClinics($startDate: Date!, $endDate: Date!, $branchId: ID!) {
    clinicCollection(filter: { date: { gte: $startDate, lte: $endDate }, branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          date
          project { id branch_id }
        }
      }
    }
  }
`;

export default function OptimetristDashboard() {
  const { staff } = useAuth();
  const branchId  = staff?.branch?.id;

  const [modelType, setModelType]               = useState("date");
  const [showModal, setShowModal]               = useState(false);
  const [startDate, setStartDate]               = useState("");
  const [calendarClinics, setCalendarClinics]   = useState({});
  const [currentPanelDate, setCurrentPanelDate] = useState(dayjs());

  const [getClinicsAndSessionsByDate, { data }] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE);
  const [getVisibleClinics]                     = useLazyQuery(GET_VISIBLE_CLINICS, {
    onCompleted: (clinicData) => {
      const grouped = {};
      clinicData?.clinicCollection?.edges?.forEach(({ node }) => {
        if (!grouped[node.date]) grouped[node.date] = [];
        grouped[node.date].push(node);
      });
      setCalendarClinics(grouped);
    },
  });

  useEffect(() => {
    if (!branchId) return;
    const start = currentPanelDate.startOf("month").startOf("week");
    const end   = start.add(41, "day");
    getVisibleClinics({ variables: { startDate: start, endDate: end, branchId } });
  }, [currentPanelDate, branchId, getVisibleClinics]);

  const daySelected = (date) => {
    setModelType("date");
    const formattedDate = date.format("YYYY-MM-DD");
    setStartDate(formattedDate);
    getClinicsAndSessionsByDate({ variables: { date: formattedDate, branchId } });
    setShowModal(true);
  };

  const projectCount = data?.projectCollection?.edges?.length ?? 0;
  const clinicCount  = data?.projectCollection?.edges?.reduce(
    (t, p) => t + (p.node.clinicCollection?.edges?.length ?? 0), 0
  ) ?? 0;

  const dateClinicModalData = {
    date: startDate,
    projectCount,
    clinicCount,
    description: data?.projectCollection?.edges?.[0]?.node?.description ?? "",
    projectAndClinicList: data?.projectCollection?.edges?.map((project) => ({
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

  const cellRender = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  const statCards = [
    { title: "Today's Clinics",   value: 0, icon: <CalendarOutlined />,     accent: "#1677ff", subtitle: "Clinics scheduled today" },
    { title: "Today's Patients",  value: 0, icon: <EyeOutlined />,          accent: "#52c41a", subtitle: "Expected appointments" },
    { title: "Prescriptions",     value: 0, icon: <MedicineBoxOutlined />,  accent: "#eb2f96", subtitle: "Issued this month" },
  ];

  return (
    <PageLayout title="Optometrist Dashboard" subtitle="Clinic schedule and patient appointments">
      {/* ── Stat cards ── */}
      <Row gutter={[16, 16]}>
        {statCards.map((c) => (
          <Col xs={24} sm={8} key={c.title}>
            <StatCard {...c} />
          </Col>
        ))}
      </Row>

      {/* ── Schedule calendar ── */}
      <Row className="mt-5">
        <Col span={24}>
          <Card title="Clinic Schedule">
            <Calendar
              fullscreen
              cellRender={cellRender}
              onSelect={daySelected}
              onPanelChange={(date) => setCurrentPanelDate(date)}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Modals ── */}
      {modelType === "date" && showModal && (
        <DateClinicSessionModal show={showModal} setShow={setShowModal} dateClinicModalData={dateClinicModalData} />
      )}
      {modelType === "month" && showModal && (
        <MonthClinicSessionModal show={showModal} setShow={setShowModal} />
      )}
    </PageLayout>
  );
}
