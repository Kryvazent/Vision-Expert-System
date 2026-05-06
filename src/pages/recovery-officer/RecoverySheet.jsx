import React, { useState, useEffect } from "react";
import { Layout ,Card,Typography, message} from 'antd';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";


const { Content } = Layout;
const { Title } = Typography;



function RecoverySheet() {
  const [selectedCenter, setSelectedCenter] = useState("kadawatha");
  const [selectedDate, setSelectedDate] = useState(null);
  const [tableData, setTableData] = useState([]);

  

  
  return (

    
       <Layout style={{ minHeight: "100vh", background: "#f0f4ff" }}>
      <Card        title={<Typography.Title level={3}>Main Recovery Sheets</Typography.Title>}
        bordered={false}
        style={{ margin: "20px" }}
      >
        <Typography.Paragraph>
          Track and manage all customer payments, outstanding balances, and recovery activities and customer details.
        </Typography.Paragraph>
      </Card>
      <DailyCollectionTable
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        data={tableData}
      
    />
    </Layout>

  )
}

export default RecoverySheet