import {
  FileTextOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

function ReportCard({ icon, title, description, color, btnColor }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        height: "250px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        transition: "0.3s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")
      }
    >
      {/* Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 15px",
          borderRadius: "50%",
          backgroundColor: color + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          color: color,
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3>{title}</h3>

      {/* Description */}
      <p style={{ color: "#666", fontSize: 14 }}>{description}</p>

      {/* Button */}
      <button
        style={{
          background: btnColor,
          color: "#fff",
          border: "none",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        Generate Report
      </button>
    </div>
  );
}



export default function Reports() {
  return (
    <div style={{ padding: 20 }}>

      <h2 style={{ marginBottom: 20 ,  fontSize: 20 }}>Reports</h2>

      {/* FLEX CONTAINER */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",   // VERY IMPORTANT
          gap: "20px",
        }}
      >

        {/* Each card wrapper */}
        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<FileTextOutlined />}
            title="Daily Report"
            description="View today's deliveries and pending items"
            color="#3b82f6"
            btnColor="#2563eb"
          />
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<BarChartOutlined />}
            title="Monthly Report"
            description="Generate monthly sales and performance"
            color="#10b981"
            btnColor="#059669"
          />
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<DollarOutlined />}
            title="Payments Report"
            description="View revenue, losses and payment summary"
            color="#f59e0b"
            btnColor="#f59e0b"
          />
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<FileSearchOutlined />}
            title="Recovery Report"
            description="Track outstanding payments and recovery"
            color="#ef4444"
            btnColor="#ef4444"
          />
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<FileSearchOutlined />}
            title="Overdue Payments Report"
            description="Review overdue invoices and non-payments"
            color="#dc2626"
            btnColor="#dc2626"
          />
        </div>

        <div style={{ flex: "1 1 300px" }}>
          <ReportCard
            icon={<BarChartOutlined />}
            title="Financial Reports"
            description="Generate reports for financial overview"
            color="#0ea5e9"
            btnColor="#0284c7"
          />
        </div>

      </div>
    </div>
  );
}






