import React , {useState} from 'react'
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
      historyData: {
        batchNumber: 'BATCH-2026-001',
        orders: 3,
        currentStatus: 'Delivered',
        currentStep: 5,                  // 0-based: 5 = "Delivered" (the 6th step)
        orderData: [
          {
            key: '1',
            id: 'ORD-2026-0789',
            customer: 'John Smith',
            placed: 'Mar 01, 2026',
            step1: { intended: '2026-03-02', actual: '2026-03-02' },
            step2: { intended: '2026-03-02', actual: '2026-03-02' },
            step3: { intended: '2026-03-03', actual: '2026-03-03' },
            step4: { intended: '2026-03-09', actual: '2026-03-08' },
            step5: { intended: '2026-03-12', actual: '2026-03-11' },
            step6: { intended: '2026-03-13', actual: '2026-03-12' },
          },
          {
            key: '2',
            id: 'ORD-2026-0790',
            customer: 'Sarah Williams',
            placed: 'Mar 01, 2026',
            step1: { intended: '2026-03-02', actual: '2026-03-02' },
            step2: { intended: '2026-03-02', actual: '2026-03-02' },
            step3: { intended: '2026-03-03', actual: '2026-03-03' },
            step4: { intended: '2026-03-09', actual: '2026-03-08' },
            step5: { intended: '2026-03-12', actual: '2026-03-11' },
            step6: { intended: '2026-03-13', actual: '2026-03-12' },
          },
          {
            key: '3',
            id: 'ORD-2026-0791',
            customer: 'Michael Brown',
            placed: 'Mar 01, 2026',
            step1: { intended: '2026-03-02', actual: '2026-03-02' },
            step2: { intended: '2026-03-02', actual: '2026-03-02' },
            step3: { intended: '2026-03-03', actual: '2026-03-03' },
            step4: { intended: '2026-03-09', actual: '2026-03-08' },
            step5: { intended: '2026-03-12', actual: '2026-03-11' },
            step6: { intended: '2026-03-13', actual: '2026-03-12' },
          },
        ],
        timeline: {
          step1: 'Mar 02, 2026',
          step2: 'Mar 02, 2026',
          step3: 'Mar 03, 2026',
          step4: 'Mar 08, 2026',
          step5: 'Mar 11, 2026',
          step6: 'Mar 12, 2026',
        }
      }
    
    
    },
      {
      key: '2',
      batchNumber: 'BATCH-2026-002',
      orders: 2,
      currentStatus: 'Pending Customer Confirmation',
      historyData: {
        batchNumber: 'BATCH-2026-002',
        orders: 2,
        currentStatus: 'Pending Customer Confirmation',
        currentStep: 0,
        orderData: [
          {
            key: '1',
            id: 'ORD-2026-0792',
            customer: 'Alice Johnson',
            placed: 'May 01, 2026',
            step1: { intended: '2026-05-02', actual: '2026-05-02' },
            step2: null,
            step3: null,
            step4: null,
            step5: null,
            step6: null,
          },
          {
            key: '2',
            id: 'ORD-2026-0793',
            customer: 'Bob Martin',
            placed: 'May 01, 2026',
            step1: { intended: '2026-05-02', actual: '2026-05-04' },
            step2: null,
            step3: null,
            step4: null,
            step5: null,
            step6: null,
          },
        ],
        timeline: {
          step1: 'May 04, 2026',
          step2: null,
          step3: null,
          step4: null,
          step5: null,
          step6: null,
        }
      }
    },
  ]);

  const totalBatches = batches.length;

  const pendingCount = batches.filter(
    b => b.currentStatus === "Pending Customer Confirmation"
  ).length;

  const inLabCount = batches.filter(
    b => b.currentStatus === "Delivered to the Lab"
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
          <StatCard title="Total Batches" value={totalBatches} iconType="cleaningSolutions"bgColor="#d2e2f1" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Pending" value={pendingCount}  iconType="clock" bgColor="#f5f6cc" />
        </Col>
         <Col xs={24} sm={12} md={6}>
          <StatCard title="In Lab" value={inLabCount} iconType="send"bgColor="#c9f7f9" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard title="Delivered" value={deliveredCount}  iconType="delivered" bgColor="#fceded" />
        </Col>
      </Row>
      
      <BatchManagementTable data={batches} onUpdateStatus={handleUpdateStatus}/>

      </Content>   
    </Layout>
  )
}
