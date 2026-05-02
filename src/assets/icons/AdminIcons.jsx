
import React from 'react'
import {FileDoneOutlined,TeamOutlined,StockOutlined, InboxOutlined, SearchOutlined, FileTextOutlined,ShoppingOutlined, ExperimentOutlined, BgColorsOutlined, ScanOutlined, WarningOutlined, InfoCircleOutlined, PlusOutlined, ProjectOutlined, CalendarOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined, ClockCircleOutlined, CheckCircleOutlined, SendOutlined, SafetyCertificateOutlined, ArrowRightOutlined, HistoryOutlined, MoreOutlined  } from "@ant-design/icons";

const iconStyle = { color: "#3B82F6", fontSize: 22 , fontWeight: "bold" };

export const icons = {
  customers: < TeamOutlined style={iconStyle} />,
  inventory: <FileDoneOutlined style={iconStyle} />,
  stock: <StockOutlined  style={iconStyle} />,
  box: <InboxOutlined style={iconStyle} />,
  leaflets: <FileTextOutlined style={iconStyle} />,
  cleaningSolutions: <ExperimentOutlined style={iconStyle} />,
  cleaningClothes: <BgColorsOutlined style={iconStyle} />,
  lowStock: <WarningOutlined  style={iconStyle} />,
  outStock: <InfoCircleOutlined  style={iconStyle} />,
  frames: <ScanOutlined style={iconStyle} />,
  addButton: <PlusOutlined  style={iconStyle} />,
  projects: <ProjectOutlined style={iconStyle} />,
  scheduledClinics: <CalendarOutlined style={iconStyle} />,
  completedClinics: <TeamOutlined style={iconStyle} />,
  viewDetails: <EyeOutlined style={iconStyle} />,
  edit: <EditOutlined style={iconStyle} />,
  delete: <DeleteOutlined style={iconStyle} />,
  order: <ShoppingCartOutlined style={iconStyle} />,
  clock:  <ClockCircleOutlined style={iconStyle} />,
  send:   <SendOutlined style={iconStyle} />,
  delivered : <CheckCircleOutlined style={iconStyle} />,
  received : <SafetyCertificateOutlined style={iconStyle} />,
  arrow: <ArrowRightOutlined style={iconStyle}/>,
  history: < HistoryOutlined style={iconStyle}/>,
  shopping: < ShoppingOutlined style={iconStyle} style={{ fontSize: 60 , color: "#1677ff", }} />,
  search: < SearchOutlined style={iconStyle} style={{ color: "#ffffff"}}/>,
  m: <MoreOutlined style={iconStyle}/>



};


function AdminIcons() {
  return icons.inventory;
   
  
}

export default AdminIcons



