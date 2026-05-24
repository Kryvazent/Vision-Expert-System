import React, { useState, useEffect } from 'react'
import { Table, Select, Typography, Tag, Tabs } from 'antd'

const { Text, Title } = Typography

export default function BranchStockTable({branches = [], selectedBranch, onBranchChange,  data=[], productTypeList=[]}) {

    const [activeCategory, setActiveCategory] = useState('')
 
  // Set default tab to first product type from DB when list loads
    useEffect(() => {
        if (productTypeList.length > 0 ) {
            const exists = productTypeList.some(
                pt => pt.type === activeCategory
            )

            if(!exists){
                setActiveCategory(productTypeList[0].type)

            }
        }
    }, [productTypeList, activeCategory])

    const selectedBranchName = branches.find(b => b.id === selectedBranch)?.branch_name || ''
    const filteredData = data.filter(item => item.category === activeCategory)

    const tabItems = productTypeList.map((pt) => ({
        key: pt.type.toLowerCase(),
        label: pt.type
    }))

    const columns = [
        {
            title: 'Product Name',
            dataIndex: 'productName',
            key: 'productName',
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (val, record) => (
                <div>
                    <Text strong style={{ fontSize: 14 }}>{val}</Text>
                    <br />
                    {/* Show brand below name */}
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.brand}</Text>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 140,
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            render: (val) => <Tag color="blue">{val}</Tag>,
        },
        {
            title: 'Date Added',
            dataIndex: 'date',
            key: 'date',
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
        },
        {
            title: 'StockQuantity',
            dataIndex: 'stockQuantity',
            key: 'quantity',
            width: 120,
            align: 'center',
            onHeaderCell: () => ({ style: { backgroundColor: '#092258', color: 'white', fontWeight: 600 } }),
            sorter: (a, b) => a.stockQuantity - b.stockQuantity,
            render: (qty) => {
                let color = 'green'
                if (qty === 0) color = '#d20d0dc5'
                else if (qty <= 100) color = 'orange'
                return <Tag color={color} style={{ fontWeight: 'bold' }}>{qty} units</Tag>
            },
        },
    ]

    return (
        <div>
            <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 10,
                padding: '12px 16px', 
                marginBottom: 20,
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 10,
            }}>
                <span style={{ fontSize: 18 }}>ℹ️</span>
                <div>
                    <Text strong style={{ color: '#1E40AF', fontSize: 13 }}>Branch Stock Search</Text>
                    <br />
                    <Text style={{ color: '#3B82F6', fontSize: 12 }}>
                        Select a branch to view all products and their stock quantities for that specific location.
                    </Text>
                </div>
            </div>

            <Select 
                value={selectedBranch}
                onChange={(val) => {
                    onBranchChange(val)
                    if(productTypeList.length > 0) setActiveCategory(productTypeList[0].type)
                }}
                placeholder="Select a branch"
                style={{ width: 240, marginBottom: 20 }}
                options={branches.map(b => ({ label: `${b.branch_name}`, value: b.id }))}
            />

            {selectedBranch && (
                <div style={{ marginBottom: 12 }}>
                    <Title level={5} style={{ color: '#1D4ED8', margin: 0 }}>
                        Stock Inventory for {selectedBranchName} Branch
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}> {filteredData.length} items in this category · {data.length} total in branch</Text>
                </div>
            )}

            {selectedBranch && tabItems.length > 0 && (
                <Tabs
                    activeKey={activeCategory}
                    onChange={setActiveCategory}
                    type="card"
                    size="large"
                    style={{ marginBottom: 16 }}
                    items={tabItems}
        />
      )}

            <Table 
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ pageSize: 8, showTotal: (t) => `Total ${t} products` }}
                style={{ fontSize: 14 }}
                locale={{ emptyText: selectedBranch ? 'No stock found for this category in this branch' : 'Select a branch to view stock' }}
            />
        </div>
    )
}
