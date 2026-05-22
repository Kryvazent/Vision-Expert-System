import React, { useState } from 'react'
import { Modal, Form, Input, Select, Button, Space, InputNumber, message, DatePicker } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

const { Option } = Select;

export default function AddBatchModal({ open, onClose, onAddBatch }) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Build batch object matching your batches state structure
      const newBatch = {
        key: Date.now().toString(),           // temporary unique key
        batchNumber: values.batchNumber,
        orders: values.orderIDs?.length || 0,
        currentStatus: 'Pending Customer Confirmation', // always starts here
        historyData: {
          batchNumber: values.batchNumber,
          orders: values.orderIDs?.length || 0,
          currentStatus: 'Pending Customer Confirmation',
          currentStep: 0,                     // always starts at step 0
          orderData: values.orderIDs?.map((item, index) => ({
            key: String(index + 1),
            id: item.orderID,
            placed: item.placedDate,
            // all steps null on creation — not yet started
            step1: { intended: values.intendedDates?.step1 || null, actual: null },
            step2: { intended: values.intendedDates?.step2 || null, actual: null },
            step3: { intended: values.intendedDates?.step3 || null, actual: null },
            step4: { intended: values.intendedDates?.step4 || null, actual: null },
            step5: { intended: values.intendedDates?.step5 || null, actual: null },
            step6: { intended: values.intendedDates?.step6 || null, actual: null },
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

        {/* Batch Number */}
        <Form.Item
          name="batchNumber"
          label="Batch Number"
          rules={[{ required: true, message: "Please enter batch number" }]}
        >
          <Input placeholder="e.g. BATCH-2026-003" />
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

                    {/* Remove button */}
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: 'red', fontSize: 16 }}
                    />
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
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

         {/* Intended Dates for Steps when created */}
         <Form.Item label="Expected Step Dates (Intended)">

            <Form.Item name={['intendedDates', 'step1']} label="Pending Confirmation Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['expectedDates', 'step2']} label="Confirmations Completed Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['expectedDates', 'step3']} label="deliver to Lab Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['expectedDates', 'step4']} label="Received from Lab Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['expectedDates', 'step5']} label="Out for Delivery Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name={['expectedDates', 'step6']} label="Delivered Date">
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>

         </Form.Item>
      </Form>
    </Modal>
  );
}