import { Card, Select, DatePicker } from "antd";
import AcStatCard from "./AcStatCard";
const { Option } = Select;
const { RangePicker } = DatePicker;

function AccountantDashboard() {
  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto space-y-10 pr-2">
      {/* Title
      <h1 className="text-2xl font-semibold text-gray-800">
        Financial Dashboard
      </h1> */}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center" >
        <Select defaultValue="All Branches" className="w-52">
          <Option value="all">All Branches</Option>
          <Option value="colombo">Colombo</Option>
          <Option value="kandy">Kandy</Option>
        </Select>

        <RangePicker className="w-64" />
      </div>

      {/* Cards */}
      <div className="flex flex-wrap gap-6 justify-center" >
        {/* Card 1 */}
        <Card className="w-[40%] rounded-xl shadow-sm">
          <p className="text-gray-500">Total Revenue</p>
          <h2 className="text-2xl font-bold">Rs. 873,000</h2>
          <AcStatCard iconType="dollar" className="absolute top-4 right-4" />
          <p className="text-green-500 font-medium">+12.5%</p>
        </Card>

        {/* Card 2 */}
        <Card className="w-[40%] rounded-xl shadow-sm">
          <p className="text-gray-500">Amount Received</p>
          <h2 className="text-2xl font-bold">Rs. 692,000</h2>
          <AcStatCard iconType="wallet" className="absolute top-4 right-4" />
          <p className="text-green-500 font-medium">+8.3%</p>
        </Card>

        {/* Card 3 */}
        <Card className="w-[40%] rounded-xl shadow-sm">
          <p className="text-gray-500">Pending Collections</p>
          <h2 className="text-2xl font-bold">Rs. 181,000</h2>
          <AcStatCard iconType="creditcard" className="absolute top-4 right-4" />
          <p className="text-red-500 font-medium">-3.2%</p>
        </Card>

        {/* Card 4 */}
        <Card className="w-[40%] rounded-xl shadow-sm">
          <p className="text-gray-500">Total Orders</p>
          <h2 className="text-2xl font-bold">24</h2>
          <AcStatCard iconType="shopping" className="absolute top-4 right-4" />
          <p className="text-green-500 font-medium">+15.7%</p>
        </Card>
      </div>

      <div className="flex justify-center">
      <h2>Branch Performance Analysis</h2>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">


        
        <Card className="w-[40%] rounded-xl shadow-sm">
          <p className="text-gray-500">Avarage Delivery Time</p>
          <h2 className="text-2xl font-bold">10 days</h2>
          <AcStatCard iconType="clock" className="absolute top-4 right-4" />
          <p className="text-green-500 font-medium">-1.5%</p>
        </Card>

        <Card className="w-[40%] rounded-xl shadow-sm">
        <p className="text-gray-500">Best Performing Branch</p>
        <h2 className="text-2xl font-bold">Colombo</h2>
        <AcStatCard iconType="trophy" className="absolute top-4 right-4" />
        <p className="text-green-500 font-medium">9 days ago</p>
        </Card>

     

        <Card className="w-[40%] rounded-xl shadow-sm">
        <p className="text-gray-500">Order completed</p>
        <h2 className="text-2xl font-bold">24</h2>
        <AcStatCard iconType="check" className="absolute top-4 right-4" />
        <p className="text-green-500 font-medium">+3.8%</p>
        </Card>


      </div>
    </div>
  );
}

export default AccountantDashboard;
