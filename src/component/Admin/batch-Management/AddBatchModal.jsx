import React, { useEffect, useState } from 'react'
import { 
  Modal, 
  Form,  
  Select, 
  Button, 
  Space, 
  message, 
  DatePicker,
  Typography,
  Checkbox,  
} from 'antd'


const { Option } = Select;
const { Text } = Typography

const BRANCH_CODES = {
  "mahiyanganaya": "MAHI",
  "nuwaraeliya": "NELI",
  "nuwara-eliya": "NELI",
  "nuwara eliya": "NELI",
  "kandy": "KAN",
  "dambulla": "DMB",
}

const normalizeBranchName = (value = '') => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

const getBranchCode = (branchName = '') => {
  return BRANCH_CODES[normalizeBranchName(branchName)] || 'BR'
}

const buildBatchNumber = (branchName, branchId) => {
  const branchCode = getBranchCode(branchName)
  const today = new Date()
  const formattedDate = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear(),
  ].join('')
  const suffix = String(Date.now()).slice(-4)
  return `${branchCode}${formattedDate}${suffix}`
}

export default function AddBatchModal({ open, onClose, onAddBatch, branchList = [] , loadOrdersByBranchAndDate,}) {

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const [availableOrders, setAvailableOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setAvailableOrders([])
    }
  }, [open, form])

  const handleLoadOrders = async () => {
    try {
      const values = await form.validateFields(['branchId', 'placedDate'])
      const branchId = values.branchId
      const placedDate = values.placedDate?.format?.('YYYY-MM-DD')

      if (!branchId || !placedDate) return

      setLoadingOrders(true)
      setAvailableOrders([])

      const res = await loadOrdersByBranchAndDate({
        branchId,
        placedDate,
      })

      setAvailableOrders(Array.isArray(res) ? res : [])
    } catch (err) {
      if (err?.errorFields) {
        return
      }
      console.error(err)
      message.error('Failed to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const selectedOrders = values.selectedOrders || [];

      if (selectedOrders.length === 0) {
        message.error('Select at least one order')
        return
      }

  const formattedOrders = selectedOrders
    .map(orderId => availableOrders.find(o => o.id === orderId))
    .filter(Boolean)
    .map(order => ({
        orderID: order.orderID,
        placedDate: order.placedDate,
  }));

      const branchName =
        branchList.find(b => b.id === values.branchId)?.branch_name || '';

      const batchNumber = buildBatchNumber(branchName, values.branchId);

      onAddBatch({
        batchNumber,
        branchId: values.branchId,
        orderData: formattedOrders,
      });

      form.resetFields();
      setAvailableOrders([]);
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
            name="branchId"
            label="Branch"
            rules={[{required: true,message: "Please select branch"}]}
        >
            <Select placeholder="Select Branch"   onChange={handleLoadOrders} >
              {branchList.map(b => (
                <Option key={b.id} value={b.id}>{b.branch_name}</Option>
              ))}
            </Select>
        </Form.Item>

        <Form.Item
          name="placedDate"
          label="Order Placed Date"
          rules={[{ required: true, message: "Please select order placed date" }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <Button onClick={handleLoadOrders} loading={loadingOrders}>
            Load Orders
          </Button>
        </div>

        <Form.Item
          name="selectedOrders"
          label="Available Orders"
          rules={[{required: true, message: "Select at least one order"}]}    
        >
          <Checkbox.Group style={{ width: "100%" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {loadingOrders ? (
                <Text type="secondary">Loading orders...</Text>
              ) : availableOrders.length === 0 ? (
                <Text type="secondary">No orders found for the selected branch and date.</Text>
              ) : (
                availableOrders.map(order => (
                  <Checkbox key={order.id} value={order.id} disabled={!order.canForward}>
                    <div>
                      <b>{order.orderID}</b>
                        {"  |  "}
                        {order.customerName}
                        {"  |  "}
                        {order.placedDate}
                      <div style={{ color: order.canForward ? '#52c41a' : '#cf1322', fontSize: 12, marginTop: 2 }}>
                        {order.forwardReason}
                      </div>
                      {order.reminderStatus && (
                        <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                          Before lab: {order.reminderStatus}{order.reminderReason ? ` • ${order.reminderReason}` : ''}
                        </div>
                      )}
                      {order.deliveryStatus && (
                        <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>
                          Before delivery: {order.deliveryStatus}{order.deliveryReason ? ` • ${order.deliveryReason}` : ''}
                        </div>
                      )}
                    </div>
                  </Checkbox>
                ))
              )}
            </Space>
          </Checkbox.Group>
        </Form.Item>
        
      </Form>
    </Modal>
  );
}