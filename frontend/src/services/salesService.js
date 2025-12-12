// src/services/salesService.js
import api from './api';

class SalesService {

  // POS sale creation (unchanged)
  async createSale(saleData) {
    const response = await api.post('/sales', saleData);
    return response.data;
  }


  // -----------------------
  // NEW REPORT ENDPOINTS
  // -----------------------

  async getOverview(params = {}) {
    const response = await api.get('/reports/sales-overview', { params });
    return response.data;
  }

  async getSalesSummary(params = {}) {
    const response = await api.get('/reports/sales-summary', { params });
    return response.data;
  }

  async getTopProducts(params = {}) {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  }

  async getPaymentSummary(params = {}) {
    const response = await api.get('/reports/payment-summary', { params });
    return response.data;
  }


  // -----------------------
  // OLD SALES ENDPOINTS (STILL USED BY SalesTable)
  // -----------------------

  async getSalesPaginated(params = {}) {
    // new backend endpoint for paginated sales
    const response = await api.get('reports/sales-reports', { params });
    // the backend returns: { ok, data, total_rows, total_pages }
    console.log(response);
    
    return response.data;
  }

  async getVendorsSummary(params = {}) {
    const response = await api.get('/sales/vendors', { params });
    return response.data;
  }

  async getAllSalesNoPagination(filters = {}) {
  const params = {
    start: filters.startDate || filters.start || null,
    end: filters.endDate || filters.end || null,
    vendor_id: filters.vendor_id || null,
    payment_type: filters.payment_type || null,
    limit: 999999 // just fetch everything
  };

  const response = await api.get('/reports/sales-reports', { params });
  return response.data;
}

  
}



export const salesService = new SalesService();
