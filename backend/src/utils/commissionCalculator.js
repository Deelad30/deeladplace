const constants = require('../config/constants');

const calculateCommission = (vendorPrice, customCommission = null) => {
  if (customCommission !== null) {
    return customCommission;
  }
  
  if (vendorPrice < constants.COMMISSION_RULES.PRICE_THRESHOLD) {
    return constants.COMMISSION_RULES.DEFAULT_FIXED_COMMISSION;
  } else {
    return Math.round(vendorPrice * constants.COMMISSION_RULES.DEFAULT_PERCENTAGE_COMMISSION);
  }
};

const calculatePricing = (vendorPrice, customCommission = null) => {
  const commission = calculateCommission(vendorPrice, customCommission);

  // Convert to numbers
  const numericVendorPrice = Number(vendorPrice);
  const numericCommission = Number(commission);

  const rawCustomerPrice = numericVendorPrice + numericCommission;
  
  // Round to the nearest 50 for a premium POS experience
  const customerPrice = Math.round(rawCustomerPrice / 50) * 50;
  
  return {
    commission,
    customerPrice
  };
};

module.exports = {
  calculateCommission,
  calculatePricing
};