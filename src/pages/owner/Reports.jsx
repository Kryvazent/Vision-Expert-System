import {
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileSearchOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import { Row, Col, Modal, DatePicker, Select, message, Table, Button, Space, Statistic, Typography, Card } from "antd";

import { useState } from "react";

import { gql } from "@apollo/client";
import { useLazyQuery, useQuery } from "@apollo/client/react";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { headerStyles, buttonStyles, cardStyles, modalStyles, formStyles } from "../../const/designSystem";

const { Title, Text } = Typography;

const GET_BRANCHES = gql`
  query {
    branchCollection {
      edges {
        node {
          id
          branch_name
        }
      }
    }
  }
`;

const GET_REPORT_DATA = gql`
  query {
    orderCollection {
      edges {
        node {
          id
          placed_at
          estimated_delivery
          total_price
          order_status_id

          paymentCollection {
            edges {
              node {
                advance
                total_payment
              }
            }
          }

          clinic_attend_customer {
            customer_has_branch {
              branch {
                branch_name
              }

              customer {
                id
                first_name
                last_name
                contact_no
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

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewSummary, setPreviewSummary] = useState({});
  const { data: branchData } = useQuery(GET_BRANCHES);
  const { data, loading, error } = useQuery(GET_REPORT_DATA);

  // ================= OPEN REPORT MODAL =================

  const openReportModal = (type) => {
    setReportType(type);
    setOpenModal(true);
  };

  const generatePreviewData = () => {
    let filteredData = [];

    switch (reportType) {
      case "Daily Report":
        filteredData = orders
          .filter((order) => {
            const dateMatch = order.placedAt?.split("T")[0] === selectedDate;
            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;
            return dateMatch && branchMatch;
          })
          .map((order) => ({
            key: order.id,
            "Order ID": `OD${order.id}`,
            "Customer ID": `CUS-${order.customerId}`,
            Customer: order.customer,
            Phone: order.phone,
            Branch: order.branch,
            "Order Date": order.placedAt.split("T")[0],
            "Estimated Delivery": order.estimatedDelivery.split("T")[0],
            "Total Price": order.totalPrice,
            Advance: order.advance,
            "Amount Received": order.totalPaid,
            Pending: order.pending,
          }));
        break;

      case "Monthly Report":
        filteredData = orders
          .filter((order) => {
            const monthMatch = order.placedAt?.startsWith(selectedMonth);
            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;
            return monthMatch && branchMatch;
          })
          .map((order) => ({
            key: order.id,
            "Order ID": `OD${order.id}`,
            "Customer ID": `CUS-${order.customerId}`,
            Customer: order.customer,
            Phone: order.phone,
            Branch: order.branch,
            "Order Date": order.placedAt.split("T")[0],
            "Estimated Delivery": order.estimatedDelivery.split("T")[0],
            "Total Price": order.totalPrice,
            Advance: order.advance,
            "Amount Received": order.totalPaid,
            Pending: order.pending,
          }));
        break;

      case "Overdue Payments Report":
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredData = orders
          .filter((order) => {
            const monthMatch =
              order.estimatedDelivery?.startsWith(selectedMonth);
            const deliveryDate = new Date(order.estimatedDelivery);
            deliveryDate.setHours(0, 0, 0, 0);
            const overdue = deliveryDate < today;
            const hasPending = order.pending > 0;
            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;
            return overdue && hasPending && branchMatch;
          })
          .map((order) => ({
            key: order.id,
            "Order ID": `OD${order.id}`,
            "Customer ID": `CUS-${order.customerId}`,
            Customer: order.customer,
            Phone: order.phone,
            Branch: order.branch,
            "Order Date": order.placedAt.split("T")[0],
            "Estimated Delivery": order.estimatedDelivery.split("T")[0],
            "Total Price": order.totalPrice,
            Advance: order.advance,
            "Amount Received": order.totalPaid,
            Pending: order.pending,
          }));
        break;

      default:
        break;
    }

    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item["Total Price"],
      0,
    );
    const totalAdvance = filteredData.reduce(
      (sum, item) => sum + item.Advance,
      0,
    );
    const totalReceived = filteredData.reduce(
      (sum, item) => sum + item["Amount Received"],
      0,
    );
    const totalPending = filteredData.reduce(
      (sum, item) => sum + item.Pending,
      0,
    );

    setPreviewData(filteredData);
    setPreviewSummary({
      totalRevenue,
      totalAdvance,
      totalReceived,
      totalPending,
      recordCount: filteredData.length,
    });
    setPreviewModalVisible(true);
  };

  const orders =
    data?.orderCollection?.edges?.map((item) => {
      const order = item.node;

      const payment = order?.paymentCollection?.edges?.[0]?.node;

      const customer =
        order?.clinic_attend_customer?.customer_has_branch?.customer;

      const branch = order?.clinic_attend_customer?.customer_has_branch?.branch;

      const branchName = branch?.branch_name || "Unknown";

      const totalPrice = Number(order?.total_price) || 0;

      const totalPaid = Number(payment?.total_payment) || 0;

      const advance = Number(payment?.advance) || 0;

      const pending = Math.max(0, totalPrice - totalPaid);

      return {
        id: order.id,

        placedAt: order.placed_at,

        estimatedDelivery: order.estimated_delivery,

        orderStatus: order.order_status_id,

        customerId: customer?.id,

        customer: `${customer?.first_name || ""} ${customer?.last_name || ""}`,

        branch: branchName,
        phone: customer?.contact_no || "-",

        totalPrice,

        advance,

        totalPaid,

        pending,
      };
    }) || [];

  const branchOptions = [
    {
      value: "All Branches",
      label: "All Branches",
    },

    ...(branchData?.branchCollection?.edges?.map((item) => ({
      value: item.node.branch_name,
      label: item.node.branch_name,
    })) || []),
  ];

  // EXPORT EXCEL

  const exportExcel = () => {
    let filteredData = [];

    switch (reportType) {
      // ================= DAILY REPORT =================
      case "Daily Report":
        filteredData = orders
          .filter((order) => {
            const dateMatch = order.placedAt?.split("T")[0] === selectedDate;

            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;

            return dateMatch && branchMatch;
          })

          .map((order) => ({
            "Order ID": `OD${order.id}`,

            "Customer ID": `CUS-${order.customerId}`,

            Customer: order.customer,

            Phone: order.phone,

            Branch: order.branch,

            "Order Date": order.placedAt.split("T")[0],

            "Estimated Delivery": order.estimatedDelivery.split("T")[0],

            "Total Price": order.totalPrice,

            Advance: order.advance,

            "Amount Received": order.totalPaid,

            Pending: order.pending,
          }));
        break;

      // ================= MONTHLY REPORT =================
      case "Monthly Report":
        filteredData = orders
          .filter((order) => {
            const monthMatch = order.placedAt?.startsWith(selectedMonth);

            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;

            return monthMatch && branchMatch;
          })

          .map((order) => ({
            "Order ID": `OD${order.id}`,

            "Customer ID": `CUS-${order.customerId}`,

            Customer: order.customer,

            Phone: order.phone,

            Branch: order.branch,

            "Order Date": order.placedAt.split("T")[0],

            "Estimated Delivery": order.estimatedDelivery.split("T")[0],

            "Total Price": order.totalPrice,

            Advance: order.advance,

            "Amount Received": order.totalPaid,

            Pending: order.pending,
          }));

        break;

      case "Overdue Payments Report":
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        filteredData = orders
          .filter((order) => {
            const monthMatch =
              order.estimatedDelivery?.startsWith(selectedMonth);

            const deliveryDate = new Date(order.estimatedDelivery);
            deliveryDate.setHours(0, 0, 0, 0);

            const overdue = deliveryDate < today;

            const hasPending = order.pending > 0;

            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;

            return overdue && hasPending && branchMatch;
          })

          .map((order) => ({
            "Order ID": `OD${order.id}`,

            "Customer ID": `CUS-${order.customerId}`,

            Customer: order.customer,

            Phone: order.phone,

            Branch: order.branch,

            "Order Date": order.placedAt.split("T")[0],

            "Estimated Delivery": order.estimatedDelivery.split("T")[0],

            "Total Price": order.totalPrice,

            Advance: order.advance,

            "Amount Received": order.totalPaid,

            Pending: order.pending,
          }));

        break;

      // ================= RECOVERY REPORT =================
      case "Recovery Report":
        filteredData = orders
          .filter((order) => {
            const monthMatch =
              order.estimatedDelivery?.startsWith(selectedMonth);

            const deliveryDate = new Date(order.estimatedDelivery);
            deliveryDate.setHours(0, 0, 0, 0);

            const overdue = deliveryDate < today;

            const hasPending = order.pending > 0;

            const branchMatch =
              selectedBranch === "All Branches"
                ? true
                : order.branch === selectedBranch;

            return monthMatch && overdue && hasPending && branchMatch;
          })

          .map((order) => ({
            "Order ID": `OD${order.id}`,

            "Customer ID": `CUS-${order.customerId}`,

            Customer: order.customer,

            Phone: order.phone,

            Branch: order.branch,

            "Order Date": order.placedAt.split("T")[0],

            "Estimated Delivery": order.estimatedDelivery.split("T")[0],

            "Total Price": order.totalPrice,

            Advance: order.advance,

            "Amount Received": order.totalPaid,

            Pending: order.pending,
          }));

        break;

      default:
        break;
    }

    // ================= TOTALS =================

    const totalRevenue = filteredData.reduce(
      (sum, item) => sum + item["Total Price"],
      0,
    );

    const totalAdvance = filteredData.reduce(
      (sum, item) => sum + item.Advance,
      0,
    );

    const totalReceived = filteredData.reduce(
      (sum, item) => sum + item["Amount Received"],
      0,
    );

    const totalPending = filteredData.reduce(
      (sum, item) => sum + item.Pending,
      0,
    );

    // ================= CREATE WORKBOOK =================

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(reportType);
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.5,
        bottom: 0.5,
        header: 0.3,
        footer: 0.3,
      },
    };

    // ================= REPORT TITLE =================

    worksheet.mergeCells("A1:K1");

    const titleCell = worksheet.getCell("A1");

    titleCell.value = "VISION EXPERT";

    titleCell.font = {
      bold: true,
      size: 22,
      color: {
        argb: "FFFFFF",
      },
    };

    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "1E3A8A",
      },
    };

    worksheet.getRow(1).height = 30;

    worksheet.mergeCells("A2:K2");

    const reportCell = worksheet.getCell("A2");

    reportCell.value = reportType.toUpperCase();

    reportCell.font = {
      bold: true,
      size: 16,
      color: {
        argb: "1E3A8A",
      },
    };

    reportCell.alignment = {
      horizontal: "center",
    };

    worksheet.getRow(2).height = 25;
    // ================= ADD DATA =================

    //Report information
    worksheet.addRow([]);

    const generatedRow = worksheet.addRow([
      "Generated Date",
      new Date().toLocaleDateString(),
    ]);

    generatedRow.getCell(1).font = {
      bold: true,
    };

    const branchRow = worksheet.addRow(["Branch", selectedBranch]);

    branchRow.getCell(1).font = {
      bold: true,
    };

    const dateRow = worksheet.addRow([
      reportType === "Monthly Report" ||
      reportType === "Overdue Payments Report"
        ? "Selected Month"
        : "Selected Date",

      reportType === "Monthly Report" ||
      reportType === "Overdue Payments Report"
        ? selectedMonth || "-"
        : selectedDate || "-",
    ]);

    dateRow.getCell(1).font = {
      bold: true,
    };

    //Summary

    worksheet.addRow([]);

    worksheet.addRow(["SUMMARY"]);

    const summaryTitle = worksheet.lastRow;

    summaryTitle.font = {
      bold: true,
      size: 14,
      color: {
        argb: "FFFFFF",
      },
    };

    summaryTitle.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "2563EB",
      },
    };

    summaryTitle.alignment = {
      horizontal: "center",
    };

    worksheet.mergeCells(`A${summaryTitle.number}:B${summaryTitle.number}`);

    // Total Revenue
    const totalRevenueRow = worksheet.addRow(["Total Revenue", totalRevenue]);

    totalRevenueRow.getCell(2).numFmt = '"LKR" #,##0.00';

    totalRevenueRow.getCell(2).alignment = {
      horizontal: "right",
    };

    // Advance Payments
    const advanceRow = worksheet.addRow(["Advance Payments", totalAdvance]);

    advanceRow.getCell(2).numFmt = '"LKR" #,##0.00';

    advanceRow.getCell(2).alignment = {
      horizontal: "right",
    };

    // Amount Received
    const receivedRow = worksheet.addRow(["Amount Received", totalReceived]);

    receivedRow.getCell(2).numFmt = '"LKR" #,##0.00';

    receivedRow.getCell(2).alignment = {
      horizontal: "right",
    };

    // Outstanding Balance
    const pendingRow = worksheet.addRow(["Outstanding Balance", totalPending]);

    pendingRow.getCell(2).numFmt = '"LKR" #,##0.00';

    pendingRow.getCell(2).alignment = {
      horizontal: "right",
    };

    totalRevenueRow.getCell(1).font = { bold: true };
    advanceRow.getCell(1).font = { bold: true };
    receivedRow.getCell(1).font = { bold: true };
    pendingRow.getCell(1).font = { bold: true };

    worksheet.addRow([]);
    worksheet.addRow([]);

    worksheet.addRow([]);

    const detailsRow = worksheet.addRow(["ORDER DETAILS"]);

    //table headers

    worksheet.addRow([
      "Order ID",
      "Customer ID",
      "Customer Name",
      "Phone",
      "Branch",
      "Order Date",
      "Estimated Delivery",
      "Total Price",
      "Advance",
      "Total Received",
      "Outstanding Balance",
    ]);

    const headerRow = worksheet.lastRow;

    headerRow.font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "2563EB" },
    };

    headerRow.height = 22;

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    //order details

    detailsRow.font = {
      bold: true,
      size: 14,
      color: {
        argb: "FFFFFF",
      },
    };

    detailsRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "1E3A8A",
      },
    };

    worksheet.mergeCells(`A${detailsRow.number}:K${detailsRow.number}`);

    detailsRow.alignment = {
      horizontal: "center",
    };

    filteredData.forEach((order) => {
      const row = worksheet.addRow([
        order["Order ID"],
        order["Customer ID"],
        order.Customer,
        order.Phone,
        order.Branch,
        order["Order Date"],
        order["Estimated Delivery"],
        order["Total Price"],
        order.Advance,
        order["Amount Received"],
        order.Pending,
      ]);
      row.height = 20;
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });
    worksheet.columns = [
      { width: 15 }, // Order ID
      { width: 18 }, // Customer ID
      { width: 28 }, // Customer Name
      { width: 18 }, // Phone
      { width: 20 }, // Branch
      { width: 18 }, // Order Date
      { width: 20 }, // Estimated Delivery
      { width: 18 }, // Total Price
      { width: 18 }, // Advance
      { width: 20 }, // Total Received
      { width: 22 }, // Outstanding Balance
    ];

    // ================= DOWNLOAD EXCEL =================

    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer]), `${reportType}.xlsx`);

      message.success("Excel Report Generated Successfully");
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={headerStyles.container}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={headerStyles.title}>
              Reports
            </Title>
            <Text type="secondary" style={headerStyles.subtitle}>
              Generate and export business reports
            </Text>
          </Col>
        </Row>
      </div>

      <Card style={cardStyles.default}>
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
              icon={<FileSearchOutlined />}
              title="Overdue Payments Report"
              description="Generate overdue customer payment reports"
              color="#dc2626"
              btnColor="#dc2626"
              onClick={() => openReportModal("Overdue Payments Report")}
            />
          </Col>
        </Row>
      </Card>

      <Modal
        open={openModal}
        title={reportType}
        onCancel={() => setOpenModal(false)}
        footer={null}
        {...modalStyles.default}
      >
        <div style={{ marginBottom: 20 }}>
          {reportType === "Monthly Report" ||
          reportType === "Overdue Payments Report" ? (
            <>
              <label style={formStyles.label}>Select Month</label>

              <DatePicker
                picker="month"
                className="w-full"
                onChange={(date, dateString) => setSelectedMonth(dateString)}
              />
            </>
          ) : (
            <>
              <label style={formStyles.label}>Select Date</label>

              <DatePicker
                className="w-full"
                style={formStyles.datePicker}
                onChange={(date, dateString) => setSelectedDate(dateString)}
              />
            </>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={formStyles.label}>Select Branch</label>

          <Select
            style={formStyles.select}
            defaultValue="All Branches"
            onChange={(value) => setSelectedBranch(value)}
            options={branchOptions}
          />
        </div>

        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => {
              setOpenModal(false);
              generatePreviewData();
            }}
            style={buttonStyles.primary}
          >
            Preview Report
          </Button>
        </Space>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal
        open={previewModalVisible}
        title={`${reportType} Preview`}
        onCancel={() => setPreviewModalVisible(false)}
        footer={null}
        width={1200}
        {...modalStyles.large}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic
              title="Total Records"
              value={previewSummary.recordCount}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Revenue"
              value={previewSummary.totalRevenue}
              formatter={(value) => `LKR ${value.toLocaleString()}`}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Amount Received"
              value={previewSummary.totalReceived}
              formatter={(value) => `LKR ${value.toLocaleString()}`}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Outstanding"
              value={previewSummary.totalPending}
              formatter={(value) => `LKR ${value.toLocaleString()}`}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Col>
        </Row>

        <Table
          columns={[
            { title: "Order ID", dataIndex: "Order ID", key: "orderId" },
            { title: "Customer ID", dataIndex: "Customer ID", key: "customerId" },
            { title: "Customer", dataIndex: "Customer", key: "customer" },
            { title: "Phone", dataIndex: "Phone", key: "phone" },
            { title: "Branch", dataIndex: "Branch", key: "branch" },
            { title: "Order Date", dataIndex: "Order Date", key: "orderDate" },
            { title: "Est. Delivery", dataIndex: "Estimated Delivery", key: "estDelivery" },
            { title: "Total Price", dataIndex: "Total Price", key: "totalPrice", render: (v) => `LKR ${v.toLocaleString()}` },
            { title: "Advance", dataIndex: "Advance", key: "advance", render: (v) => `LKR ${v.toLocaleString()}` },
            { title: "Received", dataIndex: "Amount Received", key: "received", render: (v) => `LKR ${v.toLocaleString()}` },
            { title: "Pending", dataIndex: "Pending", key: "pending", render: (v) => `LKR ${v.toLocaleString()}` },
          ]}
          dataSource={previewData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
          size="small"
        />

        <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Button onClick={() => setPreviewModalVisible(false)}>Close</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              setPreviewModalVisible(false);
              exportExcel();
            }}
          >
            Download Excel
          </Button>
        </Space>
      </Modal>
    </div>
  );
}
