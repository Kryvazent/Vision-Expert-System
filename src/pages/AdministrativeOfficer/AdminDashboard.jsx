import React, { useState, useEffect, useMemo } from "react";
import { Button, Col, Row, Select, Alert, Tag, Card } from "antd";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { useAuth } from "../../const/functions";
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
  query GetVisibleClinics($branchId: Int!) {
    projectCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          project_name
          branch_id
          clinicCollection {
            edges {
              node {
                id
                date
                venue
                from
                to
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
  const branchId = Number(staff?.branch?.id ?? staff?.branch_id);
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
      data?.projectCollection?.edges?.forEach(({ node: project }) => {
        project.clinicCollection?.edges?.forEach(({ node: clinic }) => {
          if (!grouped[clinic.date]) grouped[clinic.date] = [];
          grouped[clinic.date].push({
            ...clinic,
            project: {
              id: project.id,
              project_name: project.project_name,
              branch_id: project.branch_id,
            },
          });
        });
      });
      setCalendarClinics(grouped);
    },
    onError: () => setCalendarClinics({}),
  });
  const [getClinicsAndSessionsByDate] = useLazyQuery(GET_PROJECTS_AND_CLINICS_BY_DATE, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (!branchId) return;

    loadLowStock({ variables: { branchId } });
    loadCardStats({ variables: { branchId, today: dayjs().format("YYYY-MM-DD") } });
  }, [loadLowStock, loadCardStats, branchId]);

  useEffect(() => {
    if (lowStockData) {
      setLowStockItems((lowStockData?.branch_low_stockCollection?.edges ?? []).map((e) => e.node));
    }
  }, [lowStockData]);

  useEffect(() => {
    if (!branchId) return;
    getVisibleClinics({
      variables: {
        branchId,
      },
    });
  }, [currentPanelDate, branchId, getVisibleClinics]);

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

  const getDateCounts = (date) => {
    const key = date.format("YYYY-MM-DD");
    const clinics = calendarClinics[key] ?? [];
    const projectCount = new Set(clinics.map((clinic) => clinic.project?.id).filter(Boolean)).size;

    return {
      clinics,
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
