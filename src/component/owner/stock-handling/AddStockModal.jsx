import React, { useEffect, useState }  from 'react'
import { Modal, Form, Input, Select, InputNumber, Button, Typography, Divider } from 'antd'
import { PlusOutlined, WarningOutlined } from '@ant-design/icons'

const {Text} = Typography

export default function AddStockModal({open, onCancel, onAdd, productTypeList=[],  branchList = [], supplierList = [],brandList=[]}) {
    const [form] = Form.useForm()
    const [addingNewCategory, setAddingNewCategory] = useState(false)

    useEffect(() => {
        if(open){
            form.resetFields();
            setAddingNewCategory(false)
        }
    },[open])

    const handleAdd = () => {
        form.validateFields().then((values) => {
            onAdd(values);
            form.resetFields()
        })
    }

    return (
        <Modal 
            title={
                <div  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlusOutlined style={{ color: '#1D4ED8' }} />
                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                        Add New Stock to Central Warehouse
                    </span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width={540}
            centered
        >
            <Form form={form} layout="vertical">
                {/* Row 1: Product Name + Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item 
                        label={<span style={{ fontWeight: 500 }}>Product Code <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="productCode"
                        rules={[{ required: true, message: 'Please enter product code!' }]}>
                        
                        <Input placeholder="e.g., FRM-CS-009" style={{ borderRadius: 8 }} />
                    </Form.Item>

                    <Form.Item 
                        label={<span style={{ fontWeight: 500 }}>Product Name <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="productName"
                        rules={[{ required: true, message: 'Please enter product name!' }]}>

                        <Input placeholder="e.g., Ray-Ban Aviator" style={{ borderRadius: 8 }} />    
                    </Form.Item>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Category <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="productTypeId"
                        rules={[{ required: !addingNewCategory, message: 'Please select a category!' }]}
                    >
                  
                        {!addingNewCategory ? (
                          <Select 
                              placeholder="Select category"
                              options={productTypeList.map((pt) => ({ label: pt.type, value: pt.id }))}
                              style={{ borderRadius: 8 }}
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  <div
                                    style={{ padding: '8px 12px', cursor: 'pointer', color: '#1D4ED8', fontWeight: 500 }}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => {
                                      setAddingNewCategory(true)
                                      form.setFieldValue('productTypeId', undefined)
                                    }}
                                  >
                                    +  Add new category
                                  </div>
                                </>
                              )}
                          />
                        ) : (
                        
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Form.Item name="newCategory" noStyle rules={[{ required: true, message: 'Enter category name!' }]}>
                              <Input placeholder="New category name e.g. ReadingGlasses" style={{ borderRadius: 8 }} />
                            </Form.Item>
                            <Button onClick={() => setAddingNewCategory(false)} style={{ borderRadius: 8 }}>Cancel</Button>
                          </div>
                        )}
                    </Form.Item>

                    {/* Row 2: Brand + Quantity */}
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Brand <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="brandId"
                        rules={[{ required: true, message: 'Please select brand!' }]}
                    >
                        <Select
                            placeholder="Select brand"
                            options={(brandList || []).map((b) => ({
                                label: b.brand,
                                value: b.id
                            }))}
                            style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
 
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Quantity <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="quantity"
                        rules={[{ required: true, message: 'Please enter quantity!' }]}
                    >
                        <InputNumber
                            placeholder="Enter quantity"
                            min={1}
                            style={{ width: '100%', borderRadius: 8 }}
                        />
                    </Form.Item>
                    
                {/* Row 3: Purchase Price + Selling Price */}
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Purchase Price (Rs.) <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="purchasePrice"
                        rules={[{ required: true, message: 'Please enter purchase price!' }]}
                    >
                        <InputNumber placeholder="Enter price" min={0} style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>

                     <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Selling Price (Rs.) <span style={{ color: '#DC2626' }}>*</span></span>}
                        name="sellingPrice"
                        rules={[{ required: true, message: 'Please enter selling price!' }]}
                    >
                        <InputNumber placeholder="e.g., 5000" min={0} style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>
                </div> 
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Warranty (Months)</span>}
                        name="warrantyMonths"
                    >
                        <InputNumber placeholder="e.g., 12 (0 if none)" min={0} style={{ width: '100%', borderRadius: 8 }} />
                    </Form.Item>
                </div>   

                     <Divider orientation="left" style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
                        Supplier Info (Optional)
                    </Divider>
 
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Supplier Name</span>}
                        name="supplierName"
                    >
                        {/*  Select existing suppliers or type new name */}
                        <Select
                          placeholder="Select or type supplier name"
                          showSearch
                          allowClear
                          mode="combobox"
                          options={supplierList.map(s => ({ label: s.name, value: s.name }))}
                          style={{ borderRadius: 8 }}
                        />
                    </Form.Item>
 
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Contact No.</span>}
                        name="supplierContact"
                    >
                        <Input placeholder="e.g., 0771234567" style={{ borderRadius: 8 }} />
                    </Form.Item>
                </div>
 
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Supplier Email</span>}
                        name="supplierEmail"
                    >
                        <Input placeholder="e.g., supplier@email.com" style={{ borderRadius: 8 }} />
                    </Form.Item>
 
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Supplier Address</span>}
                        name="supplierAddress"
                    >
                        <Input placeholder="e.g., Colombo 03" style={{ borderRadius: 8 }} />
                    </Form.Item>
                </div>
             </Form>
    
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button onClick={onCancel} style={{ borderRadius: 8 }}>Cancel</Button>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    style={{ background: '#1D4ED8', borderColor: '#1D4ED8', borderRadius: 8, fontWeight: 500 }}
                >
                    Add Stock
                </Button>
            </div>
        </Modal>
    )
}
