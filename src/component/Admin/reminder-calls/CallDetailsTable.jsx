import React, {useState} from 'react'
import { Select, Typography, Table, Modal, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';


const {Option} = Select
const {Title} = Typography;


export default function CallDetailsTable() {


const [isModalOpen, setIsModalOpen] = useState(false);
const [customerReason, setCustomerReason] =  useState("");    

const dataSource = [
    {
        key: '1',
        orderID: 'OD2501',
        customer: 'Coral Silva',
        clinic: 'Kadawatha Express Center',

    },
    {
        key: "2",
        orderID: "OD2502",
        customer: "David Kim",
        clinic: "Kandy Peradeniya",
    },
];

const columns = [
    {
        title: "Order ID",
        dataIndex: "orderID",
        width: 120 
    },
    {
        title: "Customer Name",
        dataIndex: "customer",
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
        render: () => (
            <Select placeholder="Select" style={{width: 140}} optionLabelProp='label'>
                <Option 
                    value="answer"
                    label={
                        <>
                            <CheckCircleOutlined style={{ color: "green", marginRight: 6 }} />Answer
                         </>
                    }
                >
                    <CheckCircleOutlined style={{ color: "green", marginRight: 6 }} />
                        Answer
                 </Option>

                 <Option 
                    value="not"
                    label={
                        <>
                            <CloseCircleOutlined style={{ color: "red", marginRight: 6 }} />Not Answer
                         </>
                    }
                >
                    <CloseCircleOutlined style={{ color: "red", marginRight: 6 }} />
                       Not  Answer
                 </Option>
            </Select>
        ),
    },
    {
        title: "Reason - Before Lab",
        width: 260,
        render: () => (
            <Select 
                placeholder="select Reason" 
                style={{width: 250}} 
                onChange={(value) => {
                    if (value === "other"){
                        setIsModalOpen(true)
                    }
                }}
            >
                <Option value="ready to send">Ready to send</Option>
                <Option value="need more time">Need more time</Option>
                <Option value="wnt to make changes">Want to make changes</Option>
                <Option value="cancel order">Cancel order</Option>
                <Option value="no answer">No answer</Option>
                <Option value="call back later">Call back later</Option>
                <Option value="prescription needs verification">Prescription needs verification</Option>
                <Option value="address confirmation needed">Address confirmation needed</Option>
                <Option value="frame selection pending">Frame selection pending</Option>
                <Option value="other">Other (custom)</Option>
            </Select>
        )
    },
    {
        title: "Status - Before Delivery",
        width: 180,
        render: () => (
            <Select placeholder="Select" style={{width: 140}} optionLabelProp='label'>
                <Option 
                    value="answer"
                    label={
                        <>
                            <CheckCircleOutlined style={{ color: "green", marginRight: 6 }} />Answer
                         </>
                    }
                >
                    <CheckCircleOutlined style={{ color: "green", marginRight: 6 }} />
                        Answer
                 </Option>

                 <Option 
                    value="not"
                    label={
                        <>
                            <CloseCircleOutlined style={{ color: "red", marginRight: 6 }} />Not Answer
                         </>
                    }
                >
                    <CloseCircleOutlined style={{ color: "red", marginRight: 6 }} />
                       Not  Answer
                 </Option>
            </Select>
        ),
    },
    {
        title: "Reason - Before Delivery",
        width:260,
        render: () => (
            <Select 
                placeholder="select Reason" 
                style={{width: 250}} 
                onChange={(value) => {
                    if (value==="other"){
                        setIsModalOpen(true)
                    }
                }}
            >
                <Option value="will collect from branch">Will collect from branch</Option>
                <Option value="request home delivery">Request home delivery</Option>
                <Option value="reschedule delivery">Reschedule delivery</Option>
                <Option value="not Ready yet">Not Ready yet</Option>
                <Option value="no answer">No answer</Option>
                <Option value="call back later">Call back later</Option>
                <Option value="payment pending">Payment pending</Option>
                <Option value="address confirmation needed">Address confirmation needed</Option>
                <Option value="other">Other (custom)</Option>
            </Select>
        )
    }
]

  return (
    <div>
      <Title level={5} className="mb-0 " style={{fontWeight:'bold'}} >Reminder Call Details</Title>
      <div style={{ overflowX: "auto" }}>
        <Table  dataSource={dataSource} columns={columns} pagination={false}  scroll={{ x: 1400 }}   />
      </div>
        <Modal
            title="Enter Custom reason"
            open={isModalOpen}
            onOk={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
        >
            <Input 
                placeholder='Type your reason......'
                value={customerReason}
                onChange={(e) => setCustomerReason(e.target.value)}
            />

        </Modal>
    </div>
  )
}
