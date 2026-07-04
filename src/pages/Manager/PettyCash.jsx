import React, { useState, useEffect } from 'react'
import { Layout, Card, Table, Button, DatePicker, Select, InputNumber, message, Modal, Form, Input, Row, Col, Typography, Statistic, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

const GET_PETTY_CASH = gql`
  query GetPettyCash($branchId: Int!) {
    petty_cashCollection(
      filter: { branch_id: { eq: $branchId } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          type
          date
          category
          description
          amount
          created_at
          received_by
          branch_id
        }
      }
    }
  }
`;


const INSERT_PETTY_CASH = gql`
  mutation InsertPettyCash(
    $type: String
    $date: Date
    $category: String
    $description: String
    $amount: Float
    $received_by: Int
    $branch_id: Int
  ) {
    insertIntopetty_cashCollection(
      objects: [{
        type: $type
        date: $date
        category: $category
        description: $description
        amount: $amount
        received_by: $received_by
        branch_id: $branch_id
      }]
    ) {
      records { id }
    }
  }
`

function PettyCash() {
  const { staff } = useAuth()
  const branchId = staff?.branch?.id || staff?.branch_id

  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterDate, setFilterDate] = useState(null)

  const { data, loading, refetch } = useQuery(GET_PETTY_CASH, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only'
  })

  const [insertPettyCash] = useMutation(INSERT_PETTY_CASH)

  const pettyCashData = data?.petty_cashCollection?.edges?.map(edge => ({
    key: edge.node.id,
    id: edge.node.id,
    type: edge.node.type,
    date: edge.node.date,
    category: edge.node.category,
    description: edge.node.description,
    amount: edge.node.amount,
    createdAt: dayjs(edge.node.created_at).format('YYYY-MM-DD HH:mm')
  })) || []

  const filteredData = pettyCashData.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false
    if (filterDate && item.date !== filterDate.format('YYYY-MM-DD')) return false
    return true
  })

  const totalIncome = pettyCashData.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0)
  const totalExpense = pettyCashData.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0)
  const balance = totalIncome - totalExpense

  const handleSubmit = async (values) => {
    try {
      await insertPettyCash({
        variables: {
          type: values.type,
          date: values.date.format('YYYY-MM-DD'),
          category: values.category,
          description: values.description,
          amount: values.amount,
          received_by: staff.id,
          branch_id: branchId
        }
      })
      message.success('Petty cash record added successfully')
      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error('Failed to add petty cash record')
      console.error(error)
    }
  }

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <span style={{ color: type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {type.toUpperCase()}
        </span>
      )
    },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 150 },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          LKR {amount.toLocaleString()}
        </span>
      )
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 150 }
  ]

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
        <Title level={2}>Petty Cash Management</Title>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic title="Total Income" value={totalIncome} prefix="LKR" valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Total Expenses" value={totalExpense} prefix="LKR" valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic title="Balance" value={balance} prefix="LKR" valueStyle={{ color: balance >= 0 ? '#1677ff' : '#ff4d4f' }} />
            </Card>
          </Col>
        </Row>

        <Card
          title="Petty Cash Records"
          extra={
            <Space>
              <Select
                style={{ width: 120 }}
                value={filterType}
                onChange={setFilterType}
              >
                <Option value="all">All Types</Option>
                <Option value="income">Income</Option>
                <Option value="expense">Expense</Option>
              </Select>
              <DatePicker
                value={filterDate}
                onChange={setFilterDate}
                format="YYYY-MM-DD"
              />
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Refresh
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Add Record
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="Add Petty Cash Record"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Add Record"
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select>
                <Option value="income">Income</Option>
                <Option value="expense">Expense</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select date' }]}
              initialValue={dayjs()}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Input placeholder="e.g., Transportation, Office Supplies" />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} placeholder="Describe the transaction" />
            </Form.Item>
            <Form.Item
              label="Amount (LKR)"
              name="amount"
              rules={[{ required: true, message: 'Please enter amount' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}

export default PettyCash