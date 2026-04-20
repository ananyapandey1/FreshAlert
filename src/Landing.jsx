import React from 'react';

const Landing = ({ onGetStarted, onLogin }) => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/lemon_chilli_icon.png" alt="FreshAlert Logo" className="landing-logo-img" />
          <span>FreshAlert</span>
        </div>
        <button className="landing-nav-login" onClick={onLogin}>Log In</button>
      </header>

      <main className="landing-content">
        <section className="hero-section">
          <h1 className="hero-title">Be Smarter Than a Minute Ago!</h1>
          <p className="hero-subtitle">
            The intelligent kitchen assistant that tracks food expiry, 
            reduces waste, and saves you money.
          </p>
          <button className="hero-cta-btn" onClick={onGetStarted}>
            Get Started for Free
          </button>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Smart Scan</h3>
            <p>Snap a photo to automatically extract product names and expiry dates using Gemini AI.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Calendar Sync</h3>
            <p>Automatically add expiry alerts to your Google Calendar so you never miss a meal.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Smart Alerts</h3>
            <p>Get notified days before your food expires, customized to your preferences.</p>
          </div>
        </section>

        <section className="transparency-section">
          <h2>Privacy & Security First</h2>
          <p>
            FreshAlert is built with your privacy in mind. When you connect your Google Calendar, 
            we only request permission to <strong>create</strong> events. We never read your existing 
            calendar data or share your personal information.
          </p>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-legal-container">
          <h3>Legal & Transparency</h3>
          <div className="footer-links">
            <a href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <a href="/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
          </div>
          <p className="footer-disclosure">
            <strong>Google OAuth Disclosure:</strong> FreshAlert only requests the <code>https://www.googleapis.com/auth/calendar.events</code> scope 
            permission strictly to <strong>create</strong> expiry reminders on your calendar. We never read, modify, or delete your existing 
            calendar data, and your data is never shared with third parties.
          </p>
        </div>
        <div className="footer-contact-info">
          <p className="footer-contact">Contact Support: ananyapandey927@gmail.com</p>
          <p className="footer-copy">&copy; 2026 FreshAlert. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .landing-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: var(--color-cream);
          color: var(--color-text-main);
          width: 100%;
          overflow-x: hidden;
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: rgba(255, 253, 245, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          font-size: 20px;
          color: var(--color-primary-yellow);
        }

        .landing-logo-img {
          height: 32px;
          width: auto;
        }

        .landing-nav-login {
          background: var(--color-white);
          border: 1.5px solid var(--color-primary-yellow);
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          color: var(--color-text-main);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .landing-nav-login:hover {
          background-color: var(--color-primary-yellow);
          color: var(--color-white);
        }

        .landing-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding: 20px 0;
        }

        .hero-section {
          padding: 40px 20px;
          text-align: center;
          background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-white) 100%);
        }

        .hero-title {
          font-size: 32px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 16px;
          color: var(--color-text-main);
        }

        .hero-subtitle {
          font-size: 16px;
          color: var(--color-text-muted);
          line-height: 1.5;
          max-width: 90%;
          margin: 0 auto 32px;
        }

        .hero-cta-btn {
          background-color: var(--color-primary-yellow);
          color: var(--color-text-main);
          border: none;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: var(--shadow-yellow);
          transition: transform 0.2s ease;
          width: 100%;
          max-width: 280px;
        }

        .hero-cta-btn:hover {
          transform: translateY(-2px);
          background-color: var(--color-primary-yellow-hover);
        }

        .features-section {
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .feature-card {
          background-color: var(--color-white);
          padding: 24px;
          border-radius: 20px;
          box-shadow: var(--shadow-soft);
          text-align: left;
          border-left: 4px solid var(--color-primary-yellow);
        }

        .feature-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .feature-card h3 {
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .feature-card p {
          font-size: 14px;
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        .transparency-section {
          padding: 40px 20px;
          background-color: var(--color-mint-green);
          margin: 20px;
          border-radius: 24px;
          text-align: center;
        }

        .transparency-section h2 {
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 12px;
        }

        .transparency-section p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-main);
        }

        .landing-footer {
          padding: 60px 20px;
          text-align: center;
          border-top: 1px solid var(--color-cream-dark);
          background-color: var(--color-white);
        }

        .footer-legal-container {
          max-width: 600px;
          margin: 0 auto 40px;
          text-align: left;
          padding: 24px;
          background-color: var(--color-cream);
          border-radius: 16px;
          border: 1px solid var(--color-cream-dark);
        }

        .footer-legal-container h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 16px;
          color: var(--color-text-main);
          text-align: center;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-bottom: 24px;
        }

        .footer-links a {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-main);
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .footer-links a:hover {
          color: var(--color-primary-yellow-hover);
        }

        .footer-disclosure {
          font-size: 13px;
          line-height: 1.6;
          color: var(--color-text-muted);
          background: var(--color-white);
          padding: 16px;
          border-radius: 12px;
        }

        .footer-contact {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-main);
          margin-bottom: 8px;
        }

        .footer-copy {
          font-size: 12px;
          color: var(--color-text-muted);
          opacity: 0.8;
        }

        @media (max-width: 380px) {
          .hero-title {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
