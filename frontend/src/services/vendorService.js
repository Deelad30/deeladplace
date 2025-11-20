import api from './api';

class VendorService {
  async getAllVendors() {
    return await api.get('/vendors');
  }

  async getVendorById(id) {
    return await api.get(`/vendors/${id}`);
  }

  async create(data) {
    return await api.post('/vendors', data);
  }

  async update(id, data) {
    return await api.put(`/vendors/${id}`, data);  
  }

  async delete(id) {
    return await api.delete(`/vendors/${id}`);    
  }
}

export const vendorService = new VendorService();
