import React from 'react'
import StatCard from '../../component/Admin/StatCard'
import { icons } from '../../assets/icons/AdminIcons'
import { Content } from 'antd/es/layout/layout'
import { Layout } from 'antd';
import { Card, Row, Col, Button, Typography } from 'antd'
import BatchManagementTable from '../../component/Admin/batch-Management/BatchManagementTable';


const {Title, Text} = Typography;

export default function BatchTracking() {
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
          {/* LEFT SIDE */}
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

      <div className="flex gap-6 mb-6">
        <StatCard title="Total Batches" value="5" iconType="cleaningSolutions"bgColor="#d2e2f1"></StatCard>
        <StatCard title="Pending" value="2"  iconType="clock" bgColor="#f5f6cc"></StatCard>
        <StatCard title="In Lab" value="1"  iconType="send"bgColor="#c9f7f9"></StatCard>
         <StatCard title="Delivered" value="2"  iconType="delivered" bgColor="#fceded"></StatCard>

      </div>
      <BatchManagementTable />

      </Content>   
    </Layout>
  )
}
