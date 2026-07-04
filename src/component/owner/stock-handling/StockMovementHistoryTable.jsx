import React, { useMemo, useState } from 'react'
import { Table, Tag, Typography, Select, Input, Row, Col, Card } from 'antd'
import { SearchOutlined, SwapOutlined } from '@ant-design/icons'

const { Text } = Typography

const TYPE_CONFIG = {
  allocation_requested: { label: 'Allocation Requested', color: 'processing' },
  allocation_approved: { label: 'Allocation Approved', color: 'success' },
  allocation_rejected: { label: 'Allocation Rejected', color: 'error' },
  transfer_completed: { label: 'Transfer Completed', color: 'purple' },
  transfer_requested: { label: 'Transfer Requested', color: 'blue' },
}

const StatusPill = ({ value }) => {
  const cfg = TYPE_CONFIG[value] || { label: value, color: 'default' }
  return <Tag color={cfg.color} style={{ fontWeight: 600 }}>{cfg.label}</Tag>
}

export default function StockMovementHistoryTable({ data = [], branches = [], branchId }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  const branchNameById = useMemo(() => {
    return new Map(branches.map((branch) => [String(branch.id), branch.branch_name]))
  }, [branches])

  const filtered = data.filter((row) => {
    const visibleForBranch = branchId
      ? String(row.source_branch_id) === String(branchId) || String(row.target_branch_id) === String(branchId)
      : true

    const typeMatch = typeFilter === 'All' || row.movement_type === typeFilter
    const searchMatch = !search ||
      row.notes?.toLowerCase().includes(search.toLowerCase()) ||
      row.productName?.toLowerCase().includes(search.toLowerCase()) ||
      row.frameSerialNo?.toLowerCase().includes(search.toLowerCase())

    return visibleForBranch && typeMatch && searchMatch
  })

  const columns = [
    {
      title: 'Movement',
      dataIndex: 'movement_type',
      key: 'movement_type',
      width: 170,
      render: (value) => <StatusPill value={value} />,
    },
    {
      title: 'Product / Frame',
      key: 'item',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.productName || '—'}</div>
          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
            {record.productSku ? `SKU: ${record.productSku}` : record.frameSerialNo ? `Frame: ${record.frameSerialNo}` : '—'}
          </Text>
        </div>
      ),
    },
    {
      title: 'From',
      dataIndex: 'source_branch_id',
      key: 'source_branch_id',
      width: 150,
      render: (value) => branchNameById.get(String(value)) || (value ?? '—'),
    },
    {
      title: 'To',
      dataIndex: 'target_branch_id',
      key: 'target_branch_id',
      width: 150,
      render: (value) => branchNameById.get(String(value)) || (value ?? '—'),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      align: 'center',
      render: (value) => <Tag color="blue" style={{ fontWeight: 700 }}>{value}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (value) => <Tag color={value === 'Approved' ? 'success' : value === 'Transferred' ? 'purple' : 'processing'}>{value}</Tag>,
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (value) => value || <Text type="secondary">—</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (value) => value ? new Date(value).toLocaleDateString() : '—',
    },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', padding: 20 }}>
      <div style={{
        background: '#F8FAFF', border: '1px solid #BFDBFE', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10,
      }}>
        <SwapOutlined style={{ color: '#1D4ED8', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
        <div>
          <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>Stock Movement History</Text>
          <br />
          <Text style={{ color: '#3B82F6', fontSize: 12 }}>
            Allocation approvals, rejections, and transfers are logged here so owner and managers can trace where stock moved.
          </Text>
        </div>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#F0FDF4' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Total Movements</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46' }}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#EFF6FF' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Filtered</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1D4ED8' }}>{filtered.length}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#F5F3FF' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Branch Scope</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#5B21B6' }}>{branchId ? 1 : 'All'}</div>
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          placeholder="Search product, frame, or notes..."
          prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260, borderRadius: 8 }}
          allowClear
        />
        <Select
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 220 }}
          options={[
            { label: 'All Movements', value: 'All' },
            ...Object.keys(TYPE_CONFIG).map((key) => ({ label: TYPE_CONFIG[key].label, value: key })),
          ]}
        />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} movements` }}
        locale={{ emptyText: 'No stock movements found' }}
      />
    </div>
  )
}