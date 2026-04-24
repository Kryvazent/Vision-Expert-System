import { Layout, Space, Avatar, Typography, Alert } from 'antd';
import { useAuth } from '../const/functions';
const { Header } = Layout;
const { Text, Title } = Typography;


const headerStyle = {
  color: '#fff',
  height: 64,
  padding: "0 32 px",
  lineHeight: '64px',
  backgroundColor: '#FFFFFF',
};

function TopHeader() {

  const { staff } = useAuth();

  return (
    <Header style={headerStyle} className='flex items-center justify-between border-b border-gray-200'>
      <div className='flex items-center gap-4'>
        <Title level={3} className='mb-0'>
          {staff?.role.role_name
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase())}
        </Title>
        <Alert title={`${staff?.branch?.branch_name} Branch`} type="error" />
      </div>
      <Space size={8}>
        <Avatar style={{ backgroundColor: '#2563EB' }}>{staff?.first_name && staff.first_name[0]}{staff?.last_name && staff.last_name[0]}</Avatar>
        <Text strong className='p-2'>{staff?.first_name} {staff?.last_name}</Text>
      </Space>
    </Header>
  )
}

export default TopHeader

