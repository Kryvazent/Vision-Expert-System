import { gql } from '@apollo/client';
import React, { useEffect } from 'react'
import { Typography, Layout, Collapse } from 'antd';
import {
  AppstoreOutlined,
  WarningOutlined,
  StopOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import StatCard from '../../component/Admin/StatCard';
import StockItemsTable from '../../component/Admin/inventory-management/StockItemsTable';
import OutOfStockTable from '../../component/Admin/inventory-management/OutOfStockTable';
import LowStockTable from '../../component/Admin/inventory-management/LowStockTable';
import DamagedStockTable from '../../component/Admin/inventory-management/DamagedStockTable';
import { useLazyQuery, useMutation } from '@apollo/client/react/compiled';
import { useAuth } from '../../const/functions';

export default function InventoryManagement() {

  const { Title, Text } = Typography;
  const { Content } = Layout;
  const { staff } = useAuth();
  const branchId = staff?.branch?.id;

  const LOAD_STOCK = gql`
    query LoadStock{
      stockCollection{
        edges{
          node{
            id
            created_at
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

  const LOW_STOCK = gql`
    query LowStock {
      stockCollection(
        filter: {available_quantity : { 
          lte: 10,
          gt: 0 
          }
        }
      ) {
        edges {
          node {
            id
            available_quantity
            product {
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

  const OUT_STOCK = gql`
    query OutStock {
      stockCollection(
        filter: { available_quantity: {eq: 0} }
      ){
        edges{
          node{
            id
            available_quantity
            product {
              id
              name
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

  const LOAD_DAMAGED_STOCK = gql`
    query LoadDamagedStock {
      damaged_stockCollection {
        edges {
          node {
            id
            created_at
            stock_id
            damaged_quantity
            reason
            status_bool
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
          }
        }
      }
    }
  `;

  const UPDATE_STOCK_QUANTITY = gql`
    mutation UpdateStock($id: BigInt! , $quantity: BigInt!){
      updatestockCollection(
        set: {available_quantity: $quantity}
        filter: {id : {eq: $id }}
      ){
        records{
          id
          available_quantity
        }
      }
    }
  `;

  const INSERT_DAMAGED_STOCK = gql`
    mutation InsertDamagedStock($stock_id: BigInt! , $quantity: BigInt!, $reason : String!){
      insertIntodamaged_stockCollection(
        objects: [{
          stock_id: $stock_id
          damaged_quantity: $quantity
          reason: $reason
          status_bool: false
        }]
      ){
        records{
          id
          stock_id
          damaged_quantity
          reason
          status_bool
        }
      }
    }
  `;

  const PRODUCT_TYPES = gql`
    query loadProductTypes {
      product_typeCollection{
        edges{
          node{
            id
            type
          }
        }
      }
    }
  `;

  // ─── Re-Order Queries & Mutations ─────────────────────────────────────────────
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

  const INSERT_REORDER = gql`
    mutation InsertReOrder($product_type_id: BigInt!, $branch_id: Int!) {
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

  // ─── Fetch Data ───────────────────────────────────────────────────────────────
  const [loadStock, { data: stockData, refetch }] = useLazyQuery(LOAD_STOCK);
  const [fetchLowStock, { data: lowStockData }] = useLazyQuery(LOW_STOCK);
  const [fetchOutStock, { data: outStockData }] = useLazyQuery(OUT_STOCK);
  const [loadDamagedStock, { data: damagedStockData, refetch: refetchDamaged }] = useLazyQuery(LOAD_DAMAGED_STOCK);
  const [loadProductTypes, { data: productTypesData }] = useLazyQuery(PRODUCT_TYPES);
  const [loadReOrders, { data: reOrderData, refetch: refetchReOrders }] = useLazyQuery(LOAD_REORDERS);

  const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY);
  const [insertDamageStock] = useMutation(INSERT_DAMAGED_STOCK);
  const [insertReOrder] = useMutation(INSERT_REORDER);

  useEffect(() => {
    loadStock();
    fetchLowStock();
    fetchOutStock();
    loadDamagedStock();
    loadProductTypes();
  }, [loadStock, fetchLowStock, fetchOutStock, loadDamagedStock, loadProductTypes]);

  // ─── Load reorders once branchId is available ─────────────────────────────────
  useEffect(() => {
    if (branchId) {
      loadReOrders({ variables: { branch_id: branchId } });
    }
  }, [branchId, loadReOrders]);


  // ─── Build Dynamic Category Map from DB ──────────────────────────────────────
  const productTypeList =
    productTypesData?.product_typeCollection?.edges.map((edge) => ({
      id: edge.node.id,
      type: edge.node.type,
    })) || [];

  const mapCategory = (type) => {
    if (!type) return 'unknown';
    const category = productTypeList.find((pt) => pt.type === type);
    return category ? category.type : 'unknown';
  };

  // ─── Build reordered product_type_id set for quick lookup ────────────────────
  const reOrderedTypeIds = new Set(
    reOrderData?.re_orderCollection?.edges.map(
      (edge) => String(edge.node.product_type_id)
    ) || []
  );

  // ─── Transform GraphQL → Table Format ────────────────────────────────────────
  const stockList =
    stockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      id: item.node.id,
      productName: item.node.product.name,
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      date: item.node.created_at?.split('T')[0],
      stockQuantity: Number(item.node.available_quantity),
    })) || [];

  const lowStockList =
    lowStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      productName: item.node.product.name,
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      quantity: Number(item.node.available_quantity),
    })) || [];

  const outOfStockList =
    outStockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      productName: item.node.product.name,
      productTypeId: item.node.product.product_type?.id,
      category: mapCategory(item.node.product.product_type?.type),
      quantity: Number(item.node.available_quantity),
    })) || [];

  const damagedStockList =
    damagedStockData?.damaged_stockCollection?.edges.map((item, index) => ({
      key: index,
      id: item.node.id,
      stock_id: item.node.stock_id,
      productName: item.node.stock?.product?.name || 'Unknown',
      category: mapCategory(item.node.stock?.product?.product_type?.type),
      damaged_quantity: Number(item.node.damaged_quantity),
      reason: item.node.reason,
      created_at: item.node.created_at,
      status_bool: item.node.status_bool,
    })) || [];

  // ─── Stat Card Values ─────────────────────────────────────────────────────────
  const totalAvailable = stockList.filter((item) => item.stockQuantity > 10).length;
  const totalLowStock = lowStockList.length;
  const totalOutOfStock = outOfStockList.length;
  const pendingDamaged = damagedStockList.filter((item) => item.status_bool === false).length;

  // ─── Handle Reorder ───────────────────────────────────────────────────────────
  const handleReOrder = async (productTypeId) => {
    try {
      await insertReOrder({
        variables: {
          product_type_id: productTypeId,
          branch_id: branchId,
        },
      });
      refetchReOrders && refetchReOrders();
    } catch (err) {
      console.error('Reorder failed:', err);
    }
  };

  // ─── Collapse Panel Header ────────────────────────────────────────────────────
  const collapseLabel = (icon, title, count, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color, fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>
      <span style={{
        background: color,
        color: '#fff',
        borderRadius: '12px',
        padding: '1px 10px',
        fontSize: '12px',
        fontWeight: 600,
        marginLeft: 4,
      }}>
        {count} items
      </span>
    </div>
  );


  // ─── Collapse Items ───────────────────────────────────────────────────────────
  const collapseItems = [
    {
      key: 'outOfStock',
      label: collapseLabel(
        <StopOutlined />,
        'Out of Stock Items',
        totalOutOfStock,
        '#F5222D'
      ),
      children: (
        <OutOfStockTable
          data={outOfStockList}
          reOrderedTypeIds={reOrderedTypeIds}
          onReOrder={handleReOrder}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #ffa39e' },
    },
    {
      key: 'lowStock',
      label: collapseLabel(
        <WarningOutlined />,
        'Low Stock Items',
        totalLowStock,
        '#FAAD14'
      ),
      children: (
        <LowStockTable
          data={lowStockList}
          reOrderedTypeIds={reOrderedTypeIds}
          onReOrder={handleReOrder}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #ffe58f' },
    },
    {
      key: 'inventory',
      label: collapseLabel(
        <AppstoreOutlined />,
        'Inventory',
        stockList.length,
        '#092258'
      ),
      children: (
        <StockItemsTable
          data={stockList}
          updateStock={updateStock}
          insertDamageStock={insertDamageStock}
          onRefetch={refetch}
          productTypeList={productTypeList}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #e8e8e8' },
    },
    {
      key: 'damaged',
      label: collapseLabel(
        <ExclamationCircleOutlined />,
        'Damaged Stock',
        damagedStockList.length,
        '#722ED1'
      ),
      children: (
        <DamagedStockTable
          data={damagedStockList}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #f9f0ff' },
    },
  ];


  return (
    <Layout>
      <Content className="p-8" style={{ paddingTop: "10px" }}>

        <div style={{
          background: "#f5f7fa",
          padding: "10px 30px",
          borderRadius: "10px",
          marginBottom: "20px",
        }} />

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <StatCard
            title="Available Stock"
            value={totalAvailable}
            iconType="frames"
            color="#00A854"
            bgColor="#E6F7F0"
          />
          <StatCard
            title="Low Stock"
            value={totalLowStock}
            iconType="frames"
            color="#FAAD14"
            bgColor="#FFF7E6"
          />
          <StatCard
            title="Out of Stock"
            value={totalOutOfStock}
            iconType="frames"
            color="#F5222D"
            bgColor="#FFF1F0"
          />
          <StatCard
            title="Pending Damage"
            value={pendingDamaged}
            iconType="frames"
            color="#722ED1"
            bgColor="#F9F0FF"
          />
        </div>

        {/* ── Collapsible Tables ── */}
        <div className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
          <Collapse
            defaultActiveKey={['outOfStock']}
            ghost
            items={collapseItems}
            style={{ background: 'transparent' }}
          />
        </div>

      </Content>
    </Layout>
  );
}