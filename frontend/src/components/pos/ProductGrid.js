import React from 'react';
import { formatCurrency, calculatePOSPricing } from '../../utils/formatters';

const ProductGrid = ({ products, onAddToCart, vendors, disabled }) => {
  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : "Unknown Vendor";
  };

  return (
    <div className="product-grid">
      {products
        .filter(product => product.selling_price !== null) 
        .map(product => {
          const { total: totalPrice, sellingPrice, commission } = calculatePOSPricing(
            product.selling_price, 
            product.commission || product.custom_commission || 0
          );

          return (
            <div key={product.id} className="product-card premium">
              <div className="product-visual">
                <span className="product-initial">{product.name.charAt(0)}</span>
              </div>
              <div className="product-content">
                <div className="product-header">
                  <h4 title={product.name}>{product.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-muted)' }}>{getVendorName(product.vendor_id)}</span>
                </div>
                
                <div className="price-stack">
                  <span className="value">{formatCurrency(totalPrice)}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pos-text-muted)' }}>
                    {formatCurrency(sellingPrice)} + {formatCurrency(commission)}
                  </span>
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  className="add-to-cart-btn premium"
                  disabled={disabled}
                >
                  Add Item
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ProductGrid;
