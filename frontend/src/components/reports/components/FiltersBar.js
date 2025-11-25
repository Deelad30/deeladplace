import React, { useState, useEffect } from 'react';

const FiltersBar = ({ onApply, vendors = [], current = {} }) => {
  const [start, setStart] = useState(current.start || '');
  const [end, setEnd] = useState(current.end || '');
  const [vendorId, setVendorId] = useState(current.vendor_id || '');
  const [paymentType, setPaymentType] = useState(current.payment_type || '');

  // Keep local state in sync if `current` changes
  useEffect(() => {
    setStart(current.start || '');
    setEnd(current.end || '');
    setVendorId(current.vendor_id || '');
    setPaymentType(current.payment_type || '');
  }, [current]);

  const apply = () => {
    onApply({
      start: start || null,
      end: end || null,
      vendor_id: vendorId || null,
      payment_type: paymentType || null,
    });
  };

  const reset = () => {
    setStart('');
    setEnd('');
    setVendorId('');
    setPaymentType('');
    onApply({ start: null, end: null, vendor_id: null, payment_type: null });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <input
        className="filter-input"
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
      />
      <input
        className="filter-input"
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
      />

      {/* Vendor dropdown */}
      <select
        className="filter-select"
        value={vendorId}
        onChange={(e) => setVendorId(e.target.value)}
      >
        <option value="">All Vendors</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      <select
        className="filter-select"
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
      >
        <option value="">All payments</option>
        <option value="cash">Cash</option>
        <option value="pos">POS</option>
        <option value="transfer">Transfer</option>
      </select>

      <div className="filter-actions">
        <button className="page-btn" onClick={apply}>Apply</button>
        <button className="page-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

export default FiltersBar;
