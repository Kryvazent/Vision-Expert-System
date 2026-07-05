import React from 'react';
import {
    Table, 
    Tag, 
    DatePicker, 
    Select, 
    Row,
    Col,
    Button,
    Popconfirm,
    Space
} from 'antd';

const {RangePicker} = DatePicker

export default function PettyCashTable({
    transactions = [],
    loading = false,
    category = "All",
    dateRange = null,
    categoryOptions = [{ value: "All", label: "All Categories" }],
    filteredTotal = 0,
    onCategoryChange,
    onDateRangeChange,
}) {

    const column = [
        { title: "Date",dataIndex: "date"},
        {title: "Type",dataIndex: "type",
            render: (type) => 
                type === "Expense" ? (
                    <Tag color="red">Expense</Tag>
                ) : (
                    <Tag color="green">Replenishment</Tag>
                ),
        },

        {title: "Category",dataIndex: "category",
            render: (cat) => <Tag>{cat}</Tag>,
},
        {title: "Description",dataIndex: "description",},
       
        {
            title: "Amount",
            dataIndex: "amount",
            align: 'right',
            render: (amount) => Number(amount).toLocaleString(),
        },
       
    ];

  return (
    <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
      }}>
        <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col xs={24} md={12}>
                <p style={{ marginBottom: 8, fontWeight: 500 }}>Filter by Date Range</p>
                <RangePicker
                    style={{ width: "100%" }}
                    value={dateRange}
                    onChange={onDateRangeChange}
                    format="YYYY-MM-DD"
                    allowClear
                />
            </Col>
            <Col xs={24} md={12} >
                <p style={{ marginBottom: 8, fontWeight: 500 }}>Filter by Category</p>
                <Select 
                    value={category}
                    onChange={onCategoryChange}
                    style={{ width: "100%" }}
                    options={categoryOptions}
                />
            </Col>
        </Row>

        <Table
            columns={column}
            dataSource={transactions}
            loading={loading}
            rowKey = "id"
            pagination={{ pageSize: 8 }}
            scroll={{ x: 900 }}
        />
        <div 
            style={{marginTop: 16, textAlign: 'right', fontWeight: 600, fontSize: 16,}}
        >Total (filtered) : LKR {Number(filteredTotal || 0).toLocaleString()}
        </div>
    </div>
  )
}

