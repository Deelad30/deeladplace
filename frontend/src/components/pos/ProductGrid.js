import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProductGrid = ({ products, onAddToCart, disabled }) => {
  if (disabled) {
    return (
      <div className="product-grid disabled">
        <div className="placeholder">
          Please select a vendor to view products
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map(product => (
        <div key={product.id} className="product-card">
          <div className="product-info">
            <h4>{product.name}</h4>
            <div className="product-pricing">
              <span className="price">{formatCurrency(product.vendor_price)}</span>
              <span className="commission">Commission: {formatCurrency(product.commission)}</span>
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