import React, { useState, useEffect } from 'react'
import { Table, Select, Typography, Tag, Tabs, Button, Row, Col, Card } from 'antd'

const { Text, Title } = Typography

export default function BranchStockTable({
  branches = [],
  selectedBranch,
  onBranchChange,
  data = [],
  productTypeList = [],
  reOrderedKeys = new Set(),
  onReOrder,
}) {
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    if (productTypeList.length > 0) {
      const exists = productTypeList.some(pt => pt.type === activeCategory)
      if (!exists) setActiveCategory(productTypeList[0].type)
    }
  }, [productTypeList, activeCategory])

  const selectedBranchName = branches.find(b => b.id === selectedBranch)?.branch_name || ''
  const filteredData = data.filter((item) =>
    item.category?.trim().toLowerCase() === activeCategory?.trim().toLowerCase()
  )

  const tabItems = productTypeList.map((pt) => ({ key: pt.type, label: pt.type }))
  const totalBranchQty = data.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)
  const lowQtyCount = data.filter((item) => Number(item.stockQuantity || 0) > 0 && Number(item.stockQuantity || 0) <= 100).length
  const outQtyCount = data.filter((item) => Number(item.stockQuantity || 0) === 0).length

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{val}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.brand || '-'}</Text>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Date Added',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'stockQuantity',
      key: 'quantity',
      width: 140,
      align: 'center',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: (qty) => {
        let color = 'green'
        if (qty === 0) color = '#d20d0dc5'
        else if (qty <= 100) color = 'orange'
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{qty} units</Tag>
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const reorderKey = `${selectedBranch}-${record.productTypeId}`
        const alreadyRequested = reOrderedKeys.has(reorderKey)

        return (
          <Button
            size="small"
            type={alreadyRequested ? 'default' : 'primary'}
            disabled={alreadyRequested || !selectedBranch || record.stockQuantity >= 100}
            onClick={() => onReOrder?.(record.productTypeId, selectedBranch, Math.max(100 - Number(record.stockQuantity || 0), 1))}
          >
            {alreadyRequested ? 'Requested' : 'Reorder'}
          </Button>
        )
      },
    },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', padding: 20 }}>
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 10,
        padding: '12px 16px',
        marginBottom: 20,
      }}>
        <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>Branch Stock Search</Text>
        <br />
        <Text style={{ color: '#3B82F6', fontSize: 12 }}>
          Select a branch to view product quantities for that location.
        </Text>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#F8FAFF' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Branch Items</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8' }}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#F0FDF4' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Total Qty</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{totalBranchQty}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#FFFBEB' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Needs Attention</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706' }}>{lowQtyCount + outQtyCount}</div>
          </Card>
        </Col>
      </Row>

      <Select
        value={selectedBranch}
        onChange={(val) => {
          onBranchChange(val)
          if (productTypeList.length > 0) setActiveCategory(productTypeList[0].type)
        }}
        placeholder="Select a branch"
        style={{ width: 280, marginBottom: 20 }}
        options={branches.map(b => ({ label: b.branch_name, value: b.id }))}
      />

      {selectedBranch && (
        <div style={{ marginBottom: 12 }}>
          <Title level={5} style={{ color: '#1D4ED8', margin: 0 }}>
            Stock Inventory for {selectedBranchName} Branch
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {data.length} products in this branch
          </Text>
        </div>
      )}

      {selectedBranch && tabItems.length > 0 && (
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          type="card"
          size="large"
          style={{ marginBottom: 16 }}
          items={tabItems}
        />
      )}

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {filteredData.length} items in this category - {data.length} total in branch
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} products` }}
        style={{ fontSize: 14 }}
        locale={{ emptyText: selectedBranch ? 'No stock found for this category in this branch' : 'Select a branch to view stock' }}
      />
    </div>
  )
}
