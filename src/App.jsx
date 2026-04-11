import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import RecoveryDashboard from './pages/recovery-officer/RecoveryDashboard';
import CommonPageStructure from './pages/CommonPageStructure';
import OptimetristDashboard from './pages/optimetrist/OptimetristDashboard';
import NewPresctiption from './pages/optimetrist/NewPrescription';
import SalesExecutiveDashboard from './pages/sales-executive/SalesExecutiveDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure>
          <RecoveryDashboard />
        </CommonPageStructure>
      } />
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

      <Route path="/sales-executive-dashboard" element={
        <CommonPageStructure>
          <SalesExecutiveDashboard />
        </CommonPageStructure>
      } />
    </Routes>
  );
}

export default App;
