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
    const formData = new FormData();
    formData.append('amount', expenseData.amount);
    formData.append('date', expenseData.date);
    formData.append('description', expenseData.description || '');
    formData.append('category_id', expenseData.category_id);

    if (expenseData.receipt_file) {
      formData.append('receipt', expenseData.receipt_file);
    } else if (expenseData.receipt_path) {
      formData.append('receipt_path', expenseData.receipt_path);
    }

    const response = await axios.post('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error.response || error.message);
    throw error;
  }
};

// Update an existing expense
export const updateExpense = async (id, expenseData) => {
  try {
    console.log('Updating expense ID:', id, 'with data:', expenseData);
    
    // Determine if we need to use FormData (for file uploads) or regular JSON
    const hasFile = expenseData.receipt_file && expenseData.receipt_file instanceof File;
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      
      // Convert amount to number if it's a string
      if (expenseData.amount !== undefined) {
        formData.append('amount', parseFloat(expenseData.amount));
      }
      
      // Add other fields
      if (expenseData.date !== undefined) {
        formData.append('date', expenseData.date);
      }
      
      if (expenseData.description !== undefined) {
        formData.append('description', expenseData.description || '');
      }
      
      if (expenseData.category_id !== undefined) {
        formData.append('category_id', parseInt(expenseData.category_id, 10));
      }
      
      // Add receipt file
      formData.append('receipt', expenseData.receipt_file);
      
      const response = await axios.put(`/expenses/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      return response.data;
    } else {
      // For regular updates without files, use JSON
      // Create a new object with proper data types
      const updatedData = {
        ...expenseData,
        amount: expenseData.amount !== undefined ? parseFloat(expenseData.amount) : undefined,
        category_id: expenseData.category_id !== undefined ? parseInt(expenseData.category_id, 10) : undefined
      };
      
      const response = await axios.put(`/expenses/${id}`, updatedData);
      return response.data;
    }
  } catch (error) {
    console.error('Error updating expense:', error.response?.data || error.message);
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