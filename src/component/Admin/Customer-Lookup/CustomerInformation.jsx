import React from 'react'
import { UserOutlined } from '@ant-design/icons'
import { Card, Row, Col, Typography } from 'antd'

const {Text} = Typography;

export default function CustomerInformation() {
  return (
    <Card style = {{borderRadius: "12px", background: "#f9fafb", border:  "1px solid #e5e7eb"}}>
      {/*Header*/}

      <div style={{marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px"}}>
        <UserOutlined style={{color: "#2563eb"}} />
        <Text strong style={{color: "#2563eb"}} >
          Customer Information
        </Text>
      </div>

      {/*Row 1*/}
      <Row gutter={16} style={{marginBottom: "10px", background: "#ffffff",  padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
        <Col span={6} style={{background: ""}}>
          <Text type="secondary"> Full Name</Text>
        </Col>
        <Col span={6}>
          <Text strong>Kasun Rathnayake</Text>
        </Col>

        <Col span={6}>
          <Text type="secondary">NIC</Text>
        </Col>
        <Col span={6}>
          <Text strong>199012345678</Text>
        </Col>
      </Row>

      {/*Row 2*/}
      <Row gutter={16} style={{ marginBottom: "10px", background: "#ffffff",  padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <Col span={6}>
          <Text type="secondary">Branch</Text>
        </Col>
        <Col span={6}>
          <Text strong>Kadawatha</Text>
        </Col>

        <Col span={6}>
          <Text type="secondary">Address</Text>
        </Col>
        <Col span={6}>
          <Text strong>10 Lake Rd, Colombo 5</Text>
        </Col>
      </Row>

       {/*Row 3*/}
      <Row gutter={16} style={{background: "#ffffff",  padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb"}}>
        <Col span={6}>
          <Text type="secondary">Registered Date</Text>
        </Col>
        <Col span={6}>
          <Text strong>2024-02-10</Text>
        </Col>

        <Col span={6}>
          <Text type="secondary">Customer ID</Text>
        </Col>
        <Col span={6}>
          <Text strong style={{color: "#2563eb"}}>C001</Text>
        </Col>
      </Row>
    </Card>
  )
}
