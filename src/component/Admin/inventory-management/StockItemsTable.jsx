import React ,{useState} from 'react'
import { Table, Tag, Space, Tabs, Button, Card } from 'antd';
const { TabPane} = Tabs;

export default function StockItemsTable() {
 
  const stockItemsData = [
    {
      key: '1', 
      productCode: 'FRM-001',
      productName: 'Ray-Ban Classic Aviator',
      category: 'frames',
      stockQuantity: 50,
      reorder_level: 10,
      price: 25000,
    },
    {
      key: '2',
      productCode: 'FRM-002',
      productName: 'Oakley Sport Sunglasses',
      category: 'frames',
      stockQuantity: 75,
      reorder_level: 15,
      price: 30000,

    },  
    {
      key: '3',
      productCode: 'LNS-001',
      productName: 'Single Vision CR-39 Lenses',
      category: 'hardBoxes',
      stockQuantity: 200,
      reorder_level: 50,
      price: 50000,
    },
  ];

   const [activeTab, setActiveTab] = useState('frames');

    //Filter stock items based on category
  const filterData = stockItemsData.filter (item => item.category === activeTab);


const stockItemsColumns = [
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
    render:(_, record) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.category}</div>
      </div>
    ),
  },
  {
    title: 'Category',  
    dataIndex: 'category',
    key: 'category',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render:(_, record) => (
      <Tag color="blue">{record.category}</Tag>
       ),
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
    key: 'stockQuantity',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render: (_, record) => {
      let color = 'green';
      if(record.stockQuantity === 0) {
        color = 'red';
      }else if(record.stockQuantity <=  record.reorder_level) {
        color = 'orange';
      }
      return <Tag color={color}>{record.stockQuantity} units </Tag>;
    },
  },
  {
    title: 'Reorder Level',
    dataIndex: 'reorder_level',
    key: 'reorder_level',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Unit Price',
    key: 'unitPrice',
    dataIndex: 'price',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render: (_, record) => 
     `Rs. ${record.price}` ,
  },
  {
    title: 'Actions',
    key: 'actions',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render: () => (
      <Space >
        <Button type="primary" size="small">Damaged</Button>
        <Button danger size="small">  Adjust</Button>
        <Button type="default" size="small" >History</Button>
      </Space>
    ),
  }
]

  return (
    <div title="Kadawatha Items" style={{borderRadius:"12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}>
      {/*<Tabs ">*/}

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large" style={{ marginBottom: 16 }}>
        <TabPane tab="Frames" key="frames" />
        <TabPane tab="Hard Boxes" key="hardBoxes" />
        <TabPane tab="Plastic Boxes" key="plasticBoxes" />
        <TabPane tab="Cleaning Clothes" key="cleaningClothes" />
        <TabPane tab="Cleaning Solutions" key="cleaningSolutions" />
        <TabPane tab="Leaflets" key="leaflets" />
      </Tabs>

    <Table columns={stockItemsColumns} dataSource={filterData} pagination={false} />

    </div>
  )
}
