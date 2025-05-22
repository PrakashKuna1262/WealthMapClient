import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, FaKey, FaCommentDots, FaDatabase, 
  FaRobot, FaBookmark, FaFileDownload, FaMapMarkerAlt,
  FaCalendarAlt, FaClock, FaChartLine
} from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './EmployeeDashboardHome.css';

function EmployeeDashboardHome() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    completedTasks: 12,
    pendingRequests: 3,
    dataEntries: 145,
    savedReports: 8
  });

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Format time for digital clock
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="employee-home-container">
      {/* Welcome Banner */}
      <div className="employee-home-welcome">
        <div className="welcome-content">
          <h1>Welcome, {user?.name || 'Employee'}</h1>
          <p>Here's your dashboard overview. Have a productive day!</p>
        </div>
        <div className="welcome-time">
          <div className="digital-clock">
            <FaClock className="clock-icon" />
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="current-date">
            <FaCalendarAlt className="calendar-icon" />
            <span>{formatDate(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Calendar Widget - Added for mobile view */}
      <div className="calendar-widget">
        <h3><FaCalendarAlt /> Calendar</h3>
        <Calendar 
          onChange={setCalendarDate} 
          value={calendarDate}
          className="employee-calendar"
        />
      </div>

      {/* Main Content - Modules and Calendar */}
      <div className="employee-home-main">
        {/* Modules Section */}
        <div className="employee-home-modules">
          <h2>Your Modules</h2>
          <div className="module-cards">
            {/* Profile Module */}
            

            {/* Change Password Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaKey />
              </div>
              <div className="module-content">
                <h3>Change Password/Email</h3>
                <p>Update your security credentials and contact information</p>
                <div className="module-status available">
                  <span>✅ Available</span>
                </div>
                <Link to="/employee-dashboard/employee_settings" className="module-button">Access</Link>
              </div>
            </div>

            {/* Request Page Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaCommentDots />
              </div>
              <div className="module-content">
                <h3>Request Page</h3>
                <p>Communication with administrators and support team</p>
                <div className="module-status available">
                  <span>✅ Available</span>
                </div>
                <Link to="/employee-dashboard/requests" className="module-button">Access</Link>
              </div>
            </div>

            {/* Wealth Data Entry Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaDatabase />
              </div>
              <div className="module-content">
                <h3>Wealth Data Entry</h3>
                <p>Manually input owner and property data into the system</p>
                <div className="module-status available">
                  <span>✅ Available</span>
                </div>
                <Link to="/employee-dashboard/properties" className="module-button">Access</Link>
              </div>
            </div>

            {/* AI Research Assistant Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaRobot />
              </div>
              <div className="module-content">
                <h3>AI Research Assistant</h3>
                <p>Smart querying and summarization of complex data</p>
                <div className="module-status in-progress">
                  <span>🔄 In Progress</span>
                </div>
                <button className="module-button disabled">Coming Soon</button>
              </div>
            </div>

            {/* Bookmarks Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaBookmark />
              </div>
              <div className="module-content">
                <h3>Bookmarks / Watchlist</h3>
                <p>Follow properties or people of interest for quick access</p>
                <div className="module-status in-progress">
                  <span>🔖 In Progress</span>
                </div>
                <button className="module-button disabled">Coming Soon</button>
              </div>
            </div>

            {/* Saved Reports Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaFileDownload />
              </div>
              <div className="module-content">
                <h3>Saved Reports & Exports</h3>
                <p>Quick access to your past work and generated reports</p>
                <div className="module-status in-progress">
                  <span>📥 In Progress</span>
                </div>
                <button className="module-button disabled">Coming Soon</button>
              </div>
            </div>

            {/* Map Annotations Module */}
            <div className="module-card">
              <div className="module-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="module-content">
                <h3>Map Annotations</h3>
                <p>Custom pins and notes for collaboration on property maps</p>
                <div className="module-status in-progress">
                  <span>📝 In Progress</span>
                </div>
                <button className="module-button disabled">Coming Soon</button>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
  );
}

export default EmployeeDashboardHome;

