import React, { useState } from 'react';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';
import dayjs from 'dayjs';
import { Card, Typography,Layout } from 'antd';

const { Title } = Typography;
const { Content } = Layout;

function RecoveryFollowUp() {
    const [selectedCenter, setSelectedCenter] = useState('kadawatha');
    const [selectedDate, setSelectedDate] = useState(dayjs());


  const extraColumns = [
    {
      title: 'Last Contact',
      dataIndex: 'lastContact',
      key: 'lastContact',
      width: 180,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <button
          style={{
            background: '#1a237e',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer'
          }}
          onClick={() => console.log('View Order:', record)}
        >
          View
        </button>
      )
    }
  ];
  

  return (
    <div>
         <Layout style={{ minHeight: "100vh", background: "#f0f4ff" }}>
      <Card        title={<Typography.Title level={3}>Extra Recovery</Typography.Title>}
        bordered={false}
        style={{ margin: "20px" }}
      >
        <Typography.Paragraph>
          Track and manage partial payment recoveries. Contact customers, log follow-up notes, and monitor payment promises.
        </Typography.Paragraph>
      </Card>

      <DailyCollectionTable
    selectedCenter={selectedCenter}
    setSelectedCenter={setSelectedCenter}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    extraColumns={extraColumns}
/>
    </Layout>  

    </div>
  );
}

export default RecoveryFollowUp;