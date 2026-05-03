import { Card, DatePicker, Select } from "antd";

export default function DailySales() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">

      {/* Title
      <h1 className="text-2xl font-semibold">Daily Sales Details</h1> */}

      {/* Filter Card */}
      <Card className="rounded-xl">

        {/* Flex Row */}
        <div className="flex flex-wrap gap-6">

          {/* Date */}
          <div className="flex-1 min-w-[250px] space-y-2">
            <p className="font-medium">Select Date</p>
            <DatePicker className="w-full" />
          </div>

          {/* Branch */}
          <div className="flex-1 min-w-[250px] space-y-2">
            <p className="font-medium">Filter by Branch</p>
            <Select
              className="w-full"
              placeholder="All Branches"
              options={[
                { value: "all", label: "All Branches" },
                { value: "kandy", label: "Kandy" },
                { value: "colombo", label: "Colombo" },
              ]}
            />
          </div>

        </div>

        {/* Grand Total Box */}
        <div className="mt-6 bg-blue-100 p-6 rounded-xl flex justify-end text-lg font-semibold">
          Grand Total:
          <span className="text-green-600 ml-2">LKR 0</span>
        </div>

      </Card>

    </div>
  );
}