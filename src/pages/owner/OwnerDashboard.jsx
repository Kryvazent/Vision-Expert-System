import { Card } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CreditCardOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TrophyOutlined,
  WarningOutlined,
  RiseOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

export default function OwnerDashboard() {
  return (
    <div className="p-6 space-y-6">

      {/* 🔹 Title */}
      <h1 className="text-2xl font-semibold">Owner Dashboard</h1>

      {/* 🔹 Top Cards */}
      <div className="flex flex-wrap gap-4">

        <Card className="flex-1 min-w-[200px] relative">
          <DollarOutlined className="absolute right-4 top-4" style={{ color: "#22c55e", fontSize: 22 }}/>
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-xl font-bold">Rs. 873K</h2>
          <p className="text-green-500">+12.5%</p>
        </Card>

        <Card className="flex-1 min-w-[200px] relative">
          <ShoppingOutlined className="absolute right-4 top-4" style={{ color: "#3b82f6", fontSize: 22 }} />
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-xl font-bold">24</h2>
          <p className="text-green-500">+8.3%</p>
        </Card>

        <Card className="flex-1 min-w-[200px] relative">
          <UserOutlined className="absolute right-4 top-4" style={{ color: "#f59e0b", fontSize: 22 }} />
          <p className="text-gray-500">Total Customers</p>
          <h2 className="text-xl font-bold">8</h2>
          <p className="text-green-500">+23%</p>
        </Card>

        <Card className="flex-1 min-w-[200px] relative">
          <CreditCardOutlined className="absolute right-4 top-4" style={{ color: "#ef4444", fontSize: 22 }} />
          <p className="text-gray-500">Pending Payments</p>
          <h2 className="text-xl font-bold">Rs. 181K</h2>
          <p className="text-green-500">-5.2%</p>
        </Card>

      </div>

      {/* 🔹 Quick Access */}
      <Card>
        <h2 className="font-semibold mb-4">Quick Access</h2>

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded">
            <TeamOutlined />
            Manage Users
          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded">
            <AppstoreOutlined />
            Stock Management
          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded">
            <DollarOutlined />
            Payment Monitoring
          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded">
            <BarChartOutlined />
            System Activity
          </button>

          <button className="flex items-center gap-2 border px-4 py-2 rounded">
            <FileTextOutlined />
            Reports
          </button>

        </div>
      </Card>

      {/* 🔹 Charts Section */}
      <div className="flex flex-wrap gap-4">

        <Card className="flex-1 min-w-[350px]">
          <h2 className="font-semibold mb-4">Payments Overview</h2>

          <div className="h-[200px] flex items-center justify-center text-gray-400">
            Chart Placeholder
          </div>

          <div className="flex justify-between mt-4">
            <p className="text-green-600 font-bold flex items-center gap-1">
              <RiseOutlined /> Rs. 583.00
            </p>
            <p className="text-blue-600 font-bold">Rs. 600.00</p>
          </div>
        </Card>

        <Card className="flex-1 min-w-[350px]">
          <h2 className="font-semibold mb-4">Branch Performance</h2>

          <div className="h-[200px] flex items-center justify-center text-gray-400">
            Bar Chart Placeholder
          </div>
        </Card>

      </div>

      {/* 🔹 Bottom Section */}
      <div className="flex flex-wrap gap-4">

        <Card className="flex-1 min-w-[350px]">
          <h2 className="font-semibold mb-4">Product Sales Distribution</h2>

          <div className="h-[200px] flex items-center justify-center text-gray-400">
            Pie Chart Placeholder
          </div>
        </Card>

        <Card className="flex-1 min-w-[350px] space-y-4">
          <h2 className="font-semibold">Branch Overview</h2>

          {[
            { name: "Kadawatha", value: 280 },
            { name: "Kandy", value: 210 },
            { name: "Mahiyanganaya", value: 180 },
            { name: "Nuwara Eliya", value: 150 },
            { name: "Dambulla", value: 120 },
          ].map((branch) => (
            <div key={branch.name}>
              <div className="flex justify-between text-sm">
                <span>{branch.name}</span>
                <span>Rs. {branch.value}K</span>
              </div>

              <div className="w-full bg-gray-200 h-2 rounded mt-1">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${branch.value / 3}%` }}
                ></div>
              </div>
            </div>
          ))}
        </Card>

      </div>

      {/* 🔹 Alerts */}
      <Card>
        <h2 className="font-semibold mb-4">Business Insights & Alerts</h2>

        <div className="flex flex-wrap gap-4">

          <div className="bg-green-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">
            <TrophyOutlined style={{ color: "#22c55e", fontSize: 22 }} />
            <div>
              <p className="font-medium">High Performance</p>
              <p className="text-sm">Kadawatha achieved 150%</p>
            </div>
          </div>

          <div className="bg-yellow-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">
            <WarningOutlined style={{ color: "#eab308", fontSize: 22 }} />
            <div>
              <p className="font-medium">Stock Alert</p>
              <p className="text-sm">Low stock in Kandy</p>
            </div>
          </div>

          <div className="bg-green-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">
            <RiseOutlined style={{ color: "#22c55e", fontSize: 22 }} />
            <div>
              <p className="font-medium">Customer Growth</p>
              <p className="text-sm">23% increase</p>
            </div>
          </div>

          <div className="bg-blue-100 p-4 rounded flex-1 min-w-[200px] flex gap-2">
            <CheckCircleOutlined style={{ color: "#3b82f6", fontSize: 22 }} />
            <div>
              <p className="font-medium">Pending Actions</p>
              <p className="text-sm">15 approvals pending</p>
            </div>
          </div>

        </div>
      </Card>

    </div>
  );
}