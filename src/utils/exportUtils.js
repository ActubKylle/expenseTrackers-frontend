import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

// Export expenses to CSV
export const exportExpensesToCSV = (expenses, filename = 'expenses.csv') => {
  // Prepare data in the format needed for CSV
  const data = expenses.map(expense => ({
    Date: expense.date,
    Category: expense.category?.name || '',
    Description: expense.description || '',
    Amount: expense.amount,
    // Add more fields as needed
  }));

  // Convert to CSV
  const csv = Papa.unparse(data);
  
  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

// Export expenses to PDF
export const exportExpensesToPDF = (expenses, filename = 'expenses.pdf') => {
    const doc = new jsPDF();
  
    // Add title
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);
  
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  
    // Define table columns and rows
    const columns = ['Date', 'Category', 'Description', 'Amount'];
    const rows = expenses.map((expense) => [
      expense.date,
      expense.category?.name || '',
      expense.description || '-',
      `₱${parseFloat(expense.amount).toFixed(2)}`,
    ]);
  
    // Add table to the PDF
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 135, 245],
        textColor: 255,
        fontStyle: 'bold',
      },
    });
  
    // Save the PDF
    doc.save(filename);
  };

// Export budgets to CSV
export const exportBudgetsToCSV = (budgets, filename = 'budgets.csv') => {
  // Prepare data in the format needed for CSV
  const data = budgets.map(budget => ({
    Month: budget.month_name || budget.month,
    Category: budget.category?.name || '',
    'Budget Amount': budget.amount,
    'Spent Amount': budget.spent,
    'Remaining': (budget.amount - budget.spent).toFixed(2),
    'Percentage Used': `${((budget.spent / budget.amount) * 100).toFixed(1)}%`
  }));

  // Convert to CSV
  const csv = Papa.unparse(data);
  
  // Create blob and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

// Export budgets to PDF
export const exportBudgetsToPDF = (budgets, month, filename = 'budgets.pdf') => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Budget Report', 14, 22);
  
  // Add month info
  doc.setFontSize(12);
  doc.text(`Month: ${month}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);
  
  // Format data for PDF table
  const columns = ["Category", "Budget Amount", "Spent", "Remaining", "% Used"];
  const rows = [];
  
  let totalBudget = 0;
  let totalSpent = 0;
  
  budgets.forEach(budget => {
    const remaining = budget.amount - budget.spent;
    const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    
    totalBudget += budget.amount;
    totalSpent += budget.spent;
    
    const budgetData = [
      budget.category?.name || '',
      `₱${budget.amount.toFixed(2)}`,
      `₱${budget.spent.toFixed(2)}`,
      `₱${remaining.toFixed(2)}`,
      `${percentUsed.toFixed(1)}%`
    ];
    rows.push(budgetData);
  });
  
  // Add the table to PDF
  doc.autoTable({
    head: [columns],
    body: rows,
    startY: 45,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 135, 245],
      textColor: 255,
      fontStyle: 'bold',
    },
    foot: [['Total', `₱${totalBudget.toFixed(2)}`, `₱${totalSpent.toFixed(2)}`, `₱${(totalBudget - totalSpent).toFixed(2)}`, `${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%`]],
    footStyles: {
      fillColor: [240, 240, 240],
      fontStyle: 'bold',
    },
  });
  
  // Save PDF
  doc.save(filename);
};