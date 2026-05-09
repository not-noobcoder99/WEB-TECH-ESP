// Ticket Service
// API calls for support tickets

import apiClient from './apiClient';

const ticketService = {
  // Get all tickets (protected)
  getAllTickets: async (filters = {}) => {
    const response = await apiClient.get('/api/tickets', {
      params: filters
    });
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await apiClient.get(`/api/tickets/${id}`);
    return response.data;
  },

  // Submit new ticket (public)
  submitTicket: async (ticketData) => {
    const response = await apiClient.post('/api/tickets', ticketData);
    return response.data;
  },

  // Update ticket status
  updateTicket: async (id, updateData) => {
    const response = await apiClient.put(`/api/tickets/${id}`, updateData);
    return response.data;
  }
};

export default ticketService;
