import React from 'react'
import { Table, Tag, Typography, Button, Space, Modal } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function DamagedStockTable({ data = [], damagedFrames = [], onApproveDamage, onRejectDamage, ownerBranchId }) {
  const hdr = { style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }

  const rows = [
    ...data.map((item) => ({
      ...item,
      id: `stock-${item.id}`,
      rawId: item.id,
      damageType: 'Stock',
      productLabel: item.productName,
      subLabel: `Stock ID: ${item.stock_id}`,
      quantityLabel: `${item.damaged_quantity} units`,
      reasonLabel: item.reason || '-',
      submittedAt: item.created_at,
      approved: Boolean(item.status_bool),
      reviewStatus: item.review_status || (item.status_bool ? 'Approved' : 'Pending'),
      branch_id: item.branch_id,
      source: 'stock',
    })),
    ...damagedFrames.map((frame) => ({
      ...frame,
      id: `frame-${frame.id}`,
      rawId: frame.id,
      damageType: 'Frame',
      productLabel: frame.product_name || '-',
      subLabel: `Serial: ${frame.serial_no}`,
      quantityLabel: '1 frame',
      reasonLabel: frame.color ? `${frame.frame_type || 'Frame'} - ${frame.color}` : (frame.frame_type || 'Frame'),
      submittedAt: frame.created_at,
      approved: true,
      reviewStatus: 'Recorded',
      source: 'frame',
    })),
  ]

  const getStatusTag = (record) => {
    if (record.source === 'frame') {
      return <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 700 }}>Recorded</Tag>
    }

    if (record.reviewStatus === 'Approved') {
      return <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 700 }}>Approved</Tag>
    }

    if (record.reviewStatus === 'Rejected') {
      return <Tag icon={<CloseCircleOutlined />} color="error" style={{ fontWeight: 700 }}>Rejected</Tag>
    }

    return <Tag color="processing" style={{ fontWeight: 700 }}>Pending</Tag>
  }

  const columns = [
    {
      title: 'Product',
      dataIndex: 'productLabel',
      key: 'productLabel',
      onHeaderCell: () => hdr,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700 }}>{record.productLabel}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.subLabel}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'damageType',
      key: 'damageType',
      width: 120,
      onHeaderCell: () => hdr,
      render: (value) => <Tag color={value === 'Frame' ? 'volcano' : 'blue'}>{value}</Tag>,
    },
    {
      title: 'Damaged Qty',
      dataIndex: 'quantityLabel',
      key: 'quantityLabel',
      width: 140,
      onHeaderCell: () => hdr,
      render: qty => <Tag color="red" style={{ fontWeight: 700 }}>{qty}</Tag>,
    },
    {
      title: 'Reason / Details',
      dataIndex: 'reasonLabel',
      key: 'reasonLabel',
      onHeaderCell: () => hdr,
      render: value => (
        <span title={value}>
          {value?.length > 50 ? `${value.substring(0, 50)}...` : value}
        </span>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 130,
      onHeaderCell: () => hdr,
      render: d => d ? new Date(d).toLocaleDateString() : '-',
    },
    {
      title: 'Status',
      dataIndex: 'approved',
      key: 'approved',
      width: 130,
      onHeaderCell: () => hdr,
      render: (_, record) => getStatusTag(record),
    },
  ]

  if (onApproveDamage || onRejectDamage) {
    columns.push({
      title: 'Action',
      key: 'action',
      width: 190,
      onHeaderCell: () => hdr,
      render: (_, record) => {
        if (record.source !== 'stock') {
          return <Tag color="default">Frame Recorded</Tag>
        }

        if (record.reviewStatus === 'Approved') {
          return <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontWeight: 700 }}>Approved</Tag>
        }

        if (record.reviewStatus === 'Rejected') {
          return <Tag icon={<CloseCircleOutlined />} color="error" style={{ fontWeight: 700 }}>Rejected</Tag>
        }

        return (
          <Space>
            {onApproveDamage && (
              <Button
                size="small"
                type="primary"
                icon={<SafetyCertificateOutlined />}
                onClick={() => onApproveDamage({ ...record, id: record.rawId })}
              >
                Approve
              </Button>
            )}
            {onRejectDamage && (
              <Button
                size="small"
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Reject damage request?',
                    content: 'Rejected damage requests will not deduct stock.',
                    okText: 'Reject',
                    okButtonProps: { danger: true },
                    onOk: () => onRejectDamage({ ...record, id: record.rawId }),
                  })
                }}
              >
                Reject
              </Button>
            )}
          </Space>
        )
      },
    })
  }

  return (
    <Table
      dataSource={rows}
      columns={columns}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: 'No damaged stock records' }}
      rowKey="id"
    />
  )
}
