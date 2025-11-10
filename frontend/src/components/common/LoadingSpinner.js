import React from 'react';
import '../../../src/styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
