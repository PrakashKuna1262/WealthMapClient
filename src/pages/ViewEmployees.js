import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import './ViewEmployees.css';

function ViewEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://wealthmap-server.onrender.com/api/employees', {
          headers: { 'x-auth-token': token }
        });
        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get unique departments for filter
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Filter and sort employees
  const filteredAndSortedEmployees = employees
    .filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                            employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === '' || employee.department === filterDepartment;
      const matchesStatus = filterStatus === '' || employee.status === filterStatus;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      // Handle different field types
      if (sortField === 'name') {
        valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortField === 'department' || sortField === 'role' || sortField === 'status' || sortField === 'email') {
        valueA = a[sortField].toLowerCase();
        valueB = b[sortField].toLowerCase();
      } else {
        valueA = a[sortField];
        valueB = b[sortField];
      }
      
      // Compare values based on sort direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <FaSortAmountUp className="sort-icon" /> : <FaSortAmountDown className="sort-icon" />;
    }
    return null;
  };

  // Add this function to determine status display
  const getStatusDisplay = (employee) => {
    if (employee.status === 'Inactive') {
      return {
        text: 'Inactive',
        class: 'inactive'
      };
    }
    
    if (employee.isLoggedIn) {
      return {
        text: 'Online',
        class: 'online'
      };
    }
    
    return {
      text: 'Active',
      class: 'active'
    };
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="view-employees-container">
      <div className="view-employees-header">
        <h3>Employee Directory</h3>
        <p>View all employee details and information</p>
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
      
      {filteredAndSortedEmployees.length === 0 ? (
        <div className="no-employees">
          <p>No employees found matching your criteria.</p>
        </div>
      ) : (
        <div className="employee-table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('_id')}>
                  ID {renderSortIcon('_id')}
                </th>
                <th onClick={() => handleSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email {renderSortIcon('email')}
                </th>
                <th onClick={() => handleSort('role')}>
                  Role {renderSortIcon('role')}
                </th>
                <th onClick={() => handleSort('department')}>
                  Department {renderSortIcon('department')}
                </th>
                <th onClick={() => handleSort('status')}>
                  Status {renderSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEmployees.map(employee => (
                <tr key={employee._id}>
                  <td className="id-cell">{employee._id.substring(0, 8)}...</td>
                  <td>
                    <div className="employee-name-cell">
                      <div className="employee-avatar-small" style={{ backgroundColor: getRandomColor(employee._id) }}>
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </div>
                      <span>{employee.firstName} {employee.lastName}</span>
                    </div>
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td>{employee.department}</td>
                  <td>
                    {(() => {
                      const status = getStatusDisplay(employee);
                      return (
                        <span className={`status-badge ${status.class}`}>
                          {status.text}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default ViewEmployees;
