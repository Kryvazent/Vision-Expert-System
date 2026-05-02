import React, { useState } from 'react'
import {  Card, Layout ,Table,Typography, Row, Button, Input, Space, Col} from "antd";
import Sidebar from "../../component/Sidebar";
import { icons } from '../../assets/icons/AdminIcons';
import { Header } from 'antd/es/layout/layout';
import StatCard from '../../component/Admin/StatCard';
import CustomerInformation from '../../component/Admin/Customer-Lookup/CustomerInformation';

const {Content } = Layout;
const { Title, Text } = Typography;

export default function CustomerLookup() {

  const [searchValue, setSearchValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const onSearch = (value) =>  {
    console.log('Search: ',value);
};
    
  return (
    <Layout>
      <Content className="p-8" style={{ padding: "20px" }}>
        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{padding:"28px",marginBottom:"20px", textAlign: "center" , borderRadius: "12px"} }>
          <div >
            {icons.shopping}
          </div>    
          <Title level={2} className=".mb-0 " style={{fontWeight:"bold" , marginBottom: '6px'}}>Customer & Order Lookup</Title>
            <Text type="secondary" style={{display: 'block', marginBottom: '24px'}}>
              Enter a Job Number (Order ID) or Tracking ID to view full customer and order details
            </Text>
            <Row justify="center">
              <Col xs={24} sm={22} md={18} lg={14}>
                <Space.Compact style={{width:"100%"}} >
                  <Input 
                    size='large' 
                    placeholder='e.g. OD1234 or VE-2024-001234' 
                    allowClear
                    prefix={icons.search}
                    onPressEnter={(e) => onSearch(e.target.value)}
                  />
                  <Button type="primary" 
                    size='large' 
                    style={{padding: '0 28px'}} 
                    icon={icons.search}
                    onClick={() => onSearch()}
                  > 
                    Search 
                  </Button>
                </Space.Compact>
                <div style={{marginTop: '10px'}}>
                  <Text type="secondary">
                    Try: {' '}
                    <a>OD1234</a> .{' '}
                    <a>OD1230</a>{' '}
                    . {' '}
                    <a>OD1232 </a>
                    .  {' '}
                    <a>OD1233</a>
                  </Text>
                </div>
              </Col>
            </Row>          
        </Card>
        <div className="flex gap-6 mb-5">
                  <StatCard title="Total Amount" value='Rs. 23, 000'  />
                  <StatCard title="Advance Paid" value='Rs. 15, 000'  />
                  <StatCard title="Balance Due" value='Rs. 8, 000'   />
                  <StatCard title="Delivery Date" value='2026-02-20' />

           </div>
           <CustomerInformation/>
      </Content>
    </Layout>
  );
}
