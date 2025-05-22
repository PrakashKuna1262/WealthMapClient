import React, { useState, useEffect } from 'react';
import { 
  FaInbox, FaSpinner, FaCheck, FaExclamationTriangle, 
  FaFilter, FaEye, FaTrash, FaCheckCircle, FaClock, 
  FaHourglassHalf, FaTimesCircle
} from 'react-icons/fa';
import axios from 'axios';
import './FeedbackManagement.css';

function FeedbackManagement() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    fetchFeedback();
  }, []);
  
  const fetchFeedback = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get('https://wealthmap-server.onrender.com/api/feedback', {
        headers: { 'x-auth-token': token }
      });
      
      setFeedback(response.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      
      if (err.response && err.response.status === 403) {
        setError('You do not have permission to access feedback data.');
      } else {
        setError('Failed to load feedback. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewFeedback = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      const response = await axios.get(`https://wealthmap-server.onrender.com/api/feedback/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      setSelectedFeedback(response.data);
      
      // Update the feedback list to mark this item as read
      setFeedback(feedback.map(item => 
        item._id === id ? { ...item, isRead: true } : item
      ));
    } catch (err) {
      console.error('Error fetching feedback details:', err);
      
      if (err.response && err.response.status === 403) {
        setError('You do not have permission to view feedback details.');
      } else {
        setError('Failed to load feedback details. Please try again.');
      }
    }
  };
  
  const handleUpdateStatus = async (id, status) => {
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        setIsUpdating(false);
        return;
      }
      
      await axios.put(`https://wealthmap-server.onrender.com/api/feedback/${id}`, 
        { status }, 
        { headers: { 'x-auth-token': token } }
      );
      
      // Update the feedback list with the new status
      setFeedback(feedback.map(item => 
        item._id === id ? { ...item, status } : item
      ));
      
      // Update the selected feedback if it's the one being updated
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback({ ...selectedFeedback, status });
      }
      
    } catch (err) {
      console.error('Error updating feedback status:', err);
      
      if (err.response && err.response.status === 403) {
        setError('You do not have permission to update feedback status.');
      } else {
        setError('Failed to update feedback status. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      
      await axios.delete(`https://wealthmap-server.onrender.com/api/feedback/${id}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Remove the deleted feedback from the list
      setFeedback(feedback.filter(item => item._id !== id));
      
      // Clear selected feedback if it's the one being deleted
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback(null);
      }
      
    } catch (err) {
      console.error('Error deleting feedback:', err);
      
      if (err.response && err.response.status === 403) {
        setError('You do not have permission to delete feedback.');
      } else {
        setError('Failed to delete feedback. Please try again.');
      }
    }
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  const getFilteredFeedback = () => {
    if (filter === 'all') {
      return feedback;
    }
    
    if (filter === 'unread') {
      return feedback.filter(item => !item.isRead);
    }
    
    // Filter by status
    return feedback.filter(item => item.status === filter);
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <FaInbox className="status-icon new" />;
      case 'in-progress':
        return <FaHourglassHalf className="status-icon in-progress" />;
      case 'resolved':
        return <FaCheckCircle className="status-icon resolved" />;
      case 'closed':
        return <FaTimesCircle className="status-icon closed" />;
      default:
        return <FaInbox className="status-icon" />;
    }
  };
  
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getCategoryLabel = (category) => {
    switch (category) {
      case 'general':
        return 'General';
      case 'bug':
        return 'Bug Report';
      case 'feature':
        return 'Feature Request';
      case 'support':
        return 'Support';
      case 'other':
        return 'Other';
      default:
        return 'Unknown';
    }
  };
  
  const filteredFeedback = getFilteredFeedback();
  
  return (
    <div className="feedback-management-container">
      <div className="feedback-management-header">
        <h2>Feedback Management</h2>
        <p>Review and respond to user feedback</p>
      </div>
      
      {error && (
        <div className="feedback-error-banner">
          <FaExclamationTriangle />
          <p>{error}</p>
        </div>
      )}
      
      <div className="feedback-management-content">
        <div className="feedback-sidebar">
          <div className="feedback-filters">
            <h3><FaFilter /> Filters</h3>
            <ul>
              <li 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => handleFilterChange('all')}
              >
                <FaInbox /> All Feedback
                <span className="count">{feedback.length}</span>
              </li>
              <li 
                className={filter === 'unread' ? 'active' : ''}
                onClick={() => handleFilterChange('unread')}
              >
                <FaInbox /> Unread
                <span className="count">
                  {feedback.filter(item => !item.isRead).length}
                </span>
              </li>
              <li 
                className={filter === 'new' ? 'active' : ''}
                onClick={() => handleFilterChange('new')}
              >
                <FaInbox /> New
                <span className="count">
                  {feedback.filter(item => item.status === 'new').length}
                </span>
              </li>
              <li 
                className={filter === 'in-progress' ? 'active' : ''}
                onClick={() => handleFilterChange('in-progress')}
              >
                <FaHourglassHalf /> In Progress
                <span className="count">
                  {feedback.filter(item => item.status === 'in-progress').length}
                </span>
              </li>
              <li 
                className={filter === 'resolved' ? 'active' : ''}
                onClick={() => handleFilterChange('resolved')}
              >
                <FaCheckCircle /> Resolved
                <span className="count">
                  {feedback.filter(item => item.status === 'resolved').length}
                </span>
              </li>
              <li 
                className={filter === 'closed' ? 'active' : ''}
                onClick={() => handleFilterChange('closed')}
              >
                <FaTimesCircle /> Closed
                <span className="count">
                  {feedback.filter(item => item.status === 'closed').length}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="feedback-list">
            <h3>
              {filter === 'all' ? 'All Feedback' : 
               filter === 'unread' ? 'Unread Feedback' : 
               `${filter.charAt(0).toUpperCase() + filter.slice(1)} Feedback`}
            </h3>
            
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="spinner" />
                <p>Loading feedback...</p>
              </div>
            ) : filteredFeedback.length === 0 ? (
              <div className="empty-feedback">
                <p>No feedback found</p>
              </div>
            ) : (
              <ul className="feedback-items">
                {filteredFeedback.map(item => (
                  <li 
                    key={item._id} 
                    className={`feedback-item ${!item.isRead ? 'unread' : ''} ${selectedFeedback && selectedFeedback._id === item._id ? 'selected' : ''}`}
                    onClick={() => handleViewFeedback(item._id)}
                  >
                    <div className="feedback-item-header">
                      <div className="feedback-item-status">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="feedback-item-name">
                        {item.name}
                      </div>
                      {!item.isRead && (
                        <div className="unread-badge"></div>
                      )}
                    </div>
                    <div className="feedback-item-preview">
                      {item.description.length > 60 
                        ? `${item.description.substring(0, 60)}...` 
                        : item.description}
                    </div>
                    <div className="feedback-item-meta">
                      <div className="feedback-item-category">
                        {getCategoryLabel(item.category)}
                      </div>
                      <div className="feedback-item-date">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="feedback-detail">
          {selectedFeedback ? (
            <>
              <div className="feedback-detail-header">
                <div className="feedback-detail-info">
                  <h3>{selectedFeedback.name}</h3>
                  <p className="feedback-detail-email">{selectedFeedback.email}</p>
                  <p className="feedback-detail-date">
                    Submitted on {formatDate(selectedFeedback.createdAt)}
                  </p>
                </div>
                
                <div className="feedback-detail-actions">
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteFeedback(selectedFeedback._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              
              <div className="feedback-detail-content">
                <div className="feedback-detail-meta">
                  <div className="feedback-meta-item">
                    <span className="meta-label">Category:</span>
                    <span className="meta-value">{getCategoryLabel(selectedFeedback.category)}</span>
                  </div>
                  <div className="feedback-meta-item">
                    <span className="meta-label">Rating:</span>
                    <span className="meta-value">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i} className={i < selectedFeedback.rating ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </span>
                  </div>
                  <div className="feedback-meta-item">
                    <span className="meta-label">Status:</span>
                    <span className={`meta-value status-${selectedFeedback.status}`}>
                      {getStatusIcon(selectedFeedback.status)}
                      {selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="feedback-detail-description">
                  <h4>Feedback</h4>
                  <p>{selectedFeedback.description}</p>
                </div>
                
                <div className="feedback-status-update">
                  <h4>Update Status</h4>
                  <div className="status-buttons">
                    <button 
                      className={`status-btn new ${selectedFeedback.status === 'new' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedFeedback._id, 'new')}
                      disabled={isUpdating || selectedFeedback.status === 'new'}
                    >
                      <FaInbox /> New
                    </button>
                    <button 
                      className={`status-btn in-progress ${selectedFeedback.status === 'in-progress' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedFeedback._id, 'in-progress')}
                      disabled={isUpdating || selectedFeedback.status === 'in-progress'}
                    >
                      <FaHourglassHalf /> In Progress
                    </button>
                    <button 
                      className={`status-btn resolved ${selectedFeedback.status === 'resolved' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedFeedback._id, 'resolved')}
                      disabled={isUpdating || selectedFeedback.status === 'resolved'}
                    >
                      <FaCheckCircle /> Resolved
                    </button>
                    <button 
                      className={`status-btn closed ${selectedFeedback.status === 'closed' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedFeedback._id, 'closed')}
                      disabled={isUpdating || selectedFeedback.status === 'closed'}
                    >
                      <FaTimesCircle /> Closed
                    </button>
                  </div>
                  {isUpdating && (
                    <div className="updating-status">
                      <FaSpinner className="spinner" />
                      <span>Updating status...</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-feedback-selected">
              <FaInbox className="no-selection-icon" />
              <h3>No feedback selected</h3>
              <p>Select a feedback item from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackManagement;

