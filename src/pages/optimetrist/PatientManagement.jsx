import { Button, Card, Col, Input, Modal, Popconfirm, Row, Tag } from "antd";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import TextArea from "antd/es/input/TextArea";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { parse } from "graphql";

function PatientManagement() {

    const [openModal, setOpenModal] = useState(false);
    const [selectedpatient, setSelectedPatient] = useState(null);
    const [patientData, setPatientData] = useState([]);

    const [prescriptionDetails, setPrescriptionDetails] = useState({
        remarks: "",
        rightEyeSph: null,
        leftEyeSph: null,
        rightEyeCyl: null,
        leftEyeCyl: null,
        rightEyeAxis: null,
        leftEyeAxis: null,
        rightEyeAdd: null,
        leftEyeAdd: null,
        pupillaryDistance: null
    });

    const setValue = (field, value) => {
        setPrescriptionDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };



    const patientColumns = [
        {
            title: 'Patient ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Patient',
            render: (_, record) => {
                const customer = record?.session_attend_customer?.customer_has_branch?.customer;
                // console.log("Customer Data for Record:", record, "Extracted Customer:", customer);
                return customer ? `${customer.first_name} ${customer.last_name || ''}` : 'N/A';
            }
        },
        {
            title: 'Phone',
            render: (_, record) =>
                record.session_attend_customer?.customer_has_branch?.customer?.contact_no || 'N/A',

        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleDateString().split("T")[0],
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                        icon={<EditOutlined />}
                        onClick={() => { setOpenModal(true); setSelectedPatient(record); }}
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


    // load patient query
    const LOAD_PATIENT_DATA = gql`

        query LoadPatientData($startDate: Datetime, $endDate: Datetime) {
            prescriptionCollection(filter: { 
                created_at: { 
                    gte: $startDate,
                    lt: $endDate
                 } 
                }) {
                edges {
                    node{
                        id
                        created_at
                        session_attend_customer{
                            id
                            customer_has_branch{
                                customer{
                                    id
                                    first_name
                                    last_name
                                    contact_no
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    const [loadPatientData, { data, loading, error }] = useLazyQuery(LOAD_PATIENT_DATA);


    // load prescription query
    const LOAD_PRESCRIPTION_DATA = gql`

        query LoadPrescriptionData($startDate: Datetime, $endDate: Datetime, $patientId: ID) {
            prescriptionCollection(filter: { 
                created_at: { 
                    gte: $startDate,
                    lt: $endDate
                },
                session_attend_customer_id:{
                    eq: $patientId
                } 
                }) {
                edges {
                    node{
                        id
                        remarks
                        created_at
                        right_sph
                        right_cyl
                        right_axis
                        right_add
                        left_sph
                        left_cyl
                        left_axis
                        left_add
                        pupillary_distance
                    }
                }
            }
        }
    `;
    const [loadPrescriptionData, { data: prescriptionData }] = useLazyQuery(LOAD_PRESCRIPTION_DATA);


    // update prescription
    const UPDATE_PRESCRIPTION = gql`
    
        mutation UpdatePrescription(
            $id: ID!, $remarks: String, 
            $rightSph: Float, $rightCyl: Float, $rightAxis: Float, $rightAdd: Float, 
            $leftSph: Float, $leftCyl: Float, $leftAxis: Float, $leftAdd: Float, 
            $pupillaryDistance: Float
        ) {
            updateprescriptionCollection(
                filter: {id:{eq: $id}},
                atMost: 1,
                set: {
                    remarks: $remarks,
                    right_sph: $rightSph,
                    right_cyl: $rightCyl,
                    right_axis: $rightAxis,
                    right_add: $rightAdd,
                    left_sph: $leftSph,
                    left_cyl: $leftCyl,
                    left_axis: $leftAxis,
                    left_add: $leftAdd,
                    pupillary_distance: $pupillaryDistance
                }
            ){
                affectedCount
                records {
                    id
                }
            }
        }

    `;
    const [updatePrescription, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_PRESCRIPTION);

    const updatePrescriptionHandler = () => {

        if (
            prescriptionDetails.rightEyeSph === null ||
            prescriptionDetails.leftEyeSph === null ||
            prescriptionDetails.rightEyeCyl === null ||
            prescriptionDetails.leftEyeCyl === null ||
            prescriptionDetails.rightEyeAxis === null ||
            prescriptionDetails.leftEyeAxis === null ||
            prescriptionDetails.pupillaryDistance === null
        ) {
            alert("Please fill all required fields.");
            return;
        }

        // console.log("Updating Prescription with Details:", prescriptionData?.prescriptionCollection?.edges[0]?.node?.id);
        const id = Number(prescriptionData?.prescriptionCollection?.edges[0]?.node?.id);
        const remarks = prescriptionDetails.remarks || "";
        const rightSph = parseFloat(prescriptionDetails.rightEyeSph);
        const rightCyl = parseFloat(prescriptionDetails.rightEyeCyl);
        const rightAxis = parseFloat(prescriptionDetails.rightEyeAxis);
        const rightAdd = parseFloat(prescriptionDetails.rightEyeAdd);
        const leftSph = parseFloat(prescriptionDetails.leftEyeSph);
        const leftCyl = parseFloat(prescriptionDetails.leftEyeCyl);
        const leftAxis = parseFloat(prescriptionDetails.leftEyeAxis);
        const leftAdd = parseFloat(prescriptionDetails.leftEyeAdd);
        const pupillaryDistance = parseFloat(prescriptionDetails.pupillaryDistance);

        // console.log("Parsed Prescription Details:", {
        //     id,
        //     remarks,
        //     rightSph,
        //     rightCyl,
        //     rightAxis,
        //     rightAdd,
        //     leftSph,
        //     leftCyl,
        //     leftAxis,
        //     leftAdd,
        //     pupillaryDistance
        // });


        updatePrescription({
            variables: {
                id,
                remarks,
                rightSph,
                rightCyl,
                rightAxis,
                rightAdd,
                leftSph,
                leftCyl,
                leftAxis,
                leftAdd,
                pupillaryDistance
            }
        });
    }

    // console.log("Prescription Update Result:", { updateLoading, updateError });

    const now = new Date();
    const startDate = new Date(now.setUTCHours(0, 0, 0, 0)).toISOString();
    const endDate = new Date(now.setUTCDate(now.getUTCDate() + 1)).toISOString();

    // load patients to the table
    useEffect(() => {

        loadPatientData({
            variables: { startDate, endDate }
        });


    }, [loadPatientData, startDate, endDate]);

    useEffect(() => {

        if (data?.prescriptionCollection.edges.length > 0) {
            const transformedData = data?.prescriptionCollection.edges.map(edge => edge.node);

            setPatientData(transformedData);
        }

    }, [data]);


    // load prescription data to the edit modal
    useEffect(() => {

        // console.log("selectedpatient:", selectedpatient?.session_attend_customer?.id);

        if (openModal && selectedpatient) {
            loadPrescriptionData({
                variables: { startDate, endDate, patientId: selectedpatient.session_attend_customer.id }
            });
        }
    }, [loadPrescriptionData, startDate, endDate, openModal, selectedpatient]);

    useEffect(() => {

        const node = prescriptionData?.prescriptionCollection?.edges[0]?.node;
        if (node) {
            setPrescriptionDetails({
                remarks: node.remarks || "",
                rightEyeSph: node.right_sph,
                leftEyeSph: node.left_sph,
                rightEyeCyl: node.right_cyl,
                leftEyeCyl: node.left_cyl,
                rightEyeAxis: node.right_axis,
                leftEyeAxis: node.left_axis,
                rightEyeAdd: node.right_add,
                leftEyeAdd: node.left_add,
                pupillaryDistance: node.pupillary_distance
            });
        }

    }, [prescriptionData])


    // console.log("prescriptionData:", prescriptionData)

    return (
        <>
            <Col className="mx-5">
                <Content className="mt-5 h-[calc(100vh-10.5vh)] overflow-y-auto pr-2">
                    <Row className="mt-10 ">
                        <Card title="Recent Patients" className="w-full" extra={
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => {
                                    loadPatientData({
                                        variables: { startDate, endDate }
                                    });
                                }}
                                loading={loading}
                            >
                                Reload
                            </Button>
                        }>
                            <CustomTable data={patientData} columns={patientColumns} pageSize={10} />
                        </Card>
                    </Row>
                </Content>
            </Col>

            {/* {console.log("prescriptionData:", prescriptionData)} */}

            {/* edit modal */}
            <Modal
                centered
                open={openModal}
                onOk={() => { updatePrescriptionHandler(); setOpenModal(false); }}
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
                                <Input placeholder="Sphere (SPH)" value={prescriptionDetails.rightEyeSph} onChange={(e) => setValue("rightEyeSph", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" value={prescriptionDetails.rightEyeCyl} onChange={(e) => setValue("rightEyeCyl", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" value={prescriptionDetails.rightEyeAxis} onChange={(e) => setValue("rightEyeAxis", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" value={prescriptionDetails.rightEyeAdd} onChange={(e) => setValue("rightEyeAdd", e.target.value)} />
                            </Col>
                        </Row>

                        <p className="fs-5 font-semibold mt-10 mb-2">Left Eye (OS)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" value={prescriptionDetails.leftEyeSph} onChange={(e) => setValue("leftEyeSph", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" value={prescriptionDetails.leftEyeCyl} onChange={(e) => setValue("leftEyeCyl", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" value={prescriptionDetails.leftEyeAxis} onChange={(e) => setValue("leftEyeAxis", e.target.value)} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" value={prescriptionDetails.leftEyeAdd} onChange={(e) => setValue("leftEyeAdd", e.target.value)} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <p className="fs-5 font-semibold mt-10 mb-2">
                                    Pupillary Distance (PD)
                                </p>
                                <Input placeholder="Pupillary Distance (PD)" value={prescriptionDetails.pupillaryDistance} onChange={(e) => setValue("pupillaryDistance", e.target.value)} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea rows={4} value={prescriptionDetails.remarks} onChange={(e) => setValue("remarks", e.target.value)} />
                            </Col>
                        </Row>
                    </Col>

                </Card>
            </Modal>

        </>
    );
}

export default PatientManagement;