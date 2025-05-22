import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaSpinner, FaPaperPlane, FaCheck, FaUsers, FaUser, 
  FaCommentDots, FaExclamationCircle } from 'react-icons/fa';
// Change the import to use the CSS file in the pages folder
import './Requests.css';

function Requests() {
  const [messages, setMessages] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState('');
  const [employees, setEmployees] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [replyText, setReplyText] = useState('');
  const [newMessageForm, setNewMessageForm] = useState({
    subject: '',
    message: '',
    recipientId: ''
  });

  useEffect(() => {
    // Get user role from localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUserRole(userData.role);
      
      // If admin, fetch employees list
      if (userData.role === 'admin') {
        fetchEmployees();
      }
    }
    
    fetchMessages();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('https://wealthmap-server.onrender.com/api/admin/employees', {
        headers: { 'x-auth-token': token }
      });
      
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees list. Please try again later.');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('https://wealthmap-server.onrender.com/api/messages', {
        headers: { 'x-auth-token': token }
      });
      
      setMessages(response.data);
      setActiveFilter('all');
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeMessages = async (email) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`https://wealthmap-server.onrender.com/api/messages/employee/${email}`, {
        headers: { 'x-auth-token': token }
      });
      
      setMessages(response.data);
      setActiveFilter(email);
    } catch (error) {
      console.error('Error fetching employee messages:', error);
      setError('Failed to load employee messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (messageId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`https://wealthmap-server.onrender.com/api/messages/thread/${messageId}`, {
        headers: { 'x-auth-token': token }
      });
      
      setThreadMessages(response.data);
      setSelectedThread(messageId);
      
      // Mark message as read if it's not already
      const message = messages.find(msg => msg._id === messageId);
      if (message && !message.isRead) {
        markAsRead(messageId);
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
      setError('Failed to load message thread. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.put(`https://wealthmap-server.onrender.com/api/messages/${messageId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update message in state
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleEmployeeFilter = (email) => {
    if (email === 'all') {
      fetchMessages();
    } else {
      fetchEmployeeMessages(email);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setError('Please enter a reply message');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Get the original message to use its subject and determine recipient
      const originalMessage = threadMessages[0];
      
      // Determine the recipient
      let recipientId;
      if (userRole === 'admin') {
        // Admin is replying to an employee
        recipientId = originalMessage.sender;
      } else {
        // Employee is replying to admin
        recipientId = 'admin';
      }
      
      const response = await axios.post(
        'https://wealthmap-server.onrender.com/api/messages',
        {
          subject: `Re: ${originalMessage.subject}`,
          message: replyText,
          parentMessageId: selectedThread,
          recipientId: recipientId
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      // Add the new reply to the thread
      setThreadMessages([...threadMessages, response.data.data]);
      setReplyText('');
      setSuccess('Reply sent successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Refresh messages list
      if (activeFilter !== 'all' && userRole === 'admin') {
        // If we're filtering by employee, refresh that employee's messages
        fetchEmployeeMessages(originalMessage.senderEmail);
      } else {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessageForm.subject.trim() || !newMessageForm.message.trim()) {
      setError('Please provide both subject and message');
      return;
    }
    
    // For admin, check if recipient is selected
    if (userRole === 'admin' && !newMessageForm.recipientId) {
      setError('Please select an employee to send the message to');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(
        'https://wealthmap-server.onrender.com/api/messages',
        {
          subject: newMessageForm.subject,
          message: newMessageForm.message,
          recipientId: userRole === 'admin' ? newMessageForm.recipientId : 'admin'
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      // Reset form
      setNewMessageForm({
        subject: '',
        message: '',
        recipientId: ''
      });
      
      setSuccess('Message sent successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Refresh messages list
      if (activeFilter !== 'all' && userRole === 'admin') {
        // If we're filtering by employee, refresh that employee's messages
        const selectedEmployee = employees.find(emp => emp._id === newMessageForm.recipientId);
        if (selectedEmployee) {
          fetchEmployeeMessages(selectedEmployee.email);
        } else {
          fetchMessages();
        }
      } else {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
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

  // Filter messages based on search term and active filter
  const filteredMessages = messages.filter(msg => {
    // Search filter
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Employee filter (for admin)
    if (userRole === 'admin' && activeFilter !== 'all') {
      return matchesSearch && (msg.senderEmail === activeFilter || msg.recipientEmail === activeFilter);
    }
    
    return matchesSearch;
  });

  return (
    <div className="requests-container">
      <h2>Messages & Requests</h2>
      
      {error && (
        <div className="requests-alert requests-alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {success && (
        <div className="requests-alert requests-alert-success">
          <p>{success}</p>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}
      
      <div className="requests-content">
        {/* New Message Form */}
        <div className="requests-new-message">
          <h3>New Message</h3>
          <form onSubmit={handleSendNewMessage}>
            {userRole === 'admin' && (
              <div className="requests-form-group">
                <label>Recipient:</label>
                <select 
                  value={newMessageForm.recipientId}
                  onChange={(e) => setNewMessageForm({...newMessageForm, recipientId: e.target.value})}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="requests-form-group">
              <label>Subject:</label>
              <input 
                type="text"
                value={newMessageForm.subject}
                onChange={(e) => setNewMessageForm({...newMessageForm, subject: e.target.value})}
                placeholder="Enter subject"
                required
              />
            </div>
            
            <div className="requests-form-group">
              <label>Message:</label>
              <textarea 
                value={newMessageForm.message}
                onChange={(e) => setNewMessageForm({...newMessageForm, message: e.target.value})}
                placeholder="Type your message here..."
                rows={4}
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="requests-send-btn"
              disabled={loading}
            >
              {loading ? <FaSpinner className="requests-spinner" /> : <FaPaperPlane />} Send Message
            </button>
          </form>
        </div>
        
        <div className="requests-messages-container">
          {/* Messages List */}
          <div className="requests-messages-list">
            <div className="requests-messages-header">
              <h3>Messages</h3>
              <div className="requests-search">
                <FaSearch />
                <input 
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Employee filters (for admin) */}
            {userRole === 'admin' && (
              <div className="requests-message-filters">
                <button 
                  className={`requests-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleEmployeeFilter('all')}
                >
                  <FaUsers /> All
                </button>
                {employees.map(emp => (
                  <button 
                    key={emp._id} 
                    className={`requests-filter-btn ${activeFilter === emp.email ? 'active' : ''}`}
                    onClick={() => handleEmployeeFilter(emp.email)}
                  >
                    <FaUser /> {emp.firstName}
                  </button>
                ))}
              </div>
            )}
            
            {loading && messages.length === 0 ? (
              <div className="requests-loading">
                <FaSpinner className="requests-spinner" />
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="requests-no-messages">
                <p>No messages found</p>
              </div>
            ) : (
              <div className="requests-messages">
                {filteredMessages.map(msg => (
                  <div 
                    key={msg._id} 
                    className={`requests-message ${selectedThread === msg._id ? 'selected' : ''} ${!msg.isRead && msg.recipient === (userRole === 'admin' ? 'admin' : msg.recipient) ? 'unread' : ''}`}
                    onClick={() => fetchThread(msg._id)}
                  >
                    <div className="requests-message-header">
                      <span className="requests-message-sender">{msg.senderName}</span>
                      <span className="requests-message-date">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="requests-message-subject">{msg.subject}</div>
                    <div className="requests-message-preview">{msg.message.substring(0, 100)}...</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Message Thread */}
          <div className="requests-message-thread">
            {selectedThread ? (
              <>
                <h3>Conversation</h3>
                <div className="requests-thread-messages">
                  {threadMessages.map((msg) => (
                    <div 
                      key={msg._id} 
                      className={`requests-thread-message ${
                        (userRole === 'admin' && msg.senderModel === 'User') || 
                        (userRole !== 'admin' && msg.senderModel === 'Employee') 
                          ? 'requests-sent-message' 
                          : 'requests-received-message'
                      }`}
                    >
                      <div className="requests-thread-message-header">
                        <div className="requests-sender-info">
                          <span className="requests-avatar">{msg.senderName.charAt(0)}</span>
                          <div className="requests-sender-details">
                            <span className="requests-thread-message-sender">{msg.senderName}</span>
                            <span className="requests-thread-message-email">{msg.senderEmail}</span>
                          </div>
                        </div>
                        <span className="requests-thread-message-date">{formatDate(msg.createdAt)}</span>
                      </div>
                      <div className="requests-thread-message-subject">{msg.subject}</div>
                      <div className="requests-thread-message-content">{msg.message}</div>
                    </div>
                  ))}
                </div>
                
                {/* Reply form */}
                <div className="requests-reply-form">
                  <h4>Reply</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                  ></textarea>
                  <button 
                    className="requests-send-reply-btn"
                    onClick={handleSendReply}
                    disabled={loading}
                  >
                    {loading ? <FaSpinner className="requests-spinner" /> : <FaPaperPlane />} Send Reply
                  </button>
                </div>
              </>
            ) : (
              <div className="requests-no-thread-selected">
                <FaCommentDots className="requests-no-thread-icon" />
                <p>Select a message to view the conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requests;
