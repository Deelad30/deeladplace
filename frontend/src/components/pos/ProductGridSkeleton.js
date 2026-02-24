import React from "react";
import "./ProductGridSkeleton.css";

const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card skeleton premium">
          <div className="product-visual skeleton-base" style={{ height: '100px', width: '100%', borderRadius: '12px' }} />
          <div className="product-content" style={{ padding: '1rem 0 0' }}>
            <div className="skeleton-base" style={{ height: '18px', width: '80%', marginBottom: '8px' }} />
            <div className="skeleton-base" style={{ height: '12px', width: '50%', marginBottom: '16px' }} />
            
            <div className="price-stack" style={{ marginBottom: '1rem' }}>
              <div className="skeleton-base" style={{ height: '16px', width: '40%', marginBottom: '4px' }} />
              <div className="skeleton-base" style={{ height: '10px', width: '60%' }} />
            </div>

            <div className="skeleton-base" style={{ height: '40px', width: '100%', borderRadius: '10px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
