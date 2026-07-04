import React, { useState } from 'react'
import {
  Drawer, Table, Typography, Button, Modal, Input,
  Select, Space, message, Popconfirm,
} from 'antd'
import {
  WarningOutlined, SendOutlined, ReloadOutlined, BarcodeOutlined,
} from '@ant-design/icons'
import FrameStatusBadge from './FrameStatusBadge'

const { Text, Title } = Typography
const { TextArea } = Input

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'In Stock',     value: 'in_stock' },
  { label: 'Reserved',     value: 'reserved' },
  { label: 'Sold',         value: 'sold' },
  { label: 'Damaged',      value: 'damaged' },
  { label: 'Transferred',  value: 'transferred' },
]

/**
 * FrameItemsDrawer
 *
 * Drill-down drawer that shows every individual frame row for a given
 * product + branch.  Staff can mark a frame as damaged or initiate a
 * branch transfer directly from here.
 *
 * Props:
 *   open           — boolean
 *   onClose        — () => void
 *   frames         — [{ id, serial_no, color, status, frame_type, created_at }]
 *   productName    — string  (display only)
 *   productSku     — string  (display only)
 *   branches       — [{ id, branch_name }]  used in the transfer modal
 *   currentBranchId — number  excluded from transfer target list
 *   loading        — boolean
 *   onMarkDamaged  — async (frameId, reason) => void
 *   onTransfer     — async (frameId, targetBranchId) => void
 *   onRefresh      — () => void
 */
export default function FrameItemsDrawer({
  open,
  onClose,
  frames = [],
  productName,
  productSku,
  branches = [],
  currentBranchId,
  loading = false,
  onMarkDamaged,
  onTransfer,
  onRefresh,
}) {
  const [statusFilter, setStatusFilter] = useState('all')

  // Damage modal state
  const [damageOpen, setDamageOpen] = useState(false)
  const [damageFrame, setDamageFrame] = useState(null)
  const [damageReason, setDamageReason] = useState('')
  const [damageLoading, setDamageLoading] = useState(false)

  // Transfer modal state
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferFrame, setTransferFrame] = useState(null)
  const [targetBranch, setTargetBranch] = useState(null)
  const [transferLoading, setTransferLoading] = useState(false)

  const filtered = statusFilter === 'all'
    ? frames
    : frames.filter(f => f.status === statusFilter)

  // ── handlers ────────────────────────────────────────────────────────────
  const openDamage = (frame) => {
    setDamageFrame(frame)
    setDamageReason('')
    setDamageOpen(true)
  }

  const handleDamageConfirm = async () => {
    if (!damageReason.trim()) { message.error('Please enter a reason.'); return }
    setDamageLoading(true)
    try {
      await onMarkDamaged(damageFrame.id, damageReason.trim())
      message.success(`Frame ${damageFrame.serial_no} marked as damaged.`)
      setDamageOpen(false)
      onRefresh?.()
    } catch (e) {
      message.error('Failed to mark as damaged: ' + (e?.message || 'unknown error'))
    } finally {
      setDamageLoading(false)
    }
  }

  const openTransfer = (frame) => {
    setTransferFrame(frame)
    setTargetBranch(null)
    setTransferOpen(true)
  }

  const handleTransferConfirm = async () => {
    if (!targetBranch) { message.error('Please select a destination branch.'); return }
    setTransferLoading(true)
    try {
      await onTransfer(transferFrame, targetBranch)
      message.success(`Frame ${transferFrame.serial_no} transferred.`)
      setTransferOpen(false)
      onRefresh?.()
    } catch (e) {
      message.error('Transfer failed: ' + (e?.message || 'unknown error'))
    } finally {
      setTransferLoading(false)
    }
  }

  const columns = [
    {
      title: 'Serial No.',
      dataIndex: 'serial_no',
      key: 'serial_no',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1D4ED8' }}>
          <BarcodeOutlined style={{ marginRight: 6, opacity: 0.5 }} />
          {val}
        </Text>
      ),
    },
    {
      title: 'Frame Type',
      dataIndex: 'frame_type',
      key: 'frame_type',
      width: 130,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => (
        <span style={{
          background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
          borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500,
        }}>{val || '—'}</span>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => val
        ? <Text style={{ fontSize: 13 }}>{val}</Text>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => <FrameStatusBadge status={val} />,
    },
    {
      title: 'Added',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: (_, record) => {
        const canAct = record.status === 'in_stock'
        return (
          <Space size={6}>
            <Button
              size="small"
              danger
              icon={<WarningOutlined />}
              disabled={!canAct}
              onClick={() => openDamage(record)}
            >
              Damage
            </Button>
            <Button
              size="small"
              icon={<SendOutlined />}
              disabled={!canAct}
              onClick={() => openTransfer(record)}
              style={canAct ? { borderColor: '#1D4ED8', color: '#1D4ED8' } : {}}
            >
              Transfer
            </Button>
          </Space>
        )
      },
    },
  ]

  // Status count pills for the header
  const counts = frames.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1
    return acc
  }, {})

  const pillStyle = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: bg, border: `1px solid ${border}`, color,
    borderRadius: 12, padding: '2px 10px', fontSize: 12, fontWeight: 600,
    marginRight: 6,
  })

  return (
    <>
      <Drawer
        title={
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
              {productName || productSku}
            </div>
            {productSku && productName && (
              <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                SKU: {productSku}
              </Text>
            )}
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {counts.in_stock   > 0 && <span style={pillStyle('#F0FDF4','#065F46','#BBF7D0')}>{counts.in_stock} in stock</span>}
              {counts.reserved   > 0 && <span style={pillStyle('#FFFBEB','#92400E','#FDE68A')}>{counts.reserved} reserved</span>}
              {counts.sold       > 0 && <span style={pillStyle('#EFF6FF','#1E40AF','#BFDBFE')}>{counts.sold} sold</span>}
              {counts.damaged    > 0 && <span style={pillStyle('#FEF2F2','#991B1B','#FECACA')}>{counts.damaged} damaged</span>}
              {counts.transferred > 0 && <span style={pillStyle('#F5F3FF','#5B21B6','#DDD6FE')}>{counts.transferred} transferred</span>}
            </div>
          </div>
        }
        open={open}
        onClose={onClose}
        width={820}
        extra={
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
        }
      >
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Filter:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={STATUS_FILTER_OPTIONS}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {filtered.length} of {frames.length} frames
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 12, showTotal: (t) => `${t} frames` }}
          size="small"
          rowClassName={(r) => {
            if (r.status === 'damaged') return 'frame-row-damaged'
            if (r.status === 'sold') return 'frame-row-sold'
            return ''
          }}
          locale={{ emptyText: 'No frames found for this filter.' }}
        />

        <style>{`
          .frame-row-damaged td { background: #FFF5F5 !important; }
          .frame-row-sold td    { background: #F0F9FF !important; }
        `}</style>
      </Drawer>

      {/* ── Mark Damaged modal ─────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#DC2626' }} />
            <span>Mark Frame as Damaged</span>
          </Space>
        }
        open={damageOpen}
        onCancel={() => setDamageOpen(false)}
        onOk={handleDamageConfirm}
        okText="Confirm Damage"
        okButtonProps={{ danger: true, loading: damageLoading }}
        cancelButtonProps={{ disabled: damageLoading }}
      >
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
          padding: '10px 14px', marginBottom: 16,
        }}>
          <Text strong style={{ color: '#991B1B' }}>This action cannot be undone.</Text>
          <br />
          <Text style={{ color: '#B91C1C', fontSize: 12 }}>
            Frame status will be permanently set to <b>damaged</b>. It cannot be sold or transferred afterwards.
          </Text>
        </div>

        <Text type="secondary" style={{ fontSize: 12 }}>Serial No.</Text>
        <Input value={damageFrame?.serial_no} disabled style={{ marginBottom: 12 }} />

        <Text type="secondary" style={{ fontSize: 12 }}>Reason <span style={{ color: '#DC2626' }}>*</span></Text>
        <TextArea
          rows={3}
          placeholder="Describe the damage..."
          value={damageReason}
          onChange={(e) => setDamageReason(e.target.value)}
          style={{ marginTop: 4 }}
        />
      </Modal>

      {/* ── Transfer modal ─────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <SendOutlined style={{ color: '#1D4ED8' }} />
            <span>Transfer Frame to Branch</span>
          </Space>
        }
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        onOk={handleTransferConfirm}
        okText="Confirm Transfer"
        okButtonProps={{ loading: transferLoading, style: { background: '#1D4ED8', borderColor: '#1D4ED8' } }}
        cancelButtonProps={{ disabled: transferLoading }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>Serial No.</Text>
        <Input value={transferFrame?.serial_no} disabled style={{ marginBottom: 12 }} />

        <Text type="secondary" style={{ fontSize: 12 }}>
          Destination Branch <span style={{ color: '#DC2626' }}>*</span>
        </Text>
        <Select
          style={{ width: '100%', marginTop: 4 }}
          placeholder="Select destination branch"
          value={targetBranch}
          onChange={setTargetBranch}
          options={branches
            .filter(b => Number(b.id) !== Number(currentBranchId))
            .map(b => ({ label: b.branch_name, value: b.id }))}
        />
        <div style={{
          marginTop: 14, background: '#EFF6FF', border: '1px solid #BFDBFE',
          borderRadius: 8, padding: '10px 14px',
        }}>
          <Text style={{ color: '#1E40AF', fontSize: 12 }}>
            Frame status will be set to <b>transferred</b> and its branch updated immediately.
          </Text>
        </div>
      </Modal>
    </>
  )
}
