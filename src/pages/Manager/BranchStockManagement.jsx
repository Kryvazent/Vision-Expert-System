import React, { useMemo } from 'react'
import { Card, Col, Layout, Row, Table, Tag, Typography } from 'antd'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'

const { Content } = Layout
const { Title, Text } = Typography

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

const mapCategory = (type) => (type ? String(type).trim() : 'Unknown')

export default function BranchStockManagement() {
  const { staff } = useAuth()
  const branchId = Number(staff?.branch_id ?? staff?.branch?.id)

  const { data: branchStockData, loading } = useQuery(LOAD_BRANCH_STOCK, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
    pollInterval: 5000,
  })

  const branchStockRows = useMemo(() => {
    return branchStockData?.stockCollection?.edges?.map((item) => ({
      id: item.node.id,
      productName: item.node.product?.name || 'Unknown Product',
      brand: item.node.product?.brand?.brand || '',
      category: mapCategory(item.node.product?.product_type?.type),
      date: item.node.created_at?.split('T')[0],
      quantity: Number(item.node.available_quantity ?? 0),
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

  return (
    <Layout>
      <Content className="p-8" style={{ padding: '20px' }}>
        <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ marginBottom: 4 }}>Branch Stock Management</Title>
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
        </Card>

        <Card bordered={false} style={{ borderRadius: 12 }}>
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
              loading={loading}
              pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} products` }}
              locale={{ emptyText: 'No stock found for this branch' }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  )
}