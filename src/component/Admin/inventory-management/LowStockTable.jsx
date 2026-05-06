import React from 'react'
import { Table, Tag, Space, Tabs, Button, Card, Typography } from 'antd';
import {icons}  from '../../../assets/icons/AdminIcons';
 
 const {Title} = Typography;
 const { TabPane} = Tabs;
 


export default function LowStockTable( iconType, title, value, color, bgColor,) {

const dataSource = [
  {
    key: '1',   
    productCode: 'FRM-001',
    productName: 'Ray-Ban Classic Aviator',
    category: 'frames',
    KadawathaStock: 0,
    reorderLevel: 10,
    unitPrice: 25000,
  },
    {
    key: '2',
    productCode: 'LNS-001',
    productName: 'Single Vision CR-39 Lenses',
    category: 'hardBoxes',
    KadawathaStock: 0,  
    reorderLevel: 50,
    unitPrice: 50000,
  },
];

const columns = [
    {
    title: 'Product Code',
    dataIndex: 'productCode',
    key: 'productCode',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
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
    title: 'Kadawatha Stock',
    dataIndex: 'KadawathaStock',
    key: 'KadawathaStock',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
    {
    title: 'Reorder Level',
    dataIndex: 'reorderLevel',
    key: 'reorderLevel',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    },
    {
    title: 'Unit Price',
    dataIndex: 'unitPrice',
    key: 'unitPrice',
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
        <Table dataSource={dataSource} columns={columns} pagination={false} />
      
    </div>
  )
}
