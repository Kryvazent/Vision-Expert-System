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


// Wrap page in both layout + role guard
function Page({ roles, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <CommonPageStructure>
        {children}
      </CommonPageStructure>
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
      <Route path="/track" element={
        <CommonPageStructure>
          <Track />
        </CommonPageStructure>
      } />



      {/* Optometrist */}
      <Route path="/optometrist-dashboard" element={
        <Page roles={["optometrist"]}>
          <OptimetristDashboard />
        </Page>
      } />

      <Route path="/new-prescription" element={
        <Page roles={["optometrist"]}>
          <NewPresctiption />
        </Page>
      } />

      <Route path="/patient-management" element={
        <Page roles={["optometrist"]}>
          <PatientManagement />
        </Page>
      } />




      {/* Sales Executive */}
      <Route path="/sales-executive-dashboard" element={
        <Page roles={["sales-executive"]}>
          <SalesExecutiveDashboard />
        </Page>
      } />

      <Route path="/new-order" element={
        <Page roles={["sales-executive"]}>
          <NewOrder />
        </Page>
      } />

      <Route path="/orders" element={
        <Page roles={["sales-executive"]}>
          <Orders />
        </Page>
      } />


      {/* Recovery Officer */}
      <Route path="/recovery-dashboard" element={
        <Page roles={["recovery-officer"]}>
          <RecoveryDashboard />
        </Page>
      } />

      <Route path="/recovery-sheet" element={
        <Page roles={["recovery-officer"]}>
          <RecoverySheet />
        </Page>
      } />

      <Route path="/warranty-claim" element={
        <Page roles={["recovery-officer"]}>
          <WarrantyClaim />
        </Page>


      } />

      <Route path="/cash-transfer" element={
        <Page roles={["recovery-officer"]}>
          <CashTransfer />
        </Page>
      } />

      <Route path="/recovery-followup" element={
        <Page roles={["recovery-officer"]}>
          <RecoveryFollowUp />
        </Page>
      } />



      {/* Accountant */}
      <Route path="/accountant" element={
        <Page roles={["accountant"]}>
          <AccountingDashboard />
        </Page>
      } />

      {/* Admin */}
      <Route path="/admin-dashboard" element={
        <Page roles={["admin"]}>
          <AdminDashboard />
        </Page>
      } />

       {/* Admin */}
      <Route path="/customer-lookup" element={
        <Page roles={["admin"]}>
          <CustomerLookup />
        </Page>
      } />

      {/* Admin */}
      <Route path="/inventory-management" element={
        <Page roles={["admin"]}>
          <InventoryManagement />
        </Page>
      } />

      {/* Admin */}
      <Route path="/project-clinic" element={
        <Page roles={["admin"]}>
          <ProjectClinic />
        </Page>
      } />




    </Routes>
  );
}

export default App;