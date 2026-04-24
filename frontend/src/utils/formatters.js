export const formatCurrency = (amount, hideDecimals = false) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: hideDecimals ? 0 : 2,
    maximumFractionDigits: hideDecimals ? 0 : 2
  }).format(amount);
};

export const roundPrice = (num, nearest = 1) => {
  const n = Number(num || 0);
  return Math.round(n / nearest) * nearest;
};

export const calculatePOSPricing = (sellingPrice, commission) => {
  const sp = Number(sellingPrice || 0);
  const comm = Number(commission || 0);
  const total = Math.round((sp + comm) / 50) * 50;
  return {
    total,
    sellingPrice: total - comm,
    commission: comm
  };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB');
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-GB');
};