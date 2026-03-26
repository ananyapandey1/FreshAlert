import React, { useRef, useState, useCallback, useEffect } from 'react';

const Scanner = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  useEffect(() => {
    let currentStream = null;

    const initializeDevice = async (currentFacingMode) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera API is not supported in this browser. Please ensure you are using HTTPS or localhost.');
        return null;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: currentFacingMode } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
        return mediaStream;
      } catch (err) {
        console.warn(`Failed with facingMode ${currentFacingMode}, trying default camera...`, err);
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setError(null);
          return fallbackStream;
        } catch (fallbackErr) {
          console.error("Error accessing camera even with fallback:", fallbackErr);
          setError(`Camera error: ${fallbackErr.name} - ${fallbackErr.message}. Please ensure permissions are granted.`);
          return null;
        }
      }
    };

    initializeDevice(facingMode).then(s => {
      currentStream = s;
    });

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      // If it's a subagent and video is blank, this will just capture a blank image. That's fine.
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      
      setIsProcessing(true);
      // Pass the captured image string up to the parent App
      onCapture(base64Image); 
    }
  }, [onCapture]);

  return (
    <div className="scanner-container">
      <div className="scanner-header">
        <button className="icon-btn" onClick={onClose} disabled={isProcessing}>
          <span>Close</span>
        </button>
        <h2>Scan Product</h2>
        <button className="icon-btn" onClick={toggleCamera} disabled={isProcessing}>
          <span>Flip</span>
        </button>
      </div>
      
      {error ? (
        <div className="scanner-error">
          <p>{error}</p>
          {/* Add a fallback debug capture button if camera is broken so subagent/dev can still test the flow */}
          <button 
             className="shutter-button mt-4" 
             onClick={() => {
               // Mock image capture if camera fails
               setIsProcessing(true);
               // Mock blank white image or anything 
               const canvas = document.createElement('canvas');
               canvas.width = 100; canvas.height = 100;
               const ctx = canvas.getContext('2d');
               ctx.fillStyle = 'white'; ctx.fillRect(0,0,100,100);
               onCapture(canvas.toDataURL('image/jpeg'));
             }}
          >
             <span style={{fontSize: '12px', padding: '10px'}}>Mock Scan (Debug)</span>
          </button>
        </div>
      ) : (
        <div className="viewfinder">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-preview"
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="scanner-overlay">
            <div className="scan-frame"></div>
          </div>
          
          <div className="scanner-controls">
             <p className="scanner-instruction">Position product label in frame</p>
             <div className="scanner-actions-row">
               <button 
                  className="shutter-button" 
                  onClick={handleCapture}
                  disabled={isProcessing}
                >
                  <div className="shutter-inner">
                    {isProcessing ? (
                      <div className="loading-spinner-small"></div>
                    ) : (
                      <span style={{ fontSize: '24px', color: 'var(--color-text-main)' }}>📷</span>
                    )}
                  </div>
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
