import React from 'react'
import { Table, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function DamagedStockTable({ data = [] }) {

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ color: '#8c8c8c', fontSize: '12px' }}>ID: {record.stock_id}</div>
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
      title: 'Damaged Quantity',
      dataIndex: 'damaged_quantity',
      key: 'damaged_quantity',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (qty) => (
        <Tag color="red" style={{ fontWeight: 'bold' }}>
          {qty} units
        </Tag>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (reason) => (
        <span title={reason} style={{ cursor: 'pointer' }}>
          {reason.length > 30 ? `${reason.substring(0, 30)}...` : reason}
        </span>
      ),
    },
    {
      title: 'Submitted Date',
      dataIndex: 'created_at',
      key: 'created_at',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status_bool',
      key: 'status_bool',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (status) => {
        if (status === true) {
          return (
            <Tag 
              icon={<CheckCircleOutlined />} 
              color="success"
              style={{ fontWeight: 'bold' }}
            >
              Approved
            </Tag>
          );
        } else {
          return (
            <Tag 
              color="processing"
              style={{ fontWeight: 'bold' }}
            >
              Pending
            </Tag>
          );
        }
      },
    },
  ];

  return (
    <div>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        locale={{ emptyText: 'No damaged stock submissions' }}
        rowKey="id"
      />
    </div>
  );
}