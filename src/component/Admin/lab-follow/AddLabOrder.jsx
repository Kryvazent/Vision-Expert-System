import React, {useState} from 'react'
import { Modal, Form, Input, DatePicker, Select, Button, Typography, Divider,message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { Text } = Typography;
const {Option} = Select;

export default function AddLabOrder({open, onCancel, onAdd, orders}) {
    const [form] = Form.useForm();

    const handleOrderChange = (value) => {
        const selected = JSON.parse(value);
        form.setFieldsValue({
            sentToLab: dayjs(selected.sentToLabDate)
                .format("YYYY-MM-DD"),

            expectedReturn: dayjs(selected.expectedReturnDate)
                .format("YYYY-MM-DD")
        });
    };

    const handleAdd = () => {
        form.validateFields().then((values) => {
            const selected = JSON.parse(values.order);

            if (!selected?.orderId || !selected?.clinicId) {
                message.error("Invalid order selected");
                return;
            }

           

            const newOrder = {
                orderId: Number(selected.orderId),
                clinicId: Number(selected.clinicId),
                sentToLab: dayjs(selected.sentToLabDate)
                    .format("YYYY-MM-DD"),
                expectedReturn: dayjs(selected.expectedReturnDate)
                    .format("YYYY-MM-DD"),
                note: ''
            };

            onAdd(newOrder);
            form.resetFields();
        })
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

  return (
    <Modal 
        title=
            {<span style={{ fontSize: 16, fontWeight: 600 }}>
                Add Lab Order Follow-Up
             </span>}
        open={open}
        onCancel={handleCancel}
        width={500}
        centered
        footer={null}
    >
        <Form form={form} layout="vertical" style={{marginTop: 12}}>

            <Form.Item label={<span style={{ fontWeight: 500 }}>Order ID</span>} name="order"rules={[{ required: true , message: 'Please select an order!' }]}>
                <Select placeholder="Select Order" showSearch  onChange={handleOrderChange}>
                    {(orders || []).map((order) => (
                        <Select.Option
                            key={order.orderId}
                            value={JSON.stringify(order)}
                        >
                          
                            { `ORD-${String(order.orderId).padStart(5, '0')}`}
                            
                        </Select.Option>
                     ))}
            </Select>
        </Form.Item>

            <Form.Item
                label={<span style={{ fontWeight: 500 }}>Sent to Lab Date</span>}
                name="sentToLab"
                rules={[{ required: true, message: 'Please select the date sent to lab!' }]}
            >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item
                label={<span style={{ fontWeight: 500 }}>Expected Return Date</span>}
                name="expectedReturn"
                rules={[{ required: true, message: 'Please select the expected return date!' }]}
            >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>

            

        </Form>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 8 }}>
            <Button 
                type="primary" 
                onClick={handleAdd} 
                icon={<PlusOutlined />} 
                style={{background: '#2563EB', borderColor: '#2563EB'  }}
            >
                Add Lab Order
            </Button>
            <Button onClick={handleCancel} >Cancel</Button>
        </div>
    </Modal>
  )
}
