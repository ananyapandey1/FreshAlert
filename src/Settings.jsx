import React, { useState } from 'react';

const Settings = ({ user, isCalendarAuthorized, onBack, onLogout }) => {
  const [dailyAlert, setDailyAlert] = useState(true);
  const [leadTime, setLeadTime] = useState('3 Days');

  const handleUnlink = async () => {
    if (!window.confirm("Unlink Google Calendar? New products will not sync to your calendar.")) return;
    try {
      const response = await fetch('/api/auth/google/unlink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        window.location.reload(); 
      }
    } catch (error) {
       console.error(error);
       alert("Failed to unlink.");
    }
  };

  return (
    <div className="settings-container pastel-theme">
      <div className="details-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
      </div>

      <div className="settings-content">
        <h2 style={{ color: '#FFD700', fontSize: '32px', fontWeight: 900, marginBottom: '32px' }}>
          Settings
        </h2>

        <div className="settings-section">
          <h3 className="settings-section-title">Notifications</h3>
          
          <div className="settings-row">
            <div className="settings-label">
              <strong>Daily Expiry Digest</strong>
              <span>Get a summary of expiring items at 8 AM</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={dailyAlert} onChange={() => setDailyAlert(!dailyAlert)} />
              <span className={`toggle-slider ${dailyAlert ? 'active-yellow' : ''}`}></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <strong>Remind me [X] days before</strong>
              <span>When should items turn "Expiring Soon"?</span>
            </div>
            <select 
              className="settings-select" 
              value={leadTime} 
              onChange={(e) => setLeadTime(e.target.value)}
            >
               <option>1 Day</option>
              <option>3 Days</option>
              <option>7 Days</option>
              <option>15 Days</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Google Calendar</h3>
          
          <div className="settings-row">
            <div className="settings-label">
              <strong>Status: Google Calendar {isCalendarAuthorized ? 'Connected' : 'Not Connected'}</strong>
            </div>
            {isCalendarAuthorized ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="settings-btn-disabled" style={{ backgroundColor: '#F0F0F0', color: '#888' }} disabled>✓ Connected</button>
                <button 
                  className="settings-btn-secondary" 
                  style={{ padding: '8px 12px', fontSize: '12px', minWidth: 'auto', backgroundColor: '#FFF0F0', color: '#FF4444', borderColor: '#FF4444' }}
                  onClick={handleUnlink}
                >
                  Unlink
                </button>
              </div>
            ) : (
              <button 
                className="settings-btn-primary"
                onClick={() => window.location.href = `/api/auth/google?userId=${user.id}`}
              >
                Sync Now
              </button>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Account</h3>
          
          <div className="settings-row">
            <div className="settings-label">
              <strong>Email Address</strong>
              <span>{user?.email || 'chef@kitchen.com'}</span>
            </div>
          </div>
          
          <div className="settings-actions">
            <button className="settings-btn-secondary" onClick={onLogout}>Logout</button>
            <button className="settings-btn-danger">Delete Account</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
