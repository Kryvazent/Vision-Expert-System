import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, Collapse, Divider, Input, Radio, Row, Select } from "antd";
import { useEffect, useState } from "react";
import ExistingPatientSearch from "../../component/optimetrist/new-prescription/ExistingPatientSearch";
import NewPatientAdd from "../../component/optimetrist/new-prescription/NewPatientAdd";
import TextArea from "antd/es/input/TextArea";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useAuth } from "../../const/functions";

function NewPrescription() {

    const { staff } = useAuth();

    const [position, setPosition] = useState("start");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);   // formerly sessionId
    const [selectedProject, setSelectedProject] = useState(null); // formerly selectedClinic

    // ========================= MUTATIONS =========================

    const ADD_NEW_PRESCRIPTION = gql`
        mutation AddNewPrescription(
            $remarks: String,
            $rightEyeSph: Float!,
            $leftEyeSph: Float!,
            $rightEyeCyl: Float!,
            $leftEyeCyl: Float!,
            $rightEyeAxis: Float!,
            $leftEyeAxis: Float!,
            $rightEyeAdd: Float!,
            $leftEyeAdd: Float!,
            $pupillaryDistance: Float!,
            $clinicAttendCustomerId: ID!
        ){
            insertIntoprescriptionCollection(
                objects:{
                    remarks: $remarks,
                    right_sph: $rightEyeSph,
                    left_sph: $leftEyeSph,
                    right_cyl: $rightEyeCyl,
                    left_cyl: $leftEyeCyl,
                    right_axis: $rightEyeAxis,
                    left_axis: $leftEyeAxis,
                    right_add: $rightEyeAdd,
                    left_add: $leftEyeAdd,
                    pupillary_distance: $pupillaryDistance,
                    clinic_attend_customer_id: $clinicAttendCustomerId
                }
            ){
                records{
                    id
                }
            }
        }
    `;

    const ADD_CUSTOMER_BRANCH = gql`
        mutation AddNewCustomerBranch($customerId: ID!, $branchId: ID!){
            insertIntocustomer_has_branchCollection(
                objects:{
                    customer_id: $customerId,
                    branch_id: $branchId
                }
            ){
                records{ id }
            }
        }
    `;

    const ADD_CLINIC_ATTEND_CUSTOMER = gql`
        mutation AddNewClinicAttendCustomer($customerHasBranchId: ID!, $clinicId: ID!){
            insertIntoclinic_attend_customerCollection(
                objects:{
                    customer_has_branch_id: $customerHasBranchId,
                    clinic_id: $clinicId
                }
            ){
                records{ id }
            }
        }
    `;

    const [addPrescription] = useMutation(ADD_NEW_PRESCRIPTION);
    const [addCustomerBranch] = useMutation(ADD_CUSTOMER_BRANCH);
    const [addClinicAttendCustomer] = useMutation(ADD_CLINIC_ATTEND_CUSTOMER);

    // ========================= QUERIES =========================

    const GET_CUSTOMER_BRANCH = gql`
        query GetCustomerBranch($customerId: ID!, $branchId: ID!) {
            customer_has_branchCollection(
                filter: { customer_id: { eq: $customerId }, branch_id: { eq: $branchId } }
            ) {
                edges { node { id } }
            }
        }
    `;

    const GET_CLINIC_ATTEND_CUSTOMER = gql`
        query GetClinicAttendCustomer($customerHasBranchId: ID!, $clinicId: ID!) {
            clinic_attend_customerCollection(
                filter: { customer_has_branch_id: { eq: $customerHasBranchId }, clinic_id: { eq: $clinicId } }
            ) {
                edges { node { id } }
            }
        }
    `;

    const GET_PROJECT = gql`
        query GetProject($branchId: ID!, $today: Date!) {
            projectCollection(filter: { branch_id: { eq: $branchId }, is_active: { eq: true } }) {
                edges {
                    node {
                        id
                        project_name
                        clinicCollection(filter: { date: { eq: $today } }) {
                            edges {
                                node {
                                    id
                                    venue
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const [checkCustomerBranch] = useLazyQuery(GET_CUSTOMER_BRANCH);
    const [checkClinicAttendCustomer] = useLazyQuery(GET_CLINIC_ATTEND_CUSTOMER);
    const [loadProjectData, { data: projectData, loading: projectLoading }] = useLazyQuery(GET_PROJECT);

    // ========================= STATE =========================

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

    // ========================= LOAD PROJECT =========================

    useEffect(() => {
        if (staff?.branch.id) {
            const today = new Date().toISOString().split("T")[0];
            loadProjectData({
                variables: {
                    branchId: staff.branch.id,
                    today
                }
            });
        }
    }, [staff?.branch.id, loadProjectData]);

    const selectedProjectData = projectData?.projectCollection?.edges?.find(
        (edge) => edge.node.id === selectedProject
    );

    // ========================= SUBMIT =========================

    const handleAddPrescription = async () => {

        if (
            !selectedPatient?.id ||
            !selectedClinic ||
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

        try {
            // 1. Check customer branch
            const customerBranchRes = await checkCustomerBranch({
                variables: {
                    customerId: selectedPatient.id,
                    branchId: staff.branch.id
                }
            });

            let customerHasBranchId =
                customerBranchRes?.data?.customer_has_branchCollection?.edges?.[0]?.node?.id;

            if (!customerHasBranchId) {
                const addBranchRes = await addCustomerBranch({
                    variables: {
                        customerId: selectedPatient.id,
                        branchId: staff.branch.id
                    }
                });
                customerHasBranchId =
                    addBranchRes?.data?.insertIntocustomer_has_branchCollection?.records?.[0]?.id;
            }

            // 2. Check clinic attend customer
            const clinicAttendRes = await checkClinicAttendCustomer({
                variables: {
                    customerHasBranchId,
                    clinicId: selectedClinic
                }
            });

            let clinicAttendCustomerId =
                clinicAttendRes?.data?.clinic_attend_customerCollection?.edges?.[0]?.node?.id;

            if (!clinicAttendCustomerId) {
                const addClinicAttendRes = await addClinicAttendCustomer({
                    variables: {
                        customerHasBranchId,
                        clinicId: selectedClinic
                    }
                });
                clinicAttendCustomerId =
                    addClinicAttendRes?.data?.insertIntoclinic_attend_customerCollection?.records?.[0]?.id;
            }

            // 3. Add prescription
            await addPrescription({
                variables: {
                    remarks: prescriptionDetails.remarks || "",
                    rightEyeSph: parseFloat(prescriptionDetails.rightEyeSph),
                    rightEyeCyl: parseFloat(prescriptionDetails.rightEyeCyl),
                    rightEyeAxis: parseFloat(prescriptionDetails.rightEyeAxis),
                    rightEyeAdd: parseFloat(prescriptionDetails.rightEyeAdd),
                    leftEyeSph: parseFloat(prescriptionDetails.leftEyeSph),
                    leftEyeCyl: parseFloat(prescriptionDetails.leftEyeCyl),
                    leftEyeAxis: parseFloat(prescriptionDetails.leftEyeAxis),
                    leftEyeAdd: parseFloat(prescriptionDetails.leftEyeAdd),
                    pupillaryDistance: parseFloat(prescriptionDetails.pupillaryDistance),
                    clinicAttendCustomerId
                }
            });

            alert("Prescription added successfully!");
            clearFields();

        } catch (err) {
            console.error(err);
            alert("Error adding prescription");
        }
    };

    const clearFields = () => {
        setPrescriptionDetails({
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
        setSelectedPatient(null);
    };

    const projectCount = projectData?.projectCollection?.edges?.length || 0;

    let clinicCount;
    if (projectCount > 1) {
        clinicCount = selectedProjectData?.node?.clinicCollection?.edges?.length || 0;
    } else {
        clinicCount = projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.length || 0;
    }

    const needsProjectSelection = projectCount > 1 && !selectedProject;
    const needsClinicSelection = selectedProject && clinicCount > 1 && !selectedClinic;

    const isDisabled = !selectedProject || clinicCount === 0;

    const [collapseKey, setCollapseKey] = useState(['1']);

    useEffect(() => {
        const pCount = projectData?.projectCollection?.edges?.length || 0;
        const cCount = projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.length || 0;

        if (pCount === 1) {
            setSelectedProject(projectData?.projectCollection?.edges?.[0]?.node?.id);
        }

        if (pCount === 1 && cCount === 1) {
            setSelectedClinic(
                projectData?.projectCollection?.edges?.[0]?.node?.clinicCollection?.edges?.[0]?.node?.id
            );
        }

        setCollapseKey(pCount === 1 && cCount === 1 ? [] : ['1']);
    }, [projectData]);

    return (
        <div className="m-5 gap-3.5 flex flex-col max-h-[87.25vh] overflow-y-auto">

            <Collapse
                defaultActiveKey={collapseKey}
                items={[
                    {
                        key: '1',
                        label: (
                            <div className="flex justify-between items-center w-full">
                                <span className="font-semibold">
                                    Project & Clinic
                                </span>
                                <span className="text-sm text-gray-500">
                                    {projectCount > 1 && !selectedProject && "⚠ Select Project"}
                                    {projectCount === 1 && clinicCount === 1 && "✔ Project & Clinic Auto Selected"}
                                    {selectedProject && clinicCount > 1 && !selectedClinic && " | ⚠ Select Clinic"}
                                    {selectedProject && clinicCount === 0 && " | ❌ No Clinics Available"}
                                </span>
                            </div>
                        ),
                        children: (
                            <Card>
                                <Row className="gap-5">

                                    {/* PROJECT SELECT */}
                                    <Col span={8}>
                                        <p className="font-medium">
                                            Select Project {projectCount > 1 && <span className="text-red-500">*</span>}
                                        </p>
                                        <Select
                                            className="w-full"
                                            placeholder="Select Project"
                                            value={selectedProject}
                                            onChange={(value) => {
                                                setSelectedProject(value);
                                                setSelectedClinic(null);
                                            }}
                                            options={projectData?.projectCollection?.edges?.map(edge => ({
                                                label: edge.node.project_name,
                                                value: edge.node.id
                                            }))}
                                            loading={projectLoading}
                                            status={needsProjectSelection ? "error" : ""}
                                        />
                                    </Col>

                                    {/* CLINIC SELECT */}
                                    <Col span={8}>
                                        <p className="font-medium">
                                            Select Today's Clinic {clinicCount > 1 && <span className="text-red-500">*</span>}
                                        </p>
                                        <Select
                                            className="w-full"
                                            placeholder={
                                                !selectedProject
                                                    ? "Select project first"
                                                    : clinicCount === 0
                                                        ? "No clinics available today"
                                                        : "Select Clinic"
                                            }
                                            value={selectedClinic}
                                            disabled={!selectedProject || clinicCount === 0}
                                            onChange={(value) => setSelectedClinic(value)}
                                            options={selectedProjectData?.node?.clinicCollection?.edges?.map(edge => ({
                                                label: edge.node.venue,
                                                value: edge.node.id
                                            }))}
                                            status={needsClinicSelection ? "error" : ""}
                                        />
                                    </Col>

                                </Row>
                            </Card>
                        )
                    }
                ]}
            />

            <Card title="New Prescription" aria-disabled={isDisabled}>

                <Row gutter={16}>

                    {/* LEFT SIDE - PRESCRIPTION DETAILS */}
                    <Col span={16}>
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
                                <p className="fs-5 font-semibold mt-10 mb-2">Pupillary Distance (PD)</p>
                                <Input placeholder="Pupillary Distance (PD)" value={prescriptionDetails.pupillaryDistance} onChange={(e) => setValue("pupillaryDistance", e.target.value)} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea rows={4} value={prescriptionDetails.remarks} onChange={(e) => setValue("remarks", e.target.value)} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Button
                                    type="primary"
                                    className="mt-5 w-full"
                                    onClick={handleAddPrescription}
                                    disabled={!selectedPatient || !selectedProject || clinicCount === 0}
                                >
                                    Add Prescription
                                </Button>
                            </Col>
                        </Row>
                    </Col>

                    <Col span={1} className="flex justify-center">
                        <Divider orientation="vertical" style={{ height: "100%" }} />
                    </Col>

                    {/* RIGHT SIDE - PATIENT TYPE */}
                    <Col span={7}>
                        <p className="fs-5 font-semibold mb-2">Patient Type</p>

                        <Radio.Group
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                        >
                            <Radio.Button value="start">
                                <SearchOutlined /> Existing Patient
                            </Radio.Button>
                            <Radio.Button value="end">
                                <UserAddOutlined /> New Patient
                            </Radio.Button>
                        </Radio.Group>

                        <Divider />

                        {position === "start" && <ExistingPatientSearch onPatientSelect={setSelectedPatient} getSelectedPatient={selectedPatient} />}
                        {position === "end" && (
                            <NewPatientAdd
                                onPatientAdd={(patient) => {
                                    setSelectedPatient(patient);
                                    setPosition("start"); 
                                }}
                            />
                        )}
                    </Col>

                </Row>

                {isDisabled && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(255,255,255,0.6)",
                            cursor: "not-allowed",
                        }}
                    />
                )}
            </Card>
        </div>
    );
}

export default NewPrescription;