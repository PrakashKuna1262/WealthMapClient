import React, { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="error-boundary">
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <h2>Something went wrong</h2>
            <p>We're sorry, but there was an error loading this component.</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Reload Page
            </button>
            {this.props.fallback}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;