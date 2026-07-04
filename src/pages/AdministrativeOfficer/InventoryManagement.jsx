import React, { useEffect } from 'react'
import { Typography, Layout, Collapse, message } from 'antd';
import {
  AppstoreOutlined,
  WarningOutlined,
  StopOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { gql } from '@apollo/client';
import StatCard from '../../component/Admin/StatCard';
import StockItemsTable from '../../component/Admin/inventory-management/StockItemsTable';
import OutOfStockTable from '../../component/Admin/inventory-management/OutOfStockTable';
import LowStockTable from '../../component/Admin/inventory-management/LowStockTable';
import DamagedStockTable from '../../component/Admin/inventory-management/DamagedStockTable';
import FrameStockTable from '../../component/owner/stock-handling/FrameStockTable';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client/react/compiled';
import { useAuth } from '../../const/functions';

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
              sku
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
          lte: 100,
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

  // ── branch_frame_stock view ──────────────────────────────────────────────────
  const LOAD_BRANCH_FRAME_STOCK = gql`
    query AdminLoadBranchFrameStock($branch_id: Int!) {
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
  `;

  const LOAD_BRANCHES = gql`
    query AdminLoadBranches {
      branchCollection(filter: { is_active: { eq: true } }) {
        edges {
          node {
            id
            branch_name
          }
        }
      }
    }
  `;

  // ── individual frame rows for this branch ─────────────────────────────────
  const LOAD_BRANCH_FRAMES = gql`
    query AdminLoadBranchFrames($branch_id: Int!) {
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

  const UPDATE_FRAME_STATUS_ADMIN = gql`
    mutation AdminUpdateFrameStatus($id: BigInt!, $status: String!) {
      updateframeCollection(
        set: { status: $status }
        filter: { id: { eq: $id } }
      ) {
        records { id status }
      }
    }
  `;

  const UPDATE_FRAME_BRANCH_ADMIN = gql`
    mutation AdminUpdateFrameBranch($id: BigInt!, $branch_id: Int!, $status: String!) {
      updateframeCollection(
        set: { branch_id: $branch_id, status: $status }
        filter: { id: { eq: $id } }
      ) {
        records { id branch_id status }
      }
    }
  `;

export default function InventoryManagement() {

  const { Title, Text } = Typography;
  const { Content } = Layout;
  const { staff } = useAuth();
  const branchId = staff?.branch?.id;

 

  //  Fetch Data 
  const { data: stockData, refetch } = useQuery(LOAD_STOCK, {
  pollInterval: 5000,           // ← auto-refresh every 5s
  fetchPolicy: 'network-only',  // ← always fetch fresh from server
});

const { data: lowStockData, refetch: refetchLowStock } = useQuery(LOW_STOCK, {
  pollInterval: 5000,
  fetchPolicy: 'network-only',
});

const { data: outStockData, refetch: refetchOutStock } = useQuery(OUT_STOCK, {
  pollInterval: 5000,
  fetchPolicy: 'network-only',
});

const { data: damagedStockData, refetch: refetchDamaged } = useQuery(LOAD_DAMAGED_STOCK, {
  pollInterval: 5000,
  fetchPolicy: 'network-only',  // ← this fixes damaged table not updating
});

const { data: productTypesData } = useQuery(PRODUCT_TYPES);

  const [loadReOrders, { data: reOrderData, refetch: refetchReOrders }] = useLazyQuery(LOAD_REORDERS, {pollInterval: 2000, fetchPolicy: 'network-only'});

  const [updateStock] = useMutation(UPDATE_STOCK_QUANTITY);
  const [insertDamageStock] = useMutation(INSERT_DAMAGED_STOCK);
  const [insertReOrder] = useMutation(INSERT_REORDER);
  const [updateFrameStatus] = useMutation(UPDATE_FRAME_STATUS_ADMIN);
  const [updateFrameBranch] = useMutation(UPDATE_FRAME_BRANCH_ADMIN);

  //  Load reorders once branchId is available 
  useEffect(() => {
    if (branchId) {
      loadReOrders({ variables: { branch_id: branchId } });
    }
  }, [branchId, loadReOrders]);

  // ── individual frames for this branch ──────────────────────────────────
  const { data: branchFramesData, refetch: refetchFrames } = useQuery(LOAD_BRANCH_FRAMES, {
    variables: { branch_id: branchId },
    skip: !branchId,
    fetchPolicy: 'network-only',
    pollInterval: 10000,
  });

  const branchFrameRows = branchFramesData?.frameCollection?.edges.map(e => ({
    id: e.node.id,
    product_id: e.node.product_id,
    serial_no: e.node.serial_no,
    color: e.node.color,
    status: e.node.status,
    created_at: e.node.created_at,
    frame_type: e.node.frame_type?.type || '—',
    product_name: e.node.product?.name || '—',
    product_sku: e.node.product?.sku || '',
  })) || [];

  const damagedFrames = branchFrameRows.filter(f => f.status === 'damaged');

  const handleMarkFrameDamaged = async (frameId, _reason) => {
    await updateFrameStatus({ variables: { id: frameId, status: 'damaged' } });
    refetchFrames();
  };

  const handleTransferFrame = async (frameId, targetBranchId) => {
    await updateFrameBranch({ variables: { id: frameId, branch_id: Number(targetBranchId), status: 'in_stock' } });
    refetchFrames();
  };

  // ── frame stock (branch_frame_stock view) ──────────────────────────────────
  const [frameStockBranch, setFrameStockBranch] = React.useState(null);

  const { data: branchesData } = useQuery(LOAD_BRANCHES, { fetchPolicy: 'network-only' });
  const allBranches = branchesData?.branchCollection?.edges.map(e => ({
    id: Number(e.node.id),
    branch_name: e.node.branch_name,
  })) || [];

  const [loadFrameStock, { data: frameStockData, loading: frameStockLoading }] =
    useLazyQuery(LOAD_BRANCH_FRAME_STOCK, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (frameStockBranch) {
      loadFrameStock({ variables: { branch_id: frameStockBranch } });
    }
  }, [frameStockBranch, loadFrameStock]);

  const branchFrameStockList = frameStockData?.branch_frame_stockCollection?.edges.map(e => ({
    branch_id: e.node.branch_id,
    product_id: e.node.product_id,
    product_name: e.node.product_name,
    product_sku: e.node.product_sku,
    frame_type: e.node.frame_type,
    in_stock_count: Number(e.node.in_stock_count ?? 0),
    reserved_count: Number(e.node.reserved_count ?? 0),
    sold_count: Number(e.node.sold_count ?? 0),
    damaged_count: Number(e.node.damaged_count ?? 0),
    transferred_count: Number(e.node.transferred_count ?? 0),
  })) || [];

  const refetchAll = () => {
  refetch();
  refetchLowStock();
  refetchOutStock();
  refetchDamaged();
  refetchReOrders && refetchReOrders();
  refetchFrames && refetchFrames();
};


  //  Build Product Type List from DB for easy mapping and dynamic tabs
  const productTypeList =
    productTypesData?.product_typeCollection?.edges.map((edge) => ({
      id: edge.node.id,
      type: edge.node.type,
    })) || [];

    //  Map product type string to category for display (can be extended if needed)
  const mapCategory = (type) => {
    if (!type) return 'unknown';
    const category = productTypeList.find((pt) => pt.type === type);
    return category ? category.type : 'unknown';
  };

  //  Store reordered product_type_id set for quick lookup 
  const reOrderedTypeIds = new Set(
    reOrderData?.re_orderCollection?.edges.map(
      (edge) => String(edge.node.product_type_id)
    ) || []
  );

  //  Transform GraphQL → Table Format 
  const stockList =
    stockData?.stockCollection?.edges.map((item, index) => ({
      key: index,
      id: item.node.id,
      productName: item.node.product.name,
      sku: item.node.product.sku || '',
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
      branch_id: item.node.stock?.branch_id,
      productName: item.node.stock?.product?.name || 'Unknown',
      category: mapCategory(item.node.stock?.product?.product_type?.type),
      damaged_quantity: Number(item.node.damaged_quantity),
      reason: item.node.reason,
      created_at: item.node.created_at,
      status_bool: item.node.status_bool,
    })) || [];

  //  Stat Card Values 
  const totalAvailable = stockList.filter((item) => item.stockQuantity > 10).length;
  const totalLowStock = lowStockList.length;
  const totalOutOfStock = outOfStockList.length;
  const pendingDamaged = damagedStockList.filter((item) => item.status_bool === false).length;

  //  Handle Reorder — submits a request to the owner via the re_order table.
  //  The owner sees all branch reorders in their main-stock page via LOAD_ALL_REORDERS.
  const handleReOrder = async (productTypeId) => {
    try {
      await insertReOrder({
        variables: {
          product_type_id: productTypeId,
          branch_id: branchId,
        },
      });
      refetchAll();
      message.success('Reorder request submitted to the owner.');
    } catch (err) {
      console.error('Reorder failed:', err);
      message.error('Failed to submit reorder request.');
    }
  };

  //  Collapse Panel Header 
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


  //  Collapse Items 
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
          frames={branchFrameRows}
          branches={allBranches}
          currentBranchId={Number(branchId)}
          updateStock={updateStock}
          insertDamageStock={insertDamageStock}
          onMarkFrameDamaged={handleMarkFrameDamaged}
          onTransferFrame={handleTransferFrame}
            deductImmediately={false}
          onRefetch={refetchAll}
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
          damagedFrames={damagedFrames}
          ownerBranchId={Number(branchId)}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #f9f0ff' },
    },
    {
      key: 'framestock',
      label: collapseLabel(
        <AppstoreOutlined />,
        'Frame Stock (Serialised)',
        branchFrameStockList.reduce((s, r) => s + (r.in_stock_count || 0), 0),
        '#0369A1'
      ),
      children: (
        <FrameStockTable
          branches={allBranches}
          selectedBranch={frameStockBranch}
          onBranchChange={setFrameStockBranch}
          data={branchFrameStockList}
          loading={frameStockLoading}
        />
      ),
      style: { marginBottom: 16, borderRadius: 12, border: '1px solid #BAE6FD' },
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

        {/*  Stat Cards  */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <StatCard
            title="Available Stock"
            value={totalAvailable}
            iconType="box"
            color="#00A854"
            bgColor="#E6F7F0"
          />
          <StatCard
            title="Low Stock"
            value={totalLowStock}
            iconType="lowStock"
            color="#FAAD14"
            bgColor="#FFF7E6"
          />
          <StatCard
            title="Out of Stock"
            value={totalOutOfStock}
            iconType="outStock"
            color="#F5222D"
            bgColor="#FFF1F0"
          />
          <StatCard
            title="Pending Damage"
            value={pendingDamaged}
            iconType="closed"
            color="#722ED1"
            bgColor="#F9F0FF"
          />
        </div>

        {/*  Collapsible Tables  */}
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

// query{
//     __schema{
//         mutationType{
//             fields{
//                 name
//             }
//         }
//     }
    
// }