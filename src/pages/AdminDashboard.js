import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHome, FaUsers, FaUserCog, FaClipboardList, 
  FaChartLine, FaSignOutAlt, FaBuilding, FaCog,
  FaSearch, FaBell, FaBars, FaTimes
} from 'react-icons/fa';
import './AdminDashboard.css';
import DashBoardHome from './DashBoardHome';
import ManageUsers from './ManageUsers';
import Analytics from './Analytics';
import MyProfile from './MyProfile';
import Settings from './Settings';
import Requests from './Requests';
import PropertyAnalytics from './PropertyAnalytics';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileLogout, setShowMobileLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to load user data and verify token
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from localStorage
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!token || !userData) {
          throw new Error('No authentication data found');
        }
        
        // Verify token is valid with the server
        const response = await axios.get('https://wealthmap-server.onrender.com/api/auth/user', {
          headers: { 'x-auth-token': token }
        });
        
        // Check if user is admin
        if (userData.role !== 'admin') {
          throw new Error('Not authorized as admin');
        }
        
        // Set user data if token is valid
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a short delay
        setTimeout(() => handleLogout(), 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // Simple toggle function
  const toggleMobileLogout = () => {
    setShowMobileLogout(!showMobileLogout);
  };

  // Function to handle profile
  const handleProfile = () => {
    navigate('/admin-dashboard/profile');
    setShowMobileLogout(false);
  };

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname === `/admin-dashboard${path}`;
  };

  // Get user initials for avatar
  const getInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'A';
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Show error message if authentication failed
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navbar - Simplified approach */}
      <div className="top-navbar">
        <div className="navbar-brand">
          <FaHome className="brand-icon" />
          <span className="brand-name">Wealth Map Admin</span>
        </div>
        
        <div className="navbar-actions">
          {/* Desktop logout button */}
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
          
          {/* Mobile menu toggle */}
          <button className="navbar-mobile-toggle" onClick={toggleMobileLogout}>
            {showMobileLogout ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu - expands from navbar */}
      <div className={`mobile-dropdown ${showMobileLogout ? 'open' : ''}`}>

       
        <button onClick={handleLogout} className="mobile-dropdown-item">
          <FaSignOutAlt className="dropdown-icon" /> 
          <span>Logout</span>
        </button>

         <button onClick={handleProfile} className="mobile-dropdown-item">
          <FaUserCog className="dropdown-icon" />
          <span>Company Profile</span>
        </button>
        
      </div>
      
      {/* Desktop Navigation - Only visible on desktop */}
      <div className="desktop-nav">
        <Link to="/admin-dashboard" className={`desktop-nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaHome className="desktop-nav-icon" />
          </div>
          <span>Dashboard</span>
        </Link>
        
        <Link to="/admin-dashboard/users" className={`desktop-nav-item ${isActive('/users') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaUsers className="desktop-nav-icon" />
          </div>
          <span>Manage Users</span>
        </Link>
        
        <Link to="/admin-dashboard/profile" className={`desktop-nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaUserCog className="desktop-nav-icon" />
          </div>
          <span>Company Profile</span>
        </Link>
        
        <Link to="/admin-dashboard/requests" className={`desktop-nav-item ${isActive('/requests') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaClipboardList className="desktop-nav-icon" />
          </div>
          <span>Requests</span>
        </Link>
        
        <Link to="/admin-dashboard/analytics" className={`desktop-nav-item ${isActive('/analytics') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaChartLine className="desktop-nav-icon" />
          </div>
          <span>Analytics</span>
        </Link>
        
        <Link to="/admin-dashboard/settings" className={`desktop-nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaCog className="desktop-nav-icon" />
          </div>
          <span>Profile</span>
        </Link>
      </div>
      
      

      {/* Hero section with welcome message */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome, {user ? user.name : 'Admin'}!</h1>
          <p>Manage your organization, users, and property analytics</p>
        </div>
        <div className="user-profile">
          <div className="avatar">{getInitial()}</div>
          <div className="user-info">
            <h3>{user ? user.name : 'Admin'}</h3>
            <p>{user ? user.email : ''}</p>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashBoardHome />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/property-analytics" element={<PropertyAnalytics />} />
        </Routes>
      </div>
      
      {/* Fixed Footer Navigation - Only visible on mobile */}
      <div className="dashboard-footer-nav">
        <Link to="/admin-dashboard" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaHome />
          </div>
          <span className="nav-label">Home</span>
        </Link>
        
        <Link to="/admin-dashboard/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaUsers />
          </div>
          <span className="nav-label">Users</span>
        </Link>
        
        <Link to="/admin-dashboard/requests" className={`nav-item ${isActive('/requests') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaClipboardList />
          </div>
          <span className="nav-label">Requests</span>
        </Link>
        
        <Link to="/admin-dashboard/analytics" className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaChartLine />
          </div>
          <span className="nav-label">Analytics</span>
        </Link>
        
        <Link to="/admin-dashboard/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaCog />
          </div>
          <span className="nav-label">Settings</span>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;


















