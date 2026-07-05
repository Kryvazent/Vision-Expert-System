import React, { useState, useEffect } from 'react'
import { Typography, Button, Table, DatePicker, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import AddClinic from '../../component/Manager/AddClinic'
import { gql } from '@apollo/client'
import { useMutation, useLazyQuery } from '@apollo/client/react'
import { useAuth } from '../../const/functions'

const { Title } = Typography

function ClinicDetails() {
  const { staff } = useAuth()
  // AuthProvider sets staff.branch as an object — branch_id is NOT a flat field
  const branchId = staff?.branch?.id

  // ── GraphQL: correct scalar types ─────────────────────────────────────────
  // pg_graphql maps bigint → BigInt!, int4 → Int! — never use ID! for these
  const INSERT_CLINIC = gql`
    mutation InsertClinic(
      $clinic_center: String!
      $date: Date!
      $from: Time!
      $to: Time!
      $responsible_person_01: String!
      $contact_number_01: String!
      $responsible_person_02: String!
      $contact_number_02: String!
      $project_id: BigInt!
      $branch_id: Int!
    ) {
      insertIntoclinicCollection(
        objects: [{
          venue: $clinic_center
          date: $date
          from: $from
          to: $to
          responsible_person_01: $responsible_person_01
          responsible_person_01_contact_no: $contact_number_01
          responsible_person_02: $responsible_person_02
          responsible_person_02_contact_no: $contact_number_02
          project_id: $project_id
          clinic_status_id: 1
          branch_id: $branch_id
        }]
      ) {
        records { id }
      }
    }
  `

  // Filter list to this manager's branch only
  const GET_ALL_CLINICS = gql`
    query GetAllClinics($branch_id: Int!) {
      clinicCollection(
        filter: { branch_id: { eq: $branch_id } }
        orderBy: [{ date: DescNullsLast }]
      ) {
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
  `

  const GET_CLINICS_BY_DATE = gql`
    query GetClinicsByDate($date: Date!, $branch_id: Int!) {
      clinicCollection(
        filter: { date: { eq: $date }, branch_id: { eq: $branch_id } }
      ) {
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
  `

  const GET_CLINICS_BY_CENTER = gql`
    query GetClinicsByCenter($center: String!, $branch_id: Int!) {
      clinicCollection(
        filter: { venue: { ilike: $center }, branch_id: { eq: $branch_id } }
      ) {
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
  `

  // $id is BigInt! (bigint pk), $branch_id is Int! (int4 fk)
  const UPDATE_CLINIC = gql`
    mutation UpdateClinic(
      $id: BigInt!
      $clinic_center: String!
      $date: Date!
      $from: Time!
      $to: Time!
      $responsible_person_01: String!
      $contact_number_01: String!
      $responsible_person_02: String!
      $contact_number_02: String!
      $branch_id: Int!
    ) {
      updateclinicCollection(
        filter: { id: { eq: $id } }
        set: {
          venue: $clinic_center
          date: $date
          from: $from
          to: $to
          responsible_person_01: $responsible_person_01
          responsible_person_01_contact_no: $contact_number_01
          responsible_person_02: $responsible_person_02
          responsible_person_02_contact_no: $contact_number_02
          branch_id: $branch_id
        }
      ) {
        records { id }
      }
    }
  `

  const [insertClinic]   = useMutation(INSERT_CLINIC)
  const [updateClinic]   = useMutation(UPDATE_CLINIC)

  const [loadAllClinics,      { data: allClinicsData }]      = useLazyQuery(GET_ALL_CLINICS,     { fetchPolicy: 'network-only' })
  const [loadFilteredClinics, { data: filteredClinicsData }] = useLazyQuery(GET_CLINICS_BY_DATE, { fetchPolicy: 'network-only' })
  const [loadClinicsByCenter, { data: clinicsByCenterData }] = useLazyQuery(GET_CLINICS_BY_CENTER, { fetchPolicy: 'network-only' })

  const [selectedDate,   setSelectedDate]   = useState(null)
  const [modelOpen,      setModelOpen]      = useState(false)
  const [editOpen,       setEditOpen]       = useState(false)
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [searchCenter,   setSearchCenter]   = useState('')
  const [filterType,     setFilterType]     = useState('all') // 'all' | 'date' | 'center'

  // Load on mount once branchId is available
  useEffect(() => {
    if (branchId) loadAllClinics({ variables: { branch_id: Number(branchId) } })
  }, [branchId])

  const refreshAll = () => {
    if (!branchId) return
    setFilterType('all')
    loadAllClinics({ variables: { branch_id: Number(branchId) } })
  }

  const handleAdd = async (values) => {
    if (!branchId) { message.error('No branch assigned to your account.'); return }
    try {
      const [fromTime, toTime] = values.time || []
      await insertClinic({
        variables: {
          clinic_center:         values.clinicCenter,
          date:                  dayjs(values.date).format('YYYY-MM-DD'),
          from:                  fromTime.format('HH:mm:ss'),
          to:                    toTime.format('HH:mm:ss'),
          responsible_person_01: values.responsiblePerson,
          contact_number_01:     values.contactNumber,
          responsible_person_02: values.responsiblePerson2 || '',
          contact_number_02:     values.contactNumber2 || '',
          project_id:            Number(values.project),
          branch_id:             Number(branchId),
        },
      })
      message.success('Clinic added successfully!')
      setModelOpen(false)
      refreshAll()
    } catch (error) {
      console.error('Error adding clinic:', error)
      message.error('Failed to add clinic: ' + (error?.message || 'unknown error'))
    }
  }

  const handleUpdate = async (values) => {
    if (!branchId) { message.error('No branch assigned to your account.'); return }
    try {
      const [fromTime, toTime] = values.time || []
      await updateClinic({
        variables: {
          id:                    Number(selectedClinic.id),
          clinic_center:         values.clinicCenter,
          date:                  dayjs(values.date).format('YYYY-MM-DD'),
          from:                  fromTime.format('HH:mm:ss'),
          to:                    toTime.format('HH:mm:ss'),
          responsible_person_01: values.responsiblePerson,
          contact_number_01:     values.contactNumber,
          responsible_person_02: values.responsiblePerson2 || '',
          contact_number_02:     values.contactNumber2 || '',
          branch_id:             Number(branchId),
        },
      })
      message.success('Clinic updated successfully!')
      setEditOpen(false)
      refreshAll()
    } catch (error) {
      console.error('Error updating clinic:', error)
      message.error('Failed to update clinic: ' + (error?.message || 'unknown error'))
    }
  }

  const handleEditClick = (record) => {
    setSelectedClinic({
      id:               record.clinicId,
      clinicCenter:     record.clinicCenter,
      date:             dayjs(record.date),
      time: [
        dayjs(`1970-01-01T${record.rawFrom}`),
        dayjs(`1970-01-01T${record.rawTo}`),
      ],
      responsiblePerson:  record.responsiblePerson01,
      contactNumber:      record.contactNumber1,
      responsiblePerson2: record.responsiblePerson02,
      contactNumber2:     record.contactNumber2,
    })
    setEditOpen(true)
  }

  const handleCenterSearch = () => {
    if (!searchCenter.trim()) { message.warning('Please enter a clinic center name to search.'); return }
    setFilterType('center')
    loadClinicsByCenter({
      variables: { center: `%${searchCenter.trim()}%`, branch_id: Number(branchId) },
    })
  }

  const columns = [
    { title: 'Clinic ID',             dataIndex: 'clinicId',            key: 'clinicId',            width: 100 },
    { title: 'Clinic Center',         dataIndex: 'clinicCenter',        key: 'clinicCenter',        width: 200 },
    { title: 'Date',                  dataIndex: 'date',                key: 'date',                width: 150 },
    { title: 'Time',                  dataIndex: 'time',                key: 'time',                width: 200 },
    { title: 'Responsible Person 01', dataIndex: 'responsiblePerson01', key: 'responsiblePerson01', width: 200 },
    { title: 'Contact Number 01',     dataIndex: 'contactNumber1',      key: 'contactNumber1',      width: 150 },
    { title: 'Responsible Person 02', dataIndex: 'responsiblePerson02', key: 'responsiblePerson02', width: 200 },
    { title: 'Contact Number 02',     dataIndex: 'contactNumber2',      key: 'contactNumber2',      width: 150 },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleEditClick(record)}>
          Edit
        </Button>
      ),
    },
  ]

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
    })) || []

  const allTableData      = mapData(allClinicsData)
  const filteredTableData = mapData(filteredClinicsData)
  const centerTableData   = mapData(clinicsByCenterData)

  const displayData =
    filterType === 'date'   ? filteredTableData :
    filterType === 'center' ? centerTableData   :
    allTableData

  if (!branchId) {
    return (
      <div className="bg-gray-100 p-10">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No branch is linked to your account. Please contact the administrator.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 p-10">
      <AddClinic
        open={modelOpen}
        onClose={() => setModelOpen(false)}
        onAdd={handleAdd}
        mode="add"
      />

      <AddClinic
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onAdd={handleUpdate}
        mode="edit"
        clinicData={selectedClinic}
      />

      {/* Unified Clinic Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="grid grid-cols-2 items-center gap-4 mb-6">
            <Title level={5} className="text-gray-600 whitespace-nowrap">
              Clinic Details
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

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter:</span>
            <Button
              type={filterType === 'all' ? 'primary' : 'default'}
              onClick={() => {
                setFilterType('all')
                loadAllClinics({ variables: { branch_id: Number(branchId) } })
              }}
            >
              All Clinics
            </Button>
            <DatePicker
              placeholder="Filter by Date"
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date)
                if (date) {
                  setFilterType('date')
                  loadFilteredClinics({
                    variables: { date: date.format('YYYY-MM-DD'), branch_id: Number(branchId) },
                  })
                }
              }}
              className="w-48"
            />
            <input
              type="text"
              placeholder="Filter by center"
              value={searchCenter}
              onChange={(e) => setSearchCenter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCenterSearch()}
              className="border border-gray-300 rounded-md px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleCenterSearch}>Search</Button>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            dataSource={displayData}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 10,
              showTotal: (total) => (
                <span className="text-gray-500 text-sm">Total {total} clinics</span>
              ),
              position: ['bottomRight'],
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </div>
      </div>
    </div>
  )
}

export default ClinicDetails
