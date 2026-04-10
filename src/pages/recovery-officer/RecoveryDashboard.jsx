import { Layout, Card, Table, Button, Typography } from "antd";
import StatCard from "../../component/recoveryOfficer/StatCard";

const { Content } = Layout;
const { Text, Title } = Typography;

// Table data
const tableData = [
  {
    key: 1,
    month: "February 2024",
    centerName: "Kadawath",
    time: "10:00 AM - 1.00 PM",
    totalUnits: 45,
    totalRevenue: "Rs. 150,000",
  },
  {
    key: 2,
    month: "January 2024",
    centerName: "Gampaha",
    time: "2:00 PM - 5.00 PM",
    totalUnits: 38,
    totalRevenue: "Rs. 120,000",
  }
]

const columns = [
  {
    title: "Month",
    dataIndex: "month",
    key: "month",
    onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
  },
  {
    title: "Center Name",
    dataIndex: "centerName",
    key: "centerName",
    onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    render: (text) => (
      <Text className="text-blue-500 font-medium cursor-pointer hover:text-blue-700">{text}</Text>
    ),
  },
  {
    title: "Time",
    dataIndex: "time",
    key: "time",
    onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
  },
  {
    title: "Total Units",
    dataIndex: "totalUnits",
    key: "totalUnits",
    onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
  },
  {
    title: "Total Revenue",
    dataIndex: "totalRevenue",
    key: "totalRevenue",
    onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    render: (text) => (
      <Text className="text-green-600 font-semibold">{text}</Text>
    ),
  },
];

const summaryRow = () => (
  <Table.Summary fixed>
    <Table.Summary.Row className="bg-gray-300">
      <Table.Summary.Cell index={0} colSpan={3}>
        <Text strong>Total</Text>
      </Table.Summary.Cell>
      <Table.Summary.Cell index={3}>
        <Text strong>143</Text>
      </Table.Summary.Cell>
      <Table.Summary.Cell index={4}>
        <Text strong className="text-green-500">
          Rs. 395,500
        </Text>
      </Table.Summary.Cell>
    </Table.Summary.Row>
  </Table.Summary>
);

function RecoveryDashboard() {
  return (
    <Content className="p-8">
      <div className="flex gap-15 align-items-left mb-5">
        <StatCard iconType="shopping" title="Today's Deliveries" />
        <StatCard iconType="user" title="Total Units" />
        <StatCard iconType="dollar" title="Pending Payments" />
        <StatCard iconType="file" title="Overdue Units" />
      </div>

      {/* Table Section */}
      <Card
        className="rounded-2xl shadow-sm border border-gray-100" Style={{ padding: "28px" }}
      >
        <div className="flex items-center justify-between mb-6">
          <Title level={5} className="mb-0!" style={{ fontWeight: 600 }}>
            Delivery Schedule by Branch
          </Title>
          <Button
            type="primary"
            style={{ background: "#2563EB", borderRadius: 8, fontWeight: 600, height: 40 }}
          >
            Recovery Sheet
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          summary={summaryRow}
          rowClassName="hover:bg-blue-50 transition-colors"
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </Card>
    </Content>
  );
}

export default RecoveryDashboard;
