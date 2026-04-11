import { Button, Card, Modal, Row, Space, Tag } from "antd";
import TopBar from "../../component/optimetrist/dashboard/TopBar";

import order from "../../assets/icons/sales-executive/order.png";
import active from "../../assets/icons/sales-executive/active-order.png";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { SpectacleVisualization } from "../../component/sales-executive/dashboard/SpectacleVisualization";

function SalesExecutiveDashboard() {

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const statusColors = {
    Active: 'green',
    Hold: 'orange',
    Cancelled: 'red',
    Approved: 'green'
  };

  const topBar = [
    {
      title: "New Orders",
      value: 0,
      icon: order
    },
    {
      title: "Active Orders",
      value: 0,
      icon: active
    },
  ]

  const orderData = [
    {
      key: '1',
      orderId: '001',
      customer: 'Mike',
      status: 'Active',

      //full prescription data
      id: 'RX-001',
      optometrist: 'Dr. Silva',
      customerName: 'Mike',
      date: '2026-04-11',
      pd: '62',
      notes: 'Wear full time',

      rightEye: {
        sphere: '-1.25',
        cylinder: '-0.50',
        axis: '90',
        add: '1.00'
      },
      leftEye: {
        sphere: '-1.00',
        cylinder: '-0.25',
        axis: '80',
        add: '1.00'
      }
    }
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status] || 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            if (!record) return;
            setSelectedPrescription(record);
            setShowPrescriptionModal(true);
          }
          }
        >
          View Details
        </Button>
      )
    },
  ]

  return (
    <>
      <div className="m-5">

        <Row>
          <TopBar data={topBar} />
        </Row>

        <Content className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
          <Row className="mt-10 ">
            <Card
              title="Recent Orders"
              className="w-full"
              extra={
                <Space>
                  <Button>View All Orders</Button>
                  <Button type="primary">New Order</Button>
                </Space>
              }
            >
              <CustomTable data={orderData} columns={orderColumns} pageSize={20} />
            </Card>
          </Row>
        </Content>

        <Modal
          title={null}
          open={showPrescriptionModal}
          onCancel={() => {
            setShowPrescriptionModal(false);
            setSelectedPrescription(null);
          }}
          footer={[
            <Button key="print" onClick={() => window.print()}>
              Print Prescription
            </Button>,
            <Button key="close" type="primary" onClick={() => setShowPrescriptionModal(false)}>
              Close
            </Button>
          ]}
          width={900}
          centered
          style={{ padding: 0 }}
        >
          {selectedPrescription && (
            <SpectacleVisualization prescription={selectedPrescription} />
          )}
        </Modal>
      </div>
    </>
  );
}

export default SalesExecutiveDashboard;