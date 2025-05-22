import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents,
  ZoomControl,
  Rectangle
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FaMapMarkerAlt, 
  FaSatellite, 
  FaMap, 
  FaSearchLocation, 
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaBookmark,
  FaSpinner,
  FaPlus,
  FaTimes
} from 'react-icons/fa';
import './MapView.css';
import api from '../utils/api';
import axios from 'axios';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Create default blue icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create custom red icon
let RedIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'red-marker-icon' // We'll style this with CSS to make it red
});

L.Marker.prototype.options.icon = DefaultIcon;

// USA bounds - approximately covers the continental US
const USA_BOUNDS = [
  [24.396308, -125.000000], // Southwest coordinates
  [49.384358, -66.934570]   // Northeast coordinates
];

// Component to handle map clicks and restrict view to USA
function MapEventHandler({ onMapClick, setViewInfo }) {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
    moveend: () => {
      if (map) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setViewInfo({ center, zoom });
      }
    },
    zoomend: () => {
      if (map) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setViewInfo({ center, zoom });
      }
    }
  });

  // Keep map within USA bounds
  useEffect(() => {
    if (map) {
      map.setMaxBounds(USA_BOUNDS);
      
      // Use a timeout to ensure the map is fully initialized
      const timer = setTimeout(() => {
        try {
          map.fitBounds(USA_BOUNDS);
        } catch (error) {
          console.error("Error fitting bounds:", error);
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (map) {
          try {
            map.setMaxBounds(null);
          } catch (error) {
            console.error("Error clearing bounds:", error);
          }
        }
      };
    }
  }, [map]);

  return null;
}

function MapView() {
  const [properties, setProperties] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapType, setMapType] = useState('streets');
  const [viewInfo, setViewInfo] = useState({
    center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
    zoom: 4
  });
  const [formMode, setFormMode] = useState('hidden'); // 'hidden', 'add', 'edit'
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    age: '',
    sex: 'Male',
    email: '',
    mobileNumber: '',
    occupation: '',
    monthlyIncome: '',
    totalWealth: '',
    propertyImage: null,
    ownerImage: null
  });
  const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const mapRef = useRef(null);
  const propertyImageRef = useRef(null);
  const ownerImageRef = useRef(null);
  const cancelTokenRef = useRef(null);

  // Define whenCreated callback to store map reference
  const whenCreated = useCallback((mapInstance) => {
    if (mapInstance) {
      mapRef.current = mapInstance;
      
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
    }
  }, []);

  // Fetch properties and bookmarks on component mount
  useEffect(() => {
    fetchProperties();
    fetchBookmarks();
    
    // Cleanup function to cancel pending requests when component unmounts
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching properties...');
      const response = await api.get('/api/properties');
      console.log('Properties response received:', response.status);
      
      if (Array.isArray(response.data)) {
        setProperties(response.data);
        console.log(`Loaded ${response.data.length} properties`);
      } else {
        console.warn('Received non-array properties data:', response.data);
        setProperties([]);
      }
    } catch (err) {
      // Don't log error if it's a cancellation
      if (!axios.isCancel(err)) {
        console.error('Error fetching properties:', err);
        // Set empty array to prevent undefined errors
        setProperties([]);
        
        // Don't show error to user, just log it
        if (err.response && err.response.data) {
          console.error('Server error details:', err.response.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookmarks from API
  const fetchBookmarks = async () => {
    try {
      // Cancel previous request if it exists
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('New request made');
      }
      
      // Create a new cancel token
      cancelTokenRef.current = axios.CancelToken.source();
      
      console.log('Fetching bookmarks...');
      const response = await api.get('/api/bookmarks', {
        cancelToken: cancelTokenRef.current.token
      });
      
      console.log('Bookmarks response received:', response.status);
      
      if (Array.isArray(response.data)) {
        setBookmarks(response.data);
        console.log(`Loaded ${response.data.length} bookmarks`);
      } else {
        console.warn('Received non-array bookmarks data:', response.data);
        setBookmarks([]);
      }
    } catch (err) {
      // Only log error if it's not a cancellation
      if (!axios.isCancel(err)) {
        console.error('Error fetching bookmarks:', err);
        // Set empty array to prevent undefined errors
        setBookmarks([]);
        
        // Don't show error to user, just log it
        if (err.response && err.response.data) {
          console.error('Server error details:', err.response.data);
        }
      }
    }
  };

  // Handle map click to add new property
  const handleMapClick = (latlng) => {
    if (formMode === 'hidden') {
      setFormData({
        ...formData,
        latitude: latlng.lat.toFixed(6),
        longitude: latlng.lng.toFixed(6)
      });
      setFormMode('add');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0]
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    const requiredFields = [
      'name', 'street', 'city', 'state', 'zipCode', 
      'latitude', 'longitude', 'age', 'sex', 'email', 
      'mobileNumber', 'occupation', 'monthlyIncome', 'totalWealth'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Number validations
    if (formData.age && (isNaN(formData.age) || formData.age < 18 || formData.age > 120)) {
      errors.age = 'Age must be between 18 and 120';
    }
    
    if (formData.monthlyIncome && (isNaN(formData.monthlyIncome) || formData.monthlyIncome < 0)) {
      errors.monthlyIncome = 'Monthly income must be a positive number';
    }
    
    if (formData.totalWealth && (isNaN(formData.totalWealth) || formData.totalWealth < 0)) {
      errors.totalWealth = 'Total wealth must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form to create or update property
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataObj.append(key, formData[key]);
        }
      });
      
      let response;
      
      if (formMode === 'add') {
        // Create new property
        response = await api.post('/api/properties', formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Add new property to state
        setProperties([response.data.property, ...properties]);
      } else if (formMode === 'edit' && selectedProperty) {
        // Update existing property
        response = await api.put(`/api/properties/${selectedProperty._id}`, formDataObj, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update property in state
        setProperties(properties.map(prop => 
          prop._id === selectedProperty._id ? response.data.property : prop
        ));
      }
      
      // Reset form and close it
      resetForm();
      setFormMode('hidden');
      
      // Show success message
      alert(formMode === 'add' ? 'Property added successfully!' : 'Property updated successfully!');
    } catch (err) {
      console.error('Error submitting property:', err);
      setError('Failed to save property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      latitude: '',
      longitude: '',
      age: '',
      sex: 'Male',
      email: '',
      mobileNumber: '',
      occupation: '',
      monthlyIncome: '',
      totalWealth: '',
      propertyImage: null,
      ownerImage: null
    });
    
    setFormErrors({});
    
    // Reset file inputs
    if (propertyImageRef.current) propertyImageRef.current.value = '';
    if (ownerImageRef.current) ownerImageRef.current.value = '';
  };

  // Edit property
  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    
    setFormData({
      name: property.name,
      street: property.address.street,
      city: property.address.city,
      state: property.address.state,
      zipCode: property.address.zipCode,
      latitude: property.location.coordinates[1].toFixed(6),
      longitude: property.location.coordinates[0].toFixed(6),
      age: property.ownerDetails.age,
      sex: property.ownerDetails.sex,
      email: property.ownerDetails.email,
      mobileNumber: property.ownerDetails.mobileNumber,
      occupation: property.ownerDetails.occupation,
      monthlyIncome: property.ownerDetails.monthlyIncome,
      totalWealth: property.ownerDetails.totalWealth,
      propertyImage: null,
      ownerImage: null
    });
    
    setFormMode('edit');
  };

  // Delete property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/api/properties/${propertyId}`);
      
      // Remove property from state
      setProperties(properties.filter(prop => prop._id !== propertyId));
      
      // Close form if editing the deleted property
      if (selectedProperty && selectedProperty._id === propertyId) {
        setFormMode('hidden');
        setSelectedProperty(null);
      }
      
      // Show success message
      alert('Property deleted successfully!');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again.');
    }
  };

  // Bookmark property
  const handleBookmarkProperty = async (propertyId) => {
    try {
      const response = await api.post('/api/bookmarks', { 
        propertyId, 
        notes: bookmarkNotes 
      });
      
      // Add new bookmark to state
      setBookmarks([response.data.bookmark, ...bookmarks]);
      
      // Reset bookmark notes and close menu
      setBookmarkNotes('');
      setShowBookmarkMenu(false);
      
      // Show success message
      alert('Property bookmarked successfully! You can view all your bookmarks in the Bookmarks section.');
    } catch (err) {
      console.error('Error bookmarking property:', err);
      
      if (err.response && err.response.status === 400 && err.response.data.message === 'Property already bookmarked') {
        alert('You have already bookmarked this property. You can view and edit your bookmarks in the Bookmarks section.');
      } else {
        setError('Failed to bookmark property. Please try again.');
      }
    }
  };

  // Check if property is bookmarked
  const isPropertyBookmarked = (propertyId) => {
    return bookmarks.some(bookmark => bookmark.propertyId === propertyId);
  };

  // Zoom to a specific property
  const zoomToProperty = useCallback((property) => {
    if (mapRef.current && property?.location?.coordinates) {
      try {
        mapRef.current.invalidateSize();
        setTimeout(() => {
          mapRef.current.setView(
            [property.location.coordinates[1], property.location.coordinates[0]], 
            15
          );
        }, 100);
      } catch (error) {
        console.error("Error zooming to property:", error);
      }
    }
  }, []);

  // Reset view to show all of USA
  const resetView = useCallback(() => {
    if (mapRef.current) {
      try {
        mapRef.current.invalidateSize();
        setTimeout(() => {
          mapRef.current.fitBounds(USA_BOUNDS);
        }, 100);
      } catch (error) {
        console.error("Error resetting view:", error);
      }
    }
  }, []);

  // Ensure map is properly sized when component mounts or window resizes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial invalidateSize after component mounts
    const timer = setTimeout(() => {
      handleResize();
    }, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Add this function to your MapView component to render the property form
  const renderPropertyForm = () => {
    if (formMode === 'hidden') return null;
    
    return (
      <div className="property-form-overlay">
        <div className="property-form-container">
          <div className="property-form-header">
            <h2>{formMode === 'add' ? 'Add New Property' : 'Edit Property'}</h2>
            <button 
              className="close-form-btn"
              onClick={() => {
                setFormMode('hidden');
                resetForm();
              }}
            >
              <FaTimes />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="property-form">
            <div className="form-section">
              <h3>Property Details</h3>
              
              <div className="form-group">
                <label htmlFor="name">Name of the Person</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude*</label>
                  <input 
                    type="text" 
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className={formErrors.latitude ? 'error' : ''}
                    readOnly
                  />
                  {formErrors.latitude && <span className="error-message">{formErrors.latitude}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Longitude*</label>
                  <input 
                    type="text" 
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className={formErrors.longitude ? 'error' : ''}
                    readOnly
                  />
                  {formErrors.longitude && <span className="error-message">{formErrors.longitude}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="street">Street Address*</label>
                <input 
                  type="text" 
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  className={formErrors.street ? 'error' : ''}
                />
                {formErrors.street && <span className="error-message">{formErrors.street}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City*</label>
                  <input 
                    type="text" 
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? 'error' : ''}
                  />
                  {formErrors.city && <span className="error-message">{formErrors.city}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">State*</label>
                  <input 
                    type="text" 
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={formErrors.state ? 'error' : ''}
                  />
                  {formErrors.state && <span className="error-message">{formErrors.state}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code*</label>
                  <input 
                    type="text" 
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={formErrors.zipCode ? 'error' : ''}
                  />
                  {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="propertyImage">Property Image</label>
                <input 
                  type="file" 
                  id="propertyImage"
                  name="propertyImage"
                  onChange={handleFileChange}
                  ref={propertyImageRef}
                  accept="image/*"
                />
                {formData.propertyImage && (
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(formData.propertyImage)} 
                      alt="Property Preview" 
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-section">
              <h3>Owner Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age*</label>
                  <input 
                    type="number" 
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={formErrors.age ? 'error' : ''}
                    min="18"
                    max="120"
                  />
                  {formErrors.age && <span className="error-message">{formErrors.age}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="sex">Sex*</label>
                  <select 
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className={formErrors.sex ? 'error' : ''}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.sex && <span className="error-message">{formErrors.sex}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="mobileNumber">Mobile Number*</label>
                <input 
                  type="tel" 
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={formErrors.mobileNumber ? 'error' : ''}
                />
                {formErrors.mobileNumber && <span className="error-message">{formErrors.mobileNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="occupation">Occupation*</label>
                <input 
                  type="text" 
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className={formErrors.occupation ? 'error' : ''}
                />
                {formErrors.occupation && <span className="error-message">{formErrors.occupation}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monthlyIncome">Monthly Income ($)*</label>
                  <input 
                    type="number" 
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className={formErrors.monthlyIncome ? 'error' : ''}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.monthlyIncome && <span className="error-message">{formErrors.monthlyIncome}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="totalWealth">Total Wealth ($)*</label>
                  <input 
                    type="number" 
                    id="totalWealth"
                    name="totalWealth"
                    value={formData.totalWealth}
                    onChange={handleInputChange}
                    className={formErrors.totalWealth ? 'error' : ''}
                    min="0"
                    step="0.01"
                  />
                  {formErrors.totalWealth && <span className="error-message">{formErrors.totalWealth}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="ownerImage">Owner Image</label>
                <input 
                  type="file" 
                  id="ownerImage"
                  name="ownerImage"
                  onChange={handleFileChange}
                  ref={ownerImageRef}
                  accept="image/*"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setFormMode('hidden');
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : (
                  formMode === 'add' ? 'Add Property' : 'Update Property'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="map-view-container">
      <div className="map-controls">
        <div className="map-type-selector">
          <button 
            className={`map-type-btn ${mapType === 'streets' ? 'active' : ''}`}
            onClick={() => setMapType('streets')}
          >
            <FaMap /> Streets
          </button>
          <button 
            className={`map-type-btn ${mapType === 'satellite' ? 'active' : ''}`}
            onClick={() => setMapType('satellite')}
          >
            <FaSatellite /> Satellite
          </button>
        </div>
        
        <button className="reset-view-btn" onClick={resetView}>
          <FaSearchLocation /> Reset to USA
        </button>
        
        <div className="map-info">
          <FaInfoCircle />
          <span>Click on map to add a new property</span>
        </div>
      </div>
      
      <div className="map-content">
        <div className="map-container">
          <MapContainer
            center={[viewInfo.center.lat, viewInfo.center.lng]}
            zoom={viewInfo.zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            minZoom={3}
            maxZoom={18}
            whenCreated={whenCreated}
            attributionControl={false}
          >
            {/* Base map layer - changes based on selected map type */}
            {mapType === 'streets' ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            
            {/* USA boundary indicator */}
            <Rectangle 
              bounds={USA_BOUNDS} 
              pathOptions={{ color: '#3388ff', weight: 2, fill: false, dashArray: '5, 5' }} 
            />
            
            {/* Map event handler for clicks and bounds */}
            <MapEventHandler onMapClick={handleMapClick} setViewInfo={setViewInfo} />
            
            {/* Custom zoom control position */}
            <ZoomControl position="bottomright" />
            
            {/* Display temporary marker for new property */}
            {formMode === 'add' && formData.latitude && formData.longitude && (
              <Marker 
                position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}
                icon={RedIcon}
              >
                <Popup>
                  <div className="marker-popup">
                    <h3>New Property Location</h3>
                    <p>Lat: {formData.latitude}</p>
                    <p>Lng: {formData.longitude}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Display all properties */}
            {properties.map(property => (
              <Marker 
                key={property._id} 
                position={[property.location.coordinates[1], property.location.coordinates[0]]}
                eventHandlers={{
                  click: () => {
                    setSelectedProperty(property);
                  }
                }}
              >
                <Popup>
                  <div className="marker-popup">
                    <h3>{property.name}</h3>
                    <p>{property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}</p>
                    <p>Lat: {property.location.coordinates[1].toFixed(6)}</p>
                    <p>Lng: {property.location.coordinates[0].toFixed(6)}</p>
                    <div className="popup-actions">
                      <button 
                        className="popup-action-btn"
                        onClick={() => handleEditProperty(property)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        className="popup-action-btn delete"
                        onClick={() => handleDeleteProperty(property._id)}
                      >
                        <FaTrash /> Delete
                      </button>
                      {!isPropertyBookmarked(property._id) && (
                        <button 
                          className="popup-action-btn bookmark"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowBookmarkMenu(true);
                          }}
                        >
                          <FaBookmark /> Bookmark
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Property Form */}
        {renderPropertyForm()}
        
        {/* Bookmark Dialog */}
        {showBookmarkMenu && selectedProperty && (
          <div className="bookmark-overlay">
            <div className="bookmark-dialog">
              <div className="bookmark-dialog-header">
                <h3>Bookmark Property</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowBookmarkMenu(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="bookmark-dialog-content">
                <h4>{selectedProperty.name}</h4>
                <p>{selectedProperty.address.street}, {selectedProperty.address.city}, {selectedProperty.address.state} {selectedProperty.address.zipCode}</p>
                <div className="form-group">
                  <label htmlFor="bookmarkNotes">Notes (optional)</label>
                  <textarea 
                    id="bookmarkNotes"
                    value={bookmarkNotes}
                    onChange={(e) => setBookmarkNotes(e.target.value)}
                    rows={3}
                    placeholder="Add notes about this property..."
                  />
                </div>
              </div>
              <div className="bookmark-actions">
                <button 
                  className="cancel-btn" 
                  onClick={() => setShowBookmarkMenu(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bookmark-btn"
                  onClick={() => handleBookmarkProperty(selectedProperty._id)}
                >
                  <FaBookmark /> Bookmark
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
