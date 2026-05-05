import { Layout, Row, Col, Button ,Typography} from 'antd'
import React, { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'

const {Title,Text} = Typography
const {Content} = Layout

export default function PettyCashHandling() {

    const [pettyCash, setPettyCash]= useState(0)
    const count = {
        
    }    

  return (
    <Layout>
        <Content style={{
            background: "#f5f7fa",
            padding: "20px 30px",
            borderRadius: "10px",
            marginBottom: "20px", 
        }}
        >
            <Row  align="middle" justify="space-between">
                {/* Left side */}
                <Col>
                    <Title level={2} style={{ fontWeight: "bold", marginBottom: "8px" }}>
                        Petty Cash Handling
                    </Title>
                    <Text  type="secondary">
                        Manage all cash fund used for small, frequent expenses
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
                        Add Expense / Replenishments    
                    </Button>
                </Col>
            </Row>

            {/* <div className="flex gap-6 mb-5">
                <StatCard title="Total Complaints" value={count.total} iconType="creaditCard" color="#00A854" bgColor="#E6F7F0" />
                    <StatCard title="Pending" value={count.pending} iconType="expense" color="#F5222D" bgColor="#FFF1F0" />
                    <StatCard title="In-Progress" value={count.progress} iconType="replenishment" color="#FAAD14" bgColor="#FFF7E6" />
                    <StatCard title="Resolved" value={count.resolved} iconType="total" color="#1890FF" bgColor="#E6F7FF" />
            </div> */}
        </Content>
    </Layout>
  )
}

