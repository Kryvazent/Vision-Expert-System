import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Button, Col, Input, Row } from "antd";
import { useState } from "react";

const ADD_NEW_PATIENT = gql`
  mutation AddNewPatient(
    $firstName: String!
    $lastName: String
    $dob: date!
    $nic: String!
    $contactNumber: String!
    $address: String
  ) {
    insertIntocustomerCollection(
      objects: {
        first_name: $firstName
        last_name: $lastName
        dob: $dob
        nic: $nic
        contact_no: $contactNumber
        address: $address
      }
    ) {
      records {
        id
        first_name
        last_name
        nic
        contact_no
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
        node {
            id
            first_name
            last_name
            nic
            contact_no
            address
            dob
        }
      }
    }
  }
`;

function NewPatientAdd({ onPatientAdd }) {

    const [addPatient] = useMutation(ADD_NEW_PATIENT);
    const [checkPatientExists] = useLazyQuery(CHECK_IF_PATIENT_EXISTS, {
        fetchPolicy: "network-only",
    });

    const [patientDetails, setPatientDetails] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        nic: "",
        contactNumber: "",
    });

    const handlePatientAdding = async () => {

        if(!patientDetails.firstName || !patientDetails.lastName || !patientDetails.dob || !patientDetails.nic || !patientDetails.contactNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const cleanNic = patientDetails.nic.trim();

            const { data: queryResult } = await checkPatientExists({
                variables: { nic: cleanNic },
            });

            const existingPatient = queryResult?.customerCollection?.edges?.[0]?.node;
            console.log("Query Result for NIC check:", existingPatient);

            if (existingPatient) {
                alert("A patient with this NIC already exists.");
                onPatientAdd(existingPatient);
            } else {
                const addRes = await addPatient({
                    variables: {
                        ...patientDetails,
                        nic: cleanNic,
                        lastName: patientDetails.lastName || null,
                    },
                });

                const newPatient = addRes?.data?.insertIntocustomerCollection?.records?.[0];

                if (newPatient) {
                    onPatientAdd(newPatient);
                    setPatientDetails({
                        firstName: "",
                        lastName: "",
                        dob: "",
                        nic: "",
                        contactNumber: "",
                    });
                }
            }

        } catch (err) {
            console.error("Error processing patient:", err);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <>
            <Row className="gap-3">
                <Col span={10}>
                    <p className="font-semibold">Patient First Name</p>
                    <Input
                        placeholder="Patient First Name"
                        value={patientDetails.firstName}
                        onChange={(e) =>
                            setPatientDetails({ ...patientDetails, firstName: e.target.value })
                        }
                    />
                </Col>
                <Col span={10}>
                    <p className="font-semibold">Patient Last Name</p>
                    <Input
                        placeholder="Patient Last Name"
                        value={patientDetails.lastName}
                        onChange={(e) =>
                            setPatientDetails({ ...patientDetails, lastName: e.target.value })
                        }
                    />
                </Col>
                <Col span={21}>
                    <p className="font-semibold">Date of Birth</p>
                    <Input
                        type={"date"}
                        placeholder="Date of Birth"
                        value={patientDetails.dob}
                        onChange={(e) =>
                            setPatientDetails({ ...patientDetails, dob: e.target.value })
                        }
                    />
                </Col>
            </Row>
            <Row className="mt-2 gap-3">
                <Col span={10}>
                    <p className="font-semibold">NIC Number</p>
                    <Input
                        placeholder="NIC Number"
                        value={patientDetails.nic}
                        onChange={(e) =>
                            setPatientDetails({ ...patientDetails, nic: e.target.value })
                        }
                    />
                </Col>
                <Col span={10}>
                    <p className="font-semibold">Phone Number</p>
                    <Input
                        placeholder="Phone Number"
                        value={patientDetails.contactNumber}
                        onChange={(e) =>
                            setPatientDetails({
                                ...patientDetails,
                                contactNumber: e.target.value,
                            })
                        }
                    />
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
