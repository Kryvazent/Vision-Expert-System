import React from 'react'
import { Card, Row, Col, Button, Typography, Layout } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import StatCard from '../../component/Admin/StatCard';
import AdminIcons from '../../assets/icons/AdminIcons';

const { Title, Text } = Typography;

export default function InventoryManagement() {
  return (
  <Layout>
     <Content className="p-8" style={{ padding: "20px" }}>
  <div
      style={{
        background: "#f5f7fa",
        padding: "20px 30px",
        borderRadius: "10px",
        marginBottom: "20px",
      }}
    >
      <Row align="middle" justify="space-between">
        
        {/* LEFT SIDE */}
        <Col>
          <Title level={2} style={{ fontWeight: "bold", marginBottom: "0" }}>
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
      <Row gutter={[16, 16]} className="mt-6 mb-5">
  <Col xs={24} sm={12} md={8}>
    <StatCard title="Frames" value={frames.length} iconType="frames" color="#00A854" bgColor="#E6F7F0" />
  </Col>

  <Col xs={24} sm={12} md={8}>
    <StatCard title="Plastic Boxes" value={plasticBoxes.length} iconType="box" color="#F5222D" bgColor="#FFF1F0" />
  </Col>

  <Col xs={24} sm={12} md={8}>
    <StatCard title="Hard Boxes" value={hardBoxes.length} iconType="box" color="#FAAD14" bgColor="#FFF7E6" />
  </Col>

  <Col xs={24} sm={12} md={8}>
    <StatCard title="Leaflets" value={leaflets.length} iconType="leaflets" color="#1890FF" bgColor="#E6F7FF" />
  </Col>

  <Col xs={24} sm={12} md={8}>
    <StatCard title="Cleaning Clothes" value={cleaningClothes.length} iconType="cleaningClothes" color="#722ED1" bgColor="#F9F0FF" />
  </Col>

  <Col xs={24} sm={12} md={8}>
    <StatCard title="Cleaning Solutions" value={cleaningSolutions.length} iconType="cleaningSolutions" color="#8C8C8C" bgColor="#F5F5F5" />
  </Col>
</Row>


      </div>
    
    </Content>
  </Layout>  
    
  )
}
