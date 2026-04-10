
import React from 'react'
import {FileDoneOutlined,TeamOutlined,StockOutlined} from "@ant-design/icons";

const iconStyle = { color: "#3B82F6", fontSize: 22 };

export const icons = {
  customers: < TeamOutlined style={iconStyle} />,
  inventory: <FileDoneOutlined style={iconStyle} />,
  stock: <StockOutlined  style={iconStyle} />,
};


function AdminIcons() {
  return icons.inventory;
   
  
}

export default AdminIcons



