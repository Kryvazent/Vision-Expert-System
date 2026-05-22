import React , {useState} from 'react'
import StatCard from '../../component/Admin/StatCard'
import { icons } from '../../assets/icons/AdminIcons'

import { Layout } from 'antd';
import { Card, Row, Col, Button, Typography } from 'antd'
import BatchManagementTable from '../../component/Admin/batch-Management/BatchManagementTable';
import { PlusOutlined,  } from '@ant-design/icons';
import AddBatchModal from '../../component/Admin/batch-Management/AddBatchModal';

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
      }
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddBatch = (newBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };
  const totalBatches = batches.length;

  const pendingConfirmationCount = batches.filter(
    b => b.currentStatus === "Pending Customer Confirmation"
  ).length;

  const confirmationsCompletedCount = batches.filter(
    b => b.currentStatus === "Confirmations Completed" 
  ).length;


  const deliveredToLabCount = batches.filter(
    b => b.currentStatus === "Delivered to the Lab"
  ).length;

  const receivedFromLabCount = batches.filter(
    b => b.currentStatus === "Received from the Lab"
  ).length;

  const outForDeliveryCount = batches.filter(
    b => b.currentStatus === "Out for Delivery"
  ).length;

  const deliveredCount = batches.filter(
    b => b.currentStatus === "Delivered"
  ).length;

  const stepMap = {
    "Pending Customer Confirmation": "step1",
    "Confirmations Completed": "step2",
    "Delivered to the Lab": "step3",
    "Received from the Lab": "step4",
    "Out for Delivery": "step5",
    "Delivered": "step6",
  }

  const handleUpdateStatus = (key, newStatus) => {
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const stepKey = stepMap[newStatus];   // Map status to corresponding step key
    const updateData = batches.map(item => {
      if (item.key === key) {
        const stepIndex = Object.keys(stepMap).indexOf(newStatus);
        const updatedOrderData = item.historyData.orderData.map(order => ({
          ...order,
          [stepKey]: {
            intended: order[stepKey]?.intended || null, // Keep intended date if exists
            actual: today, // Set actual date to today
          }
        }));

        //Autofill timeline data
        const updatedTimeline = {
          ...item.historyData.timeline,
          [stepKey]: new Date().toLocaleDateString('en-US',{
            month: 'short', day: '2-digits', year: 'numeric'
          }),
        };

        return {
          ...item,
          currentStatus: newStatus,
          historyData: {
            ...item.historyData,
            currentStatus: newStatus,
            currentStep: stepIndex,
            orderData: updatedOrderData,
            timeline: updatedTimeline,
          }
        }
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
            {/* Right side button */}
                    <Col>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        style={{
                        background: "#e6f0ff",
                        borderColor: "#b3d1ff",
                        color: "#1a73e8",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "5px 15px",
                        }}
                    >
                        Add Batch    
                    </Button>
                    </Col>
          </Row>
      </div>

      
  <Row gutter={[12, 12]} style={{ marginBottom: "24px" }}>
  <Col xs={12} sm={12} md={6}>
    <StatCard title="Total Batches" value={totalBatches} iconType="cleaningSolutions" bgColor="#d2e2f1" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Pending Confirmation" value={pendingConfirmationCount} iconType="clock" bgColor="#f5f6cc" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Confirmations Completed" value={confirmationsCompletedCount} iconType="check-circle" bgColor="#c9f7f9" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Delivered to Lab" value={deliveredToLabCount} iconType="delivered" bgColor="#d7fdda" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Received from Lab" value={receivedFromLabCount} iconType="received" bgColor="#facfce" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Out for Delivery" value={outForDeliveryCount} iconType="send" bgColor="#fce5cd" />
  </Col>

  <Col xs={12} sm={12} md={6}>
    <StatCard title="Delivered" value={deliveredCount} iconType="delivered" bgColor="#d2e2f1" />
  </Col>
</Row>
      
      <BatchManagementTable data={batches} onUpdateStatus={handleUpdateStatus}/>

      </Content>   
      <AddBatchModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddBatch={handleAddBatch}
      />
    </Layout>
  )
}
