import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const ShoppingCart = ({ cart, onUpdateQuantity, onRemoveItem, totals, onContinue, processing, disabled }) => {
  console.log(totals);
    const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;
  
  return (
    <div className="shopping-cart">
      <h3>Current Order</h3>
      
      {cart.length === 0 ? (
        <div className="empty-cart">Order list is empty</div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{formatCurrency(round(+item.custom_commission + +item.selling_price))}</span>
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
              <span>{formatCurrency(round(totals.totalSellingPrice))}</span>
            </div>
            <div className="total-line">
              <span>Commission:</span>
              <span>{formatCurrency(round(totals.totalCommission))}</span>
            </div>
            <div className="total-line grand-total">
              <span>Total:</span>
              <span>{formatCurrency(round(totals.total))}</span>
            </div>
          </div>

          <button
            onClick={onContinue}
            disabled={disabled || processing}
            className="process-sale-btn"
          >
            {processing ? 'Processing...' : 'Continue Sale'}
          </button>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;