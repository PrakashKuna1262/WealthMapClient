// Load viewer on initial render if token exists
useEffect(() => {
  const loadViewer = async () => {
    if (token) {
      setAuthToken(token);
      try {
        // Update the URL to use the deployed backend
        const res = await axios.get('https://wealthmap-server.onrender.com/api/viewers/me');
        setViewer(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading viewer:', err);
        localStorage.removeItem('viewerToken');
        setToken(null);
        setViewer(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  loadViewer();
}, [token]);

// Register viewer
const register = async (formData) => {
  try {
    setError(null);
    // Update the URL to use the deployed backend
    const res = await axios.post('https://wealthmap-server.onrender.com/api/viewers/register', formData);
    
    localStorage.setItem('viewerToken', res.data.token);
    setToken(res.data.token);
    setViewer(res.data.viewer);
    setIsAuthenticated(true);
    return true;
  } catch (err) {
    setError(
      err.response && err.response.data.message
        ? err.response.data.message
        : 'Registration failed'
    );
    return false;
  }
};

// Login viewer
const login = async (email, password) => {
  try {
    setError(null);
    // Update the URL to use the deployed backend
    const res = await axios.post('https://wealthmap-server.onrender.com/api/viewers/login', { email, password });
    
    localStorage.setItem('viewerToken', res.data.token);
    setToken(res.data.token);
    setViewer(res.data.viewer);
    setIsAuthenticated(true);
    return true;
  } catch (err) {
    setError(
      err.response && err.response.data.message
        ? err.response.data.message
        : 'Login failed'
    );
    return false;
  }
};