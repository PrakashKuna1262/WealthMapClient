import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
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
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('profile');
  
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
      
      // Update the URL to use the deployed backend
      const response = await axios.get(`https://wealthmap-server.onrender.com/api/auth/user`, {
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
        `${API_URL}/change-password`, // Updated URL from /auth/change-password to /change-password
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
    setMessage({ type: '', text: '' });
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setMessage({ type: 'error', text: 'Please provide a valid email address' });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/change-email`, // Updated URL from /auth/change-email to /change-email
        {
          newEmail: emailData.newEmail,
          password: emailData.password
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      setMessage({ type: 'success', text: response.data.message || 'Email updated successfully' });
      
      // Update user data
      setUser({
        ...user,
        email: emailData.newEmail
      });
      
      // Update user in localStorage if it exists
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser && storedUser.email) {
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          email: emailData.newEmail
        }));
      }
      
      // Clear form
      setEmailData({
        newEmail: '',
        password: ''
      });
    } catch (error) {
      console.error('Error changing email:', error);
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
      <div className="settings-container">
        <div className="loading-spinner">Loading user data...</div>
      </div>
    );
  }
  
  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <FaLock /> Change Password
        </button>
        <button 
          className={`tab-button ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          <FaEnvelope /> Change Email
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'profile' && user && (
          <div className="profile-tab">
            <div className="user-info-card">
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p className="user-email"><FaEnvelope /> {user.email}</p>
                <p className="user-role"><FaUserShield /> {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
                {user.createdAt && (
                  <p className="user-since">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
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
                  style={{ color: 'black' }}
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
                  placeholder="Enter new password"
                  style={{ color: 'black' }}
                />
                <small>Password must be at least 6 characters long</small>
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
                  placeholder="Confirm new password"
                  style={{ color: 'black' }}
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
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
                  style={{ color: 'black' }}
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
                  style={{ color: 'black' }}
                />
                <small>We need your current password to verify your identity</small>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Email'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

