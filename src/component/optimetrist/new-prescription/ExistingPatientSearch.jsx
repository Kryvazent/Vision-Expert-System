import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Select } from "antd";

function ExistingPatientSearch({ onPatientSelect }) {

    const SEARCH_PATIENTS = gql`
    
        query SearchExistingUser($nic: String!) {
            customerCollection(filter: { nic: { eq: $nic } }) {
                edges {
                    node{
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
        }
    `;

    const [searchPatients, { data, loading, error }] = useMutation(SEARCH_PATIENTS);

    return (
        <>
            <p>Search Patient by NIC</p>
            <Select
                className="w-full"
                showSearch={{
                    filterOption: (input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                }}
                placeholder="Search by NIC"
                onSearch={(value) => {
                    searchPatients({ variables: { nic: value } });
                }}
                options={data?.customerCollection?.edges?.map(({ node }) => ({
                    value: node.id,
                    label: `${node.first_name} ${node.last_name} - ${node.nic}`,
                })) || []}
                onSelect={(value) => {
                    const patient = data?.customerCollection?.edges?.find(({ node }) => node.id === value)?.node;
                    if (patient) {
                        onPatientSelect(patient);
                    }
                }}
            />
        </>
    );
}

export default ExistingPatientSearch;