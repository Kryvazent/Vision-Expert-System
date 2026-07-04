import React, { useMemo, useState, useEffect } from 'react'
import { Card, Col, Layout, Row, Table, Tag, Typography, message } from 'antd'
import { gql } from '@apollo/client'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import DistributionHistoryTable from '../../component/owner/stock-handling/DistributionHistoryTable'
import FrameStockTable from '../../component/owner/stock-handling/FrameStockTable'
import StockMovementHistoryTable from '../../component/owner/stock-handling/StockMovementHistoryTable'

const { Content } = Layout
const { Title, Text } = Typography

const LOAD_DISTRIBUTIONS = gql`
  query LoadManagerDistributions($branchId: Int!) {
    stock_distributionCollection(
      filter: { branch_id: { eq: $branchId } }
      orderBy: [{ id: DescNullsLast }]
    ) {
      edges {
        node {
          id
          quantity
          created_at
          status
          notes
          frame_id
          frame {
            id
            serial_no
          }
          stock {
            id
            available_quantity
            product {
              id
              name
              sku
              product_type {
                id
                type
              }
            }
          }
          branch {
            id
            branch_name
          }
        }
      }
    }
  }
`

const LOAD_BRANCH_STOCK = gql`
  query LoadBranchStock($branchId: Int!) {
    stockCollection(
      filter: { branch_id: { eq: $branchId } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          created_at
          available_quantity
          branch_id
          product {
            id
            name
            sku
            brand { brand }
            product_type {
              id
              type
            }
          }
        }
      }
    }
  }
`

const LOAD_STOCK_MOVEMENT_HISTORY = gql`
  query LoadStockMovementHistory {
    stock_movement_historyCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          reference_table
          reference_id
          movement_type
          stock_id
          frame_id
          source_branch_id
          target_branch_id
          quantity
          status
          notes
          created_at
          stock {
            id
            product { id name sku }
          }
          frame {
            id
            serial_no
          }
        }
      }
    }
  }
`

const LOAD_BRANCH_FRAME_STOCK = gql`
  query ManagerLoadBranchFrameStock($branchId: Int!) {
    branch_frame_stockCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          branch_id
          product_id
          product_name
          product_sku
          frame_type
          in_stock_count
          reserved_count
          sold_count
          damaged_count
          transferred_count
        }
      }
    }
  }
`

// Fetch the LIVE central-stock quantity right before approving so we never
// work from the stale value stored at distribution-creation time.
const GET_LIVE_CENTRAL_STOCK = gql`
  query GetLiveCentralStock($stock_id: BigInt!) {
    stockCollection(filter: { id: { eq: $stock_id } }) {
      edges {
        node {
          id
          available_quantity
        }
      }
    }
  }
`

const CHECK_BRANCH_STOCK = gql`
  query CheckBranchStock($product_id: BigInt!, $branch_id: Int!) {
    stockCollection(
      filter: { product_id: { eq: $product_id }, branch_id: { eq: $branch_id } }
    ) {
      edges {
        node { id available_quantity }
      }
    }
  }
`

const UPDATE_STOCK_QUANTITY = gql`
  mutation UpdateStock($id: BigInt!, $quantity: BigInt!) {
    updatestockCollection(
      set: { available_quantity: $quantity }
      filter: { id: { eq: $id } }
    ) {
      records { id available_quantity }
    }
  }
`

const UPDATE_DISTRIBUTION_STATUS = gql`
  mutation UpdateDistributionStatus($id: BigInt!, $status: String!) {
    updatestock_distributionCollection(
      set: { status: $status }
      filter: { id: { eq: $id } }
    ) {
      records { id status }
    }
  }
`

const INSERT_STOCK = gql`
  mutation InsertStock(
    $product_id: BigInt!
    $branch_id: Int!
    $quantity: BigInt!
    $added_by: BigInt!
    $supplier_id: BigInt
  ) {
    insertIntostockCollection(
      objects: [{
        product_id: $product_id
        branch_id: $branch_id
        available_quantity: $quantity
        added_by: $added_by
        supplier_id: $supplier_id
      }]
    ) {
      records { id available_quantity }
    }
  }
`

export default function ManagerStockManagement() {
  const { staff } = useAuth()
  const branchId = Number(staff?.branch_id ?? staff?.branch?.id)

  const { data, loading, refetch } = useQuery(LOAD_DISTRIBUTIONS, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  const { data: branchStockData, loading: branchStockLoading } = useQuery(LOAD_BRANCH_STOCK, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  })

  const { data: movementHistoryData } = useQuery(LOAD_STOCK_MOVEMENT_HISTORY, {
    skip: !branchId,
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  })

  // ── frame stock (branch_frame_stock view) ────────────────────────────────
  const [frameStockLoaded, setFrameStockLoaded] = useState(false)
  const [loadFrameStock, { data: frameStockData, loading: frameStockLoading }] =
    useLazyQuery(LOAD_BRANCH_FRAME_STOCK, { fetchPolicy: 'network-only' })

  useEffect(() => {
    if (branchId && !frameStockLoaded) {
      loadFrameStock({ variables: { branchId } })
      setFrameStockLoaded(true)
    }
  }, [branchId, frameStockLoaded, loadFrameStock])

  const branchFrameStockList = useMemo(() => {
    return frameStockData?.branch_frame_stockCollection?.edges.map(e => ({
      branch_id: e.node.branch_id,
      product_id: e.node.product_id,
      product_name: e.node.product_name,
      product_sku: e.node.product_sku,
      frame_type: e.node.frame_type,
      in_stock_count: Number(e.node.in_stock_count ?? 0),
      reserved_count: Number(e.node.reserved_count ?? 0),
      sold_count: Number(e.node.sold_count ?? 0),
      damaged_count: Number(e.node.damaged_count ?? 0),
      transferred_count: Number(e.node.transferred_count ?? 0),
    })) || []
  }, [frameStockData])

  const [getLiveCentralStock] = useLazyQuery(GET_LIVE_CENTRAL_STOCK, { fetchPolicy: 'network-only' })
  const [checkBranchStock]    = useLazyQuery(CHECK_BRANCH_STOCK,     { fetchPolicy: 'network-only' })
  const [updateStock]              = useMutation(UPDATE_STOCK_QUANTITY)
  const [updateDistributionStatus] = useMutation(UPDATE_DISTRIBUTION_STATUS)
  const [insertStock]              = useMutation(INSERT_STOCK)

  const mapCategory = (type) => (type ? String(type).trim() : 'Unknown')

  const distributions = useMemo(() => {
    return data?.stock_distributionCollection?.edges?.map((item, index) => ({
      key: index,
      distributionId: `DST-${String(item.node.id).padStart(4, '0')}`,
      rawId: item.node.id,
      date: item.node.created_at?.split('T')[0],
      productName: item.node.stock?.product?.name || 'Unknown Product',
      productId: item.node.stock?.product?.id,
      stockId: item.node.stock?.id,
      branch: item.node.branch?.branch_name || 'Unknown Branch',
      branchId: item.node.branch?.id,
      quantity: Number(item.node.quantity),
      status: item.node.status || 'Pending Approval',
      notes: item.node.notes || '',
      frameId: item.node.frame_id || null,
      frameSerialNo: item.node.frame?.serial_no || null,
    })) || []
  }, [data])

  const incomingCount = distributions.filter((d) => d.status === 'Pending Approval').length

  const branchStockRows = useMemo(() => {
    return branchStockData?.stockCollection?.edges?.map((item) => ({
      id: item.node.id,
      productName: item.node.product?.name || 'Unknown Product',
      brand: item.node.product?.brand?.brand || '',
      category: mapCategory(item.node.product?.product_type?.type),
      date: item.node.created_at?.split('T')[0],
      quantity: Number(item.node.available_quantity ?? 0),
      productTypeId: item.node.product?.product_type?.id,
    })) || []
  }, [branchStockData])

  const branchStockTotal = branchStockRows.reduce((sum, item) => sum + item.quantity, 0)
  const branchStockLow   = branchStockRows.filter((item) => item.quantity > 0 && item.quantity <= 100).length
  const branchStockOut   = branchStockRows.filter((item) => item.quantity === 0).length

  const movementHistoryRows = useMemo(() => {
    return movementHistoryData?.stock_movement_historyCollection?.edges?.map((item) => ({
      id: item.node.id,
      reference_table: item.node.reference_table,
      reference_id: item.node.reference_id,
      movement_type: item.node.movement_type,
      stock_id: item.node.stock_id,
      frame_id: item.node.frame_id,
      source_branch_id: item.node.source_branch_id,
      target_branch_id: item.node.target_branch_id,
      quantity: Number(item.node.quantity ?? 0),
      status: item.node.status,
      notes: item.node.notes,
      created_at: item.node.created_at,
      productName: item.node.stock?.product?.name || '—',
      productSku: item.node.stock?.product?.sku || '',
      frameSerialNo: item.node.frame?.serial_no || '',
    })) || []
  }, [movementHistoryData])

  const branchStockColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      render: (value, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div style={{ color: '#6b7280', fontSize: 12 }}>{record.brand || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (value) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: 'Date Added',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (value) => value || '-',
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'center',
      sorter: (a, b) => a.quantity - b.quantity,
      render: (value) => {
        let color = 'green'
        if (value === 0) color = 'red'
        else if (value <= 100) color = 'orange'
        return <Tag color={color} style={{ fontWeight: 700 }}>{value} units</Tag>
      },
    },
  ]

  // ── Approve ─────────────────────────────────────────────────────────────
  // Always fetch the live central-stock quantity before deducting to prevent
  // working from the stale snapshot stored at distribution-creation time.
  const handleApproveDistribution = async (record) => {
    try {
      const targetBranchId = Number(record.branchId)
      const qty            = Number(record.quantity)
      const mainStockId    = Number(record.stockId)
      const productId      = Number(record.productId)

      if (!productId || !mainStockId || !targetBranchId) {
        message.error('Distribution details are incomplete.')
        return
      }

      // 1. Get live central-stock quantity
      const liveResult = await getLiveCentralStock({ variables: { stock_id: mainStockId } })
      const liveQty = Number(
        liveResult?.data?.stockCollection?.edges?.[0]?.node?.available_quantity ?? 0
      )

      if (liveQty < qty) {
        message.error(`Not enough central stock. Available: ${liveQty}, requested: ${qty}.`)
        return
      }

      // 2. Deduct from central stock
      await updateStock({
        variables: { id: mainStockId, quantity: liveQty - qty },
      })

      // 3. Upsert branch stock
      const branchResult = await checkBranchStock({
        variables: { product_id: productId, branch_id: targetBranchId },
      })
      const existingStock = branchResult?.data?.stockCollection?.edges?.[0]?.node

      if (existingStock) {
        await updateStock({
          variables: {
            id: existingStock.id,
            quantity: Number(existingStock.available_quantity) + qty,
          },
        })
      } else {
        await insertStock({
          variables: {
            product_id: productId,
            branch_id: targetBranchId,
            quantity: qty,
            added_by: Number(staff?.id),
            supplier_id: null,
          },
        })
      }

      // 4. Mark as Approved
      await updateDistributionStatus({
        variables: { id: Number(record.rawId), status: 'Approved' },
      })

      await refetch()
      message.success('Incoming stock approved and branch stock updated.')
    } catch (err) {
      console.error('Approve distribution failed:', err)
      message.error('Unable to approve incoming stock.')
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  // Stock was never deducted when the distribution was created, so rejection
  // is a status-only update — no quantity adjustment needed.
  const handleRejectDistribution = async (record) => {
    try {
      await updateDistributionStatus({
        variables: { id: Number(record.rawId), status: 'Rejected' },
      })
      await refetch()
      message.success('Allocation rejected. Stock remains in central warehouse.')
    } catch (err) {
      console.error('Reject distribution failed:', err)
      message.error('Unable to reject allocation.')
    }
  }

  return (
    <Layout>
      <Content style={{ padding: '20px' }}>
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ marginBottom: 4 }}>Incoming Stocks</Title>
              <Text type="secondary">Approve or reject stock allocations sent to your branch</Text>
            </Col>
            <Col>
              <Card size="small" style={{ borderRadius: 10, minWidth: 160 }}>
                <Text type="secondary">Pending Approvals</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>{incomingCount}</div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ marginBottom: 4 }}>Branch Stock</Title>
              <Text type="secondary">Read-only stock levels for your branch</Text>
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">Total Items</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{branchStockRows.length}</div>
                </Card>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">Total Qty</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{branchStockTotal}</div>
                </Card>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">Low Stock</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>{branchStockLow}</div>
                </Card>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">Out of Stock</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>{branchStockOut}</div>
                </Card>
              </div>
            </Col>
          </Row>

          {!branchId ? (
            <div style={{ padding: 24 }}>
              <Text type="secondary">
                No branch is linked to this manager account, so branch stock cannot be loaded.
              </Text>
            </div>
          ) : (
            <Table
              columns={branchStockColumns}
              dataSource={branchStockRows}
              rowKey="id"
              loading={branchStockLoading}
              pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} products` }}
              locale={{ emptyText: 'No stock found for this branch' }}
            />
          )}
        </Card>

        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ marginBottom: 4 }}>Frame Stock (Serialised)</Title>
              <Text type="secondary">Real-time per-product frame counts for this branch</Text>
            </Col>
            <Col>
              <div style={{ display: 'flex', gap: 12 }}>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">In Stock</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                    {branchFrameStockList.reduce((s, r) => s + (r.in_stock_count || 0), 0)}
                  </div>
                </Card>
                <Card size="small" style={{ borderRadius: 10, minWidth: 140 }}>
                  <Text type="secondary">Damaged</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                    {branchFrameStockList.reduce((s, r) => s + (r.damaged_count || 0), 0)}
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
          <FrameStockTable
            branches={[{ id: branchId, branch_name: staff?.branch?.branch_name || 'My Branch' }]}
            selectedBranch={branchId}
            onBranchChange={() => {}}
            data={branchFrameStockList}
            loading={frameStockLoading}
          />
        </Card>

        {/* Incoming allocation requests — manager can approve or reject */}
        <Card bordered={false} style={{ borderRadius: 12 }}>
          <Row style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ marginBottom: 4 }}>Incoming Allocation Requests</Title>
              <Text type="secondary">
                Approve to receive stock into your branch, or reject to leave it in the central warehouse
              </Text>
            </Col>
          </Row>
          {!branchId ? (
            <div style={{ padding: 24 }}>
              <Text type="secondary">
                No branch is linked to this manager account, so incoming stock approval cannot be loaded.
              </Text>
            </div>
          ) : (
            <DistributionHistoryTable
              data={distributions}
              onApprove={handleApproveDistribution}
              onReject={handleRejectDistribution}
            />
          )}
        </Card>

        <Card bordered={false} style={{ borderRadius: 12, marginTop: 20 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={3} style={{ marginBottom: 4 }}>Movement History</Title>
              <Text type="secondary">Allocation approvals and stock transfers involving this branch</Text>
            </Col>
          </Row>
          <StockMovementHistoryTable
            data={movementHistoryRows}
            branches={[{ id: branchId, branch_name: staff?.branch?.branch_name || 'My Branch' }]}
            branchId={branchId}
          />
        </Card>
      </Content>
    </Layout>
  )
}
