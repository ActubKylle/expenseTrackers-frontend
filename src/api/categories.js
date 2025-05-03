import axios from './axios';

export const getCategories = async (params = {}) => {
  try {
    // Pass the searchTerm as a query parameter
    const response = await axios.get('/categories', { 
      params: {
        searchTerm: params.searchTerm
      } 
    });
    
    // Ensure we're returning an array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      // Sometimes API returns { data: [...] }
      return response.data.data;
    } else {
      // Fallback to empty array
      console.error('Unexpected API response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array on error to prevent mapping errors
    return [];
  }
};
export const addCategory = async (categoryData) => {
  try {
    const response = await axios.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};