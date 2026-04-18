import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  BarChartOutlined,
  LogoutOutlined,
  BellOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
  EyeOutlined,
  ReconciliationOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  FileSearchOutlined,
  ProjectOutlined,
  StockOutlined,
  PhoneOutlined,
  LineChartOutlined,
  SwapOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

export function DashboardLayout({ children, role, userName = "User" }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 MENU BASED ON ROLE
  const getMenuItems = () => {
    if (role === 'accountant') {
      return [
        { key: '/accountant', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/accountant/stock', icon: <StockOutlined />, label: 'Stock Distribution' },
        { key: '/accountant/recovery', icon: <ReconciliationOutlined />, label: 'Recovery' },
        { key: '/accountant/details', icon: <PhoneOutlined />, label: 'Recovery Details' },
        { key: '/accountant/sales', icon: <LineChartOutlined />, label: 'Daily Sales' },
        { key: '/accountant/cash', icon: <SwapOutlined />, label: 'Cash Transfer Roadmap' },
        { key: '/accountant/filter', icon: <FilterOutlined />, label: 'Order Filter' },
      ];
    }

    // default menu
    return [
      { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' }
    ];
  };

  // 🔹 USER DROPDOWN
  const userMenu = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => navigate('/')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* SIDEBAR */}
      <Sider width={250} style={{ background: '#2563eb' }}>
        <div className="flex items-center gap-2 p-4 text-white">
          <EyeOutlined style={{ fontSize: 24 }} />
          <span className="font-bold text-lg">Vision Expert</span>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
          theme="dark"
          style={{ background: '#2563eb', border: 'none' }}
        />
      </Sider>

      {/* MAIN */}
      <Layout>

        {/* HEADER */}
        <Header style={{
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <h2>{role} Dashboard</h2>

          <div className="flex items-center gap-4">
            <Badge count={5}>
              <BellOutlined style={{ fontSize: 18 }} />
            </Badge>

            <Badge count={2}>
              <MailOutlined style={{ fontSize: 18 }} />
            </Badge>

            <Dropdown menu={{ items: userMenu }}>
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar style={{ backgroundColor: '#2563eb' }}>
                  {userName.charAt(0)}
                </Avatar>
                <span>{userName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* CONTENT */}
        <Content style={{
          margin: '20px',
          padding: '20px',
          background: '#f5f5f5'
        }}>
          {children}
        </Content>

      </Layout>
    </Layout>
  );
}