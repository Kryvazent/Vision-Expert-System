import React, { useState } from 'react'
import { Table, Typography, Select, Input, Row, Col, Card, message } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import FrameStatusBadge from './FrameStatusBadge'
import FrameItemsDrawer from './FrameItemsDrawer'

const { Text } = Typography

// ── GraphQL ─────────────────────────────────────────────────────────────────

const LOAD_FRAMES_FOR_PRODUCT = gql`
  query LoadFramesForProduct($product_id: BigInt!, $branch_id: Int!) {
    frameCollection(
      filter: { product_id: { eq: $product_id }, branch_id: { eq: $branch_id } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          serial_no
          color
          status
          created_at
          frame_type {
            id
            type
          }
        }
      }
    }
  }
`

const UPDATE_FRAME_STATUS = gql`
  mutation UpdateFrameStatus($id: BigInt!, $status: String!) {
    updateframeCollection(
      set: { status: $status }
      filter: { id: { eq: $id } }
    ) {
      records { id status }
    }
  }
`

const UPDATE_FRAME_BRANCH = gql`
  mutation UpdateFrameBranch($id: BigInt!, $branch_id: Int!, $status: String!) {
    updateframeCollection(
      set: { branch_id: $branch_id, status: $status }
      filter: { id: { eq: $id } }
    ) {
      records { id branch_id status }
    }
  }
`

const CHECK_BRANCH_STOCK = gql`
  query CheckBranchStock($product_id: BigInt!, $branch_id: Int!) {
    stockCollection(filter: { product_id: { eq: $product_id }, branch_id: { eq: $branch_id } }) {
      edges {
        node {
          id
        }
      }
    }
  }
`

const INSERT_DISTRIBUTION = gql`
  mutation InsertDistribution(
    $stock_id: BigInt!
    $branch_id: Int!
    $quantity: BigInt!
    $status: String!
    $notes: String
    $frame_id: BigInt
  ) {
    insertIntostock_distributionCollection(
      objects: [{
        stock_id: $stock_id
        branch_id: $branch_id
        quantity: $quantity
        status: $status
        notes: $notes
        frame_id: $frame_id
      }]
    ) {
      records { id }
    }
  }
`

/**
 * FrameStockTable
 *
 * Displays aggregated per-branch, per-product frame stock from the
 * branch_frame_stock view. Clicking a row opens FrameItemsDrawer which
 * shows every individual frame with Damage / Transfer actions.
 *
 * Props:
 *   data            — rows from branch_frame_stock view
 *   branches        — [{ id, branch_name }]
 *   selectedBranch  — number | null
 *   onBranchChange  — (id) => void
 *   loading         — boolean
 *   onRefresh       — () => void   called after any mutation so parent refetches
 */
export default function FrameStockTable({
  data = [],
  branches = [],
  selectedBranch,
  onBranchChange,
  loading = false,
  onRefresh,
}) {
  const [search, setSearch] = useState('')
  const [frameTypeFilter, setFrameTypeFilter] = useState('All')

  // drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerProduct, setDrawerProduct] = useState(null) // { product_id, product_name, product_sku }
  const [drawerFrames, setDrawerFrames] = useState([])
  const [drawerLoading, setDrawerLoading] = useState(false)

  const frameTypes = ['All', ...Array.from(new Set(data.map(r => r.frame_type).filter(Boolean)))]

  const filtered = data.filter(row => {
    const matchSearch =
      !search ||
      row.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      row.product_sku?.toLowerCase().includes(search.toLowerCase())
    const matchType = frameTypeFilter === 'All' || row.frame_type === frameTypeFilter
    return matchSearch && matchType
  })

  const totalInStock  = filtered.reduce((s, r) => s + (r.in_stock_count  || 0), 0)
  const totalReserved = filtered.reduce((s, r) => s + (r.reserved_count  || 0), 0)
  const totalDamaged  = filtered.reduce((s, r) => s + (r.damaged_count   || 0), 0)
  const totalTransferred = filtered.reduce((s, r) => s + (r.transferred_count || 0), 0)

  // ── queries / mutations ──────────────────────────────────────────────────
  const [loadFrames] = useLazyQuery(LOAD_FRAMES_FOR_PRODUCT, { fetchPolicy: 'network-only' })
  const [checkBranchStock] = useLazyQuery(CHECK_BRANCH_STOCK, { fetchPolicy: 'network-only' })
  const [updateFrameStatus] = useMutation(UPDATE_FRAME_STATUS)
  const [updateFrameBranch] = useMutation(UPDATE_FRAME_BRANCH)
  const [insertDistribution] = useMutation(INSERT_DISTRIBUTION)

  // ── open drawer for a row ────────────────────────────────────────────────
  const openDrawer = async (record) => {
    if (!selectedBranch) return
    setDrawerProduct({ product_id: record.product_id, product_name: record.product_name, product_sku: record.product_sku })
    setDrawerOpen(true)
    await fetchFrames(record.product_id)
  }

  const fetchFrames = async (productId) => {
    setDrawerLoading(true)
    try {
      const res = await loadFrames({ variables: { product_id: productId, branch_id: selectedBranch } })
      const rows = res.data?.frameCollection?.edges.map(e => ({
        id: e.node.id,
        product_id: record.product_id,
        serial_no: e.node.serial_no,
        color: e.node.color,
        status: e.node.status,
        created_at: e.node.created_at,
        frame_type: e.node.frame_type?.type || '—',
      })) || []
      setDrawerFrames(rows)
    } catch (err) {
      message.error('Failed to load frames.')
    } finally {
      setDrawerLoading(false)
    }
  }

  const handleRefresh = () => {
    if (drawerProduct) fetchFrames(drawerProduct.product_id)
    onRefresh?.()
  }

  // ── damage ───────────────────────────────────────────────────────────────
  const handleMarkDamaged = async (frameId, _reason) => {
    await updateFrameStatus({ variables: { id: frameId, status: 'damaged' } })
  }

  // ── transfer ─────────────────────────────────────────────────────────────
  const handleTransfer = async (frame, targetBranchId) => {
    await updateFrameBranch({ variables: { id: frame.id, branch_id: Number(targetBranchId), status: 'in_stock' } })

    const currentStock = await checkBranchStock({ variables: { product_id: frame.product_id, branch_id: selectedBranch } })
    const sourceStockId = currentStock?.data?.stockCollection?.edges?.[0]?.node?.id

    if (sourceStockId) {
      await insertDistribution({
        variables: {
          stock_id: sourceStockId,
          branch_id: Number(targetBranchId),
          quantity: 1,
          status: 'Transferred',
          notes: `Frame transfer: ${frame.serial_no}`,
          frame_id: frame.id,
        },
      })
    }

    onRefresh?.()
  }

  // ── columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Product',
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
      render: val => (
        <span style={{
          background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
          borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500,
        }}>{val}</span>
      ),
    },
    {
      title: 'In Stock',
      dataIndex: 'in_stock_count',
      key: 'in_stock_count',
      width: 95,
      align: 'center',
      sorter: (a, b) => (a.in_stock_count || 0) - (b.in_stock_count || 0),
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: val => (
        <span style={{
          background: val > 0 ? '#F0FDF4' : '#FEF2F2',
          color: val > 0 ? '#065F46' : '#991B1B',
          border: `1px solid ${val > 0 ? '#BBF7D0' : '#FECACA'}`,
          borderRadius: 8, padding: '3px 12px', fontWeight: 700, fontSize: 13,
          display: 'inline-block', minWidth: 36, textAlign: 'center',
        }}>{val ?? 0}</span>
      ),
    },
    {
      title: 'Reserved',
      dataIndex: 'reserved_count',
      key: 'reserved_count',
      width: 95,
      align: 'center',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: val => val > 0
        ? <FrameStatusBadge status="reserved" size="small" />
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Sold',
      dataIndex: 'sold_count',
      key: 'sold_count',
      width: 75,
      align: 'center',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: val => <Text style={{ color: '#6B7280', fontWeight: 600 }}>{val ?? 0}</Text>,
    },
    {
      title: 'Damaged',
      dataIndex: 'damaged_count',
      key: 'damaged_count',
      width: 90,
      align: 'center',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: val => val > 0
        ? <span style={{ color: '#DC2626', fontWeight: 700 }}>{val}</span>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Transferred',
      dataIndex: 'transferred_count',
      key: 'transferred_count',
      width: 110,
      align: 'center',
      onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
      render: val => val > 0
        ? <FrameStatusBadge status="transferred" size="small" />
        : <Text type="secondary">—</Text>,
    },
    {
      title: '',
      key: 'drill',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <span
          style={{ color: '#1D4ED8', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
          onClick={() => openDrawer(record)}
        >
          View frames →
        </span>
      ),
    },
  ]

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)', padding: 20 }}>
      {/* info banner */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10,
      }}>
        <span style={{ fontSize: 18 }}>📦</span>
        <div>
          <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>Frame Stock (Serialised View)</Text>
          <br />
          <Text style={{ color: '#3B82F6', fontSize: 12 }}>
            Counts come from individual frame records. Click <b>View frames →</b> on any row
            to drill into serial numbers and take damage or transfer actions.
          </Text>
        </div>
      </div>

      {selectedBranch && (
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {[
            { label: 'In Stock', value: totalInStock, bg: '#F0FDF4', fg: '#065F46' },
            { label: 'Reserved', value: totalReserved, bg: '#FFFBEB', fg: '#92400E' },
            { label: 'Damaged', value: totalDamaged, bg: '#FEF2F2', fg: '#991B1B' },
            { label: 'Transferred', value: totalTransferred, bg: '#F5F3FF', fg: '#5B21B6' },
          ].map((item) => (
            <Col key={item.label} xs={24} sm={12} lg={6}>
              <Card size="small" bordered={false} style={{ borderRadius: 10, background: item.bg }}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{item.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: item.fg }}>{item.value}</div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Select
        value={selectedBranch}
        onChange={onBranchChange}
        placeholder="Select a branch"
        style={{ width: 240, marginBottom: 20 }}
        options={branches.map(b => ({ label: b.branch_name, value: b.id }))}
      />

      {selectedBranch && (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            {[
              { label: 'In Stock',  val: totalInStock,  bg: '#F0FDF4', fg: '#065F46', border: '#BBF7D0' },
              { label: 'Reserved', val: totalReserved, bg: '#FFFBEB', fg: '#92400E', border: '#FDE68A' },
              { label: 'Damaged',  val: totalDamaged,  bg: '#FEF2F2', fg: '#991B1B', border: '#FECACA' },
            ].map(c => (
              <Col key={c.label}>
                <div style={{
                  background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10,
                  padding: '10px 20px', minWidth: 110, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.fg }}>{c.val}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{c.label}</div>
                </div>
              </Col>
            ))}
          </Row>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Input
              placeholder="Search product name or SKU…"
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: 260, borderRadius: 8 }}
              allowClear
            />
            <Select
              value={frameTypeFilter}
              onChange={setFrameTypeFilter}
              style={{ width: 180 }}
              options={frameTypes.map(t => ({ label: t === 'All' ? 'All Frame Types' : t, value: t }))}
            />
          </div>
        </>
      )}

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={r => `${r.branch_id}-${r.product_id}-${r.frame_type}`}
        loading={loading}
        pagination={{ pageSize: 10, showTotal: t => `${t} products` }}
        style={{ fontSize: 14 }}
        onRow={record => ({ onClick: () => openDrawer(record), style: { cursor: 'pointer' } })}
        rowClassName={() => 'frame-stock-row'}
        locale={{ emptyText: selectedBranch ? 'No frame stock found.' : 'Select a branch to view frame stock.' }}
      />

      <style>{`.frame-stock-row:hover td { background: #F0F7FF !important; }`}</style>

      {/* Drill-down drawer */}
      <FrameItemsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        frames={drawerFrames}
        productName={drawerProduct?.product_name}
        productSku={drawerProduct?.product_sku}
        branches={branches}
        currentBranchId={selectedBranch}
        loading={drawerLoading}
        onMarkDamaged={handleMarkDamaged}
        onTransfer={handleTransfer}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
