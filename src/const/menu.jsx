import {
  AccountBookOutlined,
  BarChartOutlined,
  BranchesOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  FundViewOutlined,
  MoneyCollectOutlined,
  PhoneOutlined,
  PlusCircleOutlined,
  ProjectOutlined,
  SafetyOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SyncOutlined,
  ToolOutlined,
  TransactionOutlined,
  UnorderedListOutlined,
  UserOutlined,
  WarningOutlined,
} from "@ant-design/icons";

// ─────────────────────────────────────────────────────────────────────────────
// MENU_BY_ROLE
//
// Rules:
//  • Every key must exactly match a <Route path="..."> in App.jsx.
//  • No duplicate keys within a role.
//  • Every page file that exists and has a route gets a menu entry.
// ─────────────────────────────────────────────────────────────────────────────

export const MENU_BY_ROLE = {

  // ── Owner ─────────────────────────────────────────────────────────────────
  owner: [
    { key: "/owner",                  icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/project-management",     icon: <ProjectOutlined />,     label: "Project Management" },
    { key: "/payment-monitoring",     icon: <TransactionOutlined />, label: "Payment Monitoring" },
    { key: "/main-stock",             icon: <ShoppingOutlined />,    label: "Main Stock" },
    { key: "/branch-management",      icon: <BranchesOutlined />,    label: "Branch Management" },
    { key: "/owner-cash-handling",    icon: <MoneyCollectOutlined />, label: "Cash Handling" },
    { key: "/petty-cash-allocation",  icon: <AccountBookOutlined />, label: "Petty Cash Allocation" },
    { key: "/petty-cash-history",     icon: <ClockCircleOutlined />, label: "Petty Cash History" },
    { key: "/UserManagement",         icon: <UserOutlined />,        label: "User Management" },
    { key: "/SystemActivity",         icon: <ClockCircleOutlined />, label: "System Activity" },
    { key: "/reports",                icon: <BarChartOutlined />,    label: "Reports" },
    { key: "/order-lookup",           icon: <SearchOutlined />,      label: "Order Lookup" },
  ],

  // ── Manager ───────────────────────────────────────────────────────────────
  manager: [
    { key: "/manager-dashboard",       icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/clinics",                 icon: <ProjectOutlined />,     label: "Clinic Details" },
    { key: "/stock-management",        icon: <ShoppingCartOutlined />,label: "Branch Stock" },
    { key: "/incoming-stock-approval", icon: <ShoppingOutlined />,    label: "Incoming Stock Approval" },
    { key: "/cash-handling",           icon: <TransactionOutlined />, label: "Cash Handling" },
    { key: "/petty-cash",              icon: <AccountBookOutlined />, label: "Petty Cash" },
    { key: "/batch-tracking",          icon: <ClockCircleOutlined />, label: "Batch Tracking" },
    { key: "/pending-payments",        icon: <AccountBookOutlined />, label: "Pending Payments" },
    { key: "/pending-lab-orders",      icon: <ExperimentOutlined />,  label: "Pending Lab Orders" },
    { key: "/complaint-handling",      icon: <SafetyOutlined />,      label: "Complaint Handling" },
    { key: "/manager-reports",         icon: <BarChartOutlined />,    label: "Reports" },
    { key: "/order-lookup",            icon: <SearchOutlined />,      label: "Order Lookup" },
  ],

  // ── Admin (Administrative Officer) ───────────────────────────────────────
  admin: [
    { key: "/admin-dashboard",       icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/customer-lookup-details",icon: <UserOutlined />,       label: "Customer Lookup" },
    { key: "/inventory-management",  icon: <ShoppingOutlined />,    label: "Inventory Management" },
    { key: "/clinic-details",        icon: <ProjectOutlined />,     label: "Clinic Details" },
    { key: "/batch-tracking",        icon: <ClockCircleOutlined />, label: "Batch Tracking" },
    { key: "/lab-followup",          icon: <ExperimentOutlined />,  label: "Lab Follow-Up" },
    { key: "/reminder-calls",        icon: <PhoneOutlined />,       label: "Reminder Calls" },
    { key: "/complaint-management",  icon: <WarningOutlined />,     label: "Complaint Handling" },
    { key: "/petty-cash-handling",   icon: <TransactionOutlined />, label: "Petty Cash" },
    { key: "/petty-cash-request",    icon: <AccountBookOutlined />, label: "Petty Cash Request" },
    { key: "/cash-approval-admin",   icon: <TransactionOutlined />, label: "Cash Approval" },
    { key: "/order-lookup",          icon: <SearchOutlined />,      label: "Order Lookup" },
  ],

  // ── Accountant ────────────────────────────────────────────────────────────
  accountant: [
    { key: "/accountant",            icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/accRecovery-Details",   icon: <AccountBookOutlined />, label: "Recovery Details" },
    { key: "/accRecovery-Filtering", icon: <FileTextOutlined />,    label: "Recovery Filtering" },
    { key: "/accOrderfilter",        icon: <UnorderedListOutlined />,label: "Order Filter" },
    { key: "/accDailySales",         icon: <BarChartOutlined />,    label: "Daily Sales" },
    { key: "/cashflow-view",         icon: <FundViewOutlined />,    label: "Cash Flow" },
    { key: "/order-flow-view",       icon: <FundViewOutlined />,    label: "Order Flow" },
    { key: "/Acreports",             icon: <BarChartOutlined />,    label: "Reports" },
    { key: "/order-lookup",          icon: <SearchOutlined />,      label: "Order Lookup" },
  ],

  // ── Sales Executive ───────────────────────────────────────────────────────
  "sales-executive": [
    { key: "/sales-executive-dashboard", icon: <DashboardOutlined />,    label: "Dashboard" },
    { key: "/new-order",                 icon: <PlusCircleOutlined />,   label: "New Order" },
    { key: "/orders",                    icon: <UnorderedListOutlined />, label: "Orders" },
    { key: "/order-status-management",   icon: <SyncOutlined />,         label: "Change Order Status" },
    { key: "/cash-transfer",             icon: <MoneyCollectOutlined />,  label: "Cash Transfer" },
    { key: "/complaint-view",            icon: <WarningOutlined />,       label: "Complaints" },
    { key: "/order-lookup",              icon: <SearchOutlined />,        label: "Order Lookup" },
  ],

  // ── Recovery Officer ──────────────────────────────────────────────────────
  "recovery-officer": [
    { key: "/recovery-dashboard",    icon: <DashboardOutlined />,   label: "Dashboard" },
    { key: "/recovery-sheet",        icon: <FileTextOutlined />,    label: "Recovery Sheet" },
    { key: "/delivery-management",   icon: <ShoppingCartOutlined />,label: "Delivery Management" },
    { key: "/cash-transfer-to-admin",icon: <TransactionOutlined />, label: "Cash Transfer" },
    { key: "/recovery-followup",     icon: <SyncOutlined />,        label: "Recovery Follow-Up" },
    { key: "/customer-lookup",       icon: <UserOutlined />,        label: "Customer Lookup" },
    { key: "/warranty-claim",        icon: <ToolOutlined />,        label: "Warranty Claims" },
    { key: "/recovery-complaint-view",icon: <WarningOutlined />,   label: "Complaints" },
    { key: "/order-lookup",          icon: <SearchOutlined />,      label: "Order Lookup" },
  ],

  // ── Optometrist ───────────────────────────────────────────────────────────
  optometrist: [
    { key: "/optometrist-dashboard", icon: <DashboardOutlined />,  label: "Dashboard" },
    { key: "/new-prescription",      icon: <PlusCircleOutlined />, label: "New Prescription" },
    { key: "/patient-management",    icon: <UserOutlined />,       label: "Patient Management" },
    { key: "/order-lookup",          icon: <SearchOutlined />,     label: "Order Lookup" },
  ],
};
