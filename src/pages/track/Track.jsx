import { useState } from 'react';
import { Card, Input, Button, Tag, Steps, Descriptions } from 'antd';
import { 
  EyeOutlined, 
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  CarOutlined 
} from '@ant-design/icons';

function Track (){

  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    // const foundOrder = orders.find(o => o.trackingId === trackingId || o.id === trackingId);
    // setOrder(foundOrder || null);
    // setSearched(true);
  };

  const getStatusStep = (status) => {
    const statusMap = {
      new: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
    };
    return statusMap[status] || 0;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card
          variant="borderless"
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <EyeOutlined style={{ fontSize: 32, color: 'white' }} />
            </div>
            <h1 className="text-2xl font-bold text-blue-600 mb-2">Vision Expert Opticals</h1>
            <p className="text-gray-600">Track Your Order</p>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              size="large"
              placeholder="Enter Tracking ID (e.g., VE-2024-001234)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" size="large" onClick={handleSearch}>
              Track Order
            </Button>
          </div>

          {searched && !order && (
            <div className="text-center py-8">
              <p className="text-gray-500">No order found with this tracking ID</p>
            </div>
          )}
        </Card>

        {order && (
          <div className="space-y-4">
            <Card
              title={`Order ${order.trackingId}`}
              variant="borderless"
              style={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: '12px',
              }}
              extra={
                <Tag color={order.status === 'delivered' ? 'green' : 'blue'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Tag>
              }
            >
              <Steps
                current={getStatusStep(order.status)}
                items={[
                  {
                    title: 'Order Placed',
                    description: order.orderDate,
                    icon: <ShoppingOutlined />,
                  },
                  {
                    title: 'Processing',
                    description: 'Preparing your spectacles',
                    icon: <ClockCircleOutlined />,
                  },
                  {
                    title: 'Shipped',
                    description: 'Out for delivery',
                    icon: <CarOutlined />,
                  },
                  {
                    title: 'Delivered',
                    description: order.deliveryDate,
                    icon: <CheckCircleOutlined />,
                  },
                ]}
              />
            </Card>

            <Card
              title="Order Details"
              variant="borderless"
              style={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: '12px',
              }}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Customer Name">{order.customerName}</Descriptions.Item>
                <Descriptions.Item label="Mobile">{order.customerMobile}</Descriptions.Item>
                <Descriptions.Item label="Delivery Address">{order.customerAddress}</Descriptions.Item>
                <Descriptions.Item label="Branch">{order.branch}</Descriptions.Item>
                <Descriptions.Item label="Order Date">{order.orderDate}</Descriptions.Item>
                <Descriptions.Item label="Expected Delivery">{order.deliveryDate}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card
              title="Payment Information"
              variant="borderless"
              style={{
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                borderRadius: '12px',
              }}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Total Amount">Rs. {order.totalAmount.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Advance Paid">Rs. {order.advancePaid.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  <span className={order.remainingAmount === 0 ? 'text-green-600' : 'text-red-600'}>
                    Rs. {order.remainingAmount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={order.paymentStatus === 'completed' ? 'green' : 'orange'}>
                    {order.paymentStatus.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {order.remainingAmount > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Remaining payment of Rs. {order.remainingAmount.toLocaleString()} must be completed before delivery.
                  </p>
                </div>
              )}
            </Card>

            <div className="text-center">
              <Button type="link" onClick={() => window.location.href = '/'}>
                Back to Login
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Track;