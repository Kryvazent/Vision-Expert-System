import { Routes, Route } from 'react-router';
import LoginPage from './pages/Login.page';
import Recovery_dashboard from './pages/Recovery Officer/Recovery_dashboard';
import RecoverySheet from './pages/Recovery Officer/RecoverySheet';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/recovery-dashboard" element={<Recovery_dashboard />} />
      <Route path="/recovery-sheet" element={<RecoverySheet />} />
    </Routes> 
  );
}

export default App;
