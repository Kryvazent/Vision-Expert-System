import { Select } from "antd";

function ExistingPatientSearch() {

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
                options={[
                    { value: '1', label: 'Jack' },
                    { value: '2', label: 'Lucy' },
                    { value: '3', label: 'Tom' },
                ]}
            />
        </>
    );
}

export default ExistingPatientSearch;