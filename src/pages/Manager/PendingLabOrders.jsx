import React, { useState } from 'react'
import { Layout, Card, Table, Button, Tag, DatePicker, Select, message, Modal, Form, Input, Row, Col, Typography } from 'antd'
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

const GET_LAB_FOLLOW_UP = gql`
  query GetLabFollowUp($branchId: Int!) {
    lab_follow_upCollection(
      filter: { branch_id: { eq: $branchId } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          order_id
          clinic_id
          sent_to_lab_date
          expected_return_date
          received_date
          note
          lab_follow_up_status_id
          branch_id
          created_at
          order {
            id
            clinic_attend_customer {
              customer_has_branch {
                customer {
                  first_name
                  last_name
                  contact_no
                }
              }
            }
          }
          lab_follow_up_status {
            id
            status
          }
        }
      }
    }
  }
`

const UPDATE_LAB_FOLLOW_UP = gql`
  mutation UpdateLabFollowUp($id: BigInt!, $receivedDate: Date!, $statusId: BigInt!, $note: String) {
    updatelab_follow_upCollection(
      filter: { id: { eq: $id } }
      set: {
        received_date: $receivedDate
        lab_follow_up_status_id: $statusId
        note: $note
      }
    ) {
      records { id }
    }
  }
`

function PendingLabOrders() {
  const { staff } = useAuth()
  const branchId = staff?.branch?.id || staff?.branch_id

  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const { data, loading, refetch } = useQuery(GET_LAB_FOLLOW_UP, {
    variables: { branchId },
    skip: !branchId,
    fetchPolicy: 'network-only'
  })

  const [updateLabFollowUp] = useMutation(UPDATE_LAB_FOLLOW_UP)

  const labOrdersData = data?.lab_follow_upCollection?.edges?.map(edge => ({
    key: edge.node.id,
    id: edge.node.id,
    orderId: edge.node.order_id,
    clinicId: edge.node.clinic_id,
    sentToLabDate: edge.node.sent_to_lab_date,
    expectedReturnDate: edge.node.expected_return_date,
    receivedDate: edge.node.received_date,
    note: edge.node.note,
    status: edge.node.lab_follow_up_status?.status || 'Pending',
    statusId: edge.node.lab_follow_up_status_id,
    customerName: `${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ''} ${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ''}`.trim(),
    contactNo: edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.contact_no,
    createdAt: dayjs(edge.node.created_at).format('YYYY-MM-DD HH:mm')
  })) || []

  const filteredData = labOrdersData.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false
    return true
  })

  const pendingCount = labOrdersData.filter(i => i.status === 'Pending').length
  const inProgressCount = labOrdersData.filter(i => i.status === 'In Progress').length
  const completedCount = labOrdersData.filter(i => i.status === 'Completed').length

  const handleMarkReceived = (record) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      receivedDate: dayjs(),
      note: record.note || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    try {
      await updateLabFollowUp({
        variables: {
          id: selectedRecord.id,
          receivedDate: values.receivedDate.format('YYYY-MM-DD'),
          statusId: 3, // Assuming 3 is the "Completed" status ID
          note: values.note
        }
      })
      message.success('Lab order marked as received')
      setIsModalOpen(false)
      form.resetFields()
      refetch()
    } catch (error) {
      message.error('Failed to update lab order')
      console.error(error)
    }
  }

  const columns = [
    { title: 'Order ID', dataIndex: 'orderId', key: 'orderId', width: 100 },
    { title: 'Customer', dataIndex: 'customerName', key: 'customerName', width: 150 },
    { title: 'Contact', dataIndex: 'contactNo', key: 'contactNo', width: 120 },
    { title: 'Sent to Lab', dataIndex: 'sentToLabDate', key: 'sentToLabDate', width: 120 },
    { title: 'Expected Return', dataIndex: 'expectedReturnDate', key: 'expectedReturnDate', width: 120 },
    {
      title: 'Received Date',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 120,
      render: (date) => date || <Text type="secondary">Not received</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const color = status === 'Pending' ? 'orange' : status === 'In Progress' ? 'blue' : 'green'
        return <Tag color={color}>{status}</Tag>
      }
    },
    { title: 'Note', dataIndex: 'note', key: 'note', width: 200 },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        !record.receivedDate && (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleMarkReceived(record)}
          >
            Mark Received
          </Button>
        )
      )
    }
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
        <Title level={2}>Pending Lab Orders</Title>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#faad14' }}>{pendingCount}</div>
              <div style={{ color: '#8c8c8c' }}>Pending Orders</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{inProgressCount}</div>
              <div style={{ color: '#8c8c8c' }}>In Progress</div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a' }}>{completedCount}</div>
              <div style={{ color: '#8c8c8c' }}>Completed</div>
            </Card>
          </Col>
        </Row>

        <Card
          title="Lab Orders"
          extra={
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                style={{ width: 150 }}
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Option value="all">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Completed">Completed</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                Refresh
              </Button>
            </div>
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
          title="Mark Lab Order as Received"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={() => form.submit()}
          okText="Confirm"
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Received Date"
              name="receivedDate"
              rules={[{ required: true, message: 'Please select received date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="Note"
              name="note"
            >
              <Input.TextArea rows={3} placeholder="Add any notes about the received order" />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}

export default PendingLabOrders
