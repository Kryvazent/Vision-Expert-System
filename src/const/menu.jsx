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
    { key: '/complaint-handling', icon: <WarningOutlined />,   label: 'Complaint Handling' },
    { key: '/batch-tracking', icon: <ClockCircleOutlined />,   label: 'Batch Tracking' },
  ],

  

  "accountant": [
    { key: '/accountant',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/payments',        icon: <AccountBookOutlined />,  label: 'Payments' },
    { key: '/invoices',        icon: <FileTextOutlined />,     label: 'Invoices' },
    { key: '/financial-reports', icon: <BarChartOutlined />,   label: 'Reports' },
  ],
};
