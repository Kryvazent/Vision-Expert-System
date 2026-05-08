import React, {useState} from 'react';
import {Table, Tag, DatePicker, Select, Row,Col,} from 'antd';
import { icons } from '../../../assets/icons/AdminIcons';

const {RangePicker} = DatePicker

export default function PettyCashTable({transactions = [] }) {
    const [category, setCategory] = useState("All");

    const filteredData = transactions.filter(item => {
        if(category === "All") return true;
        return item.category === category;
    })

    const column = [
        { title: "Date",dataIndex: "date"},
        {title: "Type",dataIndex: "type",
            render: (type) => 
                type === "Expense" ? (
                    <Tag color="red" iconType="expense">Expense</Tag>
                ) : (
                    <Tag color="green" iconType="replenishment">Replenishment</Tag>
                ),
        },

        {title: "Category",dataIndex: "category",
            render: (cat) => <Tag>{cat}</Tag>,
},
        {title: "Description",dataIndex: "description",},
    ];

  return (
    <div style={{
        background: "#fff",
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
      }}>
        <Row gutter={16} style={{ marginBottom: 15 }}>
            <Col span={12}>
                <p>Filter by Date Range</p>
                <RangePicker style={{ width: "100%" }} />
            </Col>
            <Col span={12}>
                <p>Filter by Category</p>
                <Select 
                    value={category}
                    onChange={setCategory}
                    style={{ width: "100%" }}
                    options={[
                        {value: "All", label: "All Categories"},
                        { value: "Office Supplies", label: "Office Supplies" },
                        { value: "Transportation", label: "Transportation" },
                        { value: "Utilities", label: "Utilities" },
                        { value: "Maintenance", label: "Maintenance" },
                        { value: "Refreshments", label: "Refreshments" },
                        { value: "Other", label: "Other" },
                    ]}
                />
            </Col>
        </Row>

        <Table columns={column} dataSource={filteredData} rowKey = "id" pagination={false}/>
        <h4 style={{ marginTop: 20 }}>Total (filtered)</h4>
      
    </div>
  )
}

