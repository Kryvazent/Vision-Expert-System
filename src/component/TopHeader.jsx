import React from 'react'
import {Layout, Space,Avatar ,Typography} from 'antd';
const { Header } = Layout;
const { Text,Title } = Typography;
 

const headerStyle = {
  color: '#fff',
  height: 64,
  lineHeight: '64px',
  padding:"0 32 px",
  lineHeight: '64px',
  backgroundColor: '#F3F4F8',
};

function TopHeader() {
  return (
  < Layout>
        <Header style={headerStyle} className='flex items-center justify-between border-b border-gray-200'>
          <Title level={3} className='mb-0' style={{fontWeight: '500'}}>Recovery Officer Dashboard</Title>
          <Space size="{8}">
            <Avatar style={{ backgroundColor: '#2563EB'}}>D</Avatar>
            <Text strong className='p-2'>David Kim</Text>
          </Space>
        </Header>
      </Layout>
  )
}

export default TopHeader