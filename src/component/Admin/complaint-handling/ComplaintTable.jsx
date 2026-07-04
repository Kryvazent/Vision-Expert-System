import { Button, Table, Tag, Select, Space} from 'antd'
import React from 'react'
import { UserOutlined, CheckCircleOutlined } from '@ant-design/icons'

const {Option} = Select;

export default function ComplaintTable({data, onStatusChange, statusUpdating, onAssign, onResolve}) {

const getStatusTag = (status) => {
    switch(status){
        case "Pending":
            return <Tag color="orange">Pending</Tag>
        case "Assigned":
            return <Tag color="blue">Assigned</Tag>
        case "In Progress":
            return <Tag color="blue">In Progress</Tag>
         case "Resolved":
            return <Tag color="green">Resolved</Tag>
         case "Closed":
            return <Tag color="red">Closed</Tag>
        default:
            return <Tag color="default">{status}</Tag>;
    }
}

const column = [
    {title: "Order ID", dataIndex: "orderID" , width: 100},
    {title: "Customer", dataIndex: "customer", width: 180},
    {title: "Complaint", dataIndex: "complaint"},
    {title: "Date", dataIndex: "date", width: 120},
    {title: "Assign To", dataIndex: "assignedTo", width: 150},
    {title: "Current Status", render: (_, record) => getStatusTag(record.status)},
    {
        title: "Action",
        width: 200,
        render: (_, record) => (
            <Space>
                {record.status === "Pending" && (
                    <Button
                        type="primary"
                        size="small"
                        icon={<UserOutlined />}
                        onClick={() => onAssign(record)}
                    >
                        Assign
                    </Button>
                )}
                {(record.status === "Assigned" || record.status === "In Progress") && (
                    <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => onResolve(record)}
                    >
                        Resolve
                    </Button>
                )}
                <Select
                    value={record.status}
                    onChange={(value) => onStatusChange(record.key, value)}
                    style={{ width: 120 }}
                    disabled={statusUpdating}
                    size="small"
                >
                    <Option value="Pending">Pending</Option>
                    <Option value="Assigned">Assigned</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Resolved">Resolved</Option>
                    <Option value="Closed">Closed</Option>
                </Select>
            </Space>
        ),
    },
]   

        

  return (  
    <Table 
        columns={column} 
        dataSource={data} 
        pagination={{pageSize: 5}} 
        rowKey="key" 
        scroll={{x: 1000}}
        
        
    />
  )
}
