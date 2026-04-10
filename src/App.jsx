import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import Recovery_dashboard from './pages/Recovery Officer/Recovery_dashboard';
import RecoverySheet from './pages/Recovery Officer/RecoverySheet';
import AdminDashboard from './pages/AdministrativeOfficer/AdminDashboard';
import CustomerLokup from './pages/AdministrativeOfficer/CustomerLokup';


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={<Recovery_dashboard />} />
      <Route path="/recovery-sheet" element={<RecoverySheet />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path ="/customer-lookup" element={<CustomerLokup/>}/>
    </Routes> 
  );
}

export default App;
