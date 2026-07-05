import React, {useState} from 'react'
import { Button, Select, Typography, Table, Modal, Input, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import {gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react/compiled';

const {Option} = Select
const {Title} = Typography;

const INSERT_REMINDER_CALL = gql`
    mutation InsertReminderCall(
        $order_id: BigInt!
        $before_lab_status: String
        $before_lab_reason: String
        $before_lab_custom_reason: String
        $before_delivery_status: String
        $before_delivery_reason: String
        $before_delivery_custom_reason: String
        $before_delivery_2_status: String
        $before_delivery_2_reason: String
        $before_delivery_2_custom_reason: String
     ) {
        insertIntoreminder_callCollection(
            objects: [{
            order_id: $order_id
            before_lab_status: $before_lab_status
            before_lab_reason: $before_lab_reason
            before_lab_custom_reason: $before_lab_custom_reason
            before_delivery_status: $before_delivery_status
            before_delivery_reason: $before_delivery_reason
            before_delivery_custom_reason: $before_delivery_custom_reason
            before_delivery_2_status: $before_delivery_2_status
            before_delivery_2_reason: $before_delivery_2_reason
            before_delivery_2_custom_reason: $before_delivery_2_custom_reason
            }]
         ) {
            records { 
                id 
                order_id 
            }
        }
    }
`;

const UPDATE_REMINDER_CALL = gql`
    mutation UpdateReminderCall(
        $order_id: BigInt!
        $before_lab_status: String
        $before_lab_reason: String
        $before_lab_custom_reason: String
        $before_delivery_status: String
        $before_delivery_reason: String
        $before_delivery_custom_reason: String
        $before_delivery_2_status: String
        $before_delivery_2_reason: String
        $before_delivery_2_custom_reason: String
    ) {
        updatereminder_callCollection(
            set: {
                before_lab_status: $before_lab_status
                before_lab_reason: $before_lab_reason
                before_lab_custom_reason: $before_lab_custom_reason
                before_delivery_status: $before_delivery_status
                before_delivery_reason: $before_delivery_reason
                before_delivery_custom_reason: $before_delivery_custom_reason
                before_delivery_2_status: $before_delivery_2_status
                before_delivery_2_reason: $before_delivery_2_reason
                before_delivery_2_custom_reason: $before_delivery_2_custom_reason
                
            }
            filter: { order_id: { eq: $order_id } }
        ) {
            records { 
                id 
                order_id 
            }
        }
    }
`;

const BEFORE_LAB_REASONS = [
    { value: 'ready to send', label: 'Ready to send' },
    { value: 'need more time', label: 'Need more time' },
    { value: 'want to make changes', label: 'Want to make changes' },
    { value: 'cancel order', label: 'Cancel order' },
    { value: 'no answer', label: 'No answer' },
    { value: 'call back later', label: 'Call back later' },
    { value: 'prescription needs verification', label: 'Prescription needs verification' },
    { value: 'address confirmation needed', label: 'Address confirmation needed' },
    { value: 'frame selection pending', label: 'Frame selection pending' },
    { value: 'other', label: 'Other (custom)' },
];

const BEFORE_DELIVERY_REASONS = [
    { value: 'will collect from branch',   label: 'Will collect from branch' },
    { value: 'request home delivery',      label: 'Request home delivery' },
    { value: 'reschedule delivery',        label: 'Reschedule delivery' },
    { value: 'not ready yet',             label: 'Not Ready yet' },
    { value: 'no answer',                 label: 'No answer' },
    { value: 'call back later',           label: 'Call back later' },
    { value: 'payment pending',           label: 'Payment pending' },
    { value: 'address confirmation needed', label: 'Address confirmation needed' },
    { value: 'other',                     label: 'Other (custom)' },
];

export default function CallDetailsTable({ orders = [] , reminderMap = {} , onRefetch}) {

const [localData, setLocalData] = useState({})
const [dirtyRows, setDirtyRows] = useState({})
const [isModalOpen, setIsModalOpen] = useState(false);
const [modalContext,  setModalContext]  = useState(null);
const [customReason, setCustomReason] =  useState("");   

const insertedThisSession = React.useRef(new Set());

const [insertReminderCall] = useMutation(INSERT_REMINDER_CALL);
const [updateReminderCall] = useMutation(UPDATE_REMINDER_CALL);

const getRecord = (orderId) => {
    const dbRecord = reminderMap[String(orderId)] || {};
    const local    = localData[String(orderId)]   || {};
    return { ...dbRecord, ...local };
}

const saveRecord = async (orderId, updateFields) => {
    console.log("saveRecord called for orderId:", orderId, "updateFields:", updateFields);
    const existsInDb      = !!reminderMap[String(orderId)]
    const existsThisSession = insertedThisSession.current.has(String(orderId))
    const existing = existsInDb || existsThisSession;

    const dbRecord = reminderMap[String(orderId)] || {};
    const local    = localData[String(orderId)]   || {};
    const merged   = { ...dbRecord, ...local, ...updateFields };

    try{
        console.log("existsInDb:", existsInDb, "existsThisSession:", existsThisSession, "existing:", existing);
        console.log("merged data:", merged);
        if(existing){
            console.log("Calling updateReminderCall with variables:", {
                order_id: Number(orderId),
                before_lab_status: merged.before_lab_status ?? null,
                before_lab_reason: merged.before_lab_reason ?? null,
                before_lab_custom_reason: merged.before_lab_custom_reason ?? null,
                before_delivery_status: merged.before_delivery_status ?? null,
                before_delivery_reason: merged.before_delivery_reason ?? null,
                before_delivery_custom_reason:merged.before_delivery_custom_reason ?? null,
                before_delivery_2_status: merged.before_delivery_2_status ?? null,
                before_delivery_2_reason: merged.before_delivery_2_reason ?? null,
                before_delivery_2_custom_reason:merged.before_delivery_2_custom_reason ?? null,
            });
            const result = await updateReminderCall({
                variables: {
                    order_id: Number(orderId),
                    before_lab_status: merged.before_lab_status ?? null,
                    before_lab_reason: merged.before_lab_reason ?? null,
                    before_lab_custom_reason: merged.before_lab_custom_reason ?? null,
                    before_delivery_status: merged.before_delivery_status ?? null,
                    before_delivery_reason: merged.before_delivery_reason ?? null,
                    before_delivery_custom_reason:merged.before_delivery_custom_reason ?? null,
                    before_delivery_2_status: merged.before_delivery_2_status ?? null,
                    before_delivery_2_reason: merged.before_delivery_2_reason ?? null,
                    before_delivery_2_custom_reason:merged.before_delivery_2_custom_reason ?? null,
                }
            })
            console.log("updateReminderCall result:", result);
        } else {
            await insertReminderCall({
                variables: {
                    order_id: Number(orderId),
                    before_lab_status: merged.before_lab_status ?? null,
                    before_lab_reason: merged.before_lab_reason ?? null,
                    before_lab_custom_reason: merged.before_lab_custom_reason ?? null,
                    before_delivery_status: merged.before_delivery_status ?? null,
                    before_delivery_reason: merged.before_delivery_reason ?? null,
                    before_delivery_custom_reason:merged.before_delivery_custom_reason ?? null,
                    before_delivery_2_status: merged.before_delivery_2_status ?? null,
                    before_delivery_2_reason: merged.before_delivery_2_reason ?? null,
                    before_delivery_2_custom_reason:merged.before_delivery_2_custom_reason ?? null,
                }
            })

            insertedThisSession.current.add(String(orderId));
        }
        if (onRefetch) {
            await onRefetch()
        }
        setDirtyRows(prev => {
            const next = { ...prev }
            delete next[String(orderId)]
            return next
        })
        message.success('Reminder call updated.')
    } catch (err){
        console.error("Save reminder call failed:", err);
        message.error('Failed to save. Please try again.');
    }   
}


        // Handle any field change locally. The row Update button persists it.
        const markDirty = (orderId) => {
            setDirtyRows(prev => ({ ...prev, [String(orderId)]: true }))
        }

        const handleChange = (orderId, field, value) => {
            const updated = {[field]: value}

            setLocalData(prev => ({
                ...prev,
                [String(orderId)]: {
                    ...prev[String(orderId)],
                    ...updated
                }
            }))
            markDirty(orderId)
        }

        // When "other" is selected, open the custom reason modal
        const handleReasonChange = (orderId, field, value) => {
            if (value === 'other') {
                setModalContext({ orderId, field })
                setCustomReason('')
                setIsModalOpen(true)
            }else {
                // Clear any previous custom reason for this field when non-other selected
                const customField = field.replace('_reason', '_custom_reason');
                const updated = {
                    [field]: value,
                    [customField]: null
                }
                setLocalData(prev => ({
                    ...prev,
                    [String(orderId)]: {
                        ...prev[String(orderId)],
                        ...updated
                    }
                }))
                markDirty(orderId)
            }
        }

        const handleSaveRow = (orderId) => {
            const dbRecord = reminderMap[String(orderId)] || {};
            const local = localData[String(orderId)] || {};
            saveRecord(orderId, { ...dbRecord, ...local });
        }


        // Save custom reason from modal
        const handleCustomReasonOk = () => {
            if (!modalContext) return
            const { orderId, field } = modalContext
            const customField = field.replace('_reason', '_custom_reason')
            const updated = { [field]: 'other', [customField]: customReason }
            setLocalData(prev => ({
                ...prev,
                [String(orderId)]: { ...prev[String(orderId)], ...updated }
            }))
            markDirty(orderId)
            setIsModalOpen(false)
            setCustomReason('')
            setModalContext(null)
        }

        //Build table datasource from orders prop
        const dataSource = orders.map(e => {
            const order    = e.node
            const customer = order.clinic_attend_customer?.customer_has_branch?.customer
            const branch   = order.clinic_attend_customer?.customer_has_branch?.branch
            return {
                key: String(order.id),
                orderId: order.id,
                customerName: customer
                    ? `${customer.first_name} ${customer.last_name || ''}`.trim()
                    : '—',
                clinic: branch?.branch_name || '—',
            }
        })

        // Status select — shared renderer for Before Lab and Before Delivery
        const renderStatusSelect = (orderId, field) => {
            const record = getRecord(orderId)
            return (
                <Select
                    placeholder="Select"
                    style={{ width: 140 }}
                    value={record[field] || undefined}
                    optionLabelProp="label"
                    onChange={(val) => {
                        if(val === 'not_answer'){
                            const reasonField = field.replace('_status', '_reason')
                            const updated = {
                                [field]: val,
                                [reasonField]: 'no answer'
                            }

                            setLocalData(prev => ({
                                ...prev,
                                [String(orderId)]: {
                                    ...prev[String(orderId)],
                                    ...updated
                                }
                            }))
                            markDirty(orderId)
                            return
                        }
                        handleChange(orderId, field, val)
                    }}
                    
                >
                    <Option
                        value="answer"
                        label={<><CheckCircleOutlined style={{ color: 'green', marginRight: 6 }} />Answer</>}
                    >
                        <CheckCircleOutlined style={{ color: 'green', marginRight: 6 }} />Answer
                    </Option>
                    <Option
                        value="not_answer"
                        label={<><CloseCircleOutlined style={{ color: 'red', marginRight: 6 }} />Not Answer</>}
                    >
                        <CloseCircleOutlined style={{ color: 'red', marginRight: 6 }} />Not Answer
                    </Option>
                </Select>
            )
        }

        // Reason select — shared renderer
        const renderReasonSelect = (orderId, field, reasons) => {
            const record = getRecord(orderId)
            const customField = field.replace('_reason', '_custom_reason')
            const displayValue = record[field] === 'other' && record[customField]
                ? record[customField]   // show the typed custom reason as the label
                : record[field] || undefined
 
            return (
                <Select
                    placeholder="select Reason"
                    style={{ width: 250 }}
                    value={displayValue}
                    onChange={(val) => handleReasonChange(orderId, field, val)}
                >
                    {reasons.map(r => (
                        <Option key={r.value} value={r.value}>{r.label}</Option>
                    ))}
                </Select>
            )
        }

const columns = [
    {
        title: "Order ID",
        dataIndex: "orderId",
        width: 120 ,
        render: (id) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{id}</span>,
    },
    {
        title: "Customer Name",
        dataIndex: "customerName",
        width: 180 
    },
    {
        title: "Clinic Center",
        dataIndex: "clinic",
        width: 200
    },
    {
        title: "Status - Before Lab",
        width: 180,
        render: (_, record) => renderStatusSelect(record.orderId, 'before_lab_status'),
    },
    {
        title: "Reason - Before Lab",
        width: 280,
        render: (_, record) => renderReasonSelect(record.orderId, 'before_lab_reason', BEFORE_LAB_REASONS),
            
    },
    {
        title: "Status - Before Delivery",
        width: 200,
        render: (_, record) => renderStatusSelect(record.orderId, 'before_delivery_status'),
    },
    {
        title: "Reason - Before Delivery",
        width:260,
        render: (_, record) => renderReasonSelect(record.orderId, 'before_delivery_reason', BEFORE_DELIVERY_REASONS),
    },
    {
        title: "Status - Before Delivery 2",
        width: 220,
        render: (_, record) => renderStatusSelect(record.orderId, 'before_delivery_2_status'),
    },
    {
        title: "Reason - Before Delivery 2",
        width: 280,
        render: (_, record) => renderReasonSelect(record.orderId, 'before_delivery_2_reason', BEFORE_DELIVERY_REASONS),
    },
    {
        title: "Action",
        width: 120,
        fixed: 'right',
        render: (_, record) => (
            <Button
                type="primary"
                disabled={!dirtyRows[String(record.orderId)]}
                onClick={() => handleSaveRow(record.orderId)}
            >
                Update
            </Button>
        ),
    }
]

  return (
    <div>
      <Title level={5} className="mb-0 " style={{fontWeight:'bold'}} >Reminder Call Details</Title>
      <div style={{ overflowX: "auto" }}>
        <Table  
            dataSource={dataSource} 
            columns={columns} 
            pagination={false}  
            scroll={{ x: 1900 }}  
            locale={{ emptyText: 'No orders found' }}
            rowKey="key"
        />
      </div>

      {/* Custom reason modal — opens when "Other (custom)" is selected */}
        <Modal
            title="Enter Custom reason"
            open={isModalOpen}
            onOk={handleCustomReasonOk}
            onCancel={() => {
                setIsModalOpen(false)
                setCustomReason('')
                setModalContext(null)
            }}
            okText="Save"
            okButtonProps={{
                disabled: !customReason.trim(),
                style: { background: '#1D4ED8', borderColor: '#1D4ED8' }
            }}
        >
            <Input 
                placeholder='Type your reason......'
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                onPressEnter={handleCustomReasonOk}
                autoFocus
            />

        </Modal>
    </div>
  )
}
