import React from 'react'
import {LogoutOutlined} from "@ant-design/icons";
import { Typography } from 'antd';
const { Text } = Typography;

function LogOut() {
  return (
    <div className='mt-auto px-8 py-50'>
        <div className='flex items-center gap-2 cursor-pointer' style={{ color: '#fff' }}>
            <LogoutOutlined />
            <Text style={{color: '#fff',fontSize:16}}>Logout</Text>
            </div>
    </div>
  )
}

export default LogOut