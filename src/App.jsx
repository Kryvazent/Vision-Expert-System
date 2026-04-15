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






    </Routes>
  );
}

export default App;
