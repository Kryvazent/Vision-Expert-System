import React from 'react';
import { Table, Tag, Button, message,  } from 'antd';
import {icons} from '../../../assets/icons/AdminIcons';
import { DeleteOutlined } from '@ant-design/icons';

export default function NestedTable() {
        const [messageApi, holder] = message.useMessage();

    const data = [
        {
            key: '1',
            projectID: "PRJ001",
            projectName: "Vision Care Campaign 2026",
            location: "Dialog, Colombo",
            duration: "Mar 01 - Mar 15, 2026",
            clinics: "1/2",
            status: "Active",
            clinicsData: [
                {
                    key: '1-1',
                    clinicID: "CLN001",
                    date: "Mar 01, 2026",
                    time: "10:00 AM - 2:00 PM",
                    person: "Dr. Anura Perera",
                    role: "Optometrist",
                    expectedPatients: 50,
                    actualPatients: 45,
                    status: "Completed",
                },
                {
                    key: '1-2',
                    clinicID: "CLN002",
                    date: "Mar 10, 2026",
                    time: "10:00 AM - 4:00 PM",
                    person: "Dr. Nimal Silva",
                    role: "Optometrist",
                    expectedPatients: 70,
                    actualPatients: "-",
                    status: "Scheduled",
                }
            ]
        },
        {
            key: '2',
            projectID: "PRJ002",
            projectName: "Free Eye Checkup - Kadawatha",
            location: "Kadawatha Public Grounds",
            duration: "Apr 05 - Apr 10, 2026",
            clinics: "0/1",
            status: "Planning",
            clinicsData: [
                {
                    key: '2-1',
                    clinicID: "CLN003",
                    date: "Apr 08, 2026",
                    time: "9:00 AM - 3:00 PM",
                    person: "Dr. Sunil Fernando",
                    role: "Optometrist",
                    expectedPatients: 100,
                    actualPatients: "48",
                    status: "Planning",
                }
            ]
        }
    ];

    //Color coding for status
    const getStatusTag = (status) => {
        if (status === "Completed") return <Tag style={{ color: "#00A854",  background:"#e7f6e4"  }}>Completed</Tag>;
        if (status === "Scheduled") return <Tag style={{ color: "#1890FF",  background:"#cae7f4"  }}>Scheduled</Tag>;
        if (status === "Planning") return <Tag style={{ color: "#FAAD14",  background:"#fef5cd"  }}>Planning</Tag>;
        if (status === "Active") return <Tag style={{ color: "#52C41A",  background:"#e7f6e4"  }}>Active</Tag>;
        return <Tag >{status}</Tag>;
    };

    //Nested table columns
    const expandedRowRender = (record) => {
        const columns = [
            { title: 'Clinic ID', dataIndex: 'clinicID' },
            {title:"Date & Time", render: (_, row)  => (
                <>
                <div>
                    <div>{row.date}</div>
                    <div style={{fontSize: 12, color: "#888"}}>{row.role}</div>
                    
                </div>
                </>
            ),
        },
        {title : "Expected", dataIndex: 'expectedPatients'},
        {title : "Actual", dataIndex: 'actualPatients'},
        {title : "Status",  render: (_, row) => getStatusTag(row.status)},
       
    ];

    return (
    <Table columns={columns} dataSource={record.clinicsData} pagination={false} />
    );
};

//Main table columns
const columns = [
    { title: 'Project ID', dataIndex: 'projectID', key: 'projectID'},
    { title: 'Project Name', dataIndex: 'projectName', key: 'projectName' , render: (_, row) => (
        <div>
            <div style={{ fontWeight: "450"}}>{row.projectName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{row.location}</div>
        </div>
    )},
    { title: 'Duration', dataIndex: 'duration', key: 'duration'},
    { title: 'Clinics', dataIndex: 'clinics', key: 'clinics',},
    { title: 'Status', dataIndex: 'status', key: 'status', render: (_, row) => getStatusTag(row.status) },
    
];

return (
<>
    {holder}
    <Table
        columns={columns}
        dataSource={data}
        expandable={{ expandedRowRender }}
        style={{background: "#fff", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"}}/>
   </>
 );
}
