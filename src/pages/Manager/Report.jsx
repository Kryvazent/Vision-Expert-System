import React, { useState } from 'react'
import { Layout, Card, Row, Col, Typography, DatePicker, Select, Button, Table, Statistic } from 'antd'
import { BarChartOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

function Report() {
  const { staff } = useAuth()
  const branchId = staff?.branch?.id || staff?.branch_id

  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')])
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = () => {
    setLoading(true)
    // Simulate report generation
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'orders', label: 'Orders Report' },
    { value: 'stock', label: 'Stock Report' },
    { value: 'clinic', label: 'Clinic Report' },
    { value: 'complaints', label: 'Complaints Report' },
  ]

  const salesColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Amount (LKR)', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ]

  const sampleSalesData = [
    { key: 1, date: '2024-01-15', orderId: 'ORD-001', customer: 'John Doe', amount: 15000, status: 'Completed' },
    { key: 2, date: '2024-01-16', orderId: 'ORD-002', customer: 'Jane Smith', amount: 22000, status: 'Completed' },
    { key: 3, date: '2024-01-17', orderId: 'ORD-003', customer: 'Bob Johnson', amount: 18000, status: 'Pending' },
  ]

  const stockColumns = [
    { title: 'Product', dataIndex: 'product', key: 'product' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Available Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Unit Price (LKR)', dataIndex: 'price', key: 'price' },
    { title: 'Total Value (LKR)', dataIndex: 'totalValue', key: 'totalValue' },
  ]

  const sampleStockData = [
    { key: 1, product: 'Frame A', sku: 'FRM-001', quantity: 25, price: 5000, totalValue: 125000 },
    { key: 2, product: 'Lens B', sku: 'LNS-001', quantity: 50, price: 3000, totalValue: 150000 },
    { key: 3, product: 'Frame C', sku: 'FRM-002', quantity: 15, price: 7000, totalValue: 105000 },
  ]

  const clinicColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Venue', dataIndex: 'venue', key: 'venue' },
    { title: 'Customers Attended', dataIndex: 'customers', key: 'customers' },
    { title: 'Orders Generated', dataIndex: 'orders', key: 'orders' },
    { title: 'Revenue (LKR)', dataIndex: 'revenue', key: 'revenue' },
  ]

  const sampleClinicData = [
    { key: 1, date: '2024-01-15', venue: 'City Center', customers: 45, orders: 32, revenue: 480000 },
    { key: 2, date: '2024-01-20', venue: 'Mall Plaza', customers: 38, orders: 28, revenue: 420000 },
  ]

  const complaintsColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Complaint', dataIndex: 'complaint', key: 'complaint' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ]

  const sampleComplaintsData = [
    { key: 1, date: '2024-01-15', orderId: 'ORD-001', customer: 'John Doe', complaint: 'Frame quality issue', status: 'Resolved' },
    { key: 2, date: '2024-01-18', orderId: 'ORD-005', customer: 'Alice Brown', complaint: 'Delivery delay', status: 'Pending' },
  ]

  const getColumns = () => {
    switch (reportType) {
      case 'sales':
      case 'orders':
        return salesColumns
      case 'stock':
        return stockColumns
      case 'clinic':
        return clinicColumns
      case 'complaints':
        return complaintsColumns
      default:
        return salesColumns
    }
  }

  const getData = () => {
    switch (reportType) {
      case 'sales':
      case 'orders':
        return sampleSalesData
      case 'stock':
        return sampleStockData
      case 'clinic':
        return sampleClinicData
      case 'complaints':
        return sampleComplaintsData
      default:
        return sampleSalesData
    }
  }

  const getStats = () => {
    switch (reportType) {
      case 'sales':
      case 'orders':
        return [
          { title: 'Total Revenue', value: 55000, prefix: 'LKR' },
          { title: 'Total Orders', value: 3 },
          { title: 'Completed', value: 2 },
          { title: 'Pending', value: 1 },
        ]
      case 'stock':
        return [
          { title: 'Total Products', value: 3 },
          { title: 'Total Items', value: 90 },
          { title: 'Total Value', value: 380000, prefix: 'LKR' },
          { title: 'Low Stock Items', value: 1 },
        ]
      case 'clinic':
        return [
          { title: 'Total Clinics', value: 2 },
          { title: 'Total Customers', value: 83 },
          { title: 'Total Orders', value: 60 },
          { title: 'Total Revenue', value: 900000, prefix: 'LKR' },
        ]
      case 'complaints':
        return [
          { title: 'Total Complaints', value: 2 },
          { title: 'Resolved', value: 1 },
          { title: 'Pending', value: 1 },
          { title: 'Resolution Rate', value: '50%' },
        ]
      default:
        return []
    }
  }

  if (!branchId) {
    return (
      <Content style={{ padding: 24 }}>
        <Card>
          <Text type="secondary">No branch assigned to this staff member.</Text>
        </Card>
      </Content>
    )
  }

  return (
    <Layout>
      <Content style={{ padding: 24 }}>
        <Title level={2}>Reports</Title>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Report Type</Text>
              </div>
              <Select
                style={{ width: '100%' }}
                value={reportType}
                onChange={setReportType}
                options={reportTypes}
              />
            </Col>
            <Col span={6}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Date Range</Text>
              </div>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={handleGenerateReport}
                loading={loading}
                style={{ marginRight: 8 }}
              >
                Generate Report
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => {}}
              >
                Export
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {}}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          {getStats().map((stat, index) => (
            <Col span={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  valueStyle={{ color: '#1677ff' }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Card
          title={`${reportTypes.find(t => t.value === reportType)?.label || 'Report'} Details`}
        >
          <Table
            columns={getColumns()}
            dataSource={getData()}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default Report