import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ProductGrid = ({ products, onAddToCart, disabled }) => {
      const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;
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
      {products
        .filter(product => product.selling_price !== null) // only show priced products
        .map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h4>{product.name}</h4>
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
