import React from 'react'
import { Table, Tag, Button, Typography, Tooltip } from 'antd'

const { Text } = Typography

const CASH_TYPE_COLORS = {
  'Sales Cash':          { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  'Recovery Cash':       { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  'Extra Recovery Cash': { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' },
}

const STATUS_COLORS = {
  Pending:  { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  Accepted: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  Rejected: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
}

const CashTypeTag = ({ type }) => {
  const c = CASH_TYPE_COLORS[type] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' }
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 500 }}>
      {type}
    </span>
  )
}

const StatusTag = ({ status }) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Pending
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  )
}

export default function CashTable({ data, onAccept, onReject }) {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: 'Date & Time',
      key: 'dateTime',
      width: 150,
      sorter: (a, b) => new Date(a.rawDate) - new Date(b.rawDate),
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.dateLabel}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.timeLabel}</Text>
        </div>
      ),
    },
    {
      title: 'Cash Type',
      dataIndex: 'cashType',
      key: 'cashType',
      width: 140,
      render: (val) => <CashTypeTag type={val} />,
    },
    {
      title: 'Received From',
      dataIndex: 'receivedFrom',
      key: 'receivedFrom',
      render: (val, record) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>{val}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.roleLabel}</Text>
        </div>
      ),
    },
    {
      title: 'Amount (LKR)',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (val) => <Text strong style={{ fontSize: 14 }}>{val.toLocaleString()}</Text>,
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      width: 160,
      render: (val) => val
        ? <Tooltip title={val}><Text style={{ fontSize: 13 }}>{val.length > 18 ? `${val.slice(0, 18)}...` : val}</Text></Tooltip>
        : <Text type="secondary" italic>No note</Text>,
    },
    {
      title: 'Cash Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (val) => <StatusTag status={val} />,
    },
    {
      title:"Manager Confirmation",
      key:"manager",
      width:220,
      render:(_,record)=>{
        if(record.status!=="Accepted"){
          return <Text type="secondary">—</Text>
        }
        if(record.managerProofStatus==="Approved"){
          return(
            <div>
              <Tag color="success">Confirmed</Tag>
              <br/>
              <Text type="secondary"  style={{fontSize:11}}>
                {record.managerProofAtLabel}
              </Text>
            </div>
          )
        }
      return(
        <Tag color="processing">Awaiting Manager </Tag>
      )
    }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => {
         // Pending
        if (record.status === 'Pending') {
          return (
            <div style={{ display: 'flex', gap: 6 }}>
               <Button
                  type="primary"
                  size="small"
                  onClick={() => onAccept(record)}
                  style={{ background: '#1D4ED8',borderColor: '#1D4ED8',borderRadius: 6}}
                >
                  Accept
                </Button>

                <Button
                  danger
                  size="small"
                  onClick={() => onReject(record)}
                  style={{ borderRadius: 6 }}
                >
                  Reject
                </Button>
              </div>
           )
        }

        // Accepted
        if (record.status === 'Accepted') {
          if (record.managerProofStatus === 'Approved') {
            return (
              <Text strong style={{ color: '#16A34A' }}>
                Complete
              </Text>
            )
          }

        return (
          <Text type="secondary" style={{ fontStyle: 'italic' }}>
            Waiting for Manager
          </Text>
        )
      }
      // Rejected
      if (record.status === 'Rejected') {
        return (
          <Text type="secondary">
            Closed
          </Text>
        )
      }
    return null
  }
},
]
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} records` }}
        scroll={{ x: 1100 }}
        style={{ fontSize: 14 }}
        rowClassName={(record) => record.status === 'Pending' ? 'pending-row' : ''}
        locale={{ emptyText: 'No cash transfers submitted yet for this branch' }}
      />
      <style>{`
        .pending-row td { background: #FFFBEB !important; }
        .pending-row:hover td { background: #FEF3C7 !important; }
      `}</style>
    </div>
  )
}
      
