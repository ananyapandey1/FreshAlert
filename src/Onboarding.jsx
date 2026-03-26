import React from 'react';

function Onboarding({ userId, onSkip }) {
  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <img src="/lemon_chilli_icon.png" alt="FreshAlert" style={{ height: 80, marginBottom: 24 }} />
        
        <h2 style={{ color: '#D4AF37', fontSize: 32, fontWeight: 900, marginBottom: 16 }}>
          You're in!
        </h2>
        
        <p style={{ color: 'var(--color-text-main)', fontSize: 18, lineHeight: 1.5, marginBottom: 32 }}>
          Let’s sync your kitchen. Connect your Google Calendar to get automatic expiry alerts and stay ahead of food waste.
        </p>
        
        <button 
          className="auth-primary-btn" 
          onClick={() => window.location.href = `/api/auth/google?userId=${userId}`}
          style={{ marginBottom: 16 }}
        >
          Connect Google Calendar
        </button>
        
        <button className="auth-toggle-link" onClick={onSkip}>
          Skip for now, take me to my Dashboard
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
