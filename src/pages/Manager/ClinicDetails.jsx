import React, { useState, useEffect } from 'react'
import { Typography, Button, Table, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AddClinic from '../../component/Manager/AddClinic';
import { gql } from "@apollo/client";
import { useMutation, useLazyQuery } from "@apollo/client/react";
import { useAuth } from '../../const/functions';

const { Title } = Typography;

function ClinicDetails() {

  const { staff } = useAuth();

  const INSERT_CLINIC = gql`
    mutation InsertClinic(
      $clinic_center: String!,
      $date: Date!,
      $from: Time!,
      $to: Time!,
      $responsible_person_01: String!,
      $contact_number_01: String!,
      $responsible_person_02: String!,
      $contact_number_02: String!,
      $project_id: ID!,
      $branch_id: ID!
    ) {
      insertIntoclinicCollection(
        objects: {
          venue: $clinic_center,
          date: $date,
          from: $from,
          to: $to,
          responsible_person_01: $responsible_person_01,
          responsible_person_01_contact_no: $contact_number_01,
          responsible_person_02: $responsible_person_02,
          responsible_person_02_contact_no: $contact_number_02,
          project_id: $project_id,
          clinic_status_id: 1,
          branch_id: $branch_id
        }
      ) {
        records { id }
      }
    }
  `;

  const GET_ALL_CLINICS = gql`
    query GetAllClinics {
      clinicCollection {
        edges {
          node {
            id
            venue
            date
            from
            to
            responsible_person_01
            responsible_person_01_contact_no
            responsible_person_02
            responsible_person_02_contact_no
          }
        }
      }
    }
  `;

  const GET_CLINICS_BY_DATE = gql`
    query GetClinicsByDate($date: Date!) {
      clinicCollection(filter: { date: { eq: $date } }) {
        edges {
          node {
            id
            venue
            date
            from
            to
            responsible_person_01
            responsible_person_01_contact_no
            responsible_person_02
            responsible_person_02_contact_no
          }
        }
      }
    }
  `;

  
  const UPDATE_CLINIC = gql`
    mutation UpdateClinic(
      $id: ID!,
      $clinic_center: String!,
      $date: Date!,
      $from: Time!,
      $to: Time!,
      $responsible_person_01: String!,
      $contact_number_01: String!,
      $responsible_person_02: String!,
      $contact_number_02: String!,
      $branch_id: ID!
    ) {
      updateclinicCollection(
        filter: { id: { eq: $id } }
        set: {
          venue: $clinic_center,
          date: $date,
          from: $from,
          to: $to,
          responsible_person_01: $responsible_person_01,
          responsible_person_01_contact_no: $contact_number_01,
          responsible_person_02: $responsible_person_02,
          responsible_person_02_contact_no: $contact_number_02,
          branch_id: $branch_id
        }
      ) {
        records { id }
      }
    }
  `;

  const [insertClinic] = useMutation(INSERT_CLINIC);
  const [loadAllClinics, { data: allClinicsData }] = useLazyQuery(GET_ALL_CLINICS);
  const [loadFilteredClinics, { data: filteredClinicsData }] = useLazyQuery(GET_CLINICS_BY_DATE);
  const [updateClinic] = useMutation(UPDATE_CLINIC);

  const [selectedDate, setSelectedDate] = useState(null);
  const [modelOpen, setModelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);

  useEffect(() => {
    loadAllClinics();
  }, []);

  const handleAdd = async (values) => {
    try {
      const [fromTime, toTime] = values.time || [];
      await insertClinic({
        variables: {
          clinic_center:         values.clinicCenter,
          date:                  dayjs(values.date).format("YYYY-MM-DD"),
          from:                  fromTime.format("HH:mm:ss"),
          to:                    toTime.format("HH:mm:ss"),
          responsible_person_01: values.responsiblePerson,
          contact_number_01:     values.contactNumber,
          responsible_person_02: values.responsiblePerson2,
          contact_number_02:     values.contactNumber2,
          project_id:            values.project,
          branch_id:             staff.branch.id,
        },
      });
      alert('Clinic added successfully!');
      setModelOpen(false);
      loadAllClinics();
    } catch (error) {
      console.error('Error adding clinic:', error);
      alert('Failed to add clinic.');
    }
  };


  const handleUpdate = async (values) => {
    try {
      const [fromTime, toTime] = values.time;
      await updateClinic({
        variables: {
          id:                    selectedClinic.id,
          clinic_center:         values.clinicCenter,
          date:                  dayjs(values.date).format("YYYY-MM-DD"),
          from:                  fromTime.format("HH:mm:ss"),
          to:                    toTime.format("HH:mm:ss"),
          responsible_person_01: values.responsiblePerson,
          contact_number_01:     values.contactNumber,
          responsible_person_02: values.responsiblePerson2,
          contact_number_02:     values.contactNumber2,
          branch_id:             staff.branch.id,
        },
      });
      alert('Clinic updated successfully!');
      setEditOpen(false);
      loadAllClinics();
    } catch (error) {
      console.error('Error updating clinic:', error);
      alert('Failed to update clinic. Please try again.');
    }
  };


  const handleEditClick = (record) => {
    setSelectedClinic({
      id:               record.clinicId,
      clinicCenter:     record.clinicCenter,
      date:             dayjs(record.date),
      time: [
        dayjs(`1970-01-01T${record.rawFrom}`),
        dayjs(`1970-01-01T${record.rawTo}`),
      ],
      responsiblePerson:  record.responsiblePerson01,  // ✅ was responsiblePerson01
      contactNumber:      record.contactNumber1,        // ✅ was contactNumber1
      responsiblePerson2: record.responsiblePerson02,  // ✅ was responsiblePerson02
      contactNumber2:     record.contactNumber2,
    });
    setEditOpen(true);
  };

  const handleSearch = () => {
    if (!selectedDate) {
      alert('Please select a date to search.');
      return;
    }
    loadFilteredClinics({
      variables: { date: selectedDate.format("YYYY-MM-DD") },
    });
  };

  const columns = [
    { title: 'Clinic ID',             dataIndex: 'clinicId',           key: 'clinicId',           width: 100 },
    { title: 'Clinic Center',         dataIndex: 'clinicCenter',       key: 'clinicCenter',        width: 200 },
    { title: 'Date',                  dataIndex: 'date',               key: 'date',                width: 150 },
    { title: 'Time',                  dataIndex: 'time',               key: 'time',                width: 200 },
    { title: 'Responsible Person 01', dataIndex: 'responsiblePerson01',key: 'responsiblePerson01', width: 200 },
    { title: 'Contact Number 01',     dataIndex: 'contactNumber1',     key: 'contactNumber1',      width: 150 },
    { title: 'Responsible Person 02', dataIndex: 'responsiblePerson02',key: 'responsiblePerson02', width: 200 },
    { title: 'Contact Number 02',     dataIndex: 'contactNumber2',     key: 'contactNumber2',      width: 150 },
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

  const mapData = (data) =>
    data?.clinicCollection?.edges?.map((item) => ({
      key:                 item.node.id,
      clinicId:            item.node.id,
      clinicCenter:        item.node.venue,
      date:                item.node.date,
      time:                `${item.node.from} - ${item.node.to}`,
      rawFrom:             item.node.from,
      rawTo:               item.node.to,
      responsiblePerson01: item.node.responsible_person_01,
      contactNumber1:      item.node.responsible_person_01_contact_no,
      responsiblePerson02: item.node.responsible_person_02,
      contactNumber2:      item.node.responsible_person_02_contact_no,
    })) || [];

  const allTableData      = mapData(allClinicsData);
  const filteredTableData = mapData(filteredClinicsData);

  return (
    <div className='bg-gray-100 p-10'>

      {/* Add Modal */}
      <AddClinic
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        onAdd={handleAdd}
        mode="add"
      />

      {/* Edit Modal */}
      <AddClinic
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onAdd={handleUpdate}
        mode="edit"
        clinicData={selectedClinic}
      />

      {/* All Clinics Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 items-center gap-4 mb-6">
            <Title level={5} className="text-gray-600 whitespace-nowrap">
              Monthly Clinic Details
            </Title>
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
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={allTableData}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => (
                <span className="text-gray-500 text-sm">Total {total} clinics</span>
              ),
              position: ["bottomRight"],
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>

      {/* Search Clinics Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-20">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 items-center gap-4 mb-6">
            <Title level={5} className="text-gray-600 whitespace-nowrap">
              Search Clinic Details
            </Title>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Filter by Date
              </span>
              <DatePicker
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="w-48"
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Table
            columns={columns}
            dataSource={filteredTableData}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => (
                <span className="text-gray-500 text-sm">Total {total} clinics</span>
              ),
              position: ["bottomRight"],
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>

    </div>
  );
}

export default ClinicDetails;