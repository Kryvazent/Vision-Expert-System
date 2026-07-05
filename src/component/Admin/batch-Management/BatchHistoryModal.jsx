import React, { useState, useEffect , useMemo} from 'react'
import {
  Modal, Space,Typography, Row, Col, Tag, Steps,
  Table, DatePicker, Button, message
} from 'antd'
import {
  UserOutlined, HistoryOutlined, ClockCircleOutlined, CheckCircleOutlined,
  SendOutlined, InboxOutlined, ShoppingOutlined, SaveOutlined,
  PhoneOutlined, QuestionCircleOutlined
} from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'

const { Text, Title } = Typography

const UPDATE_BATCH_ORDER_STEP = gql`
  mutation UpdateBatchOrderStep(
    $id: BigInt!
    $step1_actual: Date
    $step2_actual: Date
    $step3_actual: Date
    $step4_actual: Date
    $step5_actual: Date
    $step6_actual: Date
  ) {
    updatebatch_orderCollection(
      set: {
        step1_actual: $step1_actual
        step2_actual: $step2_actual
        step3_actual: $step3_actual
        step4_actual: $step4_actual
        step5_actual: $step5_actual
        step6_actual: $step6_actual
      }
      filter: { id: { eq: $id } }
    ) {
      records { id step1_actual step2_actual step3_actual step4_actual step5_actual step6_actual }
    }
  }
`;

const LOAD_REMINDER_CALLS_FOR_ORDERS = gql`
  query LoadReminderCallsForOrders($order_ids: [BigInt!]) {
    reminder_callCollection(filter: { order_id: { in: $order_ids } }) {
      edges {
        node {
          id
          order_id
          before_lab_status
          before_lab_reason
          before_lab_custom_reason
          before_delivery_status
          before_delivery_reason
          before_delivery_custom_reason
        }
      }
    }
  }
`;

const LOAD_BATCH_CUSTOMERS = gql`
  query LoadBatchCustomers($branchId: ID!) {
    customerCollection {
      edges {
        node {
          id
          first_name
          last_name
          customer_has_branchCollection(filter: { branch_id: { eq: $branchId } }) {
            edges {
              node {
                id
                branch {
                  id
                  branch_name
                }
                clinic_attend_customerCollection {
                  edges {
                    node {
                      id
                      clinic {
                        id
                        branch_id
                        date
                      }
                      orderCollection {
                        edges {
                          node {
                            id
                            placed_at
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
  }
`;


const parseDate = (str) => {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const renderVariance = ({ intended, actual }) => {
  if (!intended || !actual) return null
  const diff = Math.round((parseDate(actual) - parseDate(intended)) / (1000 * 60 * 60 * 24))
  if (diff === 0) return null
  return (
    <Tag color={diff > 0 ? 'error' : 'success'} style={{ fontSize: 10, marginLeft: 4, borderRadius: 4 }}>
      {diff > 0 ? `+${diff}d` : `${diff}d`}
    </Tag>
  )
}


const renderCallCell = (callRecord, statusField, reasonField, customField) => {
  if (!callRecord || !callRecord[statusField]) {
    return (
      <Tag icon={<QuestionCircleOutlined />} color="default" style={{ fontSize: 11 }}>
        Not called yet
      </Tag>
    )
  }
  const isAnswered = callRecord[statusField] === 'answer'
  const reasonText = callRecord[reasonField] === 'other'
    ? callRecord[customField]
    : callRecord[reasonField]
  const statusLabel = callRecord[statusField] === 'answer'
    ? 'Answered'
    : callRecord[statusField] === 'not_answer'
      ? 'Not answered'
      : 'Pending'

  return (
    <div>
      <Tag
        color={isAnswered ? 'success' : 'error'}
        icon={<PhoneOutlined />}
        style={{ fontSize: 11, marginBottom: 4 }}
      >
        {isAnswered ? 'Answered' : 'Not Answered'}
      </Tag>
      <div>
        <Text type="secondary" style={{ fontSize: 11 }}>{statusLabel}</Text>
      </div>
      {reasonText && (
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>{reasonText}</Text>
        </div>
      )}
      {statusField === 'before_lab_status' && !isAnswered && (
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Forward blocked</Text>
        </div>
      )}
      {statusField === 'before_delivery_status' && !isAnswered && (
        <div>
          <Text type="secondary" style={{ fontSize: 11 }}>Delivery blocked</Text>
        </div>
      )}
    </div>
  )
}

const extractCustomerName = (orderNode) => {
  const directCustomer = orderNode?.clinic_attend_customer?.customer
  if (directCustomer) {
    return `${directCustomer.first_name || ''} ${directCustomer.last_name || ''}`.trim() || 'Unknown'
  }

  const branchCustomer = orderNode?.clinic_attend_customer?.customer_has_branch?.customer
  if (branchCustomer) {
    return `${branchCustomer.first_name || ''} ${branchCustomer.last_name || ''}`.trim() || 'Unknown'
  }

  return 'Unknown'
}


export default function BatchHistoryModal({ open, onClose, batch, onRefetch }) {

  const [tableData,      setTableData]      = useState([])
  const [pendingActuals, setPendingActuals] = useState({})
  const [savingKey,      setSavingKey]      = useState(null)

  const [updateBatchOrderStep] = useMutation(UPDATE_BATCH_ORDER_STEP)


  const orderIds = useMemo(() => {
  return (batch?.orderData || [])
    .map(o => Number(o.id))
    .filter(n => Number.isFinite(n))
}, [batch])

  const { data: reminderData } = useQuery(LOAD_REMINDER_CALLS_FOR_ORDERS, {
    variables: { order_ids: orderIds },
    skip: !open || orderIds.length === 0,
    fetchPolicy: 'network-only',
  })

  const { data: batchCustomerData } = useQuery(LOAD_BATCH_CUSTOMERS, {
    variables: { branchId: batch?.branchId },
    skip: !open || orderIds.length === 0 || !batch?.branchId,
    fetchPolicy: 'network-only',
  })


  const reminderMap = useMemo(() => {
  const map = {}
  reminderData?.reminder_callCollection?.edges?.forEach(e => {
    map[String(e.node.order_id)] = e.node
  })
  return map
}, [reminderData])

  const customerMap = useMemo(() => {
    const map = {}
    const allowedOrderIds = new Set(orderIds.map(String))

    batchCustomerData?.customerCollection?.edges?.forEach(({ node: customer }) => {
      const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'

      customer.customer_has_branchCollection?.edges?.forEach(({ node: branch }) => {
        branch.clinic_attend_customerCollection?.edges?.forEach(({ node: clinicAttend }) => {
          clinicAttend.orderCollection?.edges?.forEach(({ node: orderNode }) => {
            if (!allowedOrderIds.has(String(orderNode.id))) return
            map[String(orderNode.id)] = customerName
          })
        })
      })
    })

    return map
  }, [batchCustomerData, orderIds])


  useEffect(() => {
    setTableData(batch?.orderData || [])
    setPendingActuals({})
  }, [batch])

  if (!batch) return null

  const handleActualDateChange = (orderKey, stepKey, dateString) => {
    setPendingActuals(prev => ({
      ...prev,
      [orderKey]: { ...prev[orderKey], [stepKey]: dateString }
    }))
    setTableData(prev => prev.map(order => {
      if (order.key !== orderKey) return order
      return { ...order, [stepKey]: { ...order[stepKey], actual: dateString } }
    }))
  }

  const handleSaveActuals = async (orderKey) => {
    const order = tableData.find(o => o.key === orderKey)
    if (!order?._batchOrderId) { message.warning('No DB id found for this order'); return }
    setSavingKey(orderKey)
    try {
      await updateBatchOrderStep({
        variables: {
          id:           order._batchOrderId,
          step1_actual: order.step1?.actual || null,
          step2_actual: order.step2?.actual || null,
          step3_actual: order.step3?.actual || null,
          step4_actual: order.step4?.actual || null,
          step5_actual: order.step5?.actual || null,
          step6_actual: order.step6?.actual || null,
        }
      })
      message.success(`Dates saved for order ${order.id}`)
      setPendingActuals(prev => { const n = { ...prev }; delete n[orderKey]; return n })
      onRefetch && onRefetch()
    } catch (err) {
      console.error('Save actual dates failed:', err)
      message.error('Failed to save dates')
    } finally {
      setSavingKey(null)
    }
  }

  const renderStep = (val, record, stepKey) => {
    if (!val) return <Text type="secondary">-</Text>
    return (
      <div style={{ lineHeight: '1.5' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>Intended: </Text>
          <Text style={{ fontSize: '11px', marginLeft: '4px' }}>{val.intended || '-'}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '12px' }}>Actual: </Text>
          <Text strong style={{ fontSize: '12px', marginLeft: '4px' }}>{val.actual || '-'}</Text>
          {renderVariance({ intended: val.intended, actual: val.actual })}
        </div>
        <Space direction="vertical">
          <DatePicker
            size="small"
            style={{ marginTop: 4 }}
            onChange={(_, dateString) => handleActualDateChange(record.key, stepKey, dateString)}
          />
        </Space>
      </div>
    )
  }

  const orderColumn = [
    {
      title: 'Order ID', dataIndex: 'id', key: 'id', fixed: 'left', width: 130,
      render: (text) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>,
    },
    {
      title: 'Customer', dataIndex: 'customer', width: 160,
      render: (name, record) => {
        const resolvedName = name && name !== '—'
          ? name
          : customerMap[String(record.id)] || 'Unknown'

        return <Space><UserOutlined /><Text>{resolvedName}</Text></Space>
      },
    },
    {
      title: 'Placed Date', dataIndex: 'placed', width: 120,
      render: (date) => <Text style={{ color: '#595959' }}>{date}</Text>,
    },
    {
      
      // placed BEFORE step1/step2 so admin sees WHY the order is/isn't confirmed
      title: <Tag icon={<PhoneOutlined />} color="blue" style={{ border: 'none' }}>Before Lab Call</Tag>,
      key: 'beforeLabCall', width: 180,
      render: (_, record) => renderCallCell(
        reminderMap[String(record.id)],
        'before_lab_status', 'before_lab_reason', 'before_lab_custom_reason'
      ),
    },
    {
      title: <Tag icon={<ClockCircleOutlined />} color="orange" style={{ border: 'none' }}>Pending Confirmation</Tag>,
      dataIndex: 'step1', width: 210,
      render: (val, record) => renderStep(val, record, 'step1'),
    },
    {
      title: <Tag icon={<CheckCircleOutlined />} color="blue" style={{ border: 'none' }}>Confirmations Completed</Tag>,
      dataIndex: 'step2', width: 210,
      render: (val, record) => renderStep(val, record, 'step2'),
    },
    {
      title: <Tag icon={<SendOutlined />} color="cyan" style={{ border: 'none' }}>Delivered to the Lab</Tag>,
      dataIndex: 'step3', width: 210,
      render: (val, record) => renderStep(val, record, 'step3'),
    },
    {
      title: <Tag icon={<InboxOutlined />} color="blue" style={{ border: 'none' }}>Received from the Lab</Tag>,
      dataIndex: 'step4', width: 210,
      render: (val, record) => renderStep(val, record, 'step4'),
    },
    {
      //  Before Delivery Call — sits before step5 for same reason
      title: <Tag icon={<PhoneOutlined />} color="purple" style={{ border: 'none' }}>Before Delivery Call</Tag>,
      key: 'beforeDeliveryCall', width: 180,
      render: (_, record) => renderCallCell(
        reminderMap[String(record.id)],
        'before_delivery_status', 'before_delivery_reason', 'before_delivery_custom_reason'
      ),
    },
    {
      title: <Tag icon={<ShoppingOutlined />} color="purple" style={{ border: 'none' }}>Out for Delivery</Tag>,
      dataIndex: 'step5', width: 210,
      render: (val, record) => renderStep(val, record, 'step5'),
    },
    {
      title: <Tag icon={<CheckCircleOutlined />} color="green" style={{ border: 'none' }}>Delivered</Tag>,
      dataIndex: 'step6', width: 210,
      render: (val, record) => renderStep(val, record, 'step6'),
    },
    {
      title: 'Save', key: 'save', fixed: 'right', width: 90, align: 'center',
      render: (_, record) => (
        <Button
          type="primary" size="small" icon={<SaveOutlined />}
          loading={savingKey === record.key}
          onClick={() => handleSaveActuals(record.key)}
          style={{ borderRadius: 6 }}
        >
          Save
        </Button>
      ),
    },
  ]

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 600 }}>Status History - {batch.batchNumber}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1600}
      footer={null}
      centered
      styles={{ body: { padding: '24px' }, mask: { backdropFilter: 'blur(4px)' } }}
    >
      <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', marginBottom: '24px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <Row>
          <Col span={8} style={{ padding: '16px 24px', borderRight: '1px solid #f0f0f0', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batch Number</Text>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#262626' }}>{batch.batchNumber}</div>
          </Col>
          <Col span={8} style={{ padding: '16px 24px', borderRight: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</Text>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#262626' }}>{batch.orders}</div>
          </Col>
          <Col span={8} style={{ padding: '16px 24px' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</Text>
            <div style={{ marginTop: '6px' }}>
              <Tag color="green" style={{ borderRadius: '12px', padding: '0 12px', fontWeight: '500', border: 'none' }}>
                {batch.currentStatus}
              </Tag>
            </div>
          </Col>
        </Row>
      </div>

      <Title level={5} style={{ marginBottom: '16px', fontWeight: '600' }}>Order Status Details</Title>
      <Table
        columns={orderColumn}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 2100 }}
        size="middle"
        bordered
        style={{ marginBottom: '32px' }}
        rowKey="key"
        locale={{ emptyText: 'No orders in this batch' }}
      />

      {/* Timeline */}
      <div style={{ background: '#f0f5ff', padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
        <Title level={5} style={{ marginBottom: '20px', color: '#003a8c' }}>Overall Batch Timeline</Title>
        <Steps
          direction="vertical"
          size="small"
          current={batch.currentStep || 0}
          items={[
            { icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />, title: <Text strong>Pending Customer Confirmation</Text>,  description: batch.timeline?.step1 ? `Completed: ${batch.timeline.step1}` : '' },
            { icon: <CheckCircleOutlined style={{ color: '#1677ff' }} />, title: <Text strong>Confirmations Completed</Text>,        description: batch.timeline?.step2 ? `Completed: ${batch.timeline.step2}` : '' },
            { icon: <SendOutlined       style={{ color: '#13c2c2' }} />, title: <Text strong>Delivered to the Lab</Text>,           description: batch.timeline?.step3 ? `Completed: ${batch.timeline.step3}` : '' },
            { icon: <InboxOutlined      style={{ color: '#1677ff' }} />, title: <Text strong>Received from the Lab</Text>,          description: batch.timeline?.step4 ? `Completed: ${batch.timeline.step4}` : '' },
            { icon: <ShoppingOutlined   style={{ color: '#722ed1' }} />, title: <Text strong>Out for Delivery</Text>,               description: batch.timeline?.step5 ? `Completed: ${batch.timeline.step5}` : '' },
            { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, title: <Text strong>Delivered</Text>,                     description: batch.timeline?.step6 ? `Completed: ${batch.timeline.step6}` : '' },
          ]}
        />
      </div>
    </Modal>
  )
}
