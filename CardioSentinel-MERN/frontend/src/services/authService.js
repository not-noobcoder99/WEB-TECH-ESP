// Authentication Service
// Handles login, registration, logout

import apiClient from './apiClient';

const authService = {
  // Register a new user
  register: async (username, email, password, fullName, role, department) => {
    const response = await apiClient.post('/api/auth/register', {
      username, email, password, fullName, role, department
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data; // { token, user }
  },

  // Logout user
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout error:', error);
    }
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  // Register a new patient (self-registration)
  registerPatient: async (form) => {
    const response = await apiClient.post('/api/auth/register', {
      username: form.username,
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
      age: Number(form.age),
      sex: Number(form.sex),
    });
    return response.data;
  },

  // Admin: create a staff account
  createStaffUser: async (form) => {
    const response = await apiClient.post('/api/auth/admin/create-user', form);
    return response.data;
  },
};

export default authService;
