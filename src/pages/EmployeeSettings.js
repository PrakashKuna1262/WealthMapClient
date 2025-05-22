import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import './EmployeeSettings.css';

const EmployeeSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });
  
  // API base URL
  const API_URL = 'https://wealthmap-server.onrender.com/api';
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_URL}/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load user data. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Submitting password change:', {
        currentPassword: '***',
        newPassword: '***'
      });
      
      const response = await axios.post(
        `${API_URL}/employees/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      console.log('Password change response:', response.data);
      
      setMessage({ type: 'success', text: response.data.message || 'Password updated successfully' });
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Submitting email change:', {
        newEmail: emailData.newEmail,
        password: '***'
      });
      
      const response = await axios.post(
        `${API_URL}/employees/change-email`,
        {
          newEmail: emailData.newEmail,
          password: emailData.password
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      console.log('Email change response:', response.data);
      
      setMessage({ type: 'success', text: response.data.message || 'Email updated successfully' });
      
      // Update user data
      setUser({
        ...user,
        email: emailData.newEmail
      });
      
      // Clear form
      setEmailData({
        newEmail: '',
        password: ''
      });
    } catch (error) {
      console.error('Error changing email:', error.response?.data || error.message);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update email. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !user) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <div className="employee-settings-container">
      <h2>Account Settings</h2>
      
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
        </div>
      )}
      
      <div className="settings-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={activeTab === 'email' ? 'active' : ''} 
          onClick={() => setActiveTab('email')}
        >
          <FaEnvelope /> Change Email
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          <FaLock /> Change Password
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'profile' && user && (
          <div className="profile-tab">
            <div className="profile-info">
              <div className="profile-avatar">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>
              <div className="profile-details">
                <h3>{user.firstName} {user.lastName}</h3>
                <p className="profile-role">{user.role}</p>
                <p className="profile-department">{user.department}</p>
              </div>
            </div>
            
            <div className="profile-fields">
              <div className="profile-field">
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <p>{user.phone || 'Not provided'}</p>
              </div>
              <div className="profile-field">
                <label>Status</label>
                <p className={`status ${user.status?.toLowerCase()}`}>{user.status || 'Active'}</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'email' && (
          <div className="email-tab">
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label htmlFor="newEmail">New Email Address</label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={emailData.newEmail}
                  onChange={handleEmailChange}
                  required
                  placeholder="Enter new email address"
                  style={{color: 'black'}}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Current Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={emailData.password}
                  onChange={handleEmailChange}
                  required
                  placeholder="Enter your current password to confirm"
                  style={{color: 'black'}}
                />
                <small>We need your current password to verify your identity</small>
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>
        )}
        
        {activeTab === 'password' && (
          <div className="password-tab">
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your current password"
                  style={{color: 'black'}}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password (min. 6 characters)"
                  style={{color: 'black'}}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                  style={{color: 'black'}}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSettings;

