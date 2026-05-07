import React ,{useState} from 'react'
import { Table, Tag, Tabs, Button, Card, Dropdown, Modal, InputNumber, Input, message} from 'antd';
import { icons } from '../../../assets/icons/AdminIcons';
import { EditOutlined, MoreOutlined, WarningOutlined } from '@ant-design/icons';

// const { TabPane} = Tabs;
const {TextArea} =  Input;

export default function StockItemsTable({data = [] , updateStock, insertDamageStock, onRefetch}) {
  
  const [activeTab, setActiveTab] = useState('plasticFrames');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  //EDIT mode STATE
  const [updateQty, setUpdateQty] = useState(0);

  //DAMAGE model state
  const [damagedQty, setDamagedQty] = useState(0);
  const [damagedReason, setDamagedReason] = useState(' '); 

  //HandleEditPopUp
  const handleEditPopup = async () => {
    try{
      const newQty = selectedItem.stockQuantity + updateQty;
      if (newQty < 0){
        message.error("Quantity cannot be negative!");
        return;
      }
      await updateStock({
        variables: {
          id: selectedItem.id,
          quantity: newQty,
        }
      });
      message.success("Stock Updated!");
      setIsEditOpen(false);
      setUpdateQty(0);
      onRefetch && onRefetch();
    }catch(err){
      message.error('Update failed!');
    }
  };

//Handle damaged pop up
const handleDamagedSubmit = async () => {
  if(!damagedQty || damagedQty <= 0){
    message.error("Enter valid damaged quantity!");
    return;
  }
   if(damagedQty > selectedItem.stockQuantity ){
    message.error("Damaged quantity cannot exceed current stock!");
    return;
  }
  if(!damagedReason.trim()){
    message.error("Please enter a reasom");
    return;
  }

  try{
    await insertDamageStock({
      variables: {
        stock_id: selectedItem.id,
        quantity: damagedQty,
        reason: damagedReason,
      }
    });
    message.success("Submitted for owner approval!");
    setIsDamagedOpen(false);
    setDamagedQty(0);
    setDamagedReason(' ');
  }catch(err){
    message.error("Submission failed!");
    console.error(err);
  }
}


  //Drop down menu
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
          setUpdateQty(0);
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
          setDamagedQty(0);
          setDamagedReason('');
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
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    onHeaderCell: () => ({ style: { backgroundColor: "#092258",color:"white", fontWeight: 600 } }),
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
  const filterData = data.filter(
    item => item.category === activeTab
  );



  return (
    <div title="Inventory Items" style={{borderRadius:"12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}>
      {/*<Tabs ">*/}

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        type="card" 
        size="large" 
        style={{ marginBottom: 16 }}
        items = {[
          {label: 'Plastic Frames', key: 'plasticFrames'},
          {label: 'Metal Frames', key: 'metalFrames'},
          {label: 'Night Vision', key: 'nightVision'},
          {label: 'Double Bride', key: 'doubleBride'},
          {label: 'Sun Glasses', key: 'sunGlasses'},
          {label: 'Hard Boxes', key: 'hardBoxes'},
          {label: 'Plastic Boxes', key: 'plasticBoxes'},
          {label: 'Cleaning Clothes', key: 'cleaningClothes'},
          {label: 'Leaflets', key: 'leaflets'},
          {label: 'Poster', key: 'poster'},
     
        ]}

      />
       

    <Table columns={stockItemsColumns} dataSource={filterData} pagination={false} />

    {/* Edit Modal  for show the pop up window */}
    <Modal 
        title='Edit Quantity'
        open={isEditOpen}
        onCancel={() =>  { setIsEditOpen(false);  setUpdateQty(0); }}
        onOk={handleEditPopup}  //set with popup
        okText='Update Quantity'      
    >
      <p>Product Name</p>
      <Input value={selectedItem?.productName} disabled />

      <p style={{ marginTop: 10 }}>Current Quantity</p>
      <Input value={`${selectedItem?.stockQuantity} units`} disabled/>

      <p  style={{ marginTop: 10 }}>Add Stock</p>
      <InputNumber  
          style={{width: '100%' }} 
          placeholder='+10 ' 
          value={updateQty}
          onChange={(val) => setUpdateQty(val || 0)}
          />
          {updateQty !== 0 && (
            <p style={{ marginTop: 8, color: '#1890ff' }}>
              New quantity: <b>{(selectedItem?.stockQuantity || 0) + updateQty} units</b>
            </p>
          )}
    </Modal>

    <Modal
        title="Mark Item as Damaged"
        open={isDamagedOpen}
        onCancel={() => {
          setIsDamagedOpen(false);
          setDamagedQty(0);
          setDamagedReason(' ');
        }}
        onOk={handleDamagedSubmit}
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
          This will be submitted for owner approval. Once approved, the damaged quantity will be removed from the branch stock.
        </p>
      </div>

      <p>Product Name</p>
      <Input value={selectedItem?.productName} disabled/>

      <p style={{ marginTop: 10 }}>Current Stock</p>
      <Input value={`${selectedItem?.stockQuantity} units` } disabled/>

      <p style={{ marginTop: 10 }}>Damaged Quantity</p>
      <InputNumber 
        style={{ width: '100%' }}
        min={1}
        max={selectedItem?.stockQuantity}
        value={damagedQty}
        onChange={(val) => setDamagedQty(val || 0)}
       />
      {damagedQty > 0 && (
        <p  style={{ marginTop: 8, color: 'orange' }}>
          Stock after approval: <b>{(selectedItem?.stockQuantity || 0 ) - damagedQty} units</b>
        </p>
      )}
      <p style={{ marginTop: 10 }}>Reason</p>
      <TextArea 
        rows={3} 
        placeholder="Enter reson for damaged" 
        value={damagedReason}
        onChange={(e) => setDamagedReason(e.target.value)} /> 

    </Modal>
    </div>
  );
}
