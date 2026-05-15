import React, { useState } from 'react'
import {Card, Table, Tag, Select, Button, Space, Badge, Typography } from "antd";
import { icons } from '../../../assets/icons/AdminIcons';
import { RightCircleOutlined, HistoryOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import BatchHistoryModal from './BatchHistoryModal';

const {Option} = Select;
const {Text} = Typography

export default function BatchManagementTable({data = [], onRefetch, onUpdateStatus}) {

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Open history popup
  const openHistory = (record) => {
    setSelectedBatch(record.historyData);
    setHistoryOpen(true);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      "Delivered" : {color: "green", icon: icons.delivered},
      "Received from the Lab": { color: "blue", icon: icons.received },
      "Delivered to the Lab": { color: "cyan", icon: icons.send },
      "Confirmations Completed": { color: "geekblue", icon: icons.delivered },
      "Pending Customer Confirmation": { color: "orange", icon: icons.clock },
      "Out for Delivery": { color: "purple", icon: <ShoppingOutlined /> }
    };

    const config = statusMap[status] || {color: "default", icon: null};
    return <Tag color={config.color} icon={config.icon}>{status}</Tag>
  };

  const columns = [
    {
      title : "Batch Number",
      dataIndex : "batchNumber",
      key: "batchNumber",
      fixed: 'left',
      width: 180,
      render : (text) => (
        <a style={{fontWeight: 500}}>{text}</a>
      ),
    },
    {
      title : "Orders",
      dataIndex : "orders",
      key : "orders",
      align : "center",
      width: 90,
      render: (orders) => (
        <Badge count={orders} style={{backgroundColor: "#1677ff"}} />
      ),
    },
    {
      title: "Current Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      width: 260,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Update Status",
      dataIndex: "updateStatus",
      key: "updateStatus",
      width: 260,
      render: (value, record) => (
        <Select defaultValue={value} style={{width: 220}} onChange={(newVal) => onUpdateStatus && onUpdateStatus(record.key, newVal)}>
          <Option value="Delivered">Delivered</Option>
          <Option value="Received from the Lab">Received from the Lab</Option>
          <Option value="Delivered to the Lab">Delivered to the Lab</Option>
          <Option value="Confirmations Completed">Confirmations Completed</Option>
          <Option value="Pending Customer Confirmation">Pending Customer Confirmation</Option>
          <Option value="Out for Delivery">Out for Delivery</Option>
        </Select>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<HistoryOutlined />}
            onClick={() => openHistory(record)}
          />
        </Space>
        
      ),
    },
  ];
    
  return (
    <>
    <Card title={
      <Space>
        <span icon="cleaningSolutions" > Batch mangement</span>
        <Badge count = {  data.length} style={{backgroundColor:"#1677ff"}}/>
      </Space>
    } 
      style={{borderRadius: 12, border: '1px solid #e5e7eb'}} 
      bodyStyle={{ padding: 0 }}
      >

        <Table 
          columns={columns} 
          dataSource={data} 
          pagination={{pageSize: 5}}
          scroll={{x: 'max-content'}}
          rowKey="key"
          size='middle'
          />
    </Card>

    <BatchHistoryModal
      open={historyOpen}
      onClose={() => setHistoryOpen(false)}  
      batch={selectedBatch}/>
   </>  
  );
}
