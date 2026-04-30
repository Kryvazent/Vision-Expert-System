import React from 'react'
import {  Card, Layout ,Table,Typography, Row, Button, Input, Space, Col} from "antd";
import Sidebar from "../../component/Sidebar";
import { icons } from '../../assets/icons/AdminIcons';
import { Header } from 'antd/es/layout/layout';
import StatCard from '../../component/Admin/StatCard';

const {Content } = Layout;
const { Title, Text } = Typography;

export default function CustomerLookup() {

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
                    <Text>OD1234</Text> .{' '}
                    <Text style={{ color: '#1677ff', cursor: 'pointer' }}>OD1230</Text>{' '}
                    . {' '}
                    <Text>OD1232 </Text>
                    .  {' '}
                    <Text>OD1233</Text>
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
      </Content>
    </Layout>
  );
}
