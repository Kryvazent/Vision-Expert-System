import { useState } from "react";
import { Card, Select } from "antd";

export default function RecoveryDetails() {

  // 🔹 State
  const [selectedBranch, setSelectedBranch] = useState("All");

  // 🔹 Dummy data (like database)
  const recoveryData = [
    {
      branch: "Kandy",
      clinic: "Kandy Central Clinic",
      total: 27000,
      orders: [{ id: "OD2506", amount: 27000 }],
    },
    {
      branch: "Kandy",
      clinic: "Kandy Peradeniya Clinic",
      total: 15000,
      orders: [{ id: "OD2507", amount: 15000 }],
    },
    {
      branch: "Colombo",
      clinic: "Colombo Main Clinic",
      total: 20000,
      orders: [{ id: "OD3001", amount: 20000 }],
    },
  ];

  // 🔹 Filter logic
  const filteredData =
    selectedBranch === "All"
      ? recoveryData
      : recoveryData.filter((item) => item.branch === selectedBranch);

  // 🔹 Grand total
  const grandTotal = filteredData.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="p-6 space-y-6">

      {/* Title */}
      <h1 className="text-2xl font-semibold">Recovery Details</h1>

      {/* Filter */}
      <Card>
        <div className="space-y-3">
          <p className="font-medium">Search By Branch</p>

          <Select
            className="w-[200px]"
            value={selectedBranch}
            onChange={setSelectedBranch}
            options={[
              { value: "All", label: "All" },
              { value: "Kandy", label: "Kandy" },
              { value: "Colombo", label: "Colombo" },
            ]}
          />
        </div>
      </Card>

      {/* Content */}
      <Card className="space-y-6">

        <h2 className="text-lg font-semibold">
          Extra Recovery Details - {selectedBranch}
        </h2>

        {/* 🔹 If no data */}
        {filteredData.length === 0 ? (
          <p>No data available</p>
        ) : (
          <div className="space-y-4">
          {filteredData.map((clinic) => (
            <div key={clinic.clinic} className="border rounded-lg">

              {/* Header */}
              <div className="flex justify-between p-4 font-medium">
                <span>{clinic.clinic}</span>
                <span className="text-red-500">
                  Total: LKR {clinic.total.toLocaleString()}
                </span>
              </div>

              {/* Table header */}
              <div className="flex justify-between bg-gray-100 p-3 text-sm font-medium">
                <span>Order ID</span>
                <span>Amount</span>
              </div>

              {/* Orders */}
              {clinic.orders.map((order) => (
                <div key={order.id} className="flex justify-between p-3">
                  <span>{order.id}</span>
                  <span className="text-red-500">
                    LKR {order.amount.toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Total row */}
              <div className="flex justify-between p-4 bg-blue-100 font-semibold">
                <span>Total</span>
                <span className="text-red-500">
                  LKR {clinic.total.toLocaleString()}
                </span>
              </div>

            </div>
          ))}
          </div>
        )}

      </Card>

      {/* Grand Total */}
      <div className="bg-blue-100 p-6 rounded-xl flex justify-end text-lg font-semibold">
        Grand Total:
        <span className="text-red-500 ml-2">
          LKR {grandTotal.toLocaleString()}
        </span>
      </div>

    </div>
  );
}