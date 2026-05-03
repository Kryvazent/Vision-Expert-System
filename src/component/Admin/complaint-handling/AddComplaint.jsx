import React from 'react'
import {Modal, Form, Input, DatePicker, Select} from 'antd'


const {Option} = Select;
const {TextArea} = Input;

export default function AddComplaint({open, onCancel, onAdd}) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const newComplaint = {
        key: Date.now().toString(),
        complaintID: `CMP-${Math.floor(Math.random() * 10000)}`,
        orderID: values.orderID,
        customer: values.customer,
        complaint: values.complaint,
        date: values.date.format("YYYY-MM-DD"),
        assignTo: values.assignTo || "Not Assign",
        status: "Pending"
       }
       onAdd(newComplaint)
       form.resetFields()
    })
  }

  return (
    <Modal
      title="Add Complaint"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Add"
    >
      <Form layout='vertical' form={form}>
        <Form.Item name="orderID" label="Order ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="complaint" label="Complaint" rules={[{required: true}]}>
          <TextArea rows={3} /> 
        </Form.Item>
        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="customer" label="Customer" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="assignTo" label="Assign To">
          <Select allowClear>
            <Option value="Sarah Johnson">Sarah Johnson</Option>
            <Option value="Admin">Admin</Option>
          </Select>
        </Form.Item>
      </Form>
      
    </Modal>
  )
}
