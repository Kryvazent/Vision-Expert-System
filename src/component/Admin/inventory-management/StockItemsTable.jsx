import React, { useState } from 'react'
import { Table, Tag, Tabs, Button, Dropdown, Modal, InputNumber, Input, message } from 'antd';
import { EditOutlined, MoreOutlined, WarningOutlined } from '@ant-design/icons';

const { TextArea } = Input;

export default function StockItemsTable({ data = [], updateStock, insertDamageStock, onRefetch, productTypeList = [] }) {

  //  Set first tab from DB types dynamically 
  const [activeTab, setActiveTab] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDamagedOpen, setIsDamagedOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [updateQty, setUpdateQty] = useState(0);
  const [damagedQty, setDamagedQty] = useState(0);
  const [damagedReason, setDamagedReason] = useState('');

  //  Set active tab once productTypeList loads 
  React.useEffect(() => {
    if (productTypeList.length > 0 && !activeTab) {
      setActiveTab(productTypeList[0].type); // default to first tab from DB
    }
  }, [productTypeList]);

  // Build tabs dynamically from DB product types 
  const tabItems = productTypeList.map((pt) => ({
    label: pt.type,   // Display name from DB e.g. "PlasticFrame"
    key: pt.type,     // Key matches category in data
  }));

  // Handle Edit Submit
  const handleEditPopup = async () => {
    try {
      const newQty = selectedItem.stockQuantity + updateQty;
      if (newQty < 0) {
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
      onRefetch && onRefetch(); //single call updates all tables with new data
    } catch (err) {
      message.error('Update failed!');
    }
  };

  // ─── Handle Damaged Submit 
  const handleDamagedSubmit = async () => {
    if (!damagedQty || damagedQty <= 0) {
      message.error("Enter valid damaged quantity!");
      return;
    }
    if (damagedQty > selectedItem.stockQuantity) {
      message.error("Damaged quantity cannot exceed current stock!");
      return;
    }
    if (!damagedReason.trim()) {
      message.error("Please enter a reason");
      return;
    }
    try {
      //  Insert damaged record for owner approval 
      await insertDamageStock({
        variables: {
          stock_id: selectedItem.id,
          quantity: damagedQty,
          reason: damagedReason,
        }
      });

      //  Step 2: Update stock quantity (reduced damaged quantity) 
      const newQuantity = selectedItem.stockQuantity - damagedQty;
      await updateStock({
        variables: {
          id: selectedItem.id,
          quantity: newQuantity,
        }
      });

      message.success("Submitted for owner approval and stock updated!");
      setIsDamagedOpen(false);
      setDamagedQty(0);
      setDamagedReason('');
      onRefetch && onRefetch();  //  Refresh all tables with new data

    } catch (err) {
      message.error("Submission failed!");
      console.error(err);
    }
  };

  // ─── Dropdown Menu 
  const getMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: (
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
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
            <WarningOutlined style={{ marginRight: 8 }} />
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
    ],
  });

  // ─── Table Columns 
  const stockItemsColumns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (qty) => {
        let color = 'green';
        if (qty === 0) {
          color = '#d20d0dc5';
        } else if (qty <= 100) {
          color = 'orange';
        }
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{qty} units</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (_, record) => (
        <Dropdown menu={getMenu(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />}>More</Button>
        </Dropdown>
      ),
    },
  ];

  //  Filter data by active tab 
  const filteredData = data.filter((item) => item.category === activeTab);

  return (
    <div style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>

      {/* Dynamic Tabs from DB */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        style={{ marginBottom: 16 }}
        items={tabItems}
      />

      <Table
        columns={stockItemsColumns}
        dataSource={filteredData}
        pagination={false}
        locale={{ emptyText: 'No stock items found for this category' }}
      />

      {/* ── Edit Modal ── */}
      <Modal
        title='Edit Quantity'
        open={isEditOpen}
        onCancel={() => { setIsEditOpen(false); setUpdateQty(0); }}
        onOk={handleEditPopup}
        okText='Update Quantity'
      >
        <p>Product Name</p>
        <Input value={selectedItem?.productName} disabled />

        <p style={{ marginTop: 10 }}>Current Quantity</p>
        <Input value={`${selectedItem?.stockQuantity} units`} disabled />

        <p style={{ marginTop: 10 }}>Add Stock</p>
        <InputNumber
          style={{ width: '100%' }}
          placeholder='+10'
          value={updateQty}
          onChange={(val) => setUpdateQty(val || 0)}
        />
        {updateQty !== 0 && (
          <p style={{ marginTop: 8, color: '#1890ff' }}>
            New quantity: <b>{(selectedItem?.stockQuantity || 0) + updateQty} units</b>
          </p>
        )}
      </Modal>

      {/* ── Damaged Modal ── */}
      <Modal
        title="Mark Item as Damaged"
        open={isDamagedOpen}
        onCancel={() => {
          setIsDamagedOpen(false);
          setDamagedQty(0);
          setDamagedReason('');
        }}
        onOk={handleDamagedSubmit}
        okText="Submit for Approval"
        okButtonProps={{ danger: true }}
      >
        <div style={{
          background: "#fff7e6",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
          border: "1px solid #ffd591"
        }}>
          <b>Owner Approval Required</b>
          <p style={{ margin: 0 }}>
            This will be submitted for owner approval. Once approved, the damaged quantity will be removed from the branch stock.
          </p>
        </div>

        <p>Product Name</p>
        <Input value={selectedItem?.productName} disabled />

        <p style={{ marginTop: 10 }}>Current Stock</p>
        <Input value={`${selectedItem?.stockQuantity} units`} disabled />

        <p style={{ marginTop: 10 }}>Damaged Quantity</p>
        <InputNumber
          style={{ width: '100%' }}
          min={1}
          max={selectedItem?.stockQuantity}
          value={damagedQty}
          onChange={(val) => setDamagedQty(val || 0)}
        />
        {damagedQty > 0 && (
          <p style={{ marginTop: 8, color: 'orange' }}>
            Stock after approval: <b>{(selectedItem?.stockQuantity || 0) - damagedQty} units</b>
          </p>
        )}

        <p style={{ marginTop: 10 }}>Reason</p>
        <TextArea
          rows={3}
          placeholder="Enter reason for damaged"
          value={damagedReason}
          onChange={(e) => setDamagedReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}