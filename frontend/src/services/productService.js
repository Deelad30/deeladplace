import api from './api';

class ProductService {
  async getProductsByVendor(vendorId, page = 1) {
    const response = await api.get(`/products?vendor_id=${vendorId}&page=${page}`);
    return response.data;
  }

  async getAllProducts(page = 1) {
    const response = await api.get(`/products/all?page=${page}`);
    return response.data;
  }

  async getAllProducts() {
    const response = await api.get(`/products/all`);
    return response;
  }

  async createProduct(data) {
    const response = await api.post('/products', data);
    return response.data;
  }

  async updateProduct(id, data) {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }

  async getDashboardSummary() {
    const response = await api.get('/products/dashboard-summary');
    return response.data;
  }

  async getProductsGroupedByVendor() {
  const response = await api.get('/products/grouped');
  return response.data;
  }

  async getVendors() {
    const response = await api.get('/products/vendors');
    return response.data;
  }
}

export const productService = new ProductService();

