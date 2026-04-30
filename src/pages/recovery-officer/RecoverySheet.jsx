import { Layout ,Card,Typography} from 'antd';
import DailyCollectionTable from '../../component/recoveryOfficer/DailyCollectionTable';


const { Content } = Layout;
const { Title } = Typography;


function RecoverySheet() {
  return (

    
       <Layout style={{ minHeight: "100vh", background: "#f0f4ff" }}>
      <Card        title={<Typography.Title level={3}>Main Recovery Sheets</Typography.Title>}
        bordered={false}
        style={{ margin: "20px" }}
      >
        <Typography.Paragraph>
          Track and manage all customer payments, outstanding balances, and recovery activities and customer details.
        </Typography.Paragraph>
      </Card>
      <DailyCollectionTable />
    </Layout>

  )
}

export default RecoverySheet