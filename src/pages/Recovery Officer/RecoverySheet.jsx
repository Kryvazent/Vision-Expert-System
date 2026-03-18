import React from 'react'
import Sidebar from '../../component/Sidebar'
import { Layout } from 'antd';
import TopHeader from '../../component/TopHeader';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';

const { Content } = Layout;


function RecoverySheet() {
  return (
    <Layout>
            {/* Sidebar */}
            <Sidebar />
    
            <Layout>
              {/* Header */}
              <TopHeader />
    
              {/* Content */}
              <Content className="p-8">
                    <DailyCollectionTable/>
              </Content>
            </Layout>
          </Layout>
  )
}

export default RecoverySheet