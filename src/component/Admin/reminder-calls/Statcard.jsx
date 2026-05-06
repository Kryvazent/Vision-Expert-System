import React from 'react'
import {Col, Row, Card, Typography} from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons';
import { Label } from 'recharts';

const {Text, Title} = Typography;

export default function Statcard({title, icon, items}) {
  return (
    <Card
        bordered={false}
        style={{
            borderRadius: 12, 
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            width: "100%",
            maxWidth: 500
        }} 
    >
        {/* Header */}
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
            {icon || <CheckCircleOutlined />}
            <Text strong>{title}</Text>
        </div>

        {/* Stats */}
        <Row justify="space-around" style={{marginTop: 20}}>
            {items.map((item,  index) =>  (
                <Col span={8} key={index}>
                    <Text type='secondary'>{item.label}</Text>
                    <Title level={3} style={{color: item.color || 'black', margin: 0}}>
                        {item.value}
                    </Title>
                </Col>
              ))}
        </Row> 
    </Card>
  );
}
