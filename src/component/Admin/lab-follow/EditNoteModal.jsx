import React, {useEffect} from 'react'
import { Modal, Form, Input, Button, Typography } from 'antd'
import { EditOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

export default function EditNoteModal({open, order, onCancel, onSave}) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && order) {
            form.setFieldsValue ({note : order.note || ''})
        }
    },[open, order])

    const handleSave = () => {
        form.validateFields().then((values) => {
            onSave(order, values.note);
            form.resetFields();
        });
    };
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

  return (
    <Modal
        title={<span style={{ fontSize: 16, fontWeight: 600 }}>Add note for delayed order</span>}
        open={open}
        onCancel={handleCancel}
        width={480}
        centered
        footer={null}
    >
        {order && (
            <>
                <div style={{ background: '#FFFBEB',border: '1px solid #FDE68A',borderRadius: 8,padding: '12px 16px',marginBottom: 20, }}>
                    <Text strong style={{ display: 'block', marginBottom: 4 }}>Order ID: {order.orderId}</Text>
                    <Text type='secondary' style={{ display: 'block', fontSize: 13 }}>Clinic Center: {order.clinicCenter}</Text>
                    <Text type='secondary' style={{ display: 'block', fontSize: 13 }}>Expected Return: {order.expectedReturn}</Text>
                </div>

                <Form form={form} layout="vertical">
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Note</span>}
                        name="note"
                        initialValue={order.note || '' }
                        rules={[{ required: true, message: 'Please enter a note!' }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder='Enter note about delay reason...'
                            style={{borderRadius: 6}}
                        />
                    </Form.Item>
                </Form>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start', marginTop: 8 }}>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={handleSave} 
                        style={{background: '#2563EB', borderColor: '#2563EB'  }}
                    >
                        Save Note
                    </Button>
                    <Button onClick={handleCancel} >Cancel</Button>
                </div>
            </>
        )}
    </Modal>
  )
}
