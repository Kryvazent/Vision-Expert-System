import {
  DashboardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  AccountBookOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../const/functions';
import { MENU_BY_ROLE } from '../const/menu';

function SideMenu() {

  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = MENU_BY_ROLE[role] ?? [];

  return (
    <div style={{ width: 256 }}>
      <Menu
        selectedKeys={[location.pathname]}
        mode="inline"
        theme="dark"
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: 8,
          textAlign: 'left',
          fontSize: 16,
        }}
      />
    </div>
  );
}

export default SideMenu;