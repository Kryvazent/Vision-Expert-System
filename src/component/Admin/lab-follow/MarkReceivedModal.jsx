import React,{useEffect} from 'react'
import { Modal, DatePicker, Button, Typography, Form } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function MarkReceivedModal({open, order, onCancel, onConfirm}) {

    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ receivedDate: dayjs() })
        }
    }, [open])

    const handleOk = () => {
        form.validateFields().then((values) => {
            onConfirm(order, values.receivedDate.format('YYYY-MM-DD'));
            form.resetFields();
        });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    

  return (
    <Modal
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>Mark as Received</span>}
        open={open}
        onCancel={handleCancel}
        width={460}
        centered
        footer={null}
    >
        {order && (
            <>
                <div style={{ background: '#EFF6FF',border: '1px solid #BFDBFE',borderRadius: 8,padding: '12px 16px',marginBottom: 20, }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Order ID: {order.orderId}</Text>
                    <Text type='secondary' style={{ display: 'block', fontSize: 13 }}>Clinic Center: {order.clinicCenter}</Text>
                    <Text type='secondary' style={{ display: 'block', fontSize: 13 }}>Expected Return: {order.expectedReturn}</Text>
                </div>

                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Received Date"
                        name="receivedDate"
                        rules={[{ required: true, message: 'Please select the received date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabledDate={(d) => d && d < dayjs().startOf("day")} />
                    </Form.Item>
                </Form>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 8 }}>
                    <Button 
                        type="primary" 
                        onClick={handleOk} 
                        icon={<CheckCircleOutlined />} 
                        style={{background: '#2563EB', borderColor: '#2563EB'  }}
                >
                        Mark as Received
                    </Button>
                    <Button onClick={handleCancel} >Cancel</Button>
                </div>
            </>
        )}
    </Modal>
  )
}
