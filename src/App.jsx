import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import RecoverySheet from './pages/recovery-officer/RecoverySheet';
import RecoveryDashboard from './pages/recovery-officer/RecoveryDashboard';
import CommonPageStructure from './pages/CommonPageStructure';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={
        <CommonPageStructure>
          <RecoveryDashboard />
        </CommonPageStructure>
      } />
      <Route path="/recovery-sheet" element={
        <CommonPageStructure>
          <RecoverySheet />
        </CommonPageStructure>
      } />
    </Routes> 
  );
}

export default App;
