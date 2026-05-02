import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { Select } from "antd";

function ExistingPatientSearch({ onPatientSelect, getSelectedPatient }) {

    const SEARCH_PATIENTS = gql`
    
        query SearchExistingUser($nic: String!) {
            customerCollection(filter: { nic: { like: $nic } }) {
                edges {
                    node{
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

    const [searchPatients, { data, loading, error }] = useLazyQuery(SEARCH_PATIENTS);

    // console.log("Search patients data:", data);

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
                    console.log("Searching for patients with NIC:", value);
                }}
                options={data?.customerCollection?.edges?.map(({ node }) => ({
                    value: node.id,
                    label: `${node.first_name} ${node.last_name || ''} - ${node.nic}`,
                })) || []}
                onSelect={(value) => {
                    const patient = data?.customerCollection?.edges?.find(({ node }) => node.id === value)?.node;
                    if (patient) {
                        onPatientSelect(patient);
                    }
                }}
                loading={loading}
                value={getSelectedPatient?.id}
                
            />
        </>
    );
}

export default ExistingPatientSearch;