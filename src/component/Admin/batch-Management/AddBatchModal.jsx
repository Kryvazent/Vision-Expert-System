import React, { useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, InputNumber, message, DatePicker } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Option } = Select;

const BRANCH_CODES = {
    "Mahiyanganaya": "MAHI",
    "Nuwara Eliya": "NELI",
    "Kandy": "KAN",
    "Dambulla": "DMB",
  }
  
export default function AddBatchModal({ open, onClose, onAddBatch, branchList = [] }) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const today = new Date();
      const formattedDate = 
        String(today.getDate()).padStart(2, '0') +
        String(today.getMonth() + 1).padStart(2, '0') +
        today.getFullYear();

        const branchName = branchList.find(b => b.id === values.branchId)?.branch_name || ''
        const batchNumber =(BRANCH_CODES[branchName] || 'BR')  + formattedDate;      

        onAddBatch({
          batchNumber,
          branchId:  values.branchId,
          orderData: values.orderIDs || [],
        })

    
        form.resetFields()
        onClose()

    } catch (error) {
      console.error("Validation or submit error:", error);
      message.error("Please fill in all required fields.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Batch"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={handleSubmit}
      okText="Add Batch"
      confirmLoading={loading}
      width={600}
    >
      <Form layout="vertical" form={form}>

        <Form.Item
            name="branchId"
            label="Branch"
            rules={[{required: true,message: "Please select branch"}]}
          >
            <Select placeholder="Select Branch">
              {branchList.map(b => (
                <Option key={b.id} value={b.id}>{b.branch_name}</Option>
              ))}
            </Select>
          </Form.Item>

        {/* Dynamic Order List */}
        <Form.Item label="Orders in this Batch">
          <Form.List
            name="orderIDs"
            rules={[{
              validator: async (_, orderIDs) => {
                if (!orderIDs || orderIDs.length < 1) {
                  return Promise.reject(new Error('Add at least one order'));
                }
              }
            }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    {/* Order ID */}
                    <Form.Item
                      {...restField}
                      name={[name, 'orderID']}
                      rules={[{ required: true, message: "Enter Order ID" }]}
                    >
                      <Input placeholder="e.g. ORD-2026-0794" style={{ width: 200 }} />
                    </Form.Item>

                    {/* Placed Date */}
                    <Form.Item
                      {...restField}
                      name={[name, 'placedDate']}
                      label={<Text style={{ fontSize: 12 }}>Placed Date</Text>}
                      rules={[
                        { required: true, message: "Enter Placed Date" },
                      ]}
                      style={{ margin: 0, flex: 1 }}
                      getValueFromEvent={(date) => date ? date.format('YYYY-MM-DD') : null}
                    >
                      <DatePicker
                        style={{ width: '100%', borderRadius: 6 }}
                        placeholder="Select date"
                        format="YYYY-MM-DD"
                      />
                      
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                  </Space>
                ))}

                {/* Add Order button */}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                  >
                    Add Order
                  </Button>
                </Form.Item>  
                <Form.ErrorList errors={errors} />
  
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
}