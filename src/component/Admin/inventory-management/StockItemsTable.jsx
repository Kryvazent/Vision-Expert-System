import React ,{useState} from 'react'
import { Table, Tag, Tabs, Button, Card, Dropdown, Modal, InputNumber, Input} from 'antd';
import { icons } from '../../../assets/icons/AdminIcons';
import { EditOutlined, MoreOutlined, WarningOutlined } from '@ant-design/icons';

const { TabPane} = Tabs;
const {TextArea} =  Input;

export default function StockItemsTable() {
  
 const [activeTab, setActiveTab] = useState('plasticFrames');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const stockItemsData = [
    {
      key: '1', 
      productName: 'Ray-Ban Classic Aviator',
      category: 'plasticFrames',
      date: '2026-04-29',
      stockQuantity: 10, 
    },
    {
     key: '2', 
      productName: 'Oakley Sport Frame',
      category: 'metalFrame',
      date: '2026-04-29',
      stockQuantity: 2,
    },  
    {
      key: '3', 
      productName: 'Dolce & Gabbana Frame',
      date: '2026-04-30',
      category: 'metalFrame',
      stockQuantity: 0,
      
    },
  ];
  const getMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: (
          <span><EditOutlined style={{marginRight: 8}}/>
          Edit Quantity
          </span>
        ),
        onClick: () => {
          setSelectedItem(record);
          setIsEditOpen(true);
        },
      },
      {
        key: 'damage',
        danger: true,
        label: (
          <span>
            < WarningOutlined style={{ marginRight: 8 }} />
            Mark as Damaged
          </span>
        ),
        onClick: () => {
          setSelectedItem(record);
          setIsDamagedOpen(true);
        },
      },
    ]}
  );

const stockItemsColumns = [
  {
    title: 'Product Name',
    dataIndex: 'productName',
    key: 'productName',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render:(_, record) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
        <div style={{ color: '#8c8c8c', fontSize: '12px' }}></div>
      </div>
    ),
  },
   {
    title: 'Date',
    dataIndex: 'date',
    key: 'Date',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
  },
  {
    title: 'Stock Quantity',
    dataIndex: 'stockQuantity',
    key: 'stockQuantity',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
    render: ( qty) => {
      let color = 'green';
      if(qty === 0 ) {
        color = '#d20d0dc5';
      }else if (qty<= 10) {
          color = 'orange';
      }  
      return <Tag color={color} style={{fontWeight:'bold'}}>{qty} units </Tag>;
    },
  },
  {
    title: 'Actions',
    key: 'actions',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
      render: (_, record) => (
      <Dropdown menu={getMenu(record)} trigger={['click']}>
        <Button icon={< MoreOutlined/>}>More</Button>  
    </Dropdown>
    ),
  },
];

//Filter stock items based on  tab
  const filterData = stockItemsData.filter(
    item => item.category === activeTab
  );



  return (
    <div title="Inventory Items" style={{borderRadius:"12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}>
      {/*<Tabs ">*/}

      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large" style={{ marginBottom: 16 }}>
        <TabPane tab="Plastic Frames" key="plasticFrames" />
        <TabPane tab="Metal Frame" key="metalFrame" />
        <TabPane tab="Night Vision" key="nightVision" />
        <TabPane tab="Double Bride" key="doubleBride" />
        <TabPane tab="Sun Glasses" key="sunGlasses" />
        <TabPane tab="Hard Boxes" key="hardBoxes" />
        <TabPane tab="Plastic Boxes" key="plasticBoxes" />
        <TabPane tab="Cleaning Clothes" key="cleaningClothes" />
       <TabPane tab="Cleaning Solutions" key="cleaningSolutions" />
        <TabPane tab="Leaflets" key="leaflets" />
        <TabPane tab="Poster" key="poster"/>
      </Tabs>

    <Table columns={stockItemsColumns} dataSource={filterData} pagination={false} />

    {/* Edit Modal  for show the pop up window */}
    <Modal 
        title='Edit Quantity'
        open={isEditOpen}
        onCancel={() => setIsEditOpen(false)}
        onOk={() => { setIsEditOpen(false);
        }}
        okText='Update Quantity'      
    >
      <p>Product Name</p>
      <Input value={selectedItem?.productName} disabled />

      <p style={{ marginTop: 10 }}>Current Quantity</p>
      <Input value={`${selectedItem?.stockQuantity} units`} disabled/>

      <p  style={{ marginTop: 10 }}>Add/Remove Stock</p>
      <InputNumber  style={{width: '100%' }} placeholder='+10 or -5' />
    </Modal>

    <Modal
        title="Mark Item as Damaged"
        open={isDamagedOpen}
        onCancel={() => setIsDamagedOpen(false)}
        onOk={() => {
          console.log("Send for approval: ",selectedItem);
          setIsDamagedOpen(false)
        }}
        okText="Submit for Approval"
        okButtonProps={{danger: true}}  
    >
      <div style={{
        background: "#fff7e6",
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "15px",
        border: "1px solid #ffd591"
      }}
      >
        <b>Owner Approval Required</b>
        <p style={{ margin: 0 }}>
          This will be submitted for owner approval. Once approved, the damaged quantity will be removed from your branch stock.
        </p>
      </div>

      <p>Product Name</p>
      <Input value={selectedItem?.productName} disabled/>

      <p style={{ marginTop: 10 }}>Current Stock</p>
      <Input value={`${selectedItem?.stockQuantity} units` } disabled/>

      <p style={{ marginTop: 10 }}>Damaged Quantity</p>
      <InputNumber style={{ width: '100%' }} />

      <p style={{ marginTop: 10 }}>Reason</p>
      <TextArea rows={3} placeholder="Enter reson for damaged"> </TextArea>

    </Modal>
    </div>
  )
}
