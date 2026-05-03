import { Routes, Route, Navigate } from 'react-router';

import CommonPageStructure from '../pages/CommonPageStructure';
import Login from '../pages/login/Login';
import Track from '../pages/track/Track';

import OptimetristDashboard from '../pages/optimetrist/OptimetristDashboard';
import NewPresctiption from '../pages/optimetrist/NewPrescription';

import SalesExecutiveDashboard from '../pages/sales-executive/SalesExecutiveDashboard';
import NewOrder from '../pages/sales-executive/NewOrder';
import Orders from '../pages/sales-executive/Orders';

import WarrantyClaim from '../pages/recovery-officer/WarrantyClaim';
import AccountingDashboard from '../pages/Accountant/AccountingDashboard';
import ProtectedRoute from './protectedRoutes';
import { useAuth } from '../const/functions';
import RecoveryDashboard from '../pages/recovery-officer/RecoveryDashboard';
import RecoverySheet from '../pages/recovery-officer/RecoverySheet';
import PatientManagement from './../pages/optimetrist/PatientManagement';
import CashTransfer from '../pages/recovery-officer/CashTransfer';
import RecoveryFollowUp from '../pages/recovery-officer/RecoveryFollowUp';

import AdminDashboard from '../pages/AdministrativeOfficer/AdminDashboard';
import CustomerLookup from '../pages/AdministrativeOfficer/CustomerLookup';
import InventoryManagement from '../pages/AdministrativeOfficer/InventoryManagement';
import ProjectClinic from '../pages/AdministrativeOfficer/ProjectClinic';
import BatchTracking from '../pages/AdministrativeOfficer/BatchTracking';
import ReminderCalls from '../pages/AdministrativeOfficer/ReminderCalls';
import ComplaintHandling from '../pages/AdministrativeOfficer/ComplaintHandling';


import ManagerDashboard from './../pages/Manager/ManagerDashboard';
import ClinicDetails from './../pages/Manager/ClinicDetails';
import ManagerStockManagement from './../pages/Manager/ManagerStockManagement';
import CashHandling from './../pages/Manager/CashHandling';
import PettyCash from './../pages/Manager/PettyCash';
import PendingLabOrders from './../pages/Manager/PendingLabOrders';
import PendingPayment from './../pages/Manager/PendingPayment';
import Report from '../pages/Manager/Report';
import ComplaintHandling from './../pages/Manager/ComplaintHandling';

import { Routes, Route, Navigate } from "react-router";

import CommonPageStructure from "../pages/CommonPageStructure";
import Login from "../pages/login/Login";
import Track from "../pages/track/Track";

import OptimetristDashboard from "../pages/optimetrist/OptimetristDashboard";
import NewPresctiption from "../pages/optimetrist/NewPrescription";

import SalesExecutiveDashboard from "../pages/sales-executive/SalesExecutiveDashboard";
import NewOrder from "../pages/sales-executive/NewOrder";
import Orders from "../pages/sales-executive/Orders";

import WarrantyClaim from "../pages/recovery-officer/WarrantyClaim";
import AccountingDashboard from "../pages/Accountant/AccountingDashboard";
import ProtectedRoute from "./protectedRoutes";
import { useAuth } from "../const/functions";
import RecoveryDashboard from "../pages/recovery-officer/RecoveryDashboard";
import RecoverySheet from "../pages/recovery-officer/RecoverySheet";
import PatientManagement from "./../pages/optimetrist/PatientManagement";
import CashTransfer from "../pages/recovery-officer/CashTransfer";
import RecoveryFollowUp from "../pages/recovery-officer/RecoveryFollowUp";

import AdminDashboard from "../pages/AdministrativeOfficer/AdminDashboard";
import CustomerLookup from "../pages/AdministrativeOfficer/CustomerLookup";
import InventoryManagement from "../pages/AdministrativeOfficer/InventoryManagement";
import ProjectClinic from "../pages/AdministrativeOfficer/ProjectClinic";
import ACCashTransfer from "../pages/Accountant/ACCashTransfer";
import DailySales from "../pages/Accountant/DailySales";
import OrderFilter from "../pages/Accountant/OrderFilter";
import RecoveryFiltering from "../pages/Accountant/RecoveryFiltering";
import RecoveryDetails from "../pages/Accountant/RecoveryDetails";
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import ProjectManagement from "../pages/owner/ProjectManagment";
import PaymentMonitoring from "../pages/owner/PaymentMonitering";
import Reports from "../pages/owner/Reports";
import SystemActivity from "../pages/owner/SystemActivity";
import UserManagement from "../pages/owner/UserManagment";

// Wrap page in both layout + role guard
function Page({ roles, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <CommonPageStructure>{children}</CommonPageStructure>
    </ProtectedRoute>
  );
}

// After login, send the user to their role's home page
function RoleRedirect() {
  const { isAuthenticated, homeRoute, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={homeRoute} replace />;
  return <Login />;
}

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<RoleRedirect />} />
      <Route
        path="/track"
        element={
          <CommonPageStructure>
            <Track />
          </CommonPageStructure>
        }
      />

      {/* Optometrist */}
      <Route
        path="/optometrist-dashboard"
        element={
          <Page roles={["optometrist"]}>
            <OptimetristDashboard />
          </Page>
        }
      />

      <Route
        path="/new-prescription"
        element={
          <Page roles={["optometrist"]}>
            <NewPresctiption />
          </Page>
        }
      />

      <Route
        path="/patient-management"
        element={
          <Page roles={["optometrist"]}>
            <PatientManagement />
          </Page>
        }
      />

      {/* Sales Executive */}
      <Route
        path="/sales-executive-dashboard"
        element={
          <Page roles={["sales-executive"]}>
            <SalesExecutiveDashboard />
          </Page>
        }
      />

      <Route
        path="/new-order"
        element={
          <Page roles={["sales-executive"]}>
            <NewOrder />
          </Page>
        }
      />

      <Route
        path="/orders"
        element={
          <Page roles={["sales-executive"]}>
            <Orders />
          </Page>
        }
      />

      {/* Recovery Officer */}
      <Route
        path="/recovery-dashboard"
        element={
          <Page roles={["recovery-officer"]}>
            <RecoveryDashboard />
          </Page>
        }
      />

      <Route
        path="/recovery-sheet"
        element={
          <Page roles={["recovery-officer"]}>
            <RecoverySheet />
          </Page>
        }
      />

      <Route
        path="/warranty-claim"
        element={
          <Page roles={["recovery-officer"]}>
            <WarrantyClaim />
          </Page>
        }
      />

      <Route
        path="/cash-transfer"
        element={
          <Page roles={["recovery-officer"]}>
            <CashTransfer />
          </Page>
        }
      />

      <Route
        path="/recovery-followup"
        element={
          <Page roles={["recovery-officer"]}>
            <RecoveryFollowUp />
          </Page>
        }
      />

      {/* Accountant */}
      <Route
        path="/accountant"
        element={
          <Page roles={["accountant"]}>
            <AccountingDashboard />
          </Page>
        }
      />
      
      

      <Route
        path="/accCashTransfer"
        element={
          <Page roles={["accountant"]}>
            <ACCashTransfer />
          </Page>
        }
      />

      <Route
        path="/accDailySales"
        element={
          <Page roles={["accountant"]}>
            <DailySales />
          </Page>
        }
      />

      <Route
        path="/accOrderfilter"
        element={
          <Page roles={["accountant"]}>
            <OrderFilter />
          </Page>
        }
      />

      <Route
        path="/accRecovery-Filtering"
        element={
          <Page roles={["accountant"]}>
            <RecoveryFiltering />
          </Page>
        }
      />

      <Route
        path="/accRecovery-Details"
        element={
          <Page roles={["accountant"]}>
            <RecoveryDetails />
          </Page>
        }
      />




      {/* Admin */}
      <Route
        path="/admin-dashboard"
        element={
          <Page roles={["admin"]}>
            <AdminDashboard />
          </Page>
        }
      />

      {/* Admin */}
      <Route
        path="/customer-lookup"
        element={
          <Page roles={["admin"]}>
            <CustomerLookup />
          </Page>
        }
      />

      {/* Admin */}
      <Route
        path="/inventory-management"
        element={
          <Page roles={["admin"]}>
            <InventoryManagement />
          </Page>
        }
      />

      {/* Admin */}
      <Route
        path="/project-clinic"
        element={
          <Page roles={["admin"]}>
            <ProjectClinic />
          </Page>
        }
      />


       {/* Owner */}
      <Route
        path="/owner"
        element={
          <Page roles={["owner"]}>
            <OwnerDashboard />
          </Page>
        }
      />

       <Route
        path="/project-management"
        element={
          <Page roles={["owner"]}>
            <ProjectManagement />
          </Page>
        }
      />


      <Route
        path="/payment-monitoring"
        element={
          <Page roles={["owner"]}>
            <PaymentMonitoring />
          </Page>
        }
      />


       <Route
        path="/reports"
        element={
          <Page roles={["owner"]}>
            <Reports />
          </Page>
        }
      />

      <Route
        path="/SystemActivity"
        element={
          <Page roles={["owner"]}>
            <SystemActivity />
          </Page>
        }
      />

      <Route
        path="/UserManagement"
        element={
          <Page roles={["owner"]}>
            <UserManagement />
          </Page>
        }
      />











      {/* Manager */}
      <Route path="/manager-dashboard" element={
        <Page roles={["manager"]}>
          <ManagerDashboard />
        </Page>
      } />

      <Route path="/clinics" element={
        <Page roles={["manager"]}>
          <ClinicDetails />
        </Page>
      } />

      <Route path="/stock-management" element={
        <Page roles={["manager"]}>
          <ManagerStockManagement />
        </Page>
      } />

      <Route path="/cash-handling" element={
        <Page roles={["manager"]}>
          <CashHandling />
        </Page>
      } />

      <Route path="/petty-cash" element={
        <Page roles={["manager"]}>
          <PettyCash />
        </Page>
      } />

      <Route path="/pending-laborders" element={
        <Page roles={["manager"]}>
          <PendingLabOrders />
        </Page>
      } />

      <Route path="/pending-payments" element={
        <Page roles={["manager"]}>
          <PendingPayment/>
        </Page>
      }/>

      <Route path="/complaint-handling" element={
        <Page roles={["manager"]}>
          <ComplaintHandling />
        </Page>
      }/>

      <Route path="/reports" element={
        <Page roles={["manager"]}>
          <Report/>
        </Page>
      }/>

      {/* Admin */}
      <Route path="/batch-tracking" element={
        <Page roles={["admin"]}>
          <BatchTracking />
        </Page>
      } />

      <Route path="/reminder-calls" element={
        <Page roles={["admin"]}>
          <ReminderCalls />
        </Page>
      } />

      <Route path="/complaint-handling" element={
        <Page roles={["admin"]}>
          <ComplaintHandling />
        </Page>
      } />





    </Routes>
  );
}

export default App;
