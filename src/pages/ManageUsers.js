import React, { useState } from 'react';
import { FaUserPlus, FaUserEdit, FaUserFriends } from 'react-icons/fa';
import './ManageUsers.css';
import ViewEmployees from './ViewEmployees';
import ManageEmployeeDetails from './ManageEmployeeDetails';
import AddEmployee from './AddEmployee';

function ManageUsers() {
  const [activeTab, setActiveTab] = useState('view');
  
  // Sample employee data
  const employees = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', department: 'IT', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Manager', department: 'Sales', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', role: 'Employee', department: 'Marketing', status: 'Active' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'Employee', department: 'Finance', status: 'Inactive' },
    { id: 5, name: 'Michael Wilson', email: 'michael.w@example.com', role: 'Manager', department: 'HR', status: 'Active' },
  ];

  // View Employees Component
  
  return (
    <div className="manage-users-container">
      <div className="page-header">
        <h2>Employee Management</h2>
        <p>View, manage, and add employees to your organization</p>
      </div>
      
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          <FaUserFriends className="tab-icon" />
          View Employee Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <FaUserEdit className="tab-icon" />
          Manage Employees
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <FaUserPlus className="tab-icon" />
          Add Employee
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'view' && <ViewEmployees />}
        {activeTab === 'manage' && <ManageEmployeeDetails />}
        {activeTab === 'add' && <AddEmployee />}
      </div>
    </div>
  );
}

export default ManageUsers
