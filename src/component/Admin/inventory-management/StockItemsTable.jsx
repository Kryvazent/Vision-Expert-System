import React, { useState } from 'react'
import { Table, Tag, Tabs, Button, Dropdown, Modal, InputNumber, Input, message, Typography, Row, Col, Card } from 'antd'
import { EditOutlined, MoreOutlined, WarningOutlined, BarcodeOutlined, SendOutlined } from '@ant-design/icons'
import FrameStatusBadge from '../../owner/stock-handling/FrameStatusBadge'
import FrameItemsDrawer from '../../owner/stock-handling/FrameItemsDrawer'

const { Text } = Typography
const { TextArea } = Input

/**
 * StockItemsTable
 *
 * Shows stock items grouped by product type.  Each row is a stock entry.
 * "View Frames" link opens FrameItemsDrawer so staff can manage individual
 * serialised frames (damage / transfer) without leaving the page.
 *
 * Props:
 *   data            — stock rows: { id, productId, productName, sku, category,
 *                      date, stockQuantity, productTypeId, frameCount? }
 *   frames          — ALL frame rows for this branch: { id, product_id, serial_no,
 *                      color, status, frame_type, created_at }
 *   branches        — [{ id, branch_name }] for the transfer modal
 *   currentBranchId — number
 *   updateStock     — mutation fn
 *   insertDamageStock — mutation fn
 *   onMarkFrameDamaged  — async (frameId, reason) => void
 *   onTransferFrame     — async (frameId, targetBranchId) => void
 *   deductImmediately   — boolean (default true)
 *   onRefetch       — () => void
 *   productTypeList — [{ id, type }]
 */
export default function StockItemsTable({
  data = [],
  frames = [],
  branches = [],
  currentBranchId,
  updateStock,
  insertDamageStock,
  onMarkFrameDamaged,
  onTransferFrame,
  onDistribute,
  deductImmediately = true,
  onRefetch,
  productTypeList = [],
}) {
  const [activeTab, setActiveTab] = useState('')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDamagedOpen, setIsDamagedOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [updateQty, setUpdateQty] = useState(0)
  const [damagedQty, setDamagedQty] = useState(0)
  const [damagedReason, setDamagedReason] = useState('')

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerFrames, setDrawerFrames] = useState([])
  const [drawerProduct, setDrawerProduct] = useState(null)

  const totalUnits = data.reduce((sum, item) => sum + Number(item.stockQuantity || 0), 0)
  const framedItems = data.filter(item => frames.some(frame => String(frame.product_id) === String(item.productId))).length
  const activeFrames = frames.filter(frame => frame.status === 'in_stock').length
  const isFrameCategory = /frame/i.test(activeTab || '')

  React.useEffect(() => {
    if (productTypeList.length > 0 && !activeTab) {
      setActiveTab(productTypeList[0].type)
    }
  }, [productTypeList])

  const tabItems = productTypeList.map(pt => ({ label: pt.type, key: pt.type }))

  // ── stock-level edit ────────────────────────────────────────────────────
  const handleEditPopup = async () => {
    try {
      const newQty = selectedItem.stockQuantity + updateQty
      if (newQty < 0) { message.error('Quantity cannot be negative!'); return }
      await updateStock({ variables: { id: selectedItem.id, quantity: newQty } })
      message.success('Stock updated!')
      setIsEditOpen(false)
      setUpdateQty(0)
      onRefetch?.()
    } catch { message.error('Update failed!') }
  }

  // ── legacy damaged submit ───────────────────────────────────────────────
  const handleDamagedSubmit = async () => {
    if (!damagedQty || damagedQty <= 0) { message.error('Enter valid damaged quantity!'); return }
    if (damagedQty > selectedItem.stockQuantity) { message.error('Exceeds current stock!'); return }
    if (!damagedReason.trim()) { message.error('Please enter a reason'); return }
    try {
      await insertDamageStock({
        variables: { stock_id: selectedItem.id, quantity: damagedQty, reason: damagedReason },
      })
      if (deductImmediately) {
        await updateStock({
          variables: { id: selectedItem.id, quantity: selectedItem.stockQuantity - damagedQty },
        })
        message.success('Submitted for approval and stock updated!')
      } else {
        message.success('Damage report submitted for approval.')
      }
      setIsDamagedOpen(false)
      setDamagedQty(0)
      setDamagedReason('')
      onRefetch?.()
    } catch { message.error('Submission failed!') }
  }

  // ── open frame drawer for a stock row ───────────────────────────────────
  const openFrameDrawer = (record) => {
    const productFrames = frames.filter(f => String(f.product_id) === String(record.productId))
    setDrawerFrames(productFrames)
    setDrawerProduct({ product_name: record.productName, product_sku: record.sku })
    setDrawerOpen(true)
  }

  // ── dropdown menu ───────────────────────────────────────────────────────
  const getMenu = (record) => {
    const productFrames = frames.filter(f => String(f.product_id) === String(record.productId))
    return {
      items: [
        {
          key: 'distribute',
          label: <span><SendOutlined style={{ marginRight: 8 }} />Distribute to Branch</span>,
          onClick: () => onDistribute?.(record),
        },
        {
          key: 'edit',
          label: <span><EditOutlined style={{ marginRight: 8 }} />Edit Quantity</span>,
          onClick: () => { setSelectedItem(record); setUpdateQty(0); setIsEditOpen(true) },
        },
        {
          key: 'damage',
          danger: true,
          label: <span><WarningOutlined style={{ marginRight: 8 }} />Mark as Damaged</span>,
          onClick: () => { setSelectedItem(record); setDamagedQty(0); setDamagedReason(''); setIsDamagedOpen(true) },
        },
        ...(productFrames.length > 0
          ? [{
              key: 'frames',
              label: <span><BarcodeOutlined style={{ marginRight: 8 }} />View Frames ({productFrames.length})</span>,
              onClick: () => openFrameDrawer(record),
            }]
          : []),
      ],
    }
  }

  // ── columns ─────────────────────────────────────────────────────────────
  const hdr = { style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }
  const frameAwareColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
            SKU: {record.sku || '—'}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue" style={{ fontWeight: 600 }}>Serialised stock</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Frames',
      key: 'frames',
      width: 120,
      align: 'center',
      onHeaderCell: () => hdr,
      render: (_, record) => {
        const count = frames.filter(f => String(f.product_id) === String(record.productId)).length
        const inStock = frames.filter(f => String(f.product_id) === String(record.productId) && f.status === 'in_stock').length
        if (count === 0) return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
        return (
          <span
            style={{ color: '#1D4ED8', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            onClick={() => openFrameDrawer(record)}
          >
            {inStock}/{count} in stock
          </span>
        )
      },
    },
    {
      title: 'Color / Type',
      key: 'colorType',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.category}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>Use the frame drawer for serial-level actions</Text>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      onHeaderCell: () => hdr,
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      onHeaderCell: () => hdr,
      render: qty => {
        const color = qty === 0 ? '#d20d0dc5' : qty <= 100 ? 'orange' : 'green'
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{qty} units</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <Dropdown menu={getMenu(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      ),
    },
  ]

  const generalColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
            SKU: {record.sku || '—'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      onHeaderCell: () => hdr,
      render: (value) => value ? <Tag color="blue">{value}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Category Notes',
      key: 'categoryNotes',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <Tag color="geekblue" style={{ fontWeight: 600 }}>General stock</Tag>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Quantity-based product stock</div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      onHeaderCell: () => hdr,
    },
    {
      title: 'Stock Qty',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      onHeaderCell: () => hdr,
      render: qty => {
        const color = qty === 0 ? '#d20d0dc5' : qty <= 100 ? 'orange' : 'green'
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{qty} units</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <Dropdown menu={getMenu(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      ),
    },
  ]

  const stockItemsColumns = isFrameCategory ? frameAwareColumns : generalColumns

  const filteredData = activeTab ? data.filter(item => item.category === activeTab) : data

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
                <div style={{ fontSize: 12, color: '#6B7280' }}>{isFrameCategory ? 'Serialised Items' : 'Stock Items'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8' }}>{data.length}</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{isFrameCategory ? 'In-stock Frames' : 'Total Units'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#059669' }}>{totalUnits}</div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#fff' }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{isFrameCategory ? 'Frame-Backed Items' : 'Products with Frames'}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#7C3AED' }}>{framedItems}</div>
              </Card>
            </Col>
          </Row>
          <div style={{ marginTop: 12, fontSize: 12, color: '#3B82F6' }}>
            {isFrameCategory
              ? 'This category is displayed as serialised stock. Use More for edit, damage, and frame drill-down actions.'
              : 'This category is displayed as quantity-based stock. Use More for edit and damage actions.'}
            {activeFrames > 0 && <span style={{ marginLeft: 8, color: '#1D4ED8', fontWeight: 600 }}>{activeFrames} frames in stock</span>}
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
          columns={stockItemsColumns}
          dataSource={filteredData}
          rowKey={(record) => record.id}
          pagination={{ pageSize: 10, showTotal: t => `${t} items` }}
          locale={{ emptyText: 'No stock items found for this category' }}
        />
      </div>

      {/* ── Edit modal ── */}
      <Modal
        title="Edit Quantity"
        open={isEditOpen}
        onCancel={() => { setIsEditOpen(false); setUpdateQty(0) }}
        onOk={handleEditPopup}
        okText="Update Quantity"
      >
        <p>Product</p>
        <Input value={selectedItem?.productName} disabled />
        <p style={{ marginTop: 10 }}>Current Quantity</p>
        <Input value={`${selectedItem?.stockQuantity} units`} disabled />
        <p style={{ marginTop: 10 }}>Add Stock</p>
        <InputNumber style={{ width: '100%' }} placeholder="+10" value={updateQty} onChange={v => setUpdateQty(v || 0)} />
        {updateQty !== 0 && (
          <p style={{ marginTop: 8, color: '#1890ff' }}>
            New quantity: <b>{(selectedItem?.stockQuantity || 0) + updateQty} units</b>
          </p>
        )}
      </Modal>

      {/* ── Damaged modal ── */}
      <Modal
        title="Mark Item as Damaged"
        open={isDamagedOpen}
        onCancel={() => { setIsDamagedOpen(false); setDamagedQty(0); setDamagedReason('') }}
        onOk={handleDamagedSubmit}
        okText="Submit for Approval"
        okButtonProps={{ danger: true }}
      >
        <div style={{
          background: '#fff7e6', padding: 10, borderRadius: 8, marginBottom: 15, border: '1px solid #ffd591',
        }}>
          <b>Owner Approval Required</b>
          <p style={{ margin: 0 }}>Damaged quantity will be removed from branch stock once approved.</p>
        </div>
        <p>Product</p>
        <Input value={selectedItem?.productName} disabled />
        <p style={{ marginTop: 10 }}>Current Stock</p>
        <Input value={`${selectedItem?.stockQuantity} units`} disabled />
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
          placeholder="Describe the damage…"
        />
      </Modal>

      {/* ── Frame drill-down drawer ── */}
      <FrameItemsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        frames={drawerFrames}
        productName={drawerProduct?.product_name}
        productSku={drawerProduct?.product_sku}
        branches={branches}
        currentBranchId={currentBranchId}
        onMarkDamaged={onMarkFrameDamaged}
        onTransfer={onTransferFrame}
        onRefresh={() => { onRefetch?.(); setDrawerOpen(false) }}
      />
    </div>
  )
}
