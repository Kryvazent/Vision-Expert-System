import React, { useMemo, useState } from 'react'
import { Table, Tag, Typography, Select, Input, Row, Col, Card } from 'antd'
import { SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

const EVENT_CONFIG = {
  damage_reported: { label: 'Reported', color: 'processing' },
  damage_approved: { label: 'Approved', color: 'success' },
}

const EventPill = ({ value }) => {
  const cfg = EVENT_CONFIG[value] || { label: value, color: 'default' }
  return <Tag color={cfg.color} style={{ fontWeight: 600 }}>{cfg.label}</Tag>
}

export default function DamageHistoryTable({ data = [], branches = [], branchId }) {
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('All')

  const branchNameById = useMemo(() => new Map(branches.map((branch) => [String(branch.id), branch.branch_name])), [branches])

  const filtered = data.filter((row) => {
    const branchMatch = branchId ? String(row.branch_id) === String(branchId) : true
    const eventMatch = eventFilter === 'All' || row.event_type === eventFilter
    const searchMatch = !search ||
      row.productName?.toLowerCase().includes(search.toLowerCase()) ||
      row.reason?.toLowerCase().includes(search.toLowerCase()) ||
      row.id?.toString().includes(search)

    return branchMatch && eventMatch && searchMatch
  })

  const columns = [
    {
      title: 'Event',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 140,
      render: (value) => <EventPill value={value} />,
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
      title: 'Branch',
      dataIndex: 'branch_id',
      key: 'branch_id',
      width: 150,
      render: (value) => branchNameById.get(String(value)) || (value ?? '—'),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      align: 'center',
      render: (value) => <Tag color="red" style={{ fontWeight: 700 }}>{value}</Tag>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (value) => value || <Text type="secondary">—</Text>,
    },
    {
      title: 'Approved',
      dataIndex: 'approved',
      key: 'approved',
      width: 110,
      align: 'center',
      render: (value) => value ? <Tag color="success">Yes</Tag> : <Tag color="processing">No</Tag>,
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
        background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10,
      }}>
        <ExclamationCircleOutlined style={{ color: '#C2410C', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
        <div>
          <Text strong style={{ color: '#9A3412', fontSize: 13 }}>Damage History</Text>
          <br />
          <Text style={{ color: '#C2410C', fontSize: 12 }}>
            This is the audit trail for damaged stock submissions and approvals.
          </Text>
        </div>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#FEF2F2' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Total Events</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#991B1B' }}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#F0FDF4' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Approved</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46' }}>
              {data.filter((item) => item.approved).length}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" bordered={false} style={{ borderRadius: 10, background: '#FFFBEB' }}>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Pending</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E' }}>
              {data.filter((item) => !item.approved).length}
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input
          placeholder="Search product, frame, or reason..."
          prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 260, borderRadius: 8 }}
          allowClear
        />
        <Select
          value={eventFilter}
          onChange={setEventFilter}
          style={{ width: 200 }}
          options={[
            { label: 'All Events', value: 'All' },
            { label: 'Reported', value: 'damage_reported' },
            { label: 'Approved', value: 'damage_approved' },
          ]}
        />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} events` }}
        locale={{ emptyText: 'No damage history found' }}
      />
    </div>
  )
}