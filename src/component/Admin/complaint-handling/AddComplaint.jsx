import React from 'react'
import {Modal, Form, Input} from 'antd'

const {TextArea} = Input;

export default function AddComplaint({open, onCancel, onAdd}) {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
        const values = await form.validateFields();
        await onAdd(values);
        form.resetFields(); // Clear the form after successful submission
    } catch (error) {
        console.error("Validation or submission error:", error);
    }
  };

  return (
    <Modal
      title="Add Complaint"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Add"
    >
      <Form layout='vertical' form={form}>
        <Form.Item 
            name="orderID"
            label="Order ID" 
            rules={[
              { required: true, message: "Please enter the Order ID" },
              { pattern: /^[0-9]+$/, message: "Order ID must be a number" }
            ]}>
          <Input placeholder='Enter valid Order ID'/>
        </Form.Item>
        <Form.Item name="complaint" label="Complaint" rules={[{required: true, message: "Please enter the complaint" }]}>
          <TextArea rows={3} /> 
        </Form.Item>
      </Form>
      
    </Modal>
  )
}
