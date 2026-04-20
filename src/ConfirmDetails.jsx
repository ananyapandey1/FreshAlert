import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Check, Image as ImageIcon, Loader2 } from 'lucide-react';

const ConfirmDetails = ({ image, extractedData, onConfirm, onCancel, isSaving }) => {
  const [name, setName] = useState(extractedData?.name || '');
  const [expiry, setExpiry] = useState(extractedData?.expiry || '');
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (extractedData) {
      setName(extractedData.name || '');
      setExpiry(extractedData.expiry || '');
    }
  }, [extractedData]);

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingLocal(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setCurrentImage(base64Image);
      
      try {
        const response = await fetch(`/api/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });
        
        if (!response.ok) throw new Error("Failed to analyze image");
        
        const data = await response.json();
        setName(data.name || '');
        setExpiry(data.expiry || '');
      } catch (err) {
        console.error(err);
        alert("Failed to analyze gallery image. Please try again.");
      } finally {
        setIsProcessingLocal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="confirm-container">
      <div className="scanner-header">
        <button className="icon-btn" onClick={onCancel} disabled={isSaving || isProcessingLocal}>
          <ArrowLeft size={24} />
        </button>
        <h2>Confirm Details</h2>
        <div style={{ width: 24 }}></div>
      </div>

      <div className="confirm-content">
        <div className="image-preview-container">
           {currentImage ? (
             <img src={currentImage} alt="Product" className="image-preview" />
           ) : (
             <div className="image-preview-placeholder">
               <span style={{ fontSize: '64px' }}>🥣</span>
               <p style={{ color: 'white', marginTop: '12px', fontSize: '14px' }}>Manual Entry Mode</p>
               <button 
                  className="gallery-upload-btn" 
                  onClick={handleGalleryClick}
                  disabled={isProcessingLocal}
                >
                  <ImageIcon size={18} />
                  <span>Upload from Gallery</span>
                </button>
             </div>
           )}
           {isProcessingLocal && (
             <div className="processing-overlay">
               <Loader2 className="spinning" size={32} />
               <p>Analyzing Image...</p>
             </div>
           )}
           {currentImage && !isProcessingLocal && (
             <button 
                className="gallery-upload-btn-floating" 
                onClick={handleGalleryClick}
              >
                <ImageIcon size={16} />
                <span>Change Image</span>
              </button>
           )}
           <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
        </div>
        
        <div className="extracted-data-card">
          <div className="data-row">
            <span className="data-label">Product Name</span>
            <input 
               type="text" 
               className="data-input" 
               value={name} 
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter product name"
            />
          </div>
          
          <div className="data-row">
             <span className="data-label">Expiry Date</span>
             <input 
                type="date" 
                className="data-input" 
                value={expiry} 
                onChange={(e) => setExpiry(e.target.value)}
             />
          </div>
        </div>
        
        <button 
           className="confirm-button" 
           onClick={() => onConfirm({ name, expiry, capturedImage: currentImage })}
           disabled={isSaving || isProcessingLocal}
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
