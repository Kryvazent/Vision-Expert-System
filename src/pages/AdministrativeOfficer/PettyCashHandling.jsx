import { 
    Layout,
     Row, 
     Col, 
     Button ,
     Typography, 
     Card,
     message
    } from 'antd'
import React, { useState , useMemo, useEffect} from 'react'
import { PlusOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import PettyCashTable from '../../component/Admin/petty-cash/PettyCashTable'
import AddPettyCash from '../../component/Admin/petty-cash/AddPettyCash'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react/compiled'
import dayjs from 'dayjs'

const {Title,Text} = Typography
const {Content} = Layout

export default function PettyCashHandling({transactions = []}) {

    const staffID = 5;
    const branchID = 1;

    const LOAD_PETTY_CASH_DATA = gql`
        query LoadPettyCashData{
            petty_cashCollection{
                edges{
                    node{
                        id
                        type
                        amount
                        description
                        date
                        category
                    }
                }
            }
        }
    `;

const INSERT_PETTY_CASH = gql`
mutation InsertPettyCash( 
    $type: String!, 
    $amount: Float!,
    $description: String!, 
    $date: Date!, 
    $category: String!,
    $received_by: BigInt!,
    $branch_id: BigInt!){
    insertIntopetty_cashCollection(
        objects: {
            type: $type,
            amount: $amount,
            description: $description
            date: $date,
            category: $category
            received_by: $received_by
            branch_id: $branch_id
        }
    ){
        records{
            id
            type
            amount
            description
            date
            category
            received_by
            branch_id
        }
    }
}

`;

const UPDATE_PETTY_CASH = gql`
    mutation UpdatePettyCash( 
        $id: BigInt!
        $type: String!, 
        $amount: Float!,
        $description: String!, 
        $date: Date!, 
        $category: String!
     ){
        updatepetty_cashCollection(
            filter: { id : { eq: $id }}
            set: {
                type: $type,
                amount: $amount,
                description: $description,
                date: $date,
                category: $category,
            }   
        ){ 
            records{
                id
                type
                amount  
                description
                date
                category
            }   
    }
    }
`;

    const {data: pettyCash, loading, error, refetch} = useQuery(LOAD_PETTY_CASH_DATA);
    const [insertPettyCash] = useMutation(INSERT_PETTY_CASH);
    const [updatePettyCash] = useMutation(UPDATE_PETTY_CASH);

    const pettyCashList = 
        pettyCash?.petty_cashCollection?.edges?.map((item) => ({
            id: item.node.id,
            type: item.node.type,
            amount: item.node.amount,
            description: item.node.description,
            date: item.node.date,
            category: item.node.category,
            received_by: item.node.received_by,
        })) || [];  

    //Model State
    const [isModelOpen, setIsModelOpen]= useState(false)
    //selected record for editing
    const [editingTransaction, setEditingTransaction] = useState(null);

    const totals = useMemo(() => {
        const totalExpenses = pettyCashList
            .filter((item) => item.type === "Expense")
            .reduce((sum, item) => sum + Number(item.amount || 0) , 0);
           
         const totalReplenishment = pettyCashList
            .filter((item) => item.type === "Replenishment")
            .reduce((sum, item) => sum + Number(item.amount || 0) , 0);    

        const currentBalance = totalReplenishment - totalExpenses;

        return {
            totalExpenses,
            totalReplenishment,
            currentBalance,
            totalTransactions: pettyCashList.length,
        };
    }, [pettyCashList]) ;

    const handleAdd = () => {
        setEditingTransaction(null);
        setIsModelOpen(true);
    };

    const handleEdit = (record) => {
        setEditingTransaction(record);  //open form with selected record data
        setIsModelOpen(true);
    }

    const handleCloseModal = () => {
        setIsModelOpen(false);
        setEditingTransaction(null);
    }

    const handleSaveTransaction = async(values) => {

        const formattedDate = values.date || null;

        if(values.type === "Expense" && !editingTransaction && values.amount > totals.currentBalance)
        {
            message.error("Insufficient Petty Cash Balance");
            return;
        }
        try{
            //INSERT NEW RECORD
             if(!editingTransaction){
                await insertPettyCash({         //sends mutation to database to insert new record
                    variables: {
                        type: values.type,
                        amount: Number(values.amount),
                        description: values.description,
                        date: formattedDate,
                        category: values.category,
                        received_by: staffID, // Placeholder value, replace with actual user ID
                        branch_id: branchID, // Placeholder value, replace with actual branch ID
                    },
                });
                await refetch();
                message.success("Transaction added successfully");

                }else {
                    await updatePettyCash({
                        variables: {
                            id: Number(editingTransaction.id),
                            type: values.type,
                            amount: Number(values.amount),
                            description: values.description,
                            date: formattedDate,
                            category: values.category,
                        },
                    });
                    message.success("Transaction updated successfully");
                }
                await refetch();
                handleCloseModal();

        }catch(error){
            console.error("Error saving transaction:", error);  
            message.error("Failed to save transaction.");
             }
        }

    const handleDeleteTransaction = async (id) => {
        message.success("Transaction deleted successfully");
    }

    if(loading) return <p>Loading...</p>;
    if(error) return <p>Error loading petty cash data</p>;

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
          <PettyCashTable transactions={pettyCashList} onEdit={handleEdit} onDelete={handleDeleteTransaction}/>
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

