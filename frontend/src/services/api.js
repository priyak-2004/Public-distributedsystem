import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventService = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventType, metadata) => {
    try {
      const response = await api.post('/events', {
        eventType,
        metadata,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Verify event hash
  verifyHash: async (hash) => {
    try {
      const response = await api.get(`/events/verify/${hash}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying hash:', error);
      throw error;
    }
  },

  // PDS Distribution
  distributePDS: async (data) => {
    try {
      const response = await api.post('/distribute', data);
      return response.data;
    } catch (error) {
      console.error('Error in PDS distribution:', error);
      throw error;
    }
  },

  // Get PDS Events
  getPDSEvents: async () => {
    try {
      const response = await api.get('/pds-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching PDS events:', error);
      throw error;
    }
  },
};

export default api;
