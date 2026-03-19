import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import RecoverySheet from './pages/recovery-officer/RecoverySheet';
import RecoveryDashboard from './pages/recovery-officer/RecoveryDashboard';
import CommonPageStructure from './pages/CommonPageStructure';
import OptimetristDashboard from './pages/optimetrist/OptimetristDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure user={{ name: "John Doe", role: "Recovery Officer" }}>
          <RecoveryDashboard />
        </CommonPageStructure>
      } />
      <Route path="/optimetrist-dashboard" element={
        <CommonPageStructure user={{ name: "John Doe", role: "Optimetrist" }}>
          <OptimetristDashboard />
        </CommonPageStructure>
      } />
    </Routes> 
  );
}

export default App;
