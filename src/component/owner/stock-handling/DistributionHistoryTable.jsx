import React , { useState } from 'react'
import { Table, Typography, Select, Input, Button,DatePicker } from 'antd'
import { CheckCircleOutlined,CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons' 

const {Text} = Typography
const { RangePicker } = DatePicker
const STATUS_CONFIG ={
    'Pending Approval': {
        icon: <ClockCircleOutlined />,
        bg: '#FFFBEB', border: '#FDE68A', text: '#92400E',
    },
    Approved: {
        icon: <CheckCircleOutlined />,
        bg: '#F0FDF4', border: '#BBF7D0', text: '#065F46',
    },
    Rejected: {
        icon: <CloseCircleOutlined />,
        bg: '#FEF2F2', border: '#FECACA', text: '#991B1B',
    },
}

const StatusBadge = ({status}) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending Approval']
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.text, fontSize: 12, fontWeight: 600,
        }}
        >
            {cfg.icon} {status}
        </span>
    )
}

const BranchTag = ({ branch }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: '#EFF6FF', border: '1px solid #BFDBFE',
        color: '#1D4ED8', borderRadius: 6,
        padding: '2px 10px', fontSize: 12, fontWeight: 500,
    }}>
        {branch}
    </span>
)
export default function DistributionHistoryTable({data, onApprove}) {
    const [statusFilter, setStatusFilter ] = useState("All")
    const [search, setSearch] = useState('')

    const filtered = data.filter((d)=> {
        const statusMatch = statusFilter === 'All' || d.status === statusFilter
        const searchMatch = 
            !search ||
            d.productName.toLowerCase().includes(search.toLowerCase()) ||
            d.distributionId.toLowerCase().includes(search.toLowerCase())
        return statusMatch && searchMatch
    })

    const columns = [
        {
            title: 'Distribution ID',
            dataIndex: 'distributionId',
            key: 'distributionId',
            width: 130,
            render: (val) => (
                <Text style={{ color: '#6B7280', fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>
                    {val}
                </Text>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (val) => <Text style={{ fontSize: 13 }}>{val}</Text>,
        },
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
            render: (val) => <Text strong style={{ fontSize: 14 }}>{val}</Text>,
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            width: 160,
            render: (val) => <BranchTag branch={val} />,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 100,
            align: 'center',
            render: (val) => <Text strong style={{ fontSize: 14, color: '#374151' }}>{val}</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 160,
            render: (val) => <StatusBadge status={val} />,
        },
        {
            title: 'Action',
            key: 'action',
            width: 140,
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    disabled={record.status === 'Approved'}
                    onClick={() => onApprove?.(record)}
                >
                    {record.status === 'Approved' ? 'Approved' : 'Approve'}
                </Button>
            ),
        },
    ]
  return (
    <div>
        {/* Filters */}
        <div style={{display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center',}}>
            <Input 
                placeholder='Search product or ID...'
                prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}  
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 240, borderRadius: 8 }}
            />
            <Select 
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 170 }}
                options={[
                    { label: 'All Status', value: 'All' },
                    { label: 'Pending Approval', value: 'Pending Approval' },
                    { label: 'Approved', value: 'Approved' },
                    { label: 'Rejected', value: 'Rejected' },
                ]}
            />
        </div>
        <Table 
            columns={columns}
            dataSource={filtered}
            rowKey="distributionId"
            pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} records` }}
            rowClassName={(record) => 
                record.status == 'Rejected' ? 'rejected-row' : ''
            }
            style={{ fontSize: 14 }}
        />
        <style>{`
            .rejected-row td { background: #FEF2F2 !important; }
      `}</style>
    </div>
  )
}
