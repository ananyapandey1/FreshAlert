import React from 'react';
import { ChevronRight, Calendar, Camera, Bell } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="landing-logo">
          <img src="/lemon_chilli_icon.png" alt="FreshAlert" />
          <span>FreshAlert</span>
        </div>
        <button className="nav-login-btn" onClick={onGetStarted}>Sign In</button>
      </nav>

      <header className="landing-hero">
        <h1>Master Your Kitchen's <span className="highlight">Freshness</span></h1>
        <p>Scan your groceries, track expiry dates, and sync with your calendar. Stop wasting food, start saving money.</p>
        <button className="cta-button" onClick={onGetStarted}>
          Get Started Now <ChevronRight size={20} />
        </button>
      </header>

      <section className="landing-features">
        <div className="feature-card">
          <div className="feature-icon"><Camera size={24} /></div>
          <h3>Smart Scanner</h3>
          <p>Instantly extract names and expiry dates from any product image using AI.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Calendar size={24} /></div>
          <h3>Calendar Sync</h3>
          <p>Automatically add expiry alerts to your Google Calendar so you never forget.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Bell size={24} /></div>
          <h3>Expiry Alerts</h3>
          <p>Get timely notifications before your ingredients turn into kitchen waste.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-links">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </div>
        <p>&copy; 2026 FreshAlert. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
