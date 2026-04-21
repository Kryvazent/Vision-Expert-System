import React ,{useState} from 'react'
import { Table, Tag, Space, Tabs, Button, Card } from 'antd';
import {StockItemsTable} from './StockItemsTable';
const { TabPane} = Tabs;

export default function StockItemsTable() {
 
  const stockItemsData = [
    {
      key: '1', 
      productCode: 'FRM-001',
      productName: 'Ray-Ban Classic Aviator',
      category: 'Ray-Ban Frames',
      stockQuantity: 50,
      reorder_level: 10,
      price: 25000,
    },
    {
      key: '2',
      productCode: 'FRM-002',
      productName: 'Oakley Sport Sunglasses',
      category: 'Oakley Frames',
      stockQuantity: 75,
      reorder_level: 15,
      price: 30000,

    },  
    {
      key: '3',
      productCode: 'LNS-001',
      productName: 'Single Vision CR-39 Lenses',
      category: 'Lenses',
      stockQuantity: 200,
      reorder_level: 50,
      price: 50000,
    },
  ];

   const [activeTab, setActiveTab] = useState('frames');

    //Filter stock items based on category
  const filterData = data.filter (item => item.category === activeTab);


const stockItemsColumns = [
  {
    title: 'Product Code',
    dataIndex: 'productCode',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),

  },
  {
    title: 'Product Name',
    dataIndex: 'productName',
    render:(_, record) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.category}</div>
      </div>
    ),
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Category',  
    dataIndex: 'category',
    render:(_, record) => (
      <Tag color="blue">{record.category}</Tag>
       ),
    },
    {
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),    
  },
  {
    title: 'Stock Quantity',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Kadawatha Branch Stock',
    dataIndex: 'stockQuantity',
    render: (_, record) => {
      let color = 'green';
      if(record.stock === 0) {
        color = 'red';
      }else if(record.stock <=  record.recoreder_level) {
        color = 'orange';
      }
      return <Tag color={color}>{record.stockQuantity} units </Tag>;
    },
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Recorder Level',
    key: 'recoreder_level',
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Unit Price',
    key: 'unitPrice',
    render: (_, record) => 
     `Rs. ${record.price}` ,
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: () => (
      <Space >
        <Button type="primary" size="small">
          Damaged
        </Button>
        <Button type="danger" size="small"> 
          Adjust
        </Button>
        <Button type="default" size="small">
          History
        </Button>
      </Space>
    ),
     onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  }
]
export default App;
  return (
    <Card title="Kadawatha Items" style={{borderRadius:"12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}>
      {/*<Tabs ">*/}

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large" style={{ marginBottom: 16 }}>
        <TabPane tab="Frames" key="frames" />
        <TabPane tab="Hard Boards" key="hardBoards" />
        <TabPane tab="Plastic Boxes" key="plasticBoxes" />
        <TabPane tab="Cleaning Clothes" key="cleaningClothes" />
        <TabPane tab="Cleaning Solutions" key="cleaningSolutions" />
        <TabPane tab="Leaflets" key="leaflets" />
      </Tabs>

    <Table columns={stockItemsColumns} dataSource={filterData} pagination={false} />

    </Card>
  )
}
