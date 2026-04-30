import { Layout, Row } from 'antd'
import { Content } from 'antd/es/layout/layout'
import React from 'react'
import { Typography, Col, Button, Card } from 'antd';
import {icons} from '../../assets/icons/AdminIcons';
import StatCard from '../../component/Admin/StatCard';
import NestedTable from '../../component/Admin/projectClinic/NestedTable';
import AddNewClinic from '../../component/Admin/projectClinic/AddNewClinic';
const { Title, Text } = Typography;


export default function ProjectClinic() {

    const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <Layout>
      <Content className="p-8" style={{ padding: "20px" }}>
        <div style={{   
            background: "#f5f7fa",
            padding: "20px 30px",
            borderRadius: "10px",
            marginBottom: "20px",
        }}>
            <Row align="middle" justify="space-between">

                {/* LEFT SIDE */}
                <Col>
                    <Title level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                        Project Clinics Management
                    </Title>
                    <Text type="secondary">
                        Manage clinics for projects assigned to Kadawatha Branch
                    </Text>
                </Col>

                {/* RIGHT SIDE */}
                <Col>
                    <Button icon={icons.addButton } type='primary' onClick={() => {console.log("Clicked");
                    setIsModalOpen(true)}}
                        style={{
                            background: "#e6f0ff",
                            borderColor: "#b3d1ff",
                            color: "#1a73e8",
                            fontWeight: "500",
                            borderRadius: "8px",
                            padding: "5px 15px",
                        }}>
                        Add Clinic
                    </Button>
                    <AddNewClinic 
                        open={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        onSubmit={(data) => {
                            handleAddClinic(data);
                            console.log("new Clinic", data);
                            setIsModalOpen(false)
                            }} />
                    
                </Col>
            </Row>
        </div>

        <div className="flex gap-6 mb-6">
            <StatCard title="Assigned Projects" value="12" iconType="projects" color="#107ee6" bgColor="#c2e1ef" />
            <StatCard title="Scheduled Clinics" value="5" iconType="scheduledClinics" color="#FAAD14" bgColor="#d4fedb" />
            <StatCard title="Completed Clinics" value="7" iconType="completedClinics" color="#00A854" bgColor="#fbe9f9" />
        </div>

        <div className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}}>
                 <Title level={5} className=".mb-0 " style={{fontWeight:"bold"}}>Projects Assigned to Kadawatha (Click to expand and view clinics)</Title>
 
                {/* NESTED TABLE */}
                <NestedTable />

            </Card>

        </div>
     </Content>
    </Layout>
  )
}


     