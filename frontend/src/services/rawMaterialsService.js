import api from './api';

class RawMaterialsService {
  // GET all raw materials
  async getAll() {
    const response = await api.get('/raw-materials');
    return response.data;
  }

  // CREATE
  async create(data) {
    const response = await api.post('/raw-materials', data);
    return response.data;
  }

  // UPDATE
  async update(id, data) {
    const response = await api.put(`/raw-materials/${id}`, data);
    return response.data;
  }

  // DELETE
  async delete(id) {
    const response = await api.delete(`/raw-materials/${id}`);
    return response.data;
  }
}

export const rawMaterialsService = new RawMaterialsService();
