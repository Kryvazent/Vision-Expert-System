import React, { useState } from 'react'
import { Table, Tag, Tabs, Button, Dropdown, Modal, InputNumber, Input, message, Typography, Row, Col, Card } from 'antd'
import { MoreOutlined, WarningOutlined, SendOutlined } from '@ant-design/icons'

const { Text } = Typography
const { TextArea } = Input

export default function StockItemsTable({
  data = [],
  insertDamageStock,
  onDistribute,
  deductImmediately = true,
  updateStock,
  onRefetch,
  productTypeList = [],
}) {
  const [activeTab, setActiveTab] = useState('')
  const [isDamagedOpen, setIsDamagedOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [damagedQty, setDamagedQty] = useState(0)
  const [damagedReason, setDamagedReason] = useState('')

  React.useEffect(() => {
    if (productTypeList.length > 0 && !activeTab) {
      setActiveTab(productTypeList[0].type)
    }
  }, [productTypeList, activeTab])

  const tabItems = productTypeList.map(pt => ({ label: pt.type, key: pt.type }))
  const filteredData = activeTab ? data.filter(item => item.category === activeTab) : data

  const totalUnits = data.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)
  const lowStockItems = data.filter(item => Number(item.stockQuantity || 0) > 0 && Number(item.stockQuantity || 0) <= 100).length
  const outOfStockItems = data.filter(item => Number(item.stockQuantity || 0) === 0).length

  const handleDamagedSubmit = async () => {
    if (!damagedQty || damagedQty <= 0) {
      message.error('Enter valid damaged quantity!')
      return
    }
    if (damagedQty > selectedItem.stockQuantity) {
      message.error('Exceeds current stock!')
      return
    }
    if (!damagedReason.trim()) {
      message.error('Please enter a reason')
      return
    }

    try {
      await insertDamageStock({
        variables: { stock_id: selectedItem.id, quantity: damagedQty, reason: damagedReason },
      })

      if (deductImmediately) {
        await updateStock({
          variables: { id: selectedItem.id, quantity: selectedItem.stockQuantity - damagedQty },
        })
        message.success('Damage report submitted and stock updated.')
      } else {
        message.success('Damage report submitted for approval.')
      }

      setIsDamagedOpen(false)
      setDamagedQty(0)
      setDamagedReason('')
      onRefetch?.()
    } catch {
      message.error('Submission failed!')
    }
  }

  const getMenu = (record) => ({
    items: [
      {
        key: 'distribute',
        label: <span><SendOutlined style={{ marginRight: 8 }} />Distribute to Branch</span>,
        onClick: () => onDistribute?.(record),
      },
      {
        key: 'damage',
        danger: true,
        label: <span><WarningOutlined style={{ marginRight: 8 }} />Mark as Damaged</span>,
        onClick: () => {
          setSelectedItem(record)
          setDamagedQty(0)
          setDamagedReason('')
          setIsDamagedOpen(true)
        },
      },
    ],
  })

  const hdr = { style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.productName}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
            SKU: {record.sku || '-'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      width: 160,
      onHeaderCell: () => hdr,
      render: (value) => value ? <Tag color="blue">{value}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 170,
      onHeaderCell: () => hdr,
      render: (value) => <Tag color="geekblue" style={{ fontWeight: 600 }}>{value}</Tag>,
    },
    {
      title: 'Date Added',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      onHeaderCell: () => hdr,
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      width: 130,
      align: 'center',
      onHeaderCell: () => hdr,
      sorter: (a, b) => a.stockQuantity - b.stockQuantity,
      render: qty => {
        const color = qty === 0 ? '#d20d0dc5' : qty <= 100 ? 'orange' : 'green'
        return <Tag color={color} style={{ fontWeight: 700 }}>{qty} units</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <Dropdown menu={getMenu(record)} trigger={['click']} placement="bottomRight">
          <Button icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      ),
    },
  ]

  return (
    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 20px 8px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
          border: '1px solid #BFDBFE',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={8}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Stock Items</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8' }}>{data.length}</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Total Units</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{totalUnits}</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Needs Attention</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED' }}>{lowStockItems + outOfStockItems}</div>
              </Card>
            </Col>
          </Row>
          <div style={{ marginTop: 12, fontSize: 12, color: '#3B82F6' }}>
            Select a category, then use More to distribute stock or report damaged quantity.
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{ marginBottom: 16 }}
          items={tabItems}
        />
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 10, showTotal: t => `${t} items` }}
          locale={{ emptyText: 'No stock items found for this category' }}
        />
      </div>

      <Modal
        title="Mark Item as Damaged"
        open={isDamagedOpen}
        onCancel={() => { setIsDamagedOpen(false); setDamagedQty(0); setDamagedReason('') }}
        onOk={handleDamagedSubmit}
        okText="Submit"
        okButtonProps={{ danger: true }}
      >
        <div style={{
          background: '#fff7e6', padding: 10, borderRadius: 8, marginBottom: 15, border: '1px solid #ffd591',
        }}>
          <b>Damage Report</b>
          <p style={{ margin: 0 }}>The damaged quantity will be recorded and removed from central stock.</p>
        </div>
        <p>Product</p>
        <Input value={selectedItem?.productName} disabled />
        <p style={{ marginTop: 10 }}>Current Stock</p>
        <Input value={`${selectedItem?.stockQuantity ?? 0} units`} disabled />
        <p style={{ marginTop: 10 }}>Damaged Quantity</p>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={selectedItem?.stockQuantity}
          value={damagedQty}
          onChange={v => setDamagedQty(v || 0)}
        />
        <p style={{ marginTop: 10 }}>Reason</p>
        <TextArea
          rows={3}
          value={damagedReason}
          onChange={e => setDamagedReason(e.target.value)}
          placeholder="Describe the damage..."
        />
      </Modal>
    </div>
  )
}
