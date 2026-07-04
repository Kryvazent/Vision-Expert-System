
import React from 'react'
import { Table, Tag, Button, Typography } from 'antd'
import { SendOutlined } from '@ant-design/icons'

const {Text} = Typography

const categoryColors = {
  PlasticFrame:     { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  MetalFrame:       { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  DoubleBrideFrame: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Night Vision':   { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  SunGlasses:       { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  HardBoxes:        { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  PlasticBoxes:     { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  CleaningClothes:  { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
  CleaningBottles:  { bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
  CleaningSolutions:{ bg: '#FAF5FF', text: '#7E22CE', border: '#E9D5FF' },
  Leaflets:         { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  Poster:           { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
}

const CategoryTag = ({category }) => {
    const colors = categoryColors[category] || {bg: '#F3F4F6', text: '#374151', border: '#D1D5DB'}

    return (
        <span style={{
            background: colors.bg,
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 500,
        }}>
            {category}
        </span>    
    )
}

const QuantityBadge = ({ qty }) => {
    const isHigh = qty >= 99
    const isMed = qty >= 20 && qty < 99
    const bg = isHigh ? '#059669' : isMed ? '#D97706' : '#DC2626'
    return (
        <span style={{
            background: bg,
            color: '#fff',
            borderRadius: 8,
            padding: '3px 12px',
            fontWeight: 700,
            fontSize: 13,
            minWidth: 48,
            display: 'inline-block',
            textAlign: 'center',
        }}>
            { qty}
        </span>
    )
}
    
export default function CentralStockTable({data, onDistribute}) {

    const columns = [
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (val, record) => (
                <div>
                    <Text strong style={{ fontSize: 14 }}>{val}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.brand}</Text>
                    {record.sku && (
                      <>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                          SKU: {record.sku}
                        </Text>
                      </>
                    )}
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (val) => <CategoryTag category={val} />,
        },
        {
            title: 'Branch',
            dataIndex: 'branchName',
            key: 'branchName',
            width: 120,
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (val) => (
                <Tag color="blue" style={{ fontWeight: 600 }}>{val}</Tag>
            ),
        },
        {
            title: 'Quantity',
            dataIndex: 'stockQuantity',
            key: 'stockQuantity',
            width: 110,
            align: 'center',
            render: (val) => <QuantityBadge qty={val} />,
            sorter: (a, b) => a.stockQuantity - b.stockQuantity,
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 140,
            align: 'center',
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    size="small"
                    onClick={() => onDistribute(record)}
                    style={{
                        background: '#1D4ED8',
                        borderColor: '#1D4ED8',
                        borderRadius: 8,
                        fontWeight: 500,
                    }}
                >
                    Distribute
                </Button>
            ),
        },
    ]

  return (
    <div>
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{pageSize: 8, showTotal: (t) => `Total ${t} products` }}
            style={{ fontSize: 14 }}
            locale={{ emptyText: 'No stock items found' }}
         />
    </div>
  )
}
