import {
    Layout,
     Row,
     Col,
     Button ,
     Typography,
     Card,
     Alert,
     message
    } from 'antd'
import React, { useState , useMemo, useEffect} from 'react'
import { PlusOutlined } from '@ant-design/icons'
import StatCard from '../../component/Admin/StatCard'
import PettyCashTable from '../../component/Admin/petty-cash/PettyCashTable'
import AddPettyCash from '../../component/Admin/petty-cash/AddPettyCash'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react/compiled'
import { useAuth } from '../../const/functions'
import dayjs from 'dayjs'

const {Title,Text} = Typography
const {Content} = Layout

export default function PettyCashHandling({transactions = []}) {

    const { staff } = useAuth();
    const staffID = staff?.id;
    const branchID = staff?.branch?.id || staff?.branch_id;
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [dateRange, setDateRange] = useState(null);

    const normalizeTransactionType = (type) => {
        const normalized = String(type || '').trim().toLowerCase();
        if (normalized === 'expense') return 'Expense';
        if (normalized === 'replenishment' || normalized === 'allocation') return 'Replenishment';
        return type || 'Expense';
    };

    const LOAD_PETTY_CASH_DATA = gql`
        query LoadPettyCashData($branchId: Int!){
            petty_cashCollection(
                filter: { branch_id: { eq: $branchId } }
                orderBy: [{ created_at: DescNullsLast }]
            ){
                edges{
                    node{
                        id
                        type
                        amount
                        description
                        date
                        category
                        allocation_id
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

    const {data: pettyCash, loading, error, refetch} = useQuery(LOAD_PETTY_CASH_DATA, {
        variables: { branchId: branchID },
        skip: !branchID
    });
    const [insertPettyCash] = useMutation(INSERT_PETTY_CASH);
    const [updatePettyCash] = useMutation(UPDATE_PETTY_CASH);

    const pettyCashList =
        pettyCash?.petty_cashCollection?.edges?.map((item) => ({
            id: item.node.id,
            type: normalizeTransactionType(item.node.type),
            amount: Number(item.node.amount || 0),
            description: item.node.description,
            date: item.node.date,
            category: (item.node.category || '').trim(),
            received_by: item.node.received_by,
            allocation_id: item.node.allocation_id,
            allocation: null, // Will be fetched separately if needed
        })) || [];

    const filteredPettyCashList = useMemo(() => {
        return pettyCashList.filter((item) => {
            const categoryMatch =
                categoryFilter === "All" ||
                item.category.trim().toLowerCase() === categoryFilter.trim().toLowerCase();

            if (!categoryMatch) return false;

            if (dateRange?.[0] && dateRange?.[1]) {
                const itemDate = dayjs(item.date).startOf('day');
                const start = dateRange[0].startOf('day');
                const end = dateRange[1].endOf('day');

                return (
                    (itemDate.isAfter(start) || itemDate.isSame(start)) &&
                    (itemDate.isBefore(end) || itemDate.isSame(end))
                );
            }

            return true;
        });
    }, [pettyCashList, categoryFilter, dateRange]);

    const categoryOptions = useMemo(() => {
        const categories = Array.from(
            new Set(pettyCashList.map((item) => item.category).filter(Boolean))
        ).sort((a, b) => a.localeCompare(b));

        return [
            { value: "All", label: "All Categories" },
            ...categories.map((category) => ({ value: category, label: category })),
        ];
    }, [pettyCashList]);

    //Model State
    const [isModelOpen, setIsModelOpen]= useState(false)
    //selected record for editing
    const [editingTransaction, setEditingTransaction] = useState(null);

    const calculateTotals = (items) => {
        const totalExpenses = items
            .filter((item) => item.type === "Expense")
            .reduce((sum, item) => sum + Number(item.amount || 0) , 0);

         const totalReplenishment = items
            .filter((item) => item.type === "Replenishment")
            .reduce((sum, item) => {
                // Use the transaction amount directly
                return sum + Number(item.amount || 0);
            }, 0);

        const currentBalance = totalReplenishment - totalExpenses;

        return {
            totalExpenses,
            totalReplenishment,
            currentBalance,
            totalTransactions: items.length,
        };
    };

    //prevents unnecessary recalculations.
    const totals = useMemo(() => {
        return calculateTotals(pettyCashList);
    }, [pettyCashList]) ;

    const filteredTotals = useMemo(() => {
        return calculateTotals(filteredPettyCashList);
    }, [filteredPettyCashList]);

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
                await insertPettyCash({         //sends mutation  to database to insert new record
                    variables: {
                        type: values.type,
                        amount: Number(values.amount),
                        description: values.description,
                        date: formattedDate,
                        category: values.category,
                        received_by: staffID, 
                        branch_id: branchID, 
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

            {!branchID && (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="No branch assigned to this staff account."
                    description="Petty cash records are loaded by branch, so this admin account needs a branch before records can be shown."
                />
            )}
            {error && (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message="Error loading petty cash data"
                    description={error.message}
                />
            )}

            <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Low of Stock Table */}
          <PettyCashTable
            transactions={filteredPettyCashList}
            loading={loading}
            category={categoryFilter}
            dateRange={dateRange}
            categoryOptions={categoryOptions}
            filteredTotal={filteredTotals.totalExpenses + filteredTotals.totalReplenishment}
            onCategoryChange={setCategoryFilter}
            onDateRangeChange={setDateRange}
            onEdit={handleEdit}
            onDelete={handleDeleteTransaction}
          />
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

