// src/services/salesService.js
import api from './api'; // your existing api instance (axios or fetch wrapper)

class SalesService {
  async createSale(saleData) {
    const response = await api.post('/sales', saleData);
    return response.data;
  }

async getSalesSummary(params = {}) {
  const response = await api.get('/sales/summary', { params });
  return response.data;
}

async getOverview(params = {}) {
  const response = await api.get('/sales/overview', { params });
  return response.data;
}
  async getTopProducts(params = {}) {
    const response = await api.get('/sales/top-products', { params });
    return response.data;
  }

  async getPaymentSummary(params = {}) {
    const response = await api.get('/sales/payment-summary', { params });
    return response.data;
  }

  async getSalesPaginated(params = {}) {
    // params: { page, limit, start, end, vendor_id, product_id, payment_type }
    const response = await api.get('/sales', { params });
    return response.data;
  }

  async getVendorsSummary(params = {}) {
    const response = await api.get('/sales/vendors', { params });
    return response.data;
  }
}

export const salesService = new SalesService();
