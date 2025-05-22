import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import './AddEmployee.css';

function AddEmployee() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'employee',
    department: ''
    // Company name will be automatically added from the admin's profile
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [adminInfo, setAdminInfo] = useState(null);
  
  useEffect(() => {
    // Get admin info to display company name
    const getAdminInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('https://wealthmap-server.onrender.com/api/auth/me', {
          headers: {
            'x-auth-token': token
          }
        });
        
        setAdminInfo(response.data);
      } catch (error) {
        console.error('Error fetching admin info:', error);
      }
    };
    
    getAdminInfo();
  }, []);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const validateForm = () => {
    // Check required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please provide a valid email address' });
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication error. Please log in again.' });
        setLoading(false);
        return;
      }
      
      // Send request to create employee
      // The backend will automatically add the company name based on the admin's profile
      const response = await axios.post(
        'https://wealthmap-server.onrender.com/api/employees',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      // Show success message
      setMessage({ 
        type: 'success', 
        text: 'Employee added successfully! Credentials have been sent to their email.' 
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'employee',
        department: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error adding employee. Please try again.' 
      });
      console.error('Add employee error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-employee-container">
      <div className="add-employee-header">
        <h2><FaUserPlus /> Add New Employee</h2>
        {adminInfo && (
          <p className="company-info">
            Adding employee to: <strong>{adminInfo.companyName}</strong>
          </p>
        )}
      </div>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <FaCheckCircle style={{marginRight: '10px'}} /> : <FaExclamationTriangle style={{marginRight: '10px'}} />}
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="add-employee-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding...' : 'Add Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployee;
