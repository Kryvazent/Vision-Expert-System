import { Layout } from 'antd';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';

const { Content } = Layout;


function RecoverySheet() {
  return (

    <Content className="p-8">
      <DailyCollectionTable />
    </Content>

  )
}

export default RecoverySheet