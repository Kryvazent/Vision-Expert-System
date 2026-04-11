import { Button, Card, Row, Space, Tag } from "antd";
import TopBar from "../../component/optimetrist/dashboard/TopBar";

import order from "../../assets/icons/sales-executive/order.png";
import active from "../../assets/icons/sales-executive/active-order.png";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";

function SalesExecutiveDashboard() {

  const statusColors = {
    Active: 'green',
    Hold: 'orange',
    Cancelled: 'red',
    Approved: 'green'
  };

  const topBar = [
    {
      title: "New Orders",
      value: 0,
      icon: order
    },
    {
      title: "Active Orders",
      value: 0,
      icon: active
    },
  ]

  const orderData = [
    {
      key: '1',
      orderId: '001',
      customer: 'Mike',
      status: 'Active',

    }
  ]
  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: () => (
        <a href="#">View Details</a>
      )
    },
  ]

  return (
    <>
      <div className="m-5">

        <Row>
          <TopBar data={topBar} />
        </Row>

        <Content className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
          <Row className="mt-10 ">
            <Card
              title="Recent Orders"
              className="w-full"
              extra={
                <Space>
                  <Button>View All Orders</Button>
                  <Button type="primary">New Order</Button>
                </Space>
              }
            >
              <CustomTable data={orderData} columns={orderColumns} pageSize={20} />
            </Card>
          </Row>

        </Content>
      </div>
    </>
  );
}

export default SalesExecutiveDashboard;