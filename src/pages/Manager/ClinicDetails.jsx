import React, { useState } from 'react'
import { Typography, Button, Table, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AddClinic from '../../component/Manager/AddClinic';

const { Title } = Typography;

function ClinicDetails() {

  const [selectedDate, setSelectedDate] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [mode, setMode] = useState('add');

  const handleAdd = (values) => {
    console.log('New clinic data:', values);
    // your save/API logic here
  };

  const handleUpdate = (values) => {
    console.log('Updated clinic data:', values);
    // your update/API logic here
  };

  const handleEditClick = (record) => {
    setSelectedClinic({
      clinicCenter: record.clinicCenter,
      date: dayjs(record.date),
      duration: record.time,
      responsiblePerson01: record.responsiblePerson01,
      contactNumber1: record.contactNumber1,
      responsiblePerson02: record.responsiblePerson02,
      contactNumber2: record.contactNumber2,
    });
    setEditOpen(true);
    }

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
      title: 'Contact Number 01',
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
      title: 'Contact Number 02',
      dataIndex: 'contactNumber2',
      key: 'contactNumber2',
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleEditClick(record)}>
          Edit
        </Button>
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
    < div className='bg-gray-100 p-10'>
      {/* Add Modal — outside the button */}
      <AddClinic
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        onAdd={handleAdd}
        mode="add"
      />

      {/* Edit Modal — outside the table */}
      <AddClinic
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onAdd={handleUpdate}
        mode="edit"
        clinicData={selectedClinic}
      />
      
      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Filter */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Filter by Date
              </span>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="w-48"
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setModelOpen(true)}
              >
                Add Clinic                
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={data}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => (
                <span className="text-gray-500 text-sm">
                  Total {total} clinics
                </span>
              ),
              position: ["bottomRight"],
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>

      </div>

    </div>
  )
}

export default ClinicDetails;