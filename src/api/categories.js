import axios from './axios';

export const getCategories = async (params = {}) => {
  try {
    // Pass any query parameters
    const response = await axios.get('/categories', { 
      params: {
        searchTerm: params.searchTerm,
        page: params.page,
        per_page: params.per_page
      } 
    });
    
    console.log('Categories API response:', response.data); // Add this line to debug
    
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
    // Make sure is_default is explicitly set to false
    const data = {
      ...categoryData,
      is_default: false
    };
    
    const response = await axios.post('/categories', data);
    return response.data;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    // Make sure we're not changing the is_default status
    const data = {
      ...categoryData
    };
    // Don't include is_default in the update data
    delete data.is_default;
    
    const response = await axios.put(`/categories/${id}`, data);
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