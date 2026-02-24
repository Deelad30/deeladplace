import React from 'react';

const CartSkeleton = ({ count = 3 }) => {
  return (
    <div className="cart-items skeleton-container" style={{ flexGrow: 1, overflowY: 'auto' }}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="cart-item" style={{ marginBottom: '0.75rem', padding: '12px', borderRadius: '12px', background: 'white', border: '1px solid #eee' }}>
          <div style={{ flexGrow: 1 }}>
            <div className="skeleton-base" style={{ width: '60%', height: '14px', marginBottom: '8px' }}></div>
            <div className="skeleton-base" style={{ width: '30%', height: '12px' }}></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="skeleton-base" style={{ width: '40px', height: '28px', borderRadius: '6px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartSkeleton;
