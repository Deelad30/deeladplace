import React from 'react';
import { formatCurrency, calculatePOSPricing } from '../../utils/formatters';
import CartSkeleton from './CartSkeleton';
import { useAuth } from '../../context/AuthContext';
import { ROLE_MAP } from '../../utils/roles';

const ShoppingCart = ({ cart, onUpdateQuantity, onRemoveItem, totals, onContinue, processing, loading, disabled, billNo, onBillNoChange, onSaveBill, onPrintBill, onPrintKitchen }) => {
    const { user } = useAuth();

  return (
    <div className="shopping-cart">
      <div className="cart-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Current Order</h3>
        {cart.length > 0 && !loading && (
          <div className="order-print-actions" style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onPrintKitchen} className="print-btn-glass" title="Print Kitchen Copy">Kitchen</button>
            <button onClick={onPrintBill} className="print-btn-glass" title="Print Bill Estimation">Bill</button>
          </div>
        )}
      </div>
      
      {loading ? (
        <CartSkeleton count={3} />
      ) : cart.length === 0 ? (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--pos-text-muted)', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, color: 'var(--pos-text-main)' }}>Your cart is empty</p>
          <span style={{ fontSize: '0.85rem' }}>Items you add will appear here</span>
        </div>
      ) : (
        <>
          <div className="cart-items" style={{ flexGrow: 1, overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div style={{ flexGrow: 1 }}>
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">{formatCurrency(calculatePOSPricing(item.selling_price, item.commission).total)}</div>
                </div>
                <div className="item-controls" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="quantity-controls">
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--pos-danger)', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-totals">
            <div className="total-line">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.totalSellingPrice)}</span>
            </div>
            <div className="total-line">
              <span>Commission</span>
              <span>{formatCurrency(totals.totalCommission)}</span>
            </div>
            <div className="total-line grand-total">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <div className="bill-no-input">
            <input 
              type="text" 
              placeholder="Table No / Bill ID" 
              value={billNo}
              onChange={(e) => onBillNoChange(e.target.value)}
              className="search-input"
              style={{ padding: '0.75rem', marginBottom: '1rem', marginTop: '1rem' }}
            />
          </div>

          <div className="cart-actions">
            <button
              onClick={onSaveBill}
              disabled={disabled || processing || !billNo}
              className="save-bill-btn-glass"
            >
              Save to Bill
            </button>
            <button
              onClick={onContinue}
              disabled={disabled || processing || ROLE_MAP[user?.role_id] === 'waiter'}
              className="process-sale-btn-premium"
              title={ROLE_MAP[user?.role_id] === 'waiter' ? 'Waiters cannot settle sales' : ''}
            >
              {processing ? 'Processing...' : 'Settle Sale'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCart;