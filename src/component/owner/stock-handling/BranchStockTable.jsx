import React, { useState, useEffect } from 'react'
import { Table, Select, Typography, Tag, Tabs, Button, Row, Col, Card } from 'antd'
import FrameStatusBadge from './FrameStatusBadge'

const { Text, Title } = Typography

export default function BranchStockTable({
  branches = [],
  selectedBranch,
  onBranchChange,
  data = [],
  frameStockData = [],   // rows from branch_frame_stock view for this branch
  productTypeList = [],
  reOrderedKeys = new Set(),
  onReOrder,
}) {

    const [activeCategory, setActiveCategory] = useState('')
    const [activeView, setActiveView] = useState('legacy') // 'legacy' | 'frames'

  // Set default tab to first product type from DB when list loads
    useEffect(() => {
        if (productTypeList.length > 0 ) {
            const exists = productTypeList.some(
                pt => pt.type === activeCategory
            )

            if(!exists){
                setActiveCategory(productTypeList[0].type)
            }
        }
    }, [productTypeList, activeCategory])

    const selectedBranchName = branches.find(b => b.id === selectedBranch)?.branch_name || ''

    const filteredData = data.filter((item) => {
      return (
          item.category?.trim().toLowerCase() ===
          activeCategory?.trim().toLowerCase()
      )
    })

    const tabItems = productTypeList.map((pt) => ({
        key: pt.type,
        label: pt.type
    }))

    // Derive frame type tabs for the frame-level view
    const frameTypes = [...new Set(frameStockData.map((r) => r.frame_type).filter(Boolean))]
    const [activeFrameType, setActiveFrameType] = useState('All')

    const filteredFrameData = frameStockData.filter(
      (r) => activeFrameType === 'All' || r.frame_type === activeFrameType
    )

    const totalBranchQty = data.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)
    const lowQtyCount = data.filter((item) => Number(item.stockQuantity || 0) < 100).length
    const frameInStock = frameStockData.reduce((sum, item) => sum + Number(item.in_stock_count || 0), 0)

    // Legacy stock columns
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
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        },
        {
            title: 'Stock Quantity',
            dataIndex: 'stockQuantity',
            key: 'quantity',
            width: 120,
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

    // Frame-level stock columns (from branch_frame_stock view)
    const frameColumns = [
      {
        title: 'Product Name',
        dataIndex: 'product_name',
        key: 'product_name',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        render: (val, record) => (
          <div>
            <Text strong style={{ fontSize: 14 }}>{val}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
              SKU: {record.product_sku || '—'}
            </Text>
          </div>
        ),
      },
      {
        title: 'Frame Type',
        dataIndex: 'frame_type',
        key: 'frame_type',
        width: 140,
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        render: (val) => <Tag color="blue">{val}</Tag>,
      },
      {
        title: 'In Stock',
        dataIndex: 'in_stock_count',
        key: 'in_stock_count',
        width: 90,
        align: 'center',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        sorter: (a, b) => (a.in_stock_count || 0) - (b.in_stock_count || 0),
        render: (val) => (
          <span style={{
            background: val > 0 ? '#F0FDF4' : '#FEF2F2',
            color: val > 0 ? '#065F46' : '#991B1B',
            border: `1px solid ${val > 0 ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 13,
          }}>
            {val ?? 0}
          </span>
        ),
      },
      {
        title: 'Reserved',
        dataIndex: 'reserved_count',
        key: 'reserved_count',
        width: 90,
        align: 'center',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        render: (val) => val > 0
          ? <FrameStatusBadge status="reserved" size="small" />
          : <Text type="secondary">—</Text>,
      },
      {
        title: 'Damaged',
        dataIndex: 'damaged_count',
        key: 'damaged_count',
        width: 90,
        align: 'center',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        render: (val) => val > 0
          ? <span style={{ color: '#DC2626', fontWeight: 700 }}>{val}</span>
          : <Text type="secondary">—</Text>,
      },
      {
        title: 'Sold',
        dataIndex: 'sold_count',
        key: 'sold_count',
        width: 80,
        align: 'center',
        onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        render: (val) => <Text style={{ color: '#6B7280', fontWeight: 600 }}>{val ?? 0}</Text>,
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
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 10,
            }}>
                <span style={{ fontSize: 18 }}>ℹ️</span>
                <div>
                    <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>Branch Stock Search</Text>
                    <br />
                    <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                        Select a branch to view all products and their stock quantities for that specific location.
                        Switch to <b>Frame Stock</b> tab for serialised frame-level counts.
                    </Text>
                </div>
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
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Low Stock Items</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#D97706' }}>{lowQtyCount}</div>
                </Card>
              </Col>
            </Row>

            <Select 
                value={selectedBranch}
                onChange={(val) => {
                    onBranchChange(val)
                    if(productTypeList.length > 0) setActiveCategory(productTypeList[0].type)
                }}
                placeholder="Select a branch"
                style={{ width: 240, marginBottom: 20 }}
                options={branches.map(b => ({ label: `${b.branch_name}`, value: b.id }))}
            />

            {selectedBranch && (
                <div style={{ marginBottom: 12 }}>
                    <Title level={5} style={{ color: '#1D4ED8', margin: 0 }}>
                        Stock Inventory for {selectedBranchName} Branch
                    </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {frameInStock} serialised frames available in the selected branch
                </Text>
                </div>
            )}

            {/* View toggle: legacy quantity vs. frame-level */}
            {selectedBranch && (
              <Tabs
                activeKey={activeView}
                onChange={setActiveView}
                style={{ marginBottom: 16 }}
                items={[
                  { key: 'legacy', label: 'Quantity Stock' },
                  { key: 'frames', label: `Frame Stock ${frameStockData.length > 0 ? `(${frameStockData.reduce((s, r) => s + (r.in_stock_count || 0), 0)} in stock)` : ''}` },
                ]}
              />
            )}

            {/* ── Legacy quantity view ── */}
            {activeView === 'legacy' && (
              <>
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
                    {filteredData.length} items in this category · {data.length} total in branch
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
              </>
            )}

            {/* ── Frame-level view ── */}
            {activeView === 'frames' && (
              <>
                {frameTypes.length > 0 && (
                  <Tabs
                    activeKey={activeFrameType}
                    onChange={setActiveFrameType}
                    type="card"
                    size="large"
                    style={{ marginBottom: 16 }}
                    items={[
                      { key: 'All', label: 'All Types' },
                      ...frameTypes.map((t) => ({ key: t, label: t })),
                    ]}
                  />
                )}
                <Table
                  columns={frameColumns}
                  dataSource={filteredFrameData}
                  rowKey={(r) => `${r.branch_id}-${r.product_id}`}
                  pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} products` }}
                  style={{ fontSize: 14 }}
                  locale={{ emptyText: 'No frame stock data for this branch' }}
                  rowClassName={(r) => r.in_stock_count === 0 ? 'out-of-stock-row' : ''}
                />
                <style>{`.out-of-stock-row td { background: #FFF5F5 !important; }`}</style>
              </>
            )}
        </div>
    )
}