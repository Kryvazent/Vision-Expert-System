import React from 'react'
import { PhoneOutlined } from '@ant-design/icons'
import Statcard from '../../component/Admin/reminder-calls/Statcard'
import { Layout, Col, Row, Typography } from 'antd'
import CallDetailsTable from '../../component/Admin/reminder-calls/CallDetailsTable'

const {Content} = Layout
const {Title} = Typography

export default function ReminderCalls() {
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
              Reminder Calls
            </Title>
            </Col>
          </Row>
        </div>

        <div  className="flex gap-6 mb-6">
            <Statcard 
              title="Before Lab Status" 
              icon={<PhoneOutlined  style={{color: "#1677ff"}} /> }
              items={[
                {label: "Answer", value: 0, color: "green"},
                {label: "Not Answer", value: 0, color: "red"},
                {label: "Pending", value: 24,}
              ]}
            />
            < Statcard
              title="Before Delivery Status" 
              icon={<PhoneOutlined  style={{color: "green"}}/>}
              items={[
                { label: "Answer", value: 0, color: 'green'},
                {label: "Not Answer", value: 0, color: "red"},
                {label: "Pending", value: 1}
              ]}
            />

        </div>

        < CallDetailsTable/>
      </Content>
    </Layout>
  )
}
