import { Button, Card, Col, Collapse, Descriptions, Divider, Input, Modal, Popconfirm, Row } from "antd";
import { Content } from "antd/es/layout/layout";
import CustomTable from "../../component/optimetrist/dashboard/CustomTable";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useEffect, useState, Children } from "react";
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
                                nic
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
    const [openPrescriptionModal, setOpenPrescriptionModal] = useState(false);
    const [prescriptionList, setPrescriptionList] = useState([]);
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
    const nicList = [];
    const patientData = [];

    patientRawData?.prescriptionCollection?.edges?.forEach(edge => {

        let customerId = edge.node.clinic_attend_customer?.customer_has_branch?.customer?.id;
        let nic = edge.node.clinic_attend_customer?.customer_has_branch?.customer?.nic;
        let firstName = edge.node.clinic_attend_customer?.customer_has_branch?.customer.first_name;
        let lastName = edge.node.clinic_attend_customer?.customer_has_branch?.customer.last_name;
        let mobile = edge.node.clinic_attend_customer?.customer_has_branch?.customer.contact_no;

        let prescriptionId = edge.node.id;

        let leftAdd = edge.node.left_add ? parseFloat(edge.node.left_add) : 0;
        let rightAdd = edge.node.right_add ? parseFloat(edge.node.right_add) : 0;

        let leftAxis = edge.node.left_axis ? parseFloat(edge.node.left_axis) : 0;
        let rightAxis = edge.node.right_axis ? parseFloat(edge.node.right_axis) : 0;

        let leftCyl = edge.node.left_cyl ? parseFloat(edge.node.left_cyl) : 0;
        let rightCyl = edge.node.right_cyl ? parseFloat(edge.node.right_cyl) : 0;

        let leftSph = edge.node.left_sph ? parseFloat(edge.node.left_sph) : 0;
        let rightSph = edge.node.right_sph ? parseFloat(edge.node.right_sph) : 0;

        let pupillaryDistance = edge.node.pupillary_distance
            ? parseFloat(edge.node.pupillary_distance)
            : 0;

        let remarks = edge.node.remarks || "";

        let createdAtDate = new Date(edge.node.created_at);

        let createdAt = createdAtDate.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        // 3 MINUTE
        let canEditOrDelete = new Date().getTime() - createdAtDate.getTime() < 3 * 60 * 1000;

        const prescriptionChildren = (
            <div>

                <Divider orientation="left">
                    General Details
                </Divider>

                <Descriptions
                    bordered
                    column={1}
                    size="small"
                >
                    <Descriptions.Item label="Prescription ID">
                        {prescriptionId}
                    </Descriptions.Item>

                    <Descriptions.Item label="Created At">
                        {createdAt}
                    </Descriptions.Item>

                    <Descriptions.Item label="Pupillary Distance">
                        {pupillaryDistance}
                    </Descriptions.Item>

                    <Descriptions.Item label="Remarks">
                        {remarks}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">
                    Right Eye
                </Divider>

                <Descriptions
                    bordered
                    column={4}
                    size="small"
                >
                    <Descriptions.Item label="SPH">
                        {rightSph}
                    </Descriptions.Item>

                    <Descriptions.Item label="CYL">
                        {rightCyl}
                    </Descriptions.Item>

                    <Descriptions.Item label="AXIS">
                        {rightAxis}
                    </Descriptions.Item>

                    <Descriptions.Item label="ADD">
                        {rightAdd}
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="left">
                    Left Eye
                </Divider>

                <Descriptions
                    bordered
                    column={4}
                    size="small"
                >
                    <Descriptions.Item label="SPH">
                        {leftSph}
                    </Descriptions.Item>

                    <Descriptions.Item label="CYL">
                        {leftCyl}
                    </Descriptions.Item>

                    <Descriptions.Item label="AXIS">
                        {leftAxis}
                    </Descriptions.Item>

                    <Descriptions.Item label="ADD">
                        {leftAdd}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                {canEditOrDelete ? (
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            style={{
                                backgroundColor: "#faad14",
                                borderColor: "#faad14"
                            }}
                            icon={<EditOutlined />}
                            onClick={() => {
                                setSelectedPatient({
                                    id: prescriptionId,
                                    remarks,
                                    right_sph: rightSph,
                                    left_sph: leftSph,
                                    right_cyl: rightCyl,
                                    left_cyl: leftCyl,
                                    right_axis: rightAxis,
                                    left_axis: leftAxis,
                                    right_add: rightAdd,
                                    left_add: leftAdd,
                                    pupillary_distance: pupillaryDistance
                                });
                                setPrescriptionDetails({
                                    remarks,
                                    rightEyeSph: rightSph,
                                    leftEyeSph: leftSph,
                                    rightEyeCyl: rightCyl,
                                    leftEyeCyl: leftCyl,
                                    rightEyeAxis: rightAxis,
                                    leftEyeAxis: leftAxis,
                                    rightEyeAdd: rightAdd,
                                    leftEyeAdd: leftAdd,
                                    pupillaryDistance: pupillaryDistance
                                });
                                setOpenModal(true);
                                console.log("Selected patient for editing:", prescriptionDetails);
                            }}
                        />

                        <Popconfirm
                            title="Delete the Prescription"
                            description="Are you sure you want to delete this prescription?"
                            onConfirm={() => handleDelete(prescriptionId)}
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
                ) : (
                    <div className="text-red-500 text-sm">
                        Edit/Delete time expired (3 minutes passed)
                    </div>
                )}

            </div>
        );

        let prescriptionAdd = {
            id: prescriptionId,
            key: prescriptionId,
            label: `Prescription ${prescriptionId} - ${createdAt}`,
            children: prescriptionChildren
        };

        if (nicList.includes(nic)) {

            patientData.forEach(patient => {

                if (patient.nic === nic) {
                    patient.prescriptionList.push(prescriptionAdd);
                }
            });

        } else {

            let rowData = {
                id: customerId,
                nic: nic,
                firstName: firstName,
                lastName: lastName,
                mobile: mobile,
                prescriptionList: [prescriptionAdd]
            };

            patientData.push(rowData);
        }

        nicList.push(nic);
    });

    // ========================= EFFECTS =========================

    useEffect(() => {
        loadPatientData();
    }, [loadPatientData]);

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

    const handleDelete = async (id) => {
        try {
            await deletePrescription({
                variables: { id }
            });
            // Refetch after delete
            loadPatientData();
            setOpenPrescriptionModal(false);
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
            setOpenPrescriptionModal(false);

        } catch (err) {
            console.error("Update error:", err);
            alert("Error updating prescription.");
        }
    };

    // ========================= COLUMNS =========================

    const patientColumns = [
        {
            title: 'Customer ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Patient',
            render: (_, record) => {
                return record?.firstName || record?.lastName
                    ? `${record.firstName} ${record.lastName || ''}`
                    : 'N/A';
            }
        },
        {
            title: 'NIC',
            render: (_, record) => {
                return record?.nic || 'N/A';
            }
        },
        {
            title: 'Phone',
            render: (_, record) => record?.mobile || 'N/A'
        },
        {
            title: 'Number of Prescriptions',
            render: (_, record) => record?.prescriptionList?.length || 'N/A'
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button onClick={() => { showModal(record.prescriptionList) }}>View List</Button>
            ),
        },
    ];

    // ========================= RENDER =========================

    // Debug: log to verify data is coming
    console.log("patientRawData:", patientRawData);
    console.log("patientData:", patientData);
    console.log("loading:", loading);
    console.log("error:", error);


    const showModal = (prescriptionList) => {
        setPrescriptionList(prescriptionList);
        setOpenPrescriptionModal(true);
    }

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

            {/* Prescription list Modal */}
            <Modal
                styles={{
                    body: {
                        maxHeight: "85vh",
                        overflowY: "auto"
                    }
                }}
                centered
                open={openPrescriptionModal}
                onCancel={() => {
                    setOpenPrescriptionModal(false);
                }}
                onOk={() => {
                    setOpenPrescriptionModal(false);
                }}
                width="50vw"
                destroyOnClose
            >
                <Card title="Selected Patient's Prescriptions" className="w-full">
                    <Col span={24}>

                        <Collapse
                            accordion
                            items={prescriptionList}
                        />

                    </Col>
                </Card>
            </Modal>

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