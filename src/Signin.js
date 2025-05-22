import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaSignInAlt, FaTimes, FaBuilding } from "react-icons/fa";
import {
  SigninContainer,
  Title,
  IconLarge,
  Form,
  InputGroup,
  InputIcon,
  Input,
  SubmitButton,
  LoginLink
} from "./Signin.styles";

function Signin() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    agreeToTerms: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is the first user (will be admin)
    const checkFirstUser = async () => {
      try {
        const response = await axios.get("https://wealthmap-server.onrender.com/api/auth/check-first-user");
        setIsFirstUser(response.data.isFirstUser);
      } catch (error) {
        console.error("Error checking first user:", error);
      }
    };

    checkFirstUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    try {
      const response = await axios.post("https://wealthmap-server.onrender.com/api/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName
      });

      setSuccess(response.data.message);
      
      setSuccess("Admin account created successfully! You can now log in.");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Error signing up. Please try again.");
      console.error("Signup error:", error);
    }
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };

  const TermsAndConditions = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        color: '#333',
        position: 'relative'
      }}>
        <button 
          onClick={toggleTerms}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          <FaTimes />
        </button>
        <h2 style={{ marginBottom: '20px', color: '#1e3c72' }}>Terms and Conditions</h2>
        <div>
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using this application, you accept and agree to be bound by the terms and provisions of this agreement.</p>
          
          <h3>2. User Registration</h3>
          <p>Users must provide accurate and complete information during the registration process. Users are responsible for maintaining the confidentiality of their account information.</p>
          
          <h3>3. Privacy Policy</h3>
          <p>Your use of the application is also governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
          
          <h3>4. User Conduct</h3>
          <p>Users agree not to use the application for any illegal or unauthorized purpose. Users must comply with all local laws regarding online conduct.</p>
          
          <h3>5. Intellectual Property</h3>
          <p>All content included in the application, such as text, graphics, logos, and software, is the property of the company or its content suppliers and is protected by copyright laws.</p>
          
          <h3>6. Termination</h3>
          <p>We reserve the right to terminate or suspend access to our application immediately, without prior notice or liability, for any reason whatsoever.</p>
          
          <h3>7. Limitation of Liability</h3>
          <p>In no event shall the company be liable for any indirect, incidental, special, consequential or punitive damages resulting from the use of or inability to use the service.</p>
          
          <h3>8. Changes to Terms</h3>
          <p>We reserve the right to modify these terms at any time. Your continued use of the application following any changes indicates your acceptance of the new terms.</p>
        </div>
        <button 
          onClick={toggleTerms}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1e3c72',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginTop: '20px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <SigninContainer>
      <Title>
        <IconLarge><FaUser style={{ color: '#ffa500' }} /></IconLarge>
        Create Admin Account
      </Title>
      
      {isFirstUser && (
        <div className="first-user-notice" style={{
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          padding: '10px 15px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          You are the first user to register. This account will have administrator privileges.
        </div>
      )}
      
      {error && <div className="error-message" style={{
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        padding: '10px 15px',
        borderRadius: '5px',
        marginBottom: '20px',
        color: 'white'
      }}>{error}</div>}
      
      {success && <div className="success-message" style={{
        backgroundColor: 'rgba(0, 255, 0, 0.2)',
        padding: '10px 15px',
        borderRadius: '5px',
        marginBottom: '20px',
        color: 'white'
      }}>{success}</div>}
      
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <InputIcon><FaUser style={{ color: '#ffa500' }} /></InputIcon>
          <Input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </InputGroup>
        
        <InputGroup>
          <InputIcon><FaEnvelope style={{ color: '#ffa500' }} /></InputIcon>
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </InputGroup>
        
        <InputGroup>
          <InputIcon><FaLock style={{ color: '#ffa500' }} /></InputIcon>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </InputGroup>
        
        <InputGroup>
          <InputIcon><FaLock style={{ color: '#ffa500' }} /></InputIcon>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </InputGroup>
        
        <InputGroup>
          <InputIcon><FaBuilding style={{ color: '#ffa500' }} /></InputIcon>
          <Input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </InputGroup>
        
        <InputGroup>
          <label style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
              style={{ marginRight: '10px' }}
            />
            I agree to the <span 
              onClick={toggleTerms} 
              style={{ 
                color: '#ffa500', 
                marginLeft: '5px', 
                cursor: 'pointer', 
                textDecoration: 'underline' 
              }}
            >
              Terms and Conditions
            </span>
          </label>
        </InputGroup>
        
        <SubmitButton type="submit">
          Create Admin Account <FaSignInAlt style={{ marginLeft: '10px', color: '#ffa500' }} />
        </SubmitButton>
        
        <LoginLink>
          Already have an account? <Link to="/login" style={{ color: '#ffa500', textDecoration: 'none' }}>Login</Link>
        </LoginLink>
      </Form>
      
      {showTerms && <TermsAndConditions />}
    </SigninContainer>
  );
}

export default Signin;
