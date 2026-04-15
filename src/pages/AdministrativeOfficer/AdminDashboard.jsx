import React from 'react'
import {  Layout ,Table,Typography} from "antd";
import Sidebar from "../../component/Sidebar";
import { adminMenu } from '../../component/Admin/AdminDashMenu';
import TopHeader from '../../component/TopHeader';
import logo from "../../assets/images/logo.jpeg";
import Card from 'antd/es/card/Card';
import StatCard from '../../component/recoveryOfficer/StatCard';
import { icons } from '../../assets/icons/AdminIcons';

const {Content } = Layout;
const { Title } = Typography;

function AdminDashboard() {

const recentCustomers = [
  {
    key: '1',
    cusName: 'Kason Ratnayake',
    mobile:'0771234567' ,
    totalOrders: '2',
  },
  {
    key: '2',
    cusName: 'Nimal Fernando',
    mobile: '0772345678	',
    totalOrders: '1',
  },
  {
    key: '3',
    cusName: 'Coral Silva',
    mobile: '0773456789	',
    totalOrders: '0',
  },
  {
    key: '4',
    cusName: 'Jane Wilson ',
    mobile: '0774567890',
    totalOrders: '1',
  },
];

const columns = [
  {
    title: 'Customer Name',
    dataIndex: 'cusName',
    key: 'cusName',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),

  },
  {
    title: 'Mobile',
    dataIndex: 'mobile',
    key: 'mobile',
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),

  },
  {
    title: 'Total Orders',
    dataIndex: 'totalOrders',
    key: 'totalOrders',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),

  },
];

const inventoryData = [
  {
    key: '1',
    product: 'Ray-Ban Classic',
    category: 'frames',
    stock: '25',
  },
  {
    key: '2',
    product: 'Oakley Sport',
    category: 'frames',
    stock: '15',
  },
  {
    key: '3',
    product: 'Gucci Designer',
    category: 'frames',
    stock: '8',
  },
  {
    key: '4',
    product: 'Single Vision CR-39',
    category: 'lenses',
    stock: '50',
  },
  {
    key: '5',
    product: 'Progressive Varilux',
    category: 'lenses',
    stock: '30',
  },
];

const inventoryColumns = [
  {
    title: 'Product',
    dataIndex: 'product',
    key: 'product',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
];

<Table dataSource={ inventoryData} columns={inventoryColumns} />;

  return (
    <>
    <Layout>
        {/* Sidebar */}
        <Sidebar logo={logo} title="Vision Expert" menuItems={adminMenu} />

        <Layout>

          {/* Header */}
          <TopHeader title="Admin Dashboard" userName="David Kim" />

          {/* Content */}
          <Content className="p-8" style={{ padding: "20px" }}>
              <div className="flex gap-15 align-items-left mb-5">
                <StatCard iconType="customers" title="Total Customers" />
                <StatCard iconType="inventory" title="Inventory Items" />
                <StatCard iconType="stock" title="Low Stock Items" />
              </div>

            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{padding:"28px",marginBottom:"20px"} }>
            
              {/* Customers */}
              <Title level={5} className=".mb-0 " style={{fontWeight:600}}>Recent Customers</Title>
              <Table dataSource={recentCustomers} columns={columns} />

            </Card>

            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{padding:"28px",marginBottom:"20px"}}>
              {/* Inventory */}
              <Title level={5} style={{ marginTop: 20, fontWeight:600 }} className=".mb-0 ">Inventory Status</Title>
              <Table dataSource={inventoryData} columns={inventoryColumns} />
 
            </Card>
           </Content>
        </Layout>
      </Layout>
    </>
  )
}

export default AdminDashboard






