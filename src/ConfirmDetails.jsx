import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

const ConfirmDetails = ({ image, extractedData, onConfirm, onCancel, isSaving }) => {
  return (
    <div className="confirm-container">
      <div className="scanner-header">
        <button className="icon-btn" onClick={onCancel} disabled={isSaving}>
          <ArrowLeft size={24} />
        </button>
        <h2>Confirm Details</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="confirm-content">
        <div className="image-preview-container">
           <img src={image} alt="Captured product" className="image-preview" />
        </div>
        
        <div className="extracted-data-card">
          <div className="data-row">
            <span className="data-label">Product Name</span>
            <input 
               type="text" 
               className="data-input" 
               defaultValue={extractedData?.name || ''} 
               id="product-name"
            />
          </div>
          
          <div className="data-row">
             <span className="data-label">Expiry Date</span>
             <input 
                type="date" 
                className="data-input" 
                defaultValue={extractedData?.expiry || ''} 
                id="product-expiry"
             />
          </div>
        </div>
        
        <button 
           className="confirm-button" 
           onClick={() => {
              const name = document.getElementById('product-name').value;
              const expiry = document.getElementById('product-expiry').value;
              onConfirm({ name, expiry });
           }}
           disabled={isSaving}
        >
          {isSaving ? (
             <span className="loading-text">Saving...</span>
          ) : (
             <>
               <Check size={20} /> Let's Track It
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDetails;
