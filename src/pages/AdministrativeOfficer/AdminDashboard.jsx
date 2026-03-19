import React from 'react'
import { Flex, Layout ,Card,Table,Button,Typography} from "antd";
import Sidebar from "../../component/Sidebar";
import TopHeader from '../../component/TopHeader';
import {DashboardOutlined, UserOutlined, StockOutlined, ProjectOutlined, HistoryOutlined} from "@ant-design/icons";

const {Content } = Layout;
const { Text,Title } = Typography;


function AdminDashboard() {

 const menuItems = [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '2', icon: <UserOutlined />, label: 'Customer Lookup' },
    { key: '3', icon: < StockOutlined />, label: 'Inventory Management' },
    { key: '4', icon: <ProjectOutlined />, label: 'Project Clinics' },
    { key: '5', icon: <HistoryOutlined />, label: 'Batch Tracking' },
  ]; 

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

<Table dataSource={recentCustomers} columns={columns} />;

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
    <div>
      <Layout>
        {/* Sidebar */}
     <Sidebar />

        <Layout>
          {/* Header */}
          <TopHeader />

          <Content>

          </Content>



    <div className="flex items-center justify-between mb-6">
              <Title level={5} className="!mb-0" style={{ fontWeight: 600 }}>   Recent Customers</Title>
        </div>
        
          <Table dataSource={recentCustomers} columns={columns} rowClassName="hover:bg-blue-50 transition-colors" style={{ borderRadius: 12, overflow: "hidden" }}/>


         <div className="flex items-center justify-between mb-6">
              <Title level={5} className="!mb-0" style={{ fontWeight: 600 }}>Inventory Status</Title>
        </div> 

          <Table dataSource={ inventoryData} columns={inventoryColumns} rowClassName="hover:bg-blue-50 transition-colors" style={{ borderRadius: 12, overflow: "hidden" }} />
       
          
        </Layout>
      </Layout>
    </div>

    </>
  )
}

export default AdminDashboard




