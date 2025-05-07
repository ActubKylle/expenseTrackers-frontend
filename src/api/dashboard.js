  import axios from './axios';

  export const getDashboardSummary = async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/summary', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  };

  export const getDashboardStats = async (params = {}) => {
    try {
      const response = await axios.get('/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };