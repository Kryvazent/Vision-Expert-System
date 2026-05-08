import React, { useState } from "react";
import TopBar from "../../component/optimetrist/dashboard/TopBar";
import { Layout, Col, Row, Table, Typography, Calendar } from "antd";
import logo from "../../assets/images/logo.jpeg";
import Card from "antd/es/card/Card";
import { icons } from "../../assets/icons/AdminIcons";
import StatCard from "../../component/Admin/StatCard";

const { Content } = Layout;
const { Title } = Typography;

function AdminDashboard() {
  const [modelType, setModelType] = useState("date");
  const [showModal, setShowModal] = useState(false);

  const topBar = [
    {
      title: "Today Clinics",
      value: 0,
      iconSVG: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"
            fill="#378ADD"
          />
          <path
            d="M3 19c0-3.31 4.03-6 9-6s9 2.69 9 6"
            stroke="#378ADD"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19 7v4M21 9h-4"
            stroke="#378ADD"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      bg: "#E6F1FB",
    },
    {
      title: "Today Sessions",
      value: 0,
      iconSVG: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="14"
            rx="2.5"
            stroke="#1D9E75"
            strokeWidth="1.8"
          />
          <path
            d="M8 10h8M8 13.5h5"
            stroke="#1D9E75"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10" r="1" fill="#1D9E75" />
          <circle cx="7" cy="13.5" r="1" fill="#1D9E75" />
          <path
            d="M8 20h8M12 18v2"
            stroke="#1D9E75"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
      bg: "#E1F5EE",
    },
    {
      title: "Damaged Stock",
      value: 0,
      iconSVG: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Box bottom */}
          <path
            d="M1 10h16v7H1z"
            stroke="#D93025"
            strokeWidth="1.6"
            fill="none"
          />
          {/* Left flap broken */}
          <path
            d="M1 10L3 5"
            stroke="#D93025"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right flap broken */}
          <path
            d="M17 10L15 4"
            stroke="#D93025"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Center torn flap */}
          <path
            d="M3 5h5l1 3h4l2-4"
            stroke="#D93025"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Warning exclamation */}
          <path
            d="M9 12v2"
            stroke="#D93025"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="9" cy="15.5" r="0.6" fill="#D93025" />
        </svg>
      ),
      bg: "#FDECEA",
    },

    {
      title: "Low Stock",
      value: 0,
      iconSVG: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M1 15h16"
            stroke="#E07B00"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <rect
            x="2"
            y="4"
            width="3.5"
            height="11"
            rx="1"
            stroke="#E07B00"
            strokeWidth="1.4"
          />
          <rect
            x="2"
            y="4"
            width="3.5"
            height="11"
            rx="1"
            fill="#E07B00"
            fillOpacity="0.18"
          />
          <rect
            x="7"
            y="8"
            width="3.5"
            height="7"
            rx="1"
            stroke="#E07B00"
            strokeWidth="1.4"
          />
          <rect
            x="7"
            y="8"
            width="3.5"
            height="7"
            rx="1"
            fill="#E07B00"
            fillOpacity="0.18"
          />
          <rect
            x="12"
            y="12"
            width="3.5"
            height="3"
            rx="1"
            stroke="#E07B00"
            strokeWidth="1.4"
          />
          <rect
            x="12"
            y="12"
            width="3.5"
            height="3"
            rx="1"
            fill="#E07B00"
            fillOpacity="0.18"
          />
          <path
            d="M13.75 5.5v4M12 8l1.75 2 1.75-2"
            stroke="#E07B00"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      bg: "#FFF4E5",
    },
  ];

  const getListData = (value) => {
    let listData = [];

    switch (value.date()) {
      case 8:
        listData = [
          {
            type: "warning",
            clinicName: "Morning Eye Clinic",
            place: "Room 101, Main Building",
            sessions: [
              { id: 1, patient: "John Smith", from: "08:00", to: "08:30" },
              { id: 2, patient: "Mary Johnson", from: "08:30", to: "09:00" },
            ],
          },
          {
            type: "success",
            clinicName: "Afternoon Clinic",
            place: "Room 203, Annex Block",
            sessions: [
              { id: 3, patient: "David Lee", from: "14:00", to: "14:45" },
            ],
          },
        ];
        break;
      case 10:
        listData = [
          {
            type: "warning",
            clinicName: "General Eye Clinic",
            place: "Room 105, Main Building",
            sessions: [
              { id: 4, patient: "Sara White", from: "09:00", to: "09:30" },
              { id: 5, patient: "Tom Brown", from: "09:30", to: "10:00" },
              { id: 6, patient: "Alice Green", from: "10:00", to: "10:30" },
            ],
          },
        ];
        break;
      case 15:
        listData = [
          {
            type: "warning",
            clinicName: "Specialist Clinic",
            place: "Suite 3, West Wing",
            sessions: [
              { id: 7, patient: "Bob Martin", from: "10:00", to: "11:00" },
              { id: 8, patient: "Linda Clark", from: "11:00", to: "12:00" },
            ],
          },
          {
            type: "success",
            clinicName: "Pediatric Eye Clinic",
            place: "Room 301, Children's Block",
            sessions: [
              { id: 9, patient: "Emma Davis", from: "13:00", to: "13:30" },
              { id: 10, patient: "Liam Wilson", from: "13:30", to: "14:00" },
              { id: 11, patient: "Olivia Taylor", from: "14:00", to: "14:30" },
              { id: 12, patient: "Noah Anderson", from: "14:30", to: "15:00" },
            ],
          },
        ];
        break;
      default:
        listData = [];
    }
    return listData;
  };

  const getMonthData = (value) => {
    const daysInMonth = value.daysInMonth();
    let totalSessions = 0;
    let totalClinics = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayValue = value.date(day);
      const listData = getListData(dayValue);
      totalSessions += listData.filter(
        (item) => item.type === "success",
      ).length;
      totalClinics += listData.filter((item) => item.type === "warning").length;
    }

    if (totalSessions === 0 && totalClinics === 0) return null;
    return { totalSessions, totalClinics };
  };

  const monthCellRender = (value) => {
    const data = getMonthData(value);
    if (!data) return null;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "4px 0",
        }}
      >
        {data.totalClinics > 0 && (
          <span
            style={{
              fontSize: 12,
              background: "#E6F1FB",
              color: "#185FA5",
              borderRadius: 4,
              padding: "2px 8px",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {data.totalClinics} clinic{data.totalClinics > 1 ? "s" : ""}
          </span>
        )}

        {data.totalSessions > 0 && (
          <span
            style={{
              fontSize: 12,
              background: "#E1F5EE",
              color: "#0F6E56",
              borderRadius: 4,
              padding: "2px 8px",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {data.totalSessions} session{data.totalSessions > 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  };

  const dateCellRender = (value) => {
    // console.log("value in dateCellRender:", value);

    const listData = getListData(value);
    if (!listData.length) return null;

    const sessionCount = listData.filter(
      (item) => item.type === "success",
    ).length;
    const clinicCount = listData.filter(
      (item) => item.type === "warning",
    ).length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {clinicCount > 0 && (
          <span
            style={{
              fontSize: 11,
              background: "#E6F1FB",
              color: "#185FA5",
              borderRadius: 4,
              padding: "1px 5px",
              whiteSpace: "nowrap",
            }}
          >
            {clinicCount} clinic{clinicCount > 1 ? "s" : ""}
          </span>
        )}

        {sessionCount > 0 && (
          <span
            style={{
              fontSize: 11,
              background: "#E1F5EE",
              color: "#0F6E56",
              borderRadius: 4,
              padding: "1px 5px",
              whiteSpace: "nowrap",
            }}
          >
            {sessionCount} session{sessionCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  };

  const cellRender = (current, info) => {
    if (info.type === "date") {
      setModelType("date");
      return dateCellRender(current);
    }
    if (info.type === "month") {
      setModelType("month");
      return monthCellRender(current);
    }
    return info.originNode;
  };

  const daySelected = (date) => {
    console.log("Selected date:", date);
    setShowModal(true);
  };
  return (
    <>
      <Layout>
        {/* Content */}
        <Content className="p-8" style={{ padding: "20px" }}>
          {/* <div className="flex gap-6 mb-5">
                <StatCard title="Damaged Stock" value="14" iconType="customers" color="#2F54EB" bgColor="#E6F7FF"  />
                <StatCard title="Inventory Items" value="567" iconType="inventory" color="#00A854" bgColor="#E6F7F0" />
                <StatCard title="Low Stock Items" value="23" iconType="stock" color="#F5222D" bgColor="#FFF1F0" />
              </div> */}

          <div className="mt-5 h-[calc(100vh-17.5vh)] overflow-y-auto pr-2">
            <Col className="mx-5">
              <Row>
                <TopBar data={topBar} />
              </Row>

              <Row className="mt-5 ">
                <Card title="Schedule" className="w-full">
                  <Content className="mt-5 h-[calc(100vh-40.5vh)] overflow-y-auto pr-2">
                    <Calendar
                      fullscreen={true}
                      cellRender={cellRender}
                      onSelect={daySelected}
                      style={{ height: "150px" }}
                    />
                  </Content>
                </Card>
              </Row>
            </Col>
          </div>
        </Content>
      </Layout>

      {modelType === "date" && showModal && (
        <DateClinicSessionModal show={showModal} setShow={setShowModal} />
      )}
      {modelType === "month" && showModal && (
        <MonthClinicSessionModal show={showModal} setShow={setShowModal} />
      )}
    </>
  );
}

export default AdminDashboard;
