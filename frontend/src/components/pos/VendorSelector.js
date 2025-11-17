import React from 'react';
import './VendorSelector.css';

const VendorSelector = ({ vendors, selectedVendor, onVendorSelect }) => {
  return (
    <div className="vendor-selector">
      <label>Select Vendor:</label>
      <select
        value={selectedVendor || ''}
        onChange={(e) => onVendorSelect(e.target.value)}
        className="vendor-dropdown"
      >
        <option value="">Choose a vendor...</option>
        {vendors.map(vendor => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VendorSelector;
