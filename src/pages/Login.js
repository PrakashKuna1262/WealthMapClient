import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaArrowLeft,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee", // Default role
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  useEffect(() => {
    // Reset error message after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleRoleChange = (role) => {
    setFormData((prevState) => ({
      ...prevState,
      role,
    }));
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", formData);
      
      // Update the URL to use the deployed backend
      const response = await axios.post("https://wealthmap-server.onrender.com/api/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      console.log("Login response:", response.data);
      
      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Redirect based on role
      if (response.data.user.role === "admin") {
        console.log("Navigating to admin dashboard");
        // Force navigation with window.location instead of navigate
        window.location.href = "/admin-dashboard";
      } else {
        console.log("Navigating to employee dashboard");
        // Force navigation with window.location instead of navigate
        window.location.href = "/employee-dashboard";
      }
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    if (!resetEmail) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }
    try {
      await axios.post("https://wealthmap-server.onrender.com/api/auth/forgot-password", {
        email: resetEmail,
      });
      setResetEmailSent(true);
    } catch (error) {
      console.error("Password reset error:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("Error sending password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Add this function to handle logout with time tracking
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call the logout endpoint
      const response = await axios.post('https://wealthmap-server.onrender.com/api/auth/logout', {}, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Logout successful:', response.data);
      
      // If hours were logged, show them to the user
      if (response.data.hoursLogged) {
        alert(`You worked for ${response.data.hoursLogged.toFixed(2)} hours this session. Your total hours are ${response.data.totalHours.toFixed(2)}.`);
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <div className="login-container">
      <button
        className="back-button"
        onClick={() => navigate("/")}
        aria-label="Back to home"
      >
        {" "}
        <FaArrowLeft /> Back to Home
      </button>
      <h2>
        <FaSignInAlt className="icon-large" />{" "}
        {forgotPassword ? "Reset Password" : "Login"}
      </h2>
      {forgotPassword ? (
        resetEmailSent ? (
          <div className="success-message">
            {" "}
            <h3>Password Reset Email Sent!</h3>
            <p>
              Please check your email for instructions to reset your password.
            </p>{" "}
            <button
              className="back-to-login-btn"
              onClick={() => {
                setForgotPassword(false);
                setResetEmailSent(false);
              }}
            >
              Back to Login{" "}
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="login-form">
            {" "}
            <div className="input-group">
              <FaEnvelope className="input-icon icon-beautiful" />{" "}
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {" "}
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="login-link">
              {" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotPassword(false);
                }}
              >
                {" "}
                Back to Login
              </a>{" "}
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>
        )
      ) : (
        <form onSubmit={handleLogin} className="login-form">
          <div className="role-selector">
            {" "}
            <div
              className={`role-option ${
                formData.role === "employee" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("employee")}
            >
              {" "}
              <FaUserTie className="role-icon" />
              <span>Employee</span>{" "}
            </div>
            <div
              className={`role-option ${
                formData.role === "admin" ? "active" : ""
              }`}
              onClick={() => handleRoleChange("admin")}
            >
              <FaUserCog className="role-icon" /> <span>Admin</span>
            </div>{" "}
          </div>
          <div className="input-group">
            <FaEnvelope className="input-icon icon-beautiful" />{" "}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />{" "}
          </div>
          <div className="input-group">
            <FaLock className="input-icon icon-beautiful" />{" "}
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />{" "}
          </div>
          <a
            href="#"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              setForgotPassword(true);
            }}
          >
            {" "}
            Forgot Password?
          </a>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {" "}
            {isLoading ? (
              "Logging in..."
            ) : (
              <>
                {" "}
                <FaSignInAlt /> Login
              </>
            )}
          </button>
          <div className="register-link">
            {" "}
            Don't have an account? <a href="/register">Sign up</a>
          </div>
          {error && <p className="error-message">{error}</p>}{" "}
        </form>
      )}{" "}
    </div>
  );
}

export default Login;


