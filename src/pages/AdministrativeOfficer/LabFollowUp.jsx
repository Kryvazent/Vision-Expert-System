import React, {useState, useEffect, useMemo} from 'react'
import { Typography, Row, Col, Card, Button, message, Layout, DatePicker, Select, Alert,  } from 'antd'
import { icons } from '../../assets/icons/AdminIcons'
import StatCard from '../../component/Admin/StatCard'
// import AddLabOrder from '../../component/Admin/lab-follow/AddLabOrder'
import LabFollowUpTable from '../../component/Admin/lab-follow/LabFollowUpTable'
import MarkReceivedModal from '../../component/Admin/lab-follow/MarkReceivedModal'
import EditNoteModal from '../../component/Admin/lab-follow/EditNoteModal'
import dayjs from 'dayjs'
import { PlusOutlined, WarningOutlined } from '@ant-design/icons'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'
import { useAuth } from '../../const/functions'

const { Title, Text } = Typography
const {Content} = Layout
const {RangePicker} = DatePicker

const SENT_TO_LAB_DELAY_DAYS = 2;
const LAB_TURNAROUND_DAYS = 7;

const normalizeReminderValue = (value) =>
    String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");

const isReadyToSendReminder = (reminderCall) => {
    const beforeLabStatus = normalizeReminderValue(reminderCall?.before_lab_status);
    const beforeLabReason = normalizeReminderValue(reminderCall?.before_lab_reason);
    return beforeLabStatus === "answer" && ["readytosend", "readysend"].includes(beforeLabReason);
};

const isLabCandidateStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    return !["cancelled", "canceled", "delivered"].includes(normalized);
};

const LOAD_LAB_FOLLOW_UP = gql `
    query LoadLabFollowUp($branch_id: Int!){
        lab_follow_upCollection(
            filter: {branch_id: {eq: $branch_id}}
            orderBy: [{created_at: DescNullsLast}]
        ){
            edges{
                node{
                    id
                    branch_id
                    sent_to_lab_date
                    expected_return_date
                    received_date
                    note
                    order_id
                    clinic{
                        id
                        venue
                    }
                    lab_follow_up_status{
                        id
                        status
                    } 
                }
            }
        }
    }
`;

const LOAD_CLINICS = gql `
    query LoadClinics($branch_id: Int!){
        clinicCollection(
            filter: {branch_id: {eq: $branch_id}}
        ){
            edges{
                node{
                    id
                    venue
                }
            }
        }
    }
`;

const LOAD_ORDERS = gql `
    query LoadOrders{
        orderCollection(
            orderBy: 
                [{ placed_at: DescNullsLast }]
                ){ 
                 edges{
                    node{
                        id
                        placed_at
                        order_status{
                            id
                            status
                        }
                        clinic_attend_customer{
                            clinic_id
                            clinic{
                                id
                                venue
                                branch_id
                            }                          
                        }
                    }
                }
            }
        }
`;

const LOAD_REMINDER_CALLS = gql `
    query LoadReminderCalls{
        reminder_callCollection{
            edges{
                node{
                    order_id
                    before_lab_status
                    before_lab_reason
                }
            }
        }
    }
`;

const LOAD_LAB_STATUSES = gql`
    query LoadLabStatuses {
        lab_follow_up_statusCollection {
            edges {
                node {
                    id
                    status
                }
            }
        }
    }
`;

const INSERT_LAB_FOLLOW_UP = gql `
    mutation InsertLabFollowUp(
            $order_id: BigInt!
            $clinic_id: BigInt!
            $sent_to_lab_date: Date!
            $expected_return_date: Date!
            $branch_id: Int!
        ){
            insertIntolab_follow_upCollection(
                objects: [
                    {   
                        order_id: $order_id
                        clinic_id: $clinic_id
                        sent_to_lab_date: $sent_to_lab_date
                        expected_return_date: $expected_return_date
                        branch_id: $branch_id
                    }
                ]
            ){
                records{
                    id
                    order_id
                    sent_to_lab_date
                    expected_return_date
                    received_date
                    note
                    clinic{
                        id
                        venue
                    }
                    lab_follow_up_status{
                        id
                        status
                    }
                }
            }
        } 
`;

const UPDATE_MARK_RECEIVED = gql`
    mutation UpdateMarkReceived($id: BigInt!, $received_date: Date!, $status_id: BigInt!){
        updatelab_follow_upCollection(
            filter: {id: {eq: $id}}
            set: {
                received_date: $received_date
                lab_follow_up_status_id: $status_id
            }
        ){
            records{
                id
                received_date
                lab_follow_up_status_id
            }
        }
    } 
`;

const UPDATE_EDIT_NOTE = gql`
    mutation UpdateEditNote($id: BigInt!, $note: String!){
        updatelab_follow_upCollection(
            filter: { id: {eq: $id}}
            set: {note: $note}    
        ){
            records{
                id
                note
            }
        }
    }
`;

const UPDATE_LAB_STATUS = gql`
    mutation UpdateLabStatus($id: BigInt!, $status_id: BigInt!){
        updatelab_follow_upCollection(
            filter: {id: {eq: $id}}
            set: {
                lab_follow_up_status_id: $status_id
            }
        ){
            records{
                id
                lab_follow_up_status{
                    id
                    status
                }
            }
        }
    }
`;
export default function LabFollowUp() {

    const {staff} = useAuth();
    const branchId = staff?.branch?.id || staff?.branch_id;

    const {data: LabData, loading, error, refetch: refetchLabData} = useQuery(LOAD_LAB_FOLLOW_UP, {
        variables: {branch_id: Number(branchId)},
        fetchPolicy: "network-only",
        skip: !branchId
    })
    const {data: clinicsData } = useQuery(LOAD_CLINICS,{ variables: {branch_id: Number(branchId)}, fetchPolicy: 'network-only', skip: !branchId})
    const {data: ordersData, loading: ordersLoading, error: ordersError } = useQuery(LOAD_ORDERS,{
        fetchPolicy: 'network-only',
        skip: !branchId
    })
    const {data: reminderCallsData} = useQuery(LOAD_REMINDER_CALLS, {
        fetchPolicy: 'network-only',
        skip: !branchId
    })
    const {data: statusData} = useQuery(LOAD_LAB_STATUSES, {fetchPolicy: "network-only"})

    const statusMap = React.useMemo(() => {
        const map = {};

        statusData?.lab_follow_up_statusCollection?.edges?.forEach(({ node }) => {
            map[node.status] = Number(node.id);
        });
        if (map["Received from Lab"] && !map["Received"]) {
            map["Received"] = map["Received from Lab"];
        }

        return map;
    }, [statusData]);

    const normalizeLabStatus = (status) => {
        if (status === "Received from Lab") return "Received";
        return status || "Sent to Lab";
    };

    const [InsertLabFollowUp] = useMutation(INSERT_LAB_FOLLOW_UP)
    const [UpdateMarkReceived] = useMutation(UPDATE_MARK_RECEIVED)
    const [UpdateEditNote] = useMutation(UPDATE_EDIT_NOTE)
    const [UpdateLabStatus] = useMutation(UPDATE_LAB_STATUS)


    useEffect(() => {
        if (
            !LabData?.lab_follow_upCollection?.edges ||
            !statusMap["Delayed"]
        ) {
            return;
        }
        const delayedStatusId = Number(statusMap["Delayed"]);
        const updateDelayedOrders = async () => {
            try {
                const overdueOrders =
                    LabData.lab_follow_upCollection.edges.filter(
                        ({ node }) => {
                            const currentStatus = node.lab_follow_up_status?.status;
                            const receivedDate = node.received_date;
                            const expectedReturn = node.expected_return_date;

                        return (
                            currentStatus !== "Received" &&
                            currentStatus !== "Delayed" &&
                            !receivedDate &&
                            expectedReturn && dayjs().isAfter( dayjs(expectedReturn),"day")
                        );
                    }
                );

                if (overdueOrders.length === 0) {
                    return;
                }
                await Promise.all(
                    overdueOrders.map(({ node }) =>
                        UpdateLabStatus({
                            variables: {
                                id: Number(node.id),
                                status_id: delayedStatusId
                            }
                        })
                    )
                );
                console.log(
                    `${overdueOrders.length} orders marked Delayed`
                );
                await refetchLabData();

            } catch (err) {
                console.error("Failed auto updating delayed orders",err);
        }
    };
    updateDelayedOrders();

    }, [
        LabData,
        statusMap,
        UpdateLabStatus,
        refetchLabData
    ]);

    const [labOrders, setLabOrders] = useState([]);
    const [markReceivedOrder, setMarkReceivedOrder] = useState(null);
    const [editNoteOrder, setEditNoteOrder] = useState(null);
    // const [addModalOpen, setAddModalOpen] = useState(false);

    const [clinicFilter, setClinicFilter] = useState("All Centers");
    const [statusFilter, setStatusFilter] = useState("All Status")
    const [dateRange, setDateRange] =useState(null)



    useEffect(() => {
    if (
        !LabData?.lab_follow_upCollection?.edges ||
        !ordersData?.orderCollection?.edges
    ) {
        return;
    }

    // Create reminder call map
    const reminderCallMap = new Map();
    reminderCallsData?.reminder_callCollection?.edges?.forEach(({ node }) => {
        reminderCallMap.set(Number(node.order_id), node);
    });

    // Existing lab follow-up records
    const existingLabOrders = LabData.lab_follow_upCollection.edges.map(
        ({ node }) => {
            const sentToLab = node.sent_to_lab_date
                ? dayjs(node.sent_to_lab_date).format("YYYY-MM-DD")
                : null;

            const expectedReturn = node.expected_return_date
                ? dayjs(node.expected_return_date).format("YYYY-MM-DD")
                : null;

            const receivedDate = node.received_date
                ? dayjs(node.received_date).format("YYYY-MM-DD")
                : null;

            let status = normalizeLabStatus(node.lab_follow_up_status?.status);

            const today = dayjs().startOf("day");
            const expectedDate = expectedReturn
                ? dayjs(expectedReturn).startOf("day")
                : null;

            if (
                status !== "Received" &&
                !receivedDate &&
                expectedReturn &&
                today.isAfter(expectedDate)
            ) {
                status = "Delayed";
            }

            return {
                id: Number(node.id),
                orderId: node.order_id,
                clinicCenter: (node.clinic?.venue || "").trim(),
                sentToLab,
                expectedReturn,
                receivedDate,
                note: node.note || "",
                status,
                isAutoGenerated: false, 
            };
        }
    );

    const existingOrderIds = new Set(
        existingLabOrders.map((o) => Number(o.orderId))
    );

    const branchOrderEdges = ordersData.orderCollection.edges.filter(
        ({ node }) => Number(node.clinic_attend_customer?.clinic?.branch_id) === Number(branchId)
    );

    // Filter orders with Before Lab status = answer and reason = ready to send
    const readyToSendOrders = branchOrderEdges.filter(({ node }) => {
        const reminderCall = reminderCallMap.get(Number(node.id));
        return isReadyToSendReminder(reminderCall) && isLabCandidateStatus(node.order_status?.status);
    });

    const autoGeneratedOrders = readyToSendOrders
        .filter(
            ({ node }) =>
                !existingOrderIds.has(Number(node.id))
        )
        .map(({ node }) => {
            const placedDate = dayjs(node.placed_at);
            const sentToLabDate = placedDate.add(SENT_TO_LAB_DELAY_DAYS, "day");

            return {
                id: `temp-${node.id}`, // CHANGED
                orderId: Number(node.id),
                clinicCenter:
                    node.clinic_attend_customer?.clinic?.venue || "",
                sentToLab: sentToLabDate.format("YYYY-MM-DD"),
                expectedReturn: sentToLabDate
                    .add(LAB_TURNAROUND_DAYS, "day")
                    .format("YYYY-MM-DD"),
                receivedDate: null,
                note: "",
                status: "Sent to Lab",
                isAutoGenerated: true, // CHANGED
            };
        });


    setLabOrders([
        ...existingLabOrders,
        ...autoGeneratedOrders,
    ]);
}, [LabData, ordersData, branchId, reminderCallsData]);

useEffect(() => {
    if (
        !LabData?.lab_follow_upCollection?.edges ||
        !ordersData?.orderCollection?.edges ||
        !branchId
    ) {
        return;
    }

    // Create reminder call map
    const reminderCallMap = new Map();
    reminderCallsData?.reminder_callCollection?.edges?.forEach(({ node }) => {
        reminderCallMap.set(Number(node.order_id), node);
    });

    const existingOrderIds = new Set(
        LabData.lab_follow_upCollection.edges.map(({ node }) => Number(node.order_id))
    );

    const branchOrderEdges = ordersData.orderCollection.edges.filter(
        ({ node }) => Number(node.clinic_attend_customer?.clinic?.branch_id) === Number(branchId)
    );

    // Filter orders with Before Lab status = answer and reason = ready to send
    const readyToSendOrders = branchOrderEdges.filter(({ node }) => {
        const reminderCall = reminderCallMap.get(Number(node.id));
        return isReadyToSendReminder(reminderCall) && isLabCandidateStatus(node.order_status?.status);
    });

    const newOrdersToInsert = readyToSendOrders.filter(
        ({ node }) =>
            !existingOrderIds.has(Number(node.id)) &&
            node.clinic_attend_customer?.clinic_id
    );

    if (newOrdersToInsert.length === 0) return;

    const insertAll = async () => {
        try {
            await Promise.all(
                newOrdersToInsert.map(({ node }) => {
                    const placedDate = dayjs(node.placed_at);
                    const sentToLabDate = placedDate.add(SENT_TO_LAB_DELAY_DAYS, "day");
                    return InsertLabFollowUp({
                        variables: {
                            order_id: Number(node.id),
                            clinic_id: Number(node.clinic_attend_customer.clinic_id),
                            branch_id: Number(branchId),
                            sent_to_lab_date: sentToLabDate.format("YYYY-MM-DD"),
                            expected_return_date: sentToLabDate.add(LAB_TURNAROUND_DAYS, "day").format("YYYY-MM-DD"),
                        }
                    });
                })
            );
            await refetchLabData();
        } catch (err) {
            console.error("Failed auto-inserting new lab follow-up rows", err);
        }
    };

    insertAll();
}, [LabData, ordersData, branchId, reminderCallsData, InsertLabFollowUp, refetchLabData]);

    const CLINIC_OPTIONS = [
        'All Centers',
        ...(clinicsData?.clinicCollection?.edges?.map(
            ({node}) => node.venue
        ) || [])
    ];

    const statusOptions = [
        { label: 'All Status', value: 'All Status' },
        ...Array.from(
            new Set(
                statusData?.lab_follow_up_statusCollection?.edges?.map(
                    ({ node }) => normalizeLabStatus(node.status)
                ) || []
            )
        ).map((status) => ({
            label: status,
            value: status
        }))
    ];

    const branchClinicIds = new Set(
        clinicsData?.clinicCollection?.edges?.map(({ node }) => Number(node.id)) || []
    )

    const orderList = ordersData?.orderCollection?.edges?.filter(
        ({ node }) => Number(node.clinic_attend_customer?.clinic?.branch_id) === Number(branchId)
    ) ?? [];
    
    const formattedOrders = orderList
        .map(({ node }) => {

            if (!node.id || !node?.clinic_attend_customer?.clinic_id) return null;

            const placedDate = dayjs(node.placed_at);
            const sentToLabDate = placedDate.add(SENT_TO_LAB_DELAY_DAYS, "day");

            return {
                orderId: Number(node.id),
                clinicId: Number(node.clinic_attend_customer.clinic_id),
                clinicName:
                    node.clinic_attend_customer?.clinic?.venue ||
                    "Unknown Clinic",

                placedAt: placedDate,
                sentToLabDate: sentToLabDate,
                expectedReturnDate: sentToLabDate.add(LAB_TURNAROUND_DAYS, "day")
            };
        })
        .filter(Boolean);

    const isLoading = loading || ordersLoading;
    const loadError = error || ordersError;
    const total = labOrders.length || 0;
    const sendToLab = labOrders.filter(order => order.status === 'Sent to Lab').length;
    const received = labOrders.filter(order => order.status === 'Received').length;
    const inProgress = labOrders.filter(order => order.status === 'In Progress').length;
    const delayed = labOrders.filter(order => order.status === 'Delayed').length;

    //filteres list passed to table
    const filteredOrders = labOrders.filter((o) => {
        const clinicMatch = clinicFilter === 'All Centers' || (o.clinicCenter || '').trim().toLowerCase() === clinicFilter.trim().toLowerCase();
        const statusMatch = statusFilter === 'All Status' || (o.status || '').toLowerCase() ===  statusFilter.toLowerCase();

        let dateMatch = true;

        if(dateRange?.[0] && dateRange?.[1]){
            const sent = o.sentToLab ? dayjs(o.sentToLab) : null;

            const start = dateRange[0].startOf('day');
            const end = dateRange[1].endOf('day');

            dateMatch = sent && 
                (sent.isAfter(start) || sent.isSame(start)) &&
                (sent.isBefore(end) || sent.isSame(end))
        }
        return clinicMatch && statusMatch && dateMatch;
    });

    const handleAddLabOrder =  async(newOrder) => {
  
        if (!newOrder.orderId || !newOrder.clinicId) {
            console.log("DEBUG newOrder:", newOrder);    
            message.error("Invalid order selected");
        return;
    }

        const alreadyExists = labOrders.some(
            (o) => Number(o.orderId) === Number(newOrder.orderId)
        );

        if (alreadyExists) {
            message.warning("This order is already added.");
            return;
        }

        try{
            await InsertLabFollowUp({
                variables: {
                    order_id: Number(newOrder.orderId),
                    clinic_id: Number(newOrder.clinicId),
                    branch_id: Number(branchId),
                    sent_to_lab_date: newOrder.sentToLab,
                    expected_return_date: newOrder.expectedReturn
                }
            });
            message.success('Lab order added successfully');
            setAddModalOpen(false);
            refetchLabData();

        }catch(err){
            console.log(err);
            message.error('Failed to add lab order');
        }
    };

    const handleMarkReceived = async(order, date) => {
        try{
            await UpdateMarkReceived({
                variables: {
                    id: Number(order.id),
                    received_date: date,
                    status_id: Number(statusMap["Received"])
                }
            })

            setLabOrders(prev => 
                prev.map(o => 
                    o.id === order.id
                        ? {...o, status: "Received", receivedDate: date}
                        : o
                )
            )  
            message.success(`Order ${order.orderId} marked as received.`);
            await refetchLabData();
            setMarkReceivedOrder(null);
        }catch(err){
            message.error("failed to mark as received")
            console.error(err)
        }   
    };

    const handleStatusChange = async (order, newStatus) => {
        if (order.isAutoGenerated) {
            message.warning("This order has not yet been saved to lab_follow_up.");
            return;
        }

        if (order.status === "Received") {
            message.warning("Received orders cannot change status.");
            return;
        }
    // prevent changing to Delayed manually
        if (newStatus === "Delayed") {
            message.warning("Delayed status is set automatic.");
            return;
        }
        if (newStatus === 'Received') {
            message.warning('Use the Mark Received button to set this status — a received date is required.')
            return
        }
    // prevent selecting same status
        if (order.status === newStatus) {
            return;
        }
        try{
            const statusId = statusMap[newStatus];
            if(!statusId){
                message.error("Invalid status selected");
                return;
            }

            await UpdateLabStatus({
                variables: {
                    id: Number(order.id),
                    status_id: statusId
                }
            });

            setLabOrders(prev =>
                prev.map(o =>
                    o.id === order.id ? { ...o, status: newStatus } : o
                )
            )

            message.success(`Status updated to ${newStatus}`);
            await refetchLabData();

        }catch(err){
            console.error(err);
            message.error("Failed to update status")
        }
    }

    

    const handleSaveNote = async(order, note) => {
        if (!order?.id) {
        message.error("Invalid order id");
        return;
    }

    if (!note?.trim()) {
        message.error("Note cannot be empty");
        return;
    }

        try{
            console.log("Updating note:", {
            id: Number(order.id),
            note: note.trim()
        });

            await UpdateEditNote({
                variables: {
                    id: Number(order.id),
                    note: note.trim()
                }
            });

            message.success("Note saved successfully.")
            await refetchLabData({ fetchPolicy: "network-only" });
            setEditNoteOrder(null);
        }catch(err){
            console.error(err);
            message.error("Failed to save note");
        }
    }

  return (
    <Layout >
        <Content className="p-8" style={{ padding: "20px" }}>
            {!branchId && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="No branch assigned to this staff account."
                    description="Lab follow-up data is loaded by branch, so this admin account needs a branch before records can be shown."
                />
            )}
            {loadError && (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Could not load lab follow-up data"
                    description={loadError.message}
                />
            )}
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
                            Lab Follow-Up
                        </Title>
                        <Text type="secondary">
                            Manage all lab follow-up activities and orders.
                        </Text>
                    </Col>

                    {/* Right side button */}
                    {/* <Col>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setAddModalOpen(true)}
                        style={{
                        background: "#e6f0ff",
                        borderColor: "#b3d1ff",
                        color: "#1a73e8",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "5px 15px",
                        }}
                    >
                        Add Lab Orders    
                    </Button>
                    </Col> */}
                </Row>
             </div>
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
    <Col flex="1">
        <StatCard title="Total Lab Orders" value={total} icon={icons.total} bgColor="#c5c6f6"/>
    </Col>

    <Col flex="1">
        <StatCard title="Sent to Lab" value={sendToLab} iconType='send' bgColor="#fffadc"/>
    </Col>

    <Col flex="1">
        <StatCard title="Received" value={received} iconType='delivered' bgColor="#c3e9fe"/>
    </Col>

    <Col flex="1">
        <StatCard title="In Progress" value={inProgress} iconType='clock' bgColor="#e4fee3"/>
    </Col>

    <Col flex="1">
        <StatCard title="Delayed" value={delayed} iconType='closed' bgColor="#fff0f0"/>
    </Col>
</Row>

            {/* Filters */}
            <div
                style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #E5E7EB',
                    padding: '16px 20px',
                    marginBottom: 16,
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    alignItems: 'flex-end',
                }}
            >
            <div>
             <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
                Filter by Date Range (Sent Date)
            </div>
            <RangePicker
                style={{ width: 260 }}
                onChange={(val) => setDateRange(val)}
                format="YYYY-MM-DD"
            />
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
                    Filter by Clinic Center
                </div>
                <Select
                    value={clinicFilter}
                    onChange={setClinicFilter}
                    style={{ width: 220 }}
                    options={CLINIC_OPTIONS.map((c) => ({ label: c, value: c }))}
                />
            </div>
            <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#374151' }}>
                    Filter by Status
                </div>
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: 160 }}
                    options={statusOptions}
                />
            </div>
        </div>
           
        <LabFollowUpTable 
            orders={filteredOrders}
            loading={isLoading}
            onMarkReceived={setMarkReceivedOrder}
            onEditNote={setEditNoteOrder}
            onStatusChange={handleStatusChange}
            />
        <MarkReceivedModal
            open={!!markReceivedOrder}
            order={markReceivedOrder}
            onConfirm={handleMarkReceived}
            onCancel={() => setMarkReceivedOrder(null)}
        />  
        <EditNoteModal
            open={!!editNoteOrder}
            order={editNoteOrder}
            onSave={handleSaveNote}
            onCancel={() => setEditNoteOrder(null)}
        />
        {/* <AddLabOrder
            open={addModalOpen}
            onAdd={handleAddLabOrder}
            onCancel={() => setAddModalOpen(false)}
            orders={formattedOrders}
        /> */}
       
        </Content>
    </Layout>
      
  
  )
}

