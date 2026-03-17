import React from 'react'
import Sidebar from '../../component/Sidebar'
import StatCard from '../../component/recoveryOfficer/StatCard'
import { Content } from 'antd/es/layout/layout'



function Recovery_dashboard() {
  return (
    <>
    {/* <Sidebar/>   */}
    <Sidebar/>  

    {/* <Content> */}
    
    <Content className='p-8'>
      <div className='flex gap-5 mb-8'>
        <StatCard iconType="shopping" title="Today's Deliveries" />
        <StatCard iconType="dollar" title="Dollar" />
        <StatCard iconType="user" title="User" />
        <StatCard iconType="file" title="File" />
      </div>
    </Content>  
    </>
  )
}

export default Recovery_dashboard