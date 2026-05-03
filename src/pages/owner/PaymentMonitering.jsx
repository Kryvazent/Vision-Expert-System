import { Card, Table, Select } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// 🔹 Dummy Data
const chartData = [
  { branch: "Kadawatha", revenue: 280000, paid: 200000, pending: 80000 },
  { branch: "Kandy", revenue: 220000, paid: 180000, pending: 40000 },
  { branch: "Colombo", revenue: 150000, paid: 120000, pending: 30000 },
];

const pieData = [
  { name: "Kadawatha", value: 31 },
  { name: "Kandy", value: 25 },
  { name: "Nuwara Eliya", value: 16 },
  { name: "Dambulla", value: 14 },
];

const COLORS = ["#2563eb", "#f59e0b", "#ef4444", "#10b981"];

// 🔹 Table Data
const tableData = [
  {
    key: 1,
    branch: "Kadawatha",
    orders: 8,
    customers: 3,
    revenue: 272000,
    paid: 199000,
    pending: 73000,
    rate: "73.2%",
  },
  {
    key: 2,
    branch: "Kandy",
    orders: 6,
    customers: 4,
    revenue: 221000,
    paid: 179000,
    pending: 42000,
    rate: "81.0%",
  },
];

// 🔹 Table Columns
const columns = [
  { title: "Branch", dataIndex: "branch" },
  { title: "Orders", dataIndex: "orders" },
  { title: "Customers", dataIndex: "customers" },

  {
    title: "Total Revenue",
    dataIndex: "revenue",
    render: (val) => (
      <span className="text-blue-600">Rs. {val.toLocaleString()}</span>
    ),
  },

  {
    title: "Amount Paid",
    dataIndex: "paid",
    render: (val) => (
      <span className="text-green-600">Rs. {val.toLocaleString()}</span>
    ),
  },

  {
    title: "Pending",
    dataIndex: "pending",
    render: (val) => (
      <span className="text-red-500">Rs. {val.toLocaleString()}</span>
    ),
  },

  { title: "Collection Rate", dataIndex: "rate" },
];

export default function PaymentMonitoring() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* 🔹 Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Branch-wise Sales & Payment Monitoring
        </h1>

        <Select
          defaultValue="Monthly"
          className="w-40"
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly" },
          ]}
        />
      </div>

      {/* 🔹 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card>
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-xl font-bold">Rs. 873,000</h2>
        </Card>

        <Card>
          <p className="text-gray-500">Amount Collected</p>
          <h2 className="text-xl font-bold">Rs. 692,000</h2>
        </Card>

        <Card>
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="text-xl font-bold">Rs. 181,000</h2>
        </Card>

        <Card>
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">24</h2>
        </Card>

      </div>

      {/* 🔹 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <Card title="Branch-wise Revenue & Payment Status">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="branch" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563eb" />
              <Bar dataKey="paid" fill="#10b981" />
              <Bar dataKey="pending" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card title="Revenue Distribution by Branch">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>

      </div>

      {/* 🔹 Table */}
      <Card title="Detailed Branch Sales Report">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
        />
      </Card>

    </div>
  );
}