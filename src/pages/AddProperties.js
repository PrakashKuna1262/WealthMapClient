import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FaPlus, FaSpinner, FaUpload, FaFileExcel } from 'react-icons/fa';
import api from '../utils/api';
import './AddProperties.css';

// For large file processing
import * as XLSX from 'xlsx';

const AddProperties = () => {
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    age: '',
    sex: '',
    email: '',
    mobileNumber: '',
    occupation: '',
    monthlyIncome: '',
    totalWealth: '',
    propertyImage: null,
    ownerImage: null
  });
  
  // State for bulk upload
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });
  
  // State for form errors
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const bulkFileInputRef = useRef(null);
  const workerRef = useRef(null);
  
  // Initialize web worker for processing large datasets
  useEffect(() => {
    // Create a worker for processing large datasets
    const workerCode = `
      self.onmessage = function(e) {
        const { data, batchSize, action } = e.data;
        
        if (action === 'process') {
          // Process data in batches
          const batches = [];
          for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
          }
          
          // Send back processed batches
          self.postMessage({ 
            action: 'processingComplete', 
            batches,
            totalRecords: data.length
          });
        }
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    
    // Handle messages from worker
    workerRef.current.onmessage = (e) => {
      const { action, batches, totalRecords } = e.data;
      
      if (action === 'processingComplete') {
        console.log(`Processing complete. ${totalRecords} records split into ${batches.length} batches.`);
        processBatches(batches, totalRecords);
      }
    };
    
    return () => {
      // Clean up worker
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);
  
  // Process batches of data for upload
  const processBatches = async (batches, totalRecords) => {
    setUploadStats({
      total: totalRecords,
      processed: 0,
      successful: 0,
      failed: 0
    });
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        // Upload batch
        const response = await api.post('/api/properties/bulk', { properties: batch });
        
        // Update stats
        successful += response.data.successful || 0;
        failed += response.data.failed || 0;
        processed += batch.length;
        
        // Update progress
        setUploadProgress(Math.round((processed / totalRecords) * 100));
        setUploadStats({
          total: totalRecords,
          processed,
          successful,
          failed
        });
      } catch (error) {
        console.error('Error uploading batch:', error);
        failed += batch.length;
        processed += batch.length;
        
        // Update progress
        setUploadProgress(Math.round((processed / totalRecords) * 100));
        setUploadStats({
          total: totalRecords,
          processed,
          successful,
          failed
        });
      }
    }
    
    setIsUploading(false);
    alert(`Upload complete. ${successful} records added successfully, ${failed} failed.`);
  };
  
  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [formErrors]);
  
  // Handle file input changes
  const handleFileChange = useCallback((e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  }, []);
  
  // Handle bulk file selection
  const handleBulkFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBulkFile(file);
    
    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // Map to our data structure
        const mappedData = jsonData.map(row => ({
          name: row.name || '',
          address: {
            street: row.street || '',
            city: row.city || '',
            state: row.state || '',
            zipCode: row.zipCode || ''
          },
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(row.longitude) || 0,
              parseFloat(row.latitude) || 0
            ]
          },
          ownerDetails: {
            age: parseInt(row.age) || 0,
            sex: row.sex || '',
            email: row.email || '',
            mobileNumber: row.mobileNumber || '',
            occupation: row.occupation || '',
            monthlyIncome: parseFloat(row.monthlyIncome) || 0,
            totalWealth: parseFloat(row.totalWealth) || 0
          }
        }));
        
        setBulkData(mappedData);
        console.log(`Loaded ${mappedData.length} records from file`);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format and try again.');
        setBulkFile(null);
        setBulkData([]);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, []);
  
  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Required fields
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.street) errors.street = 'Street is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.state) errors.state = 'State is required';
    if (!formData.zipCode) errors.zipCode = 'ZIP Code is required';
    if (!formData.latitude) errors.latitude = 'Latitude is required';
    if (!formData.longitude) errors.longitude = 'Longitude is required';
    if (!formData.age) errors.age = 'Age is required';
    if (!formData.sex) errors.sex = 'Sex is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.mobileNumber) errors.mobileNumber = 'Mobile number is required';
    if (!formData.occupation) errors.occupation = 'Occupation is required';
    if (!formData.monthlyIncome) errors.monthlyIncome = 'Monthly income is required';
    if (!formData.totalWealth) errors.totalWealth = 'Total wealth is required';
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Number validations
    if (formData.age && (isNaN(formData.age) || parseInt(formData.age) <= 0)) {
      errors.age = 'Age must be a positive number';
    }
    
    if (formData.monthlyIncome && (isNaN(formData.monthlyIncome) || formData.monthlyIncome < 0)) {
      errors.monthlyIncome = 'Monthly income must be a positive number';
    }
    
    if (formData.totalWealth && (isNaN(formData.totalWealth) || formData.totalWealth < 0)) {
      errors.totalWealth = 'Total wealth must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  // Submit form
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          if (key === 'propertyImage' || key === 'ownerImage') {
            if (formData[key]) {
              formDataObj.append(key, formData[key]);
            }
          } else {
            formDataObj.append(key, formData[key]);
          }
        }
      });
      
      // Create new property
      await api.post('/api/properties', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reset form
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        latitude: '',
        longitude: '',
        age: '',
        sex: '',
        email: '',
        mobileNumber: '',
        occupation: '',
        monthlyIncome: '',
        totalWealth: '',
        propertyImage: null,
        ownerImage: null
      });
      
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting property:', error);
      
      // Show error message
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);
  
  // Handle bulk upload
  const handleBulkUpload = useCallback(() => {
    if (!bulkData.length) {
      alert('Please select a file with data first.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Use web worker to process data in background
    workerRef.current.postMessage({
      action: 'process',
      data: bulkData,
      batchSize: 100 // Process 100 records at a time
    });
  }, [bulkData]);
  
  return (
    <div className="add-properties-container">
      <h1>Add Properties</h1>
      
      <div className="tabs">
        <button className="tab-btn active">Single Property</button>
        <button className="tab-btn">Bulk Upload</button>
      </div>
      
      <div className="tab-content">
        {/* Single Property Form */}
        <div className="tab-pane active">
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
                  <label htmlFor="street">Street</label>
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
                
                <div className="form-group">
                  <label htmlFor="city">City</label>
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
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="state">State</label>
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
                  <label htmlFor="zipCode">ZIP Code</label>
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
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="latitude">Latitude</label>
                  <input 
                    type="text" 
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className={formErrors.latitude ? 'error' : ''}
                  />
                  {formErrors.latitude && <span className="error-message">{formErrors.latitude}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="longitude">Longitude</label>
                  <input 
                    type="text" 
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className={formErrors.longitude ? 'error' : ''}
                  />
                  {formErrors.longitude && <span className="error-message">{formErrors.longitude}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="propertyImage">Property Image</label>
                <input 
                  type="file" 
                  id="propertyImage"
                  name="propertyImage"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            </div>
            
            <div className="form-section">
              <h3>Owner Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input 
                    type="number" 
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className={formErrors.age ? 'error' : ''}
                  />
                  {formErrors.age && <span className="error-message">{formErrors.age}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="sex">Sex</label>
                  <select 
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className={formErrors.sex ? 'error' : ''}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {formErrors.sex && <span className="error-message">{formErrors.sex}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
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
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input 
                  type="text" 
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  className={formErrors.mobileNumber ? 'error' : ''}
                />
                {formErrors.mobileNumber && <span className="error-message">{formErrors.mobileNumber}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="occupation">Occupation</label>
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
                  <label htmlFor="monthlyIncome">Monthly Income</label>
                  <input 
                    type="number" 
                    id="monthlyIncome"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    className={formErrors.monthlyIncome ? 'error' : ''}
                  />
                  {formErrors.monthlyIncome && <span className="error-message">{formErrors.monthlyIncome}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="totalWealth">Total Wealth</label>
                  <input 
                    type="number" 
                    id="totalWealth"
                    name="totalWealth"
                    value={formData.totalWealth}
                    onChange={handleInputChange}
                    className={formErrors.totalWealth ? 'error' : ''}
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
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Add Property'}
              </button>
              {submitSuccess && <span className="success-message">Property added successfully!</span>}
            </div>
          </form>
        </div>
        
        {/* Bulk Upload Form */}
        <div className="tab-pane">
          <div className="bulk-upload-section">
            <h3>Upload Properties in Bulk</h3>
            
            <div className="file-upload-container">
              <input 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleBulkFileChange}
                id="bulkFile"
              />
              <label htmlFor="bulkFile" className="file-upload-label">
                {bulkFile ? bulkFile.name : 'Choose Excel or CSV file'}
              </label>
            </div>
            
            {bulkData.length > 0 && (
              <div className="bulk-data-info">
                <p>{bulkData.length} records loaded from file</p>
                <button 
                  className="btn-primary" 
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload All Records'}
                </button>
              </div>
            )}
            
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="upload-stats">
                  <p>Processed: {uploadStats.processed} / {uploadStats.total}</p>
                  <p>Successful: {uploadStats.successful}</p>
                  <p>Failed: {uploadStats.failed}</p>
                </div>
              </div>
            )}
            
            <div className="template-download">
              <h4>Download Template</h4>
              <p>Use our template file to ensure your data is formatted correctly.</p>
              <a href="/templates/property-template.xlsx" download className="btn-secondary">
                Download Template
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProperties;