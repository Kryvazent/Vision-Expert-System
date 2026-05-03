import { AccountBookOutlined, BarChartOutlined, ClockCircleOutlined, DashboardOutlined, FileTextOutlined, PlusCircleOutlined, ProjectOutlined, SafetyOutlined, ShoppingOutlined, UnorderedListOutlined, UserOutlined, ShoppingCartOutlined, PhoneOutlined, WarningOutlined } from "@ant-design/icons";
import {ToolOutlined, SyncOutlined, TransactionOutlined } from "@ant-design/icons";

export const MENU_BY_ROLE = {
  "recovery-officer": [
    { key: '/recovery-dashboard',  icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/recovery-sheet',      icon: <FileTextOutlined />,      label: 'Recovery Sheet' },
    { key: '/cash-transfer',       icon: <TransactionOutlined />,   label: 'Cash Transfer' },
    { key: '/recovery-followup',   icon: <SyncOutlined />,   label: 'Recovery Follow-Up' },
    { key: '/warranty-claim',     icon: <ToolOutlined />,   label: 'Warranty Claims' },
  ],

  "optometrist": [
    { key: '/optometrist-dashboard', icon: <DashboardOutlined />,  label: 'Dashboard' },
    { key: '/new-prescription',      icon: <PlusCircleOutlined />,  label: 'New Prescription' },
    { key: '/patient-management',    icon: <BarChartOutlined />,    label: 'Patient Management' },
  ],

  "sales-executive": [
    { key: '/sales-executive-dashboard', icon: <DashboardOutlined />,       label: 'Dashboard' },
    { key: '/new-order',                 icon: <PlusCircleOutlined />,       label: 'New Order' },
    { key: '/orders',                    icon: <UnorderedListOutlined />,    label: 'Orders' },
    { key: '/sales-reports',             icon: <BarChartOutlined />,         label: 'Reports' },
  ],

  "admin": [
    { key: '/admin-dashboard',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/customer-lookup',        icon: <UserOutlined />,  label: 'Customer Lookup' },
    { key: '/inventory-management',        icon: <ShoppingOutlined />,     label: 'Inventory Management' },
    { key: '/project-clinic', icon: <ProjectOutlined />,   label: 'Project Clinics Management' },
    {key: '/reminder-calls', icon: < PhoneOutlined />,   label: 'Reminder Calls' },
    { key: '/complaint-management', icon: <WarningOutlined />,   label: 'Complaint Handling' },
    { key: '/batch-tracking', icon: <ClockCircleOutlined />,   label: 'Batch Tracking' },
  ],

  

  "accountant": [
    { key: '/accountant',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/accRecovery-Details',        icon: <AccountBookOutlined />,  label: 'Recovery Details' },
    { key: '/accRecovery-Filtering',        icon: <FileTextOutlined />,     label: 'Recovery Filtering' },
    { key: '/accOrderfilter', icon: <BarChartOutlined />,   label: 'Order Filter' },
    { key: '/accDailySales', icon: <BarChartOutlined />,   label: 'Daily Sales' },
    { key: '/accCashTransfer', icon: <BarChartOutlined />,   label: 'Cash Transfer' },


    
    
  ],

  "owner": [
    { key: '/owner',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/project-management',        icon: <ProjectOutlined />,  label: 'Project Management' },
    { key: '/payment-monitoring',        icon: <TransactionOutlined />,     label: 'Payment Monitoring' },
    { key: '/reports', icon: <BarChartOutlined />,   label: 'Reports' },
    { key: '/SystemActivity', icon: <ClockCircleOutlined />,   label: 'System Activity' },
    { key: '/UserManagement', icon: <UserOutlined />,   label: 'User Management' },

    
    
  ],



"manager": [
    { key: '/manager-dashboard',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/clinics',        icon: <ProjectOutlined />,  label: 'Clinics' },
    { key: '/stock-management',        icon: <ShoppingOutlined />,     label: 'Stock Management' },
    { key: '/cash-handling', icon: <TransactionOutlined />,   label: 'Cash Handling' },
    { key: '/petty-cash', icon: <AccountBookOutlined />,   label: 'Petty Cash' },
    { key: '/pending-laborders', icon: <ClockCircleOutlined />,   label: 'Pending Lab Orders' },
    { key: '/pending-payments', icon: <AccountBookOutlined />,   label: 'Pending Payments' },
    { key: '/complaint-handling',        icon: <SafetyOutlined />,  label: 'Complaint Handling' },
    { key: '/reports',        icon: <BarChartOutlined />,     label: 'Reports' },
  ],


};

      