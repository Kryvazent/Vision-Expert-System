import React, { useMemo, useState } from 'react'
import {
  Layout, Card, Table, Tag, Typography,
  Input, Select, Row, Col, Button,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

// Query clinics for this branch, then traverse
// clinic → clinic_attend_customer → order
// This keeps the branch filter at the DB level so we never
// load every order in the system and filter in JS.
const GET_PENDING_PAYMENTS = gql`
  query GetPendingPayments($branchId: Int!) {
    clinicCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          clinic_attend_customerCollection {
            edges {
              node {
                id
                orderCollection(
                  filter: { balance_amount: { gt: 0 } }
                  orderBy: [{ placed_at: DescNullsLast }]
                ) {
                  edges {
                    node {
                      id
                      placed_at
                      total_price
                      balance_amount
                      order_status { status }
                      clinic_attend_customer {
                        customer_has_branch {
                          customer {
                            first_name
                            last_name
                            contact_no
                          }
                        }
                      }
                      payment {
                        advance
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const STATUS_COLORS = {
  pending: 'orange', active: 'blue', completed: 'green',
  hold: 'gold', cancelled: 'red', canceled: 'red',
}

const fmt = (n) =>
  `LKR ${Number(n ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`

function PendingPayment() {
  const { staff } = useAuth()
  // AuthProvider sets staff.branch as an object — use staff.branch.id
  const branchId = Number(staff?.branch?.id)

  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data, loading, refetch } = useQuery(GET_PENDING_PAYMENTS, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
    pollInterval: 30000,
  })

  // Flatten clinics → clinic_attend_customers → orders into a flat list
  const rows = useMemo(() => {
    const result = []
    ;(data?.clinicCollection?.edges ?? []).forEach(({ node: clinic }) => {
      ;(clinic.clinic_attend_customerCollection?.edges ?? []).forEach(({ node: cac }) => {
        ;(cac.orderCollection?.edges ?? []).forEach(({ node: order }) => {
          const customer =
            order.clinic_attend_customer?.customer_has_branch?.customer
          result.push({
            key:          order.id,
            orderId:      `ORD-${String(order.id).padStart(4, '0')}`,
            rawId:        order.id,
            customerName: customer
              ? `${customer.first_name} ${customer.last_name || ''}`.trim()
              : '—',
            contactNo:    customer?.contact_no || '—',
            placedAt:     order.placed_at
              ? dayjs(order.placed_at).format('YYYY-MM-DD')
              : '—',
            totalPrice: Number(order.total_price ?? 0),
            advance:    Number(order.payment?.advance ?? 0),
            balance:    Number(order.balance_amount ?? 0),
            status:     order.order_status?.status || 'Unknown',
          })
        })
      })
    })
    return result
  }, [data])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        !search ||
        r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.orderId.toLowerCase().includes(search.toLowerCase()) ||
        r.contactNo.includes(search)
      const matchStatus =
        statusFilter === 'all' ||
        (r.status || '').toLowerCase() === statusFilter.toLowerCase()
      return matchSearch && matchStatus
    })
  }, [rows, search, statusFilter])

  const totalBalance = filtered.reduce((s, r) => s + r.balance, 0)

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 110,
      render: (v) => (
        <Text style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1677ff' }}>
          {v}
        </Text>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.contactNo}</div>
        </div>
      ),
    },
    {
      title: 'Placed',
      dataIndex: 'placedAt',
      key: 'placedAt',
      width: 110,
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 130,
      align: 'right',
      render: (v) => fmt(v),
    },
    {
      title: 'Advance Paid',
      dataIndex: 'advance',
      key: 'advance',
      width: 130,
      align: 'right',
      render: (v) => <span style={{ color: '#52c41a' }}>{fmt(v)}</span>,
    },
    {
      title: 'Balance Due',
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      align: 'right',
      sorter: (a, b) => b.balance - a.balance,
      defaultSortOrder: 'ascend',
      render: (v) => (
        <span style={{ fontWeight: 700, color: '#ff4d4f' }}>{fmt(v)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v) => (
        <Tag color={STATUS_COLORS[(v || '').toLowerCase()] || 'default'}>{v}</Tag>
      ),
    },
  ]

  if (!branchId) {
    return (
      <Content style={{ padding: 24 }}>
        <Card>
          <Text type="secondary">No branch is linked to your account.</Text>
        </Card>
      </Content>
    )
  }

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>Pending Payments</Title>
            <Text type="secondary">
              Orders with outstanding balance for your branch
            </Text>
          </Col>
          <Col>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Summary */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Card style={{ borderLeft: '4px solid #ff4d4f', borderRadius: 10 }}>
              <Text type="secondary">Total Outstanding</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff4d4f' }}>
                {fmt(totalBalance)}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ borderLeft: '4px solid #1677ff', borderRadius: 10 }}>
              <Text type="secondary">Orders with Balance</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1677ff' }}>
                {filtered.length}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title="Orders with Balance Due"
          style={{ borderRadius: 12 }}
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Input
                placeholder="Search name, order or phone…"
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260, borderRadius: 8 }}
                allowClear
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="active">Active</Option>
                <Option value="hold">Hold</Option>
                <Option value="completed">Completed</Option>
              </Select>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="rawId"
            pagination={{
              pageSize: 10,
              showTotal: (t) => `Total ${t} orders`,
            }}
            locale={{
              emptyText: loading
                ? 'Loading…'
                : 'No pending payments found for your branch',
            }}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default PendingPayment
