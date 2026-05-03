import { Layout, Button, Row, Col, Card, Typography, Select, Modal } from 'antd'
import React, {useState} from 'react'
import { IssuesCloseOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, EditOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import ComplaintTable from '../../component/Admin/complaint-handling/ComplaintTable'
import AddComplaint from '../../component/Admin/complaint-handling/AddComplaint'


const {Title, Text} = Typography;
const {Content} = Layout;
const {Option} = Select;

export default function ComplaintHandling() {

const [statusFilter, setStatusFilter] = useState("All");
const [isModalOpen, setIsModalOpen] = useState(false);

const data = [
    {
        key: '1',
        complaintID: 'CMP-2501',
        orderID: 'OD2501',
        customer:'Kason Ratnayake',
        complaint: 'Lens coating is peeling off after just one week of use. Expected better quality for the price paid.	',
        date: '2026-04-28',
        assignTo: 'Not Assigned',
        status: 'Pending'
    },
    {
        key: '2',
        complaintID: 'CMP-2502',
        orderID: 'OD2502',
        customer:'Sarah Lee',
        complaint: 'Staff was rude and unprofession',
        date: '2026-04-27',
        assignTo: 'Sarah Johnson',
        status: 'In-Progress'
    },
    {
        key: '3',
        complaintID: 'CMP-2503',
        orderID: 'OD2503',
        customer:'John Silva',
        complaint: 'Order was delayed by 2 weeks without any notification. Promised delivery date was not met.',
        date: '2026-04-26',
        assignTo: 'Sarah Johnson',
        status: 'Resolved'
    },
    {
        key: '4',
        complaintID: 'CMP-2504',
        orderID: 'OD2504',
        customer:'Michael Brown',
        complaint: 'Frame broke after minimal use. Quality seems substandard.',
        date: '2026-04-25',
        assignTo: 'Sarah Johnson',
        status: 'Pending'
    },
    {
        key: '5',
        complaintID: 'CMP-2505',
        orderID: 'OD2505',
        customer:'Robert William',
        complaint: 'Lens scratched within first few days despite careful handling.',
        date: '2026-04-24',
        assignTo: 'Sarah Johnson',
        status: 'Closed'
    },
    {
        key: '6',
        complaintID: 'CMP-2506',
        orderID: 'OD2506',
        customer:'Lisa Fernando',
        complaint: 'Received wrong order. Order was mixed up with another customer.',
        date: '2026-04-28',
        assignTo: 'Sarah Johnson',
        status: 'Pending'
    },
];

const [complaints, setComplaints] = useState(data)

const handleAddComplaints = (newComplaints) => {
    setComplaints(prev => [newComplaints, ...prev])
    setIsModalOpen(false)
}

const filteredData = 
    statusFilter === "All" ? complaints : complaints.filter(item => item.status === statusFilter);

const count = {
    total: complaints.length,
    pending: complaints.filter(d => d.status==="Pending").length,
    progress: complaints.filter(d => d.status==="In-Progress").length,
    resolved: complaints.filter(d => d.status==="Resolved").length,
    closed: complaints.filter(d => d.status==="Closed").length,
};

  return (
    <Layout>
        <Content className="p-8" style={{ padding: "20px" }}>
            <div style={{
                background: "#f5f7fa",
                padding: "20px 30px",
                borderRadius: "10px",
                marginBottom: "20px",
                }}
            >
                <Row align="middle" justify="space-between">
                    {/* Left side */}
                    <Col>
                        <Title  level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                            Complaint Management
                        </Title>
                        <Text type="secondary">
                            Manage all customer issues and complaints details.
                        </Text>
                    </Col>

                    {/* Right side button */}
                    <Col>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        style={{
                        background: "#e6f0ff",
                        borderColor: "#b3d1ff",
                        color: "#1a73e8",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "5px 15px",
                        }}
                    >
                        Add Complaints    
                    </Button>
                    </Col>
                </Row>
             </div>
             <div className="flex gap-6 mb-5">
                <StatCard title="Total Complaints" value={count.total} iconType="complaints" color="#00A854" bgColor="#E6F7F0" />
                <StatCard title="Pending" value={count.pending} iconType="clock" color="#F5222D" bgColor="#FFF1F0" />
                <StatCard title="In-Progress" value={count.progress} iconType="edit" color="#FAAD14" bgColor="#FFF7E6" />
                <StatCard title="Resolved" value={count.resolved} iconType="delivered" color="#1890FF" bgColor="#E6F7FF" />
                <StatCard title="Closed" value={count.closed} iconType="closed" color="#1890FF" bgColor="#E6F7FF" />
             </div>
             <div style={{ marginBottom: 20 }}>
                <Select 
                    value={statusFilter}
                    onChange={setStatusFilter}
                     style={{ width: 200 }}
                >
                    <Option value="All">All Status</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="In-Progress">In-Progress</Option>
                    <Option value="Resolved">Resolved</Option>
                    <Option value="Closed">Closed</Option>
                </Select>
             </div>

              <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}}>
                <Title level={5} className=".mb-0 " style={{fontWeight:"bold"}}>Complaints Details</Title>

            <ComplaintTable data={filteredData}/>
            <AddComplaint
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onAdd={handleAddComplaints}
            />    
            </Card>
        </Content>
    </Layout>
  )
}
