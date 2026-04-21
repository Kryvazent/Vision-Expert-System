import React from 'react';
import { Card, Row, Col } from 'antd';
import { icons } from '../../assets/icons/AdminIcons';

export default function StatCard({ title, value, iconType, color, bgColor }) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: "12px",
        width: 320, // Increased width to match the aspect ratio in the image
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)", // Softer shadow
        height: '100%'
      }}
    >
      <Row align="middle" justify="space-between">
        <Col>
          <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '8px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f1f1f' }}>
            {value}
          </div>
        </Col>
        <Col>
          <div 
            style={{ 
              borderRadius: '12px', // Rounded square instead of 50%
              width: 54, 
              height: 54, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: bgColor || '#f0f5ff', // Light background
              color: color || '#2f54eb', // Icon color
              fontSize: '24px' 
            }}
          >
            {icons[iconType] || icons.customers}
          </div>
        </Col>
      </Row>
    </Card>
  );
}