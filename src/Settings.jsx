import React, { useState } from 'react';
import { Bell, Clock, Calendar } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const Settings = ({ user, isCalendarAuthorized, onBack, onLogout, onViewPrivacy, onViewTerms }) => {
  const [dailyAlert, setDailyAlert] = useState(true);
  const [leadTime, setLeadTime] = useState('3 Days');

  const leadTimeOptions = [
    { value: '1 Day', label: '1 Day Before', shortLabel: '1 Day', subtitle: 'Urgent eve-of-expiry alert', icon: Bell },
    { value: '3 Days', label: '3 Days Before', shortLabel: '3 Days', subtitle: 'Recommended for home kitchens', icon: Clock },
    { value: '7 Days', label: '7 Days Before', shortLabel: '7 Days', subtitle: '1 full week advance notice', icon: Calendar },
    { value: '15 Days', label: '15 Days Before', shortLabel: '15 Days', subtitle: 'Early alert for pantry staples', icon: Calendar }
  ];

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

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: Are you sure you want to delete your account? This will permanently wipe all your ingredients and calendar sync settings.")) {
      return;
    }
    
    if (!window.confirm("LAST CHANCE: This cannot be undone. Delete forever?")) {
      return;
    }

    try {
      const response = await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert("Account deleted successfully.");
        onLogout(); // This clears local storage and takes them to login
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during account deletion.");
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
            <CustomDropdown
              value={leadTime}
              onChange={(newVal) => {
                setLeadTime(newVal);
                localStorage.setItem('leadTime', newVal);
              }}
              options={leadTimeOptions}
              size="compact"
              align="right"
              ariaLabel="Reminder lead time"
            />
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
            <button className="settings-btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Privacy & Legal</h3>
          
          <div className="settings-row">
            <div className="settings-label">
              <strong>Privacy Policy</strong>
              <span>View disclosures & Google Limited Use Policy</span>
            </div>
            <a 
              href="/privacy" 
              style={{ color: '#2E7D32', fontWeight: 600, textDecoration: 'underline', fontSize: '14px' }}
            >
              View Privacy Policy
            </a>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <strong>Terms of Service</strong>
              <span>View app terms & conditions</span>
            </div>
            <a 
              href="/terms" 
              style={{ color: '#2E7D32', fontWeight: 600, textDecoration: 'underline', fontSize: '14px' }}
            >
              View Terms of Service
            </a>
          </div>

          <div className="settings-row">
            <div className="settings-label">
              <strong>Contact Support</strong>
              <span>Get help or submit privacy/account requests</span>
            </div>
            <a 
              href="/contact" 
              style={{ color: '#2E7D32', fontWeight: 600, textDecoration: 'underline', fontSize: '14px' }}
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
