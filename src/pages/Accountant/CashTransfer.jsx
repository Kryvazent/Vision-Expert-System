import { Card, Select, DatePicker, Table } from "antd";

const { RangePicker } = DatePicker;

export default function CashTransfer() {

  // 🔹 Dummy data
  const data = [
    {
      key: "1",
      id: "CT001",
      date: "2026-04-10",
      from: "Kadawatha",
      to: "Head Office",
      amount: 150000,
      purpose: "Daily sales deposit",
      transferredBy: "Emily Clark",
      approvedBy: "Sarah Lee (Manager)",
      status: "Completed",
      notes: "Cash from 3 days sales",
    },
    {
      key: "2",
      id: "CT002",
      date: "2026-04-10",
      from: "Kandy",
      to: "Head Office",
      amount: 120000,
      purpose: "Daily sales deposit",
      transferredBy: "Sarah Johnson",
      approvedBy: "Manager",
      status: "Completed",
      notes: "Weekly sales collection",
    },
  ];

  // 🔹 Table columns
  const columns = [
    { title: "Transfer ID", dataIndex: "id" },
    { title: "Date", dataIndex: "date" },
    { title: "From", dataIndex: "from" },
    { title: "To", dataIndex: "to" },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (val) => (
        <span className="text-blue-500">LKR {val.toLocaleString()}</span>
      ),
    },
    { title: "Purpose", dataIndex: "purpose" },
    { title: "Transferred By", dataIndex: "transferredBy" },
    { title: "Approved By", dataIndex: "approvedBy" },
    {
      title: "Status",
      dataIndex: "status",
      render: (val) => (
        <span className="bg-green-100 text-green-600 px-2 py-1 rounded">
          {val}
        </span>
      ),
    },
    { title: "Notes", dataIndex: "notes" },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">Cash Transfer Roadmap</h1>

      {/* 🔹 Summary Cards */}
      <div className="flex flex-wrap gap-4">

        <Card className="flex-1 min-w-[200px]">
          <p className="text-gray-500">Total Transfers</p>
          <h2 className="text-xl font-bold text-blue-500">10</h2>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <p className="text-gray-500">Total Amount</p>
          <h2 className="text-xl font-bold text-blue-500">LKR 763,000</h2>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <p className="text-gray-500">Completed</p>
          <h2 className="text-xl font-bold text-green-500">
            8 (LKR 660,000)
          </h2>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <p className="text-gray-500">Pending</p>
          <h2 className="text-xl font-bold text-orange-500">2</h2>
        </Card>

      </div>

      {/* 🔹 Filter Section */}
      <Card>

        <div className="flex flex-wrap gap-4">

          <div className="flex-1 min-w-[250px] space-y-2">
            <p className="font-medium">Filter by Date Range</p>
            <RangePicker className="w-full" />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <p className="font-medium">From Branch</p>
            <Select
              className="w-full"
              defaultValue="All"
              options={[
                { value: "all", label: "All" },
                { value: "kandy", label: "Kandy" },
                { value: "colombo", label: "Colombo" },
              ]}
            />
          </div>

          <div className="flex-1 min-w-[200px] space-y-2">
            <p className="font-medium">To Branch</p>
            <Select
              className="w-full"
              defaultValue="All"
              options={[
                { value: "all", label: "All" },
                { value: "head", label: "Head Office" },
              ]}
            />
          </div>

        </div>

      </Card>

      {/* 🔹 Table */}
      <Card>

        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: true }}
        />

      </Card>

    </div>
  );
}