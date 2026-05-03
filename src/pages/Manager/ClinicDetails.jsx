import React, {useState} from 'react'
import { Typography, Button, Table, Select, Space} from 'antd';
import { PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import AddClinic from '../../component/Manager/AddClinic';

const {  Title } = Typography;
const { Option } = Select;

function ClinicDetails()  {

  const [selectedYear, setSelectedYear] = useState('all');
  const [modelOpen, setModelOpen] = useState(false);

  const handleAdd = () => {
    setModelOpen(true);
};

const columns = [
  {
    title: 'Clinic ID',
    dataIndex: 'clinicId',
    key: 'clinicId',
    width: 100,
  },
  {
    title: 'Clinic Center',
    dataIndex: 'clinicCenter',
    key: 'clinicCenter',
    width: 200,
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 150,
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
    width: 200,
  },
  {
    title: 'Responsible Person 01',
    dataIndex: 'responsiblePerson01',
    key: 'responsiblePerson01',
    width: 200,
  },
  {
    title: 'Conact Number',
    dataIndex: 'contactNumber1',
    key: 'contactNumber1',
    width: 150,
  },
  { 
    title: 'Responsible Person 02',
    dataIndex: 'responsiblePerson02',
    key: 'responsiblePerson02',
    width: 200,
  },
  {
    title: 'Contact Number',
    dataIndex: 'contactNumber2',
    key: 'contactNumber2',
    width: 150,
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (text, record) => (
      <div className="flex space-x-2">
        <Button type="primary" size="small" onClick={() => setModelOpen(true)}>
          Edit
        </Button>
      </div>
    ),
  },
];

const data = [
  {
    key: '1',
    clinicId: 'CL001',
    clinicCenter: 'Colombo',
    date: '2026-07-15',
    time: '10:00 AM - 4:00 PM',
    responsiblePerson01: 'Dr. Smith',
    contactNumber1: '0788387458',
    responsiblePerson02: 'Nurse Jane',
    contactNumber2: '0761585847',
  },
  {
    key: '2',
    clinicId: 'CL002',
    clinicCenter: 'Kandy',
    date: '2026-07-20',
    time: '9:00 AM - 3:00 PM',
    responsiblePerson01: 'Dr. Lee',
    contactNumber1: '0771234567',
    responsiblePerson02: 'Nurse Amy',
    contactNumber2: '0759876543',
  },
];

  return (
    <div className=' bg-gray-100 p-10'>
      <div className="flex items-center justify-between mb-6">
        <Title level={2} className="!mb-0 !text-gray-900">
          Monthly Clinic Schedule
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setModelOpen(true)}
          className="!bg-blue-600 !border-blue-600 hover:!bg-blue-700 hover:!border-blue-700 rounded-lg font-medium"
        >
          Add Clinic
        </Button>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Filter */}
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-2 ">
            Filter by Year
          </p>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            className="w-48"
            size="middle"
          >
            <Option value="all">All Years</Option>
            <Option value="2023">2025</Option>
            <Option value="2024">2026</Option>
          </Select>
        </div>

        {/* Table */}
        <div className="p-6">
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content'}}
            pagination={{
              pageSize: 10,
              showTotal: (total) => (
                <span className="text-gray-500 text-sm">
                  Total {total} clinics
                </span>
              ),
              position: ["bottomRight"],
            }}
          className="clinic-table"
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </div>
      </div>

      <AddClinic 
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        onAdd={handleAdd}
      />  
      
 
      {/* Ant Design Table Style Overrides */}
      <style>{`
        /* ── thead cells ── */
        .clinic-table .ant-table-thead > tr > th {
          background-color : #e9edf0;
          color            : #535964;
          font-size        : 13px;
          font-weight      : 500;
          padding          : 20px;
          border-bottom    : 1px solid #d1d5db;
          text-align       : center;
          marginTop         : 10px;
        }
 
        /* vertical divider between header columns */
        .clinic-table .ant-table-thead > tr > th + th {
          border-left : 1px solid #d1d5db;
        }
 
        /* ── tbody cells ── */
        .clinic-table .ant-table-tbody > tr > td {
          padding       : 14px 16px;
          border-bottom : 1px solid #f3f4f6;
        }
 
        /* remove bottom border on last row */
        .clinic-table .ant-table-tbody > tr:last-child > td {
          border-bottom : none;
        }
 
        /* flush table corners */
        .clinic-table .ant-table {
          border-radius : 0;
        }
 
        /* ── pagination ── */
        .clinic-table .ant-pagination {
          padding    : 12px 16px;
          margin     : 0 !important;
          border-top : 1px solid #f3f4f6;
        }
 
        .clinic-table .ant-pagination-item-active {
          background-color : #2563eb;
          border-color     : #2563eb;
        }
 
        .clinic-table .ant-pagination-item-active a {
          color : #fff;
        }

        /* ── horizontal scrollbar ── */
        .clinic-table .ant-table-body::-webkit-scrollbar {
          height        : 6px;
        }
 
        .clinic-table .ant-table-body::-webkit-scrollbar-track {
          background    : #f1f5f9;
          border-radius : 4px;
        }
 
        .clinic-table .ant-table-body::-webkit-scrollbar-thumb {
          background    : #cbd5e1;
          border-radius : 4px;
        }
 
        .clinic-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background    : #94a3b8;
          border-radius : 4px;
        }
      `}</style>
      
    </div>
  )
}

export default ClinicDetails