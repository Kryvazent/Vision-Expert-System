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

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

export default function AddBatchModal({ open, onClose, onAddBatch }) {

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

        const batchNumber =BRANCH_CODES[values.branch] + formattedDate;

      // Build batch object matching your batches state structure
      const newBatch = {
        key: Date.now().toString(),           // temporary unique key
        batchNumber: batchNumber,
        branch: values.branch,
        orders: values.orderIDs?.length || 0,
        currentStatus: 'Delivered to the Lab', // always starts here
        historyData: {
          batchNumber: batchNumber,
          branch: values.branch,
          orders: values.orderIDs?.length || 0,
          currentStatus: 'Delivered to the Lab',
          currentStep: 2,                     // always starts at step 0
          orderData: values.orderIDs?.map((item, index) => ({
            key: String(index + 1),
            id: item.orderID,
            placed: item.placedDate,
            // all steps null on creation — not yet started
            step1: { intended: addDays(today, 0).toISOString().split('T')[0],actual: null,},
            step2: { intended: addDays(today, 1).toISOString().split('T')[0],actual: null  },
            step3: { intended: addDays(today, 2).toISOString().split('T')[0],actual: null },
            step4: { intended: addDays(today, 7).toISOString().split('T')[0],actual: null},
            step5: { intended: addDays(today, 9).toISOString().split('T')[0],actual: null },
            step6: { intended: addDays(today, 10).toISOString().split('T')[0],actual: null},
          })) || [],
          
          timeline: {
            step1: null,
            step2: null,
            step3: null,
            step4: null,
            step5: null,
            step6: null,
          }
        }
      };

      onAddBatch(newBatch);                        // pass to parent
      message.success(`${values.batchNumber} added successfully!`);
      form.resetFields();
      onClose();

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
            name="branch"
            label="Branch"
            rules={[{required: true,message: "Please select branch"}]}
          >
            <Select placeholder="Select Branch">
              <Option value="Mahiyanganaya">Mahiyanganaya</Option>
              <Option value="Nuwara Eliya">Nuwara Eliya</Option>
              <Option value="Kandy">Kandy</Option>
              <Option value="Dambulla">Dambulla</Option>
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
                      rules={[{ required: true, message: "Enter Placed Date" }]}
                    >
                      <Input placeholder="e.g. 2026-05-01" style={{ width: 180 }} />
                    </Form.Item>

                  
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