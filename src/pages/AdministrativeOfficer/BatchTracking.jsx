import React , {useState} from 'react'
import StatCard from '../../component/Admin/StatCard'
import { icons } from '../../assets/icons/AdminIcons'
import { Card, Row, Col, Button, Typography, Layout, message } from 'antd'
import BatchManagementTable from '../../component/Admin/batch-Management/BatchManagementTable';
import { PlusOutlined,  } from '@ant-design/icons';
import AddBatchModal from '../../component/Admin/batch-Management/AddBatchModal';
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client/react'

const {Title, Text} = Typography;
const {Content} = Layout;

// Load all batches from DB with their orders and timeline
const LOAD_BATCHES = gql`
  query LoadBatches {
    batchCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          batch_number
          current_status
          current_step
          created_at
          branch {
            id
            branch_name
          }
          batch_timeline {
            id
            delivered_to_lab_intended
            delivered_to_lab_actual
            received_from_lab_intended
            received_from_lab_actual
          }
          batch_orderCollection {
            edges {
              node {
                id
                order_id
                placed_date

                step1_intended
                step1_actual

                step2_intended
                step2_actual

                step3_intended
                step3_actual

                step4_intended
                step4_actual

                step5_intended
                step5_actual
                
                step6_intended
                step6_actual
              }
            }
          }
        }
      }
    }
  }
`;

const LOAD_BRANCHES = gql`
    query LoadBranchesForBatch {
      branchCollection(filter: 
          { is_active: { eq: true } }
        ) {
        edges { 
          node { 
            id 
            branch_name 
          }
        }
      }
    }
  `;

// Insert new batch into DB
const INSERT_BATCH = gql`
  mutation InsertBatch(
    $batch_number: String!
    $branch_id: Int!
    $current_status: String!
    $current_step: Int!
  ) {
    insertIntobatchCollection(
      objects: [{
        batch_number: $batch_number
        branch_id: $branch_id
        current_status: $current_status
        current_step: $current_step
      }]
    ) {
      records { id batch_number }
    }
  }
`;

// Insert batch orders — one row per order
const INSERT_BATCH_ORDER = gql`
  mutation InsertBatchOrder(
    $batch_id: BigInt!
    $order_id: String!
    $placed_date: Date!
    $step1_intended: Date
    $step2_intended: Date
    $step3_intended: Date
    $step4_intended: Date
    $step5_intended: Date
    $step6_intended: Date
  ) {
    insertIntobatch_orderCollection(
      objects: [{
        batch_id: $batch_id
        order_id: $order_id
        placed_date: $placed_date
        step1_intended: $step1_intended
        step2_intended: $step2_intended
        step3_intended: $step3_intended
        step4_intended: $step4_intended
        step5_intended: $step5_intended
        step6_intended: $step6_intended
      }]
    ) {
      records { id order_id }
    }
  }
`;
 
// Insert batch_timeline row (delivered/received dates for the whole batch)
const INSERT_BATCH_TIMELINE = gql`
  mutation InsertBatchTimeline(
    $batch_id: BigInt!
    $delivered_to_lab_intended: Date
    $received_from_lab_intended: Date
  ) {
    insertIntobatch_timelineCollection(
      objects: [{
        batch_id: $batch_id
        delivered_to_lab_intended: $delivered_to_lab_intended
        received_from_lab_intended: $received_from_lab_intended
      }]
    ) {
      records { id }
    }
  }
`;
 
//  Update batch current_status and current_step
const UPDATE_BATCH_STATUS = gql`
  mutation UpdateBatchStatus(
    $id: BigInt!
    $current_status: String!
    $current_step: Int!
  ) {
    updatebatchCollection(
      set: {
        current_status: $current_status
        current_step: $current_step
      }
      filter: { id: { eq: $id } }
    ) {
      records { id current_status current_step }
    }
  }
`;
 
const UPDATE_DELIVERED_ACTUAL = gql`
  mutation UpdateDeliveredActual(
    $batch_id: BigInt!
    $delivered_to_lab_actual: Date!
  ) {
    updatebatch_timelineCollection(
      set: { delivered_to_lab_actual: $delivered_to_lab_actual }
      filter: { batch_id: { eq: $batch_id } }
    ) {
      records { id delivered_to_lab_actual }
    }
  }
`;
 
const UPDATE_RECEIVED_ACTUAL = gql`
  mutation UpdateReceivedActual(
    $batch_id: BigInt!
    $received_from_lab_actual: Date!
  ) {
    updatebatch_timelineCollection(
      set: { received_from_lab_actual: $received_from_lab_actual }
      filter: { batch_id: { eq: $batch_id } }
    ) {
      records { id received_from_lab_actual }
    }
  }
`;


  const addDays = (dateStr, days) => {
    if(!dateStr) return null
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const BRANCH_CODES = {
    'Mahiyanganaya': 'MAHI',
    'Nuwara Eliya':  'NELI',
    'Kandy':'KAN',
    'Dambulla':'DMB',
  }

  const stepMap = {
  'Pending Customer Confirmation': { step: 1, key: 'step1' },
  'Confirmations Completed':{ step: 2, key: 'step2' },
  'Delivered to the Lab':{ step: 3, key: 'step3' },
  'Received from the Lab':{ step: 4, key: 'step4' },
  'Out for Delivery':{ step: 5, key: 'step5' },
  'Delivered':{ step: 6, key: 'step6' },
}

//  Transform DB row data to shape BatchManagementTable expects 
const transformBatch = (node) => {
  const timeline = node.batch_timeline || {}
  const orders = node.batch_orderCollection?.edges?.map((e, i) => ({
    key: String(e.node.id),
    id:  e.node.order_id,
    placed: e.node.placed_date,
    step1: { intended: e.node.step1_intended, actual: e.node.step1_actual },
    step2: { intended: e.node.step2_intended, actual: e.node.step2_actual },
    step3: { intended: e.node.step3_intended, actual: e.node.step3_actual },
    step4: { intended: e.node.step4_intended, actual: e.node.step4_actual },
    step5: { intended: e.node.step5_intended, actual: e.node.step5_actual },
    step6: { intended: e.node.step6_intended, actual: e.node.step6_actual },
    // keep raw id for update mutations
    _batchOrderId: e.node.id,
  })) || []
 
  return {
    key:String(node.id),
    id:node.id,   // raw DB id for mutations
    batchNumber:node.batch_number,
    branch:node.branch?.branch_name || '',
    branchId:node.branch?.id,
    orders:orders.length,
    currentStatus: node.current_status,
    currentStep:   node.current_step,
    createdAt:     node.created_at,
    // batchLevelTracking built from batch_timeline — fixes the always-'-' bug
    batchLevelTracking: {
      deliveredToLab: {
        intended: timeline.delivered_to_lab_intended || null,
        actual:   timeline.delivered_to_lab_actual   || null,
      },
      receivedFromLab: {
        intended: timeline.received_from_lab_intended || null,
        actual:   timeline.received_from_lab_actual   || null,
      },
    },
    historyData: {
      batchNumber:   node.batch_number,
      branch:node.branch?.branch_name || '',
      orders:orders.length,
      currentStatus: node.current_status,
      currentStep:node.current_step,
      orderData:orders,
      timeline: {
        step1: null,
        step2: null,
        step3: null,
        step4: null,
        step5: null,
        step6: null,
      },
    },
  }
}
 

export default function BatchTracking() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: batchData, refetch: refetchBatches } = useQuery(LOAD_BATCHES, {
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  })

  const { data: branchData } = useQuery(LOAD_BRANCHES)

  const branchList = branchData?.branchCollection?.edges?.map(e => ({
    id: Number(e.node.id),
    branch_name: e.node.branch_name,
  })) || []

  const [insertBatch] = useMutation(INSERT_BATCH)
  const [insertBatchOrder] = useMutation(INSERT_BATCH_ORDER)
  const [insertBatchTimeline] = useMutation(INSERT_BATCH_TIMELINE)
  const [updateBatchStatus] = useMutation(UPDATE_BATCH_STATUS)
  const [updateDeliveredActual]  = useMutation(UPDATE_DELIVERED_ACTUAL)
  const [updateReceivedActual]   = useMutation(UPDATE_RECEIVED_ACTUAL)
 
  const batches = batchData?.batchCollection?.edges?.map(e => transformBatch(e.node)) || []

  const totalBatches = batches.length || 0;
  const deliveredToLabCount = batches.filter(b => b.currentStatus === "Delivered to the Lab").length;
  const receivedFromLabCount = batches.filter(b => b.currentStatus === "Received from the Lab").length || 0;

   const handleAddBatch = async(newBatch) => {
    try{
      // Insert batch row
      const batchResult = await insertBatch({
        variables: {
          batch_number:   newBatch.batchNumber,
          branch_id:      newBatch.branchId,
          current_status: 'Delivered to the Lab',
          current_step:   3,
        }
      })
      const batchId = batchResult.data?.insertIntobatchCollection?.records?.[0]?.id
      if (!batchId) { message.error('Failed to create batch'); return }
 
      // Insert each order row with intended dates calculated from placed_date
      for (const order of newBatch.orderData) {
        await insertBatchOrder({
          variables: {
            batch_id:       batchId,
            order_id:       order.orderID,
            placed_date:    order.placedDate,
            //intended dates calculated from placed_date, not from today
            step1_intended: addDays(order.placedDate, 0),
            step2_intended: addDays(order.placedDate, 0),
            step3_intended: addDays(order.placedDate, 1),
            step4_intended: addDays(order.placedDate, 7),
            step5_intended: addDays(order.placedDate, 9),
            step6_intended: addDays(order.placedDate, 10),
          }
        })
      }
 
      // Insert batch_timeline with intended dates from the first order's placed_date -(batch-level intended = first order's step3/step4 intended)
      const firstPlaced = newBatch.orderData?.[0]?.placedDate
      await insertBatchTimeline({
        variables: {
          batch_id: batchId,
          delivered_to_lab_intended: addDays(firstPlaced, 1),
          received_from_lab_intended: addDays(firstPlaced, 7),
        }
      })
 
      refetchBatches()
      message.success(`Batch ${newBatch.batchNumber} added successfully!`)
      setIsModalOpen(false)

    }catch(err){
      console.error('Add batch failed:', err)
      message.error('Failed to add batch.')
    }
  };


const handleUpdateStatus = async(batchKey, status,actualDate) => {
  const batch = batches.find(b => b.key === batchKey)
  if(!batch) return

  const stepInfo = stepMap[status]
  if (!stepInfo) return

  try{
    await updateBatchStatus({
      variables: {
        id: batch.id,
        current_status: status,
        current_step: stepInfo.step,
      }
    })

    if (status === 'Delivered to the Lab') {
        await updateDeliveredActual({
          variables: {
            batch_id: batch.id,
            delivered_to_lab_actual: actualDate,
          }
        })
      } else if (status === 'Received from the Lab') {
        await updateReceivedActual({
          variables: {
            batch_id: batch.id,
            received_from_lab_actual: actualDate
          }
        })
      }

      refetchBatches()
      message.success('Batch status updated.')
  }catch(err){
    console.error('Update status failed:', err)
    message.error('Failed to update status.')
  }
};

  return (
    <Layout>
      <Content className="p-8" style={{ padding: "20px" }}>
        <div style={{
          background: "#f5f7fa",
          padding: "20px 30px",
          borderRadius: "10px",
          marginBottom: "20px",
      }}>
         <Row align="middle" justify="space-between">
             <Col>
               <Title level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Batch Tracking
                </Title>
                <Text type="secondary">
                  Track and manage lab batches
                </Text>
            </Col>
            {/* Right side button */}
                    <Col>
                    <Button
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        style={{
                        background: "#e6f0ff",
                        borderColor: "#b3d1ff",
                        color: "#1a73e8",
                        fontWeight: "500",
                        borderRadius: "8px",
                        padding: "5px 15px",
                        }}
                    >
                        Add Batch    
                    </Button>
                    </Col>
          </Row>
      </div>

      
  <Row gutter={[12, 12]} style={{ marginBottom: "24px" }}>
  <Col xs={12} sm={12} md={6}>
    <StatCard title="Total Batches" value={totalBatches} iconType="cleaningSolutions" bgColor="#d2e2f1" />
  </Col>
  <Col xs={12} sm={12} md={6}>
    <StatCard title="Delivered to Lab" value={deliveredToLabCount} iconType="delivered" bgColor="#d7fdda" />
  </Col>
  <Col xs={12} sm={12} md={6}>
    <StatCard title="Received from Lab" value={receivedFromLabCount} iconType="received" bgColor="#facfce" />
  </Col>
</Row>
      
      <BatchManagementTable 
        data={batches} 
        onUpdateStatus={handleUpdateStatus}
         onRefetch={refetchBatches}
      />

       
      <AddBatchModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddBatch={handleAddBatch}
        branchList={branchList}
      />
      </Content>  
    </Layout>
  )
}
