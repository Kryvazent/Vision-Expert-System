import React from 'react'
import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function LowStockTable({ data = [], reOrderedTypeIds = new Set(), onReOrder }) {

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (qty) => (
        <Tag color="orange" style={{ fontWeight: 'bold' }}>
          {qty} units
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (_, record) => {
    
        if (record.quantity >= 100) {
          return null; // No action for items that are not low stock
        }
        const alreadyOrdered = reOrderedTypeIds.has(String(record.productTypeId));

        return (
          <Space size="middle">
            {alreadyOrdered ? (
              // ─── Already Reordered Badge
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                style={{ fontWeight: 'bold', padding: '4px 10px', fontSize: 13 }}
              >
                Already Ordered
              </Tag>
            ) : (
              // ─── Reorder Button
              <Button
                type="primary"
                size="small"
                onClick={() => onReOrder(record.productTypeId)}
              >
                Reorder
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        locale={{ emptyText: 'No low stock items' }}
      />
    </div>
  );
}