import axios from 'axios';

// Create an axios instance with the Render backend URL
const api = axios.create({
  baseURL: 'https://wealthmap-server.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Don't process canceled requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    // Log error response for debugging
    if (error.response) {
      console.log('API Error Response: ', error.response.data);
      
      // Handle unauthorized errors (401)
      if (error.response.status === 401) {
        console.warn('Authentication error - redirecting to login');
        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 500) {
        console.error('Server error details:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;


