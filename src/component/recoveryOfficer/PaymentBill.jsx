import React from 'react';
import { Modal, Button, Typography, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function PaymentBill({ visible, onClose, billData }) {
  if (!billData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print Bill
        </Button>,
      ]}
      width={500}
      centered
    >
      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={3} style={{ margin: 0, color: '#1a237e' }}>
            VISION EXPERT SYSTEM
          </Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Vision Care Services
          </Text>
          <Divider style={{ margin: '10px 0' }} />
        </div>

        {/* Bill Info */}
        <div style={{ marginBottom: '15px' }}>
          <Text strong>Bill No: </Text>
          <Text>{billData.orderId}</Text>
          <br />
          <Text strong>Date: </Text>
          <Text>{dayjs().format('DD/MM/YYYY')}</Text>
          <br />
          <Text strong>Time: </Text>
          <Text>{dayjs().format('hh:mm A')}</Text>
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Customer Info */}
        <div style={{ marginBottom: '15px' }}>
          <Title level={5} style={{ margin: 0, color: '#1a237e' }}>
            Customer Details
          </Title>
          <Paragraph style={{ marginBottom: '5px', fontSize: '13px' }}>
            <Text strong>Name: </Text>
            {billData.customerName}
          </Paragraph>
          <Paragraph style={{ marginBottom: '5px', fontSize: '13px' }}>
            <Text strong>Phone: </Text>
            {billData.phone}
          </Paragraph>
          <Paragraph style={{ marginBottom: '5px', fontSize: '13px' }}>
            <Text strong>Address: </Text>
            {billData.customerAddress}
          </Paragraph>
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Payment Details */}
        <div style={{ marginBottom: '15px' }}>
          <Title level={5} style={{ margin: 0, color: '#1a237e' }}>
            Payment Details
          </Title>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <Text>Total Amount:</Text>
            <Text strong>Rs. {billData.totalAmount?.toLocaleString()}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <Text>Advance Amount:</Text>
            <Text style={{ color: '#1677ff' }}>Rs. {billData.advanceAmount?.toLocaleString()}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <Text>Balance Amount:</Text>
            <Text strong style={{ color: billData.balanceAmount > 0 ? '#cf1322' : '#389e0d' }}>
              Rs. {billData.balanceAmount?.toLocaleString()}
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <Text>Payment Type:</Text>
            <Text strong style={{ textTransform: 'capitalize' }}>
              {billData.paymentType}
            </Text>
          </div>
          {billData.paidAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <Text>Amount Paid:</Text>
              <Text strong style={{ color: '#389e0d' }}>
                Rs. {billData.paidAmount?.toLocaleString()}
              </Text>
            </div>
          )}
          {billData.remainingBalance !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <Text>Remaining Balance:</Text>
              <Text strong style={{ color: billData.remainingBalance > 0 ? '#cf1322' : '#389e0d' }}>
                Rs. {billData.remainingBalance?.toLocaleString()}
              </Text>
            </div>
          )}
          {billData.deliveryStatus && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <Text>Delivery Status:</Text>
              <Text strong>{billData.deliveryStatus}</Text>
            </div>
          )}
        </div>

        <Divider style={{ margin: '10px 0' }} />

        {/* Remarks */}
        {billData.remarks && (
          <div style={{ marginBottom: '15px' }}>
            <Title level={5} style={{ margin: 0, color: '#1a237e' }}>
              Remarks
            </Title>
            <Paragraph style={{ fontSize: '13px', marginBottom: 0 }}>
              {billData.remarks}
            </Paragraph>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#999' }}>
          <Text>Thank you for your payment!</Text>
          <br />
          <Text>Vision Expert System - Vision Care Services</Text>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .ant-modal-content,
          .ant-modal-header,
          .ant-modal-footer,
          .ant-modal-close {
            display: none !important;
          }
          .ant-modal-wrap {
            position: static !important;
            width: 100% !important;
            height: auto !important;
          }
          .ant-modal {
            max-width: 100% !important;
            width: 100% !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </Modal>
  );
}
