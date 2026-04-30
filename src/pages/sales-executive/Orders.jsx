import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Modal, Row } from "antd";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { useState } from "react";
import { SpectacleVisualization } from "../../component/sales-executive/dashboard/SpectacleVisualization";

function Orders() {

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);

    const columns = [
        {
            title: 'Order ID',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
        },
        {
            title: 'Order Status',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            key: 'paymentStatus',
        },
        {
            title: 'Total Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
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

                        // 🔥 Map order → prescription
                        const mappedPrescription = {
                            id: record.orderId,
                            optometrist: "Dr. Silva", // later from backend
                            customerName: record.customerName,
                            date: record.orderDate,
                            pd: record.pd || '62',
                            notes: record.notes || '',

                            rightEye: {
                                sphere: record.rightSphere || '-1.25',
                                cylinder: record.rightCylinder || '-0.50',
                                axis: record.rightAxis || '90',
                                add: record.rightAdd || '1.00'
                            },
                            leftEye: {
                                sphere: record.leftSphere || '-1.00',
                                cylinder: record.leftCylinder || '-0.25',
                                axis: record.leftAxis || '80',
                                add: record.leftAdd || '1.00'
                            }
                        };

                        setSelectedPrescription(mappedPrescription);
                        setShowPrescriptionModal(true);
                    }}
                >
                    View Prescription
                </Button>
            )
        }
    ]

    const data = [
        {
            key: '1',
            orderId: 'ORD001',
            customerName: 'Mike Johnson',
            mobile: '0771234567',
            orderDate: '2026-04-10',
            orderStatus: 'Active',
            paymentStatus: 'Paid',
            totalAmount: 'LKR 5,000',

            // 👁 Prescription Data
            optometrist: 'Dr. Silva',
            pd: '62',
            notes: 'Wear full time',

            rightSphere: '-1.25',
            rightCylinder: '-0.50',
            rightAxis: '90',
            rightAdd: '1.00',

            leftSphere: '-1.00',
            leftCylinder: '-0.25',
            leftAxis: '80',
            leftAdd: '1.00',
        },
        {
            key: '2',
            orderId: 'ORD002',
            customerName: 'Nimal Perera',
            mobile: '0719876543',
            orderDate: '2026-04-09',
            orderStatus: 'Completed',
            paymentStatus: 'Pending',
            totalAmount: 'LKR 7,500',

            optometrist: 'Dr. Perera',
            pd: '64',
            notes: 'For reading only',

            rightSphere: '-2.00',
            rightCylinder: '-0.75',
            rightAxis: '100',
            rightAdd: '1.50',

            leftSphere: '-1.75',
            leftCylinder: '-0.50',
            leftAxis: '95',
            leftAdd: '1.50',
        },
        {
            key: '3',
            orderId: 'ORD003',
            customerName: 'Kamal Silva',
            mobile: '0751122334',
            orderDate: '2026-04-08',
            orderStatus: 'Cancelled',
            paymentStatus: 'Refunded',
            totalAmount: 'LKR 4,200',

            optometrist: 'Dr. Fernando',
            pd: '60',
            notes: '',

            rightSphere: '-0.75',
            rightCylinder: '0.00',
            rightAxis: '0',
            rightAdd: '0.00',

            leftSphere: '-0.50',
            leftCylinder: '0.00',
            leftAxis: '0',
            leftAdd: '0.00',
        }
    ];

    return (
        <>
            <div className="m-5">
                <Card title="Orders">

                    <Row>
                        <Col span={10} className="mb-4">
                            <Input size="middle" placeholder="Search by Order ID, Customer Name or Mobile" prefix={<SearchOutlined />} />
                        </Col>
                    </Row>

                    <Row className="mt-2">
                        <CustomTable data={data} columns={columns} pageSize={20}/>
                    </Row>
                </Card>
            </div>

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
        </>
    )
}

export default Orders;