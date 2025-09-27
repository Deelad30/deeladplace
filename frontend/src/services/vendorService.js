import api from './api';

class VendorService {
  async getAllVendors() {
    const response = await api.get('/vendors');
    return response;
  }

  async getVendorById(id) {
    const response = await api.get(`/vendors/${id}`);
    return response;
  }
}

export const vendorService = new VendorService();