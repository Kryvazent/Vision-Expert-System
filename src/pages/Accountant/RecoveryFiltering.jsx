import { Card } from "antd";

import { DatePicker, Select, Table } from "antd";

const { RangePicker } = DatePicker;

function RecoveryFiltering() {
  return (
    
    <div className="p-6 space-y-4">

      
      <h1 className="text-2xl font-semibold">Recovery Filtering</h1>

      
      <Card className="rounded-xl">

        
        <div className="flex flex-wrap gap-6 mb-4">

         
          <div className="flex-1 min-w-[250px]">
            <p className="mb-2 font-medium">Filter by Date Range</p>
            <RangePicker className="w-full" />
          </div>

         
          <div className="flex-1 min-w-[250px]">
            <p className="mb-2 font-medium">Filter by Branch</p>
            <Select
              className="w-full"
              defaultValue="All Branches"
              options={[
                { value: "all", label: "All Branches" },
                { value: "kadawatha", label: "Kadawatha" },
                { value: "colombo", label: "Colombo" },
              ]}
            />
          </div>

        </div>

      
        <Table
          columns={[
            { title: "Order ID", dataIndex: "id" },
            { title: "Customer Name", dataIndex: "name" },
            { title: "Mobile", dataIndex: "mobile" },
            { title: "Branch", dataIndex: "branch" },
          ]}
          dataSource={[
            { id: "OD3001", name: "Kason Ratnayake", mobile: "0771234567", branch: "Kadawatha" },
            { id: "OD3002", name: "Coral Silva", mobile: "0773456789", branch: "Kadawatha" },
          ]}
          pagination={false}
        />

      </Card>

    </div>
  );

}

export default RecoveryFiltering;