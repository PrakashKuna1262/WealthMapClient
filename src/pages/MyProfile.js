import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBuilding, FaMapMarkerAlt, FaGlobe, FaPhone, FaEnvelope } from 'react-icons/fa';
import './MyProfile.css';
const MyProfile = () => {
  const [company, setCompany] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    description: '',
    logo: '',
    website: '',
    phone: '',
    email: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logoKey, setLogoKey] = useState(Date.now()); // For forcing image refresh

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAdmin(user.role === 'admin');
    
    // Fetch company data
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching company data...');
      const response = await axios.get('https://wealthmap-server.onrender.com/api/company', {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Company data response:', response.data);
      
      if (response.data && (response.data._id || Object.keys(response.data).length > 0)) {
        setCompany(response.data);
        setFormData({
          ...response.data,
          // Ensure nested objects exist
          address: response.data.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          socialMedia: response.data.socialMedia || {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
          }
        });
        // Force logo image to refresh by updating key
        setLogoKey(Date.now());
      } else {
        console.log('No company data found or empty response');
        // Initialize with empty data
        setCompany({});
        setFormData({
          name: '',
          description: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          website: '',
          phone: '',
          email: '',
          socialMedia: {
            facebook: '',
            twitter: '',
            linkedin: '',
            instagram: ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load company data. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        setMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, GIF)' });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      
      setLogoFile(file);
      
      // Revoke previous preview URL to prevent memory leaks
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
      
      setLogoPreview(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'Only admins can update company profile' });
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Create FormData object for file upload
      const data = new FormData();
      
      // Add basic company info
      data.append('name', formData.name || '');
      data.append('description', formData.description || '');
      
      // Add address fields
      data.append('street', formData.address?.street || '');
      data.append('city', formData.address?.city || '');
      data.append('state', formData.address?.state || '');
      data.append('zipCode', formData.address?.zipCode || '');
      data.append('country', formData.address?.country || '');
      
      // Add contact info
      data.append('website', formData.website || '');
      data.append('phone', formData.phone || '');
      data.append('email', formData.email || '');
      
      // Add social media
      data.append('facebook', formData.socialMedia?.facebook || '');
      data.append('twitter', formData.socialMedia?.twitter || '');
      data.append('linkedin', formData.socialMedia?.linkedin || '');
      data.append('instagram', formData.socialMedia?.instagram || '');
      
      // Add logo if selected
      if (logoFile) {
        data.append('logo', logoFile);
      }
      
      console.log('Submitting company data:', Object.fromEntries(data));
      
      const response = await axios.post(
        'https://wealthmap-server.onrender.com/api/company',
        data,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Company update response:', response.data);
      
      if (response.data.success) {
        // Clean up the preview URL
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
          setLogoPreview('');
        }
        setLogoFile(null);
        
        // Update company data and show success message
        setCompany(response.data.company);
        setMessage({ type: 'success', text: 'Company profile updated successfully!' });
        setIsEditing(false);
        
        // Force logo image to refresh by updating key
        setLogoKey(Date.now());
        
        // Refresh company data
        fetchCompanyData();
      } else {
        throw new Error(response.data.message || 'Failed to update company profile');
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update company profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading company profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Company Profile</h2>
      
      {message.text && (
        <div className={`alert ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {!isEditing ? (
        <div className="view-profile">
          <div className="profile-header">
            <div className="company-logo">
              <img 
                key={logoKey} // Force image refresh when updated
                src={company.logo ? `https://wealthmap-server.onrender.com${company.logo}` : '/default-logo.png'} 
                alt={company.name || 'Company Logo'} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-logo.png';
                }}
              />
            </div>
            <div className="company-info">
              <h3>{company.name || 'Company Name Not Set'}</h3>
              {company.address && (
                <p className="address">
                  <FaMapMarkerAlt />
                  <span>
                    {company.address.street}, {company.address.city}, {company.address.state} {company.address.zipCode}, {company.address.country}
                  </span>
                </p>
              )}
              {company.website && (
                <p className="website">
                  <FaGlobe />
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                     target="_blank" 
                     rel="noopener noreferrer">
                    {company.website}
                  </a>
                </p>
              )}
              {company.phone && (
                <p className="phone">
                  <FaPhone />
                  <span>{company.phone}</span>
                </p>
              )}
              {company.email && (
                <p className="email">
                  <FaEnvelope />
                  <span>{company.email}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="company-description">
            <h4>About Us</h4>
            <p>{company.description || 'No company description available.'}</p>
          </div>
          
          {isAdmin && (
            <button 
              className="edit-button"
              onClick={() => {
                setFormData({
                  ...company,
                  address: company.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                  },
                  socialMedia: company.socialMedia || {
                    facebook: '',
                    twitter: '',
                    linkedin: '',
                    instagram: ''
                  }
                });
                setIsEditing(true);
              }}
            >
              Edit Company Profile
            </button>
          )}
        </div>
      ) : (
        <div className="edit-profile">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Company Logo</label>
              <div className="logo-upload">
                <img 
                  src={logoPreview || (company.logo ? `https://wealthmap-server.onrender.com${company.logo}` : '/default-logo.png')} 
                  alt="Company Logo Preview" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-logo.png';
                  }}
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoChange} 
                  style={{ width: '80%' }}
                />
                <small>Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
              </div>
            </div>
            
            <div className="form-group">
              <label>Company Name*</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleInputChange}
                required
                style={{ width: '80%' }}
              />
            </div>
            
            <div className="form-section">
              <h4>Address</h4>
              <div className="form-group">
                <label>Street*</label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.address?.street || ''} 
                  onChange={handleAddressChange}
                  required
                  style={{ width: '80%' }}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City*</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.address?.city || ''} 
                    onChange={handleAddressChange}
                    required
                    style={{ width: '80%' }}
                  />
                </div>
                
                <div className="form-group">
                  <label>State/Province*</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.address?.state || ''} 
                    onChange={handleAddressChange}
                    required
                    style={{ width: '80%' }}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Zip/Postal Code*</label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    value={formData.address?.zipCode || ''} 
                    onChange={handleAddressChange}
                    required
                    style={{ width: '80%' }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Country*</label>
                  <input 
                    type="text" 
                    name="country" 
                    value={formData.address?.country || ''} 
                    onChange={handleAddressChange}
                    required
                    style={{ width: '80%' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Company Description*</label>
              <textarea 
                name="description" 
                value={formData.description || ''} 
                onChange={handleInputChange}
                rows="5"
                required
                style={{ width: '80%' }}
              ></textarea>
            </div>
            
            <div className="form-section">
              <h4>Contact Information</h4>
              <div className="form-group">
                <label>Website</label>
                <input 
                  type="url" 
                  name="website" 
                  value={formData.website || ''} 
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                  style={{ width: '80%' }}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleInputChange}
                    style={{ width: '80%' }}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleInputChange}
                    style={{ width: '80%' }}
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
              <h4>Social Media</h4>
              <div className="form-group">
                <label>Facebook</label>
                <input 
                  type="url" 
                  name="socialMedia.facebook" 
                  value={formData.socialMedia?.facebook || ''} 
                  onChange={handleInputChange}
                  style={{ width: '80%' }}
                />
              </div>
              
              <div className="form-group">
                <label>Twitter</label>
                <input 
                  type="url" 
                  name="socialMedia.twitter" 
                  value={formData.socialMedia?.twitter || ''} 
                  onChange={handleInputChange}
                  style={{ width: '80%' }}
                />
              </div>
              
              <div className="form-group">
                <label>LinkedIn</label>
                <input 
                  type="url" 
                  name="socialMedia.linkedin" 
                  value={formData.socialMedia?.linkedin || ''} 
                  onChange={handleInputChange}
                  style={{ width: '80%' }}
                />
              </div>
              
              <div className="form-group">
                <label>Instagram</label>
                <input 
                  type="url" 
                  name="socialMedia.instagram" 
                  value={formData.socialMedia?.instagram || ''} 
                  onChange={handleInputChange}
                  style={{ width: '80%' }}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setLogoPreview('');
                  setLogoFile(null);
                  setMessage({ type: '', text: '' });
                  
                  // Clean up any preview URLs
                  if (logoPreview) {
                    URL.revokeObjectURL(logoPreview);
                  }
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

