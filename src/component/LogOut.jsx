import React from 'react'
import { LogoutOutlined } from "@ant-design/icons";
import { Button, Typography } from 'antd';
import { useAuth } from '../const/functions';
const { Text } = Typography;

function LogOut() {

  const { signOut } = useAuth();

  return (
    <div className='absolute bottom-0 left-0 w-full px-10 py-6'>
      <div onClick={signOut} className='flex items-center gap-2 cursor-pointer' style={{ color: '#fff' }}>
        <LogoutOutlined />
        <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
      </div>
    </div>
  )
}

export default LogOut