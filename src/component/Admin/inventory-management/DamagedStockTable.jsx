import React, { useState } from 'react'
import { Table, Tag, Typography, Tabs, Button, Space } from 'antd'
import { CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import FrameStatusBadge from '../../owner/stock-handling/FrameStatusBadge'

const { Text } = Typography

/**
 * DamagedStockTable
 *
 * Two tabs:
 *  1. "Legacy Damage Reports" — rows from the damaged_stock table (quantity-based,
 *     require owner approval before deducting from stock)
 *  2. "Damaged Frames" — individual frame rows where frame.status = 'damaged'
 *
 * Props:
 *   data         — legacy damaged_stock rows (existing shape)
 *   damagedFrames — frame rows with status=damaged:
 *                   { id, serial_no, color, frame_type, product_name, product_sku, created_at }
 *   ownerBranchId — branch id used to hide approval for owner-originated rows
 */
export default function DamagedStockTable({ data = [], damagedFrames = [], onApproveDamage, ownerBranchId }) {
  const [activeTab, setActiveTab] = useState('legacy')

  // ── legacy columns ────────────────────────────────────────────────────────
  const hdr = { style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }

  const legacyColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>Stock ID: {record.stock_id}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      onHeaderCell: () => hdr,
    },
    {
      title: 'Damaged Qty',
      dataIndex: 'damaged_quantity',
      key: 'damaged_quantity',
      onHeaderCell: () => hdr,
      render: qty => <Tag color="red" style={{ fontWeight: 'bold' }}>{qty} units</Tag>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      onHeaderCell: () => hdr,
      render: r => (
        <span title={r} style={{ cursor: 'pointer' }}>
          {r?.length > 40 ? `${r.substring(0, 40)}…` : r}
        </span>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      onHeaderCell: () => hdr,
      render: d => d ? new Date(d).toLocaleDateString() : '—',
    },
    {
      title: 'Approval',
      dataIndex: 'status_bool',
      key: 'status_bool',
      onHeaderCell: () => hdr,
      render: s => s
        ? <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 'bold' }}>Approved</Tag>
        : <Tag color="processing" style={{ fontWeight: 'bold' }}>Pending</Tag>,
    },
  ]

  if (onApproveDamage) {
    legacyColumns.push({
      title: 'Action',
      key: 'action',
      onHeaderCell: () => hdr,
      render: (_, record) => {
        const isOwnerDamage = ownerBranchId != null && Number(record.branch_id) === Number(ownerBranchId)

        if (record.status_bool) {
          return <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 'bold' }}>Approved</Tag>
        }

        if (isOwnerDamage) {
          return <Tag color="processing" style={{ fontWeight: 'bold' }}>Owner Submitted</Tag>
        }

        return (
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={() => onApproveDamage(record)}
            >
              Approve
            </Button>
          </Space>
        )
      },
    })
  }

  // ── frame-level damage columns ────────────────────────────────────────────
  const frameColumns = [
    {
      title: 'Serial No.',
      dataIndex: 'serial_no',
      key: 'serial_no',
      onHeaderCell: () => hdr,
      render: val => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#991B1B' }}>{val}</Text>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      onHeaderCell: () => hdr,
      render: (val, record) => (
        <div>
          <Text strong>{val || '—'}</Text>
          {record.product_sku && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                SKU: {record.product_sku}
              </Text>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Frame Type',
      dataIndex: 'frame_type',
      key: 'frame_type',
      width: 130,
      onHeaderCell: () => hdr,
      render: val => val
        ? <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>{val}</span>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 90,
      onHeaderCell: () => hdr,
      render: val => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      onHeaderCell: () => hdr,
      render: () => <FrameStatusBadge status="damaged" size="small" />,
    },
    {
      title: 'Marked',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      onHeaderCell: () => hdr,
      render: d => d ? new Date(d).toLocaleDateString() : '—',
    },
  ]

  const tabItems = [
    {
      key: 'legacy',
      label: (
        <span>
          Legacy Reports
          {data.length > 0 && (
            <span style={{
              background: '#DC2626', color: '#fff', borderRadius: 10,
              padding: '0 7px', fontSize: 11, fontWeight: 700, marginLeft: 6,
            }}>{data.length}</span>
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={data}
          columns={legacyColumns}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No damaged stock submissions' }}
          rowKey="id"
        />
      ),
    },
    {
      key: 'frames',
      label: (
        <span>
          Damaged Frames
          {damagedFrames.length > 0 && (
            <span style={{
              background: '#DC2626', color: '#fff', borderRadius: 10,
              padding: '0 7px', fontSize: 11, fontWeight: 700, marginLeft: 6,
            }}>{damagedFrames.length}</span>
          )}
        </span>
      ),
      children: (
        <Table
          dataSource={damagedFrames}
          columns={frameColumns}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No frames marked as damaged' }}
          rowKey="id"
          rowClassName={() => 'damaged-frame-row'}
        />
      ),
    },
  ]

  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
      <style>{`.damaged-frame-row td { background: #FFF5F5 !important; }`}</style>
    </div>
  )
}
