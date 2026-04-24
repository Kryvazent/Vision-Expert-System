import { Routes, Route } from 'react-router';
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
import RecoverySheet from './pages/recovery-officer/RecoverySheet';
import CashTransfer from './pages/recovery-officer/CashTransfer';
import HandOverDetails from './component/recoveryOfficer/HandOverDetails';
import DailySales from './pages/Accountant/DailySales';
import OrderFilter from './pages/Accountant/OrderFilter';
import RecoveryFiltering from './pages/Accountant/RecoveryFiltering';
import RecoveryDetails from './pages/Accountant/RecoveryDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

        {/* Recovery officer */}
        
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure>
          <RecoveryDashboard />
        </CommonPageStructure>
      } />

      <Route path="/warranty-claim" element={
        <CommonPageStructure>
          <WarrantyClaim />
        </CommonPageStructure>
      } />

      <Route path="/recovery-sheet" element={
        <CommonPageStructure>
          <RecoverySheet/>
        </CommonPageStructure>
      } />

      <Route path="/cash-transfer" element={
        <CommonPageStructure>
          <CashTransfer/>
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

        <Route path="/accCashTransfer" element={
        <CommonPageStructure>
       <CashTransfer/>
        </CommonPageStructure>
      } />

      <Route path="/accDailySales" element={
        <CommonPageStructure>
       <DailySales/>
        </CommonPageStructure>
      } />

       <Route path="/accOrderfilter" element={
        <CommonPageStructure>
       <OrderFilter/>
        </CommonPageStructure>
      } />

       <Route path="/accRecovery-Filtering" element={
        <CommonPageStructure>
       <RecoveryFiltering/>
        </CommonPageStructure>
      } />

      <Route path="/accRecovery-Details" element={
        <CommonPageStructure>
       <RecoveryDetails/>
        </CommonPageStructure>
      } />





    </Routes>
  );
}

export default App;
