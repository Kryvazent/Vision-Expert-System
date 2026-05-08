import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";
import { Select } from "antd";
import { useMemo } from "react";

function ExistingPatientSearch({ onPatientSelect, getSelectedPatient }) {

    const SEARCH_PATIENTS = gql`
        query SearchExistingUser($nic: String!) {
            customerCollection(filter: { nic: { like: $nic } }) {
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

    const [searchPatients, { data, loading }] = useLazyQuery(SEARCH_PATIENTS);

    // Merge search results with the currently selected patient
    // so a newly added patient (not yet searched) still shows in the dropdown
    const options = useMemo(() => {
        const searchedOptions = data?.customerCollection?.edges?.map(({ node }) => ({
            value: node.id,
            label: `${node.first_name} ${node.last_name || ''} - ${node.nic}`,
            node,
        })) || [];

        // If selected patient is not in search results, add it manually
        if (
            getSelectedPatient?.id &&
            !searchedOptions.find((o) => o.value === getSelectedPatient.id)
        ) {
            searchedOptions.unshift({
                value: getSelectedPatient.id,
                label: `${getSelectedPatient.first_name} ${getSelectedPatient.last_name || ''} - ${getSelectedPatient.nic}`,
                node: getSelectedPatient,
            });
        }

        return searchedOptions;
    }, [data, getSelectedPatient]);

    return (
        <>
            <p>Search Patient by NIC</p>
            <Select
                className="w-full"
                showSearch
                filterOption={false} // We handle filtering server-side
                placeholder="Search by NIC"
                onSearch={(value) => {
                    if (value) {
                        searchPatients({ variables: { nic: `%${value}%` } });
                    }
                }}
                options={options}
                onSelect={(value) => {
                    const patient = options.find((o) => o.value === value)?.node;
                    if (patient) {
                        onPatientSelect(patient);
                    }
                }}
                loading={loading}
                value={getSelectedPatient?.id || null}
            />
        </>
    );
}

export default ExistingPatientSearch;