import api from './api';

class InventoryService {
  async createMovement(movementData) {
    const response = await api.post('/inventory/movements', movementData);
    return response;
  }

  async getLowStockAlerts() {
    const response = await api.get('/inventory/low-stock');
    return response;
  }
}

export const inventoryService = new InventoryService();