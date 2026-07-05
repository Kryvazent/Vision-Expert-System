import React, { useState, useMemo } from 'react'
import {
  Layout, Card, Row, Col, Typography, DatePicker,
  Select, Button, Table, Statistic, Tag, message,
} from 'antd'
import { BarChartOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// ── GraphQL ────────────────────────────────────────────────────────────────

const GET_REPORT_DATA = gql`
  query GetManagerReportData($branchId: Int!) {
    clinicCollection(filter: { branch_id: { eq: $branchId } }) {
      edges {
        node {
          id
          venue
          date
          clinic_attend_customerCollection {
            edges {
              node {
                id
                orderCollection {
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
                      complaintCollection {
                        edges {
                          node {
                            id
                            complaint
                            created_at
                            complaint_status { status }
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
    }
    # Branch stock
    stockCollection(
      filter: { branch_id: { eq: $branchId } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          available_quantity
          product {
            name
            sku
            selling_price
            product_type { type }
          }
        }
      }
    }
  }
`
// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `LKR ${Number(n ?? 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`

const STATUS_COLORS = {
  pending: 'orange', active: 'blue', completed: 'green',
  hold: 'gold', cancelled: 'red', canceled: 'red',
}

function Report() {
  const { staff } = useAuth()
  const branchId = Number(staff?.branch?.id)

  const [reportType, setReportType] = useState('orders')
  const [dateRange, setDateRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])

  const { data, loading, refetch } = useQuery(GET_REPORT_DATA, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
  })

  // ── Derived data ───────────────────────────────────────────────────────
  const { orders, clinics, complaints, stock } = useMemo(() => {
    const clinicsRaw = data?.clinicCollection?.edges ?? []

    const clinicList = clinicsRaw.map(({ node }) => ({
      key:       node.id,
      venue:     node.venue,
      date:      node.date,
      customers: node.clinic_attend_customerCollection?.edges?.length ?? 0,
    }))

    // All orders across all clinics in this branch, filtered to date range
    const orderList = []
    const complaintList = []

    clinicsRaw.forEach(({ node: clinic }) => {
      ;(clinic.clinic_attend_customerCollection?.edges ?? []).forEach(({ node: cac }) => {
        ;(cac.orderCollection?.edges ?? []).forEach(({ node: order }) => {
          const placed = dayjs(order.placed_at)
          if (
            dateRange[0] && placed.isBefore(dateRange[0].startOf('day')) ||
            dateRange[1] && placed.isAfter(dateRange[1].endOf('day'))
          ) return
          const customer = order.clinic_attend_customer?.customer_has_branch?.customer
          orderList.push({
            key:          order.id,
            orderId:      `ORD-${String(order.id).padStart(4, '0')}`,
            date:         placed.format('YYYY-MM-DD'),
            customer:     customer
              ? `${customer.first_name} ${customer.last_name || ''}`.trim()
              : '—',
            contactNo:    customer?.contact_no || '—',
            amount:       Number(order.total_price ?? 0),
            balance:      Number(order.balance_amount ?? 0),
            status:       order.order_status?.status || 'Unknown',
          })

          // Complaints are a reverse relation on order
          ;(order.complaintCollection?.edges ?? []).forEach(({ node: c }) => {
            complaintList.push({
              key:       c.id,
              date:      dayjs(c.created_at).format('YYYY-MM-DD'),
              complaint: c.complaint,
              venue:     clinic.venue,
              status:    c.complaint_status?.status || 'Unknown',
            })
          })
        })
      })
    })

    // Enrich clinics with order count + revenue
    const clinicEnriched = clinicList.map((cl) => {
      const clOrders = orderList.filter(
        (o) => {
          // match clinic venue back via clinic id — use clinicsRaw directly
          const clinicNode = clinicsRaw.find(({ node }) => String(node.id) === String(cl.key))
          if (!clinicNode) return false
          return (clinicNode.node.clinic_attend_customerCollection?.edges ?? []).some(({ node: cac }) =>
            (cac.orderCollection?.edges ?? []).some(({ node: o2 }) => String(o2.id) === String(o.key))
          )
        }
      )
      return {
        ...cl,
        orders:  clOrders.length,
        revenue: clOrders.reduce((s, o) => s + o.amount, 0),
      }
    })

    const stockList = (data?.stockCollection?.edges ?? []).map(({ node }) => ({
      key:        node.id,
      product:    node.product?.name || '—',
      sku:        node.product?.sku || '—',
      category:   node.product?.product_type?.type || '—',
      quantity:   Number(node.available_quantity ?? 0),
      price:      Number(node.product?.selling_price ?? 0),
      totalValue: Number(node.available_quantity ?? 0) * Number(node.product?.selling_price ?? 0),
    }))

    return { orders: orderList, clinics: clinicEnriched, complaints: complaintList, stock: stockList }
  }, [data, dateRange])

  // ── Stats per report type ──────────────────────────────────────────────
  const stats = useMemo(() => {
    switch (reportType) {
      case 'orders': {
        const completed = orders.filter((o) => o.status?.toLowerCase() === 'completed')
        return [
          { title: 'Total Orders',    value: orders.length },
          { title: 'Total Revenue',   value: fmt(orders.reduce((s, o) => s + o.amount, 0)) },
          { title: 'Completed',       value: completed.length },
          { title: 'Pending Balance', value: fmt(orders.reduce((s, o) => s + o.balance, 0)) },
        ]
      }
      case 'stock':
        return [
          { title: 'Products',    value: stock.length },
          { title: 'Total Units', value: stock.reduce((s, r) => s + r.quantity, 0) },
          { title: 'Total Value', value: fmt(stock.reduce((s, r) => s + r.totalValue, 0)) },
          { title: 'Out of Stock', value: stock.filter((r) => r.quantity === 0).length },
        ]
      case 'clinics':
        return [
          { title: 'Total Clinics',    value: clinics.length },
          { title: 'Total Customers',  value: clinics.reduce((s, c) => s + c.customers, 0) },
          { title: 'Total Orders',     value: clinics.reduce((s, c) => s + c.orders, 0) },
          { title: 'Total Revenue',    value: fmt(clinics.reduce((s, c) => s + c.revenue, 0)) },
        ]
      case 'complaints':
        return [
          { title: 'Total',    value: complaints.length },
          { title: 'Pending',  value: complaints.filter((c) => c.status === 'Pending').length },
          { title: 'Resolved', value: complaints.filter((c) => c.status === 'Resolved').length },
          { title: 'Closed',   value: complaints.filter((c) => c.status === 'Closed').length },
        ]
      default:
        return []
    }
  }, [reportType, orders, stock, clinics, complaints])

  // ── Column definitions ─────────────────────────────────────────────────
  const ordersColumns = [
    { title: 'Order ID',  dataIndex: 'orderId',   key: 'orderId',   width: 110,
      render: (v) => <Text code>{v}</Text> },
    { title: 'Date',      dataIndex: 'date',      key: 'date',      width: 110 },
    { title: 'Customer',  dataIndex: 'customer',  key: 'customer',
      render: (v, r) => <div><div style={{ fontWeight: 600 }}>{v}</div><div style={{ fontSize: 12, color: '#8c8c8c' }}>{r.contactNo}</div></div> },
    { title: 'Amount',    dataIndex: 'amount',    key: 'amount',    width: 130, align: 'right',
      render: (v) => fmt(v) },
    { title: 'Balance',   dataIndex: 'balance',   key: 'balance',   width: 130, align: 'right',
      render: (v) => v > 0 ? <Text type="danger">{fmt(v)}</Text> : <Text type="success">Paid</Text> },
    { title: 'Status',    dataIndex: 'status',    key: 'status',    width: 110,
      render: (v) => <Tag color={STATUS_COLORS[v?.toLowerCase()] || 'default'}>{v}</Tag> },
  ]

  const stockColumns = [
    { title: 'Product',     dataIndex: 'product',    key: 'product' },
    { title: 'SKU',         dataIndex: 'sku',         key: 'sku',        width: 130, render: (v) => <Text code>{v}</Text> },
    { title: 'Category',    dataIndex: 'category',    key: 'category',   width: 130 },
    { title: 'Quantity',    dataIndex: 'quantity',    key: 'quantity',   width: 100, align: 'right',
      render: (v) => <Tag color={v === 0 ? 'red' : v <= 10 ? 'orange' : 'green'}>{v}</Tag> },
    { title: 'Unit Price',  dataIndex: 'price',       key: 'price',      width: 130, align: 'right',
      render: (v) => fmt(v) },
    { title: 'Total Value', dataIndex: 'totalValue',  key: 'totalValue', width: 140, align: 'right',
      render: (v) => fmt(v) },
  ]

  const clinicsColumns = [
    { title: 'Date',      dataIndex: 'date',      key: 'date',     width: 110 },
    { title: 'Venue',     dataIndex: 'venue',     key: 'venue' },
    { title: 'Customers', dataIndex: 'customers', key: 'customers', width: 110, align: 'right' },
    { title: 'Orders',    dataIndex: 'orders',    key: 'orders',    width: 100, align: 'right' },
    { title: 'Revenue',   dataIndex: 'revenue',   key: 'revenue',   width: 140, align: 'right',
      render: (v) => fmt(v) },
  ]

  const complaintsColumns = [
    { title: 'Date',      dataIndex: 'date',      key: 'date',      width: 110 },
    { title: 'Venue',     dataIndex: 'venue',     key: 'venue',     width: 160 },
    { title: 'Complaint', dataIndex: 'complaint', key: 'complaint' },
    { title: 'Status',    dataIndex: 'status',    key: 'status',    width: 120,
      render: (v) => <Tag color={v === 'Resolved' ? 'green' : v === 'Pending' ? 'orange' : 'default'}>{v}</Tag> },
  ]

  const currentColumns = {
    orders: ordersColumns, stock: stockColumns,
    clinics: clinicsColumns, complaints: complaintsColumns,
  }[reportType] || ordersColumns

  const currentData = {
    orders, stock, clinics, complaints,
  }[reportType] || []

  const reportLabels = {
    orders: 'Orders Report', stock: 'Stock Report',
    clinics: 'Clinics Report', complaints: 'Complaints Report',
  }

  // ── Export to Excel ────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!currentData.length) {
      message.warning('No data to export.')
      return
    }
    try {
      const wb = new ExcelJS.Workbook()
      wb.creator = 'Vision Expert System'
      wb.created = new Date()

      const ws = wb.addWorksheet(reportLabels[reportType])

      // Header row from column definitions
      const headers = currentColumns.map((c) => String(c.title))
      const keys    = currentColumns.map((c) => String(c.dataIndex))

      ws.addRow(headers)
      const headerRow = ws.getRow(1)
      headerRow.font  = { bold: true, color: { argb: 'FFFFFFFF' } }
      headerRow.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1677FF' } }
      headerRow.height = 20

      // Auto-width based on header
      ws.columns = headers.map((h, i) => ({
        key:   keys[i],
        width: Math.max(h.length + 4, 14),
      }))

      currentData.forEach((row) => {
        const values = keys.map((k) => {
          const v = row[k]
          // Stringify any non-primitive values (e.g. amounts already formatted)
          if (typeof v === 'object' && v !== null) return String(v)
          return v ?? ''
        })
        ws.addRow(values)
      })

      // Summary row
      ws.addRow([])
      const summaryLabel = ws.addRow([
        `Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`,
        `Branch: ${staff?.branch?.branch_name || branchId}`,
        `Period: ${dateRange[0]?.format('YYYY-MM-DD')} – ${dateRange[1]?.format('YYYY-MM-DD')}`,
      ])
      summaryLabel.font = { italic: true, color: { argb: 'FF8C8C8C' } }

      const buffer = await wb.xlsx.writeBuffer()
      const blob   = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, `${reportType}-report-${dayjs().format('YYYY-MM-DD')}.xlsx`)
      message.success('Report exported successfully.')
    } catch (err) {
      console.error('Export failed:', err)
      message.error('Export failed: ' + (err?.message || 'unknown error'))
    }
  }

  if (!branchId) {
    return (
      <Content style={{ padding: 24 }}>
        <Card>
          <Text type="secondary">No branch assigned to your account.</Text>
        </Card>
      </Content>
    )
  }

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Title level={2}>Reports</Title>

        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={16} align="middle" wrap>
            <Col xs={24} sm={8} md={6}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Report Type</Text>
              <Select
                style={{ width: '100%' }}
                value={reportType}
                onChange={setReportType}
              >
                <Option value="orders">Orders Report</Option>
                <Option value="stock">Stock Report</Option>
                <Option value="clinics">Clinics Report</Option>
                <Option value="complaints">Complaints Report</Option>
              </Select>
            </Col>
            <Col xs={24} sm={14} md={10}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Date Range</Text>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(v) => v && setDateRange(v)}
                allowClear={false}
              />
            </Col>
            <Col xs={24} md={8} style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'flex-end', paddingTop: 22 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={() => refetch()}
                loading={loading}
              >
                Generate
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={loading || !currentData.length}
              >
                Export
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Stat cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {stats.map((s, i) => (
            <Col xs={12} sm={6} key={i}>
              <Card style={{ borderRadius: 10 }}>
                <Statistic
                  title={s.title}
                  value={s.value}
                  valueStyle={{ color: '#1677ff', fontSize: 20 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Data table */}
        <Card
          title={reportLabels[reportType]}
          style={{ borderRadius: 12 }}
        >
          <Table
            columns={currentColumns}
            dataSource={currentData}
            loading={loading}
            rowKey="key"
            pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} records` }}
            locale={{ emptyText: loading ? 'Loading…' : 'No data for selected period' }}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default Report
