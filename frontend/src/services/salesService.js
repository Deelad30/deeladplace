import api from './api';

class SalesService {
  async createSale(saleData) {
    const response = await api.post('/sales', saleData);
    return response;
  }

  async getSalesSummary() {
    const response = await api.get('/sales/summary');
    return response;
  }
}

export const salesService = new SalesService();