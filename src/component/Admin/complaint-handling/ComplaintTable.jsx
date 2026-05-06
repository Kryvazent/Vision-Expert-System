import { EditOutlined } from '@ant-design/icons'
import { Button, Table, Tag} from 'antd'
import React from 'react'

export default function ComplaintTable({data}) {

const getStatusTag = (status) => {
    switch(status){
        case "Pending":
            return <Tag color="orange">Pending</Tag>
        case "In-Progress":
            return <Tag color ="blue">In Progress</Tag>
         case "Resolved":
            return <Tag color ="green">Resolved</Tag>
         case "Closed":
            return <Tag color ="default">Closed</Tag>
        default:
            return status;
    }
}

const column = [
    {title: "Complaint ID", dataIndex: "complaintID" },
    {title: "Order ID", dataIndex: "orderID" },
    {title: "Customer", dataIndex: "customer"},
    {title: "Complaint", dataIndex: "complaint"},
    {title: "Date", dataIndex: "date"},
    {title: "Assign To", dataIndex: "assignTo"},
    {
        title: "Status", 
        render: (_, record) => getStatusTag(record.status),
    },
    {
        title: "Action", 
        render: () => (
            <Button icon={< EditOutlined/>}>Edit</Button>
        )
    },
    

]
        

  return (  
    <Table columns={column} dataSource={data} pagination={false} rowKey="key"/>
  )
}
