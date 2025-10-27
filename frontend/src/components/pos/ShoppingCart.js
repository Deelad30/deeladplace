import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ShoppingCart = ({ cart, onUpdateQuantity, onRemoveItem, totals, onProcessSale, processing, disabled }) => {
  return (
    <div className="shopping-cart">
      <h3>Shopping Cart</h3>
      
      {cart.length === 0 ? (
        <div className="empty-cart">Cart is empty</div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{formatCurrency(item.customer_price)}</span>
                </div>
                <div className="item-controls">
                  <div className="quantity-controls">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-totals">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="total-line">
              <span>Commission:</span>
              <span>{formatCurrency(totals.commission)}</span>
            </div>
            <div className="total-line grand-total">
              <span>Total:</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <button
            onClick={onProcessSale}
            disabled={disabled || processing}
            className="process-sale-btn"
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;