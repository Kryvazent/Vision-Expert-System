import { Button, Card, Col, Input, Modal, Popconfirm, Row } from "antd";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState, useRef } from "react";
import TextArea from "antd/es/input/TextArea";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";

const LOAD_PATIENT_DATA = gql`
    query LoadPatientData {
        prescriptionCollection {
            edges {
                node {
                    id
                    created_at
                    remarks
                    right_sph
                    right_cyl
                    right_axis
                    right_add
                    left_sph
                    left_cyl
                    left_axis
                    left_add
                    pupillary_distance
                    clinic_attend_customer {
                        id
                        customer_has_branch {
                            customer {
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

const UPDATE_PRESCRIPTION = gql`
    mutation UpdatePrescription(
        $id: ID!, 
        $remarks: String,
        $rightSph: Float, $rightCyl: Float, $rightAxis: Float, $rightAdd: Float,
        $leftSph: Float, $leftCyl: Float, $leftAxis: Float, $leftAdd: Float,
        $pupillaryDistance: Float
    ) {
        updateprescriptionCollection(
            filter: { id: { eq: $id } },
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
        ) {
            affectedCount
            records { id }
        }
    }
`;

const DELETE_PRESCRIPTION = gql`
    mutation DeletePrescription($id: ID!) {
        deleteFromprescriptionCollection(
            filter: { id: { eq: $id } },
            atMost: 1
        ) {
            affectedCount
        }
    }
`;

function PatientManagement() {

    const [openModal, setOpenModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const [prescriptionDetails, setPrescriptionDetails] = useState({
        remarks: "",
        rightEyeSph: "",
        leftEyeSph: "",
        rightEyeCyl: "",
        leftEyeCyl: "",
        rightEyeAxis: "",
        leftEyeAxis: "",
        rightEyeAdd: "",
        leftEyeAdd: "",
        pupillaryDistance: ""
    });

    const setValue = (field, value) => {
        setPrescriptionDetails(prev => ({ ...prev, [field]: value }));
    };

    // ========================= QUERIES =========================

    const [loadPatientData, { data: patientRawData, loading, error }] = useLazyQuery(
        LOAD_PATIENT_DATA,
        { fetchPolicy: "network-only" }
    );

    // ========================= MUTATIONS =========================

    const [updatePrescription, { loading: updateLoading }] = useMutation(UPDATE_PRESCRIPTION);
    const [deletePrescription, { loading: deleteLoading }] = useMutation(DELETE_PRESCRIPTION);

    // ========================= DERIVED DATA =========================

    // Derive table data directly from query result — no separate state needed
    const patientData = patientRawData?.prescriptionCollection?.edges?.map(edge => edge.node) || [];

    // ========================= EFFECTS =========================

    useEffect(() => {
        loadPatientData();
    }, []);

    // When a patient is selected for editing, populate the form
    useEffect(() => {
        if (openModal && selectedPatient) {
            setPrescriptionDetails({
                remarks: selectedPatient.remarks || "",
                rightEyeSph: selectedPatient.right_sph ?? "",
                leftEyeSph: selectedPatient.left_sph ?? "",
                rightEyeCyl: selectedPatient.right_cyl ?? "",
                leftEyeCyl: selectedPatient.left_cyl ?? "",
                rightEyeAxis: selectedPatient.right_axis ?? "",
                leftEyeAxis: selectedPatient.left_axis ?? "",
                rightEyeAdd: selectedPatient.right_add ?? "",
                leftEyeAdd: selectedPatient.left_add ?? "",
                pupillaryDistance: selectedPatient.pupillary_distance ?? ""
            });
        }
    }, [openModal, selectedPatient]);

    // ========================= HANDLERS =========================

    const handleDelete = async (record) => {
        try {
            await deletePrescription({
                variables: { id: record.id }
            });
            // Refetch after delete
            loadPatientData();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Error deleting prescription.");
        }
    };

    const handleUpdate = async () => {
        if (
            !prescriptionDetails.rightEyeSph ||
            !prescriptionDetails.leftEyeSph ||
            !prescriptionDetails.rightEyeCyl ||
            !prescriptionDetails.leftEyeCyl ||
            !prescriptionDetails.rightEyeAxis ||
            !prescriptionDetails.leftEyeAxis ||
            !prescriptionDetails.pupillaryDistance
        ) {
            alert("Please fill all required fields.");
            return;
        }

        try {
            await updatePrescription({
                variables: {
                    id: selectedPatient.id,
                    remarks: prescriptionDetails.remarks || "",
                    rightSph: parseFloat(prescriptionDetails.rightEyeSph),
                    rightCyl: parseFloat(prescriptionDetails.rightEyeCyl),
                    rightAxis: parseFloat(prescriptionDetails.rightEyeAxis),
                    rightAdd: parseFloat(prescriptionDetails.rightEyeAdd) || 0,
                    leftSph: parseFloat(prescriptionDetails.leftEyeSph),
                    leftCyl: parseFloat(prescriptionDetails.leftEyeCyl),
                    leftAxis: parseFloat(prescriptionDetails.leftEyeAxis),
                    leftAdd: parseFloat(prescriptionDetails.leftEyeAdd) || 0,
                    pupillaryDistance: parseFloat(prescriptionDetails.pupillaryDistance),
                }
            });

            // Refetch after update
            loadPatientData();
            setOpenModal(false);
            setSelectedPatient(null);
            alert("Prescription updated successfully!");

        } catch (err) {
            console.error("Update error:", err);
            alert("Error updating prescription.");
        }
    };

    // ========================= COLUMNS =========================

    const patientColumns = [
        {
            title: 'Prescription ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Patient',
            render: (_, record) => {
                const customer = record?.clinic_attend_customer?.customer_has_branch?.customer;
                return customer
                    ? `${customer.first_name} ${customer.last_name || ''}`
                    : 'N/A';
            }
        },
        {
            title: 'Phone',
            render: (_, record) =>
                record?.clinic_attend_customer?.customer_has_branch?.customer?.contact_no || 'N/A',
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => text ? new Date(text).toLocaleDateString() : 'N/A',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#faad14", borderColor: "#faad14" }}
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedPatient(record);
                            setOpenModal(true);
                        }}
                    />

                    <Popconfirm
                        title="Delete the Prescription"
                        description="Are you sure you want to delete this prescription?"
                        onConfirm={() => handleDelete(record)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<DeleteOutlined />}
                            loading={deleteLoading}
                        />
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // ========================= RENDER =========================

    // Debug: log to verify data is coming
    console.log("patientRawData:", patientRawData);
    console.log("patientData:", patientData);
    console.log("loading:", loading);
    console.log("error:", error);

    return (
        <>
            <Col className="mx-5">
                <Content className="mt-5 h-[calc(100vh-10.5vh)] overflow-y-auto pr-2">
                    <Row className="mt-10">
                        <Card
                            title="Recent Patients"
                            className="w-full"
                            extra={
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => loadPatientData()}
                                    loading={loading}
                                >
                                    Reload
                                </Button>
                            }
                        >
                            {/* Show error if any */}
                            {error && (
                                <p className="text-red-500 mb-3">
                                    Error loading data: {error.message}
                                </p>
                            )}

                            {/* Show empty state */}
                            {!loading && patientData.length === 0 && (
                                <p className="text-gray-400 text-center py-5">
                                    No prescriptions found.
                                </p>
                            )}

                            <CustomTable
                                data={patientData}
                                columns={patientColumns}
                                pageSize={10}
                                loading={loading}
                            />
                        </Card>
                    </Row>
                </Content>
            </Col>

            {/* Edit Modal */}
            <Modal
                centered
                open={openModal}
                onOk={handleUpdate}
                okText="Save Changes"
                confirmLoading={updateLoading}
                onCancel={() => {
                    setOpenModal(false);
                    setSelectedPatient(null);
                }}
                width="50vw"
                destroyOnClose
            >
                <Card title="Update Patient Prescription" className="w-full">
                    <Col span={24}>
                        <p className="fs-5 font-semibold mb-2">Right Eye (OD)</p>
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input
                                    placeholder="Sphere (SPH)"
                                    value={prescriptionDetails.rightEyeSph}
                                    onChange={(e) => setValue("rightEyeSph", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input
                                    placeholder="Cylinder (CYL)"
                                    value={prescriptionDetails.rightEyeCyl}
                                    onChange={(e) => setValue("rightEyeCyl", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input
                                    placeholder="Axis"
                                    value={prescriptionDetails.rightEyeAxis}
                                    onChange={(e) => setValue("rightEyeAxis", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input
                                    placeholder="Add"
                                    value={prescriptionDetails.rightEyeAdd}
                                    onChange={(e) => setValue("rightEyeAdd", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <p className="fs-5 font-semibold mt-10 mb-2">Left Eye (OS)</p>
                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input
                                    placeholder="Sphere (SPH)"
                                    value={prescriptionDetails.leftEyeSph}
                                    onChange={(e) => setValue("leftEyeSph", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input
                                    placeholder="Cylinder (CYL)"
                                    value={prescriptionDetails.leftEyeCyl}
                                    onChange={(e) => setValue("leftEyeCyl", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input
                                    placeholder="Axis"
                                    value={prescriptionDetails.leftEyeAxis}
                                    onChange={(e) => setValue("leftEyeAxis", e.target.value)}
                                />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input
                                    placeholder="Add"
                                    value={prescriptionDetails.leftEyeAdd}
                                    onChange={(e) => setValue("leftEyeAdd", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <p className="fs-5 font-semibold mt-10 mb-2">
                                    Pupillary Distance (PD)
                                </p>
                                <Input
                                    placeholder="Pupillary Distance (PD)"
                                    value={prescriptionDetails.pupillaryDistance}
                                    onChange={(e) => setValue("pupillaryDistance", e.target.value)}
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea
                                    rows={4}
                                    value={prescriptionDetails.remarks}
                                    onChange={(e) => setValue("remarks", e.target.value)}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Card>
            </Modal>
        </>
    );
}

export default PatientManagement;