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
import { useQuery, useMutation, useLazyQuery } from '@apollo/client/react'

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
        orderBy: [{ created_at: DescNullsLast }]
      ){
        edges{
          node{
            id
            created_at
            available_quantity
            branch_id
            supplier_id
            supplier{
              id
              name
              contact_no
              email
            }
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
  query LoadMainDamagedStock{
    damaged_stockCollection{
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
            branch_id        
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
          notes
          stock {
            id
            product {
              id
              name
              product_type {
                id
                type
              }
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
  query LoadReOrders {
    re_orderCollection{
      edges {
        node { 
          id 
          product_type_id 
          branch_id 
          branch{
            branch_name
          }
            product_type{
              type
          }
        }
      }
    }
  }
`;

// load all reorders with branch and product type info
// So owner can see WHO needs WHAT
const LOAD_ALL_REORDERS = gql`
  query LoadAllReorders {
    re_orderCollection(
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          created_at
          branch_id
          product_type_id
          branch { branch_name }
          product_type { type }
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

const UPDATE_DISTRIBUTION_STATUS = gql`
  mutation UpdateDistributionStatus($id: BigInt!, $status: String!) {
    updatestock_distributionCollection(
      set: { status: $status }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
        status
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
    $added_by: BigInt!,
    $supplier_id: BigInt
  ){
    insertIntostockCollection(
      objects: [{
        product_id: $product_id
        branch_id: $branch_id
        available_quantity: $quantity
        added_by: $added_by
        supplier_id: $supplier_id
    
      }]
    ){
      records {
        id 
        available_quantity
        supplier_id
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
    $notes: String
  ) {
    insertIntostock_distributionCollection(
      objects: [{
        stock_id: $stock_id
        branch_id: $branch_id
        quantity: $quantity
        status: $status
        notes: $notes
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

const INSERT_PRODUCT = gql`
  mutation InsertProduct(
    $name: String!
    $product_type_id: BigInt!
    $brand_id: BigInt!
    $purchase_price: Float!
    $selling_price: Float!
    $purchased_quantity: BigInt!
    $warranty_in_months: BigInt!
  ) {
    insertIntoproductCollection(
      objects: [{
        name: $name
        product_type_id: $product_type_id
        brand_id: $brand_id
        purchase_price: $purchase_price
        selling_price: $selling_price
        purchased_quantity: $purchased_quantity
        warranty_in_months: $warranty_in_months
      }]
    ) {
      records { id name }
    }
  }
`;

const LOAD_BRANDS = gql`
  query LoadBrands {
    brandCollection(orderBy: [{ brand: AscNullsLast }]) {
      edges {
        node { id brand }
      }
    }
  }
`;

const DELETE_REORDER = gql`
  mutation DeleteReorder($id: BigInt!) {
    deleteFromre_orderCollection(
      filter: { id: { eq: $id } }
    ) {
      records { id }
    }
  }
`

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

    const mapCategory = (type) => type ? String(type).trim() : 'Unknown'
    
    const { data: brandsData} = useQuery(LOAD_BRANDS, {fetchPolicy: 'network-only'})
    const brandList = brandsData?.brandCollection?.edges.map(e => ({
        id: e.node.id,
        brand: e.node.brand,
    })) || []

    const { data: suppliersData, refetch: refetchSuppliers } = useQuery(LOAD_SUPPLIERS)
    const supplierList = suppliersData?.supplierCollection?.edges.map(e => ({
      id: e.node.id,
      name: e.node.name,
      contact_no: e.node.contact_no,
      email: e.node.email,
      address: e.node.address,
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
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const { data: distributionData, refetch: refetchDistribution } = useQuery(LOAD_DISTRIBUTIONS, {
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })


    const {data: branchesData} = useQuery(LOAD_BRANCHES, {fetchPolicy: 'network-only'})

    const allBranches = branchesData?.branchCollection?.edges
      ?.map(e => ({ 
        id: Number(e.node.id), 
        branch_name: e.node.branch_name })) || []

    //branches for distribute modal — excludes head office
    const distributionBranches = allBranches.filter(b => b.id !== headOfficeBranchId)
    // branches for branch stock tab — includes all branches including head office
    const allBranchesForStock = allBranches
      //  Branch stock
    const [loadBranchStock, {data: branchStockData}] = useLazyQuery(LOAD_BRANCH_STOCK,{fetchPolicy: 'network-only'})

    const refreshBranchStock = () => {
      if (selectedBranchId) {
        loadBranchStock({
          variables: {
            branch_id: selectedBranchId,
          },
        })
      }
    }

    useEffect(() => {
      if(selectedBranch !== null && selectedBranch !== undefined) {
        refreshBranchStock()
      }
    }, [selectedBranch, loadBranchStock])

    const [loadReOrders, {data: reOrderData}] = useLazyQuery(LOAD_REORDERS,{
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const selectedBranchId = selectedBranch !== null && selectedBranch !== undefined ? Number(selectedBranch) : null

    useEffect(() => {
        loadReOrders()

    }, [loadReOrders])

    const reOrderedTypeIds = new Set(
      reOrderData?.re_orderCollection?.edges
      // only head office branch reorders affect owner's reorder badge
        .filter(e => Number(e.node.branch_id) === headOfficeBranchId)
        .map(e => String(e.node.product_type_id)) || []
    )

    const allReOrderedTypeIds = new Set(
      reOrderData?.re_orderCollection?.edges
        .map(e => String(e.node.product_type_id)) || []
    )

    const branchReorderKeys = new Set(
      selectedBranchId
        ? (reOrderData?.re_orderCollection?.edges || [])
            .filter(e => Number(e.node.branch_id) === selectedBranchId)
            .map(e => `${e.node.branch_id}-${e.node.product_type_id}`)
        : []
    )

    const[CheckBranchStock] = useLazyQuery(CHECK_BRANCH_STOCK)

    const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY)
    const [updateDistributionStatus] = useMutation(UPDATE_DISTRIBUTION_STATUS)
    const [insertDamageStock] = useMutation(INSERT_DAMAGED_STOCK)
    const [insertReOrder] = useMutation(INSERT_REORDER)
    const [insertStock] = useMutation(INSERT_STOCK)
    const [InsertDistribution] = useMutation(INSERT_DISTRIBUTION)
    const [deleteReorder] = useMutation(DELETE_REORDER)
    const [InsertProductType] = useMutation(INSERT_PRODUCT_TYPE)
    const [InsertSupplier] = useMutation(INSERT_SUPPLIER)
    const [InsertProduct] = useMutation(INSERT_PRODUCT)

    const refetchAll = () => {
      refetchMain()
      refetchLow()
      refetchOut()
      refetchDamaged()
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
      supplierName: item.node.supplier?.name || '',
      supplierContact: item.node.supplier?.contact_no || '',
      supplierEmail: item.node.supplier?.email || '',
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

  const damagedStockList = damagedData?.damaged_stockCollection?.edges
    .filter(({ node }) => Number(node.stock?.branch_id) === headOfficeBranchId)
    .map((item, index) => ({
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

  const distributionList = distributionData?.stock_distributionCollection?.edges.map((item, index) => {
    const sourceStock = stockList.find((stock) => String(stock.id) === String(item.node.stock?.id))

    return {
      key: index,
      distributionId: `DST-${String(item.node.id).padStart(4, '0')}`,
      rawId: item.node.id,
      date: item.node.created_at?.split('T')[0],
      productName: item.node.stock?.product?.name || 'Unknown Product',
      productId: item.node.stock?.product?.id,
      productTypeId: item.node.stock?.product?.product_type?.id,
      stockId: item.node.stock?.id,
      mainStockQuantity: sourceStock?.stockQuantity ?? 0,
      branch: item.node.branch?.branch_name || 'Unknown Branch',
      branchId: item.node.branch?.id,
      quantity: Number(item.node.quantity),
      status: item.node.status || 'Pending Approval',
      notes: item.node.notes || '',
    }
  }) || []

  //STATCARDS
  const totalProducts = productTypeList.length
  const totalAvailable = stockList.reduce((sum, item) => sum+item.stockQuantity, 0)
  const lowStockItems = lowStockList.length
  const outOfStockItems = outOfStockList.length
  const pendingDist = distributionList.filter(d => d.status === 'Pending Approval').length
  const pendingDamaged = damagedStockList.filter(i => i.status_bool === false).length

  //Handlers
  const handleReOrders = async(productTypeId, branchIdValue = headOfficeBranchId) => {
    try{
      await insertReOrder({
        variables: {
          product_type_id: productTypeId,
          branch_id: Number(branchIdValue),
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
        const targetBranchId = Number(values.branch)
        const qty = Number(values.quantity)

        if(!product){
          message.error("No product selected")
          return
        }

        if((product.stockQuantity ?? 0) < qty){
          message.error('Not enough stock to distribute!')
          return
        }

        await InsertDistribution({
          variables: {
            stock_id: product.id,
            branch_id: targetBranchId,
            quantity: qty,
            status: 'Pending Approval',
            notes: values.notes || '',
          }
        })

        refreshBranchStock()
        refetchDistribution()
        refetchAll()
        setDistributeProduct(null)
        message.success('Distribution request submitted for approval.')

      }catch(err){
        console.error("Distribution failed:"+err)
        message.error('Distribution failed')
      }
    }

    const handleApproveDistribution = async(record) => {
      try {
        const targetBranchId = Number(record.branchId)
        const qty = Number(record.quantity)
        const mainStockId = Number(record.stockId)
        const productId = Number(record.productId)

        if (!record.productId || !record.stockId || !targetBranchId) {
          message.error('Distribution details are incomplete.')
          return
        }

        if ((record.mainStockQuantity ?? 0) < qty) {
          message.error('Main stock is no longer sufficient for this approval.')
          return
        }

        const newCentralQty = Number(record.mainStockQuantity ?? 0) - qty
        await updateStock({
          variables: {
            id: mainStockId,
            quantity: newCentralQty,
          },
        })

        const result = await CheckBranchStock({
          variables: {
            product_id: productId,
            branch_id: targetBranchId,
          },
        })

        const existingStock = result?.data?.stockCollection?.edges?.[0]?.node

        if (existingStock) {
          const updatedQty = Number(existingStock.available_quantity) + qty
          await updateStock({
            variables: {
              id: existingStock.id,
              quantity: updatedQty,
            },
          })
        } else {
          await insertStock({
            variables: {
              product_id: productId,
              branch_id: targetBranchId,
              quantity: qty,
              added_by: Number(staff?.id),
              supplier_id: null,
            },
          })
        }

        await updateDistributionStatus({
          variables: {
            id: Number(record.rawId),
            status: 'Approved',
          },
        })

        const matchingReorder = reOrderData?.re_orderCollection?.edges?.find(
          (e) => Number(e.node.branch_id) === targetBranchId && Number(e.node.product_type_id) === record.productTypeId
        )

        if (matchingReorder) {
          await deleteReorder({
            variables: {
              id: matchingReorder.node.id,
            },
          })
        }

        refreshBranchStock()
        refetchDistribution()
        refetchAll()
        message.success('Distribution approved and branch stock updated.')
      } catch (err) {
        console.error('Approve distribution failed:', err)
        message.error('Unable to approve distribution.')
      }
    }

    const handleAddStock = async(values) => {
      try{
        let finalProductTypeId = values.productTypeId

        if (values.newCategory) {
          const catResult = await InsertProductType({ variables: { type: values.newCategory } })
          finalProductTypeId = catResult.data?.insertIntoproduct_typeCollection?.records?.[0]?.id
          refetchProductTypes()  // refresh category tabs immediately
          message.success(`New category "${values.newCategory}" added.`)
        }

        let supplierId = values.supplierId || null
        if (values.supplierName && !values.supplierId) {
          const supResult = await InsertSupplier({
            variables: {
              name: values.supplierName,
              contact_no: values.supplierContact || null,
              email: values.supplierEmail || null,
              address: values.supplierAddress || null,
            }
          })
          supplierId = supResult.data?.insertIntosupplierCollection?.records?.[0]?.id
          refetchSuppliers()
         }
        const productResult = await InsertProduct({
                variables: {
                    name: values.productName,
                    product_type_id: Number(finalProductTypeId),
                    brand_id: Number(values.brandId),
                    purchase_price: Number(values.purchasePrice),
                    selling_price: Number(values.sellingPrice || values.purchasePrice),
                    purchased_quantity: Number(values.quantity),
                    warranty_in_months: Number(values.warrantyMonths || 0),
                }
            })
            const newProductId = productResult.data?.insertIntoproductCollection?.records?.[0]?.id

            if (!newProductId) { message.error('Failed to create product'); return }

            await insertStock({
                variables: {
                    product_id: Number (newProductId),
                    branch_id: headOfficeBranchId,
                    quantity: Number(values.quantity),
                    added_by: Number(staff?.id),
                    supplier_id: supplierId ? Number(supplierId) : null,
                }
            })
        setAddStockOpen(false)
        refetchAll()
        message.success('Stock added to central warehouse successfully.')
        
      }catch(err){
        console.error('Add stock failed:',err)
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
        children: (
          <DistributionHistoryTable
            data={distributionList}
          />
        ),
      },
      {
        key: 'branch',
        label: (
          <TabLabel icon={<BankOutlined />} text="Branch Stock Levels" />
        ),
        children: (
          <BranchStockTable 
            branches={allBranchesForStock} 
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            data={branchStockList}
            productTypeList={productTypeList}
            reOrderedKeys={branchReorderKeys}
            onReOrder={handleReOrders}
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
      return <div style={{ padding: 40, textAlign: 'center' }}>Loading stock data...</div>
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
          branches={distributionBranches}
          onCancel={() => setDistributeProduct(null)}
          onSubmit={handleDistributeSubmit}
        />

        <AddStockModal 
          open={addStockOpen}
          onCancel={() => setAddStockOpen(false)}
          onAdd={handleAddStock}
          productTypeList={productTypeList}
          supplierList={supplierList}
          brandList = {brandList}
        />
      </Content>
    </Layout>
  )
}
