import React, { useState } from 'react'
import {Card, Table, Tag, Select, Button, Space, Badge, Typography } from "antd";
import { icons } from '../../../assets/icons/AdminIcons';
import { RightCircleOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import BatchHistoryModal from './BatchHistoryModal';

const {Option} = Select;
const {Text} = Typography

export default function BatchManagementTable({data = []}) {

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Open history popup
  const openHistory = (record) => {
    setSelectedBatch(record.historyData);
    setHistoryOpen(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Delivered":
        return (<Tag color="green" icon={icons.delivered}>Delivered</Tag>);

      case "Received from the Lab":
        return (
          <Tag color="blue" icon={icons.received}>Received from the Lab</Tag>
        );

      case "Delivered to the Lab":
        return (
          <Tag color="cyan" icon={icons.send}>Delivered to the Lab</Tag>
        );

      case "Confirmations Completed":
        return (
          <Tag color="geekblue" icon={icons.delivered}>Confirmations Completed</Tag>
        );

      case "Pending Customer Confirmation":
        return (
          <Tag color="orange" icon={icons.clock}>Pending Customer Confirmation </Tag>
        );
      
      case "Out for Delivery":
        return (
          <Tag color="purple" icon={<ShoppingOutlined />}>Out for Delivery</Tag>
        )  

      default:
        return <Tag>{status}</Tag>;
    }
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
      title: "Next Status",
      dataIndex: "nextStatus",
      key: "nextStatus",
      render: (next) => 
        next === "Final Status" ? (
          <Tag color="green">Final Status</Tag>
        ) : (
          <Button  icon={icons.arrow} backgroundColor="white">Next</Button>
        ),
    },{
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button  
            icon={<RightCircleOutlined />}
            onClick={() => onNextStatus && onNextStatus(record.key)}
            disabled={record.currentStatus === "Delivered"}
          />
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
        <Badge count = {totalBatches ?? data.length} style={{backgroundColor:"#1677ff"}}/>
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
      onClose={() => setHistoryOpen(false)}  batch={selectedBatch}/>
   </>  
  );
}
