import {
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

import { Row, Col, Modal, DatePicker, Select, message } from "antd";

import { useState } from "react";

import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const GET_REPORT_DATA = gql`
  query {
    orderCollection {
      edges {
        node {
          id
          placed_at
          estimated_delivery
          total_payment
          advance

          clinic_attend_customer {
            customer_has_branch {
              branch {
                branch_name
              }

              customer {
                first_name
                last_name
              }
            }
          }
        }
      }
    }
  }
`;

function ReportCard({ icon, title, description, color, btnColor, onClick }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        padding: "24px",
        textAlign: "center",
        height: "260px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      {/* ICON */}
      <div
        style={{
          width: 90,
          height: 90,
          margin: "0 auto 20px",
          borderRadius: "50%",
          backgroundColor: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 34,
          color: color,
        }}
      >
        {icon}
      </div>

      <h2>{title}</h2>

      <p
        style={{
          color: "#666",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        {description}
      </p>

      <button
        onClick={onClick}
        style={{
          background: btnColor,
          color: "white",
          border: "none",
          padding: "10px 18px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Generate Report
      </button>
    </div>
  );
}

export default function Reports() {
  const [openModal, setOpenModal] = useState(false);

  const [reportType, setReportType] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);

  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const [fetchReports, { data, loading, error }] =
    useLazyQuery(GET_REPORT_DATA);

  // OPEN MODAL
  const openReportModal = (type) => {
    setReportType(type);

    setOpenModal(true);
  };

  // EXPORT EXCEL
  const exportExcel = () => {
    const orders = data?.orderCollection?.edges || [];

    const today = new Date();

    let filteredData = [];

    // FILTER LOGIC
    orders.forEach((item) => {
      const order = item.node;

      const total = order.total_payment || 0;

      const paid = order.advance || 0;

      const pending = total - paid;

      const deliveryDate = new Date(order.estimated_delivery);

      const branch =
        order?.clinic_attend_customer?.customer_has_branch?.branch?.branch_name;

      const customer =
        order?.clinic_attend_customer?.customer_has_branch?.customer;

   

      // BRANCH FILTER
      if (
        selectedBranch !== "All Branches" &&
        branch?.toLowerCase().trim() !== selectedBranch?.toLowerCase().trim()
      ) {
        return;
      }

      // DAILY REPORT
      if (reportType === "Daily Report") {
        if (order.placed_at?.split("T")[0] !== selectedDate) {
          return;
        }
      }

      // RECOVERY REPORT
      if (reportType === "Recovery Report") {
        if (pending <= 0) {
          return;
        }
      }

      // OVERDUE REPORT
      if (reportType === "Overdue Payments Report") {
        if (!(today > deliveryDate && pending > 0)) {
          return;
        }
      }

      // PAYMENT REPORT
      if (reportType === "Payments Report") {
        if (paid <= 0) {
          return;
        }
      }

      filteredData.push({
        "Order ID": order.id,

        Customer: customer?.first_name + " " + customer?.last_name,

        Branch: branch,

        "Total Payment": total,

        Advance: paid,

        Pending: pending,

        "Placed Date": order.placed_at?.split("T")[0],

        "Estimated Delivery": order.estimated_delivery?.split("T")[0],
      });
    });

    // TOTALS
    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item["Total Payment"],
      0,
    );

    const totalAdvance = filteredData.reduce(
      (sum, item) => sum + item.Advance,
      0,
    );

    const totalPending = filteredData.reduce(
      (sum, item) => sum + item.Pending,
      0,
    );

    // INDUSTRIAL EXCEL FORMAT
    const excelData = [
      {
        A: "VISION EXPERT",
      },

      {
        A: reportType,
      },

      {
        A: "Generated Date",
        B: new Date().toLocaleDateString(),
      },

      {
        A: "Branch",
        B: selectedBranch,
      },

      {},

      {
        A: "TOTAL REVENUE",
        B: totalRevenue,
      },

      {
        A: "TOTAL ADVANCE",
        B: totalAdvance,
      },

      {
        A: "TOTAL PENDING",
        B: totalPending,
      },

      {},

      ...filteredData,
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData, {
      skipHeader: true,
    });

    // COLUMN WIDTH
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Vision Expert Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `${reportType}.xlsx`);

    message.success("Excel Report Generated Successfully");
  };

  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[20, 20]}>
        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<FileTextOutlined />}
            title="Daily Report"
            description="Generate daily delivery and payment reports"
            color="#2563eb"
            btnColor="#2563eb"
            onClick={() => openReportModal("Daily Report")}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<BarChartOutlined />}
            title="Monthly Report"
            description="Generate monthly branch performance reports"
            color="#10b981"
            btnColor="#059669"
            onClick={() => openReportModal("Monthly Report")}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<DollarOutlined />}
            title="Payments Report"
            description="Generate revenue and collection reports"
            color="#f59e0b"
            btnColor="#f59e0b"
            onClick={() => openReportModal("Payments Report")}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<FileSearchOutlined />}
            title="Recovery Report"
            description="Generate pending payment recovery reports"
            color="#ef4444"
            btnColor="#ef4444"
            onClick={() => openReportModal("Recovery Report")}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<FileSearchOutlined />}
            title="Overdue Payments Report"
            description="Generate overdue customer payment reports"
            color="#dc2626"
            btnColor="#dc2626"
            onClick={() => openReportModal("Overdue Payments Report")}
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <ReportCard
            icon={<BarChartOutlined />}
            title="Financial Reports"
            description="Generate complete business financial reports"
            color="#0ea5e9"
            btnColor="#0284c7"
            onClick={() => openReportModal("Financial Reports")}
          />
        </Col>
      </Row>

      {/* MODAL */}
      <Modal
        open={openModal}
        title={reportType}
        onCancel={() => setOpenModal(false)}
        onOk={() => {
          fetchReports();
          exportExcel();
        }}
        okText="Generate Excel"
      >
        <div style={{ marginBottom: 20 }}>
          <p>Select Date</p>

          <DatePicker
            className="w-full"
            onChange={(date, dateString) => setSelectedDate(dateString)}
          />
        </div>

        <div>
          <p>Select Branch</p>

          <Select
            className="w-full"
            defaultValue="All Branches"
            onChange={(value) => setSelectedBranch(value)}
            options={[
              {
                value: "All Branches",
                label: "All Branches",
              },
              {
                value: "Kadawatha",
                label: "Kadawatha",
              },
              {
                value: "Kandy",
                label: "Kandy",
              },
              {
                value: "Colombo",
                label: "Colombo",
              },
              {
                value: "NuwaraEliya",
                label: "Nuwara Eliya",
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
}
