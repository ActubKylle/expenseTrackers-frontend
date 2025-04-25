import { format } from 'date-fns';

export const printDashboardPage = () => {
  window.print();
};

export const printDashboardReport = (summaryData, options) => {
  console.log('Printing dashboard report:', summaryData, options);
  // Implement PDF generation logic here if needed
};

export const printDashboard = (summaryData, timeFilter) => {
  const style = document.createElement('style');
  style.id = 'print-styles';
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
        left: 0;
        top: 0;
        width: 100%;
      }
      .MuiButton-root, .print-hide {
        display: none !important;
      }
      .print-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #1976d2;
      }
      .print-footer {
        margin-top: 20px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      @page {
        size: portrait;
        margin: 20mm;
      }
    }
  `;

  // Add print header
  const header = document.createElement('div');
  header.className = 'print-header';
  header.innerHTML = `
    <h1 style="margin: 0; font-size: 24px;">Financial Dashboard Report</h1>
    <p style="margin: 5px 0; color: #666;">
      Period: ${timeFilter}
      <br/>
      Generated on: ${format(new Date(), 'PPpp')}
    </p>
  `;

  // Add print footer
  const footer = document.createElement('div');
  footer.className = 'print-footer';
  footer.innerHTML = `
    <p>Generated from Expense Tracker Dashboard</p>
  `;

  const content = document.querySelector('.dashboard-content');
  if (content) {
    document.head.appendChild(style);
    content.insertBefore(header, content.firstChild);
    content.appendChild(footer);

    window.print();

    // Cleanup after printing
    setTimeout(() => {
      document.head.removeChild(style);
      content.removeChild(header);
      content.removeChild(footer);
    }, 100);
  }
};
