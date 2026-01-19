import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faBoxOpen, faArrowRight } from '@fortawesome/free-solid-svg-icons';
// Using inline styles for specific gradient widgets, but aligned with premium spacing

const LowStockWidget = ({ stockItems = [] }) => {
  const lowItems = stockItems.filter(item => item.is_low_stock);
  const count = lowItems.length;

  if (count === 0) {
    return (
      <div className="premium-card" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        border: 'none',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '32px'
      }}>
        <div style={{
            background: 'rgba(255,255,255,0.2)',
            width: '64px', height: '64px',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            backdropFilter: 'blur(4px)'
        }}>
            <FontAwesomeIcon icon={faBoxOpen} />
        </div>
        <div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color:'white' }}>Stock Healthy</h3>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '15px', fontWeight:'500' }}>All stock levels are optimal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card widget-card" style={{
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      border: 'none',
      color: 'white',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
        {/* Background Pattern Decoration */}
        <div style={{ position:'absolute', right:'-20px', top:'-20px', fontSize:'150px', opacity:0.1, transform:'rotate(15deg)' }}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
        </div>

       <div style={{
            background: 'rgba(255,255,255,0.2)',
            width: '64px', height: '64px',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
            backdropFilter: 'blur(4px)',
            zIndex: 1
        }}>
            <FontAwesomeIcon icon={faExclamationTriangle} beatFade />
        </div>
      <div style={{ flex: 1, zIndex: 1 }}>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color:'white' }}>{count} Items Low in Stock</h3>
        <p style={{ margin: '4px 0 0 0', opacity: 0.95, fontSize: '15px', fontWeight:'500' }}>
          Action Required: {lowItems.slice(0, 3).map(i => i.name).join(', ')} {count > 3 ? `and ${count - 3} more` : ''}
        </p>
      </div>
      <button style={{
          background: 'white',
          color: '#dc2626',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
      }} onClick={() => document.getElementById('ledger-form')?.scrollIntoView({behavior:'smooth'})}>
        Restock Now <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
};

export default LowStockWidget;
