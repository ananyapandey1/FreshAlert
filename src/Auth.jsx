import React, { useState } from 'react';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      
      onAuthSuccess({ token: data.token, user: data.user, isNewUser: !isLogin });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content-left">
        <h1 className="auth-brand-name">FreshAlert</h1>
        <h2 className="auth-headline">Smart AI Expiry Tracking, Synced with Your Google Calendar</h2>
        <p className="auth-description">
          FreshAlert helps you track your groceries and prevents food waste by automatically syncing expiration dates directly to your Google Calendar. Stay on top of your kitchen inventory effortlessly.
        </p>
        <div className="auth-api-disclosure">
          <strong>Google API Disclosure:</strong> Calendar access is strictly used to write expiry events. We only create events for your expiring items and do not read or modify any other personal calendar data.
        </div>
      </div>
      <div className="auth-card-right">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/lemon_chilli_icon.png" alt="FreshAlert" style={{ height: 60, marginBottom: 16 }} />
            <h2 style={{ color: '#D4AF37', fontSize: 28, fontWeight: 900 }}>
              {isLogin ? 'Welcome Back' : 'Join FreshAlert'}
            </h2>
            {isLogin && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 8 }}>
                Happy to see you again
              </p>
            )}
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="enter your email address"
                name="email"
                autoComplete="email"
              />
            </div>

            <div className="form-group password-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder=""
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <a href="#" style={{ color: '#D4AF37', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
                  Forgot Password?
                </a>
              </div>
            )}

            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>


          </form>

          <div style={{ textAlign: 'center', marginTop: 32, borderTop: '1px solid #f0ead2', paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
              <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#8b9991', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>
              <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: '#8b9991', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>Terms of Service</a>
            </div>
            <button 
              className="auth-toggle-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'New here? Create Account' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
