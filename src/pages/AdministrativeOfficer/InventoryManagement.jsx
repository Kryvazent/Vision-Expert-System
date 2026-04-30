import React from 'react'
import { Card, Row, Col, Button, Typography, Layout } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import StatCard from '../../component/Admin/StatCard';
import {icons} from '../../assets/icons/AdminIcons';
import StockItemsTable from '../../component/Admin/inventory-management/StockItemsTable';
import OutOfStockTable from '../../component/Admin/inventory-management/OutOfStockTable';
import LowStockTable from '../../component/Admin/inventory-management/LowStockTable';

const { Title, Text } = Typography;
const { Content } = Layout;
export default function InventoryManagement() {

const inventory=[
    {category:"frames"},
    {category:"hardBoxes"},
    {category:"plasticBoxes"},
    {category:"cleaningClothes"},
    {category:"cleaningSolutions"},
    {category:"leaflets"},
  ];

  const frames = inventory.filter(item => item.category === 'frames');
  const hardBoxes = inventory.filter(item => item.category === 'hardBoxes');
  const plasticBoxes = inventory.filter(item => item.category === 'plasticBoxes');
  const cleaningClothes = inventory.filter(item => item.category === 'cleaningClothes');
  const cleaningSolutions = inventory.filter(item => item.category === 'cleaningSolutions');
  const leaflets = inventory.filter(item => item.category === 'leaflets');

  return (
  <Layout>
     <Content className="p-8" style={{ padding: "20px" }}>
      <div style={{
          background: "#f5f7fa",
          padding: "20px 30px",
          borderRadius: "10px",
          marginBottom: "20px",
      }}
    >
      <Row align="middle" justify="space-between">
        
        {/* LEFT SIDE */}
        <Col>
          <Title level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
            Inventory Management - Kadawatha
          </Title>
          <Text type="secondary">
            Manage stock allocated to your branch, transfer items, and track inventory movements
          </Text>
        </Col>

        {/* RIGHT SIDE */}
        <Col>
          <Button
            icon={<BankOutlined />}
            style={{
              background: "#e6f0ff",
              borderColor: "#b3d1ff",
              color: "#1a73e8",
              fontWeight: "500",
              borderRadius: "8px",
              padding: "5px 15px",
            }}
          >
            Kadawatha Branch
          </Button>
        </Col>
      </Row>
     </div> 


   <div className="flex gap-6 mb-5">
          <StatCard title="Frames" value={frames.length} iconType="frames" color="#00A854" bgColor="#E6F7F0" />
          <StatCard title="Plastic Boxes" value={plasticBoxes.length} iconType="box" color="#F5222D" bgColor="#FFF1F0" />
          <StatCard title="Hard Boxes" value={hardBoxes.length} iconType="box" color="#FAAD14" bgColor="#FFF7E6" />
   </div>
   <div className="flex gap-6 mb-5">       
          <StatCard title="Leaflets" value={leaflets.length} iconType="leaflets" color="#1890FF" bgColor="#E6F7FF" />
           <StatCard title="Cleaning Clothes" value={cleaningClothes.length} iconType="cleaningClothes" color="#722ED1" bgColor="#F9F0FF" />
           <StatCard title="Cleaning Solutions" value={cleaningSolutions.length} iconType="cleaningSolutions" color="#8C8C8C" bgColor="#F5F5F5" />
     </div>

      <Card className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Low of Stock Table */}
          <LowStockTable />
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Out of Stock Table */}
          <OutOfStockTable />
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}}>
            {/* Inventory Table */}
          <Title level={5} className=".mb-0 " style={{fontWeight:"bold"}}>Kadawatha Inventory</Title>

            <StockItemsTable />
        </Card>
      </Card>
    </Content>
  </Layout>  
    
  )
}
