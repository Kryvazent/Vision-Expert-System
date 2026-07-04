import { Layout, Button, Row, Col, Card, Typography, Select, DatePicker, message, Modal, Input, Alert } from 'antd'
import React, {useState, useEffect} from 'react'
import { IssuesCloseOutlined, ClockCircleOutlined, CloseOutlined, CheckCircleOutlined, EditOutlined, PlusOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import ComplaintTable from '../../component/Admin/complaint-handling/ComplaintTable'
import AddComplaint from '../../component/Admin/complaint-handling/AddComplaint'

import {gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react/compiled';
import { useAuth } from '../../const/functions'
import { headerStyles, buttonStyles, cardStyles, modalStyles, formStyles } from '../../const/designSystem'

const {Title, Text} = Typography;
const {Content} = Layout;
const {Option} = Select;
const {RangePicker} = DatePicker;
const {TextArea} = Input;

const LOAD_COMPLAINTS = gql`
    query LoadComplaints($branchId: Int!) {
        clinicCollection(filter: { branch_id: { eq: $branchId } }) {
            edges {
                node {
                    id
                    clinic_attend_customerCollection {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
            }
        }
        complaintCollection(
            orderBy: [{ created_at: DescNullsLast }]
        ) {
            edges {
                node {
                    id
                    complaint
                    created_at
                    assigned_to
                    assigned_at
                    resolution_description
                    resolved_at
                    complaint_status {
                        id
                        status
                    }
                    order {
                        id
                        clinic_attend_customer_id
                        clinic_attend_customer {
                            customer_has_branch {
                                customer {
                                    first_name
                                    last_name
                                    contact_no
                                }
                            }
                            clinic {
                                branch_id
                            }
                        }
                    }
                    assigned_to_staff {
                        id
                        first_name
                        last_name
                        role {
                            role_name
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

const LOAD_BRANCH_STAFF = gql`
    query LoadBranchStaff($branchId: Int!) {
        staffCollection(
            filter: { branch_id: { eq: $branchId } }
        ) {
            edges {
                node {
                    id
                    first_name
                    last_name
                    role {
                        role_name
                    }
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

const ASSIGN_COMPLAINT = gql`
    mutation AssignComplaint($id: BigInt!, $assignedTo: Int!, $assignedAt: Datetime!, $statusId: BigInt!) {
        updatecomplaintCollection(
            filter: {id: {eq: $id}},
            set: {
                assigned_to: $assignedTo,
                assigned_at: $assignedAt,
                complaint_status_id: $statusId
            }
        ) {
            records {
                id
                assigned_to
                assigned_at
                complaint_status{
                    id
                    status
                }
            }
        }
    }
`;

const RESOLVE_COMPLAINT = gql`
    mutation ResolveComplaint($id: BigInt!, $resolutionDescription: String!, $resolvedAt: Datetime!, $statusId: BigInt!) {
        updatecomplaintCollection(
            filter: {id: {eq: $id}},
            set: {
                resolution_description: $resolutionDescription,
                resolved_at: $resolvedAt,
                complaint_status_id: $statusId
            }
        ) {
            records {
                id
                resolution_description
                resolved_at
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

const branchId = staff?.branch?.id || staff?.branch_id;

const {data:complaintsData, loading, error, refetch} = useQuery(LOAD_COMPLAINTS, {
    fetchPolicy: "network-only",
    variables: { branchId },
    skip: !branchId
});
const [insertComplaint] = useMutation(INSERT_COMPLAINT);
const [updateComplaintStatus] = useMutation(UPDATE_COMPLAINT_STATUS);
const [assignComplaint] = useMutation(ASSIGN_COMPLAINT);
const [resolveComplaint] = useMutation(RESOLVE_COMPLAINT);
const {data:complaintStatusesData} = useQuery(LOAD_COMPLAINT_STATUSES);
const {data:branchStaffData} = useQuery(LOAD_BRANCH_STAFF, {
    variables: { branchId },
    skip: !branchId
});

const [complaints, setComplaints] = useState([])
const [isModalOpen, setIsModalOpen] = useState(false);    //controls add complaint modal visibility
const [assignModalVisible, setAssignModalVisible] = useState(false); //controls assign modal visibility
const [resolveModalVisible, setResolveModalVisible] = useState(false); //controls resolve modal visibility
const [selectedComplaint, setSelectedComplaint] = useState(null); //stores selected complaint for assignment/resolution
const [selectedStaff, setSelectedStaff] = useState(null); //stores selected staff for assignment
const [resolutionDescription, setResolutionDescription] = useState(""); //stores resolution description
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
            // Get clinic_attend_customer IDs for this branch
            const clinicAttendCustomerIds = new Set(
                complaintsData?.clinicCollection?.edges
                    .flatMap(clinic => clinic.node.clinic_attend_customerCollection.edges)
                    .map(cac => cac.node.id) || []
            );
            
            const formattedData = complaintsData.complaintCollection.edges
                .map((edge) => ({
                    key: edge.node.id,
                    complaint: edge.node.complaint,
                    date: new Date(edge.node.created_at)
                                .toISOString()
                                .split("T")[0], // Format date as YYYY-MM-DD

                    status: edge.node.complaint_status?.status,
                    orderID: edge.node.order?.id,
                    customer: `${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.first_name || ""}
                                       ${edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.last_name || ""}`.trim(),
                    contactNo: edge.node.order?.clinic_attend_customer?.customer_has_branch?.customer?.contact_no,
                    assignedTo: edge.node.assigned_to_staff
                        ? `${edge.node.assigned_to_staff.first_name} ${edge.node.assigned_to_staff.last_name}`.trim()
                        : "Not Assigned",
                    assignedToId: edge.node.assigned_to,
                    assignedAt: edge.node.assigned_at,
                    resolutionDescription: edge.node.resolution_description,
                    resolvedAt: edge.node.resolved_at,
                    clinicAttendCustomerId: edge.node.order?.clinic_attend_customer_id,
                }))
                .filter(complaint => clinicAttendCustomerIds.has(complaint.clinicAttendCustomerId));
            
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

const handleAssignClick = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaff(null);
    setAssignModalVisible(true);
};

const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaff) {
        message.error("Please select a staff member to assign");
        return;
    }

    try {
        const assignedStatusId = statusMap["Assigned"];
        if (!assignedStatusId) {
            message.error("Assigned status not found.");
            return;
        }

        await assignComplaint({
            variables: {
                id: selectedComplaint.key,
                assignedTo: selectedStaff,
                assignedAt: new Date().toISOString(),
                statusId: assignedStatusId,
            }
        });
        await refetch();
        message.success("Complaint assigned successfully");
        setAssignModalVisible(false);
        setSelectedComplaint(null);
        setSelectedStaff(null);
    } catch (error) {
        console.error("Error assigning complaint:", error);
        message.error("Failed to assign complaint.");
    }
};

const handleResolveClick = (complaint) => {
    setSelectedComplaint(complaint);
    setResolutionDescription("");
    setResolveModalVisible(true);
};

const handleResolve = async () => {
    if (!selectedComplaint || !resolutionDescription) {
        message.error("Please provide a resolution description");
        return;
    }

    try {
        const resolvedStatusId = statusMap["Resolved"];
        if (!resolvedStatusId) {
            message.error("Resolved status not found.");
            return;
        }

        await resolveComplaint({
            variables: {
                id: selectedComplaint.key,
                resolutionDescription: resolutionDescription,
                resolvedAt: new Date().toISOString(),
                statusId: resolvedStatusId,
            }
        });
        await refetch();
        message.success("Complaint resolved successfully");
        setResolveModalVisible(false);
        setSelectedComplaint(null);
        setResolutionDescription("");
    } catch (error) {
        console.error("Error resolving complaint:", error);
        message.error("Failed to resolve complaint.");
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
// Don't hard-bail on error — render with whatever data is available
// and show an inline alert so the rest of the page still works.

  return (
    <Layout>
        <Content style={{ padding: 24 }}>
            {error && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Some complaint data could not be loaded"
                    description={error.message}
                    closable
                />
            )}
            <div style={headerStyles.container}>
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title level={2} style={headerStyles.title}>
                            Complaint Management
                        </Title>
                        <Text type="secondary" style={headerStyles.subtitle}>
                            Manage all customer issues and complaints details.
                        </Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={buttonStyles.primary}
                        >
                            Add Complaints
                        </Button>
                    </Col>
                </Row>
            </div>

            <Card style={cardStyles.default}>
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={4}>
                        <StatCard title="Total Complaints" value={count.total} iconType="complaints" color="#00A854" bgColor="#E6F7F0" />
                    </Col>
                    <Col span={4}>
                        <StatCard title="Pending" value={count.pending} iconType="clock" color="#F5222D" bgColor="#FFF1F0" />
                    </Col>
                    <Col span={4}>
                        <StatCard title="In-Progress" value={count.progress} iconType="edit" color="#FAAD14" bgColor="#FFF7E6" />
                    </Col>
                    <Col span={4}>
                        <StatCard title="Resolved" value={count.resolved} iconType="delivered" color="#1890FF" bgColor="#E6F7FF" />
                    </Col>
                    <Col span={4}>
                        <StatCard title="Closed" value={count.closed} iconType="closed" color="#db4015" bgColor="#f3a996" />
                    </Col>
                </Row>
            </Card>

            <Card title="Complaint List" style={{ ...cardStyles.default, marginTop: 16 }}>
                <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <label style={formStyles.label}>Status Filter</label>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={formStyles.select}
                        >
                            <Option value="All">All Status</Option>
                            <Option value="Pending">Pending</Option>
                            <Option value="In Progress">In Progress</Option>
                            <Option value="Resolved">Resolved</Option>
                            <Option value="Closed">Closed</Option>
                        </Select>
                    </Col>
                    <Col>
                        <label style={formStyles.label}>Date Range</label>
                        <RangePicker
                            style={formStyles.datePicker}
                            onChange={(dates, dateStrings) => setDateRange(dateStrings || [])}
                        />
                    </Col>
                </Row>

                <ComplaintTable
                    data={filteredData}
                    onStatusChange={handleStatusChange}
                    statusUpdating={statusUpdating}
                    onAssign={handleAssignClick}
                    onResolve={handleResolveClick}
                />
            </Card>
            <AddComplaint
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onAdd={handleAddComplaints}
            />

            {/* Assignment Modal */}
            <Modal
                title="Assign Complaint"
                open={assignModalVisible}
                onOk={handleAssign}
                onCancel={() => {
                    setAssignModalVisible(false);
                    setSelectedComplaint(null);
                    setSelectedStaff(null);
                }}
                okText="Assign"
                cancelText="Cancel"
                {...modalStyles.default}
            >
                {selectedComplaint && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <p><strong>Customer:</strong> {selectedComplaint.customer}</p>
                            <p><strong>Contact:</strong> {selectedComplaint.contactNo}</p>
                            <p><strong>Complaint:</strong> {selectedComplaint.complaint}</p>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={formStyles.label}>Assign To</label>
                            <Select
                                style={formStyles.select}
                                placeholder="Select staff member"
                                value={selectedStaff}
                                onChange={setSelectedStaff}
                            >
                                {branchStaffData?.staffCollection?.edges?.map((edge) => (
                                    <Option key={edge.node.id} value={edge.node.id}>
                                        {edge.node.first_name} {edge.node.last_name} ({edge.node.role?.role_name})
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Resolution Modal */}
            <Modal
                title="Resolve Complaint"
                open={resolveModalVisible}
                onOk={handleResolve}
                onCancel={() => {
                    setResolveModalVisible(false);
                    setSelectedComplaint(null);
                    setResolutionDescription("");
                }}
                okText="Resolve"
                cancelText="Cancel"
                {...modalStyles.default}
            >
                {selectedComplaint && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16, background: "#f0f2f5" }}>
                            <p><strong>Customer:</strong> {selectedComplaint.customer}</p>
                            <p><strong>Assigned To:</strong> {selectedComplaint.assignedTo}</p>
                            <p><strong>Complaint:</strong> {selectedComplaint.complaint}</p>
                        </Card>

                        <div style={{ marginBottom: 16 }}>
                            <label style={formStyles.label}>Resolution Description</label>
                            <TextArea
                                rows={4}
                                placeholder="Describe how the complaint was resolved..."
                                value={resolutionDescription}
                                onChange={(e) => setResolutionDescription(e.target.value)}
                                maxLength={500}
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </Content>
    </Layout>
  )
}
