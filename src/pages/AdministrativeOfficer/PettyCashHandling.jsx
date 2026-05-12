import { 
    Layout,
     Row, 
     Col, 
     Button ,
     Typography, 
     Card,
     message
    } from 'antd'
import React, { useState , useMemo} from 'react'
import { PlusOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import PettyCashTable from '../../component/Admin/petty-cash/PettyCashTable'
import AddPettyCash from '../../component/Admin/petty-cash/AddPettyCash'

const {Title,Text} = Typography
const {Content} = Layout



export default function PettyCashHandling({transactions = []}) {

    //All petty cash transaction
    const [pettyCashData, setPettyCashData] = useState(transactions);
    //Model State
    const [isModelOpen, setIsModelOpen]= useState(false)
    //selected record for editing
    const [editingTransaction, setEditingTransaction] = useState(null);

    const totals = useMemo(() => {
        const totalExpenses = pettyCashData
            .filter((item) => item.type === "Expense")
            .reduce((sum, item) => sum + Number(item.amount || 0) , 0);
           
         const totalReplenishment = pettyCashData
            .filter((item) => item.type === "Replenishment")
            .reduce((sum, item) => sum + Number(item.amount || 0) , 0);    

        const currentBalance = totalReplenishment - totalExpenses;

        return {
            totalExpenses,
            totalReplenishment,
            currentBalance,
            totalTransactions: pettyCashData.length,
        };
    }, [pettyCashData]) ;

    const handleAdd = () => {
        setEditingTransaction(null);
        setIsModelOpen(true);
    };

    const handleEdit = (record) => {
        setEditingTransaction(record);
        setIsModelOpen(true);
    }

    const handleCloseModal = () => {
        setIsModelOpen(false);
        setEditingTransaction(null);
    }

    const handleSaveTransaction = (values) => {
        if(values.type === "Expense" && !editingTransaction && values.amount > totals.currentBalance)
        {
            message.error("Insufficient Petty Cash Balance");
            return;
        }

        if(editingTransaction){
            //Update existing record
            setPettyCashData((prev) => 
                prev.map((item) => 
                    item.id === editingTransaction.id ? {...item, ...values} : item
                )
             );

             message.success("Transaction updated successfully");
        }else {
            //add nee rrcord
            const newTransaction = {
                id: Date.now(),
                ...values,
            };
            setPettyCashData((prev) => [newTransaction, ...prev]);
            message.success("Transaction added successfully");
        }

        handleCloseModal();
    }

    const handleDeleteTransaction = (id) => {
        setPettyCashData((prev) =>
            prev.filter((item) => item.id !== id)
        );

        message.success("Transaction deleted successfully");
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
                        onClick= {handleAdd}
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

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px', marginBottom: '24px', }}>
                <StatCard title="Current Balance" value={`LKR ${totals.currentBalance.toLocaleString()}`} iconType="creaditCard" color="#00A854" bgColor="#E6F7F0" />
                <StatCard title="Total Expenses" value={`LKR ${totals.totalExpenses.toLocaleString()}`} iconType="expense" color="#F5222D" bgColor="#FFF1F0" />
                <StatCard title="Total Replenishment" value={`LKR ${totals.totalReplenishment.toLocaleString()}`} iconType="replenishment" color="#FAAD14" bgColor="#FFF7E6" />
                <StatCard title="Total Transactions" value={totals.totalTransactions} iconType="total" color="#1890FF" bgColor="#E6F7FF" />
            </div> 

            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Low of Stock Table */}
          <PettyCashTable transactions={pettyCashData} onEdit={handleEdit} onDelete={handleDeleteTransaction}/>
        </Card>

        {/* add/ edit model */}
        <AddPettyCash 
            open={isModelOpen} 
            onClose={handleCloseModal}
            onSave={handleSaveTransaction}
            initialValues={editingTransaction}
        />
        </Content>
    </Layout>
  )
}

