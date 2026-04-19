import { useState } from 'react';
import {
  DashboardOutlined,
  FileTextOutlined ,
  ClockCircleOutlined,
  SafetyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

const items = [
  { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },

  // recovery officer menu items
  { key: '2', icon: <FileTextOutlined  />, label: 'Recovery Sheet' },
  { key: '3', icon: <ClockCircleOutlined />, label: 'Recovery Follow-Up' },
  { key: '4', icon: <ClockCircleOutlined />, label: 'Overdue Units' },
  { key: '5', icon: <SafetyOutlined />, label: 'Warranty Claims' },

  // optimetrist menu items
  { key: '6', icon: <BarChartOutlined />, label: 'Patient Management' },
  { key: '7', icon: <BarChartOutlined />, label: 'New Prescription' },
  { key: '8', icon: <BarChartOutlined />, label: 'Reports' },
];

function SideMenu() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ width: 256 }}>
     <Menu
        defaultSelectedKeys={['1']}
        mode="inline"
        theme="dark"
        inlineCollapsed={collapsed}
        items={items}
        style={{background:"transparent", border:"none", marginTop:8, textAlign:"left", fontSize:16}}
      />
    </div>
  )
}

export default SideMenu