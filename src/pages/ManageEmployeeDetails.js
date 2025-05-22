import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserEdit, FaTrash, FaSearch, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import './ManageEmployeeDetails.css';

function ManageEmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('https://wealthmap-server.onrender.com/api/employees', {
          headers: { 'x-auth-token': token }
        });
        
        if (Array.isArray(response.data)) {
          setEmployees(response.data);
        } else {
          console.error('Expected array of employees but got:', response.data);
          setEmployees([]);
          setError('Received invalid data format from server');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Error boundary fallback
  if (error) {
    return (
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Handle employee deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`https://wealthmap-server.onrender.com/api/employees/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setEmployees(employees.filter(employee => employee._id !== id));
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };
  
  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(employee => {
    // Make sure employee properties exist before using them
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const department = employee.department || '';
    const status = employee.status || '';
    
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          email.includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === '' || department === filterDepartment;
    const matchesStatus = filterStatus === '' || status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });
  
  // Get unique departments for filter - safely handle undefined values
  const departments = [...new Set(employees
    .map(emp => emp.department)
    .filter(Boolean))]; // Filter out null/undefined departments
  
  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="manage-employees-container">
      <div className="manage-employees-header">
        <h2>Manage Employee Details</h2>
        <p>Edit or update existing employee information</p>
      </div>
      
      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select 
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredEmployees.length === 0 ? (
        <div className="no-employees">
          <p>No employees found matching your criteria.</p>
        </div>
      ) : (
        <div className="employee-cards">
          {filteredEmployees.map(employee => {
            // Safely get status with fallback
            const status = employee.status || 'unknown';
            
            return (
              <div className="employee-card" key={employee._id}>
                <div className="employee-avatar" style={{ backgroundColor: getRandomColor(employee._id) }}>
                  {employee.firstName ? employee.firstName.charAt(0) : ''}{employee.lastName ? employee.lastName.charAt(0) : ''}
                </div>
                <div className="employee-info">
                  <h4>{employee.firstName || ''} {employee.lastName || ''}</h4>
                  <p className="employee-role">{employee.role || 'N/A'} - {employee.department || 'N/A'}</p>
                  <p className="employee-email">{employee.email || 'No email'}</p>
                  <p className="employee-phone">{employee.phone || 'No phone number'}</p>
                  <span className={`status-badge ${employee.status ? employee.status.toLowerCase() : 'unknown'}`}>
                    {employee.status || 'Unknown'}
                  </span>
                </div>
                <div className="employee-actions">
                  <button className="edit-btn" onClick={() => window.location.href = `/edit-employee/${employee._id}`}>
                    <FaUserEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(employee._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper function to generate random colors for avatars
function getRandomColor(id) {
  const colors = [
    '#1e3c72', '#2a5298', '#2e3f7f', '#4776b9', '#5e2563', 
    '#6a359c', '#7b68ee', '#3498db', '#1abc9c', '#2ecc71'
  ];
  
  // Use the id string to pick a consistent color
  const colorIndex = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
}

export default ManageEmployeeDetails
