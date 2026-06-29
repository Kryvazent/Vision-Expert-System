import { Layout, Button, Row, Col, Card, Typography, Select, DatePicker, message } from 'antd'
import React, {useState, useEffect} from 'react'
import { IssuesCloseOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, EditOutlined, PlusOutlined, CloseCircleOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import ComplaintTable from '../../component/Admin/complaint-handling/ComplaintTable'
import AddComplaint from '../../component/Admin/complaint-handling/AddComplaint'

import {gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react/compiled';
import { useAuth } from '../../const/functions'

const {Title, Text} = Typography;
const {Content} = Layout;
const {Option} = Select;
const {RangePicker} = DatePicker;

const LOAD_COMPLAINTS = gql`
    query LoadComplaints {
        complaintCollection(orderBy: [{ created_at: DescNullsLast }]) {
            edges {
                node {
                    id
                    complaint
                    created_at
                    complaint_status {
                        id
                        status
                    }
                    order {
                        id
                        clinic_attend_customer {
                            customer_has_branch {
                                customer {
                                    first_name
                                    last_name
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

const LOAD_COMPLAINT_STATUSES = gql`
    query LoadComplaintStatuses {
        complaint_statusCollection {
            edges {
                node {
                    id
                    status
                }
            }
        }
    }
`;

const INSERT_COMPLAINT = gql`
    mutation InsertComplaint(
        $complaint: String!,  
        $order_id: BigInt!,
        $complaint_status_id: BigInt!
    ) {
        insertIntocomplaintCollection(
            objects: [{
                complaint: $complaint,
                order_id: $order_id,
                complaint_status_id: $complaint_status_id
            }]
        ){
            records {
                order_id
                complaint
                created_at
                complaint_status {
                    status
                
                }
            }
        }
    }
`;

const UPDATE_COMPLAINT_STATUS = gql`
    mutation UpdateComplaintStatus($id: BigInt!, $status_id: BigInt!) {
        updatecomplaintCollection(
            filter: {id: {eq: $id}},
            set: {complaint_status_id: $status_id}
        ) {
            records {
                id
                complaint_status{
                    id
                    status
                }
            }
        }
    }
`;



export default function ComplaintManagement() {

const {staff} = useAuth();

const {data:complaintsData, loading, error, refetch} = useQuery(LOAD_COMPLAINTS, { 
    fetchPolicy: "network-only", 
});
const [insertComplaint] = useMutation(INSERT_COMPLAINT);
const [updateComplaintStatus] = useMutation(UPDATE_COMPLAINT_STATUS);
const {data:complaintStatusesData} = useQuery(LOAD_COMPLAINT_STATUSES);

const [complaints, setComplaints] = useState([])
const [isModalOpen, setIsModalOpen] = useState(false);    //controls add complaint modal visibility
const [statusFilter, setStatusFilter] = useState("All");    //stores selected filter status
const [dateRange, setDateRange] = useState([]);    //stores selected date filter
const [statusUpdating, setStatusUpdating] = useState(false); //controls status dropdown disable state during update


const statusMap = React.useMemo(() => {
    const map = {};
complaintStatusesData?.complaint_statusCollection?.edges.forEach((edge) => {
    map[edge.node.status] = edge.node.id;
});
return map;

}, [complaintStatusesData]);

//Transform GraphQL data to the table format with necessary fields like complaint, date, status, orderId and customerName. If no data, set to empty array
    useEffect(() => {
        if( complaintsData?.complaintCollection?.edges){
            const formattedData = complaintsData.complaintCollection.edges.map((edge) => ({
                key: edge.node.id,
                complaint: edge.node.complaint,
                date: new Date(edge.node.created_at)
                            .toISOString()
                            .split("T")[0], // Format date as YYYY-MM-DD
                                                
                status: edge.node.complaint_status?.status,
                orderID: edge.node.order?.id,
                customer: `${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ""} 
                                   ${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ""}`.trim(),
                assignTo: edge.node.complaint_status?.status === "Pending" 
                                ? "Not Assign" 
                                : "Owner"
            }));
            setComplaints(formattedData);
        }
    }, [complaintsData]);

//Add new complaint to the list and close the modal after submission
const handleAddComplaints = async (values) => {
    try {
        const pendingStatusId = statusMap["Pending"]; // Get from DB dynamically
        if (!pendingStatusId) {
            message.error("Pending status not found. Cannot add complaint.");
            return;
        }
        await insertComplaint({
            variables: {
                complaint: values.complaint,
                order_id: parseInt(values.orderID),
                complaint_status_id: pendingStatusId, // Use the dynamically fetched status ID
            }
        });
        await refetch(); // Refetch complaints to get the updated list with new complaint
         message.success("Complaint added successfully!");
        setIsModalOpen(false);
        
    } catch (error) {
        console.error("Error adding complaint:", error);
        message.error("Failed to add complaint.");
    }
};

const handleStatusChange = async (key, newStatus) => {
    setStatusUpdating(true);
    try {
        const statusId = statusMap[newStatus];
        if (!statusId) {
            message.error("Invalid status selected.");
            return;
        }
        await updateComplaintStatus({
            variables: {
                id: key,
                status_id: statusId,
            }
        });
        await refetch(); // Refetch complaints to get the updated list with changed status
        message.success(`Complaint status updated to ${newStatus}!`);
    }catch (error) {
        console.error("Error updating complaint status:", error);
        message.error("Failed to update complaint status.");
    }finally {
        setStatusUpdating(false);
    }
};

// Filter complaints based on status like pending, in-progress, resolved, closed or all and also filter by date range if selected
const filteredData = complaints.filter ((item) => {
        const statuesMatch = statusFilter === "All" || item.status === statusFilter;

        let dateMatch = true;

        if(dateRange.length === 2){
            const itemDate = new Date(item.date);
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            dateMatch = itemDate >= startDate && itemDate <= endDate;
        }
        return statuesMatch && dateMatch;
    });

const count = {
    total: complaints.length,
    pending: complaints.filter(d => d.status==="Pending").length,
    progress: complaints.filter(d => d.status==="In Progress").length,
    resolved: complaints.filter(d => d.status==="Resolved").length,
    closed: complaints.filter(d => d.status==="Closed").length,
};

if(loading && !complaintsData) return <p>Loading...</p>
if(error) return <p>Error loading complaints.</p>

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
                <StatCard title="Closed" value={count.closed} iconType="closed" color="#db4015" bgColor="#f3a996" />
             </div>
             <div style={{ marginBottom: 20 }}>
                <Select 
                    value={statusFilter}
                    onChange={setStatusFilter}
                     style={{ width: 200 }}
                >
                    <Option value="All">All Status</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Resolved">Resolved</Option>
                    <Option value="Closed">Closed</Option>
                </Select>
                <RangePicker 
                    style={{ marginLeft: 10 }}
                    onChange={(dates, dateStrings) => setDateRange(dateStrings || [])}
                />
             </div>

              <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}}>
                <Title level={5} className=".mb-0 " style={{fontWeight:"bold"}}>Complaints Details</Title>

            <ComplaintTable 
                data={filteredData}
                onStatusChange={handleStatusChange}
                statusUpdating={statusUpdating} 
            />
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
