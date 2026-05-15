import React from 'react'
import {Modal, Space, Typography, Row, Col, Tag, Steps, Table} from 'antd'
import { 
  UserOutlined, 
  HistoryOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  SendOutlined, 
  InboxOutlined, 
  ShoppingOutlined, 
  TrophyOutlined, 
  CheckOutlined} from '@ant-design/icons';

const {Text, Title} = Typography

export default function BatchHistoryModal({open, onClose, batch}) {
  
    if(!batch) return null;

  const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };


  //Calculate Date Differences
  const renderDate = ({intended, actual}) =>  {
    if( !intended || !actual ) return null;
      const intendedDate = parseDate(intended);
      const actualDate = parseDate(actual);

      const diffTime = actualDate - intendedDate
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      //Same date(no varience)
      if(diffDays === 0) return null;

      return (
        <Tag
          color={diffDays > 0 ? "error" : "success"}
          style={{fontSize: '10px', lineHeight: '16px', marginLeft: '4px', borderRadius: '4px'}}
        >
          {diffDays > 0  ?  `+${diffDays}d` : `${diffDays}d`}
        </Tag>
      );
  };

  const renderStep = (val) => {
    //When step data will missing
    if( !val ){
      return <Text type='secondary'>-</Text>
    }
    return(
      <div style={{ lineHeight: '1.5' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>Intended : </Text>
          <Text  style={{fontSize: '11px', marginLeft: '4px',}}>{val.intended || '-'}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ fontSize: '12px' }}> Actual : </Text>
          <Text strong style={{fontSize: '12px', marginLeft: '4px',}}>{val.actual || '-'}</Text>

          {renderDate( val.intended,val.actual)}
        </div>
      </div>
    );
  };


  const orderColumn=[
    {
      title: 'Order ID', 
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 150,
      render: (text) => <Text strong style={{ color: '#1677ff' }}>{text}</Text>
    },
    {
      title: 'Customer Name', 
      dataIndex: 'customer',
      width: 180,
      render: (name) => <Space><UserOutlined /><Text>{name}</Text></Space>,
      
    },
    {
      title: 'Order Placed Date', 
      dataIndex: 'placed',
      width: 150,
      render: (date) => <Text style={{ color: '#595959' }}>{date}</Text>

    },
    {
      title: <Tag icon={<ClockCircleOutlined />} color="orange" style={{ border: 'none' }}>Pending Customer Confirmation</Tag>,
      dataIndex: "step1",
      width: 220,
      render: renderStep,
  
    },
    {
      title:  <Tag icon={<CheckCircleOutlined />} color="blue" style={{ border: 'none' }}>Confirmations Completed</Tag>,
      dataIndex: "step2",
      width: 220,
      render: renderStep,
    },
    {
      title: <Tag icon={<SendOutlined />} color="cyan" style={{ border: 'none' }}>Delivered to the Lab</Tag>,
      dataIndex: "step3",
      width: 220,
      render: renderStep
    },
    {
      title: <Tag icon={<InboxOutlined />} color="blue" style={{ border: 'none' }}>Received from the Lab</Tag>,
      dataIndex: "step4",
      width: 220,
      render: renderStep
    },
    {
      title: <Tag icon={<ShoppingOutlined />} color="purple" style={{ border: 'none' }}>Out for Delivery</Tag>,
      dataIndex: "step5",
      width: 220,
      render: renderStep
  
    },
    {
      title: <Tag icon={<CheckCircleOutlined />} color="green" style={{ border: 'none' }}>Delivered</Tag>,
      dataIndex: "step6",
      width: 220,
      render: renderStep
    },
  ]



  const orderData = [
    { 
      key: '1', 
      id: 'ORD-2026-0789', 
      customer: 'John Smith', 
      placed: 'May 01, 2026', 
      step1: { intended: '2026-05-02', actual: '2026-05-02' }, 
      step2: { intended: '2026-05-04', actual: '2026-05-03' } // Shows -1d (Early)
    },
    { 
      key: '2', 
      id: 'ORD-2026-0790', 
      customer: 'Sarah Williams', 
      placed: 'May 01, 2026', 
      step1: { intended: '2026-05-02', actual: '2026-05-04' }, // Shows +2d (Late)
      step2: { intended: '2026-05-05', actual: '2026-05-05' } 
    }
  ];


  return (
    <Modal 
      title = {
        <Space>
          <HistoryOutlined style={{ color: '#1677ff' }} />
          <span style={{ fontWeight: 600 }}>Status History - {batch.batchNumber}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1100}
      footer={null}
      centered
      styles={{
        body: {padding: '24px'},
        mask: {backdropFilter: 'blur(4px)'}
    }}
    >
      {/* Top summary table */}
      <div style={{ 
        border: '1px solid #f0f0f0', 
        borderRadius: '12px', 
        marginBottom: '24px', 
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <Row>

          <Col span={8} style={{ padding: '16px 24px', borderRight: '1px solid #f0f0f0', background: '#fafafa' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Batch Number</Text>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#262626' }}>{batch.batchNumber}</div>

          </Col>

          <Col span={8} style={{ padding: '16px 24px', borderRight: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</Text>
            <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '4px', color: '#262626' }}>{batch.orders}</div>

          </Col>

          <Col span={8} style={{ padding: '16px 24px' }}>
            <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</Text>
            <div style={{ marginTop: '6px' }}>
              <Tag color="green" style={{ borderRadius: '12px', padding: '0 12px', fontWeight: '500', border: 'none' }}>
                {batch.currentStatus}
              </Tag>
            </div>
            </Col>
           </Row> 
          </div> 
          {/* Order status details */}
              <Title level={5} style={{ marginBottom: '16px', fontWeight: '600' }}>Order Status Details</Title>
              <Table 
                columns={orderColumn} 
                dataSource={batch.orderData || []}
                pagination={false}
                scroll={{x: 1000}}
                size='middle'
                bordered
                style={{marginBottom: '32px'}}
              />
            {/* Batch timelines */}
            <div style={{ background: '#f0f5ff', padding: '24px', borderRadius: '16px', marginTop: '24px' }}>
               <Title level={5} style={{ marginBottom: '20px', color: '#003a8c' }}>
                  Overall Batch Timeline
               </Title>
                <Steps
                  direction="vertical"
                  size="small"
                  current={batch.currentStep || 0}
                  items={[
                    { 
                      icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
                      title: <Text strong>Pending Customer Confirmation</Text>,
                      description: batch.timeline?.step1 ? `Completed: ${batch.timeline.step1}` : ''
                     },
                    { 
                      icon: <CheckCircleOutlined style={{ color: '#1677ff' }} />,
                      title: <Text strong>Confirmations Completed</Text>,
                      description: batch.timeline?.step2 ? `Completed: ${batch.timeline.step2}` : ''
                    },
                    {
                      icon: <SendOutlined style={{ color: '#13c2c2' }} />,
                      title: <Text strong>Delivered to the Lab</Text>,
                      description: batch.timeline?.step3 ? `Completed: ${batch.timeline.step3}` : ''
                    },
                   {
                        icon: <InboxOutlined style={{ color: '#1677ff' }} />,
                        title: <Text strong>Received from the Lab</Text>,
                        description: batch.timeline?.step4 ? `Completed: ${batch.timeline.step4}` : ''
                    },
                    {
                        icon: <ShoppingOutlined style={{ color: '#722ed1' }} />,
                        title: <Text strong>Out for Delivery</Text>,
                        description: batch.timeline?.step5 ? `Completed: ${batch.timeline.step5}` : ''
                    },
                    {
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        title: <Text strong>Delivered</Text>,
                        description: batch.timeline?.step6 ? `Completed: ${batch.timeline.step6}` : ''
                    },
                 ]}
          />
      </div>
    </Modal>
  )
}
