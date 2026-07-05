import { Card, Col, Collapse, DatePicker, Empty, Row, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { useAuth } from "../../const/functions";
import PageLayout from "../../component/shared/PageLayout";
import StatCard from "../../component/shared/StatCard";

const { Text } = Typography;

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

export default function OptimetristDashboard() {
  const { staff } = useAuth();
  const branchId = Number(staff?.branch?.id ?? staff?.branch_id);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const selectedDateKey = selectedDate.format("YYYY-MM-DD");

  const [loadSchedule, { data: scheduleData, loading: scheduleLoading }] = useLazyQuery(
    GET_PROJECTS_AND_CLINICS_BY_DATE,
    { fetchPolicy: "network-only" }
  );

  useEffect(() => {
    if (!branchId) return;
    loadSchedule({ variables: { branchId, date: selectedDateKey } });
  }, [branchId, selectedDateKey, loadSchedule]);

  const scheduledProjects = useMemo(() => mapProjectsByDate(scheduleData), [scheduleData]);
  const selectedClinicCount = scheduledProjects.reduce((sum, project) => sum + project.clinics.length, 0);
  const selectedSessionCount = scheduledProjects.reduce(
    (sum, project) => sum + project.clinics.reduce((clinicSum, clinic) => clinicSum + clinic.sessionCount, 0),
    0
  );

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
      icon: <EyeOutlined />,
      accent: "#52c41a",
      subtitle: "Expected appointments",
    },
    {
      title: "Projects",
      value: scheduledProjects.length,
      icon: <MedicineBoxOutlined />,
      accent: "#eb2f96",
      subtitle: "Scheduled on selected date",
    },
  ];

  return (
    <PageLayout title="Optometrist Dashboard" subtitle="Clinic schedule and patient appointments">
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={8} key={card.title}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

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
    </PageLayout>
  );
}
