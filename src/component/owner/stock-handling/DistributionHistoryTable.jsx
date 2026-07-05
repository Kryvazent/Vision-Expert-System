import React , { useState } from 'react'
import { Table, Typography, Select, Input, Button, Space, Popconfirm } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons' 

const {Text} = Typography

const STATUS_CONFIG = {
    'Pending Approval': {
        icon: <ClockCircleOutlined />,
        bg: '#FFFBEB', border: '#FDE68A', text: '#92400E',
    },
    Approved: {
        icon: <CheckCircleOutlined />,
        bg: '#F0FDF4', border: '#BBF7D0', text: '#065F46',
    },
    Transferred: {
        icon: <CheckCircleOutlined />,
        bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6',
    },
    Rejected: {
        icon: <CloseCircleOutlined />,
        bg: '#FEF2F2', border: '#FECACA', text: '#991B1B',
    },
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Pending Approval']
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: cfg.text, fontSize: 12, fontWeight: 600,
        }}>
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

export default function DistributionHistoryTable({ data, onApprove, onReject }) {
    const [statusFilter, setStatusFilter] = useState('All')
    const [search, setSearch] = useState('')

    const filtered = data.filter((d) => {
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
            render: (val, record) => (
                <div>
                    <Text strong style={{ fontSize: 14 }}>{val}</Text>
                    {record.frameSerialNo && (
                        <>
                            <br />
                            <Text
                                type="secondary"
                                style={{ fontSize: 11, fontFamily: 'monospace' }}
                            >
                                Frame: {record.frameSerialNo}
                            </Text>
                        </>
                    )}
                </div>
            ),
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
    ]

    // Only add action column if at least one handler is provided (i.e. manager view)
    if (onApprove || onReject) {
        columns.push({
            title: 'Action',
            key: 'action',
            width: 200,
            render: (_, record) => {
                const isPending = record.status === 'Pending Approval'

                if (!isPending) {
                    return (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.status}
                        </Text>
                    )
                }

                return (
                    <Space size={8}>
                        {onApprove && (
                            <Popconfirm
                                title="Approve this allocation?"
                                description="Stock will be deducted from central and added to your branch."
                                onConfirm={() => onApprove(record)}
                                okText="Yes, Approve"
                                cancelText="Cancel"
                                okButtonProps={{ style: { background: '#16a34a', borderColor: '#16a34a' } }}
                            >
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckCircleOutlined />}
                                    style={{ background: '#16a34a', borderColor: '#16a34a', borderRadius: 6 }}
                                >
                                    Approve
                                </Button>
                            </Popconfirm>
                        )}
                        {onReject && (
                            <Popconfirm
                                title="Reject this allocation?"
                                description="The stock will remain in central warehouse."
                                onConfirm={() => onReject(record)}
                                okText="Yes, Reject"
                                cancelText="Cancel"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    size="small"
                                    icon={<CloseCircleOutlined />}
                                    style={{ borderRadius: 6 }}
                                >
                                    Reject
                                </Button>
                            </Popconfirm>
                        )}
                    </Space>
                )
            },
        })
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input
                    placeholder="Search product or ID..."
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
                        { label: 'Transferred', value: 'Transferred' },
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
                    record.status === 'Rejected' ? 'rejected-row' : ''
                }
                style={{ fontSize: 14 }}
            />
            <style>{`
                .rejected-row td { background: #FEF2F2 !important; }
            `}</style>
        </div>
    )
}
