import { Routes, Route, Navigate } from "react-router";

import CommonPageStructure from "../pages/CommonPageStructure";
import Login from "../pages/login/Login";
import Track from "../pages/track/Track";

// Optometrist
import OptimetristDashboard from "../pages/optimetrist/OptimetristDashboard";
import NewPresctiption from "../pages/optimetrist/NewPrescription";
import PatientManagement from "../pages/optimetrist/PatientManagement";

// Sales Executive
import SalesExecutiveDashboard from "../pages/sales-executive/SalesExecutiveDashboard";
import NewOrder from "../pages/sales-executive/NewOrder";
import Orders from "../pages/sales-executive/Orders";
import OrderStatusManagement from "../pages/sales-executive/OrderStatusManagement";
import CashTransferToAdmin from "../pages/sales-executive/CashTransferToAdmin";
import ComplaintView from "../pages/sales-executive/ComplaintView";

// Recovery Officer
import RecoveryDashboard from "../pages/recovery-officer/RecoveryDashboard";
import RecoverySheet from "../pages/recovery-officer/RecoverySheet";
import CashTransfer from "../pages/recovery-officer/CashTransfer";
import RecoveryFollowUp from "../pages/recovery-officer/RecoveryFollowUp";
import DeliveryManagement from "../pages/recovery-officer/DeliveryManagement";
import CustomerDetails from "../pages/recovery-officer/CustomerDetails";
import WarrantyClaim from "../pages/recovery-officer/WarrantyClaim";
import RecoveryComplaintView from "../pages/recovery-officer/ComplaintView";

// Admin (Administrative Officer)
import AdminDashboard from "../pages/AdministrativeOfficer/AdminDashboard";
import CustomerLookup from "../pages/AdministrativeOfficer/CustomerLookup";
import InventoryManagement from "../pages/AdministrativeOfficer/InventoryManagement";
import ProjectClinic from "../pages/AdministrativeOfficer/ProjectClinic";
import BatchTracking from "../pages/AdministrativeOfficer/BatchTracking";
import BatchCreation from "../pages/AdministrativeOfficer/BatchCreation";
import ReminderCalls from "../pages/AdministrativeOfficer/ReminderCalls";
import ReminderCallTracking from "../pages/AdministrativeOfficer/ReminderCallTracking";
import ComplaintManagement from "../pages/AdministrativeOfficer/ComplaintManagement";
import OrderConfirmation from "../pages/AdministrativeOfficer/OrderConfirmation";
import LabFollowUp from "../pages/AdministrativeOfficer/LabFollowUp";
import LabTracking from "../pages/AdministrativeOfficer/LabTracking";
import PettyCashHandling from "../pages/AdministrativeOfficer/PettyCashHandling";
import PettyCashReceiving from "../pages/AdministrativeOfficer/PettyCashReceiving";
import PettyCashRequest from "../pages/AdministrativeOfficer/PettyCashRequest";
import AdminCashHandling from "../pages/AdministrativeOfficer/AdminCashHandling";
import AdminCashTransferApproval from "../pages/AdministrativeOfficer/AdminCashTransferApproval";
import ClinicDetails from "../pages/Manager/ClinicDetails";

// Manager
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import BranchStockManagement from "../pages/Manager/BranchStockManagement";
import IncomingStockApproval from "../pages/Manager/IncomingStockApproval";
import CashHandling from "../pages/Manager/CashHandling";
import PettyCash from "../pages/Manager/PettyCash";
import PendingLabOrders from "../pages/Manager/PendingLabOrders";
import PendingPayment from "../pages/Manager/PendingPayment";
import ComplaintHandling from "../pages/Manager/ComplaintHandling";
import Report from "../pages/Manager/Report";

// Accountant
import AccountingDashboard from "../pages/Accountant/AccountingDashboard";
import ACCashTransfer from "../pages/Accountant/ACCashTransfer";
import DailySales from "../pages/Accountant/DailySales";
import OrderFilter from "../pages/Accountant/OrderFilter";
import RecoveryFiltering from "../pages/Accountant/RecoveryFiltering";
import RecoveryDetails from "../pages/Accountant/RecoveryDetails";
import CashflowView from "../pages/Accountant/CashflowView";
import OrderFlowView from "../pages/Accountant/OrderFlowView";

// Owner
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ProjectManagement from "../pages/owner/ProjectManagment";
import PaymentMonitoring from "../pages/owner/PaymentMonitering";
import Reports from "../pages/owner/Reports";
import SystemActivity from "../pages/owner/SystemActivity";
import UserManagement from "../pages/owner/UserManagment";
import MainStockHandling from "../pages/owner/MainStockHandling";
import OwnerCashHandling from "../pages/owner/OwnerCashHandling";
import PettyCashAllocation from "../pages/owner/PettyCashAllocation";
import PettyCashHistory from "../pages/owner/PettyCashHistory";
import BranchManagement from "../pages/owner/BranchManagement";

// Shared
import OrderLookup from "../pages/OrderLookup";

import ProtectedRoute from "./protectedRoutes";
import { useAuth } from "../const/functions";

// ── Helpers ────────────────────────────────────────────────────────────────
function Page({ roles, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <CommonPageStructure>{children}</CommonPageStructure>
    </ProtectedRoute>
  );
}

function RoleRedirect() {
  const { isAuthenticated, homeRoute, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={homeRoute} replace />;
  return <Login />;
}

// ── Routes ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/track" element={<Track />} />

      {/* ── Optometrist ── */}
      <Route path="/optometrist-dashboard" element={<Page roles={["optometrist"]}><OptimetristDashboard /></Page>} />
      <Route path="/new-prescription"      element={<Page roles={["optometrist"]}><NewPresctiption /></Page>} />
      <Route path="/patient-management"    element={<Page roles={["optometrist"]}><PatientManagement /></Page>} />

      {/* ── Sales Executive ── */}
      <Route path="/sales-executive-dashboard" element={<Page roles={["sales-executive"]}><SalesExecutiveDashboard /></Page>} />
      <Route path="/new-order"                 element={<Page roles={["sales-executive"]}><NewOrder /></Page>} />
      <Route path="/orders"                    element={<Page roles={["sales-executive"]}><Orders /></Page>} />
      <Route path="/order-status-management"   element={<Page roles={["sales-executive"]}><OrderStatusManagement /></Page>} />
      <Route path="/cash-transfer"             element={<Page roles={["sales-executive"]}><CashTransferToAdmin /></Page>} />
      <Route path="/complaint-view"            element={<Page roles={["sales-executive"]}><ComplaintView /></Page>} />

      {/* ── Recovery Officer ── */}
      <Route path="/recovery-dashboard"     element={<Page roles={["recovery-officer"]}><RecoveryDashboard /></Page>} />
      <Route path="/recovery-sheet"         element={<Page roles={["recovery-officer"]}><RecoverySheet /></Page>} />
      <Route path="/cash-transfer-to-admin" element={<Page roles={["recovery-officer"]}><CashTransfer /></Page>} />
      <Route path="/recovery-followup"      element={<Page roles={["recovery-officer"]}><RecoveryFollowUp /></Page>} />
      <Route path="/delivery-management"    element={<Page roles={["recovery-officer"]}><DeliveryManagement /></Page>} />
      <Route path="/customer-lookup"        element={<Page roles={["recovery-officer"]}><CustomerDetails /></Page>} />
      <Route path="/warranty-claim"         element={<Page roles={["recovery-officer"]}><WarrantyClaim /></Page>} />
      <Route path="/recovery-complaint-view"element={<Page roles={["recovery-officer"]}><RecoveryComplaintView /></Page>} />

      {/* ── Admin ── */}
      <Route path="/admin-dashboard"        element={<Page roles={["admin"]}><AdminDashboard /></Page>} />
      <Route path="/customer-lookup-details"element={<Page roles={["admin"]}><CustomerDetails /></Page>} />
      <Route path="/inventory-management"   element={<Page roles={["admin"]}><InventoryManagement /></Page>} />
      <Route path="/clinic-details"         element={<Page roles={["admin", "manager"]}><ClinicDetails /></Page>} />
      <Route path="/order-confirmation"     element={<Page roles={["admin"]}><OrderConfirmation /></Page>} />
      <Route path="/batch-creation"         element={<Page roles={["admin"]}><BatchCreation /></Page>} />
      <Route path="/batch-tracking"         element={<Page roles={["admin", "manager"]}><BatchTracking /></Page>} />
      <Route path="/lab-followup"           element={<Page roles={["admin"]}><LabFollowUp /></Page>} />
      <Route path="/lab-tracking"           element={<Page roles={["admin"]}><LabTracking /></Page>} />
      <Route path="/reminder-calls"         element={<Page roles={["admin"]}><ReminderCalls /></Page>} />
      <Route path="/reminder-call-tracking" element={<Page roles={["admin"]}><ReminderCallTracking /></Page>} />
      <Route path="/complaint-management"   element={<Page roles={["admin"]}><ComplaintManagement /></Page>} />
      <Route path="/petty-cash-handling"    element={<Page roles={["admin"]}><PettyCashHandling /></Page>} />
      <Route path="/petty-cash-receiving"   element={<Page roles={["admin"]}><PettyCashReceiving /></Page>} />
      <Route path="/petty-cash-request"     element={<Page roles={["admin"]}><PettyCashRequest /></Page>} />
      <Route path="/cash-approval-admin"    element={<Page roles={["admin"]}><AdminCashTransferApproval /></Page>} />

      {/* ── Manager ── */}
      <Route path="/manager-dashboard"       element={<Page roles={["manager"]}><ManagerDashboard /></Page>} />
      <Route path="/clinics"                 element={<Page roles={["manager"]}><ClinicDetails /></Page>} />
      <Route path="/stock-management"        element={<Page roles={["manager"]}><BranchStockManagement /></Page>} />
      <Route path="/incoming-stock-approval" element={<Page roles={["manager"]}><IncomingStockApproval /></Page>} />
      <Route path="/cash-handling"           element={<Page roles={["manager"]}><CashHandling /></Page>} />
      <Route path="/petty-cash"              element={<Page roles={["manager"]}><PettyCash /></Page>} />
      <Route path="/pending-payments"        element={<Page roles={["manager"]}><PendingPayment /></Page>} />
      <Route path="/pending-lab-orders"      element={<Page roles={["manager"]}><PendingLabOrders /></Page>} />
      <Route path="/complaint-handling"      element={<Page roles={["manager"]}><ComplaintHandling /></Page>} />
      <Route path="/manager-reports"         element={<Page roles={["manager"]}><Report /></Page>} />

      {/* ── Accountant ── */}
      <Route path="/accountant"            element={<Page roles={["accountant"]}><AccountingDashboard /></Page>} />
      <Route path="/accRecovery-Details"   element={<Page roles={["accountant"]}><RecoveryDetails /></Page>} />
      <Route path="/accRecovery-Filtering" element={<Page roles={["accountant"]}><RecoveryFiltering /></Page>} />
      <Route path="/accOrderfilter"        element={<Page roles={["accountant"]}><OrderFilter /></Page>} />
      <Route path="/accDailySales"         element={<Page roles={["accountant"]}><DailySales /></Page>} />
      <Route path="/accCashTransfer"       element={<Page roles={["accountant"]}><ACCashTransfer /></Page>} />
      <Route path="/cashflow-view"         element={<Page roles={["accountant", "owner"]}><CashflowView /></Page>} />
      <Route path="/order-flow-view"       element={<Page roles={["accountant", "owner"]}><OrderFlowView /></Page>} />
      <Route path="/Acreports"             element={<Page roles={["accountant"]}><Reports /></Page>} />

      {/* ── Owner ── */}
      <Route path="/owner"                 element={<Page roles={["owner"]}><OwnerDashboard /></Page>} />
      <Route path="/project-management"   element={<Page roles={["owner"]}><ProjectManagement /></Page>} />
      <Route path="/payment-monitoring"   element={<Page roles={["owner"]}><PaymentMonitoring /></Page>} />
      <Route path="/reports"              element={<Page roles={["owner"]}><Reports /></Page>} />
      <Route path="/SystemActivity"       element={<Page roles={["owner"]}><SystemActivity /></Page>} />
      <Route path="/UserManagement"       element={<Page roles={["owner"]}><UserManagement /></Page>} />
      <Route path="/main-stock"           element={<Page roles={["owner"]}><MainStockHandling /></Page>} />
      <Route path="/owner-cash-handling"  element={<Page roles={["owner"]}><OwnerCashHandling /></Page>} />
      <Route path="/petty-cash-allocation"element={<Page roles={["owner"]}><PettyCashAllocation /></Page>} />
      <Route path="/petty-cash-history"   element={<Page roles={["owner"]}><PettyCashHistory /></Page>} />
      <Route path="/branch-management"    element={<Page roles={["owner"]}><BranchManagement /></Page>} />

      {/* ── Shared (all roles) ── */}
      <Route
        path="/order-lookup"
        element={
          <Page roles={["owner","admin","manager","accountant","sales-executive","recovery-officer","optometrist"]}>
            <OrderLookup />
          </Page>
        }
      />

      {/* ── Sales reports (alias) ── */}
      <Route path="/sales-reports" element={<Page roles={["sales-executive"]}><Reports /></Page>} />
    </Routes>
  );
}
