import api from './api';

class AuthService {
  setToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response;
  }
}

export const authService = new AuthService();