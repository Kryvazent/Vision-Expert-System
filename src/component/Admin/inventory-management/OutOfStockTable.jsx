import React from 'react'
import { Table, Space, Button, Card, Typography } from 'antd';
const { Title } = Typography;

export default function OutOfStockTable({ data = [] }) {
  
// const dataSource = [
//   {
//     key: '1',   
//     productCode: 'FRM-001',
//     productName: 'Ray-Ban Classic Aviator',
//     category: 'frames',
//     quantity: 10,
//   },
//     {
//     key: '2',
//     productCode: 'LNS-001',
//     productName: 'Single Vision CR-39 Lenses',
//     category: 'hardBoxes',
//     quantity: 50,
//   },
// ];

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
    title: 'Actions',
    key: 'actions',
    render: () => (
        <Space >
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
      <Title level={5} className="mb-0 " style={{fontWeight:"bold"}}>Out of Stock Items</Title>
      <Table dataSource={data} columns={columns} pagination={false} />
    </div>
  )
}
