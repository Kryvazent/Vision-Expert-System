import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Input, Radio, Row } from "antd";
import { useState } from "react";
import ExistingPatientSearch from "../../component/optimetrist/new-prescription/ExistingPatientSearch";
import NewPatientAdd from "../../component/optimetrist/new-prescription/NewPatientAdd";
import TextArea from "antd/es/input/TextArea";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

function NewPrescription() {

    const ADD_NEW_PRESCRIPTION = gql`

        mutation AddNewPrescription(
            $remarks: String,
            $customerId: ID!,
            $rightEyeSph: Float!,
            $leftEyeSph: Float!,
            $rightEyeCyl: Float!,
            $leftEyeCyl: Float!,
            $rightEyeAxis: Float!,
            $leftEyeAxis: Float!,
            $rightEyeAdd: Float!,
            $leftEyeAdd: Float!
        ){
            insertIntoPrecriptionCollection(
                objects:{
                    remarks: $remarks,
                    right_eye_sph: $rightEyeSph,
                    left_eye_sph: $leftEyeSph,
                    right_eye_cyl: $rightEyeCyl,
                    left_eye_cyl: $leftEyeCyl,
                    right_eye_axis: $rightEyeAxis,
                    left_eye_axis: $leftEyeAxis,
                    session_attend_customer_id: $customerId,
                    right_eye_add: $rightEyeAdd,
                    left_eye_add: $leftEyeAdd
                }
            ){
                records{
                    id
                }
            }
        }
    `;
    
    const [addPrescription, {data, loading, error}] = useMutation(ADD_NEW_PRESCRIPTION);
    const [prescriptionDetails, setPrescriptionDetails] = useState({
        remarks: "",
        customerId: null,
        rightEyeSph: null,
        leftEyeSph: null,
        rightEyeCyl: null,
        leftEyeCyl: null,
        rightEyeAxis: null,
        leftEyeAxis: null,
        rightEyeAdd: null,
        leftEyeAdd: null
    });  
    const [position, setPosition] = useState("start");
    const [selectedPatient, setSelectedPatient] = useState(null);

    const setValue = (field, value) => {
        setPrescriptionDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddPrescription = async () => {
        setValue("customerId", selectedPatient.id);

        if(
            selectedPatient.id && prescriptionDetails.rightEyeSph !== null && 
            prescriptionDetails.leftEyeSph !== null && 
            prescriptionDetails.rightEyeCyl !== null && 
            prescriptionDetails.leftEyeCyl !== null && 
            prescriptionDetails.rightEyeAxis !== null && 
            prescriptionDetails.leftEyeAxis !== null
        ){
            alert("Please fill in all required fields before adding the prescription.");
            return;
        }
        await addPrescription({ variables: prescriptionDetails });
        clearFields();
    };

    const clearFields = () => {
        setPrescriptionDetails({
            remarks: "",
            customerId: null,
            rightEyeSph: null,
            leftEyeSph: null,
            rightEyeCyl: null,
            leftEyeCyl: null,
            rightEyeAxis: null,
            leftEyeAxis: null,
            rightEyeAdd: null,
            leftEyeAdd: null
        });
        setSelectedPatient(null);
    }

    return (
        <div className="m-5">
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
                        <Divider type="vertical" style={{ height: "100%" }} />
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