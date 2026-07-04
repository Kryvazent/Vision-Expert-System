import React, { useState } from 'react'
import {Card, Table, Tag, Select, Button, Space, Badge, Typography, DatePicker ,Form, Modal,Tooltip} from "antd";
import { icons } from '../../../assets/icons/AdminIcons';
import { HistoryOutlined, SendOutlined, CheckCircleOutlined ,EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import BatchHistoryModal from './BatchHistoryModal';
import dayjs from 'dayjs';

const {Option} = Select;
const {Text} = Typography

 const getStatusTag = (status) => {
    const statusMap = {
      "Delivered to the Lab": { color: "cyan", icon: <SendOutlined />},
      "Received from the Lab": { color: "blue", icon: <CheckCircleOutlined /> },
    };

    const config = statusMap[status] || {color: "default", icon: null};
    return <Tag color={config.color} icon={config.icon}>{status}</Tag>
  }

  function UpdateStatusModal({ open, batch, onCancel, onSave }) {
  const [form] = Form.useForm()
 
  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(
        batch.key, 
        values.status, 
        values.actualDate.format('YYYY-MM-DD')
      )
      form.resetFields()
    })
  }
 
  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }
 
  return (
    <Modal
      title={
        <Space>
          <EditOutlined style={{ color: '#1D4ED8' }} />
          <span style={{ fontWeight: 600 }}>Update Batch Status</span>
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Save Status"
      okButtonProps={{
        icon: <SaveOutlined />,
        style: { background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8 }
      }}
      cancelButtonProps={{ style: { borderRadius: 8 } }}
      width={420}
      centered
    >
      {/* Show which batch is being updated */}
      {batch && (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
        }}>
          <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Batch</Text>
          <div style={{ fontWeight: 700, color: '#1D4ED8', fontFamily: 'monospace', fontSize: 14 }}>
            {batch.batchNumber}
          </div>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Current: </Text>
            {getStatusTag(batch.currentStatus)}
          </div>
        </div>
      )}
 
      <Form form={form} layout="vertical">
        <Form.Item
          name="status"
          label={<span style={{ fontWeight: 500 }}>New Status <span style={{ color: '#DC2626' }}>*</span></span>}
          rules={[{ required: true, message: 'Please select a status' }]}
        >
          <Select placeholder="Select new status" style={{ borderRadius: 8 }}>
            <Option value="Delivered to the Lab">Delivered to the Lab</Option>
            <Option value="Received from the Lab">Received from the Lab</Option>
          </Select>
        </Form.Item>
 
        <Form.Item
          name="actualDate"
          label={<span style={{ fontWeight: 500 }}>Actual Date <span style={{ color: '#DC2626' }}>*</span></span>}
          rules={[{ required: true, message: 'Please select the actual date' }]}
       
        >
          <DatePicker
            style={{ width: '100%', borderRadius: 8 }}
            placeholder="Select actual date"
            format="YYYY-MM-DD"
            disabledDate={(d) => d && d < dayjs().startOf("day")}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

  const DateCell = ({ intended, actual }) => {
  if (!intended && !actual) return <Text type="secondary">—</Text>
 
  let varianceTag = null
  if (intended && actual) {
    const diff = Math.round(
      (new Date(actual) - new Date(intended)) / (1000 * 60 * 60 * 24)
    )
    if (diff !== 0) {
      varianceTag = (
        <Tag color={diff > 0 ? 'error' : 'success'} style={{ fontSize: 10, marginLeft: 4 }}>
          {diff > 0 ? `+${diff}d` : `${diff}d`}
        </Tag>
      )
    }
  }
 
  
  return (
    <div style={{ lineHeight: 1.8 }}>
      <div>
        <Text type="secondary" style={{ fontSize: 11 }}>Intended: </Text>
        <Text style={{ fontSize: 12 }}>{intended || '—'}</Text>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>Actual: </Text>
        <Text strong style={{ fontSize: 12, marginLeft: 4 }}>{actual || '—'}</Text>
        {varianceTag}
      </div>
    </div>
  )
}

export default function BatchManagementTable({data = [], onRefetch, onUpdateStatus}) {

  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [statusModalOpen,   setStatusModalOpen]   = useState(false)
  const [statusModalBatch,  setStatusModalBatch]  = useState(null)
  // Open history popup
  const openHistory = (record) => {
    setSelectedBatch(record.historyData);
    setHistoryOpen(true);
  };

 
  const columns = [
    {
      title : "Batch Number",
      dataIndex : "batchNumber",
      key: "batchNumber",
      fixed: 'left',
      width: 160,
      render : (text) => (
        <div style={{fontWeight: 500}}>{text}</div>
      ),
    },
    {
      title : "Orders",
      dataIndex : "orders",
      key : "orders",
      align : "center",
      width: 80,
      render: (orders) => (
        <Badge count={orders} style={{backgroundColor: "#1677ff"}} />
      ),
    },
    {
      title: "Current Status",
      dataIndex: "currentStatus",
      key: "currentStatus",
      width: 200,
      render: (status) => getStatusTag(status),
    },
   {
      title: "Delivered To Lab",
      width: 200,
      render: (_, record) => (
        <DateCell
          intended={record.batchLevelTracking?.deliveredToLab?.intended}
          actual={record.batchLevelTracking?.deliveredToLab?.actual}
        />   
      )
    },
    {
      title: "Received From Lab",
      width: 200,
      render: (_, record) => (
        <DateCell
          intended={record.batchLevelTracking?.receivedFromLab?.intended}
          actual={record.batchLevelTracking?.receivedFromLab?.actual}
        />
      )
    },
    {
      title: "Update  Status",
      dataIndex: "updateStatus",
      key: "updateStatus",
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          onClick={() => {
            setStatusModalBatch(record)
            setStatusModalOpen(true)
          }}
          style={{ borderRadius: 8, borderColor: '#1D4ED8', color: '#1D4ED8' }}
        >
          Update
        </Button>
      )
    },
    {
      title: "History",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <Tooltip title="View order history">
          <Button
            icon={<HistoryOutlined />}
            onClick={() => openHistory(record)}
            style={{ borderRadius: 8 }}
          />
        </Tooltip>
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
      batch={selectedBatch}
      onRefetch={onRefetch}
    />

    <UpdateStatusModal
        open={statusModalOpen}
        batch={statusModalBatch}
        onCancel={() => {
          setStatusModalOpen(false)
          setStatusModalBatch(null)
        }}
        onSave={(batchKey, status, actualDate) => {
          onUpdateStatus(batchKey, status, actualDate)
          setStatusModalOpen(false)
          setStatusModalBatch(null)
        }}
      />
   </>  
  );
}
