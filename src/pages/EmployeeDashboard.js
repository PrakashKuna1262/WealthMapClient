import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHome, FaUsers, FaUserCog, FaClipboardList, 
  FaChartLine, FaSignOutAlt, FaBuilding, FaCog,
  FaSearch, FaBell, FaBars, FaTimes, FaMapMarkerAlt,
  FaBookmark, FaCommentDots
} from 'react-icons/fa';
import EmployeeSettings from './EmployeeSettings';
import Requests from './Requests';
import EmployeeDashboardHome from './EmployeeDashboardHome';
import MapView from './MapView';
import BookmarksView from './BookmarksView';
import PropertySearch from './PropertySearch';
import PropertyAnalytics from './PropertyAnalytics';
import FeedbackManagement from './FeedbackManagement';
import MyProfile from './MyProfile';
import './EmployeeDashboard.css';

function EmployeeDashboard() {
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
    navigate('/employee-dashboard/profile');
    setShowMobileLogout(false);
  };

  const handleBookmark=()=>
  {
    navigate('/employee-dashboard/bookmark');
  }

  const handleFeedback = () =>
  {
    navigate('/employee-dashboard/feedback-management');
  }

  // Check if a nav item is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname === `/employee-dashboard${path}`;
  };

  // Get user initials for avatar
  const getInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'E';
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
          <span className="brand-name">Wealth Map Employee</span>
        </div>
        
        <div className="navbar-actions">
          {/* Desktop logout button */}
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
          
          {/* Mobile menu toggle */}
          <button className="navbar-mobile-toggle" onClick={toggleMobileLogout}>
            {showMobileLogout ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu - expands from navbar */}
      <div className={`mobile-dropdown ${showMobileLogout ? 'open' : ''}`}>
        <button onClick={handleProfile} className="mobile-dropdown-item">
          <FaUserCog className="dropdown-icon" />
          <span>Company Profile</span>
        </button>

        <button onClick={handleBookmark} className="mobile-dropdown-item">
          <FaBookmark className="dropdown-icon" /> 
          <span>Bookmark</span>
        </button>

        <button onClick={handleFeedback} className="mobile-dropdown-item">
          <FaCommentDots className="dropdown-icon" /> 
          <span>Feedback</span>
        </button>
        
        <button onClick={handleLogout} className="mobile-dropdown-item">
          <FaSignOutAlt className="dropdown-icon" /> 
          <span>Logout</span>
        </button>

        
      </div>
      
      {/* Desktop Navigation - Only visible on desktop */}
      <div className="desktop-nav">
        <Link to="/employee-dashboard" className={`desktop-nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaHome className="desktop-nav-icon" />
          </div>
          <span>Dashboard</span>
        </Link>
        
        <Link to="/employee-dashboard/property-search" className={`desktop-nav-item ${isActive('/property-search') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaSearch className="desktop-nav-icon" />
          </div>
          <span>Search</span>
        </Link>
        
        <Link to="/employee-dashboard/add-property" className={`desktop-nav-item ${isActive('/add-property') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaMapMarkerAlt className="desktop-nav-icon" />
          </div>
          <span>Add Properties</span>
        </Link>
        
        <Link to="/employee-dashboard/requests" className={`desktop-nav-item ${isActive('/requests') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaClipboardList className="desktop-nav-icon" />
          </div>
          <span>Requests</span>
        </Link>
        
        <Link to="/employee-dashboard/book-marks" className={`desktop-nav-item ${isActive('/book-marks') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaBookmark className="desktop-nav-icon" />
          </div>
          <span>Bookmarks</span>
        </Link>
        
        <Link to="/employee-dashboard/property-analytics" className={`desktop-nav-item ${isActive('/property-analytics') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaChartLine className="desktop-nav-icon" />
          </div>
          <span>Analytics</span>
        </Link>
        
        <Link to="/employee-dashboard/feedback-management" className={`desktop-nav-item ${isActive('/feedback-management') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaCommentDots className="desktop-nav-icon" />
          </div>
          <span>Feedback</span>
        </Link>
        
        <Link to="/employee-dashboard/employee_settings" className={`desktop-nav-item ${isActive('/employee_settings') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaCog className="desktop-nav-icon" />
          </div>
          <span>Settings</span>
        </Link>
        
        <Link to="/employee-dashboard/profile" className={`desktop-nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <div className="desktop-nav-icon-wrapper">
            <FaUserCog className="desktop-nav-icon" />
          </div>
          <span>Company Profile</span>
        </Link>
      </div>

      {/* Hero section with welcome message
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1>Welcome, {user ? user.name : 'Employee'}!</h1>
          <p>Manage properties, track your tasks, and access your tools</p>
        </div>
        <div className="user-profile">
          <div className="avatar">{getInitial()}</div>
          <div className="user-info">
            <h3>{user ? user.name : 'Employee'}</h3>
            <p>{user ? user.email : ''}</p>
          </div>
        </div>
      </div> */}
      
      {/* Main content area */}
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<EmployeeDashboardHome />} />
          <Route path="/property-search" element={<PropertySearch />} />
          <Route path="/employee_settings" element={<EmployeeSettings />} />
          <Route path="/add-property" element={<MapView />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/book-marks" element={<BookmarksView />} />
          <Route path="/property-analytics" element={<PropertyAnalytics />} />
          <Route path="/feedback-management" element={<FeedbackManagement />} />
          <Route path="/profile" element={<MyProfile />} />
        </Routes>
      </div>
      
      {/* Fixed Footer Navigation - Only visible on mobile */}
      <div className="dashboard-footer-nav">
        <Link to="/employee-dashboard" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaHome />
          </div>
          <span className="nav-label">Home</span>
        </Link>
        
        <Link to="/employee-dashboard/property-search" className={`nav-item ${isActive('/property-search') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaSearch />
          </div>
          <span className="nav-label">Search</span>
        </Link>
        
        <Link to="/employee-dashboard/add-property" className={`nav-item ${isActive('/add-property') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaMapMarkerAlt />
          </div>
          <span className="nav-label">Add</span>
        </Link>
        
        <Link to="/employee-dashboard/requests" className={`nav-item ${isActive('/requests') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaClipboardList />
          </div>
          <span className="nav-label">Requests</span>
        </Link>
        
        <Link to="/employee-dashboard/employee_settings" className={`nav-item ${isActive('/employee_settings') ? 'active' : ''}`}>
          <div className="nav-icon">
            <FaUserCog />
          </div>
          <span className="nav-label">Profile</span>
        </Link>
      </div>
    </div>
  );
}

export default EmployeeDashboard;







