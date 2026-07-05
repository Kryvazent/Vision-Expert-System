import React from 'react'
import { Select, Typography } from 'antd'

const { Text } = Typography

const STATUS_OPTIONS = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Accepted', value: 'Accepted' },
    { label: 'Rejected', value: 'Rejected' },
]

export default function CashFiltersBar({
    cashTypeList = [],
    categoryFilter, onCategoryChange,
    statusFilter, onStatusChange,
    totalEntries, totalAmount,
}) {
    const categoryOptions = [
        { label: 'All Categories', value: 'All' },
        ...cashTypeList.map(ct => ({ label: ct.type, value: ct.type })),
    ]

    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12, marginBottom: 16,
            background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
            padding: '14px 18px',
        }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Select
                    value={categoryFilter}
                    onChange={onCategoryChange}
                    options={categoryOptions}
                    style={{ width: 200 }}
                />
                <Select
                    value={statusFilter}
                    onChange={onStatusChange}
                    options={STATUS_OPTIONS}
                    style={{ width: 180 }}
                />
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
                {totalEntries} entries · LKR {totalAmount.toLocaleString()} total
            </Text>
        </div>
    )
}
