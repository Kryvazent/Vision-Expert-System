import React, { useState } from 'react'
import { Layout, Typography, message, Row, Col } from 'antd'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react/compiled'
import dayjs from 'dayjs'
import { useAuth } from '../../const/functions'



import CashStatCards from '../../component/Admin/cash-handling-admin/CashStatCards'
import CashFiltersBar from '../../component/Admin/cash-handling-admin/CashFiltersBar'
import CashTable from '../../component/Admin/cash-handling-admin/CashTable'

const { Title, Text } = Typography
const { Content } = Layout



const LOAD_CASH_TRANSFERS = gql`
  query LoadCashTransfers($branch_id: Int!) {
    cash_transfers_to_adminCollection(
      filter: { branch_id: { eq: $branch_id } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          created_at
          amount
          note

          manager_proof_status
          manager_proof_at

          reviewed_at
          reviewed_by_staff_id
          cash_transfer_status {
            id
            status
          }
          cash_type {
            id
            type
          }
          branch {
            id
            branch_name
          }
          staff {
            id
            first_name
            last_name
            role {
              role_name
            }
          }
        }
      }
    }
  }
`;

const LOAD_CASH_TYPES = gql`
  query LoadCashTypes {
    cash_typeCollection {
      edges {
        node { id type }
      }
    }
  }
`


const UPDATE_CASH_STATUS = gql`
  mutation UpdateCashStatus(
    $id: BigInt!
    $status_id: BigInt!
    $reviewed_at: Datetime!
  ) {
    updatecash_transfers_to_adminCollection(
      filter: { id: { eq: $id } }
      set: {
        cash_transfer_status_id: $status_id
        reviewed_at: $reviewed_at
      }
    ) {
      records { id }
    }
  }
`;


export default function AdminCashHandling() {

    const { staff } = useAuth()
  
    const branchId = staff?.branch?.id
    console.log('STAFF:', staff)
    console.log('BRANCH ID:', branchId)

    const [categoryFilter, setCategoryFilter] = useState('All')
    const [statusFilter, setStatusFilter] = useState('All')

    const { data: cashTypeData } = useQuery(LOAD_CASH_TYPES)
    const cashTypeList = cashTypeData?.cash_typeCollection?.edges.map(e => ({
        id: e.node.id, type: e.node.type
    })) || []

    const { data: cashData, refetch, error } = useQuery(LOAD_CASH_TRANSFERS, {
      variables: {branch_id: Number(branchId)},
        skip: !branchId,
        fetchPolicy: 'network-only',
        pollInterval: 5000,
    })


    const [updateCashStatus] = useMutation(UPDATE_CASH_STATUS)

    const allCashRecords = cashData?.cash_transfers_to_adminCollection?.edges.map(({ node }) => ({
        id: node.id,
        rawDate: node.created_at,
        dateLabel: dayjs(node.created_at).format('DD MMM YYYY'),
        timeLabel: dayjs(node.created_at).format('hh:mm A'),
        cashType: node.cash_type?.type || 'Unknown',
        cashTypeId: node.cash_type?.id,
        receivedFrom: `${node.staff?.first_name} ${node.staff?.last_name || ''}`.trim(),
        roleLabel: node.staff?.role?.role_name || '',
        clinic: node.branch?.branch_name || '—',
        amount: Number(node.amount),
        note: node.note,
        status: node.cash_transfer_status?.status || 'Pending',
        statusId: node.cash_transfer_status?.id,
        managerProofStatus: node.manager_proof_status || 'Awaiting',
        managerProofAtLabel: node.manager_proof_at
            ? dayjs(node.manager_proof_at).format('DD MMM, hh:mm A')
            : null,
        reviewedAtLabel: node.reviewed_at
            ? dayjs(node.reviewed_at).format('DD MMM, hh:mm A')
            : null,
    })) || []

    console.log('ALL CASH RECORDS:', allCashRecords)
// ===================

    // ── Filtered data ─────────────────────────────────────────────────────────
    const filteredRecords = allCashRecords.filter(r => {
        const categoryMatch = categoryFilter === 'All' || r.cashType === categoryFilter
        const statusMatch = statusFilter === 'All' || r.status === statusFilter
        return categoryMatch && statusMatch
    })

    const totalCash = allCashRecords.reduce((sum, r) => sum + r.amount, 0)
    const salesCash = allCashRecords.filter(r => r.cashType === 'Sales Cash').reduce((sum, r) => sum + r.amount, 0)
    const recoveryCash = allCashRecords.filter(r => r.cashType === 'Recovery Cash').reduce((sum, r) => sum + r.amount, 0)
    const extraRecoveryCash = allCashRecords.filter(r => r.cashType === 'Extra Recovery Cash').reduce((sum, r) => sum + r.amount, 0)

  
    const handleAccept = async (record) => {
        try {
            await updateCashStatus({
                variables: { 
                  id: record.id, 
                  status_id: 2, 
                  reviewed_at: new Date().toISOString()
                }
            })
            refetch()
            message.success(`Cash from ${record.receivedFrom} accepted.`)
        } catch (err) {
            console.error(err)
            message.error('Failed to accept.')
        }
    }

    const handleReject = async (record) => {
        try {
            await updateCashStatus({
                variables: { 
                  id: record.id,
                  status_id: 3, 
                  reviewed_at: new Date().toISOString()
                }
            })
            refetch()
            message.success(`Cash from ${record.receivedFrom} rejected.`)
        } catch (err) {
            console.error(err)
            message.error('Failed to reject.')
        }
    }

    return (
        <Layout>
            <Content style={{ padding: '24px', background: '#F9FAFB', minHeight: '100vh' }}>
             
            <div style={{
                background: "#f5f7fa",
                padding: "20px 30px",
                borderRadius: "10px",
                marginBottom: "20px",
                }}
            >
                <Row align="middle" justify="space-between">
                    {/* Left side */}
                    <Col>
                        <Title  level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                            Cash Handling
                        </Title>
                        <Text type="secondary">
                            Manage all sales, recovery and extra recovery cash.
                        </Text>
                    </Col>
                </Row>
                </div>

                {/* Stat Cards */}
                <CashStatCards
                    totalCash={totalCash}
                    salesCash={salesCash}
                    recoveryCash={recoveryCash}
                    extraRecoveryCash={extraRecoveryCash}
                />

                {/* Filters */}
                <CashFiltersBar
                    cashTypeList={cashTypeList}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    totalEntries={filteredRecords.length}
                    totalAmount={filteredRecords.reduce((sum, r) => sum + r.amount, 0)}
                />

                {/* Table */}
                <CashTable
                    data={filteredRecords}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />


            </Content>
        </Layout>
    )
}