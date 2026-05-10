import React from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Card, Row, Col, Typography, Descriptions } from 'antd'

const {Text} = Typography;

export default function CustomerInformation({customer}) {
  return (
    <Card style = {{borderRadius: "12px", background: "#f9fafb", border:  "1px solid #e5e7eb"}}>
      {/*Header*/}

      <div style={{marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px"}}>
        <UserOutlined style={{color: "#2563eb"}} />
        <Text strong style={{color: "#2563eb"}} >
          Customer Information
        </Text>
      </div>

      {/* Descriptions */}
    <Descriptions>
      <Descriptions.Item label="Full Name">
        <strong>{customer.name}</strong>
      </Descriptions.Item>

      <Descriptions.Item label="NIC">
        {customer.nic}
      </Descriptions.Item>

      <Descriptions.Item label="Mobile">
        {customer.mobile}
      </Descriptions.Item>

      <Descriptions.Item label="Address" span={2}>
        {customer.address}
      </Descriptions.Item>

      <Descriptions.Item label="Registered Data">
        {customer.registerDate}
      </Descriptions.Item>

      <Descriptions.Item label="Customer ID" span={2}>
        {customer.customerId}
      </Descriptions.Item>
  </Descriptions>  

    </Card>
  )
}
