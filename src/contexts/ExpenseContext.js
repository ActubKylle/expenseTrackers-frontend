import React, { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const fetchExpenses = async () => {
    // Fetch expenses from the backend and update state
    console.log('Fetching expenses...');
    // Example: setExpenses(response.data);
  };

  return (
    <ExpenseContext.Provider value={{ expenses, recentExpenses, fetchExpenses }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => useContext(ExpenseContext);
