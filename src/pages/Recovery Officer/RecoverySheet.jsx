import React from 'react'
import Sidebar from '../../component/Sidebar'
import { Layout } from 'antd';
import TopHeader from '../../component/TopHeader';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';
import logo from "../../assets/images/logo.jpeg";
import { recoveryMenu } from '../../component/recoveryOfficer/RecoveryDashboardMenu';
import StatCard from '../../component/recoveryOfficer/StatCard';

const { Content } = Layout;


function RecoverySheet() {
  return (
    <Layout>
            {/* Sidebar */}
            <Sidebar logo={logo} title="Vision Expert" menuItems={recoveryMenu} />
    
            <Layout>
              {/* Header */}
              <TopHeader title="Recovery Sheet" userName="John Doe"/>

            <StatCard ></StatCard>  

    
              {/* Content */}
              <Content className="p-8">
                    <DailyCollectionTable/>
              </Content>
            </Layout>
          </Layout>
  )
}

export default RecoverySheet