import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaSpinner, FaMapMarkerAlt, FaSave, FaTimes, FaBookmark } from 'react-icons/fa';
import api from '../utils/api';
import './BookmarksView.css';

function BookmarksView() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bookmarks on component mount
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Fetch bookmarks from API
  const fetchBookmarks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No authentication token found when fetching bookmarks');
        setError('You must be logged in to view bookmarks');
        setLoading(false);
        return;
      }
      
      console.log('Fetching bookmarks...');
      const response = await api.get('/api/bookmarks');
      console.log('Bookmarks response received:', response.status);
      
      // Check if response data is valid
      if (!Array.isArray(response.data)) {
        console.error('Invalid bookmarks data format:', response.data);
        setError('Received invalid data format from server');
        setBookmarks([]);
      } else {
        setBookmarks(response.data);
        console.log(`Loaded ${response.data.length} bookmarks`);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      
      // Provide more specific error messages based on error type
      if (err.response) {
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else if (err.response.status === 500) {
          setError('The server encountered an error. Please try again later.');
        } else {
          setError(`Error: ${err.response.data.message || 'Failed to load bookmarks'}`);
        }
      } else if (err.request) {
        setError('Could not connect to the server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'NA';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return 'NA';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Get random color based on property ID
  const getAvatarColor = (id) => {
    const colors = [
      '#1e3c72', '#2a5298', '#2e3f7f', '#4776b9', '#5e2563', 
      '#6a359c', '#7b68ee', '#3498db', '#1abc9c', '#2ecc71',
      '#e74c3c', '#c0392b', '#d35400', '#e67e22', '#f39c12',
      '#8e44ad', '#9b59b6', '#16a085', '#27ae60', '#2980b9'
    ];
    
    // Use the id string to pick a consistent color
    const colorIndex = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

  // Handle edit bookmark
  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setNotes(bookmark.notes);
  };

  // Handle save bookmark notes
  const handleSaveNotes = async () => {
    if (!editingBookmark) return;
    
    setIsSubmitting(true);
    
    try {
      await api.put(`/api/bookmarks/${editingBookmark._id}`, {
        notes: notes
      });
      
      // Update bookmark in state
      setBookmarks(bookmarks.map(bookmark => 
        bookmark._id === editingBookmark._id 
          ? { ...bookmark, notes: notes } 
          : bookmark
      ));
      
      // Reset editing state
      setEditingBookmark(null);
      setNotes('');
    } catch (err) {
      console.error('Error updating bookmark:', err);
      setError('Failed to update bookmark. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete bookmark
  const handleDeleteBookmark = async (bookmarkId) => {
    if (!window.confirm('Are you sure you want to remove this bookmark?')) {
      return;
    }
    
    try {
      await api.delete(`/api/bookmarks/${bookmarkId}`);
      
      // Remove bookmark from state
      setBookmarks(bookmarks.filter(bookmark => bookmark._id !== bookmarkId));
      
      // Reset editing state if deleting the bookmark being edited
      if (editingBookmark && editingBookmark._id === bookmarkId) {
        setEditingBookmark(null);
        setNotes('');
      }
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      setError('Failed to remove bookmark. Please try again.');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingBookmark(null);
    setNotes('');
  };

  if (loading) {
    return (
      <div className="bookmarks-loading">
        <FaSpinner className="spinner" />
        <p>Loading your bookmarked properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookmarks-error">
        <p>{error}</p>
        <button onClick={fetchBookmarks}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="bookmarks-view-container">
      <div className="bookmarks-header">
        <h2>My Bookmarked Properties</h2>
        <p>View and manage your saved properties</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="no-bookmarks">
          <FaBookmark style={{ fontSize: '40px', color: '#3388ff', marginBottom: '15px' }} />
          <p>You haven't bookmarked any properties yet</p>
          <p>Click the bookmark icon on any property to add it to your collection</p>
        </div>
      ) : (
        <div className="bookmarks-grid">
          {bookmarks.map(bookmark => {
            const property = bookmark.propertyId;
            
            // Skip if property is null (might have been deleted)
            if (!property) return null;
            
            const propertyId = property._id;
            const propertyName = property.name || 'Unnamed Property';
            const initials = getInitials(propertyName);
            const avatarColor = getAvatarColor(propertyId);
            
            return (
              <div className="bookmark-card" key={bookmark._id}>
                <div className="bookmark-image">
                  <div 
                    className="property-avatar" 
                    style={{ 
                      backgroundColor: avatarColor,
                      width: '100px',
                      height: '100px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: '36px',
                      fontWeight: 'bold'
                    }}
                  >
                    {initials}
                  </div>
                </div>
                
                <div className="bookmark-content">
                  <h3>{propertyName}</h3>
                  
                  {property.address && (
                    <div className="property-address">
                      <FaMapMarkerAlt />
                      <span>
                        {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
                      </span>
                    </div>
                  )}
                  
                  {editingBookmark && editingBookmark._id === bookmark._id ? (
                    <div className="edit-notes">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add your notes about this property..."
                      />
                      
                      <div className="edit-actions">
                        <button 
                          className="cancel-btn" 
                          onClick={handleCancelEdit}
                        >
                          <FaTimes /> Cancel
                        </button>
                        
                        <button 
                          className="save-btn" 
                          onClick={handleSaveNotes}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="spinner" /> Saving...
                            </>
                          ) : (
                            <>
                              <FaSave /> Save Notes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bookmark-notes">
                        <h4>Notes</h4>
                        <p>{bookmark.notes || 'No notes added yet.'}</p>
                      </div>
                      
                      <div className="bookmark-actions">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditBookmark(bookmark)}
                        >
                          <FaEdit /> Edit Notes
                        </button>
                        
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteBookmark(bookmark._id)}
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BookmarksView;






