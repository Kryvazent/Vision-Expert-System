import { Layout, Row, Col, Button ,Typography, Card} from 'antd'
import React, { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import PettyCashTable from '../../component/Admin/petty-cash/PettyCashTable'

const {Title,Text} = Typography
const {Content} = Layout

export default function PettyCashHandling({transactions = []}) {

    //Model State
    const [isModelOpen, setIsModelOpen]= useState(false)

    const totalExpenses  = transactions
        ?.filter(t => t.type === "Expense")  
        ?.reduce((sum, t) => sum+ (t.amount || 0), 0);

    const totalReplenishment  = transactions
        ?.filter(t => t.type === "Replenishment")  
        ?.reduce((sum, t) => sum+ (t.amount || 0), 0);    

    const currentBalance = totalReplenishment - totalExpenses;
    const totalTransactions = transactions?.length || 0 ;    

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
                        onClick={() => setIsModelOpen(true)}
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

            <div className="flex gap-6 mb-5">
                <StatCard title="Current Balance" value={`LKR ${currentBalance.toLocaleString()}`} iconType="creaditCard" color="#00A854" bgColor="#E6F7F0" />
                <StatCard title="Total Expenses" value={`LKR ${totalExpenses.toLocaleString()}`} iconType="expense" color="#F5222D" bgColor="#FFF1F0" />
                <StatCard title="Total Replenishment" value={`LKR ${totalReplenishment.toLocaleString()}`} iconType="replenishment" color="#FAAD14" bgColor="#FFF7E6" />
                <StatCard title="Total Transactions" value={totalTransactions} iconType="total" color="#1890FF" bgColor="#E6F7FF" />
            </div> 

            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Low of Stock Table */}
          <PettyCashTable transactions={transactions}/>
        </Card>
        </Content>
    </Layout>
  )
}

