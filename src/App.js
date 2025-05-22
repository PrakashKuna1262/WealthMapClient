import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import Register from './Signin';
import Login from './Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
// Removed AuthDebug import

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserRole(user.role);
        console.log("User authenticated:", user.role);
      } catch (e) {
        console.error("Error parsing user data:", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Admin route */}
          <Route 
            path="/admin-dashboard/*" 
            element={
              loading ? <div>Loading...</div> : 
              isAuthenticated && userRole === 'admin' ? 
              <AdminDashboard /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          {/* Employee route */}
          <Route 
            path="/employee-dashboard/*" 
            element={
              loading ? <div>Loading...</div> : 
              isAuthenticated ? 
              <EmployeeDashboard /> : 
              <Navigate to="/login" replace />
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Removed AuthDebug component */}
      </div>
    </Router>
  );
}

export default App;






