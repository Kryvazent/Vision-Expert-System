import { Button, Table, Tag, Select} from 'antd'
import React from 'react'

const {Option} = Select;

export default function ComplaintTable({data, onStatusChange, statusUpdating}) {

const getStatusTag = (status) => {
    switch(status){
        case "Pending":
            return <Tag color="orange">Pending</Tag>
        case "In Progress":
            return <Tag color ="blue">In Progress</Tag>
         case "Resolved":
            return <Tag color ="green">Resolved</Tag>
         case "Closed":
            return <Tag color ="red">Closed</Tag>
        default:
            return <Tag color="default">{status}</Tag>;
    }
}

const column = [
    {title: "Order ID", dataIndex: "orderID" , width: 100},
    {title: "Customer", dataIndex: "customer", width: 180},
    {title: "Complaint", dataIndex: "complaint"},
    {title: "Date", dataIndex: "date", width: 120},
    {title: "Assign To", dataIndex: "assignTo", width: 150},
    {title: "Current Status", render: (_, record) => getStatusTag(record.status)},
    {
        title: "Action", 
        width: 180,
        render: (_, record) => (
            <Select 
                value={record.status}
                onChange={(value) => onStatusChange(record.key, value)}
                style={{ width: 150 }}
                disabled={statusUpdating}
            >
                <Option value="Pending">Pending</Option>
                <Option value="In Progress">In Progress</Option>
                <Option value="Resolved">Resolved</Option>
                <Option value="Closed">Closed</Option>
            </Select>
        ),
    },
]   

        

  return (  
    <Table 
        columns={column} 
        dataSource={data} 
        pagination={{pageSize: 5}} 
        rowKey="key" 
        scroll={{x: 900}}
        
        
    />
  )
}
