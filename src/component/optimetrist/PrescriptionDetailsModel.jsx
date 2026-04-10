import { Button, Card, Col, Modal, Row, Table, Tag } from "antd";

function PrescriptionDetailsModel({ showPrescriptionDetailModal, setShowPrescriptionDetailModal }) {

    const statusColors = {
        Approved: 'green'
    };

    const prescriptionData = [
        {
            key: '1',
            category: 'Sphere (SPH)',
            rightEye: 'SPH -2.00, CYL -0.50, AXIS 180',
            leftEye: 'SPH -1.50, CYL -0.25, AXIS 170'
        },
        {
            key: '2',
            category: 'Cylinder (CYL)',
            rightEye: '-0.50',
            leftEye: '-0.25'
        },
        {
            key: '3',
            category: 'Axis',
            rightEye: '180',
            leftEye: '170'
        },
        {
            key: '4',
            category: 'Add',
            rightEye: '+2.00',
            leftEye: '+2.00'
        }
    ]

    const prescriptionColumns = [
        {
            title: "",
            dataIndex: "category",
            key: "category",
            render: (text) => <p className="font-semibold">{text}</p>
        },
        {
            title: "Right Eye (OD)",
            dataIndex: "rightEye",
            key: "rightEye"
        },
        {
            title: "Left Eye (OS)",
            dataIndex: "leftEye",
            key: "leftEye"
        }
    ]

    return (
        <Modal
            open={showPrescriptionDetailModal}
            title="Prescription Details - RX001"
            centered={true}
            width={'50vw'}
            onCancel={() => setShowPrescriptionDetailModal(false)}
            footer={[
                <Button key="cancel" onClick={() => setShowPrescriptionDetailModal(false)}>
                    Cancel
                </Button>
            ]}
        >

            <Col>
                <Row >
                    <Card className="w-full">
                        <Row>
                            <Col span={10}>
                                <p className="text-neutral-400">Customer Name</p>
                                <p className="font-bold text-sm">Mike</p>
                            </Col>

                            <Col span={7}>
                                <p className="text-neutral-400">Date</p>
                                <p className="font-bold text-sm">2023-01-01</p>
                            </Col>

                            <Col span={7}>
                                <p className="text-neutral-400">Status</p>
                                <Tag color={statusColors['Approved']}>Approved</Tag>
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col span={10}>
                                <p className="text-neutral-400">Optimetrist</p>
                                <p className="font-bold text-sm">Dr. Smith</p>
                            </Col>
                            <Col>
                                <p className="text-neutral-400">Pupillary Distance (PD)</p>
                                <p className="font-bold text-sm">62 mm</p>
                            </Col>
                        </Row>
                    </Card>
                </Row>
                <Row className="mt-5">

                    <p>Eye Measurements</p>
                    <Table
                        dataSource={prescriptionData}
                        columns={prescriptionColumns}
                        pagination={false}
                        className="w-full mt-3"
                        bordered
                    />

                </Row>
                <Row className="mt-5">
                    <Card className="w-full">
                        <p className="text-neutral-400">Notes</p>
                        <p className="text-sm">Progressive lenses recommended</p>
                    </Card>
                </Row>
            </Col>
        </Modal>
    )
}

export default PrescriptionDetailsModel