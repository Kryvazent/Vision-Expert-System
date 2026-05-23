import React , { useState, useEffect } from 'react'
import { Layout, Typography, Tabs, Button, Row, Col, Card, message } from 'antd'
import {
    AppstoreOutlined,
    ClockCircleOutlined,
    BankOutlined,
    PlusOutlined,
    WarningOutlined,
    StopOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons'
import {useAuth} from '../../const/functions'
import { gql } from '@apollo/client'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react/compiled'

import StatCard from '../../component/owner/stock-handling/StatCard'
import DamagedStockTable from '../../component/Admin/inventory-management/DamagedStockTable'
import LowStockTable from '../../component/Admin/inventory-management/LowStockTable'
import OutOfStockTable  from '../../component/Admin/inventory-management/OutOfStockTable'
import StockItemsTable from '../../component/Admin/inventory-management/StockItemsTable'

import CentralStockTable from '../../component/owner/stock-handling/CentralStockTable'
import DistributionHistoryTable from '../../component/owner/stock-handling/DistributionHistoryTable'
import BranchStockTable from '../../component/owner/stock-handling/BranchStockTable'
import DistributionModal from '../../component/owner/stock-handling/DistributionModal'
import AddStockModal from '../../component/owner/stock-handling/AddStockModal'

const { Title, Text } = Typography
const { Content } = Layout

const LOAD_HEAD_OFFICE = gql `
  query LoadHeadOffice{
    head_officeCollection{
      edges{
        node{
          id
          branch_id
          branch{
            id
            branch_name
          }
        }
      }
    }
  }
`;

//Main stock is filter by haed office branch_id
const LOAD_MAIN_STOCK = gql`
  query LoadMainStock($branch_id: Int!){
      stockCollection(
        filter: {branch_id: {eq: $branch_id}}
      ){
        edges{
          node{
            id
            created_at
            available_quantity
            branch_id
            product{
              id
              name
              brand{
                brand
              }
                product_type{
                  id
                  type
              }
                supplier{
                  id
                  name
                  contact_no
                  email
              }
            }
          }
        }
      }
  }
`;

const LOAD_MAIN_LOW_STOCK = gql `
  query LoadMainLowStock($branch_id: Int!){
     stockCollection(
      filter: {
          branch_id: {eq: $branch_id}
          available_quantity: { lte: 100, gt: 0 }
      }
     ){
      edges{
        node{
          id
          available_quantity
          product{
            id
            name
            product_type{
              id
              type
            }
          }
        }
      }
     }
  }
`;

const LOAD_MAIN_OUT_STOCK = gql `
  query LoadMainOutStock($branch_id: Int!){
    stockCollection(
      filter: {
          branch_id: {eq: $branch_id}
          available_quantity: { eq: 0 }
      }
     ){
      edges{
        node{
          id
          available_quantity
          product{
            id
            name
            product_type{
              id
              type
            }
          }
        }
      }
    } 
  }
`;

const LOAD_MAIN_DAMAGED_STOCK = gql `
  query LoadMainDamagedStock($branch_id: Int!){
    damaged_stockCollection(
      filter: {
        stock: {branch_id: {eq: $branch_id} }
      }
    ){
      edges{
        node{
          id
          created_at
          stock_id
          damaged_quantity
          reason
          status_bool
          stock{
            id
            product{
              id
              name
              product_type{
                id
                type
              }  
            }
          }
        }
      }
    }
  }
`;

const LOAD_BRANCHES = gql `
  query LoadBranches{
    branchCollection(
      filter: { is_active: {eq: true}}
    ){
      edges{
        node{
          id
          branch_name
        }
      }
    }
  }
`;

const LOAD_DISTRIBUTIONS = gql`
  query LoadDistributions {
    stock_distributionCollection(
      orderBy: [{ id: DescNullsLast }]
    ) {
      edges {
        node {
          id
          quantity
          created_at
          status

          stock {
            id
            product {
              name
            }
          }

          branch {
            id
            branch_name
          }
        }
      }
    }
  }
`

const LOAD_BRANCH_STOCK = gql `
  query LoadBranchStock($branch_id: Int!){
    stockCollection(
      filter: {branch_id: { eq: $branch_id }}
    ){
      edges{
        node{
          id
          created_at
          available_quantity
          product{
            id
            name
            brand{
              brand
            }
              product_type {
                id
                type
            }
          }
        }
      }
    }
  }
`;

const CHECK_BRANCH_STOCK = gql `
  query CheckBranchStock(
    $product_id: BigInt!,
     $branch_id: Int!
  ){
    stockCollection(
      filter: {
        product_id: {eq: $product_id}
        branch_id: {eq: $branch_id}
      }
     ){
        edges{
          node{
            id
            available_quantity
          }
        }
     }
  }
`;

const LOAD_PRODUCT_TYPES = gql`
  query LoadProductTypes {
    product_typeCollection {
      edges {
        node { 
          id 
          type 
        }
      }
    }
  }
`;

const LOAD_REORDERS = gql`
  query LoadReOrders($branch_id: Int!) {
    re_orderCollection(
      filter: { branch_id: { eq: $branch_id } }
    ) {
      edges {
        node { 
          id 
          product_type_id 
          branch_id 
        }
      }
    }
  }
`;

const LOAD_SUPPLIERS = gql`
  query LoadSuppliers {
    supplierCollection(
      filter: { is_active: { eq: true } }
    ) {
      edges {
        node {
          id
          name
          contact_no
          email
        }
      }
    }
  }
`;

const UPDATE_STOCK_QUANTITY = gql`
  mutation UpdateStock($id: BigInt!, $quantity: BigInt!) {
    updatestockCollection(
      set: { available_quantity: $quantity }
      filter: { id: { eq: $id } }
    ) {
      records { 
        id 
        available_quantity 
      }
    }
  }
`;
 
const INSERT_DAMAGED_STOCK = gql`
  mutation InsertDamagedStock(
    $stock_id: BigInt!, 
    $quantity: BigInt!, 
    $reason: String!
    ) {
      insertIntodamaged_stockCollection(
        objects: [{
          stock_id: $stock_id
          damaged_quantity: $quantity
          reason: $reason
          status_bool: false
      }]
    ) {
      records { 
        id 
        stock_id 
        damaged_quantity 
        reason 
        status_bool 
      }
    }
  }
`;
 
const INSERT_REORDER = gql`
  mutation InsertReOrder(
    $product_type_id: BigInt!, 
    $branch_id: Int!
    ) {
      insertIntore_orderCollection(
        objects: [{
          product_type_id: $product_type_id
          branch_id: $branch_id
      }]
    ) {
      records { 
        id 
        product_type_id 
        branch_id 
      }
    }
  }
`;

const INSERT_STOCK = gql `
  mutation InsertStock(
    $product_id: BigInt!,
    $branch_id: Int!,
    $quantity: BigInt!,
    $added_by: BigInt!
  ){
    insertIntostockCollection(
      objects: [{
        product_id: $product_id
        branch_id: $branch_id
        available_quantity: $quantity
        added_by: $added_by
      }]
    ){
      records {
        id 
        available_quantity
      }
    } 
  }
`;

const INSERT_DISTRIBUTION = gql`
  mutation InsertDistribution(
    $stock_id: BigInt!
    $branch_id: Int!
    $quantity: BigInt!
    $status: String!
  ) {
    insertIntostock_distributionCollection(
      objects: [{
        stock_id: $stock_id
        branch_id: $branch_id
        quantity: $quantity
        status: $status
      }]
    ) {
      records {
        id
      }
    }
  }
`;

const INSERT_PRODUCT_TYPE = gql`
  mutation InsertProductType($type: String!) {
    insertIntoproduct_typeCollection(
      objects: [{ type: $type }]
    ) {
      records {
        id
        type
      }
    }
  }
`;

const INSERT_SUPPLIER = gql`
  mutation InsertSupplier(
    $name: String!
    $contact_no: String
    $email: String
    $address: String
  ) {
    insertIntosupplierCollection(
      objects: [{
        name: $name
        contact_no: $contact_no
        email: $email
        address: $address
      }]
    ) {
      records {
        id
        name
      }
    }
  }
`;

//  Tab label with badge count 
const TabLabel = ({ icon, text, count, color }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    {icon}
    {text}
    {count > 0 && (
      <span style={{
        background: color || '#DC2626',
        color: '#fff',
        borderRadius: 10,
        padding: '0px 7px',
        fontSize: 11,
        fontWeight: 700,
        marginLeft: 2,
      }}>
        {count}
      </span>
    )}
  </span>
)


export default function MainStockHandling() {

    const {staff} = useAuth()
    const branchId = staff?.branch?.id;

    const [headOfficeBranchId, setHeadOfficeBranchId] = useState(null)
    const [activeTab, setActiveTab]= useState('central')
    const [distributeProduct, setDistributeProduct] = useState(null)
    const [addStockOpen, setAddStockOpen] = useState(false)
    const [selectedBranch, setSelectedBranch] = useState(null)
    
    //Load head office branch ID first
    const {data: headOfficeData} = useQuery(LOAD_HEAD_OFFICE, {fetchPolicy: 'network-only'})
   
    useEffect(() => {
      const branchId = headOfficeData?.head_officeCollection?.edges?.[0]?.node?.branch_id
      if(branchId) setHeadOfficeBranchId(Number(branchId))
    }, [headOfficeData])

    //Load product types
    const {data: productTypesData, refetch: refetchProductTypes } = useQuery(LOAD_PRODUCT_TYPES)

    const productTypeList = productTypesData?.product_typeCollection?.edges.map(e => ({
      id: e.node.id,
      type: e.node.type
    })) || []

    const mapCategory = (type) => {
      if(!type) return 'unknown'
        return String(type).trim() 
    }

    const { data: suppliersData, refetch: refetchSuppliers } = useQuery(LOAD_SUPPLIERS)

    const supplierList = suppliersData?.supplierCollection?.edges.map(e => ({
      id: e.node.id,
      name: e.node.name,
      contact_no: e.node.contact_no,
      email: e.node.email,
    })) || []
 
    const {data: mainStockData, refetch: refetchMain} = useQuery(LOAD_MAIN_STOCK,{
      variables: {branch_id: headOfficeBranchId},
      skip: !headOfficeBranchId,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const {data: lowStockData, refetch: refetchLow} = useQuery(LOAD_MAIN_LOW_STOCK,{
      variables: { branch_id: headOfficeBranchId },
      skip: !headOfficeBranchId,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })


    const {data: outStockData, refetch: refetchOut} = useQuery(LOAD_MAIN_OUT_STOCK,{
      variables: {branch_id: headOfficeBranchId},
      skip: !headOfficeBranchId,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const {data: damagedData, refetch: refetchDamaged} = useQuery(LOAD_MAIN_DAMAGED_STOCK,{
      variables: { branch_id: headOfficeBranchId },
      skip: !headOfficeBranchId,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const { data: distributionData, refetch: refetchDistribution } = useQuery(LOAD_DISTRIBUTIONS, {
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const [CheckBranchStock] = useLazyQuery(CHECK_BRANCH_STOCK)

    const {data: branchesData} = useQuery(LOAD_BRANCHES, {fetchPolicy: 'network-only'})

    const branches = branchesData?.branchCollection?.edges
      ?.map(e => ({ 
        id: Number(e.node.id), 
        branch_name: e.node.branch_name }))
      .filter(b => b.id !== headOfficeBranchId) || []

      //  Branch stock
    const [loadBranchStock, {data: branchStockData}] = useLazyQuery(LOAD_BRANCH_STOCK,{fetchPolicy: 'network-only'})

    useEffect(() => {
      if(selectedBranch) {
        loadBranchStock({
          variables: {
            branch_id: Number(selectedBranch)
          }})
      }
    }, [selectedBranch, loadBranchStock])

    const [loadReOrders, {data: reOrderData, refetch: refetchReOrders}] = useLazyQuery(LOAD_REORDERS,{
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    useEffect(() => {
      if(headOfficeBranchId) {
        loadReOrders({
          variables: {
            branch_id: headOfficeBranchId
          }})
      }
    }, [headOfficeBranchId])

    const reOrderedTypeIds = new Set(
      reOrderData?.re_orderCollection?.edges.map(e => String(e.node.product_type_id)) || []
    )

    const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY)
    const [insertDamageStock] = useMutation(INSERT_DAMAGED_STOCK)
    const [insertReOrder] = useMutation(INSERT_REORDER)
    const [insertStock] = useMutation(INSERT_STOCK)
    const [InsertDistribution] = useMutation(INSERT_DISTRIBUTION)
    const [InsertProductType] = useMutation(INSERT_PRODUCT_TYPE)
    const [InsertSupplier] = useMutation(INSERT_SUPPLIER)

    const refetchAll = () => {
      refetchMain()
      refetchLow()
      refetchOut()
      refetchDamaged()
      refetchReOrders && refetchReOrders()
    }

    const stockList = mainStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      id: item.node.id,
      productId: item.node.product.id, 
      branchName: 'Central Warehouse',
      productCode: `STK-${String(item.node.id).padStart(4,'0')}`,
      productName: item.node.product.name,
      brand: item.node.product.brand?.brand || '',  
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      date: item.node.created_at?.split('T')[0],
      quantity: Number(item.node.available_quantity),
      stockQuantity: Number(item.node.available_quantity), //  keep for StockItemsTable
      supplierName: item.node.product.supplier?.name || '',
      supplierContact: item.node.product.supplier?.contact_no || '',
      supplierEmail: item.node.product.supplier?.email || '',
    })) || []

    const lowStockList = lowStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      productName: item.node.product.name,
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      quantity: Number(item.node.available_quantity),
    })) || []

    const outOfStockList = outStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      productName: item.node.product.name,
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      quantity: Number(item.node.available_quantity),
    })) || []

  const damagedStockList = damagedData?.damaged_stockCollection?.edges.map((item, index) => ({
    key: index,
    id: item.node.id,
    stock_id: item.node.stock_id,
    productName: item.node.stock?.product?.name || 'Unknown',
    category: mapCategory(item.node.stock?.product?.product_type?.type),
    damaged_quantity: Number(item.node.damaged_quantity),
    reason: item.node.reason,
    created_at: item.node.created_at,
    status_bool: item.node.status_bool,
  })) || []

  const branchStockList = branchStockData?.stockCollection?.edges.map((item, index) => ({
    key: index,
    id: item.node.id,
    productName: item.node.product.name,
    brand: item.node.product.brand?.brand || '',
    date: item.node.created_at?.split('T')[0],
    productTypeId: item.node.product.product_type?.id,
    category: mapCategory(item.node.product.product_type?.type),
    stockQuantity: Number(item.node.available_quantity),
  })) || []

  const distributionList = distributionData?.stock_distributionCollection?.edges.map((item, index) => ({
      key: index,
      distributionId: `DST-${String(item.node.id).padStart(4, '0')}`,
      date: item.node.created_at?.split('T')[0],
      productName:item.node.stock?.product?.name || 'Unknown Product',
      branch:item.node.branch?.branch_name || 'Unknown Branch',
      quantity: Number(item.node.quantity),
      status: item.node.status || 'Pending Approval',
    })
  ) || []

  const totalProducts = productTypeList.length
  const totalAvailable = stockList.reduce((sum, item) => sum+item.stockQuantity, 0)
  const lowStockItems = lowStockList.length
  const outOfStockItems = outOfStockList.length
  const pendingDist = distributionList.filter(d => d.status === 'Pending Approval').length
  const pendingDamaged = damagedStockList.filter(i => i.status_bool === false).length

  //Handlers
  const handleReOrders = async(productTypeId) => {
    try{
      await insertReOrder({
        variables: {
          product_type_id: productTypeId,
          branch_id: headOfficeBranchId,
        }
      })
      refetchAll()
      message.success("Reorder request submitted.")
    }catch(err){
      console.error("Reorder failed:", err)
      message.error("Reorder failed.")
    }
  }

    const handleDistribute = (product) => setDistributeProduct(product)

    const handleDistributeSubmit = async(values) => {
      try{
        const product = distributeProduct
        const targetBranchId = values.branch
        const qty = Number(values.quantity)

        if(!product){
          message.error("No product selected")
          return
        }
        //Reduce central stock
        const newCentralQty = product.stockQuantity  - qty

        if(newCentralQty < 0 ){
          message.error('Not enough stock to distribute!')
          return
        }

        await updateStock({
          variables: {
            id: product.id,
            quantity: newCentralQty
          }
        })

        const result = await CheckBranchStock({
          variables: {
            product_id: product.productId,
            branch_id: targetBranchId
          }
        })

        const existingStock = result?.data?.stockCollection?.edges?.[0]?.node

        if(existingStock){
          const updatedQty = 
            Number(existingStock.available_quantity) + qty

            await updateStock({
              variables: {
                id: existingStock.id,
                quantity: updatedQty
              }
            })

            
        }else{
          await insertStock({
            variables: {
              product_id: product.productId,
              branch_id: targetBranchId,
              quantity: qty,
              added_by: Number(staff?.id),
            }
          })
        }

        await InsertDistribution({
          variables: {
            stock_id: product.id,
            branch_id: targetBranchId,
            quantity: qty,
            status: 'Pending Approval'
          }
        })

        refetchDistribution()
        refetchAll()
        setDistributeProduct(null)
        message.success('Stock distributed successfully.')

      }catch(err){
        console.error("Distribution failed:"+err)
        message.error('Distribution failed')
      }
    }

    const handleAddStock = async(values) => {
      try{
        if (values.newCategory) {
          await InsertProductType({ variables: { type: values.newCategory } })
          refetchProductTypes()  // refresh category tabs immediately
          message.success(`New category "${values.newCategory}" added.`)
        }

        if (values.supplierName) {
          await InsertSupplier({
            variables: {
              name: values.supplierName,
              contact_no: values.supplierContact || null,
              email: values.supplierEmail || null,
              address: values.supplierAddress || null,
            }
          })
          refetchSuppliers()
        }

        setAddStockOpen(false)
        message.success('Stock addition request submitted.')
        refetchAll()

      }catch(err){
        console.error(err)
        message.error('Failed to add stock.')
      }
    }

    const tabItems = [
      {
        key: 'central',
        label: 
          <TabLabel
            icon={<AppstoreOutlined />}
            text={`Central Stock (${stockList.length} items)`}
          />,
        
        children: (
          <CentralStockTable
            data={stockList}
            onDistribute={handleDistribute}
          />
        ),
      },
      {
        key: 'distribute',
        label: (
          <TabLabel
            icon={<ClockCircleOutlined />}
            text="Distribution History"
            count={pendingDist}
            color="#7C3AED"
          />
        ),
        children: (<DistributionHistoryTable data={distributionList} /> ),
      },
      {
        key: 'branch',
        label: (
          <TabLabel icon={<BankOutlined />} text="Branch Stock Levels" />
        ),
        children: (
          <BranchStockTable 
            branches={branches} 
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            data={branchStockList}
            productTypeList={productTypeList}

          />
        ),
      },
      {
        key: 'lowstock',
        label: (
          <TabLabel
            icon={<WarningOutlined />}
            text="Low Stock"
            count={lowStockItems}
            color="#D97706"
          />
        ),
        children: (
          <LowStockTable
            data={lowStockList}
            reOrderedTypeIds={reOrderedTypeIds}
            onReOrder={handleReOrders}
          />
        ),
      },
      {
        key: 'outofstock',
        label: (
          <TabLabel
            icon={<StopOutlined />}
            text="Out of Stock"
            count={outOfStockItems}
            color="#DC2626"
          />
        ),
        children: (
          <OutOfStockTable
            data={outOfStockList}
            reOrderedTypeIds={reOrderedTypeIds}
            onReOrder={handleReOrders}
          />
        ),
      },
      {
        key: 'damaged',
        label: (
          <TabLabel
            icon={<ExclamationCircleOutlined />}
            text="Damaged Items"
            count={pendingDamaged}
            color="#7C3AED"
          />
        ),
        children: (
          <DamagedStockTable
            data={damagedStockList}
         />
        ),
      },
    ]
 
    if(!headOfficeBranchId){
      return <div>Loading stock data...</div>
    }

  return (
    <Layout>
      <Content style={{ padding: '24px', background: '#F9FAFB', minHeight: '100vh' }}>
        <div style={{
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start', 
          marginBottom: 24,
        }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#111827' }}>
              Central Stock Management
            </Title>

            <Text type="secondary" style={{ fontSize: 13 }}>
              Manage main warehouse inventory
            </Text>

          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddStockOpen(true)}
            style={{
              background: '#1D4ED8', 
              borderColor: '#1D4ED8',
              borderRadius: 8, 
              height: 38, 
              fontWeight: 500, 
              fontSize: 14,
            }}
          >
            Add New Stock
          </Button>
        </div>
        

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Total Products"
      value={totalProducts}
      icon={<AppstoreOutlined />}
      color="#1D4ED8"
      bg="#ffffff"
    />
  </Col>

  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Total Units"
      value={totalAvailable.toLocaleString()}
      icon={<BankOutlined />}
      color="#059669"
      bg="#ffffff"
    />
  </Col>

  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Low Stock Items"
      value={lowStockItems}
      icon={<WarningOutlined />}
      color="#de8015"
      bg="#ffffff"
      alert
    />
  </Col>

  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Out of Stock"
      value={outOfStockItems}
      icon={<StopOutlined />}
      color="#c50b0b"
      bg="#ffffff"
      alert
    />
  </Col>

  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Pending Distributions"
      value={pendingDist}
      icon={<ClockCircleOutlined />}
      color="#72ddf3"
      bg="#ffffff"
    />
  </Col>

  <Col xs={24} sm={12} md={8} lg={4}>
    <StatCard
      label="Damage Reports"
      value={pendingDamaged}
      icon={<ExclamationCircleOutlined />}
      color="#7C3AED"
      bg="#ffffff"
      alert
    />
  </Col>
</Row>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '0 20px 20px',boxShadow: '0 1px 4px rgba(0,0,0,0.06)'}}>
          
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ fontWeight: 500 }}
          />
        </div>

        <DistributionModal 
          open={!!distributeProduct}
          product={distributeProduct}
          branches={branches}
          onCancel={() => setDistributeProduct(null)}
          onSubmit={handleDistributeSubmit}
        />

        <AddStockModal 
          open={addStockOpen}
          onCancel={() => setAddStockOpen(false)}
          onAdd={handleAddStock}
          productTypeList={productTypeList}
          supplierList={supplierList}
        />
      </Content>
    </Layout>
  )
}
