import React, { useState } from 'react'
import {Card, Table, Tag, Select, Button, Space, Badge, Typography, DatePicker } from "antd";
import { icons } from '../../../assets/icons/AdminIcons';
import { RightCircleOutlined, HistoryOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import BatchHistoryModal from './BatchHistoryModal';

const {Option} = Select;
const {Text} = Typography

export default function BatchManagementTable({data = [], onRefetch, onUpdateStatus}) {

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});

  // Open history popup
  const openHistory = (record) => {
    setSelectedBatch(record.historyData);
    setHistoryOpen(true);
  };

  const getStatusTag = (status) => {
    const statusMap = {
      "Delivered to the Lab": { color: "cyan", icon: icons.send },
      "Received from the Lab": { color: "blue", icon: icons.received },
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
        <div style={{fontWeight: 500}}>{text}</div>
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
      width: 220,
      render: (status) => getStatusTag(status),
    },
   {
      title: "Delivered To Lab",
      width: 220,
      render: (_, record) => {
        const data = record.batchLevelTracking ?.deliveredToLab;

        return (
          <div>
            <div>
              <Text strong>Intended:</Text>
              {" "}{data?.intended || '-'}
            </div>

            <div>
              <Text strong>Actual:</Text>{" "}
              {data?.actual || '-'}
            </div>
          </div>
        );
      }
    },
    {
      title: "Received From Lab",
      width: 220,
      render: (_, record) => {
        const data = record.batchLevelTracking ?.receivedFromLab;

        return (
          <div>
            <div>
              <Text strong>Intended:</Text>
              {" "}{data?.intended || '-'}
            </div>

            <div>
              <Text strong>Actual:</Text>{" "}
              {data?.actual || '-'}
            </div>
          </div>
        );
      }
    },
    {
      title: "Update Batch Status",
      dataIndex: "updateStatus",
      key: "updateStatus",
      width: 320,
      render: (_, record) => (
        <Space direction="vertical">
        <Select
            placeholder="Select Status"
            style={{ width: 220 }}
            onChange={(value) => {
              setSelectedStatus(prev => ({...prev, [record.key]: { ...prev[record.key], status: value}
            }));
            }}
          >  
          <Option value="Delivered to the Lab">Delivered to the Lab</Option>
          <Option value="Received from the Lab">Received from the Lab</Option>
        </Select>
        <DatePicker
            style={{ width: 220 }}
            onChange={(date, dateString) => {
              setSelectedStatus(prev => ({ ...prev, [record.key]: { ...prev[record.key], actualDate: dateString}
              }));
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              const selected =selectedStatus[record.key];
              if (!selected) return;
               onUpdateStatus(
                  record.key,
                  selected.status,
                  selected.actualDate
               );
            }}
          >
            Save
          </Button>
        </Space>
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
