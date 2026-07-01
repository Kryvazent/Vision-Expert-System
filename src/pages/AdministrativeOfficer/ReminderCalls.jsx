import React from 'react'
import { PhoneOutlined } from '@ant-design/icons'
import Statcard from '../../component/Admin/reminder-calls/Statcard'
import { Layout, Col, Row, Typography, Spin } from 'antd'
import CallDetailsTable from '../../component/Admin/reminder-calls/CallDetailsTable'

import {gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react/compiled';
import { useAuth } from '../../const/functions'

const {Content} = Layout
const {Title} = Typography


const LOAD_REMINDER_DATA = gql `
  query LoadReminderData { 
    reminder_callCollection { 
      edges{ 
        node{ 
          id 
          order_id 
          before_lab_status 
          before_lab_reason
          before_lab_custom_reason

          before_delivery_status 
          before_delivery_reason
          before_delivery_custom_reason
        } 
      } 
    } 
      orderCollection { 
        edges { 
          node{ 
            id
            order_status { 
            status 
          }
            clinic_attend_customer{ 
              customer_has_branch{ 
                customer { 
                  id 
                  first_name 
                  last_name 
                } branch{ 
                  id 
                  branch_name 
                  } 
                } 
              }
                lab_follow_upCollection{
                  edges{
                    node{
                      id
                      lab_follow_up_status {
                        status
                      }
                    }
                  }
                }
              } 
            }
          } 
        } 
`;

const EXCLUDED_ORDER_STATUSES = ["completed", "Canceled"]

export default function ReminderCalls() {

  const {data, loading, refetch} = useQuery(LOAD_REMINDER_DATA, {fetchPolicy: 'network-only'})

  const reminderMap = {}
    data?.reminder_callCollection?.edges.forEach(e => {
    reminderMap[String(e.node.order_id)] = e.node
  })

  const orders = (data?.orderCollection?.edges || [])
    .filter(e => !EXCLUDED_ORDER_STATUSES.includes(e.node.order_status?.status))
    .map(e => ({ node: e.node }));
 
    //true if this order has not been sent to the lab yet (no lab_follow_up row)
  const isBeforeLab = (orderNode) => {
    const followUps = orderNode.lab_follow_upCollection?.edges || []
    return followUps.length === 0
  }

  //true if this order is back from the lab (status "Received"), waiting on delivery
  const isBeforeDelivery = (orderNode) => {
    const followUps = orderNode.lab_follow_upCollection?.edges || []
    return followUps.some(f => f.node.lab_follow_up_status?.status === 'Received')
  }

    //  now only counts orders that are actually in the "before lab" stage
  const beforeLabAnswer    = orders.filter(e => isBeforeLab(e.node) && reminderMap[String(e.node.id)]?.before_lab_status === 'answer').length;
  const beforeLabNotAnswer = orders.filter(e => isBeforeLab(e.node) && reminderMap[String(e.node.id)]?.before_lab_status === 'not_answer').length;

 const beforeLabPending   = orders.filter(e => {
    if (!isBeforeLab(e.node)) return false
    const r = reminderMap[String(e.node.id)]
    return !r || !r.before_lab_status
  }).length
 

  //now only counts orders that are actually in the "before delivery" stage
  const beforeDeliveryAnswer    = orders.filter(e => isBeforeDelivery(e.node) && reminderMap[String(e.node.id)]?.before_delivery_status === 'answer').length;
  const beforeDeliveryNotAnswer = orders.filter(e => isBeforeDelivery(e.node) && reminderMap[String(e.node.id)]?.before_delivery_status === 'not_answer').length;
  const beforeDeliveryPending   = orders.filter(e => {
    if (!isBeforeDelivery(e.node)) return false
    const r = reminderMap[String(e.node.id)]
    return !r || !r.before_delivery_status
  }).length


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
              Reminder Calls
            </Title>
            </Col>
          </Row>
        </div>

        {loading ? (
          <Spin style={{ display: 'block', margin: '40px auto' }} />
        ) : (
        <>
        <div  className="flex gap-6 mb-6">
            <Statcard 
              title="Before Lab Status" 
              icon={<PhoneOutlined  style={{color: "#1677ff"}} /> }
              items={[
                {label: "Answer", value: beforeLabAnswer, color: "green"},
                {label: "Not Answer", value: beforeLabNotAnswer, color: "red"},
                {label: "Pending", value: beforeLabPending,}
              ]}
            />
            < Statcard
              title="Before Delivery Status" 
              icon={<PhoneOutlined  style={{color: "green"}}/>}
              items={[
                { label: "Answer", value:beforeDeliveryAnswer , color: 'green'},
                {label: "Not Answer", value: beforeDeliveryNotAnswer , color: "red"},
                {label: "Pending", value: beforeDeliveryPending                   }
              ]}
            />
        </div>

        <CallDetailsTable 
          orders={orders}
          reminderMap={reminderMap}
          onRefetch = {refetch}
        />
      </>
    )}  
    </Content>
  </Layout>
  )
}
