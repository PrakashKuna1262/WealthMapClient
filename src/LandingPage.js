import './LandingPage.css';
import { useEffect } from 'react';
import globeImage from './wealth-map-globe.jpg'; 
import {useNavigate} from 'react-router-dom';



function LandingPage() {
  useEffect(() => {
    const content = document.querySelector('.content');
    if (content) {
      content.classList.add('fade-in');
    }
  }, []);
  const navigate = useNavigate();

  return (
    <div className="wealth-map-container">
      <nav className="navbar">
        <div className="logo">Wealth Map</div>
      </nav>

      <div className="content">
        <h2 style={{ fontSize: '3.5rem' }}>See beyond the property</h2>
        <b><p style={{ fontSize: '2.4rem' }}>Explore the people, the wealth, and the networks that shape America's real estate.</p></b>
        
        <div className="buttons">
          <button className="register-btn" onClick={() => navigate('/register')}>REGISTER</button>
          <button className="login-btn" onClick={() => navigate('/login')}>LOGIN</button>
        </div>
      </div>
      <img 
        src={globeImage} 
        alt="Global wealth map visualization" 
        className="globe-image"
      />
      <div className="overlay"></div>
      <div>
        
      </div>
      
    </div>
  );
}

export default LandingPage;