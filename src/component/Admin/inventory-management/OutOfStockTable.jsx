import React from 'react'
import { Table, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

export default function OutOfStockTable({ data = [], reOrderedTypeIds = new Set(), onReOrder }) {

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
        <Tag color="red" style={{ fontWeight: 'bold' }}>
          {qty} units
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      onHeaderCell: () => ({ style: { backgroundColor: "#092258", color: "white", fontWeight: 600 } }),
      render: (_, record) => {
        // ─── Check if this product type is already reordered ──────────────
        const alreadyOrdered = reOrderedTypeIds.has(String(record.productTypeId));

        return (
          <Space>
            {alreadyOrdered ? (
              // ─── Already Reordered Badge ──────────────────────────────────
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                style={{ fontWeight: 'bold', padding: '4px 10px', fontSize: 13 }}
              >
                Already Ordered
              </Tag>
            ) : (
              // ─── Reorder Button ───────────────────────────────────────────
              <Button
                type="primary"
                size="small"
                danger
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
        locale={{ emptyText: 'No out of stock items' }}
      />
    </div>
  );
}