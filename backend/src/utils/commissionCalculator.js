/**
 * Calculate hub commission based on vendor price and custom commission rules
 * @param {number} vendorPrice - The vendor's base price
 * @param {number|null} customCommission - Custom commission if set
 * @returns {number} The calculated commission
 */
const calculateCommission = (vendorPrice, customCommission = null) => {
  if (customCommission !== null && customCommission !== undefined) {
    return customCommission;
  }
  
  // Default commission rules
  if (vendorPrice < 10000) {
    return 500;
  } else {
    return Math.round(vendorPrice * 0.05);
  }
};

/**
 * Calculate customer price including commission
 * @param {number} vendorPrice - The vendor's base price
 * @param {number|null} customCommission - Custom commission if set
 * @returns {Object} Object containing commission and total price
 */
const calculatePricing = (vendorPrice, customCommission = null) => {
  const commission = calculateCommission(vendorPrice, customCommission);
  const customerPrice = vendorPrice + commission;
  
  return {
    commission,
    customerPrice
  };
};

module.exports = {
  calculateCommission,
  calculatePricing
};