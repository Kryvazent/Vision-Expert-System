import { Card, Input, Button, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState } from "react";

export default function OrderFilter() {

  const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState("");

  const handleSearch = () => {
  const result = data.filter((item) =>
    item.orderId.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.trackingId.toLowerCase().includes(searchValue.toLowerCase())
  );

  setFilteredData(result);
};

  // 🔹 Dummy data
  const data = [
    {
      key: "1",
      orderId: "OD3003",
      trackingId: "VE-2026-003003",
      customer: "David Kim",
      branch: "Mahiyanganaya",
      orderDate: "2026-02-20",
      deliveryDate: "2026-03-08",
      total: 47000,
      paid: 47000,
      remaining: 0,
      status: "Delivered",
      payment: "Completed",
    },
  ];

  // 🔹 Columns
  const columns = [
    { title: "Order ID", dataIndex: "orderId" },
    { title: "Tracking ID", dataIndex: "trackingId" },
    { title: "Customer Name", dataIndex: "customer" },
    { title: "Branch", dataIndex: "branch" },
    { title: "Order Date", dataIndex: "orderDate" },
    { title: "Delivery Date", dataIndex: "deliveryDate" },
    {
      title: "Total Amount",
      dataIndex: "total",
      render: (val) => <span className="text-blue-500">LKR {val}</span>,
    },
    {
      title: "Paid Amount",
      dataIndex: "paid",
      render: (val) => <span className="text-green-500">LKR {val}</span>,
    },
    {
      title: "Remaining",
      dataIndex: "remaining",
      render: (val) => <span className="text-green-500">LKR {val}</span>,
    },
    {
      title: "Order Status",
      dataIndex: "status",
      render: (val) => (
        <span className="bg-green-100 px-2 py-1 rounded text-green-600">
          {val}
        </span>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "payment",
      render: (val) => (
        <span className="bg-green-100 px-2 py-1 rounded text-green-600">
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">Order Filter</h1>

      {/* 🔹 Search Card */}
      <Card>
        <div className="space-y-3">

          <p className="font-medium">
            Search by Order ID or Tracking ID
          </p>

          <div className="flex gap-3">
            <Input
              placeholder="Enter ID"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-w-md"
            />

            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Search
            </Button>
          </div>

        </div>
      </Card>

      {/* 🔹 Result Card */}
      <Card>

        <p className="mb-4 font-medium">Found 1 order</p>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={false}
          scroll={{ x: true }} // horizontal scroll
        />

      </Card>

    </div>
  );
}