
import React from 'react'
import {FileDoneOutlined,TeamOutlined,StockOutlined, InboxOutlined, FileTextOutlined, ExperimentOutlined, BgColorsOutlined, ScanOutlined} from "@ant-design/icons";

const iconStyle = { color: "#3B82F6", fontSize: 22 };

export const icons = {
  customers: < TeamOutlined style={iconStyle} />,
  inventory: <FileDoneOutlined style={iconStyle} />,
  stock: <StockOutlined  style={iconStyle} />,
  box: <InboxOutlined style={iconStyle} />,
  leaflets: <FileTextOutlined style={iconStyle} />,
  cleaningSolutions: <ExperimentOutlined style={iconStyle} />,
  cleaningClothes: <BgColorsOutlined style={iconStyle} />,
  frames: <ScanOutlined style={iconStyle} />}




function AdminIcons() {
  return icons.inventory;
   
  
}

export default AdminIcons



