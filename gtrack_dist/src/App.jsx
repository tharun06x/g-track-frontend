import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// General / Distributor Imports
import Login from './pages/Login';
import Layout from './components/Layout';
import MyInfo from './pages/MyInfo';
import BookingRefills from './pages/BookingRefills';
import Complaints from './pages/Complaints';
import SelfService from './pages/SelfService';
import UserProfile from './pages/UserProfile';
import RegisteredConsumers from './pages/RegisteredConsumers';
import Reports from './pages/Reports';
import Help from './pages/Help';
import ConsumerSignup from './pages/ConsumerSignup';

// Administrator Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminInfo from './pages/admin/AdminInfo';
import DistributorManagement from './pages/admin/DistributorManagement';
import LoginRequests from './pages/admin/LoginRequests';
import AdminProfile from './pages/admin/AdminProfile';

import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<ConsumerSignup />} />
          
          {/* --- DISTRIBUTOR PORTAL --- */}
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<MyInfo />} />
          <Route path="/booking-refills" element={<BookingRefills />} />
          <Route path="/registered-consumers" element={<RegisteredConsumers />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/self-service" element={<SelfService />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/report" element={<Reports />} />
          <Route path="/help" element={<Help />} />
        </Route>

        {/* --- ADMINISTRATOR PORTAL --- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminInfo />} />
          <Route path="/admin/distributors" element={<DistributorManagement />} />
          <Route path="/admin/requests" element={<LoginRequests />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
    </AppProvider>
  );
}

export default App;
