/**
 * Enhanced dashboard print function
 * Fixed spacing and compact layout for better print output
 */
import { Savings as SavingsIcon } from '@mui/icons-material';
import * as ReactDOMServer from 'react-dom/server';

export const printDashboardPage = () => {
  // Create a print-specific stylesheet
  const style = document.createElement('style');
  style.type = 'text/css';
  style.id = 'print-style';

  // Define enhanced print styles with fixed spacing
  style.innerHTML = `
    @media print {
      body * {
        visibility: hidden;
      }
      .dashboard-content, .dashboard-content * {
        visibility: visible;
      }
      .dashboard-content {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 10px !important; /* Reduced padding for compact layout */
        box-sizing: border-box;
        background-color: white !important;
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
      }
      .dashboard-header-print {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 10px !important; /* Reduced margin for compactness */
        padding-bottom: 5px !important;
        border-bottom: 2px solid #1976d2 !important;
      }
      .MuiGrid-container {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        grid-gap: 10px !important; /* Reduced gap for compact layout */
        margin: 0 !important;
      }
      .MuiGrid-item {
        padding: 0 !important;
        margin: 0 !important;
      }
      .MuiCard-root, .MuiPaper-root {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        border-radius: 8px !important;
        height: auto !important;
        padding: 10px !important; /* Reduced padding for compactness */
        background-color: white !important;
        margin: 0 !important;
        border: 1px solid rgba(0,0,0,0.05) !important;
      }
      .MuiTypography-h3 {
        font-size: 20px !important; /* Adjusted font size */
        font-weight: 500 !important;
        color: #1976d2 !important;
        margin: 0 0 5px 0 !important;
      }
      .MuiTypography-h6 {
        font-size: 12px !important; /* Adjusted font size */
        color: #666 !important;
        margin: 0 0 3px 0 !important;
        font-weight: normal !important;
      }
      .MuiLinearProgress-root {
        height: 6px !important; /* Reduced height for compactness */
        border-radius: 3px !important;
        margin: 4px 0 !important; /* Reduced margin for compactness */
        background-color: #f5f5f5 !important;
      }
      .MuiLinearProgress-colorPrimary .MuiLinearProgress-bar {
        background-color: #1976d2 !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      @page {
        size: portrait;
        margin: 0.5cm;
      }
    }
  `;

  // Function to create the print layout
  const createPrintLayout = () => {
    try {
      const dashboardContent = document.querySelector('.dashboard-content');
      if (!dashboardContent) return;

      if (!document.querySelector('.dashboard-header-print')) {
        const header = document.createElement('div');
        header.className = 'dashboard-header-print';

        const title = document.createElement('h1');
        title.style.fontSize = '20px';
        title.style.fontWeight = '500';
        title.style.margin = '0';
        title.textContent = 'Dashboard';

        const dateDisplay = document.createElement('div');
        dateDisplay.style.fontSize = '12px';
        dateDisplay.style.color = '#666';
        dateDisplay.textContent = new Date().toLocaleDateString();

        header.appendChild(title);
        header.appendChild(dateDisplay);
        dashboardContent.insertBefore(header, dashboardContent.firstChild);
      }
    } catch (error) {
      console.error('Error creating print layout:', error);
    }
  };

  // Append the style to the head
  document.head.appendChild(style);

  // Create the print layout
  createPrintLayout();

  // Trigger the print dialog
  window.print();

  // Clean up after printing
  setTimeout(() => {
    try {
      const printStyle = document.getElementById('print-style');
      if (printStyle) {
        document.head.removeChild(printStyle);
      }
      document.querySelector('.dashboard-header-print')?.remove();
    } catch (error) {
      console.error('Error cleaning up after printing:', error);
    }
  }, 1500);
};

// Provide an empty function as a placeholder to fix the import error
export const printDashboardReport = () => {
  // Just call printDashboardPage instead
  printDashboardPage();
};