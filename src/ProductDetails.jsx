import React, { useState, useEffect } from 'react';

const ProductDetails = ({ item, onBack, onSave, onDelete, leadTime = 7 }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    added_on: '',
    expiry_date: '',
    reminder_date: ''
  });

  useEffect(() => {
    if (item) {
      console.log("Opening ProductDetails for:", item.product_name, "with dates:", { added: item.added_on, expiry: item.expiry_date });
      
      let reminderStr = '';
      if (item.expiry_date) {
        try {
          const parts = item.expiry_date.split(/[\/\-]/).map(Number);
          let expiry;
          if (parts.length === 3 && parts[0] > 1000) {
             // YYYY-MM-DD
             expiry = new Date(parts[0], parts[1] - 1, parts[2]);
          } else {
             expiry = new Date(item.expiry_date);
          }
          
          if (!isNaN(expiry.getTime())) {
            expiry.setDate(expiry.getDate() - parseInt(leadTime));
            const ry = expiry.getFullYear();
            const rm = String(expiry.getMonth() + 1).padStart(2, '0');
            const rd = String(expiry.getDate()).padStart(2, '0');
            reminderStr = `${ry}-${rm}-${rd}`;
          }
        } catch (err) {
          console.warn("Reminder calculation failed:", err);
        }
      }
      
      setFormData({
        product_name: item.product_name || '',
        added_on: item.added_on || '',
        expiry_date: item.expiry_date || '',
        reminder_date: reminderStr
      });
    }
  }, [item, leadTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isEmoji = (str) => {
    if (!str) return false;
    try {
      const regex = new RegExp('\\p{Extended_Pictographic}', 'u');
      return regex.test(str);
    } catch(e) {
      return str.length >= 1 && str.length <= 4 && !/^[A-Za-z0-9]+$/.test(str);
    }
  };

  return (
    <div className="product-details-container pastel-theme">
      <div className="details-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <span className="details-badge">{item?.status || 'Active'}</span>
      </div>

      <div className="details-image-container">
        {item?.product_image && !isEmoji(item.product_image) && item.product_image.length > 5 ? (
          <img src={item.product_image} alt={formData.product_name} className="details-image" />
        ) : (
          <div className="details-image-emoji">{item?.product_image || '🍉'}</div>
        )}
      </div>

      <div className="details-form">
        <div className="form-group">
          <label>Product Name</label>
          <input 
            type="text" 
            name="product_name" 
            value={formData.product_name} 
            onChange={handleChange}
            className="pastel-input"
          />
        </div>

        <div className="form-group">
          <label>Added On Date</label>
          <input 
            type="date" 
            name="added_on" 
            value={formData.added_on} 
            onChange={handleChange}
            className="pastel-input"
          />
        </div>

        <div className="form-group">
          <label>Expires On Date</label>
          <input 
            type="date" 
            name="expiry_date" 
            value={formData.expiry_date} 
            onChange={handleChange}
            className="pastel-input"
          />
        </div>

        <div className="form-group">
          <label>Reminder Date</label>
          <input 
            type="date" 
            name="reminder_date" 
            value={formData.reminder_date} 
            onChange={handleChange}
            className="pastel-input"
          />
        </div>
      </div>

      <div className="details-actions">
        <button 
           className="btn-save" 
           onClick={() => onSave({ ...item, ...formData })}
        >
          Save Changes
        </button>
        <button 
           className="btn-delete" 
           onClick={() => onDelete(item.id)}
        >
          Delete Product
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
