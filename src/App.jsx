import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import RecoveryDashboard from './pages/recovery-officer/RecoveryDashboard';
import CommonPageStructure from './pages/CommonPageStructure';
import OptimetristDashboard from './pages/optimetrist/OptimetristDashboard';
import NewPresctiption from './pages/optimetrist/NewPrescription';
import SalesExecutiveDashboard from './pages/sales-executive/SalesExecutiveDashboard';
import WarrantyClaim from './pages/recovery-officer/WarrantyClaim';
import NewOrder from './pages/sales-executive/NewOrder';
import Orders from './pages/sales-executive/Orders';
import Login from './pages/login/Login';
import Track from './pages/track/Track';
import AccountingDashboard from './pages/Accountant/AccountingDashboard';
import RecoveryFiltering from './pages/Accountant/RecoveryFiltering';
import RecoveryDetails from './pages/Accountant/RecoveryDetails';
import DailySales from './pages/Accountant/DailySales';
import OrderFilter from './pages/Accountant/OrderFilter';
import CashTransfer from './pages/Accountant/CashTransfer';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import UserManagement from './pages/owner/UserManagment';
import ProjectManagement from './pages/owner/ProjectManagment';
import PaymentMonitoring from './pages/owner/PaymentMonitering';
import SystemActivity from './pages/owner/SystemActivity';
import Reports from './pages/owner/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure>
          <WarrantyClaim />
        </CommonPageStructure>
      } />

      {/* optimetrist */}

      <Route path="/optimetrist-dashboard" element={
        <CommonPageStructure>
          <OptimetristDashboard />
        </CommonPageStructure>
      } />

      <Route path="/new-prescription" element={
        <CommonPageStructure>
          <NewPresctiption />
        </CommonPageStructure>
      } />

      {/* sales executive */}

      <Route path="/sales-executive-dashboard" element={
        <CommonPageStructure>
          <SalesExecutiveDashboard />
        </CommonPageStructure>
      } />

      <Route path="/new-order" element={
        <CommonPageStructure>
          <NewOrder />
        </CommonPageStructure>
      } />

      <Route path="/orders" element={
        <CommonPageStructure>
          <Orders />
        </CommonPageStructure>
      } />


      {/* login */}
      <Route path="/login" element={
          <Login />
      } />

      {/* track order */}
      <Route path="/track" element={
        <CommonPageStructure>
          <Track />
        </CommonPageStructure>
      } />

      <Route path="/accountant" element={
        <CommonPageStructure>
       <AccountingDashboard />
        </CommonPageStructure>
      } />

      <Route path="/accountant/recovery" element={
        <CommonPageStructure>
        <RecoveryFiltering/>
        </CommonPageStructure>
      } />


      <Route path="/accountant/recoverydetails" element={
        <CommonPageStructure>
        <RecoveryDetails/>
        </CommonPageStructure>
      } />

      <Route path="/accountant/dailysales" element={
        <CommonPageStructure>
        <DailySales/>
        </CommonPageStructure>
      } />


       <Route path="/accountant/orderfilter" element={
        <CommonPageStructure>
        <OrderFilter/>
        </CommonPageStructure>
      } />


      <Route path="/accountant/cashtransfer" element={
        <CommonPageStructure>
        <CashTransfer/>
        </CommonPageStructure>
      } />


      <Route path="/owner" element={
        <CommonPageStructure>
        <OwnerDashboard/>
        </CommonPageStructure>
      } />

      <Route path="/owner/user-management" element={
        <CommonPageStructure>
        <UserManagement/>
        </CommonPageStructure>
      } />

      <Route path="/owner/project-management" element={
        <CommonPageStructure>
        <ProjectManagement/>
        </CommonPageStructure>
      } />

      <Route path="/owner/payment-monitoring" element={
        <CommonPageStructure>
        <PaymentMonitoring/>
        </CommonPageStructure>
      } />

      <Route path="/owner/system-activity" element={
        <CommonPageStructure>
        <SystemActivity/>
        </CommonPageStructure>
      } />

      <Route path="/owner/reports" element={
        <CommonPageStructure>
        <Reports/>
        </CommonPageStructure>
      } />







    </Routes>
  );
}

export default App;
