import React, { useState } from 'react';
import { FaPaperPlane, FaSpinner, FaThumbsUp, FaStar, FaRegStar } from 'react-icons/fa';
import axios from 'axios';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    rating: 5,
    category: 'general'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [error, setError] = useState(null);
  
  const { name, email, description, rating, category } = formData;
  
  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleRatingChange = newRating => {
    setFormData({ ...formData, rating: newRating });
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/feedback', formData);
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        description: '',
        rating: 5,
        category: 'general'
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(
        err.response?.data?.message || 
        'Failed to submit feedback. Please try again.'
      );
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          onClick={() => handleRatingChange(i)}
          className="star-rating-item"
        >
          {i <= rating ? <FaStar className="star-filled" /> : <FaRegStar className="star-empty" />}
        </span>
      );
    }
    
    return stars;
  };
  
  return (
    <div className="feedback-form-container">
      <h2>We Value Your Feedback</h2>
      <p>Please share your thoughts to help us improve our service</p>
      
      {submitStatus === 'success' && (
        <div className="feedback-success">
          <FaThumbsUp />
          <p>Thank you for your feedback! We appreciate your input.</p>
        </div>
      )}
      
      {submitStatus === 'error' && (
        <div className="feedback-error">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Feedback Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange}
          >
            <option value="general">General Feedback</option>
            <option value="bug">Report a Bug</option>
            <option value="feature">Feature Request</option>
            <option value="support">Support Question</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Your Rating</label>
          <div className="star-rating">
            {renderStars()}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Your Feedback</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleChange}
            required
            placeholder="Please share your thoughts, suggestions, or report issues..."
            rows="5"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner" /> Submitting...
            </>
          ) : (
            <>
              <FaPaperPlane /> Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;