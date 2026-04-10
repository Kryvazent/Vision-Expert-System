import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import RecoveryDashboard from './pages/recovery-officer/RecoveryDashboard';
import CommonPageStructure from './pages/CommonPageStructure';
import OptimetristDashboard from './pages/optimetrist/OptimetristDashboard';
import WarrantyClaim from './pages/recovery-officer/WarrantyClaim';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure>
          <WarrantyClaim />
        </CommonPageStructure>
      } />
      <Route path="/optimetrist-dashboard" element={
        <CommonPageStructure>
          <OptimetristDashboard />
        </CommonPageStructure>
      } />
    </Routes> 
  );
}

export default App;
