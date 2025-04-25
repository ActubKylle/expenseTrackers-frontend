import React, { createContext, useState, useContext, useEffect } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api/expenses';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: null,
    dateTo: null,
    searchTerm: '',
    page: 1,
    perPage: 10
  });

  // Fetch all expenses with the current filters
  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: filters.page,
        per_page: filters.perPage,
        category_id: filters.category || undefined,
        date_from: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
        date_to: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined,
        search: filters.searchTerm || undefined
      };
      
      const response = await getExpenses(params);
      setExpenses(response.data);
      setTotalCount(response.total);
      
      return response;
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError('Failed to load expenses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent expenses for dashboard or widgets
  const fetchRecentExpenses = async () => {
    if (!user) return;
    
    try {
      const params = {
        per_page: 5,
        sort_by: 'date',
        sort_direction: 'desc'
      };
      
      const response = await getExpenses(params);
      setRecentExpenses(response.data);
      
      return response.data;
    } catch (err) {
      console.error('Error fetching recent expenses:', err);
      throw err;
    }
  };

  // Create a new expense
  const createExpense = async (expenseData) => {
    try {
      setLoading(true);
      const response = await addExpense(expenseData);
      await fetchExpenses(); // Refresh the expense list
      return response;
    } catch (err) {
      console.error('Error creating expense:', err);
      setError('Failed to create expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing expense
  const editExpense = async (id, expenseData) => {
    try {
      setLoading(true);
      const response = await updateExpense(id, expenseData);
      await fetchExpenses(); // Refresh the expense list
      return response;
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an expense
  const removeExpense = async (id) => {
    try {
      setLoading(true);
      const response = await deleteExpense(id);
      await fetchExpenses(); // Refresh the expense list
      return response;
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if changing filters other than page
      page: newFilters.hasOwnProperty('page') ? newFilters.page : 1
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      dateFrom: null,
      dateTo: null,
      searchTerm: '',
      page: 1,
      perPage: filters.perPage
    });
  };

  // Fetch expenses when filters change or user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchRecentExpenses();
    }
  }, [filters, user]);

  const value = {
    expenses,
    recentExpenses,
    loading,
    error,
    totalCount,
    filters,
    fetchExpenses,
    fetchRecentExpenses,
    createExpense,
    editExpense,
    removeExpense,
    updateFilters,
    clearFilters
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export default ExpenseContext;