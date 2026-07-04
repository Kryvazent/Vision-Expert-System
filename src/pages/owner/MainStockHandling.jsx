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

import DistributionHistoryTable from '../../component/owner/stock-handling/DistributionHistoryTable'
import BranchStockTable from '../../component/owner/stock-handling/BranchStockTable'
import DistributionModal from '../../component/owner/stock-handling/DistributionModal'
import AddStockModal from '../../component/owner/stock-handling/AddStockModal'
import DamageHistoryTable from '../../component/owner/stock-handling/DamageHistoryTable'

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
              sku
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

const LOAD_MAIN_FRAMES = gql`
  query LoadMainFrames($branch_id: Int!) {
    frameCollection(
      filter: { branch_id: { eq: $branch_id } }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          serial_no
          color
          status
          created_at
          product_id
          product {
            id
            name
            sku
          }
          frame_type {
            type
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
          review_status
          rejection_reason
          reviewed_by
          reviewed_at
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

const LOAD_DAMAGED_FRAMES = gql`
  query LoadDamagedFrames($branch_id: Int!) {
    frameCollection(
      filter: { 
        branch_id: { eq: $branch_id },
        status: { eq: "damaged" }
      }
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          serial_no
          color
          created_at
          product_id
          frame_type_id
          branch_id
          status
          product {
            id
            name
            sku
          }
          frame_type {
            type
          }
        }
      }
    }
  }
`;

const LOAD_DAMAGE_HISTORY = gql`
  query LoadDamageHistory {
    damage_historyCollection(orderBy: [{ created_at: DescNullsLast }]) {
      edges {
        node {
          id
          reference_table
          reference_id
          event_type
          stock_id
          branch_id
          quantity
          reason
          approved
          approved_by
          approved_at
          created_at
          stock {
            id
            product {
              id
              name
              sku
            }
          }
        }
      }
    }
  }
`

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
          frame_id
          frame {
            id
            serial_no
          }
          stock {
            id
            product {
              id
              name
              sku
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

// ── branch_frame_stock view: real-time per-branch frame counts ─────────────
const LOAD_BRANCH_FRAME_STOCK = gql`
  query LoadBranchFrameStock($branch_id: Int!) {
    branch_frame_stockCollection(
      filter: { branch_id: { eq: $branch_id } }
    ) {
      edges {
        node {
          branch_id
          product_id
          product_name
          product_sku
          frame_type
          in_stock_count
          reserved_count
          sold_count
          damaged_count
          transferred_count
        }
      }
    }
  }
`

// ── branch_low_stock view: products below threshold ────────────────────────
const LOAD_BRANCH_LOW_FRAME_STOCK = gql`
  query LoadBranchLowFrameStock($branch_id: Int!) {
    branch_low_stockCollection(
      filter: { branch_id: { eq: $branch_id } }
    ) {
      edges {
        node {
          branch_id
          product_id
          product_name
          product_sku
          frame_type
          in_stock_count
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
            sku
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

const LOAD_FRAME_TYPES = gql`
  query LoadFrameTypes {
    frame_typeCollection {
      edges {
        node {
          id
          type
        }
      }
    }
  }
`;

const INSERT_FRAME = gql`
  mutation InsertFrame(
    $product_id: BigInt!
    $branch_id: Int!
    $serial_no: String!
    $frame_type_id: BigInt!
    $color: String
    $status: String!
  ) {
    insertIntoframeCollection(
      objects: [{
        product_id: $product_id
        branch_id: $branch_id
        serial_no: $serial_no
        frame_type_id: $frame_type_id
        color: $color
        status: $status
      }]
    ) {
      records {
        id
        serial_no
        status
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
          review_status: "Pending"
      }]
    ) {
      records { 
        id 
        stock_id 
        damaged_quantity 
        reason 
        status_bool 
        review_status
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
    $frame_id: BigInt
  ) {
    insertIntostock_distributionCollection(
      objects: [{
        stock_id: $stock_id
        branch_id: $branch_id
        quantity: $quantity
        status: $status
        notes: $notes
        frame_id: $frame_id
      }]
    ) {
      records { id }
    }
  }
`;

const UPDATE_FRAME_STATUS = gql`
  mutation UpdateFrameStatusOwner($id: BigInt!, $status: String!) {
    updateframeCollection(
      set: { status: $status }
      filter: { id: { eq: $id } }
    ) {
      records { id status }
    }
  }
`;

const UPDATE_FRAME_BRANCH = gql`
  mutation UpdateFrameBranchOwner($id: BigInt!, $branch_id: Int!, $status: String!) {
    updateframeCollection(
      set: { branch_id: $branch_id, status: $status }
      filter: { id: { eq: $id } }
    ) {
      records { id branch_id status }
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
    $sku: String!
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
        sku: $sku
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

const LOAD_CATEGORY_BRAND_MAP = gql`
  query LoadCategoryBrandMap {
    product_type_brandCollection(orderBy: [{ id: AscNullsLast }]) {
      edges {
        node {
          id
          product_type_id
          brand_id
        }
      }
    }
  }
`;

const UPDATE_DAMAGED_STOCK_STATUS = gql`
  mutation UpdateDamagedStockStatus(
    $id: BigInt!
    $status_bool: Boolean!
    $review_status: String!
    $reviewed_by: Int
    $reviewed_at: Datetime
    $rejection_reason: String
  ) {
    updatedamaged_stockCollection(
      set: {
        status_bool: $status_bool
        review_status: $review_status
        reviewed_by: $reviewed_by
        reviewed_at: $reviewed_at
        rejection_reason: $rejection_reason
      }
      filter: { id: { eq: $id } }
    ) {
      records {
        id
        status_bool
        review_status
        rejection_reason
        reviewed_by
        reviewed_at
      }
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

    const { data: categoryBrandMapData } = useQuery(LOAD_CATEGORY_BRAND_MAP, { fetchPolicy: 'network-only' })
    const categoryBrandMap = categoryBrandMapData?.product_type_brandCollection?.edges.map(e => ({
      id: e.node.id,
      productTypeId: e.node.product_type_id,
      brandId: e.node.brand_id,
    })) || []

    const { data: frameTypesData } = useQuery(LOAD_FRAME_TYPES, { fetchPolicy: 'network-only' })
    const frameTypeList = frameTypesData?.frame_typeCollection?.edges.map(e => ({
      id: e.node.id,
      type: e.node.type,
    })) || []

    // keep supplier query so existing distribution logic isn't broken
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

    const { data: mainFrameData, refetch: refetchFrames } = useQuery(LOAD_MAIN_FRAMES, {
      variables: { branch_id: headOfficeBranchId },
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

    const { data: damagedFramesData, refetch: refetchDamagedFrames } = useQuery(LOAD_DAMAGED_FRAMES, {
      variables: { branch_id: headOfficeBranchId },
      skip: !headOfficeBranchId,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
    })

    const { data: damageHistoryData, refetch: refetchDamageHistory } = useQuery(LOAD_DAMAGE_HISTORY, {
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

    // ── frame stock
    const headOfficeFrameRows = mainFrameData?.frameCollection?.edges.map((item) => ({
      id: item.node.id,
      product_id: item.node.product_id,
      serial_no: item.node.serial_no,
      color: item.node.color,
      status: item.node.status,
      created_at: item.node.created_at,
      frame_type: item.node.frame_type?.type || '—',
      product_name: item.node.product?.name || '—',
      product_sku: item.node.product?.sku || '',
    })) || []

    const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY)
    const [insertDamageStock] = useMutation(INSERT_DAMAGED_STOCK)
    const [updateDamagedStockStatus] = useMutation(UPDATE_DAMAGED_STOCK_STATUS)
    const [insertReOrder] = useMutation(INSERT_REORDER)
    const [insertStock] = useMutation(INSERT_STOCK)
    const [InsertDistribution] = useMutation(INSERT_DISTRIBUTION)
    const [InsertProductType] = useMutation(INSERT_PRODUCT_TYPE)
    const [InsertSupplier] = useMutation(INSERT_SUPPLIER)
    const [InsertProduct] = useMutation(INSERT_PRODUCT)
    const [insertFrame] = useMutation(INSERT_FRAME)
    const [updateFrameStatus] = useMutation(UPDATE_FRAME_STATUS)
    const [updateFrameBranch] = useMutation(UPDATE_FRAME_BRANCH)

    const refetchAll = () => {
      refetchMain()
      refetchFrames()
      refetchLow()
      refetchOut()
      refetchDamaged()
      refetchDamagedFrames()
      refetchDamageHistory()
    }

    const stockList = mainStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      id: item.node.id,
      productId: item.node.product.id, 
      branchRawId: headOfficeBranchId,
      branchName: 'Central Warehouse',
      productCode: `STK-${String(item.node.id).padStart(4,'0')}`,
      productName: item.node.product.name,
      sku: item.node.product.sku || '',
      brand: item.node.product.brand?.brand || '',  
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      date: item.node.created_at?.split('T')[0],
      quantity: Number(item.node.available_quantity),
      stockQuantity: Number(item.node.available_quantity),
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
      branch_id: item.node.stock?.branch_id,
      productName: item.node.stock?.product?.name || 'Unknown',
      category: mapCategory(item.node.stock?.product?.product_type?.type),
      damaged_quantity: Number(item.node.damaged_quantity),
      reason: item.node.reason,
      created_at: item.node.created_at,
      status_bool: item.node.status_bool,
      review_status: item.node.review_status || (item.node.status_bool ? 'Approved' : 'Pending'),
      rejection_reason: item.node.rejection_reason,
      reviewed_by: item.node.reviewed_by,
      reviewed_at: item.node.reviewed_at,
  })) || []

  const damagedFramesList = damagedFramesData?.frameCollection?.edges?.map((item, index) => ({
    key: index,
    id: item.node.id,
    serial_no: item.node.serial_no,
    color: item.node.color,
    frame_type: item.node.frame_type?.type || '—',
    product_name: item.node.product?.name || '—',
    product_sku: item.node.product?.sku || '',
    created_at: item.node.created_at,
  })) || []

  const branchStockList = branchStockData?.stockCollection?.edges.map((item, index) => ({
    key: index,
    id: item.node.id,
    productName: item.node.product.name,
    sku: item.node.product.sku || '',
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
      frameId: item.node.frame_id || null,
      frameSerialNo: item.node.frame?.serial_no || null,
    }
  }) || []

  const damageHistoryList = damageHistoryData?.damage_historyCollection?.edges?.map((item) => ({
    id: item.node.id,
    reference_table: item.node.reference_table,
    reference_id: item.node.reference_id,
    event_type: item.node.event_type,
    stock_id: item.node.stock_id,
    branch_id: item.node.branch_id,
    quantity: Number(item.node.quantity ?? 0),
    reason: item.node.reason,
    approved: Boolean(item.node.approved),
    approved_by: item.node.approved_by,
    approved_at: item.node.approved_at,
    created_at: item.node.created_at,
    productName: item.node.stock?.product?.name || '—',
    productSku: item.node.stock?.product?.sku || '',
  })) || []

  //STATCARDS
  const totalProducts = productTypeList.length
  const totalAvailable = stockList.reduce((sum, item) => sum+item.stockQuantity, 0)
  const lowStockItems = lowStockList.length
  const outOfStockItems = outOfStockList.length
  const pendingDist = distributionList.filter(d => d.status === 'Pending Approval').length
  const pendingDamaged = damagedStockList.filter(i => (i.review_status || 'Pending') === 'Pending').length

  const handleApproveDamage = async (record) => {
    try {
      const sourceStock = stockList.find((item) => String(item.id) === String(record.stock_id))

      if (!sourceStock) {
        message.error('Source stock not found for this damage report.')
        return
      }

      const nextQuantity = Number(sourceStock.stockQuantity ?? 0) - Number(record.damaged_quantity ?? 0)

      await updateStock({
        variables: {
          id: Number(record.stock_id),
          quantity: nextQuantity,
        },
      })

      await updateDamagedStockStatus({
        variables: {
          id: Number(record.id),
          status_bool: true,
          review_status: 'Approved',
          reviewed_by: staff?.id ? Number(staff.id) : null,
          reviewed_at: new Date().toISOString(),
          rejection_reason: null,
        },
      })

      refetchAll()
      message.success('Damage report approved and stock updated.')
    } catch (err) {
      console.error('Approve damage failed:', err)
      message.error('Unable to approve damaged stock.')
    }
  }

  const handleRejectDamage = async (record) => {
    try {
      await updateDamagedStockStatus({
        variables: {
          id: Number(record.id),
          status_bool: false,
          review_status: 'Rejected',
          reviewed_by: staff?.id ? Number(staff.id) : null,
          reviewed_at: new Date().toISOString(),
          rejection_reason: 'Rejected by owner',
        },
      })

      refetchAll()
      message.success('Damage request rejected.')
    } catch (err) {
      console.error('Reject damage failed:', err)
      message.error('Unable to reject damaged stock.')
    }
  }

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

    const handleMarkFrameDamaged = async (frameId, _reason) => {
      try {
        await updateFrameStatus({
          variables: {
            id: Number(frameId),
            status: 'damaged',
          },
        })

        refetchAll()
        message.success('Frame marked as damaged.')
      } catch (err) {
        console.error('Mark frame damaged failed:', err)
        message.error('Unable to mark frame as damaged.')
      }
    }

    const handleTransferFrame = async (frame, targetBranchId) => {
      try {
        await updateFrameBranch({
          variables: {
            id: Number(frame.id),
            branch_id: Number(targetBranchId),
            status: 'in_stock',
          },
        })

        const sourceStock = stockList.find((item) => String(item.productId) === String(frame.product_id))

        if (sourceStock) {
          await InsertDistribution({
            variables: {
              stock_id: Number(sourceStock.id),
              branch_id: Number(targetBranchId),
              quantity: 1,
              status: 'Transferred',
              notes: `Frame transfer: ${frame.serial_no}`,
              frame_id: Number(frame.id),
            },
          })
        }

        refetchAll()
        message.success('Frame transferred successfully.')
      } catch (err) {
        console.error('Transfer frame failed:', err)
        message.error('Unable to transfer frame.')
      }
    }

    const handleDistribute = (product) => setDistributeProduct(product)

    const handleDistributeSubmit = async(values) => {
      try{
        const product = distributeProduct
        const targetBranchId = Number(values.branch)

        if(!product){
          message.error("No product selected")
          return
        }

        // ── Frame mode: one distribution record per selected frame ──────────
        if (values.frameMode === 'frame' && values.selectedFrameIds?.length > 0) {
          for (const frameId of values.selectedFrameIds) {
            await InsertDistribution({
              variables: {
                stock_id: product.id,
                branch_id: targetBranchId,
                quantity: 1,
                status: 'Pending Approval',
                notes: values.notes || '',
                frame_id: Number(frameId),
              }
            })
          }
          setDistributeProduct(null)
          refreshBranchStock()
          refetchDistribution()
          refetchAll()
          message.success(`${values.selectedFrameIds.length} frame distribution request(s) submitted for manager approval. Stock will be deducted once the manager approves.`)
          return
        }

        // ── Quantity mode ────────────────────────────────────────────────────
        const qty = Number(values.quantity)

        if((product.stockQuantity ?? 0) < qty){
          message.error('Not enough stock to distribute!')
          return
        }

        // Do NOT deduct central stock here — deduction happens when the
        // branch manager approves the allocation.
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
        message.success('Distribution request submitted. Stock will be deducted once the manager approves.')

      }catch(err){
        console.error("Distribution failed:"+err)
        message.error('Distribution failed')
      }
    }

    const handleAddStock = async ({ product: productValues, frames = [], quantity = 0, stockMode = 'serialised' }) => {
      try {
        // ── Step 1: optionally create a new category ──────────────────────
        let finalProductTypeId = productValues.productTypeId
        if (productValues.newCategory) {
          const catResult = await InsertProductType({ variables: { type: productValues.newCategory } })
          finalProductTypeId = catResult.data?.insertIntoproduct_typeCollection?.records?.[0]?.id
          refetchProductTypes()
          message.success(`New category "${productValues.newCategory}" added.`)
        }

        // ── Step 2: create the product catalog entry ───────────────────────
        const productResult = await InsertProduct({
          variables: {
            name: productValues.sku,
            sku: productValues.sku,
            product_type_id: Number(finalProductTypeId),
            brand_id: Number(productValues.brandId),
            purchase_price: Number(productValues.purchasePrice),
            selling_price: Number(productValues.sellingPrice || productValues.purchasePrice),
            purchased_quantity: stockMode === 'serialised' ? frames.length : Number(quantity),
            warranty_in_months: Number(productValues.warrantyMonths || 0),
          },
        })
        const newProductId = productResult.data?.insertIntoproductCollection?.records?.[0]?.id
        if (!newProductId) { message.error('Failed to create product'); return }

        // ── Step 3: create stock record ─
        await insertStock({
          variables: {
            product_id: Number(newProductId),
            branch_id: headOfficeBranchId,
            quantity: stockMode === 'serialised' ? frames.length : Number(quantity),
            added_by: Number(staff?.id),
            supplier_id: null,
          },
        })

        if (stockMode === 'serialised') {
          // ── Step 4: insert each individual frame row ─────────────────────
          const frameInserts = frames.map(f =>
            insertFrame({
              variables: {
                product_id: Number(newProductId),
                branch_id: headOfficeBranchId,
                serial_no: f.serial_no.trim(),
                frame_type_id: Number(f.frame_type_id),
                color: f.color?.trim() || null,
                status: 'in_stock',
              },
            })
          )
          await Promise.all(frameInserts)
        }

        setAddStockOpen(false)
        refetchAll()
        message.success(`${frames.length} stock item${frames.length !== 1 ? 's' : ''} added to central warehouse.`)
      } catch (err) {
        console.error('Add stock failed:', err)
        message.error('Failed to add stock: ' + (err?.message || 'unknown error'))
      }
    }

    const tabItems = [
      {
        key: 'central',
        label: 
          <TabLabel
            icon={<AppstoreOutlined />}
            text={`Stock Items (${stockList.length})`}
          />,
        
        children: (
          <StockItemsTable
            data={stockList}
            branches={distributionBranches}
            currentBranchId={headOfficeBranchId}
            updateStock={updateStock}
            insertDamageStock={insertDamageStock}
            onDistribute={handleDistribute}
            deductImmediately={false}
            onRefetch={refetchAll}
            productTypeList={productTypeList}
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
        // Read-only for owner — approval is handled by the branch manager.
        // Do NOT pass onApprove or onReject here.
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
            showReorderButton={false}
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
            showReorderButton={false}
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
            damagedFrames={damagedFramesList}
            onApproveDamage={handleApproveDamage}
            onRejectDamage={handleRejectDamage}
            ownerBranchId={headOfficeBranchId}
         />
        ),
      },
      {
        key: 'damagehistory',
        label: (
          <TabLabel
            icon={<ExclamationCircleOutlined />}
            text="Damage History"
          />
        ),
        children: (
          <DamageHistoryTable
            data={damageHistoryList}
            branches={allBranchesForStock}
          />
        ),
      },
    ]
 
    if(!headOfficeBranchId){
      return <div style={{ padding: 40, textAlign: 'center' }}>Loading stock data...</div>
    }

  return (
    <Layout>
      <Content style={{ padding: '24px', background: 'linear-gradient(180deg, #F8FAFF 0%, #F9FAFB 100%)', minHeight: '100vh' }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 60%, #2563EB 100%)',
            color: '#fff',
            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Owner stock control
              </Text>
              <Title level={2} style={{ margin: '8px 0 6px', color: '#fff' }}>
                Central Stock Management
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14 }}>
                Track stock items, distribute inventory, and review branch stock levels from one simpler screen.
              </Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddStockOpen(true)}
                style={{
                  background: '#fff',
                  borderColor: '#fff',
                  color: '#1D4ED8',
                  borderRadius: 10,
                  height: 42,
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: '0 8px 20px rgba(255,255,255,0.16)',
                }}
              >
                Add New Stock
              </Button>
            </Col>
          </Row>
        </Card>
        

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
        <Card
          bordered={false}
          style={{ borderRadius: 16, border: '1px solid #E5E7EB', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)' }}
          bodyStyle={{ padding: '0 20px 20px' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ fontWeight: 500 }}
          />
        </Card>

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
          frameTypeList={frameTypeList}
          brandList={brandList}
          categoryBrandMap={categoryBrandMap}
        />
      </Content>
    </Layout>
  )
}
