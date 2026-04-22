import { Card, Table, Select, DatePicker } from "antd";

const { RangePicker } = DatePicker;

export default function SystemActivity() {

  // 🔹 Dummy Data
  const data = [
    {
      key: 1,
      user: "Admin",
      action: "Login",
      module: "System",
      datetime: "05/10/2024 09:00 AM",
    },
    {
      key: 2,
      user: "Sarah Lee",
      action: "Updated Prescription",
      module: "Prescriptions",
      datetime: "05/09/2024 02:45 PM",
    },
    {
      key: 3,
      user: "Mike Smith",
      action: "Edited Product",
      module: "Inventory",
      datetime: "05/08/2024 11:30 AM",
    },
    {
      key: 4,
      user: "John Doe",
      action: "Sent Payment Reminder",
      module: "Payments",
      datetime: "05/07/2024 04:15 PM",
    },
  ];

  // 🔹 Table Columns
  const columns = [
    {
      title: "User",
      dataIndex: "user",
    },
    {
      title: "Action",
      dataIndex: "action",
    },
    {
      title: "Module",
      dataIndex: "module",
    },
    {
      title: "Date & Time",
      dataIndex: "datetime",
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* 🔹 Title */}
      <h1 className="text-2xl font-semibold">System Activity</h1>

      {/* 🔹 Card */}
      <Card>

        {/* 🔹 Filters */}
        <div className="flex flex-wrap gap-4 mb-4">

          <Select
            placeholder="Filter: All Users"
            className="w-56"
            options={[
              { value: "all", label: "All Users" },
              { value: "admin", label: "Admin" },
              { value: "sarah", label: "Sarah Lee" },
              { value: "mike", label: "Mike Smith" },
            ]}
          />

          <RangePicker className="w-72" />

        </div>

        {/* 🔹 Table */}
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
        />

      </Card>

    </div>
  );
}