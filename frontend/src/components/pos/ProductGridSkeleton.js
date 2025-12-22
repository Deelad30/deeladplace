import React from "react";
import "./ProductGridSkeleton.css";

const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card skeleton">
          <div className="product-info">
            <div className="skeleton-line title" />
            <div className="skeleton-line price" />
            <div className="skeleton-line commission" />
          </div>

          <div className="skeleton-btn" />
        </div>
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
