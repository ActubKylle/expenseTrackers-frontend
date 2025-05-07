import { format } from 'date-fns';

/**
 * Basic print function that triggers the browser's print dialog
 * with enhanced styling and watermark
 */
export const printDashboardPage = () => {
  // Create a temporary print-specific stylesheet
  const style = document.createElement('style');
  style.id = 'basic-print-styles';
  style.innerHTML = `
    @media print {
      @page {
        size: portrait;
        margin: 15mm;
      }
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
      .MuiButton-root, .print-hide, .MuiIconButton-root {
        display: none !important;
      }
      
      /* Watermark */
      .dashboard-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 100px;
        opacity: 0.1;
        color: #1976d2;
        pointer-events: none;
        z-index: 1000;
      }
    }
  `;
  
  // Create watermark
  const watermark = document.createElement('div');
  watermark.className = 'dashboard-watermark';
  watermark.textContent = 'EXPENSE TRACKER';
  
  document.head.appendChild(style);
  document.body.appendChild(watermark);
  
  window.print();
  
  // Cleanup
  setTimeout(() => {
    document.head.removeChild(style);
    document.body.removeChild(watermark);
  }, 100);
};

/**
 * Enhanced dashboard printing function with better styling, watermark and optimized layout
 * @param {Object} summaryData - The dashboard summary data object
 * @param {string} timeFilter - The currently applied time filter (e.g., "Current Month")
 * @param {Object} options - Print options
 */
export const printDashboard = (summaryData, timeFilter, options = {}) => {
  const {
    singlePage = false,
    watermarkText = 'EXPENSE TRACKER',
    showLogo = true,
    companyName = 'Expense Tracker'
  } = options;
  
  // Create a comprehensive print-specific stylesheet
  const style = document.createElement('style');
  style.id = 'enhanced-print-styles';
  style.innerHTML = `
    @media print {
      /* Reset visibility */
      body * {
        visibility: hidden;
      }
      .dashboard-content, .dashboard-content *,
      .print-content, .print-content * {
        visibility: visible;
      }
      
      /* Basic layout */
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background-color: white !important;
        color: black !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* Hide UI elements */
      .MuiButton-root, .print-hide, .MuiIconButton-root, button {
        display: none !important;
      }
      
      /* Additional print-specific elements */
      .print-header {
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 2px solid #1976d2;
        page-break-after: avoid;
      }
      
      .print-footer {
        margin-top: 20px;
        padding-top: 10px;
        border-top: 1px solid #ddd;
        text-align: center;
        font-size: 12px;
        color: #666;
        page-break-before: avoid;
      }
      
      /* Summary section */
      .print-summary {
        padding: 15px;
        background-color: #f8f9fa !important;
        border-radius: 4px;
        border: 1px solid #e9ecef;
        margin-bottom: 20px;
        page-break-after: avoid;
      }
      
      /* Page watermark */
      .print-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 8vw; /* Responsive size */
        opacity: 0.07;
        color: #1976d2;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }
      
      /* Improve card layout */
      .MuiPaper-root, .MuiCard-root {
        break-inside: avoid;
        page-break-inside: avoid;
        background-color: white !important;
        box-shadow: none !important;
        border: 1px solid #ddd !important;
      }
      
      /* Ensure text readability */
      .MuiTypography-root {
        color: black !important;
      }
      
      /* Ensure progress bars remain visible */
      .MuiLinearProgress-root {
        border: 1px solid #ddd !important;
        background-color: #f5f5f5 !important;
      }
      
      .MuiLinearProgress-bar {
        background-color: #1976d2 !important;
      }
      
      /* Grid layout fixes */
      .MuiGrid-container {
        display: flex !important;
        flex-wrap: wrap !important;
      }
      
      ${singlePage ? `
        /* Optimize for single page */
        .print-content {
          transform: scale(0.9);
          transform-origin: top center;
        }
        
        .MuiGrid-container {
          gap: 5px !important;
        }
        
        .MuiGrid-item {
          padding: 4px !important;
        }
        
        .MuiCardContent-root {
          padding: 8px !important;
        }
        
        .MuiTypography-h4 {
          font-size: 1.2rem !important;
        }
        
        .MuiTypography-h6 {
          font-size: 0.9rem !important;
        }
        
        .MuiTypography-body1, .MuiTypography-body2 {
          font-size: 0.8rem !important;
        }
      ` : `
        /* Standard multi-page layout */
        .MuiGrid-item {
          page-break-inside: avoid;
          padding: 8px !important;
        }
      `}
      
      /* Adjust specific components for print */
      .MuiGrid-item[xs="12"][lg="8"], 
      .MuiGrid-item[xs="12"]:not([lg]) {
        ${singlePage ? 'width: 100% !important;' : ''}
        page-break-before: auto;
      }
      
      /* Force colors to print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Page settings */
      @page {
        size: portrait;
        margin: ${singlePage ? '10mm' : '20mm'};
      }
      
      /* Page numbers */
      @page {
        @bottom-right {
          content: counter(page);
        }
      }
    }
  `;

  // Create a print container to wrap dashboard content
  const printContent = document.createElement('div');
  printContent.className = 'print-content';
  
  // Create watermark
  const watermark = document.createElement('div');
  watermark.className = 'print-watermark';
  watermark.textContent = watermarkText;
  
  // Create header with logo and title
  const header = document.createElement('div');
  header.className = 'print-header';
  header.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div>
        <h1 style="margin: 0; font-size: ${singlePage ? '18px' : '24px'}; color: #1976d2;">Financial Dashboard Report</h1>
        <p style="margin: 5px 0; color: #666; font-size: ${singlePage ? '10px' : '12px'};">
          Period: ${timeFilter}
          <br/>
          Generated on: ${format(new Date(), 'PPpp')}
        </p>
      </div>
      ${showLogo ? `
        <div style="font-size: ${singlePage ? '16px' : '18px'}; font-weight: bold; color: #1976d2;">
          ${companyName}
        </div>
      ` : ''}
    </div>
  `;

  // Create footer with pagination and copyright
  const footer = document.createElement('div');
  footer.className = 'print-footer';
  footer.innerHTML = `
    <p>Generated from Expense Tracker Dashboard</p>
    <p style="font-size: 10px; color: #999;">© ${new Date().getFullYear()} ${companyName} - Confidential and Proprietary</p>
  `;

  // Get the dashboard content element
  const dashboardContent = document.querySelector('.dashboard-content');
  if (dashboardContent) {
    // Create a clone of the dashboard content for print
    const contentClone = dashboardContent.cloneNode(true);
    
    // Apply styles and elements
    document.head.appendChild(style);
    document.body.appendChild(printContent);
    printContent.appendChild(watermark);
    printContent.appendChild(header);
    
    // Add summary section if we have data
    if (summaryData) {
      const summary = document.createElement('div');
      summary.className = 'print-summary';
      
      summary.innerHTML = `
        <h2 style="margin-top: 0; margin-bottom: 10px; font-size: ${singlePage ? '14px' : '18px'}; color: #1976d2;">Financial Overview</h2>
        <div style="display: flex; flex-wrap: wrap; ${singlePage ? 'gap: 10px' : 'gap: 20px'};">
          <div style="flex: 1; min-width: ${singlePage ? '150px' : '180px'};">
            <div style="font-size: ${singlePage ? '11px' : '14px'}; color: #666;">Total Expenses</div>
            <div style="font-size: ${singlePage ? '14px' : '18px'}; font-weight: bold;">₱${(summaryData.total_expenses || 0).toFixed(2)}</div>
          </div>
          <div style="flex: 1; min-width: ${singlePage ? '150px' : '180px'};">
            <div style="font-size: ${singlePage ? '11px' : '14px'}; color: #666;">Categories</div>
            <div style="font-size: ${singlePage ? '14px' : '18px'}; font-weight: bold;">${summaryData.expenses_by_category?.length || 0}</div>
          </div>
          <div style="flex: 1; min-width: ${singlePage ? '150px' : '180px'};">
            <div style="font-size: ${singlePage ? '11px' : '14px'}; color: #666;">Budget Items</div>
            <div style="font-size: ${singlePage ? '14px' : '18px'}; font-weight: bold;">${summaryData.budget_usage?.length || 0}</div>
          </div>
        </div>
      `;
      
      printContent.appendChild(summary);
    }
    
    // Remove any elements you don't want to print
    const buttons = contentClone.querySelectorAll('button, .MuiIconButton-root');
    buttons.forEach(button => button.parentNode?.removeChild(button));
    
    // Embed dashboard content after removing the header section
    const headerSection = contentClone.querySelector('[data-aos="fade-down"]');
    if (headerSection) headerSection.parentNode?.removeChild(headerSection);
    printContent.appendChild(contentClone);
    
    // Add footer at the end
    printContent.appendChild(footer);

    // Trigger print dialog
    window.print();

    // Cleanup after printing
    setTimeout(() => {
      document.head.removeChild(style);
      document.body.removeChild(printContent);
    }, 100);
  }
};

/**
 * Premium dashboard report printing with watermark, optimized layout and advanced formatting
 * @param {Object} summaryData - The dashboard summary data object
 * @param {Object} options - Options for the print format
 */
export const printDashboardReport = (summaryData, options = {}) => {
  const { 
    showLogo = true, 
    detailed = true, 
    showColors = true,
    showCharts = true,
    includeFooter = true,
    watermarkText = 'EXPENSE TRACKER',
    companyName = 'Expense Tracker',
    compactMode = false, // For fitting more on one page
    maxPages = 0, // 0 means no limit, otherwise attempt to fit in specified number of pages
    landscape = false,
    pageSize = 'a4' // 'a4', 'letter', etc.
  } = options;
  
  // Create a comprehensive print-specific stylesheet
  const style = document.createElement('style');
  style.id = 'report-print-styles';
  style.innerHTML = `
    @media print {
      /* Reset visibility */
      body * {
        visibility: hidden;
      }
      .print-container, .print-container * {
        visibility: visible;
      }
      
      /* Basic layout */
      .print-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background-color: white !important;
        color: black !important;
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
        padding: 0 !important;
        margin: 0 !important;
        ${maxPages > 0 ? `max-height: ${maxPages * 100}vh;` : ''}
        ${maxPages === 1 ? 'transform: scale(0.9); transform-origin: top center;' : ''}
      }
      
      /* Watermark */
      .print-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 8vw;
        opacity: 0.06;
        color: #1976d2;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }
      
      /* Report sections */
      .report-section {
        margin-bottom: ${compactMode ? '10px' : '20px'};
        padding: ${compactMode ? '10px' : '15px'};
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .report-section h2 {
        margin-top: 0;
        padding-bottom: ${compactMode ? '5px' : '10px'};
        border-bottom: 1px solid #e0e0e0;
        font-size: ${compactMode ? '14px' : '18px'};
        color: #1976d2;
      }
      
      /* Tables */
      .report-table {
        width: 100%;
        border-collapse: collapse;
        margin: ${compactMode ? '8px 0' : '15px 0'};
        font-size: ${compactMode ? '9px' : '11px'};
      }
      
      .report-table th {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        padding: ${compactMode ? '4px' : '8px'};
        text-align: left;
        font-weight: bold;
      }
      
      .report-table td {
        border: 1px solid #ddd;
        padding: ${compactMode ? '4px' : '8px'};
      }
      
      .report-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      /* Progress bars */
      .budget-progress-container {
        width: 100%;
        height: ${compactMode ? '15px' : '20px'};
        background-color: #f5f5f5;
        border-radius: ${compactMode ? '7px' : '10px'};
        overflow: hidden;
      }
      
      .budget-progress-bar {
        height: 100%;
        text-align: center;
        line-height: ${compactMode ? '15px' : '20px'};
        color: white;
        font-size: ${compactMode ? '9px' : '12px'};
        font-weight: bold;
      }
      
      /* Page header */
      .report-header {
        margin-bottom: ${compactMode ? '10px' : '20px'};
        padding-bottom: ${compactMode ? '5px' : '10px'};
        border-bottom: 2px solid #1976d2;
        page-break-after: avoid;
        break-after: avoid;
      }
      
      /* Footer */
      .report-footer {
        margin-top: ${compactMode ? '15px' : '30px'};
        padding-top: ${compactMode ? '5px' : '10px'};
        border-top: 1px solid #ddd;
        text-align: center;
        font-size: ${compactMode ? '8px' : '12px'};
        color: #666;
        page-break-before: avoid;
        break-before: avoid;
      }
      
      /* Custom data grid for compact display */
      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${compactMode ? '120px' : '180px'}, 1fr));
        gap: ${compactMode ? '8px' : '15px'};
        margin-bottom: ${compactMode ? '8px' : '15px'};
      }
      
      .data-grid-item {
        padding: ${compactMode ? '8px' : '12px'};
        background-color: #f5f5f5;
        border-radius: 4px;
        border-left: 3px solid #1976d2;
      }
      
      .data-grid-label {
        font-size: ${compactMode ? '9px' : '12px'};
        color: #666;
        margin-bottom: 3px;
      }
      
      .data-grid-value {
        font-size: ${compactMode ? '12px' : '16px'};
        font-weight: bold;
      }
      
      /* Page settings */
      @page {
        size: ${landscape ? 'landscape' : 'portrait'} ${pageSize};
        margin: ${compactMode ? '10mm' : '15mm'};
      }
      
      /* Page numbers */
      @page {
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          font-size: 9px;
          color: #999;
        }
      }
      
      /* Force colors to print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `;

  // Create a print container to hold our report
  const printContainer = document.createElement('div');
  printContainer.className = 'print-container';
  document.body.appendChild(printContainer);
  
  // Create watermark
  const watermark = document.createElement('div');
  watermark.className = 'print-watermark';
  watermark.textContent = watermarkText;
  printContainer.appendChild(watermark);

  // Format current date for display
  const currentDate = format(new Date(), 'MMMM dd, yyyy, h:mm a');
  const reportPeriod = options.period || 'Custom Period';

  // Create header
  const header = document.createElement('div');
  header.className = 'report-header';
  
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="margin: 0; font-size: ${compactMode ? '18px' : '24px'}; color: #1976d2;">Financial Dashboard Report</h1>
        <p style="margin: 5px 0; color: #666; font-size: ${compactMode ? '9px' : '12px'};">
          Period: ${reportPeriod}
          <br/>
          Generated on: ${currentDate}
        </p>
      </div>
      ${showLogo ? `
        <div style="text-align: right;">
          <div style="font-size: ${compactMode ? '16px' : '20px'}; font-weight: bold; color: #1976d2;">${companyName}</div>
          <div style="font-size: ${compactMode ? '8px' : '10px'}; color: #666;">Financial Analytics</div>
        </div>
      ` : ''}
    </div>
  `;
  
  printContainer.appendChild(header);

  // Create summary section
  if (summaryData) {
    const summary = document.createElement('div');
    summary.className = 'report-section';
    
    // Calculate some summary metrics
    const totalExpenses = summaryData.total_expenses || 0;
    const categoryCount = summaryData.expenses_by_category?.length || 0;
    const budgetCount = summaryData.budget_usage?.length || 0;
    
    // Find highest expense category
    let highestCategory = { name: 'None', total: 0 };
    if (summaryData.expenses_by_category && summaryData.expenses_by_category.length > 0) {
      highestCategory = summaryData.expenses_by_category.reduce(
        (max, cat) => (cat.total > max.total ? cat : max),
        summaryData.expenses_by_category[0]
      );
    }
    
    // Optimize display based on compact mode
    if (compactMode) {
      // More compact grid layout for summary data
      summary.innerHTML = `
        <h2>Financial Summary</h2>
        <div class="data-grid">
          <div class="data-grid-item">
            <div class="data-grid-label">Total Expenses</div>
            <div class="data-grid-value">₱${totalExpenses.toFixed(2)}</div>
          </div>
          <div class="data-grid-item">
            <div class="data-grid-label">Categories</div>
            <div class="data-grid-value">${categoryCount}</div>
          </div>
          <div class="data-grid-item">
            <div class="data-grid-label">Budget Items</div>
            <div class="data-grid-value">${budgetCount}</div>
          </div>
          <div class="data-grid-item">
            <div class="data-grid-label">Highest Category</div>
            <div class="data-grid-value">${highestCategory.category?.name || 'None'}</div>
          </div>
        </div>
      `;
    } else {
      // Standard layout
      summary.innerHTML = `
        <h2>Expense Summary</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 14px; color: #666;">Total Expenses</div>
            <div style="font-size: 18px; font-weight: bold;">₱${totalExpenses.toFixed(2)}</div>
          </div>
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 14px; color: #666;">Categories</div>
            <div style="font-size: 18px; font-weight: bold;">${categoryCount}</div>
          </div>
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 14px; color: #666;">Budget Items</div>
            <div style="font-size: 18px; font-weight: bold;">${budgetCount}</div>
          </div>
          <div style="flex: 1; min-width: 180px;">
            <div style="font-size: 14px; color: #666;">Highest Category</div>
            <div style="font-size: 18px; font-weight: bold;">${highestCategory.category?.name || 'None'}</div>
          </div>
        </div>
      `;
    }
    
    printContainer.appendChild(summary);
  }

  // Add category breakdown if detailed
  if (detailed && summaryData?.expenses_by_category?.length) {
    const categorySection = document.createElement('div');
    categorySection.className = 'report-section';
    
    // Calculate percentages for each category
    const categories = summaryData.expenses_by_category.map(cat => {
      const percentage = ((cat.total / summaryData.total_expenses) * 100).toFixed(1);
      return {
        ...cat,
        percentage
      };
    }).sort((a, b) => b.total - a.total); // Sort by highest expense first
    
    // Create table HTML
    let tableHtml = `
      <h2>Expense Categories</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount (₱)</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add rows for each category
    categories.forEach(cat => {
      tableHtml += `
        <tr>
          <td>${cat.category.name}</td>
          <td style="text-align: right;">₱${cat.total.toFixed(2)}</td>
          <td style="text-align: right;">${cat.percentage}%</td>
        </tr>
      `;
    });
    
    // Close table
    tableHtml += `
        </tbody>
      </table>
    `;
    
    categorySection.innerHTML = tableHtml;
    printContainer.appendChild(categorySection);
  }

  // Add budget section if we have budget data
  if (summaryData?.budget_usage?.length) {
    const budgetSection = document.createElement('div');
    budgetSection.className = 'report-section';
    
    // Create table HTML
    let tableHtml = `
      <h2>Budget Overview</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Budget (₱)</th>
            <th>Spent (₱)</th>
            <th>Remaining (₱)</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add rows for each budget item
    summaryData.budget_usage.forEach(budget => {
      const remaining = budget.budget - budget.spent;
      const remainingClass = remaining < 0 ? 'color: #f44336; font-weight: bold;' : '';
      
      // Determine progress bar color
      let barColor = '#4caf50'; // Green for normal
      if (budget.percentage > 100) {
        barColor = '#f44336'; // Red for over budget
      } else if (budget.percentage > 80) {
        barColor = '#ff9800'; // Orange for close to budget
      }
      
      tableHtml += `
        <tr>
          <td>${budget.category}</td>
          <td style="text-align: right;">₱${budget.budget.toFixed(2)}</td>
          <td style="text-align: right;">₱${budget.spent.toFixed(2)}</td>
          <td style="text-align: right; ${remainingClass}">₱${remaining.toFixed(2)}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="budget-progress-container">
                <div class="budget-progress-bar" style="width: ${Math.min(budget.percentage, 100)}%; background-color: ${barColor};">
                  ${budget.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    });
    
    // Close table
    tableHtml += `
        </tbody>
      </table>
    `;
    
    budgetSection.innerHTML = tableHtml;
    printContainer.appendChild(budgetSection);
  }

  // Add monthly trends if available and detailed is enabled
  if (detailed && summaryData?.trends?.length) {
    const trendsSection = document.createElement('div');
    trendsSection.className = 'report-section';
    
    // Create table HTML
    let tableHtml = `
      <h2>Monthly Trends</h2>
      <table class="report-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Total (₱)</th>
            <th>Change from Previous</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add rows for each month
    summaryData.trends.forEach((trend, index, arr) => {
      let change = 'N/A';
      let changeClass = '';
      
      if (index < arr.length - 1) {
        const previousTotal = arr[index + 1].total;
        const changePercent = ((trend.total - previousTotal) / previousTotal * 100).toFixed(1);
        const sign = changePercent > 0 ? '+' : '';
        change = `${sign}${changePercent}%`;
        
        // Add color coding
        if (parseFloat(changePercent) > 0) {
          changeClass = 'color: #f44336;'; // Increase is red (bad for expenses)
        } else if (parseFloat(changePercent) < 0) {
          changeClass = 'color: #4caf50;'; // Decrease is green (good for expenses)
        }
      }
      
      tableHtml += `
        <tr>
          <td>${trend.period}</td>
          <td style="text-align: right;">₱${trend.total.toFixed(2)}</td>
          <td style="text-align: right; ${changeClass}">${change}</td>
        </tr>
      `;
    });
    
    // Close table
    tableHtml += `
        </tbody>
      </table>
    `;
    
    trendsSection.innerHTML = tableHtml;
    printContainer.appendChild(trendsSection);
  }

  // Add insights and recommendations section
  if (detailed && summaryData) {
    const insightsSection = document.createElement('div');
    insightsSection.className = 'report-section';
    
    // Generate some basic insights based on the data
    let insightsHtml = `<h2>Insights & Recommendations</h2>`;
    
    // Top expense categories insight
    if (summaryData.expenses_by_category && summaryData.expenses_by_category.length > 0) {
      // Get top 3 categories
      const topCategories = [...summaryData.expenses_by_category]
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
      
      const topCategoryPercentage = ((topCategories[0].total / summaryData.total_expenses) * 100).toFixed(1);
      
      insightsHtml += `
        <div style="margin-bottom: 15px;">
          <p style="font-weight: bold; margin-bottom: 5px;">Top Spending Categories:</p>
          <p>Your highest expense category is <strong>${topCategories[0].category.name}</strong>, accounting for <strong>${topCategoryPercentage}%</strong> of total expenses.</p>
          <ul style="margin-top: 5px; margin-bottom: 5px; padding-left: 20px;">
      `;
      
      // Add insights for top 3 categories
      topCategories.forEach(cat => {
        const percentage = ((cat.total / summaryData.total_expenses) * 100).toFixed(1);
        insightsHtml += `<li><strong>${cat.category.name}:</strong> ₱${cat.total.toFixed(2)} (${percentage}%)</li>`;
      });
      
      insightsHtml += `
          </ul>
          <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Consider reviewing your ${topCategories[0].category.name} expenses for potential savings opportunities.</p>
        </div>
      `;
    }
    
    // Budget insights
    if (summaryData.budget_usage && summaryData.budget_usage.length > 0) {
      // Find over-budget categories
      const overBudgetItems = summaryData.budget_usage.filter(item => item.percentage > 100);
      const nearBudgetItems = summaryData.budget_usage.filter(item => item.percentage > 80 && item.percentage <= 100);
      
      if (overBudgetItems.length > 0) {
        insightsHtml += `
          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Budget Alerts:</p>
            <p>You have <strong>${overBudgetItems.length}</strong> ${overBudgetItems.length === 1 ? 'category' : 'categories'} that exceeded budget limits:</p>
            <ul style="margin-top: 5px; margin-bottom: 5px; padding-left: 20px;">
        `;
        
        overBudgetItems.forEach(item => {
          const overage = item.spent - item.budget;
          insightsHtml += `
            <li><strong>${item.category}:</strong> Over budget by ₱${overage.toFixed(2)} (${item.percentage.toFixed(0)}% of budget)</li>
          `;
        });
        
        insightsHtml += `
            </ul>
            <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Review these categories and adjust your spending habits or increase budget allocations if necessary.</p>
          </div>
        `;
      }
      
      if (nearBudgetItems.length > 0) {
        insightsHtml += `
          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Budget Warnings:</p>
            <p>You have <strong>${nearBudgetItems.length}</strong> ${nearBudgetItems.length === 1 ? 'category' : 'categories'} approaching budget limits (>80%):</p>
            <ul style="margin-top: 5px; margin-bottom: 5px; padding-left: 20px;">
        `;
        
        nearBudgetItems.forEach(item => {
          const remaining = item.budget - item.spent;
          insightsHtml += `
            <li><strong>${item.category}:</strong> ₱${remaining.toFixed(2)} remaining (${item.percentage.toFixed(0)}% used)</li>
          `;
        });
        
        insightsHtml += `
            </ul>
            <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Monitor these categories closely for the remainder of the period.</p>
          </div>
        `;
      }
    }
    
    // Trends insights
    if (summaryData.trends && summaryData.trends.length >= 3) {
      const recentTrends = summaryData.trends.slice(0, 3);
      const latestMonth = recentTrends[0];
      const previousMonth = recentTrends[1];
      
      if (latestMonth && previousMonth) {
        const changePercent = ((latestMonth.total - previousMonth.total) / previousMonth.total * 100).toFixed(1);
        const direction = parseFloat(changePercent) > 0 ? 'increased' : 'decreased';
        const changeText = `${Math.abs(parseFloat(changePercent))}%`;
        
        insightsHtml += `
          <div style="margin-bottom: 15px;">
            <p style="font-weight: bold; margin-bottom: 5px;">Spending Trends:</p>
            <p>Your expenses have <strong>${direction} by ${changeText}</strong> compared to the previous month.</p>
        `;
        
        if (parseFloat(changePercent) > 10) {
          insightsHtml += `
            <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Investigate the significant increase in spending. Review your expense categories to identify the main contributors to this change.</p>
          `;
        } else if (parseFloat(changePercent) < -10) {
          insightsHtml += `
            <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Great job reducing expenses! Continue the positive trend by maintaining your current spending habits.</p>
          `;
        } else {
          insightsHtml += `
            <p style="font-style: italic; color: #555; margin-top: 5px;">Recommendation: Your spending is relatively stable. Continue monitoring your expenses to maintain financial control.</p>
          `;
        }
        
        insightsHtml += `</div>`;
      }
    }
    
    insightsSection.innerHTML = insightsHtml;
    printContainer.appendChild(insightsSection);
  }

  // Add footer if enabled
  if (includeFooter) {
    const footer = document.createElement('div');
    footer.className = 'report-footer';
    footer.innerHTML = `
      <p style="margin-bottom: 5px;">This report is generated automatically and is intended for informational purposes only.</p>
      <p style="margin-bottom: 5px;">© ${new Date().getFullYear()} ${companyName} | Confidential and Proprietary</p>
      <div style="font-size: 8px; color: #999; margin-top: 5px;">Report ID: ${Date.now().toString(36).toUpperCase()}</div>
    `;
    printContainer.appendChild(footer);
  }

  // Apply the styles and trigger print
  document.head.appendChild(style);
  window.print();

  // Cleanup after printing
  setTimeout(() => {
    document.head.removeChild(style);
    document.body.removeChild(printContainer);
  }, 500);
};

/**
 * Enhanced PDF export with more styling and watermark
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 * @param {string} exportType - 'detailed' or 'summary'
 */
export const exportDashboardAsPDF = (summaryData, timeFilterTitle, exportType = 'detailed') => {
  // Configure print options based on export type
  const options = {
    period: timeFilterTitle,
    detailed: exportType === 'detailed',
    showLogo: true,
    watermarkText: 'EXPENSE TRACKER',
    compactMode: exportType !== 'detailed',
    maxPages: exportType === 'detailed' ? 0 : 1 // Limit to one page for summary
  };
  
  // Use our enhanced print function
  printDashboardReport(summaryData, options);
  
  return true;
};

/**
 * Enhanced PDF export with charts and watermark
 * Customized to fit everything on 1-2 pages with nice layout
 */
export const exportDashboardWithCharts = async (summaryData, timeFilterTitle, chartRefs = {}) => {
  // Configure print options for a nice layout with charts
  const options = {
    period: timeFilterTitle,
    detailed: true,
    showLogo: true,
    watermarkText: 'EXPENSE TRACKER',
    compactMode: true,
    showCharts: true,
    landscape: true // Better for charts
  };
  
  // Use our enhanced print function
  printDashboardReport(summaryData, options);
  
  return true;
};

/**
 * Export dashboard data as CSV
 * This is a placeholder - would need to be implemented with actual CSV generation
 */
export const exportDashboardAsCSV = (summaryData, timeFilterTitle) => {
  // Alert user that we're using print instead of CSV
  alert('CSV export functionality is not available. Using print instead.');
  
  // Use compact print mode as an alternative
  printDashboardReport(summaryData, {
    period: timeFilterTitle,
    detailed: true,
    compactMode: true,
    maxPages: 1
  });
  
  return true;
};

/**
 * Export dashboard data as Excel
 * This is a placeholder - would need to be implemented with actual Excel generation
 */
export const exportDashboardAsExcel = async (summaryData, timeFilterTitle) => {
  // Alert user that we're using print instead of Excel
  alert('Excel export functionality is not available. Using print instead.');
  
  // Use landscape print mode as an alternative
  printDashboardReport(summaryData, {
    period: timeFilterTitle,
    detailed: true,
    landscape: true,
    compactMode: true
  });
  
  return true;
};

/**
 * Apply watermark to any element
 * Helper function that can be used to add watermarks to other parts of the app
 * @param {HTMLElement} element - The element to add a watermark to
 * @param {string} text - The watermark text
 * @param {Object} options - Watermark options
 */
export const applyWatermark = (element, text = 'CONFIDENTIAL', options = {}) => {
  const {
    opacity = 0.1,
    color = '#1976d2',
    angle = -45,
    fontSize = '8vw',
    zIndex = 0
  } = options;
  
  // Create watermark element
  const watermark = document.createElement('div');
  watermark.className = 'element-watermark';
  watermark.textContent = text;
  
  // Style the watermark
  watermark.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(${angle}deg);
    font-size: ${fontSize};
    opacity: ${opacity};
    color: ${color};
    pointer-events: none;
    z-index: ${zIndex};
    white-space: nowrap;
    text-align: center;
    width: 100%;
    font-weight: bold;
    user-select: none;
  `;
  
  // Make sure target element has position relative for proper placement
  if (window.getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  
  // Add watermark to element
  element.appendChild(watermark);
  
  // Return a cleanup function
  return () => {
    if (element.contains(watermark)) {
      element.removeChild(watermark);
    }
  };
};

