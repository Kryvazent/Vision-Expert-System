import { gql } from '@apollo/client';
import React, {useEffect} from 'react'
import { Card, Row, Col, Button, Typography, Layout } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import StatCard from '../../component/Admin/StatCard';
import {icons} from '../../assets/icons/AdminIcons';
import StockItemsTable from '../../component/Admin/inventory-management/StockItemsTable';
import OutOfStockTable from '../../component/Admin/inventory-management/OutOfStockTable';
import LowStockTable from '../../component/Admin/inventory-management/LowStockTable';
import { useLazyQuery } from '@apollo/client/react/compiled';


export default function InventoryManagement() {
const { Title, Text } = Typography;
const { Content } = Layout;

const LOAD_STOCK = gql `
  query LoadStock{
    stockCollection{
      edges{
        node{
           created_at
            available_quantity
            product{
              id
              name
              product_type{
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
                type
              }
            }
          }
        }
      }
    }    
`;

const OUT_STOCK = gql `
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
                type
              }
            }
          }
        }
      }
  }
`;


//Fetch data
const [loadStock, {data: stockData ,loading: stockLoading, error}] = useLazyQuery(LOAD_STOCK);
const [fetchLowStock, {data: lowStockData ,loading: lowStockLoading }] = useLazyQuery(LOW_STOCK);
const [fetchOutStock, {data: outStockData ,loading: outStockLoading}] = useLazyQuery(OUT_STOCK);

console.log(loadStock);

useEffect(() =>{
  loadStock();
  fetchLowStock();
  fetchOutStock();
}, []);


//Category mapping
const mapCategory = (type) => {
  switch (type) {
    case 'MetalFrame':       return 'metalFrames';
    case 'PlasticFrame':     return 'plasticFrames';
    case 'DoubleBrideFrame': return 'doubleBride';
    case 'Night Vision':     return 'nightVision';
    case 'SunGlasses':       return 'sunGlasses';
    case 'HardBoxes':        return 'hardBoxes';
    case 'PlasticBoxes':     return 'plasticBoxes';
    case 'CleaningClothes':  return 'cleaningClothes';
    case 'CleaningBottles':  return 'cleaningBottles';
    case 'Leaflets':         return 'leaflets';
    case 'Poster':           return 'poster';
    default:                 return 'unknown';
  }
};

if(stockLoading || lowStockLoading || outStockLoading) return <p>Loading......</p>
if(error) return <p>Error loading  data</p>



//Transform GraphQL to table format - ALL STOCK
const stockList = 
  stockData?.stockCollection?.edges.map((item, index) =>  ({
    key: index,
    productName: item.node.product.name,
    category: mapCategory(
        item.node.product.product_type?.type,
       
    ),
    date: item.node.created_at?.split('T')[0],
    stockQuantity: Number(item.node.available_quantity),
  }))  || [];

console.log('stockList:', stockList);
console.log('stockData edges:', stockData?.stockCollection?.edges);



 //Transform GraphQL to table format - LOW STOCK 
const lowStockList = 
  lowStockData?.stockCollection?.edges.map((item, index) => ({
    key: index,
    productName: item.node.product.name,
    category: mapCategory(
      item.node.product.product_type?.type
    ),
    quantity: Number(item.node.available_quantity),
  })) || [];

console.log('lowStockList:', lowStockList);
console.log('stockData edges:', stockData?.stockCollection?.edges);


const outOfStockList = 
  outStockData?.stockCollection?.edges.map((item, index) => ({
    key: index,
    productName: item.node.product.name,
    category: mapCategory(
      item.node.product.product_type?.type
    ),
    quantity: Number(item.node.available_quantity),
  })) || [];


  const plasticFrames = stockList.filter(item => item.category === 'plasticFrames');
  const metalFrames = stockList.filter(item => item.category === 'metalFrames');
  const  nightVision= stockList.filter(item => item.category === 'nightVision');
  const doubleBride = stockList.filter(item => item.category === 'doubleBride');
  const sunGlasses = stockList.filter(item => item.category === 'sunGlasses');
  const hardBoxes = stockList.filter(item => item.category === 'hardBoxes');
  const plasticBoxes = stockList.filter(item => item.category === 'plasticBoxes');
  const cleaningClothes = stockList.filter(item => item.category === 'cleaningClothes');
  const poster = stockList.filter(item => item.category === 'poster');
  const leaflets = stockList.filter(item => item.category === 'leaflets');

  return (
  <Layout>
     <Content className="p-8" style={{ paddingTop: "10px" }}>
      <div style={{
          background: "#f5f7fa",
          padding: "10px 30px",
          borderRadius: "10px",
          marginBottom: "20px",
      }}
    >
      {/* <Row align="middle" justify="space-between">
      </Row> */}
     </div> 


   <div className="flex gap-6 mb-5">
          <StatCard title="Plastic Frames" value={plasticFrames.length} iconType="frames" color="#00A854" bgColor="#E6F7F0" />
          <StatCard title="Plastic Boxes" value={plasticBoxes.length} iconType="box" color="#F5222D" bgColor="#FFF1F0" />
          <StatCard title="Hard Boxes" value={hardBoxes.length} iconType="box" color="#FAAD14" bgColor="#FFF7E6" />     
          <StatCard title="Leaflets" value={leaflets.length} iconType="leaflets" color="#1890FF" bgColor="#E6F7FF" />
           <StatCard title="Cleaning Clothes" value={cleaningClothes.length} iconType="cleaningClothes" color="#722ED1" bgColor="#F9F0FF" />
           {/* <StatCard title="Cleaning Solutions" value={cleaningSolutions.length} iconType="cleaningSolutions" color="#8C8C8C" bgColor="#F5F5F5" /> */}
     </div>

      <div className="mt-5 h-[calc(100vh-25.5vh)] overflow-y-auto pr-2">
         <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}}>
            {/* Inventory Table */}
          <Title level={5} className=".mb-0 " style={{fontWeight:"bold"}}> Inventory</Title>

            <StockItemsTable  data={stockList}/>
        </Card>
        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Low of Stock Table */}
          <LowStockTable data={lowStockList}/>
        </Card>

        <Card className="rounded-2xl shadow-sm border border-gray-100" style={{marginTop:"20px"}} >  
            {/* Out of Stock Table */}
          <OutOfStockTable data={outOfStockList}/>
        </Card>

      </div>
    </Content>
  </Layout>  
    
  )
}
