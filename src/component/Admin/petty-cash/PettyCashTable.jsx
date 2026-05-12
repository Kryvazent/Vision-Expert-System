import React, {useMemo, useState} from 'react';
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
import { icons } from '../../../assets/icons/AdminIcons';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';


const {RangePicker} = DatePicker

export default function PettyCashTable({transactions = [] , onEdit, onDelete}) {

    const [category, setCategory] = useState("All");
    const [dateRange, setDateRange] = useState(null);

    const filteredData = useMemo(() => {
        return transactions.filter(item =>{
            if(category !== "All" && item.category !== category) return false;

            if(dateRange && dateRange[0] && dateRange[1]){
                const itemDate = new Date(item.date);
                const start = dateRange[0].toDate();
                const end = dateRange[1].toDate();

                if (itemDate < start || itemDate > end) return false;  
            }

            return true;
        });
    }, [transactions, category, dateRange]);

    const totalFiltered = filteredData.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

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
        {
            title: "Amount",
            dataIndex: "amount",
            align: 'right',
            render: (amount) => Number(amount).toLocaleString(),
        },
        {
            title: 'Actions',
            width: 130,
            render: (_, record) => (
                <Space>
                    <Button 
                        type='text'
                        icon={<EditOutlined style={{ color: '#1677ff' }} />}
                        onClick={() => onEdit(record)}
                    />
                    <Popconfirm 
                        title="Delete Transaction"
                        description="Are you sure you want to delete this transaction?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type='text' danger icon={<DeleteOutlined />}/>
                    </Popconfirm>
                </Space>
            )
        }
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
                <RangePicker style={{ width: "100%" }} onChange={setDateRange} />
            </Col>
            <Col xs={24} md={12} >
                <p style={{ marginBottom: 8, fontWeight: 500 }}>Filter by Category</p>
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
                        { value: 'Courier', label: 'Courier' },
                        { value: 'Printing', label: 'Printing' },
                        { value: 'Cash Top-Up', label: 'Cash Top-Up' },
                        { value: 'Bank Withdrawal', label: 'Bank Withdrawal' },
                        { value: 'Manager Deposit', label: 'Manager Deposit' },
                        { value: "Other", label: "Other" },
                    ]}
                />
            </Col>
        </Row>

        <Table columns={column} dataSource={filteredData} rowKey = "id" pagination={{ pageSize: 8 }} scroll={{ x: 900 }} />
        <div 
            style={{marginTop: 16, textAlign: 'right', fontWeight: 600, fontSize: 16,}}
        >Total (filtered) : LKR {totalFiltered.toLocaleString()}
        </div>
    </div>
  )
}

