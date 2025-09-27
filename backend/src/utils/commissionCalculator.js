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