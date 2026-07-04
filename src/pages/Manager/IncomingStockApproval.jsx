import React, { useMemo } from 'react'
import { Card, Col, Layout, Row, Typography, message } from 'antd'
import { gql } from '@apollo/client'
import { useMutation, useQuery, useLazyQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import DistributionHistoryTable from '../../component/owner/stock-handling/DistributionHistoryTable'

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
          branch_id
          quantity
          created_at
          status
          notes
          stock {
            id
            available_quantity
            product {
              id
              name
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

// Used to fetch the LIVE central-stock quantity right before approving,
// so we never work from the stale value stored at distribution-creation time.
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
        node {
          id
          available_quantity
        }
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

export default function IncomingStockApproval() {
  const { staff } = useAuth()
  // AuthProvider sets staff.branch as an object — staff.branch_id does NOT exist as a flat field
  const branchId = Number(staff?.branch?.id)
  const hasBranchId = Number.isFinite(branchId) && branchId > 0

  const { data, refetch } = useQuery(LOAD_DISTRIBUTIONS, {
    variables: { branchId },
    skip: !hasBranchId,
    fetchPolicy: 'network-only',
  })

  const [getLiveCentralStock] = useLazyQuery(GET_LIVE_CENTRAL_STOCK, { fetchPolicy: 'network-only' })
  const [checkBranchStock]    = useLazyQuery(CHECK_BRANCH_STOCK,    { fetchPolicy: 'network-only' })
  const [updateStock]               = useMutation(UPDATE_STOCK_QUANTITY)
  const [updateDistributionStatus]  = useMutation(UPDATE_DISTRIBUTION_STATUS)
  const [insertStock]               = useMutation(INSERT_STOCK)

  const distributions = useMemo(() => {
    return (data?.stock_distributionCollection?.edges || []).map((item, index) => ({
      key: index,
      distributionId: `DST-${String(item.node.id).padStart(4, '0')}`,
      rawId: item.node.id,
      date: item.node.created_at?.split('T')[0],
      productName: item.node.stock?.product?.name || 'Unknown Product',
      productId: item.node.stock?.product?.id,
      stockId: item.node.stock?.id,
      branch: item.node.branch?.branch_name || 'Unknown Branch',
      branchId: Number(item.node.branch_id ?? item.node.branch?.id),
      quantity: Number(item.node.quantity),
      status: item.node.status || 'Pending Approval',
      notes: item.node.notes || '',
    }))
  }, [data])

  const incomingCount = distributions.filter((d) => d.status === 'Pending Approval').length

  // ── Approve ────────────────────────────────────────────────────────────────
  // Fetch the live central-stock row first so we never use a stale quantity
  // that was captured when the distribution was created.
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

      // 1. Fetch live central stock quantity
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

      // 3. Add to branch stock (upsert)
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

      // 4. Mark distribution as Approved
      await updateDistributionStatus({
        variables: { id: Number(record.rawId), status: 'Approved' },
      })

      await refetch()
      message.success('Stock approved and added to your branch.')
    } catch (err) {
      console.error('Approve distribution failed:', err)
      message.error('Unable to approve incoming stock.')
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  // Stock was never deducted at request-time, so rejection is simply a status
  // update — no quantity adjustment needed.
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
              <Title level={2} style={{ marginBottom: 4 }}>Allocated Stock Notices</Title>
              <Text type="secondary">Review and approve or reject stock allocations sent to your branch</Text>
            </Col>
            <Col>
              <Card size="small" style={{ borderRadius: 10, minWidth: 160 }}>
                <Text type="secondary">Pending Notices</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>{incomingCount}</div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {!hasBranchId ? (
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
      </Content>
    </Layout>
  )
}
