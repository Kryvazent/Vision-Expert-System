import React, { useMemo } from 'react'
import { Card, Col, Layout, Row, Table, Tag, Typography, message } from 'antd'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import DistributionHistoryTable from '../../component/owner/stock-handling/DistributionHistoryTable'

const { Content } = Layout
const { Title, Text } = Typography

const LOAD_DISTRIBUTIONS = gql`
  query LoadManagerDistributions($branchId: Int!) {
    stock_distributionCollection(filter: { branch_id: { eq: $branchId } }, orderBy: [{ id: DescNullsLast }]) {
      edges {
        node {
          id
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

const LOAD_BRANCH_STOCK = gql`
  query LoadBranchStock($branchId: Int!) {
    stockCollection(filter: { branch_id: { eq: $branchId } }, orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          created_at
          available_quantity
          branch_id
          product {
            id
            name
            brand {
              brand
            }
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

const CHECK_BRANCH_STOCK = gql`
  query CheckBranchStock($product_id: BigInt!, $branch_id: Int!) {
    stockCollection(filter: { product_id: { eq: $product_id }, branch_id: { eq: $branch_id } }) {
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
    updatestockCollection(set: { available_quantity: $quantity }, filter: { id: { eq: $id } }) {
      records { id available_quantity }
    }
  }
`

const UPDATE_DISTRIBUTION_STATUS = gql`
  mutation UpdateDistributionStatus($id: BigInt!, $status: String!) {
    updatestock_distributionCollection(set: { status: $status }, filter: { id: { eq: $id } }) {
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
    insertIntostockCollection(objects: [{ product_id: $product_id, branch_id: $branch_id, available_quantity: $quantity, added_by: $added_by, supplier_id: $supplier_id }]) {
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

  const [checkBranchStock] = useMutation(CHECK_BRANCH_STOCK)
  const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY)
  const [updateDistributionStatus] = useMutation(UPDATE_DISTRIBUTION_STATUS)
  const [insertStock] = useMutation(INSERT_STOCK)

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
      mainStockQuantity: Number(item.node.stock?.available_quantity ?? 0),
      branch: item.node.branch?.branch_name || 'Unknown Branch',
      branchId: item.node.branch?.id,
      quantity: Number(item.node.quantity),
      status: item.node.status || 'Pending Approval',
      notes: item.node.notes || '',
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
  const branchStockLow = branchStockRows.filter((item) => item.quantity > 0 && item.quantity <= 100).length
  const branchStockOut = branchStockRows.filter((item) => item.quantity === 0).length

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

  const handleApproveDistribution = async (record) => {
    try {
      const targetBranchId = Number(record.branchId)
      const qty = Number(record.quantity)
      const mainStockId = Number(record.stockId)
      const productId = Number(record.productId)

      if (!record.productId || !record.stockId || !targetBranchId) {
        message.error('Distribution details are incomplete.')
        return
      }

      if ((record.mainStockQuantity ?? 0) < qty) {
        message.error('Main stock is no longer sufficient for this approval.')
        return
      }

      await updateStock({
        variables: {
          id: mainStockId,
          quantity: Number(record.mainStockQuantity ?? 0) - qty,
        },
      })

      const result = await checkBranchStock({
        variables: {
          product_id: productId,
          branch_id: targetBranchId,
        },
      })

      const existingStock = result?.data?.stockCollection?.edges?.[0]?.node

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

      await updateDistributionStatus({
        variables: {
          id: Number(record.rawId),
          status: 'Approved',
        },
      })

      await refetch()
      message.success('Incoming stock approved and branch stock updated.')
    } catch (err) {
      console.error('Approve distribution failed:', err)
      message.error('Unable to approve incoming stock.')
    }
  }

  return (
    <Layout>
      <Content className="p-8" style={{ padding: '20px' }}>
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ marginBottom: 4 }}>Incoming Stocks</Title>
              <Text type="secondary">Approve stock allocations sent to your branch</Text>
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
              <Title level={3} style={{ marginBottom: 4 }}>Branch Stock Management</Title>
              <Text type="secondary">Read-only stock details for your branch</Text>
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

        <Card bordered={false} style={{ borderRadius: 12 }}>
          {!branchId ? (
            <div style={{ padding: 24 }}>
              <Text type="secondary">
                No branch is linked to this manager account, so incoming stock approval cannot be loaded.
              </Text>
            </div>
          ) : (
            <DistributionHistoryTable data={distributions} onApprove={handleApproveDistribution} />
          )}
        </Card>
      </Content>
    </Layout>
  )
}