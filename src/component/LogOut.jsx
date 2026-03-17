import React from 'react'
import {LogoutOutlined} from "@ant-design/icons";
import { Typography } from 'antd';
const { Text } = Typography;

function LogOut() {
  return (
    <div className='mt-auto px-10 py-30'>
        <div className='flex items-center gap-2 cursor-pointer' style={{ color: '#fff' }}>
            <LogoutOutlined />
            <Text style={{color: '#fff',fontSize:16}}>Logout</Text>
            </div>
    </div>
  )
}

export default LogOut