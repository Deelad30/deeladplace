import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProductGrid = ({ products, onAddToCart, vendors, disabled }) => {
      const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;
      //console.log(products);
      
  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  return (
    <div className="product-grid">
      {products
        .filter(product => product.selling_price !== null) // only show priced products
        .map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h4>{product.name}</h4>
            <p style={{fontSize:"13px"}} className="commission">vendor: {getVendorName(product.vendor_id)}</p>
              <div className="product-pricing">
                <span className="price">{formatCurrency(round(product.selling_price))}</span>
                <span className="commission">
                  Commission: {formatCurrency(round(product.custom_commission))}
                </span>
              </div>
            </div>
            <button
              onClick={() => onAddToCart(product)}
              className="add-to-cart-btn"
            >
              Add Item
            </button>
          </div>
        ))}
    </div>
  );
};

export default ProductGrid;
