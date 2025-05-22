import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import axios from 'axios';
import './PropertySearch.css';

const PropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(20);
  
  // Modal states
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Fetch properties on component mount with pagination
  useEffect(() => {
    fetchProperties();
    
    // Focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    return () => {
      // Cancel any pending requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Debounce search term to reduce filtering frequency
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, searchType]);

  // Fetch properties from API with proper cancellation handling
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/properties');
      setProperties(response.data);
    } catch (err) {
      if (axios.isCancel(err)) {
        // Request was canceled, no need to show error
        console.log('Request canceled:', err.message);
      } else {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered properties based on search term and type
  const filteredProperties = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return properties;
    }
    
    const term = debouncedSearchTerm.toLowerCase().trim();
    
    return properties.filter(property => {
      // Search by location (address)
      if (searchType === 'location' || searchType === 'all') {
        const address = `${property.address?.street || ''} ${property.address?.city || ''} ${property.address?.state || ''} ${property.address?.zipCode || ''}`.toLowerCase();
        if (address.includes(term)) return true;
      }
      
      // Search by name
      if (searchType === 'name' || searchType === 'all') {
        const name = property.name?.toLowerCase() || '';
        if (name.includes(term)) return true;
      }
      
      // Search by contact
      if (searchType === 'contact' || searchType === 'all') {
        const email = property.ownerDetails?.email?.toLowerCase() || '';
        const phone = property.ownerDetails?.mobileNumber?.toLowerCase() || '';
        if (email.includes(term) || phone.includes(term)) return true;
      }
      
      // Search by coordinates
      if (searchType === 'coordinates' || searchType === 'all') {
        const lat = property.location?.coordinates?.[1]?.toString() || '';
        const lng = property.location?.coordinates?.[0]?.toString() || '';
        if (lat.includes(term) || lng.includes(term)) return true;
      }
      
      return false;
    });
  }, [properties, debouncedSearchTerm, searchType]);
  
  // Get current properties for pagination
  const currentProperties = useMemo(() => {
    const indexOfLastProperty = currentPage * propertiesPerPage;
    const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
    return filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  }, [filteredProperties, currentPage, propertiesPerPage]);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredProperties.length / propertiesPerPage);
  }, [filteredProperties, propertiesPerPage]);

  // Memoized function to get avatar color
  const getAvatarColor = useCallback((id) => {
    const colors = [
      '#1e3c72', '#2a5298', '#2e3f7f', '#4776b9', '#5e2563', 
      '#6a359c', '#7b68ee', '#3498db', '#1abc9c', '#2ecc71',
      '#e74c3c', '#c0392b', '#d35400', '#e67e22', '#f39c12',
      '#8e44ad', '#9b59b6', '#16a085', '#27ae60', '#2980b9'
    ];
    
    // Use the id string to pick a consistent color
    const colorIndex = id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  }, []);
  
  // Memoized function to get initials
  const getInitials = useCallback((name) => {
    if (!name) return '??';
    
    const words = name.split(' ');
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    
    return (words[0][0] + words[1][0]).toUpperCase();
  }, []);
  
  // Open modal with property details
  const openPropertyDetails = useCallback((property) => {
    setSelectedProperty(property);
    setShowModal(true);
  }, []);
  
  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  }, []);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="property-search-container">
      <h2>Property Search</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchProperties} className="retry-btn">Retry</button>
        </div>
      )}
      
      <div className="search-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <FaTimes />
            </button>
          )}
        </div>
        
        <div className="search-filters">
          <select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="all">All Fields</option>
            <option value="location">Location</option>
            <option value="name">Name</option>
            <option value="contact">Contact</option>
            <option value="coordinates">Coordinates</option>
          </select>
        </div>
      </div>
      
      <div className="search-results">
        <div className="results-header">
          <h3>Results ({filteredProperties.length})</h3>
          {loading && <div className="loading-indicator">Loading...</div>}
        </div>
        
        {filteredProperties.length === 0 && !loading ? (
          <div className="no-results">
            <p>No properties found matching your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="property-cards">
              {currentProperties.map(property => {
                const initials = getInitials(property.name);
                const avatarColor = getAvatarColor(property._id);
                
                return (
                  <div 
                    className="property-card" 
                    key={property._id}
                    onClick={() => openPropertyDetails(property)}
                  >
                    <div className="property-avatar-container">
                      <div 
                        className="property-avatar" 
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initials}
                      </div>
                    </div>
                    
                    <div className="property-content">
                      <h3>{property.name || 'Unnamed Property'}</h3>
                      <p className="property-address">
                        {property.address?.street}, {property.address?.city}, {property.address?.state} {property.address?.zipCode}
                      </p>
                      {property.ownerDetails?.email && (
                        <p className="property-email">{property.ownerDetails.email}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  First
                </button>
                
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Prev
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
                
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Property Details Modal */}
      {showModal && selectedProperty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2>{selectedProperty.name || 'Unnamed Property'}</h2>
            
            <div className="property-details">
              {/* Property details content */}
              <div className="detail-section">
                <h3>Location</h3>
                <p>
                  {selectedProperty.address?.street}, {selectedProperty.address?.city}, {selectedProperty.address?.state} {selectedProperty.address?.zipCode}
                </p>
                
                <h4>Coordinates</h4>
                <p>
                  Lat: {selectedProperty.location?.coordinates?.[1]}, 
                  Lng: {selectedProperty.location?.coordinates?.[0]}
                </p>
              </div>
              
              <div className="detail-section">
                <h3>Owner Details</h3>
                <p>Email: {selectedProperty.ownerDetails?.email || 'N/A'}</p>
                <p>Phone: {selectedProperty.ownerDetails?.mobileNumber || 'N/A'}</p>
              </div>
              
              <div className="detail-section">
                <h3>Property Information</h3>
                <p>Type: {selectedProperty.propertyType || 'N/A'}</p>
                <p>Value: ${selectedProperty.estimatedValue?.toLocaleString() || 'N/A'}</p>
                <p>Size: {selectedProperty.propertySize || 'N/A'} sq ft</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;






