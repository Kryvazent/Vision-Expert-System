import { Button, Card, Col, Input, Modal, Popconfirm, Row, Tag } from "antd";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

function PatientManagement() {

    const [openModal, setOpenModal] = useState(false);
    const [selectedpatient, setSelectedPatient] = useState(null);

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

    const patientColumns = [
        {
            title: 'Patient ID',
            dataIndex: 'orderId',
            key: 'orderId',
        },
        {
            title: 'Patient',
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
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: () => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                        icon={<EditOutlined />}
                        onClick={(record) => { setOpenModal(true); setSelectedPatient(record); }}
                    >
                    </Button>

                    <Popconfirm
                        title="Delete the Prescription"
                        description="Are you sure to delete this patient prescription?"
                        onConfirm={confirm}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />}>
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const LOAD_PRESCRIPTION_DATA = gql`
    
        query LoadPrescriptionData($patientId: ID!) {

            prescription(filter: { session_attend_customer_id: { eq: $patientId } }) {
                edges {
                    node{
                        id
                        remarks
                        created_at
                        session_attend_customer_id
                        right_eye_sph
                        right_eye_cyl
                        right_eye_axis
                        right_eye_add
                        left_eye_sph
                        left_eye_cyl
                        left_eye_axis
                        left_eye_add
                        pupillary_distance
                    }
                }
            }
        }
    `;
    const [loadPrescriptionData, { data, loading, error }] = useLazyQuery(LOAD_PRESCRIPTION_DATA);



    useEffect(() => {
        if (openModal && selectedpatient) {
            loadPrescriptionData({
                variables: { patientId: selectedpatient.id }
            });
        }
    }, [openModal, selectedpatient, loadPrescriptionData]);

    useEffect(() => {
        console.log("Prescription data loaded:", data);
    }, [data]);

    return (
        <>
            <Col className="mx-5">
                <Content className="mt-5 h-[calc(100vh-10.5vh)] overflow-y-auto pr-2">
                    <Row className="mt-10 ">
                        <Card title="Recent Patients" className="w-full">
                            <CustomTable data={patientData} columns={patientColumns} pageSize={10} />
                        </Card>
                    </Row>
                </Content>
            </Col>

            {/* edit modal */}
            <Modal
                centered
                open={openModal}
                onOk={() => setOpenModal(false)}
                onCancel={() => setOpenModal(false)}
                width={'50vw'}
                closeIcon={null}
            >

                <Card title="Update Patient Prescription" className="w-full" >

                    <Col span={24}>
                        <p className="fs-5 font-semibold mb-2">Right Eye (OD)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" />
                            </Col>
                        </Row>

                        <p className="fs-5 font-semibold mt-10 mb-2">Left Eye (OS)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <p className="fs-5 font-semibold mt-10 mb-2">
                                    Pupillary Distance (PD)
                                </p>
                                <Input placeholder="Pupillary Distance (PD)" />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea rows={4} />
                            </Col>
                        </Row>
                    </Col>

                </Card>
            </Modal>

        </>
    );
}

export default PatientManagement;