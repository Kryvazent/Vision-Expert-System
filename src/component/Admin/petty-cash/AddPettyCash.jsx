import React, { useEffect } from 'react'
import {
    Modal,
    Form,
    Select,
    DatePicker,
    Input,
    InputNumber,
    Button,
    Row,
    Col,
} from 'antd'
import { PlusOutlined, SaveOutlined } from '@ant-design/icons'


const {TextArea} = Input;

const CATEGORY_OPTIONS = {
  Expense: [
    'Office Supplies',
    'Transportation',
    'Utilities',
    'Maintenance',
    'Refreshments',
    'Courier',
    'Printing',
    'Other',
  ],
  Replenishment: [
    'Cash Top-Up',
    'Bank Withdrawal',
    'Manager Deposit',
    'Other',
  ],
};

export default function AddPettyCash({open, onClose, onSave, initialValues = null}) {

    const [form] = Form.useForm();
    const transactionType = Form.useWatch('type', form) || 'Expense';

    useEffect(() => {
        if ( !open ) return;
        
        if ( initialValues ){
            form.setFieldsValue({
                type: initialValues.type || 'Expense',
                date: undefined,
                category: initialValues.category || undefined,
                description: initialValues.description || '',
                amount: initialValues.amount || null,
            });
        }else{
            const today = new Date().toISOString().split('T') [0];

            form.setFieldsValue({
                type: 'Expense',
                date: undefined,
                category: undefined,
                description: '',
                amount: null,
            });
        }
        
    },  [open, initialValues, form]);

    const handleTypeChange = () => {
        form.setFieldValue('category', undefined);
    };

    const handleFinish = (values) => {
        const formattedDate = values.date
        ? values.date.toDate().toISOString().split('T') [0]
        : new Date().toISOString().split('T') [0];
        
        const payload = {
            ...values,
            date: new Date().toISOString().split("T")[0],
            amount: Number(values.amount),
        };

        onSave(payload);
        form.resetFields();
        onClose();
    };

  return (
    <Modal 
        title = {initialValues ? 'Edit Petty Cash Transaction' : 'Add Petty Cash Transaction'}
        open = {open}
        onCancel={onClose}
        footer = {null}
        width={650}
        destroyOnClose
        centered
    >
        <Form
            form={form}
            layout='vertical'
            onFinish={handleFinish}
            requiredMark={false}
        >
        <Form.Item 
            label={<span><span style={{ color: 'red' }}>* </span>Transaction Type</span>}
            name='type'
            rules={[{required: true, message: 'Please select transaction type'}]}
        >
            <Select 
                placeholder="Selelct transaction type"
                onChange={handleTypeChange}
                options={[
                    {value: 'Expense', label: 'Expense',},
                    { value: 'Replenishment', label: 'Replenishment' }
                ]}
             />
        </Form.Item>
        <Form.Item
            label={<span><span style={{ color: 'red' }}>* </span>Date</span>}
            name = "date"
            rules={[{required:true,message: "Please select date"}]}
        >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" /> 
        </Form.Item>
        <Form.Item
            label={<span><span style={{ color: 'red' }}>* </span>Category</span>}
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
        >
            <Select 
                placeholder="Selelct category"
                options={CATEGORY_OPTIONS[transactionType].map((item) =>({
                    value: item,
                    label: item,
                }))}
            />
        </Form.Item>
        <Form.Item
            label={<span><span style={{ color: 'red' }}>* </span>Description</span>}
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
        >
            <TextArea rows={3} placeholder='"Enter transaction descriptions...' maxLength={300} showCount />
        </Form.Item>
        <Form.Item
            label={<span><span style={{ color: 'red' }}>* </span>Amount (LKR)</span>}
            name="amount"
            rules={[
                {required: true, message: 'Please enter amount'},
                {
                    validator: (_, value) => {
                        if (!value || value <= 0){
                            return Promise.reject(
                                new Error("Amount must be greater than zero")
                            );
                        }
                        return Promise.resolve();
                    },
                },
            ]}
        >
            <InputNumber 
                style={{width: '100%' }}
                placeholder="Enter amount"
                min={0}
                formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '' }
                parser={(value) => value.replace(/,/g, '')}
            />
        </Form.Item>
        <Row gutter={12}>
            <Col>
                <Button 
                    type="primary"
                    htmlType="submit"
                    icon={initialValues ? <SaveOutlined /> : <PlusOutlined />}
                    style={{borderRadius: 8}}
                >
                    {initialValues ? 'Update Transaction' : 'Add Transaction'}
                </Button>
            </Col>
            <Col>
                <Button onClick={onClose} style={{ borderRadius: 8 }}>
                    Cancel
                </Button>
            </Col>
        </Row>
    </Form>
</Modal>
  )
}
