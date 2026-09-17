import React from 'react';
import './App.css';

export default function Landing({ onGetStarted, onLogin, onViewPrivacy, onViewTerms }) {
  const handlePrivacyClick = (e) => {
    if (onViewPrivacy) {
      e.preventDefault();
      onViewPrivacy();
    }
  };

  const handleTermsClick = (e) => {
    if (onViewTerms) {
      e.preventDefault();
      onViewTerms();
    }
  };

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: 'var(--color-bg, #F9FBF9)', color: '#212121', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#ffffff', sticky: 'top', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/lemon_chilli_icon.png" alt="FreshAlert Logo" style={{ width: 36, height: 36 }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E3A2B' }}>FreshAlert</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a 
            href="/privacy.html" 
            onClick={handlePrivacyClick}
            style={{ color: '#2E7D32', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}
          >
            Privacy Policy
          </a>
          <button 
            onClick={onLogin}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #1E3A2B', background: 'transparent', color: '#1E3A2B', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button 
            onClick={onGetStarted}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', background: '#2E7D32', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: '0.85rem', padding: '0.35rem 1rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
          🌱 Stop Food Waste & Save Money
        </span>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1E3A2B', lineHeight: 1.2, marginBottom: '1.25rem' }}>
          Intelligent Expiry Tracking for Your Kitchen
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555555', maxWidth: '720px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          FreshAlert uses AI image recognition to identify food expiry dates automatically and syncs reminders straight to your Google Calendar so you never forget what's in your fridge.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onGetStarted}
            style={{ padding: '0.9rem 2.2rem', borderRadius: '10px', border: 'none', background: '#2E7D32', color: '#ffffff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)' }}
          >
            Start Tracking Free
          </button>
          <a 
            href="/privacy.html" 
            onClick={handlePrivacyClick}
            style={{ padding: '0.9rem 1.8rem', borderRadius: '10px', border: '1px solid #2E7D32', background: '#ffffff', color: '#2E7D32', fontSize: '1.05rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Privacy Policy & Data Uses
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ background: '#ffffff', padding: '4rem 1.5rem', borderTop: '1px solid #E8F5E9', borderBottom: '1px solid #E8F5E9' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', color: '#1E3A2B', marginBottom: '3rem' }}>How FreshAlert Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#F9FBF9', padding: '2rem', borderRadius: '12px', border: '1px solid #E8F5E9' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📷</div>
              <h3 style={{ fontSize: '1.25rem', color: '#1E3A2B', marginBottom: '0.5rem' }}>AI Photo Scanner</h3>
              <p style={{ color: '#666', lineHeight: 1.5 }}>Simply take a photo of any grocery label or receipt. Our Gemini AI automatically extracts product names and calculated expiry dates.</p>
            </div>
            <div style={{ background: '#F9FBF9', padding: '2rem', borderRadius: '12px', border: '1px solid #E8F5E9' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.25rem', color: '#1E3A2B', marginBottom: '0.5rem' }}>Google Calendar Sync</h3>
              <p style={{ color: '#666', lineHeight: 1.5 }}>Connect your Google Calendar to automatically receive a 7-day advance notification and an expiration day alert directly on your schedule.</p>
            </div>
            <div style={{ background: '#F9FBF9', padding: '2rem', borderRadius: '12px', border: '1px solid #E8F5E9' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
              <h3 style={{ fontSize: '1.25rem', color: '#1E3A2B', marginBottom: '0.5rem' }}>Inventory Status</h3>
              <p style={{ color: '#666', lineHeight: 1.5 }}>Categorizes your items into Fresh, Expiring Soon, and Expired so you can plan your meals effortlessly and minimize food waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Google OAuth & User Data Transparency Section */}
      <section style={{ background: '#F4FBF5', padding: '4rem 1.5rem', borderBottom: '1px solid #E8F5E9' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #C8E6C9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h2 style={{ fontSize: '1.6rem', color: '#1E3A2B', margin: 0, fontWeight: 700 }}>
              Google User Data & OAuth Transparency
            </h2>
          </div>
          
          <p style={{ fontSize: '1.05rem', color: '#444444', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            FreshAlert values your trust and privacy. When you optional choose to integrate with <strong>Google Calendar</strong>, our app requests explicit authorization for the following scope:
          </p>

          <div style={{ background: '#F9FBF9', borderLeft: '4px solid #2E7D32', padding: '1rem 1.25rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <code style={{ fontSize: '0.95rem', color: '#1E3A2B', fontWeight: 700 }}>
              https://www.googleapis.com/auth/calendar.events
            </code>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: '#555555' }}>
              <strong>Purpose:</strong> Used exclusively to create and update expiry date reminders on your primary Google Calendar (7-day warning event & expiry day alert event).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ background: '#FAFAFA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EEEEEE' }}>
              <strong style={{ color: '#2E7D32', display: 'block', marginBottom: '0.35rem' }}>🔒 Encrypted Storage</strong>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Your OAuth access and refresh tokens are encrypted at rest in our secure database.</span>
            </div>
            <div style={{ background: '#FAFAFA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EEEEEE' }}>
              <strong style={{ color: '#2E7D32', display: 'block', marginBottom: '0.35rem' }}>🚫 Zero Third-Party Sharing</strong>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Google user data is never sold, shared with third parties, or used for advertising.</span>
            </div>
            <div style={{ background: '#FAFAFA', padding: '1.25rem', borderRadius: '10px', border: '1px solid #EEEEEE' }}>
              <strong style={{ color: '#2E7D32', display: 'block', marginBottom: '0.35rem' }}>⚡ Full User Control</strong>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Unlink Google Calendar or delete your account anytime to permanently wipe all stored tokens.</span>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#555555', lineHeight: 1.6, margin: 0 }}>
            FreshAlert's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a 
              href="https://developers.google.com/terms/api-services-user-data-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'underline' }}
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#1E3A2B', color: '#E8F5E9' }}>
        <p style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>FreshAlert</p>
        <p style={{ fontSize: '0.9rem', color: '#A5D6A7', marginBottom: '1.5rem' }}>Reducing food waste through smart AI technology and reminders.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.75rem', fontSize: '0.95rem', flexWrap: 'wrap' }}>
          <a 
            href="/privacy.html" 
            onClick={handlePrivacyClick}
            style={{ color: '#E8F5E9', textDecoration: 'underline', fontWeight: 500 }}
          >
            Privacy Policy
          </a>
          <a 
            href="/terms.html" 
            onClick={handleTermsClick}
            style={{ color: '#E8F5E9', textDecoration: 'underline', fontWeight: 500 }}
          >
            Terms of Service
          </a>
          <a 
            href="mailto:ananyapandey927@gmail.com" 
            style={{ color: '#E8F5E9', textDecoration: 'underline', fontWeight: 500 }}
          >
            Contact Support
          </a>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#81C784', marginTop: '2rem' }}>&copy; 2026 FreshAlert. All rights reserved.</p>
      </footer>
    </div>
  );
}
