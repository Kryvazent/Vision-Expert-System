import React from 'react'
import StatCard from '../../component/Admin/StatCard'
import { icons } from '../../assets/icons/AdminIcons'

import { Layout } from 'antd';
import { Card, Row, Col, Button, Typography } from 'antd'
import BatchManagementTable from '../../component/Admin/batch-Management/BatchManagementTable';

const {Title, Text} = Typography;
const {Content} = Layout;

export default function BatchTracking() {

const [batches, setBatches] = useState([
    {
      key: '1',
      batchNumber: 'BATCH-2026-001',
      orders: 3,
      currentStatus: 'Delivered',
      historyData: { id: 'BATCH-2026-001', totalOrders: 3, status: 'Delivered' }
    },
    {
      key: '2',
      batchNumber: 'BATCH-2026-002',
      orders: 2,
      currentStatus: 'Pending Customer Confirmation',
      historyData: { id: 'BATCH-2026-002', totalOrders: 2, status: 'Pending Customer Confirmation' }
    },
    {
      key: '3',
      batchNumber: 'BATCH-2026-003',
      orders: 1,
      currentStatus: 'Delivered to the Lab',
      historyData: { id: 'BATCH-2026-003', totalOrders: 1, status: 'Delivered to the Lab' }
    }
  ]);

  const totalBatches = batches.length;

  const pendingCount = batches.filter(
    b => b.currentStatus === "Pending Customer Confirmation"
  ).length;

  const inLabCount = batches.filter(
    b => b.currentStatus === "Delivered to the lab"
  ).length;

  const deliveredCount = batches.filter(
    b => b.currentStatus === "Delivered"
  ).length;

  const handleUpdateStatus = (key, newStatus) => {
    const updateData = batches.map(item => {
      if(item.key === key){
        return {...item, currentStatus: newStatus};
      }
      return item;
    });
    setBatches(updateData);
  };

  return (
    <Layout>
      <Content className="p-8" style={{ padding: "20px" }}>
        <div style={{
          background: "#f5f7fa",
          padding: "20px 30px",
          borderRadius: "10px",
          marginBottom: "20px",
      }}>
         <Row align="middle" justify="space-between">
             <Col>
               <Title level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Batch Tracking
                </Title>
                <Text type="secondary">
                  Track and manage lab batches
                </Text>
            </Col>
          </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Total Batches" value="5" iconType="cleaningSolutions"bgColor="#d2e2f1" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Pending" value="2"  iconType="clock" bgColor="#f5f6cc" />
        </Col>
         <Col xs={24} sm={12} md={6}>
          <StatCard title="In Lab" value="1"  iconType="send"bgColor="#c9f7f9" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Delivered" value="2"  iconType="delivered" bgColor="#fceded" />
        </Col>
      </Row>
      
      <BatchManagementTable data={batches} onUpdateStatus={handleUpdateStatus}/>

      </Content>   
    </Layout>
  )
}
