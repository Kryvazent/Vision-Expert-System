import React, { useEffect } from 'react'
import { Modal, Form, Select, DatePicker, Input, InputNumber, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function RecordCashModal({ open, onCancel, onSubmit, cashTypeList = [], employeeList = [], clinicList = [] }) {
    const [form] = Form.useForm()

    useEffect(() => {
        if (open) {
            form.resetFields()
            form.setFieldsValue({ date: dayjs() })
        }
    }, [open])

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit({
                ...values,
                date: values.date.format('YYYY-MM-DD'),
            })
            form.resetFields()
        })
    }

    return (
        <Modal
            title={<span style={{ fontSize: 16, fontWeight: 600 }}>Record Cash Receipt</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
            centered
        >
            <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Cash Type <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="cashTypeId"
                        rules={[{ required: true, message: 'Please select cash type!' }]}
                    >
                        <Select
                            placeholder="Select type"
                            options={cashTypeList.map(ct => ({ label: ct.type, value: ct.id }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Date <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="date"
                        rules={[{ required: true, message: 'Please select date!' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabledDate={(d) => d && d < dayjs().startOf("day")} />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Employee (By) <span style={{ color: '#DC2626' }}>*</span></span>}
                    name="employeeId"
                    rules={[{ required: true, message: 'Please select employee!' }]}
                >
                    <Select
                        placeholder="Select employee"
                        showSearch
                        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                        options={employeeList.map(e => ({
                            label: `${e.name} (${e.roleLabel})`,
                            value: e.id,
                        }))}
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Clinic / Branch <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="branchId"
                        rules={[{ required: true, message: 'Please select clinic!' }]}
                    >
                        <Select
                            placeholder="Select clinic"
                            options={clinicList.map(c => ({ label: c.branch_name, value: c.id }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Amount (LKR) <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="amount"
                        rules={[{ required: true, message: 'Please enter amount!' }]}
                    >
                        <InputNumber placeholder="0" min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span style={{ fontWeight: 500 }}>Note (Optional)</span>}
                    name="note"
                >
                    <TextArea rows={3} placeholder="Add any note about this cash receipt..." />
                </Form.Item>
            </Form>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleSubmit}
                    style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8, fontWeight: 500 }}
                >
                    Record
                </Button>
            </div>
        </Modal>
    )
}
