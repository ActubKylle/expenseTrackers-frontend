// src/api/budgets.js - Complete Implementation

import axios from './axios';

// Get all budgets for a specific month
export const getBudgetsForMonth = async (month) => {
  try {
    const response = await axios.get(`/budgets/${month}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
};

// Get budget summary statistics
export const getBudgetSummary = async () => {
  try {
    const response = await axios.get('/budgets/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching budget summary:', error);
    throw error;
  }
};

// Update an existing budget
export const updateBudget = async (id, data) => {
  try {
    const response = await axios.put(`/budgets/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

// Add a new budget
export const addBudget = async (budgetData) => {
  try {
    const response = await axios.post('/budgets', budgetData);
    return response.data;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

// Delete a budget
export const deleteBudget = async (id) => {
  try {
    const response = await axios.delete(`/budgets/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}