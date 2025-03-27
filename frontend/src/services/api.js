import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatService = {
  sendMessage: async (messages) => {
    try {
      const response = await api.post('/chat', { messages });
      return response.data;
    } catch (error) {
      console.error('Error in chat service:', error);
      throw error;
    }
  },
};

export const portfolioService = {
  getPortfolio: async () => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },
};

export const investmentService = {
  getRecommendations: async () => {
    try {
      const response = await api.get('/recommendations');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
};

export default api; 