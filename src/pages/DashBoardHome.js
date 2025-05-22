import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaUserCog, FaClipboardList, 
  FaMapMarkedAlt, FaBuilding, FaMoneyBillWave, FaSearch,
  FaBell, FaArrowUp, FaArrowDown, FaChartBar, FaNetworkWired, FaClock,
  FaChartLine, FaRegLightbulb, FaRegClock, FaRegCalendarAlt, FaArrowRight,
  FaCalendarCheck, FaFileAlt, FaChartPie, FaUserFriends
} from 'react-icons/fa';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './DashboardHome.css';

function DashBoardHome() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalProperties: 1250,
    pendingApprovals: 8,
    revenueGenerated: '$125,000',
    growthRate: 15.8,
    searchVolume: 3250,
    totalHours: 0  // Ensure this is initialized to 0, not undefined
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [animateElements, setAnimateElements] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Trigger animations after component mounts
    setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(userData.name || 'User');
  }, []);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch employees data
        const employeesResponse = await axios.get('https://wealthmap-server.onrender.com/api/employees', {
          headers: { 'x-auth-token': token }
        });
        
        // Calculate stats
        const totalEmployees = employeesResponse.data.length;
        const activeEmployees = employeesResponse.data.filter(emp => 
          emp.status === 'Active' || emp.isLoggedIn
        ).length;
        
        // Calculate total hours (mock data - in a real app this would come from the API)
        const totalHours = employeesResponse.data.reduce((sum, emp) => 
          sum + (emp.hoursLogged || Math.floor(Math.random() * 40) + 10), 0
        );
        
        // Update stats with real data
        setStats(prevStats => ({
          ...prevStats,
          totalEmployees,
          activeEmployees,
          totalHours
        }));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Even on error, set some default values
        setStats(prevStats => ({
          ...prevStats,
          totalHours: prevStats.totalHours || 0
        }));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="dashboard-home">
      <div className="dashboard-content">
        {/* Welcome Banner with Search */}
       
        
        {/* Quick Stats Row */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Total Employees</h3>
              <p className="stat-number">{isLoading ? '...' : stats.totalEmployees}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon sessions">
              <FaUserCog />
            </div>
            <div className="stat-info">
              <h3>Active Employees</h3>
              <p className="stat-number">{isLoading ? '...' : stats.activeEmployees}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon properties">
              <FaBuilding />
            </div>
            <div className="stat-info">
              <h3>Properties</h3>
              <p className="stat-number">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        
        {/* Module Cards Section
        <h3 className="section-title">System Modules</h3>
        <div className="module-cards">
          <div className="module-card">
            <div className="module-icon">
              <FaUsers />
            </div>
            <div className="module-content">
              <h3>Employee Management</h3>
              <p>View employee accounts, roles, and permissions. Track employee activity and performance.</p>
              <div className="module-stats">
                <div className="module-stat">
                  <span className="stat-value">{isLoading ? '...' : stats.totalEmployees}</span>
                  <span className="stat-label">Total</span>
                </div>
                <div className="module-stat">
                  <span className="stat-value">{isLoading ? '...' : stats.activeEmployees}</span>
                  <span className="stat-label">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="module-card">
            <div className="module-icon">
              <FaBuilding />
            </div>
            <div className="module-content">
              <h3>Property Database</h3>
              <p>Access comprehensive property data, ownership records, and valuation information.</p>
              <div className="module-stats">
                <div className="module-stat">
                  <span className="stat-value">{stats.totalProperties}</span>
                  <span className="stat-label">Properties</span>
                </div>
                <div className="module-stat">
                  <span className="stat-value">
                    {isLoading ? '...' : Math.floor(stats.totalProperties * 0.068)}
                  </span>
                  <span className="stat-label">New</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="module-card">
            <div className="module-icon">
              <FaNetworkWired />
            </div>
            <div className="module-content">
              <h3>Network Analysis</h3>
              <p>View connections between individuals, properties, and organizations.</p>
              <div className="module-stats">
                <div className="module-stat">
                  <span className="stat-value">
                    {isLoading ? '...' : Math.floor(stats.totalEmployees * 2.5)}
                  </span>
                  <span className="stat-label">Networks</span>
                </div>
                <div className="module-stat">
                  <span className="stat-value">
                    {isLoading ? '...' : Math.floor(stats.activeEmployees * 0.8)}
                  </span>
                  <span className="stat-label">Updates</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="module-card">
            <div className="module-icon">
              <FaChartBar />
            </div>
            <div className="module-content">
              <h3>Analytics & Reports</h3>
              <p>Generate custom reports and gain insights through advanced analytics tools.</p>
              <div className="module-stats">
                <div className="module-stat">
                  <span className="stat-value">
                    {isLoading ? '...' : Math.floor(stats.totalEmployees * 0.35)}
                  </span>
                  <span className="stat-label">Reports</span>
                </div>
                <div className="module-stat">
                  <span className="stat-value">
                    {isLoading ? '...' : (stats.totalHours || 0).toFixed(1)}
                  </span>
                  <span className="stat-label">Hours Logged</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Featured Insights Section - Enhanced */}
        <h3 className="section-title">Featured Insights</h3>
        <div className="insights-container">
          <div className="insight-card">
            <div className="insight-header">
              <FaChartLine className="insight-icon" />
              <span className="insight-tag">Trending</span>
            </div>
            <h4>Market Growth Analysis</h4>
            <p>Property values have increased by 12.3% in the Northeast region over the last quarter, outpacing national averages by 5.7%. Experts predict continued growth through Q3.</p>
            <div className="insight-footer">
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <FaRegLightbulb className="insight-icon" />
              <span className="insight-tag">New</span>
            </div>
            <h4>Investment Opportunities</h4>
            <p>Emerging markets in the Southwest show promising ROI potential with development costs decreasing by 8.5%. Our analysis indicates a 3-year growth projection of 22%.</p>
            <div className="insight-footer">
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-header">
              <FaRegClock className="insight-icon" />
              <span className="insight-tag">Recent</span>
            </div>
            <h4>Regulatory Updates</h4>
            <p>New zoning regulations in major metropolitan areas are creating opportunities for mixed-use development projects. Our team has prepared compliance guidelines for your review.</p>
            <div className="insight-footer">
              
            </div>
          </div>
        </div>

        {/* Quick Actions Section - Enhanced for Mobile */}
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          <button className="action-button primary">
            <div className="action-icon"><FaUsers /></div>
            <div>
              <span>Add New Employee</span>
              {isMobile && <p className="action-description">Register new team members to the system</p>}
            </div>
          </button>
          
          
          <button className="action-button tertiary">
            <div className="action-icon"><FaChartBar /></div>
            <div>
              <span>Generate Report</span>
              {isMobile && <p className="action-description">Create custom analytics reports</p>}
            </div>
          </button>
          
          <button className="action-button quaternary">
            <div className="action-icon"><FaNetworkWired /></div>
            <div>
              <span>Network Analysis</span>
              {isMobile && <p className="action-description">Explore connections in your data</p>}
            </div>
          </button>

          <button className="action-button quaternary">
            <div className="action-icon"><FaBuilding /></div>
            <div>
              <span>Property Analysis</span>
              {isMobile && <p className="action-description">Explore connections in your data</p>}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashBoardHome
