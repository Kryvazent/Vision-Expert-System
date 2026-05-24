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

  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddBatch = (newBatch) => {
    setBatches((prev) => [newBatch, ...prev]);
  };


  const totalBatches = batches.length || 0;
  const deliveredToLabCount = batches.filter(b => b.currentStatus === "Delivered to the Lab").length;
  const receivedFromLabCount = batches.filter(b => b.currentStatus === "Received from the Lab").length || 0;

  const stepMap = {
    "Pending Customer Confirmation": "step1",
    "Confirmations Completed": "step2",
    "Delivered to the Lab": "step3",
    "Received from the Lab": "step4",
    "Out for Delivery": "step5",
    "Delivered": "step6",
  }

 // ✅ CHANGED: batch level status update
const handleUpdateStatus = (key, status,actualDate) => {
  const updated = batches.map(batch => {

    if (batch.key === key) {
      if (status === "Delivered to the Lab") {
        return {
          ...batch,
          currentStatus: status,
          batchLevelTracking: {
          ...batch.batchLevelTracking,
            deliveredToLab: {
              ...batch.batchLevelTracking
                .deliveredToLab,
              actual: actualDate,
            }
          }
        };
      }

      // Received From Lab
      if (status === "Received from the Lab") {
        return {
          ...batch,
          currentStatus: status,
          batchLevelTracking: {
            ...batch.batchLevelTracking,
            receivedFromLab: {
              ...batch.batchLevelTracking
                .receivedFromLab,
              actual: actualDate,
            }
          }
        };
      }
    }
    return batch;
  });
  setBatches(updated);
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
    <StatCard title="Delivered to Lab" value={deliveredToLabCount} iconType="delivered" bgColor="#d7fdda" />
  </Col>
  <Col xs={12} sm={12} md={6}>
    <StatCard title="Received from Lab" value={receivedFromLabCount} iconType="received" bgColor="#facfce" />
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
