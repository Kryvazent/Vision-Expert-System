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
import OwnerDashboard from '../pages/owner/OwnerDashboard';


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
      <Route path="/optimetrist-dashboard" element={
        <Page roles={["optometrist"]}>
          <OptimetristDashboard />
        </Page>
      } />

      <Route path="/new-prescription" element={
        <Page roles={["optometrist"]}>
          <NewPresctiption />
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





      {/* Accountant */}
      <Route path="/accountant" element={
        <Page roles={["accountant"]}>
          <AccountingDashboard />
        </Page>
      } />

    </Routes>
  );
}

export default App;