import api from './api';

class ProductService {
  async getProductsByVendor(vendorId) {
    const response = await api.get(`/products?vendor_id=${vendorId}`);
    return response;
  }
}

export const productService = new ProductService();