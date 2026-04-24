import React from 'react'
import {  Layout ,Table,Typography} from "antd";
import logo from "../../assets/images/logo.jpeg";
import Card from 'antd/es/card/Card';
import { icons } from '../../assets/icons/AdminIcons';
import StatCard from '../../component/Admin/StatCard';  

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

/*<Table dataSource={ inventoryData} columns={inventoryColumns} />;*/

  return (
    <>
    <Layout>

          {/* Content */}
          <Content className="p-8" style={{ padding: "20px" }}>
              <div className="flex gap-6 mb-5">
                <StatCard title="Total Customers" value="1,234" iconType="customers" color="#2F54EB" bgColor="#E6F7FF"  />
                <StatCard title="Inventory Items" value="567" iconType="inventory" color="#00A854" bgColor="#E6F7F0" />
                <StatCard title="Low Stock Items" value="23" iconType="stock" color="#F5222D" bgColor="#FFF1F0" />
              </div>

            <Card className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
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
            </Card>
           </Content>
          </Layout>


      
    </>
  )
}

export default AdminDashboard






