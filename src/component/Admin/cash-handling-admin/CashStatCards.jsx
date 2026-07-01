import React from 'react'
import { Row, Col, Card, Typography } from 'antd'
import { DollarOutlined, ShoppingCartOutlined, SyncOutlined, StarOutlined } from '@ant-design/icons'

const { Text } = Typography

const ICONS = {
    total: { icon: <DollarOutlined />, bg: '#EFF6FF', color: '#2563EB' },
    sales: { icon: <ShoppingCartOutlined />, bg: '#EFF6FF', color: '#2563EB' },
    recovery: { icon: <SyncOutlined />, bg: '#F0FDF4', color: '#16A34A' },
    extra: { icon: <StarOutlined />, bg: '#FAF5FF', color: '#9333EA' },
}

const StatCard = ({ label, value, iconKey }) => {
    const cfg = ICONS[iconKey]
    return (
        <Card style={{ borderRadius: 12, border: '1px solid #E5E7EB' }} bodyStyle={{ padding: '18px 20px' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '6px 0 10px' }}>
                LKR {value.toLocaleString()}
            </div>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: cfg.bg, color: cfg.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
                {cfg.icon}
            </div>
        </Card>
    )
}

export default function CashStatCards({ totalCash, salesCash, recoveryCash, extraRecoveryCash }) {
    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={12} md={6}>
                <StatCard label="Total Cash" value={totalCash} iconKey="total" />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatCard label="Sales Cash" value={salesCash} iconKey="sales" />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatCard label="Recovery Cash" value={recoveryCash} iconKey="recovery" />
            </Col>
            <Col xs={24} sm={12} md={6}>
                <StatCard label="Extra Recovery Cash" value={extraRecoveryCash} iconKey="extra" />
            </Col>
        </Row>
    )
}