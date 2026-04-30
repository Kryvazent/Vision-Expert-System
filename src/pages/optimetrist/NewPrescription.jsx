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
    const [sessionId, setSessionId] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);

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
            $sessionAttendCustomerId: ID!
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
                    session_attend_customer_id: $sessionAttendCustomerId
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

    const ADD_SESSION_ATTEND_CUSTOMER = gql`
        mutation AddNewSessionAttendCustomer($customerHasBranchId: ID!, $sessionId: ID!){
            insertIntosession_attend_customerCollection(
                objects:{
                    customer_has_branch_id: $customerHasBranchId,
                    session_id: $sessionId
                }
            ){
                records{ id }
            }
        }
    `;

    const [addPrescription] = useMutation(ADD_NEW_PRESCRIPTION);
    const [addCustomerBranch] = useMutation(ADD_CUSTOMER_BRANCH);
    const [addSessionAttendCustomer] = useMutation(ADD_SESSION_ATTEND_CUSTOMER);

    // ========================= QUERIES =========================

    const GET_CUSTOMER_BRANCH = gql`
        query GetCustomerBranch($customerId: ID!,$branchId: ID!) {
            customer_has_branchCollection(
                filter: { customer_id: { eq: $customerId }, branch_id: { eq: $branchId } }
            ) {
                edges { node { id } }
            }
        }
    `;

    const GET_SESSION_ATTEND_CUSTOMER = gql`
        query GetSessionAttendCustomer($customerHasBranchId: ID!, $sessionId: ID!) {
            session_attend_customerCollection(
                filter: { customer_has_branch_id: { eq: $customerHasBranchId }, session_id: { eq: $sessionId } }
            ) {
                edges { node { id } }
            }
        }
    `;

    const GET_CLINIC = gql`
        query GetClinic($branchId: ID!, $today: Date!) {
            clinicCollection(filter: { branch_id: { eq: $branchId } }) {
                edges {
                    node{
                        id
                        venue
                        sessionCollection(filter: { date: { eq: $today } }) {
                            edges{
                                node{
                                    id
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const [checkCustomerBranch] = useLazyQuery(GET_CUSTOMER_BRANCH);
    const [checkSessionAttendCustomer] = useLazyQuery(GET_SESSION_ATTEND_CUSTOMER);
    const [loadClinicData, { data: clinicData, loading: clinicLoading }] = useLazyQuery(GET_CLINIC);

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

    // ========================= LOAD CLINIC =========================

    useEffect(() => {
        if (staff?.branch.id) {
            const today = new Date().toISOString().split("T")[0];

            loadClinicData({
                variables: {
                    branchId: staff.branch.id,
                    today
                }
            });

        }
    }, [staff?.branch.id, loadClinicData, clinicData]);

    const selectedClinicData = clinicData?.clinicCollection?.edges?.find(
        (edge) => edge.node.id === selectedClinic
    );

    // ========================= SUBMIT =========================

    const handleAddPrescription = async () => {

        if (
            !selectedPatient?.id ||
            !sessionId ||
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

        // try {
            // 1. check customer branch
            const customerBranchRes = await checkCustomerBranch({
                variables: {
                    customerId: selectedPatient.id,
                    branchId: staff.branch.id
                }
            });

            console.log("Customer Branch Check Result:", customerBranchRes);

            let customerHasBranchId =
                customerBranchRes?.data?.customer_has_branchCollection?.edges?.[0]?.node?.id;

            // create if not exists
            if (!customerHasBranchId) {
                const addBranchRes = await addCustomerBranch({
                    variables: {
                        customerId: selectedPatient.id,
                        branchId: staff.branch.id
                    }
                });

                customerHasBranchId =
                    addBranchRes?.data?.customer_has_branchCollection?.records?.[0]?.id;
            }

            console.log("CustomerHasBranchId:", customerHasBranchId);

            // 2. check session attend
            const sessionAttendRes = await checkSessionAttendCustomer({
                variables: {
                    customerHasBranchId,
                    sessionId
                }
            });

            console.log("Session Attend Customer Check Result:", sessionAttendRes);

            let sessionAttendCustomerId =
                sessionAttendRes?.data?.session_attend_customerCollection?.edges?.[0]?.node?.id;

            // create if not exists
            if (!sessionAttendCustomerId) {
                const addSessionRes = await addSessionAttendCustomer({
                    variables: {
                        customerHasBranchId,
                        sessionId
                    }
                });

                sessionAttendCustomerId =
                    addSessionRes?.data?.session_attend_customerCollection?.edges?.[0]?.node?.id;
            }

            console.log("SessionAttendCustomerId:", sessionAttendCustomerId);
            
            // 3. add prescription
            await addPrescription({
                variables: {
                    ...prescriptionDetails,
                    sessionAttendCustomerId
                }
            });

            alert("Prescription added successfully!");
            clearFields();

        // } catch (err) {
            // console.error(err);
            // alert("Error adding prescription");
        // }
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
        setSessionId(null);
        setSelectedClinic(null);
    };

    const clinicCount = clinicData?.clinicCollection?.edges?.length || 0;
    const sessionCount = selectedClinicData?.node?.sessionCollection?.edges?.length || 0;

    const needsClinicSelection = clinicCount > 1 && !selectedClinic;
    const needsSessionSelection = selectedClinic && sessionCount > 1 && !sessionId;

    return (
        <div className="m-5 gap-3.5 flex flex-col max-h-[87.25vh] overflow-y-auto">

            <Collapse
                defaultActiveKey={['1']}
                items={[
                    {
                        key: '1',
                        label: (
                            <div className="flex justify-between items-center w-full">
                                <span className="font-semibold">
                                    Clinic & Session
                                </span>

                                <span className="text-sm text-gray-500">
                                    {clinicCount > 1 && !selectedClinic && "⚠ Select Clinic"}
                                    {clinicCount === 1 && "✔ Clinic Auto Selected"}
                                    {selectedClinic && sessionCount > 1 && !sessionId && " | ⚠ Select Session"}
                                    {selectedClinic && sessionCount === 1 && " | ✔ Single Session"}
                                </span>
                            </div>
                        ),
                        children: (
                            <Card>

                                <Row className="gap-5">

                                    {/* CLINIC SELECT */}
                                    <Col span={8}>
                                        <p className="font-medium">
                                            Select Today Clinic {clinicCount > 1 && <span className="text-red-500">*</span>}
                                        </p>

                                        <Select
                                            className="w-full"
                                            placeholder="Select Clinic"
                                            value={selectedClinic}
                                            onChange={(value) => {
                                                setSelectedClinic(value);
                                                setSessionId(null);
                                            }}
                                            options={clinicData?.clinicCollection?.edges?.map(edge => ({
                                                label: edge.node.venue,
                                                value: edge.node.id
                                            }))}
                                            loading={clinicLoading}
                                            status={needsClinicSelection ? "error" : ""}
                                        />
                                    </Col>

                                    {/* SESSION SELECT */}
                                    <Col span={8}>
                                        <p className="font-medium">
                                            Select Today Session {sessionCount > 1 && <span className="text-red-500">*</span>}
                                        </p>

                                        <Select
                                            className="w-full"
                                            placeholder={
                                                !selectedClinic
                                                    ? "Select clinic first"
                                                    : sessionCount === 0
                                                        ? "No sessions available"
                                                        : "Select Session"
                                            }
                                            value={sessionId}
                                            disabled={!selectedClinic || sessionCount === 0}
                                            onChange={(value) => setSessionId(value)}
                                            options={selectedClinicData?.node?.sessionCollection?.edges?.map(edge => ({
                                                label: `${edge.node.name}`,
                                                value: edge.node.id
                                            }))}
                                            status={needsSessionSelection ? "error" : ""}
                                        />
                                    </Col>

                                </Row>

                            </Card>
                        )
                    }
                ]}
            />

            <Card title="New Prescription">

                <Row gutter={16}>

                    {/* LEFT SIDE - PRESCRIPTION DETAILS */}
                    <Col span={16}>
                        <p className="fs-5 font-semibold mb-2">Right Eye (OD)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" onChange={(e) => setValue("rightEyeSph", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" onChange={(e) => setValue("rightEyeCyl", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" onChange={(e) => setValue("rightEyeAxis", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" onChange={(e) => setValue("rightEyeAdd", parseFloat(e.target.value))} />
                            </Col>
                        </Row>

                        <p className="fs-5 font-semibold mt-10 mb-2">Left Eye (OS)</p>

                        <Row className="gap-3 ms-5 mt-5">
                            <Col span={5}>
                                <p className="font-semibold">Sphere (SPH)</p>
                                <Input placeholder="Sphere (SPH)" onChange={(e) => setValue("leftEyeSph", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Cylinder (CYL)</p>
                                <Input placeholder="Cylinder (CYL)" onChange={(e) => setValue("leftEyeCyl", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Axis</p>
                                <Input placeholder="Axis" onChange={(e) => setValue("leftEyeAxis", parseFloat(e.target.value))} />
                            </Col>
                            <Col span={5}>
                                <p className="font-semibold">Add</p>
                                <Input placeholder="Add" onChange={(e) => setValue("leftEyeAdd", parseFloat(e.target.value))} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <p className="fs-5 font-semibold mt-10 mb-2">
                                    Pupillary Distance (PD)
                                </p>
                                <Input placeholder="Pupillary Distance (PD)" onChange={(e) => setValue("pupillaryDistance", parseFloat(e.target.value))} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <p className="fs-5 font-semibold mt-10 mb-2">Notes</p>
                                <TextArea rows={4} onChange={(e) => setValue("remarks", e.target.value)} />
                            </Col>
                        </Row>

                        <Row>
                            <Col span={24}>
                                <Button type="primary" className="mt-5 w-full" onClick={handleAddPrescription} disabled={!selectedPatient}>
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

                        {position === "start" && <ExistingPatientSearch onPatientSelect={setSelectedPatient} />}
                        {position === "end" && <NewPatientAdd onPatientAdd={setSelectedPatient} />}
                    </Col>

                </Row>
            </Card>
        </div>
    );
}

export default NewPrescription;