import { AccountBookOutlined, BarChartOutlined, ClockCircleOutlined, DashboardOutlined, FileTextOutlined, PlusCircleOutlined, SafetyOutlined, UnorderedListOutlined } from "@ant-design/icons";

export const MENU_BY_ROLE = {
  "recovery-officer": [
    { key: '/recovery-dashboard',  icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/recovery-sheet',      icon: <FileTextOutlined />,      label: 'Recovery Sheet' },
    { key: '/cash-transfer',       icon: <ClockCircleOutlined />,   label: 'Cash Transfer' },
    { key: '/recovery-followup',   icon: <ClockCircleOutlined />,   label: 'Recovery Follow-Up' },
    { key: '/overdue-units',       icon: <ClockCircleOutlined />,   label: 'Overdue Units' },
    // { key: '/recovery-dashboard',  icon: <SafetyOutlined />,        label: 'Warranty Claims' },
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

  "accountant": [
    { key: '/accountant',      icon: <DashboardOutlined />,    label: 'Dashboard' },
    { key: '/payments',        icon: <AccountBookOutlined />,  label: 'Payments' },
    { key: '/invoices',        icon: <FileTextOutlined />,     label: 'Invoices' },
    { key: '/financial-reports', icon: <BarChartOutlined />,   label: 'Reports' },
  ],
};
