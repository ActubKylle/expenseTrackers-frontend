import axios from './axios';

// Dummy data for development
// const DUMMY_CATEGORIES = [
//   { id: 1, name: 'Food', color: '#4CAF50' },
//   { id: 2, name: 'Transportation', color: '#2196F3' },
//   { id: 3, name: 'Entertainment', color: '#FF9800' },
//   { id: 4, name: 'Utilities', color: '#9C27B0' },
//   { id: 5, name: 'Shopping', color: '#F44336' }
// ];

// const DUMMY_EXPENSES = [
//   { id: 1, amount: 150.00, date: '2023-12-01', description: 'Groceries', category_id: 1, category: DUMMY_CATEGORIES[0], receipt_path: null },
//   { id: 2, amount: 75.50, date: '2023-12-02', description: 'Uber ride', category_id: 2, category: DUMMY_CATEGORIES[1], receipt_path: null },
//   { id: 3, amount: 45.00, date: '2023-12-03', description: 'Movie tickets', category_id: 3, category: DUMMY_CATEGORIES[2], receipt_path: null },
//   { id: 4, amount: 120.75, date: '2023-12-04', description: 'Electric bill', category_id: 4, category: DUMMY_CATEGORIES[3], receipt_path: null },
//   { id: 5, amount: 89.99, date: '2023-12-05', description: 'New shoes', category_id: 5, category: DUMMY_CATEGORIES[4], receipt_path: null }
// ];

// Function to filter expenses based on params
// const filterExpenses = (expenses, params) => {
//   let filtered = [...expenses];
//   if (params.category_id) filtered = filtered.filter(expense => expense.category_id === parseInt(params.category_id));
//   if (params.date_from) filtered = filtered.filter(expense => new Date(expense.date) >= new Date(params.date_from));
//   if (params.date_to) filtered = filtered.filter(expense => new Date(expense.date) <= new Date(params.date_to));
//   if (params.search) filtered = filtered.filter(expense => expense.description.toLowerCase().includes(params.search.toLowerCase()));
//   return filtered;
// };

// Get all expenses with optional filtering
export const getExpenses = async (params = {}) => {
  try {
    const response = await axios.get('/expenses', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Get a single expense by ID
export const getExpense = async (id) => {
  try {
    const response = await axios.get(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching expense ${id}:`, error);
    throw error;
  }
};

// Add a new expense
export const addExpense = async (expenseData) => {
  try {
    // Check if we have a file or a URL for the receipt
    if (expenseData.receipt_file && expenseData.receipt_file instanceof File) {
      // Handle file upload with FormData
      const formData = new FormData();
      formData.append('amount', expenseData.amount);
      formData.append('date', expenseData.date);
      formData.append('description', expenseData.description || '');
      formData.append('category_id', expenseData.category_id);
      formData.append('receipt', expenseData.receipt_file);

      const response = await axios.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } else {
      // Handle regular JSON data with receipt_path if present
      const payload = {
        amount: parseFloat(expenseData.amount),
        date: expenseData.date,
        description: expenseData.description || '',
        category_id: parseInt(expenseData.category_id, 10),
        receipt_path: expenseData.receipt_path || null
      };

      // Ensure receipt_path is trimmed to avoid whitespace issues
      if (payload.receipt_path) {
        payload.receipt_path = payload.receipt_path.trim();
      }

      const response = await axios.post('/expenses', payload);
      return response.data;
    }
  } catch (error) {
    console.error('Error adding expense:', error.response || error.message);
    throw error;
  }
};
export const updateExpense = async (id, expenseData) => {
  try {
    console.log('Updating expense ID:', id);
    
    // Determine if we need to use FormData (for file uploads) or regular JSON
    const hasFile = expenseData.receipt_file && expenseData.receipt_file instanceof File;
    
    if (hasFile) {
      console.log('Uploading file with expense update:', expenseData.receipt_file.name);
      
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Add fields
      formData.append('amount', parseFloat(expenseData.amount));
      formData.append('date', expenseData.date);
      formData.append('description', expenseData.description || '');
      formData.append('category_id', parseInt(expenseData.category_id, 10));
      
      // Add receipt file
      formData.append('receipt', expenseData.receipt_file);
      
      // IMPORTANT: Use method spoofing for Laravel
      formData.append('_method', 'PUT');
      
      // Use POST instead of PUT for FormData
      const response = await axios.post(`/expenses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('File upload response:', response.data);
      return response.data;
    } else {
      // No change for regular JSON updates
      const updatedData = {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        category_id: parseInt(expenseData.category_id, 10)
      };
      
      const response = await axios.put(`/expenses/${id}`, updatedData);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};


export const uploadReceipt = async (id, receiptFile) => {
  try {
    // Create FormData for the file
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    
    const response = await axios.post(`/expenses/${id}/upload-receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading receipt:', error);
    throw error;
  }
};

// Delete an expense
export const deleteExpense = async (id) => {
  try {
    const response = await axios.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting expense ${id}:`, error);
    throw error;
  }
};

// Get expense statistics
export const getExpenseStats = async (params = {}) => {
  try {
    const response = await axios.get('/expenses/stats', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching expense statistics:', error);
    throw error;
  }
};