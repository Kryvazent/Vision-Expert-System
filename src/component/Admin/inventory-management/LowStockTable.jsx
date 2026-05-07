import React from 'react'
import { Table, Tag, Space, Tabs, Button, Card, Typography } from 'antd';
import {icons}  from '../../../assets/icons/AdminIcons';
 
 const {Title} = Typography;
 const { TabPane} = Tabs;
 


export default function LowStockTable({data = []} ) {


const columns = [
    {
    title: 'Product Name',
    dataIndex: 'productName',
    key: 'productName',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
    {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
    {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
    {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
        <Space size="middle">
            <Button type="primary" size="small">
                Reorder
            </Button>
        </Space>
    ),
        onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    
    }
];
  return (
    <div>
        <Title level={5} className="mb-0 " style={{fontWeight:'bold'}} >Low Stock Items</Title>
        <Table dataSource={data} columns={columns} pagination={false} />
      
    </div>
  )
}
