import { Button, Card, Col, Row, Tag } from "antd";
import TopBar from "../../component/optimetrist/dashboard/TopBar";
import { Content } from "antd/es/layout/layout";
import PrescriptionDetailsModel from "../../component/optimetrist/dashboard/PrescriptionDetailsModel";
import { useState } from "react";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";

import person from "../../assets/icons/optimetrist/person.png";
// import person from "../../../assets/icons/optimetrist/person.png";
import prescription from "../../assets/icons/optimetrist/prescriptions.png";
import appointments from "../../assets/icons/optimetrist/appointment.png";
import { EyeOutlined } from "@ant-design/icons";

function OptimetristDashboard() {

    const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);

    const patientData = [
        {
            key: '1',
            orderId: '001',
            customer: 'Mike',
            phone: '123-456-7890',
            date: '2023-01-01',
            status: 'Active',
        },
        {
            key: '2',
            orderId: '002',
            customer: 'John',
            phone: '098-765-4321',
            date: '2023-01-02',
            status: 'Hold',
        },
    ];

    const statusColors = {
        Active: 'green',
        Hold: 'orange',
        Cancelled: 'red',
        Approved: 'green'
    };

    const patientColumns = [
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
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
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
    ];

    const prescriptionData = [
        {
            key: '1',
            id: 'RX001',
            customer: 'Mike',
            date: '2023-01-01',
            status: 'Approved',
        }
    ]
    const prescriptionColumns = [
        {
            title: 'RX ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
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
                        setShowPrescriptionDetailModal(true);
                    }
                    }
                >
                    View Details
                </Button>
            )
        }
    ]

    const topBar = [
        {
            title: "Today's Patients",
            value: 0,
            icon: person
        },
        {
            title: "New Prescriptions",
            value: 0,
            icon: prescription
        },
        {
            title: "Appointments",
            value: 0,
            icon: appointments
        },
    ]

    return (
        <>
            <Col className="mx-5">
                <Row>
                    <TopBar data={topBar} />
                </Row>

                <Content className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
                    <Row className="mt-10 ">
                        <Card title="Recent Patients" className="w-full">
                            <CustomTable data={patientData} columns={patientColumns} pageSize={10} />
                        </Card>
                    </Row>

                    <Row className="mt-10 ">
                        <Card title="Recent Prescriptions" className="w-full">
                            <CustomTable data={prescriptionData} columns={prescriptionColumns} pageSize={10} />
                        </Card>
                    </Row>
                </Content>
            </Col>

            <PrescriptionDetailsModel
                showPrescriptionDetailModal={showPrescriptionDetailModal}
                setShowPrescriptionDetailModal={setShowPrescriptionDetailModal}
            />
        </>
    )
}

export default OptimetristDashboard;