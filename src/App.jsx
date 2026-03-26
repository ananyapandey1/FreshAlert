import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import './App.css';
import Scanner from './Scanner';
import ConfirmDetails from './ConfirmDetails';
import ProductDetails from './ProductDetails';
import Auth from './Auth';
import Onboarding from './Onboarding';
import Settings from './Settings';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [currentView, setCurrentView] = useState('splash'); // 'splash' | 'auth' | 'onboarding' | 'dashboard' | 'scanner' | 'confirm' | 'product_details'
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('expiry'); // 'expiry' | 'recent'
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'EXPIRED' | 'EXPIRING' | 'FRESH'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Data flowing from Scanner -> ConfirmDetails
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calendar Auth & UI States
  const [isCalendarAuthorized, setIsCalendarAuthorized] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Track the most recent save payload in case we go out to OAuth and come back
  const [pendingSaveData, setPendingSaveData] = useState(null);

  const fetchInventory = () => {
    if (!token) return Promise.resolve();
    setLoading(true);
    return fetch(`/api/inventory`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
           if (res.status === 401 || res.status === 403) handleLogout();
           throw new Error('Failed to fetch');
        }
        return res.json();
      })
      .then(data => {
        setInventory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch inventory", err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setCurrentView('auth');
  };

  useEffect(() => {
    if (token) {
      fetchInventory();
    } else {
      setLoading(false);
    }
    
    // Check if we just returned from Google Auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      setIsCalendarAuthorized(true);
      setToastMessage('Calendar Connected!');
      setTimeout(() => setToastMessage(''), 3000);
      
      // Check for pending save data from before the redirect
      const pendingData = localStorage.getItem('pendingSaveData');
      const capturedImg = localStorage.getItem('capturedImage');
      if (pendingData && capturedImg) {
        console.log("Restoring pending save after OAuth redirect");
        const parsedData = JSON.parse(pendingData);
        setCapturedImage(capturedImg);
        executeSave(parsedData, capturedImg); 
        localStorage.removeItem('pendingSaveData');
        localStorage.removeItem('capturedImage');
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setCurrentView('dashboard'); 
    } else if (currentView === 'splash') {
      const splashTimer = setTimeout(() => {
        setCurrentView(token ? 'dashboard' : 'auth');
      }, 2000);
      return () => clearTimeout(splashTimer);
    }

    // Check backend status silently on load
    if (token) {
      fetch(`/api/auth/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setIsCalendarAuthorized(d.authorized))
        .catch(e => console.log('Auth check failed', e));
    }

  }, [token, currentView]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  const isEmoji = (str) => {
    if (!str) return false;
    try {
      const regex = new RegExp('\\p{Extended_Pictographic}', 'u');
      return regex.test(str);
    } catch(e) {
      // Fallback for older browsers
      return str.length >= 1 && str.length <= 4 && !/^[A-Za-z0-9]+$/.test(str);
    }
  };

  const handleCapture = async (base64Image) => {
    setCapturedImage(base64Image);
    setCurrentView('scanner'); // Keep showing scanner while processing
    
    try {
      const response = await fetch(`/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });
      
      if (!response.ok) throw new Error("Failed to analyze image");
      
      const data = await response.json();
      setExtractedData(data);
      setCurrentView('confirm');
    } catch (err) {
      console.error(err);
      alert("Failed to analyze image. Please try again or check API key.");
      setCurrentView('dashboard');
    }
  };

  const handleConfirmSave = async (finalData) => {
    // If not authorized and haven't shown modal yet, intercept the save
    if (!isCalendarAuthorized) {
       setPendingSaveData(finalData);
       localStorage.setItem('pendingSaveData', JSON.stringify(finalData));
       localStorage.setItem('capturedImage', capturedImage);
       setShowCalendarModal(true);
       return;
    }
    
    // Otherwise, proceed to save directly
    executeSave(finalData, capturedImage);
  };

  const executeSave = async (dataToSave, imgToUse) => {
    setIsSaving(true);
    const activeImage = imgToUse || capturedImage;
    // Calculate status
    let computedStatus = 'Fresh';
    if (dataToSave.expiry) {
      const expiryDate = new Date(dataToSave.expiry);
      const today = new Date();
      expiryDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) computedStatus = 'Expired';
      else if (daysLeft <= 7) computedStatus = 'Expiring Soon';
    }

    try {
      const response = await fetch(`/api/inventory`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: dataToSave.name,
          expiry_date: dataToSave.expiry,
          product_image: activeImage, 
          status: computedStatus,
          calendar_id: 'cal-temp'
        })
      });
      
      if (response.ok) {
        await response.json();
        await fetchInventory();
        setCurrentView('dashboard');
        
        setToastMessage('Product Added! 🛒');
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save item.");
    } finally {
      setIsSaving(false);
      setPendingSaveData(null);
    }
  };

  const declineCalendar = () => {
    setShowCalendarModal(false);
    if (pendingSaveData) executeSave(pendingSaveData);
  };

  const handleUpdateProduct = async (updatedItem) => {
    let computedStatus = 'Fresh';
    if (updatedItem.expiry_date) {
      const expiryDate = new Date(updatedItem.expiry_date);
      const today = new Date();
      expiryDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysLeft < 0) computedStatus = 'Expired';
      else if (daysLeft <= 7) computedStatus = 'Expiring Soon';
    }

    try {
      const response = await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: updatedItem.product_name,
          expiry_date: updatedItem.expiry_date,
          added_on: updatedItem.added_on,
          status: computedStatus
        })
      });
      if (response.ok) {
        await fetchInventory();
        setCurrentView('dashboard');
        setToastMessage('Product Updated! ✏️');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert("Failed to update item.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update item.");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchInventory();
        setCurrentView('dashboard');
        setToastMessage('Product Deleted! 🗑️');
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        alert("Failed to delete item.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete item.");
    }
  };

  if (currentView === 'scanner') {
    return (
      <div className="app-container">
        <Scanner 
          onCapture={handleCapture}
          onClose={() => setCurrentView('dashboard')}
        />
      </div>
    );
  }

  if (currentView === 'confirm') {
    return (
      <div className="app-container">
        <ConfirmDetails 
          image={capturedImage}
          extractedData={extractedData}
          onConfirm={handleConfirmSave}
          onCancel={() => setCurrentView('dashboard')}
          isSaving={isSaving}
        />

        {showCalendarModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Calendar Sync</h3>
              <p>FreshAlert can automatically add this expiry date to your Google Calendar so you never forget to use it!</p>
              <div className="modal-actions">
                <button 
                   className="modal-btn-primary" 
                   onClick={() => window.location.href = `/api/auth/google?userId=${user.id}`}
                >
                  Connect Calendar
                </button>
                <button className="modal-btn-secondary" onClick={declineCalendar}>
                  Not Right Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'product_details') {
    return (
      <div className="app-container">
        <ProductDetails 
          item={selectedItem}
          onBack={() => setCurrentView('dashboard')}
          onSave={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      </div>
    );
  }

  if (currentView === 'splash') {
    return (
      <div className="splash-screen">
        <div className="splash-bg"></div>
        <h1 className="splash-text">FreshAlert</h1>
      </div>
    );
  }

  if (currentView === 'auth') {
    return <Auth onAuthSuccess={({ token, user, isNewUser }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      if (isNewUser) {
        setCurrentView('onboarding');
      } else {
        setCurrentView('dashboard');
      }
    }} />;
  }

  if (currentView === 'onboarding') {
    return <Onboarding userId={user.id} onSkip={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'settings') {
    return <Settings user={user} isCalendarAuthorized={isCalendarAuthorized} onBack={() => setCurrentView('dashboard')} onLogout={handleLogout} />;
  }

  // Calculate days until expiry
  const getDaysUntilExpiry = (dateString) => {
    if (!dateString) return Infinity;
    const expiry = new Date(dateString);
    const today = new Date();
    // Reset times to compare just the dates
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // KPI Logic
  const expiredCount = inventory.filter(item => getDaysUntilExpiry(item.expiry_date) < 0).length;
  const expiringSoonCount = inventory.filter(item => {
    const days = getDaysUntilExpiry(item.expiry_date);
    return days >= 0 && days <= 7;
  }).length;
  const freshCount = inventory.filter(item => getDaysUntilExpiry(item.expiry_date) > 7).length;

  // Sorting Logic
  const sortedInventory = [...inventory]
    .filter(item => {
       const days = getDaysUntilExpiry(item.expiry_date);
       if (activeFilter === 'EXPIRED') return days < 0;
       if (activeFilter === 'EXPIRING') return days >= 0 && days <= 7;
       if (activeFilter === 'FRESH') return days > 7;
       return true; // 'ALL'
    })
    .sort((a, b) => {
    if (sortOption === 'expiry') {
      const getPriority = (item) => {
        const days = getDaysUntilExpiry(item.expiry_date);
        if (days >= 0 && days <= 7) return 1; // Expiring Soon
        if (days > 7) return 2;              // Fresh
        return 3;                            // Expired
      };
      
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) return priorityA - priorityB;
      
      return getDaysUntilExpiry(a.expiry_date) - getDaysUntilExpiry(b.expiry_date);
    } else {
      const dateA = new Date(a.added_on || 0);
      const dateB = new Date(b.added_on || 0);
      return dateB - dateA; // Descending (Newest first)
    }
  });

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/lemon_chilli_icon.png" alt="FreshAlert" className="header-logo-image" />
          <span style={{ color: '#FFD700', fontSize: '20px', fontWeight: 900 }}>FreshAlert</span>
        </div>
        <div 
          onClick={() => setCurrentView('settings')}
          style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', marginRight: '8px' }}
          title="Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-mint-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
      </header>
      
      {currentView === 'dashboard' && (
        <>
          <div className="filter-header">
            <h3>Inventory Status</h3>
            {activeFilter !== 'ALL' && (
              <button className="reset-filter-btn" onClick={() => setActiveFilter('ALL')}>
                Show All
              </button>
            )}
          </div>
          
          <div className="kpi-row">
            <div 
              className={`kpi-card card-expired ${activeFilter === 'EXPIRED' ? 'active-filter' : ''}`}
              onClick={() => setActiveFilter('EXPIRED')}
            >
              <strong>{expiredCount}</strong>
              <span>Expired</span>
            </div>
            
            <div 
              className={`kpi-card card-expiring ${activeFilter === 'EXPIRING' ? 'active-filter' : ''}`}
              onClick={() => setActiveFilter('EXPIRING')}
            >
              <strong>{expiringSoonCount}</strong>
              <span>Expiring</span>
            </div>
            
            <div 
              className={`kpi-card card-fresh ${activeFilter === 'FRESH' ? 'active-filter' : ''}`}
              onClick={() => setActiveFilter('FRESH')}
            >
              <strong>{freshCount}</strong>
              <span>Fresh</span>
            </div>
          </div>
        </>
      )}

      <main className="inventory-list">
        {currentView === 'dashboard' && !loading && inventory.length > 0 && (
          <div className="sort-controls">
            <label htmlFor="sort-select">Sort By:</label>
            <select 
              id="sort-select" 
              value={sortOption} 
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="expiry">Expiry (Closest First)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-muted)' }}>Loading ingredients...</div>
        ) : (
          sortedInventory.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expiry_date);
            let badgeClass = 'status-fresh';
            let badgeText = 'Fresh';
            
            if (daysLeft < 0) {
              badgeClass = 'status-expired';
              badgeText = 'Expired';
            } else if (daysLeft <= 7) {
              badgeClass = 'status-expiring';
              badgeText = 'Expiring Soon';
            }

            return (
              <div 
                className="item-card" 
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setCurrentView('product_details');
                }}
              >
                {item.product_image && !isEmoji(item.product_image) && item.product_image.length > 5 ? (
                  <img src={item.product_image} alt={item.product_name} className="item-image" />
                ) : (
                  <div className="item-image-emoji">{item.product_image || '🥦'}</div>
                )}
                
                <div className="item-details">
                  <h3 className="item-name" style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    {item.product_name}
                  </h3>
                  <p className="item-expiry" style={{ fontWeight: 600, color: '#212121', marginTop: '4px' }}>
                    Expires on: {formatDate(item.expiry_date)}
                  </p>
                  <p className="item-added-on" style={{ fontSize: '12px', color: '#9E9E9E', margin: '4px 0 0 0' }}>
                    Added on: {formatDate(item.added_on)}
                  </p>
                </div>
                
                <div className={`item-status ${badgeClass}`}>
                  {badgeText}
                </div>

                <button 
                  className="delete-card-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProduct(item.id);
                  }}
                  title="Delete Product"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </main>

      <div className="scan-button-container">
        <button className="scan-button" onClick={() => setCurrentView('scanner')}>
          <svg className="scan-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
            <line x1="7" y1="12" x2="17" y2="12"></line>
          </svg>
          Add Product
        </button>
      </div>

      {toastMessage && (
        <div className="toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
