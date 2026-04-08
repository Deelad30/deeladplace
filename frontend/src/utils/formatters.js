export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);
};

export const roundPrice = (num, nearest = 100) => {
  const n = Number(num || 0);
  return Math.round(n / nearest) * nearest;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB');
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-GB');
};