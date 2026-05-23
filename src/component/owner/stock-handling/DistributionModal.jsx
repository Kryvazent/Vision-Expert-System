import React, {useEffect} from 'react'
import { Modal, Form, Select, InputNumber, Input, Button, Typography, Tag } from 'antd'
import { SendOutlined, WarningOutlined } from '@ant-design/icons'

const {Text} = Typography
const {TextArea} = Input


export default function DistributionModal({open, product, branches = [], onCancel, onSubmit}) {
    const [form] = Form.useForm()

    useEffect(() => {
        if(open) form.resetFields()
    }, [open])

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            onSubmit(values)
            form.resetFields()
        })
    }

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SendOutlined style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: 16, fontWeight: 600 }}>Distribute Stock to Branch</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
            centered
        >   
            {/* Approval Warning */}
            <div style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
            }}>
                <WarningOutlined style={{ color: '#D97706', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                <div>
                    <Text strong style={{ color: '#92400E', fontSize: 13 }}>Manager Approval Required</Text>
                    <br />
                    <Text style={{ color: '#B45309', fontSize: 12 }}>
                        This distribution request will be sent to the manager for approval before stock is transferred to the branch.
                    </Text>
                </div>
            </div>

            {/* Product Info */}
            {product && (
                <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: '12px 16px',
                    marginBottom: 20,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px 16px',
                }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Stock ID</Text>
                        <br />
                        <Text strong style={{ fontFamily: 'monospace', color: '#374151' }}>{product.productCode}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Product Name</Text>
                        <br />
                        <Text strong>{product.productName}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Category</Text>
                        <br />
                        <span style={{
                            background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                            borderRadius: 6, padding: '1px 8px', fontSize: 12, fontWeight: 500,
                        }}>
                            {product.category}
                        </span>
                    </div>
                    <div>
                        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Available Stock</Text>
                        <br />
                        <span style={{background: '#059669', color: '#fff',borderRadius: 8, padding: '2px 10px',fontWeight: 700, fontSize: 13,}}>
                            {(product.stockQuantity ?? 0 )} units
                        </span>
                    </div>
                </div>    
            )}    
            {/* Form */}
            <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Destination Branch <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="branch"
                        rules={[{ required: true, message: 'Please select a branch!' }]}
                    >
                        <Select
                            placeholder="Select branch"
                            options={branches.map((b) => ({ label: `${b.branch_name}`, value: b.id }))}
                        />
                    </Form.Item>
 
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Quantity to Distribute <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="quantity"
                        rules={[
                            { required: true, message: 'Please enter quantity!' },
                            { type: 'number', min: 1, message: 'Quantity must be at least 1' },
                            {validator: (_, value) => {
                                if(value && product && value > (product.stockQuantity ?? 0)){
                                    return Promise.reject(`Cannot exceed available stock (${product.stockQuantity} units)`)
                                }
                                return Promise.resolve()
                            }}
                        ]}
                    >
                        <InputNumber placeholder="Enter quantity" style={{ width: '100%' }} min={1} max={product?.stockQuantity ?? undefined}/>
                    </Form.Item>
                </div>
 
                <Form.Item label={<span style={{ fontWeight: 500 }}>Notes (Optional)</span>}   name="notes" >
                        <TextArea
                            rows={3}
                            placeholder="Add any notes or reasons for this distribution request"
                            style={{ borderRadius: 8 }}
                        />
                </Form.Item>
            </Form>
 
            {/* Footer */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8, fontWeight: 500 }}
                >
                    Submit for Approval
                </Button>
            </div>
        </Modal>
    )
}

