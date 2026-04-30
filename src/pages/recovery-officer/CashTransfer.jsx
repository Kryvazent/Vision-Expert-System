import React, { useState } from 'react'
import {
  Layout,
  Card,
  Typography,
  Button,
  Select,
  Input,
  Upload,
  Space,
  Table,
} from "antd";
const { Text } = Typography;
const { Dragger } = Upload;
import { InboxOutlined } from "@ant-design/icons";
import HandOverDetails from '../../component/recoveryOfficer/HandOverDetails';

const columns = [
  {
    title: 'Handover ID',
    dataIndex: 'handoverId',
    key: 'handoverId',
    render: text => <a>{text}</a>,
  },
  {
    title: 'date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="medium">
        <Button type="primary" size="small" style={{ borderRadius: 6 }}  onClick={() => onHandOver(record)}>
        Hand Over
      </Button>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    handoverId: 'HO12',
    date: '2023-10-25',
    amount: 1000,
  },
  {
    key: '2',
    handoverId: 'HO13',
    date: '2023-10-26',
    amount: 1500,
  },
];



function CashTransfer() {
  const [selectedRecord, setSelectedRecord] = useState(null);

   const columns = [
    {
      title: "Handover ID",
      dataIndex: "handoverId",
      key: "handoverId",
      render: (text) => <a>{text}</a>,
    },
    { title: "date", dataIndex: "date", key: "date" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="medium">
          <Button
            type="primary"
            size="small"
            style={{ borderRadius: 6 }}
            onClick={() => setSelectedRecord(record)}
          >
            Hand Over
          </Button>
        </Space>
      ),
    },
  ];

  // If button clicked -> show details component
  if (selectedRecord) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f4ff", padding: 20 }}>
        <HandOverDetails
          record={selectedRecord}
          onCancel={() => setSelectedRecord(null)}
        />
      </Layout>
    );
  }

  // If user clicked Hand Over, show the details page
  if (selectedRecord) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f0f4ff", padding: 20 }}>
        <HandOverDetails
          record={selectedRecord}
          onCancel={() => setSelectedRecord(null)}
        />
      </Layout>
    );
  }
  return (
     <Layout style={{ minHeight: "100vh", background: "#f0f4ff" }}>
      <Card        title={<Typography.Title level={3}>Cash Transfer</Typography.Title>}
        bordered={false}
        style={{ margin: "20px" }}
      >
        <Typography.Paragraph>
          Submit today's collected cash to an administrative officer
        </Typography.Paragraph>
      </Card>
      
      <Table columns={columns} dataSource={data} />
      
    </Layout>
  )
}

export default CashTransfer