import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Button, Col, Input, Row } from "antd";
import { useState } from "react";

function NewPatientAdd({ onPatientAdd }) {

    const ADD_NEW_PATIENT = gql`
    
        mutation AddNewPatient(
            $firstName: String!,
            $lastName: String,
            $dob: date!,
            $nic: String!,
            $contactNumber: String!,
            $address: String
        ){
            insertIntoCustomerCollection(
                objects:{
                    first_name: $firstName,
                    last_name: $lastName,
                    dob: $dob,
                    nic: $nic,
                    contact_no: $contactNumber,
                    address: $address
                }
            ){
                records{
                    id
                    first_name
                    last_name
                    nic
                    contact_number
                    address
                    dob
                }
            }
        }
    `;

    const CHECK_IF_PATIENT_EXISTS = gql`
    
        query CheckIfPatientExists($nic: String!) {
            customerCollection(filter: { nic: { eq: $nic } }) {
                edges {
                    node{
                        id
                    }
                }
            }
        }
    `;

    const [addPatient, { data, loading, error }] = useMutation(ADD_NEW_PATIENT);
    const [checkPatientExists, { data: existingPatientData, loading: existingPatientLoading, error: existingPatientError }] = useMutation(CHECK_IF_PATIENT_EXISTS);

    const [patientDetails, setPatientDetails] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        nic: "",
        contactNumber: "",
    });

    const handlePatientAdding = async () => {
        await checkPatientExists({ variables: { nic: patientDetails.nic } }); 
        const existingPatient = existingPatientData?.customerCollection?.edges?.[0]?.node;

        if (existingPatient) {
            alert("A patient with this NIC already exists.");
            onPatientAdd(existingPatient);
            return;
        }

        await addPatient({ variables: { ...patientDetails, lastName: patientDetails.lastName || null } });
        onPatientAdd(data?.insertIntoCustomerCollection?.records?.[0] || null);
    };

    return (
        <>

            <Row className="gap-3">
                <Col span={10}>
                    <p className="font-semibold">Patient Name</p>
                    <Input placeholder="Patient Name" value={patientDetails.firstName} onChange={(e) => setPatientDetails({...patientDetails, firstName: e.target.value})} />
                </Col>
                <Col span={10}>
                    <p className="font-semibold">Date of Birth</p>
                    <Input type={"date"} placeholder="Date of Birth" value={patientDetails.dob} onChange={(e) => setPatientDetails({...patientDetails, dob: e.target.value})} />
                </Col>
            </Row>
            <Row className="mt-2 gap-3">
                <Col span={10}>
                    <p className="font-semibold">NIC Number</p>
                    <Input placeholder="NIC Number" value={patientDetails.nic} onChange={(e) => setPatientDetails({...patientDetails, nic: e.target.value})} />
                </Col>
                <Col span={10}>
                    <p className="font-semibold">Phone Number</p>
                    <Input placeholder="Phone Number" value={patientDetails.contactNumber} onChange={(e) => setPatientDetails({...patientDetails, contactNumber: e.target.value})} />
                </Col>
            </Row>

            <Row className="mt-5 gap-3">
                <Col span={21}>
                    <Button type="primary" className="w-full" onClick={handlePatientAdding}>
                        Add Patient
                    </Button>
                </Col>
            </Row>

        </>
    );
}

export default NewPatientAdd;