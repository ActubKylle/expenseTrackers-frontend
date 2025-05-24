import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Enhanced dashboard printing utility with professional styling, watermark and optimized layout
 * This function handles both print and PDF export with consistent styling
 * 
 * @param {Object} summaryData - The dashboard summary data object
 * @param {string} timeFilter - The currently applied time filter (e.g., "Current Month")
 * @param {Object} options - Print/export options
 * @param {boolean} options.isPdf - Whether to export as PDF (true) or print (false)
 * @returns {Promise<boolean>} - Operation success status
 */
export const enhancedDashboardPrintExport = async (summaryData, timeFilter, options = {}) => {
  const {
    isPdf = false,
    detailed = true,
    singlePage = false,
    watermarkText = 'EXPENSE TRACKER',
    showLogo = true,
    companyName = 'Expense Tracker',
    compactMode = false,
    maxPages = 0,
    landscape = false,
    themeColor = '#1976d2',
    secondaryColor = '#64b5f6',
    includeCharts = true,
    includeFooter = true,
    footerText = 'Confidential and Proprietary',
    paperSize = 'a4', // 'a4', 'letter', etc.
    pdfFileName = 'Financial_Dashboard_Report.pdf'
  } = options;

  // Create a comprehensive print-specific stylesheet
  const style = document.createElement('style');
  style.id = 'enhanced-print-export-styles';
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
        ${maxPages === 1 ? 'transform: scale(0.95); transform-origin: top center;' : ''}
      }
      
      /* Watermark */
      .print-watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 8vw;
        opacity: 0.05;
        color: ${themeColor};
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
      }
      
      /* Report sections */
      .report-section {
        margin-bottom: ${compactMode ? '15px' : '25px'};
        padding: ${compactMode ? '15px' : '20px'};
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        page-break-inside: avoid;
        break-inside: avoid;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .report-section h2 {
        margin-top: 0;
        padding-bottom: ${compactMode ? '8px' : '12px'};
        border-bottom: 2px solid ${secondaryColor};
        font-size: ${compactMode ? '16px' : '20px'};
        color: ${themeColor};
        font-weight: 600;
      }
      
      /* Dashboard cards */
      .dashboard-card {
        border-radius: 12px;
        padding: ${compactMode ? '15px' : '20px'};
        margin-bottom: 15px;
        border-left: 4px solid;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        background: white;
      }
      
      .dashboard-card.card-expenses {
        border-left-color: #FF5F7E;
      }
      
      .dashboard-card.card-average {
        border-left-color: #5F8FFF;
      }
      
      .dashboard-card.card-highest {
        border-left-color: #FC7B4D;
      }
      
      .dashboard-card.card-categories {
        border-left-color: #64DFBD;
      }
      
      /* Tables */
      .report-table {
        width: 100%;
        border-collapse: collapse;
        margin: ${compactMode ? '10px 0' : '15px 0'};
        font-size: ${compactMode ? '11px' : '12px'};
      }
      
      .report-table th {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        padding: ${compactMode ? '6px 8px' : '8px 12px'};
        text-align: left;
        font-weight: 600;
        color: #333;
      }
      
      .report-table td {
        border: 1px solid #ddd;
        padding: ${compactMode ? '6px 8px' : '8px 12px'};
      }
      
      .report-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      
      /* Charts container */
      .charts-container {
        display: flex;
        flex-direction: ${compactMode ? 'column' : 'row'};
        gap: 20px;
        margin: 20px 0;
      }
      
      .chart-wrapper {
        flex: 1;
        min-height: ${compactMode ? '200px' : '300px'};
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 15px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      
      /* Progress bars */
      .budget-progress-container {
        width: 100%;
        height: ${compactMode ? '18px' : '22px'};
        background-color: #f5f5f5;
        border-radius: ${compactMode ? '9px' : '11px'};
        overflow: hidden;
        margin: 6px 0;
      }
      
      .budget-progress-bar {
        height: 100%;
        text-align: center;
        line-height: ${compactMode ? '18px' : '22px'};
        color: white;
        font-size: ${compactMode ? '10px' : '12px'};
        font-weight: 600;
      }
      
      .budget-progress-bar.under {
        background-color: #4caf50;
      }
      
      .budget-progress-bar.near {
        background-color: #ff9800;
      }
      
      .budget-progress-bar.over {
        background-color: #f44336;
      }
      
      /* Budget item */
      .budget-item {
        margin-bottom: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
      }
      
      /* Page header */
      .report-header {
        margin-bottom: ${compactMode ? '15px' : '25px'};
        padding-bottom: ${compactMode ? '10px' : '15px'};
        border-bottom: 3px solid ${themeColor};
        page-break-after: avoid;
        break-after: avoid;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      /* Logo */
      .report-logo {
        font-size: 24px;
        font-weight: 700;
        color: ${themeColor};
        letter-spacing: 0.5px;
      }
      
      /* Footer */
      .report-footer {
        margin-top: ${compactMode ? '25px' : '40px'};
        padding-top: ${compactMode ? '10px' : '15px'};
        border-top: 1px solid #ddd;
        text-align: center;
        font-size: ${compactMode ? '9px' : '11px'};
        color: #666;
        page-break-before: avoid;
        break-before: avoid;
      }
      
      /* Summary cards layout */
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }
      
      @media (max-width: 600px) {
        .summary-cards {
          grid-template-columns: 1fr;
        }
      }
      
      /* Data grid for compact display */
      .data-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(${compactMode ? '150px' : '200px'}, 1fr));
        gap: ${compactMode ? '10px' : '15px'};
        margin-bottom: ${compactMode ? '10px' : '15px'};
      }
      
      .data-grid-item {
        padding: ${compactMode ? '10px' : '15px'};
        background-color: #f5f5f5;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      .data-grid-label {
        font-size: ${compactMode ? '10px' : '12px'};
        color: #666;
        margin-bottom: 5px;
      }
      
      .data-grid-value {
        font-size: ${compactMode ? '14px' : '18px'};
        font-weight: 600;
      }
      
      /* Category breakdown */
      .category-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
      }
      
      .category-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
      }
      
      /* Insights box */
      .insights-box {
        background-color: #f8f9fa;
        border-left: 4px solid ${themeColor};
        padding: 15px;
        margin: 15px 0;
        border-radius: 8px;
      }
      
      .insights-title {
        font-weight: 600;
        color: ${themeColor};
        margin-bottom: 8px;
      }
      
      /* Page settings */
      @page {
        size: ${landscape ? 'landscape' : 'portrait'} ${paperSize};
        margin: ${compactMode ? '12mm' : '15mm'};
      }
      
      /* Page numbers */
      @page {
        @bottom-right {
          content: "Page " counter(page) " of " counter(pages);
          font-size: 9px;
          color: #999;
        }
      }
      
      /* Hide buttons and irrelevant UI */
      button, .MuiButton-root, .MuiIconButton-root, .print-hide, .MuiInputBase-root {
        display: none !important;
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
  const reportPeriod = typeof timeFilter === 'string' ? timeFilter : 'Custom Period';

  // Create header with logo and title
  const header = document.createElement('div');
  header.className = 'report-header';
  
  header.innerHTML = `
    <div>
      <h1 style="margin: 0; font-size: ${compactMode ? '20px' : '24px'}; color: ${themeColor};">Financial Dashboard Report</h1>
      <p style="margin: 5px 0; color: #666; font-size: ${compactMode ? '10px' : '12px'};">
        Period: ${reportPeriod}
        <br/>
        Generated on: ${currentDate}
      </p>
    </div>
    ${showLogo ? `
      <div class="report-logo">
        ${companyName}
      </div>
    ` : ''}
  `;
  
  printContainer.appendChild(header);

  // Create a summary section with key metrics
  if (summaryData) {
    const summarySection = document.createElement('div');
    summarySection.className = 'report-section';
    
    // Calculate some summary metrics
    const totalExpenses = summaryData.total_expenses || 0;
    const categoryCount = summaryData.expenses_by_category?.length || 0;
    const budgetCount = summaryData.budget_usage?.length || 0;
    
    // Find highest expense category
    let highestCategory = { category: { name: 'None', color: '#cccccc' }, total: 0 };
    if (summaryData.expenses_by_category && summaryData.expenses_by_category.length > 0) {
      highestCategory = summaryData.expenses_by_category.reduce(
        (max, cat) => (cat.total > max.total ? cat : max),
        summaryData.expenses_by_category[0]
      );
    }
    
    // Calculate average monthly expense if we have trends
    let averageMonthly = 0;
    if (summaryData.trends && summaryData.trends.length > 0) {
      averageMonthly = summaryData.trends.reduce((sum, month) => sum + month.total, 0) / summaryData.trends.length;
    } else {
      averageMonthly = totalExpenses;
    }
    
    // Calculate month over month change if available
    let monthlyChange = 0;
    let monthlyChangeText = 'N/A';
    if (summaryData.trends && summaryData.trends.length >= 2) {
      const currentMonth = summaryData.trends[0].total;
      const previousMonth = summaryData.trends[1].total;
      monthlyChange = ((currentMonth - previousMonth) / previousMonth) * 100;
      monthlyChangeText = `${monthlyChange > 0 ? '+' : ''}${monthlyChange.toFixed(1)}%`;
    }
    
    // Create stylish summary cards
    summarySection.innerHTML = `
      <h2>Financial Summary</h2>
      <div class="summary-cards">
        <div class="dashboard-card card-expenses">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="color: #666; font-size: ${compactMode ? '10px' : '12px'}; margin-bottom: 4px;">Total Expenses</div>
              <div style="font-size: ${compactMode ? '18px' : '22px'}; font-weight: 600;">₱${totalExpenses.toFixed(2)}</div>
              ${monthlyChange !== 0 ? `
                <div style="font-size: 10px; color: ${monthlyChange > 0 ? '#f44336' : '#4caf50'}; margin-top: 4px;">
                  ${monthlyChange > 0 ? '▲' : '▼'} ${monthlyChangeText} vs previous period
                </div>
              ` : ''}
            </div>
            <div style="background-color: rgba(255, 95, 126, 0.1); color: #FF5F7E; padding: 8px; border-radius: 8px; height: fit-content;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="dashboard-card card-average">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="color: #666; font-size: ${compactMode ? '10px' : '12px'}; margin-bottom: 4px;">Average Monthly</div>
              <div style="font-size: ${compactMode ? '18px' : '22px'}; font-weight: 600;">₱${averageMonthly.toFixed(2)}</div>
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                ${summaryData.trends?.length || 1} month(s) data
              </div>
            </div>
            <div style="background-color: rgba(95, 143, 255, 0.1); color: #5F8FFF; padding: 8px; border-radius: 8px; height: fit-content;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="dashboard-card card-highest">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="color: #666; font-size: ${compactMode ? '10px' : '12px'}; margin-bottom: 4px;">Highest Category</div>
              <div style="font-size: ${compactMode ? '18px' : '22px'}; font-weight: 600;">₱${highestCategory.total.toFixed(2)}</div>
              <div style="font-size: 10px; color: #666; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px;">
                ${highestCategory.category.name}
              </div>
            </div>
            <div style="background-color: rgba(252, 123, 77, 0.1); color: #FC7B4D; padding: 8px; border-radius: 8px; height: fit-content;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="dashboard-card card-categories">
          <div style="display: flex; justify-content: space-between;">
            <div>
              <div style="color: #666; font-size: ${compactMode ? '10px' : '12px'}; margin-bottom: 4px;">Active Categories</div>
              <div style="font-size: ${compactMode ? '18px' : '22px'}; font-weight: 600;">${categoryCount}</div>
              <div style="font-size: 10px; color: #666; margin-top: 4px;">
                ${budgetCount} with budget
              </div>
            </div>
            <div style="background-color: rgba(100, 223, 189, 0.1); color: #64DFBD; padding: 8px; border-radius: 8px; height: fit-content;">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;
    
    printContainer.appendChild(summarySection);
  }

  // Add expense distribution section with category breakdown
  if (summaryData?.expenses_by_category?.length > 0) {
    const categorySection = document.createElement('div');
    categorySection.className = 'report-section';
    
    // Start building the HTML content for the section
    let categoryContent = `<h2>Expense Distribution</h2>`;
    
    // Add category breakdown table
    categoryContent += `<table class="report-table">
      <thead>
        <tr>
          <th>Category</th>
          <th style="text-align: right;">Amount (₱)</th>
          <th style="text-align: right;">Percentage</th>
        </tr>
      </thead>
      <tbody>
    `;
    
    // Sort categories by highest amount first
    const sortedCategories = [...summaryData.expenses_by_category].sort((a, b) => b.total - a.total);
    
    // Add category rows
    sortedCategories.forEach(category => {
      const percentage = ((category.total / summaryData.total_expenses) * 100).toFixed(1);
      
      categoryContent += `
        <tr>
          <td>
            <div style="display: flex; align-items: center;">
              <span class="category-color" style="background-color: ${category.category.color};"></span>
              ${category.category.name}
            </div>
          </td>
          <td style="text-align: right;">₱${category.total.toFixed(2)}</td>
          <td style="text-align: right;">${percentage}%</td>
        </tr>
      `;
    });
    
    categoryContent += `</tbody></table>`;
    
    // Add pie chart placeholder if we're including charts
    if (includeCharts) {
      categoryContent += `
        <div style="margin-top: 15px; text-align: center;">
          <div style="font-weight: 600; margin-bottom: 10px; color: #555;">Category Distribution Chart</div>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 8px;">
            [Pie Chart - Will be captured from dashboard before printing]
          </div>
        </div>
      `;
    }
    
    categorySection.innerHTML = categoryContent;
    printContainer.appendChild(categorySection);
  }

  // Add monthly trends section
  if (summaryData?.trends?.length > 0) {
    const trendsSection = document.createElement('div');
    trendsSection.className = 'report-section';
    
    // Start building the HTML content for the section
    let trendsContent = `<h2>Monthly Spending Analysis</h2>`;
    
    // Add monthly trends table
    trendsContent += `<table class="report-table">
      <thead>
        <tr>
          <th>Month</th>
          <th style="text-align: right;">Amount (₱)</th>
          <th style="text-align: right;">Change</th>
        </tr>
      </thead>
      <tbody>
    `;
    
    // Calculate month-over-month changes
    summaryData.trends.forEach((month, index) => {
      const previousMonth = index < summaryData.trends.length - 1 ? summaryData.trends[index + 1] : null;
      let changeText = 'N/A';
      let changeClass = '';
      
      if (previousMonth) {
        const changePercent = ((month.total - previousMonth.total) / previousMonth.total * 100).toFixed(1);
        const changeDirection = parseFloat(changePercent) > 0 ? '+' : '';
        changeText = `${changeDirection}${changePercent}%`;
        
        if (parseFloat(changePercent) > 0) {
          changeClass = 'color: #f44336;'; // Red for expense increase
        } else if (parseFloat(changePercent) < 0) {
          changeClass = 'color: #4caf50;'; // Green for expense decrease
        }
      }
      
      trendsContent += `
        <tr>
          <td>${month.period}</td>
          <td style="text-align: right;">₱${month.total.toFixed(2)}</td>
          <td style="text-align: right; ${changeClass}">${changeText}</td>
        </tr>
      `;
    });
    
    trendsContent += `</tbody></table>`;
    
    // Add line chart placeholder if we're including charts
    if (includeCharts) {
      trendsContent += `
        <div style="margin-top: 15px; text-align: center;">
          <div style="font-weight: 600; margin-bottom: 10px; color: #555;">Monthly Expense Trend</div>
          <div style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; border-radius: 8px;">
            [Line Chart - Will be captured from dashboard before printing]
          </div>
        </div>
      `;
    }
    
    // Add insights about spending trends
    if (summaryData.trends.length >= 3) {
      // Calculate overall trend
      const firstMonth = summaryData.trends[summaryData.trends.length - 1];
      const lastMonth = summaryData.trends[0];
      const overallChange = ((lastMonth.total - firstMonth.total) / firstMonth.total * 100).toFixed(1);
      const trendDirection = parseFloat(overallChange) > 0 ? 'increasing' : 'decreasing';
      const trendIcon = parseFloat(overallChange) > 0 ? '▲' : '▼';
      const trendColor = parseFloat(overallChange) > 0 ? '#f44336' : '#4caf50';
      
      trendsContent += `
        <div class="insights-box">
          <div class="insights-title">Spending Trend Analysis</div>
          <p style="margin: 5px 0;">
            Your overall spending trend is <strong style="color: ${trendColor};">${trendDirection} ${trendIcon} ${Math.abs(parseFloat(overallChange))}%</strong> 
            over the past ${summaryData.trends.length} months.
          </p>
      `;
      
      // Add appropriate advice based on trend
      if (parseFloat(overallChange) > 10) {
        trendsContent += `
          <p style="margin: 5px 0; font-style: italic; color: #555;">
            <strong>Recommendation:</strong> Review your largest expense categories to identify potential areas for spending reduction.
          </p>
        `;
      } else if (parseFloat(overallChange) < -10) {
        trendsContent += `
          <p style="margin: 5px 0; font-style: italic; color: #555;">
            <strong>Recommendation:</strong> Continue your successful expense reduction strategies. Consider setting savings goals for the money you're saving.
          </p>
        `;
      } else {
        trendsContent += `
          <p style="margin: 5px 0; font-style: italic; color: #555;">
            <strong>Recommendation:</strong> Your spending is relatively stable. Continue monitoring expenses and look for small optimization opportunities.
          </p>
        `;
      }
      
      trendsContent += `</div>`;
    }
    
    trendsSection.innerHTML = trendsContent;
    printContainer.appendChild(trendsSection);
  }

  // Add budget section
  if (summaryData?.budget_usage?.length > 0) {
    const budgetSection = document.createElement('div');
    budgetSection.className = 'report-section';
    
    // Start building the HTML content for the section
    let budgetContent = `<h2>Budget Overview</h2>`;
    
    // Add budget usage legend
    budgetContent += `
      <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background-color: #ff9800;"></span>
          <span>Near Limit (>80%)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 2px; background-color: #f44336;"></span>
          <span>Over Budget</span>
        </div>
      </div>
    `;
    
    // Add budget items
    budgetContent += `<div style="margin-top: 15px;">`;
    
    summaryData.budget_usage.forEach(budget => {
      // Determine progress bar color based on percentage
      let progressClass = 'under';
      if (budget.percentage > 100) {
        progressClass = 'over';
      } else if (budget.percentage > 80) {
        progressClass = 'near';
      }
      
      // Add a budget item
      budgetContent += `
        <div class="budget-item">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <div style="font-weight: 500;">${budget.category}</div>
            <div>₱${budget.spent.toFixed(2)} / ₱${budget.budget.toFixed(2)}</div>
          </div>
          <div class="budget-progress-container">
            <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(budget.percentage, 100)}%;">
              ${budget.percentage.toFixed(0)}%
            </div>
          </div>
        </div>
      `;
    });
    
    budgetContent += `</div>`;
    
    // Add insights about budget performance
    const overBudgetItems = summaryData.budget_usage.filter(item => item.percentage > 100);
    const nearBudgetItems = summaryData.budget_usage.filter(item => item.percentage > 80 && item.percentage <= 100);
    
    if (overBudgetItems.length > 0 || nearBudgetItems.length > 0) {
      budgetContent += `
        <div class="insights-box">
          <div class="insights-title">Budget Insights</div>
      `;
      
      if (overBudgetItems.length > 0) {
        budgetContent += `
          <p style="margin: 5px 0;">
            <strong>Warning:</strong> ${overBudgetItems.length} ${overBudgetItems.length === 1 ? 'category has' : 'categories have'} 
            exceeded budget limits.
          </p>
          <ul style="margin-top: 5px; margin-bottom: 10px; padding-left: 20px;">
        `;
        
        overBudgetItems.forEach(item => {
          const overage = item.spent - item.budget;
          budgetContent += `
            <li><strong>${item.category}:</strong> Over by ₱${overage.toFixed(2)} (${item.percentage.toFixed(0)}% of budget)</li>
          `;
        });
        
        budgetContent += `</ul>`;
      }
      
      if (nearBudgetItems.length > 0) {
        budgetContent += `
          <p style="margin: 5px 0;">
            <strong>Caution:</strong> ${nearBudgetItems.length} ${nearBudgetItems.length === 1 ? 'category is' : 'categories are'} 
            approaching budget limits (>80%).
          </p>
        `;
      }
      
      budgetContent += `
        <p style="margin: 5px 0; font-style: italic; color: #555;">
          <strong>Recommendation:</strong> Review ${overBudgetItems.length > 0 ? 'over-budget' : 'near-limit'} categories 
          and adjust spending habits or modify budget allocations if necessary.
        </p>
      </div>
      `;
    }
    
    budgetSection.innerHTML = budgetContent;
    printContainer.appendChild(budgetSection);
  }
  
  // Add insights and recommendations section if detailed report is requested
  if (detailed && summaryData) {
    const insightsSection = document.createElement('div');
    insightsSection.className = 'report-section';
    
    // Generate some actionable insights based on the data
    let insightsContent = `<h2>Financial Insights & Recommendations</h2>`;
    
    // Identify top spending categories
    if (summaryData.expenses_by_category && summaryData.expenses_by_category.length > 0) {
      // Get top 3 categories
      const topCategories = [...summaryData.expenses_by_category]
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
      
      const topCategoryPercentage = ((topCategories[0].total / summaryData.total_expenses) * 100).toFixed(1);
      
      insightsContent += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: ${themeColor}; margin-bottom: 8px;">Top Spending Categories</h3>
          <p>Your highest expense category is <strong>${topCategories[0].category.name}</strong>, accounting for <strong>${topCategoryPercentage}%</strong> of total expenses.</p>
          
          <div style="margin: 10px 0;">
            <table class="report-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style="text-align: right;">Amount (₱)</th>
                  <th style="text-align: right;">% of Total</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      // Add rows for top 3 categories
      topCategories.forEach(cat => {
        const percentage = ((cat.total / summaryData.total_expenses) * 100).toFixed(1);
        insightsContent += `
          <tr>
            <td>
              <div style="display: flex; align-items: center;">
                <span class="category-color" style="background-color: ${cat.category.color};"></span>
                ${cat.category.name}
              </div>
            </td>
            <td style="text-align: right;">₱${cat.total.toFixed(2)}</td>
            <td style="text-align: right;">${percentage}%</td>
          </tr>
        `;
      });
      
      insightsContent += `
              </tbody>
            </table>
          </div>
          
          <div style="font-style: italic; color: #555; margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Recommendation:</strong> Consider reviewing your ${topCategories[0].category.name} expenses for potential savings opportunities.
            ${topCategoryPercentage > 30 ? ' This category represents a significant portion of your total expenses.' : ''}
          </div>
        </div>
      `;
    }
    
    // Add budget-to-spending relationship analysis
    if (summaryData.budget_usage && summaryData.budget_usage.length > 0) {
      const totalBudget = summaryData.budget_usage.reduce((sum, item) => sum + item.budget, 0);
      const totalSpent = summaryData.budget_usage.reduce((sum, item) => sum + item.spent, 0);
      const overallUsage = (totalSpent / totalBudget) * 100;
      
      insightsContent += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: ${themeColor}; margin-bottom: 8px;">Overall Budget Performance</h3>
          <div class="data-grid">
            <div class="data-grid-item">
              <div class="data-grid-label">Total Budget</div>
              <div class="data-grid-value">₱${totalBudget.toFixed(2)}</div>
            </div>
            <div class="data-grid-item">
              <div class="data-grid-label">Total Spent</div>
              <div class="data-grid-value">₱${totalSpent.toFixed(2)}</div>
            </div>
            <div class="data-grid-item">
              <div class="data-grid-label">Usage</div>
              <div class="data-grid-value">${overallUsage.toFixed(1)}%</div>
            </div>
            <div class="data-grid-item">
              <div class="data-grid-label">Remaining</div>
              <div class="data-grid-value" style="color: ${totalBudget - totalSpent >= 0 ? '#4caf50' : '#f44336'};">
                ₱${(totalBudget - totalSpent).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div style="font-style: italic; color: #555; margin-top: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Recommendation:</strong> 
            ${overallUsage > 100 
              ? 'Your overall spending exceeds your total budget. Consider adjusting your budget allocations or finding ways to reduce expenses.' 
              : overallUsage > 90
                ? 'You\'re approaching your total budget limit. Monitor spending closely for the remainder of the period.'
                : 'Your overall spending is within budget. Continue monitoring individual categories for optimal financial management.'}
          </div>
        </div>
      `;
    }
    
    // Add long-term trend analysis if we have enough data
    if (summaryData.trends && summaryData.trends.length >= 3) {
      insightsContent += `
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 16px; color: ${themeColor}; margin-bottom: 8px;">Long-term Financial Outlook</h3>
          <p>Based on your spending patterns over the last ${summaryData.trends.length} months, we can identify the following trends:</p>
          
          <ul style="margin-top: 10px; margin-bottom: 10px; padding-left: 20px;">
      `;
      
      // Calculate average monthly change
      let totalChange = 0;
      for (let i = 0; i < summaryData.trends.length - 1; i++) {
        const current = summaryData.trends[i].total;
        const previous = summaryData.trends[i + 1].total;
        totalChange += ((current - previous) / previous) * 100;
      }
      const avgMonthlyChange = totalChange / (summaryData.trends.length - 1);
      
      // Find highest and lowest months
      const highestMonth = [...summaryData.trends].sort((a, b) => b.total - a.total)[0];
      const lowestMonth = [...summaryData.trends].sort((a, b) => a.total - b.total)[0];
      
      // Add insights
      insightsContent += `
        <li><strong>Average monthly change:</strong> ${avgMonthlyChange > 0 ? '+' : ''}${avgMonthlyChange.toFixed(1)}%</li>
        <li><strong>Highest spending month:</strong> ${highestMonth.period} (₱${highestMonth.total.toFixed(2)})</li>
        <li><strong>Lowest spending month:</strong> ${lowestMonth.period} (₱${lowestMonth.total.toFixed(2)})</li>
        <li><strong>Spending volatility:</strong> ${Math.abs(highestMonth.total - lowestMonth.total) > lowestMonth.total * 0.5 ? 'High' : 'Moderate to Low'}</li>
      `;
      
      insightsContent += `
          </ul>
          
          <div style="font-style: italic; color: #555; margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
            <strong>Recommendation:</strong> 
            ${avgMonthlyChange > 5 
              ? 'Your expenses show an increasing trend. Consider setting a monthly spending limit to control costs.' 
              : avgMonthlyChange < -5
                ? 'Your expenses show a decreasing trend. Continue your effective cost-cutting measures.'
                : 'Your expenses are relatively stable month-to-month. Focus on optimizing specific categories rather than overall spending.'}
          </div>
        </div>
      `;
    }
    
    // Add financial health tips
    insightsContent += `
      <div style="margin-top: 25px; padding: 15px; background-color: #f2f7ff; border-radius: 8px; border-left: 4px solid ${themeColor};">
        <h3 style="font-size: 16px; color: ${themeColor}; margin-top: 0; margin-bottom: 10px;">Financial Health Tips</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>50/30/20 Rule:</strong> Consider allocating 50% of income to needs, 30% to wants, and 20% to savings/debt.</li>
          <li><strong>Emergency Fund:</strong> Aim to build an emergency fund covering 3-6 months of expenses.</li>
          <li><strong>Budget Adjustments:</strong> Review and adjust your budget quarterly based on changing needs and priorities.</li>
          <li><strong>Track Consistently:</strong> Regular expense tracking helps identify spending patterns and improvement areas.</li>
        </ul>
      </div>
    `;
    
    insightsSection.innerHTML = insightsContent;
    printContainer.appendChild(insightsSection);
  }
  
  // Add footer
  if (includeFooter) {
    const footer = document.createElement('div');
    footer.className = 'report-footer';
    
    footer.innerHTML = `
      <p style="margin-bottom: 5px;">This report was generated automatically from your Financial Dashboard.</p>
      <p style="margin-bottom: 5px;">© ${new Date().getFullYear()} ${companyName} | ${footerText}</p>
      <div style="font-size: 8px; color: #999; margin-top: 5px;">
        Report ID: FIN-${Date.now().toString(36).toUpperCase()} | Generated on: ${currentDate}
      </div>
    `;
    
    printContainer.appendChild(footer);
  }

  // Apply styles and handle export
  document.head.appendChild(style);
  
  if (isPdf) {
    try {
      // If PDF export is requested, use jsPDF to generate PDF
      // Prepare for PDF export
      document.body.appendChild(style);
      
      // If we need to include charts, we should capture them from the dashboard
      if (includeCharts) {
        // Find chart elements in the dashboard
        const pieChartElement = document.querySelector('.dashboard-content .recharts-wrapper, .dashboard-content canvas');
        const lineChartElement = document.querySelector('.dashboard-content .recharts-wrapper:nth-of-type(2), .dashboard-content canvas:nth-of-type(2)');
        
        // If charts are found, take screenshots and insert them
        if (pieChartElement) {
          // Capture and insert pie chart
          html2canvas(pieChartElement).then(canvas => {
            const chartImg = canvas.toDataURL('image/png');
            const chartPlaceholder = printContainer.querySelector('.chart-wrapper:nth-of-type(1)');
            if (chartPlaceholder) {
              chartPlaceholder.innerHTML = `<img src="${chartImg}" style="max-width: 100%; max-height: 100%;" />`;
            }
          });
        }
        
        if (lineChartElement) {
          // Capture and insert line chart
          html2canvas(lineChartElement).then(canvas => {
            const chartImg = canvas.toDataURL('image/png');
            const chartPlaceholder = printContainer.querySelector('.chart-wrapper:nth-of-type(2)');
            if (chartPlaceholder) {
              chartPlaceholder.innerHTML = `<img src="${chartImg}" style="max-width: 100%; max-height: 100%;" />`;
            }
          });
        }
      }
      
      // Wait a bit for charts to load if needed
      setTimeout(() => {
        // Generate PDF from the print container
        const pdf = new jsPDF(landscape ? 'landscape' : 'portrait', 'mm', paperSize);
        
        html2canvas(printContainer, {
          scale: 1,
          useCORS: true,
          logging: false,
          allowTaint: true
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 0;
          
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          pdf.save(pdfFileName);
          
          // Clean up
          document.head.removeChild(style);
          document.body.removeChild(printContainer);
        });
      }, includeCharts ? 1000 : 100);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Using print dialog instead.');
      // Fall back to print if PDF generation fails
      window.print();
    }
  } else {
    // Just use print dialog
    window.print();
    
    // Clean up after printing
    setTimeout(() => {
      document.head.removeChild(style);
      document.body.removeChild(printContainer);
    }, 1000);
  }
  
  return true;
};

/**
 * Print dashboard with basic layout
 * @param {Object} summaryData - The dashboard summary data object
 * @param {string} timeFilter - The currently applied time filter
 */
export const printDashboardPage = (summaryData, timeFilter) => {
  return enhancedDashboardPrintExport(summaryData, timeFilter, {
    isPdf: false,
    detailed: false,
    compactMode: true,
    singlePage: true
  });
};

/**
 * Print dashboard with standard layout
 * @param {Object} summaryData - The dashboard summary data object
 * @param {string} timeFilter - The currently applied time filter
 * @param {Object} options - Print options
 */
export const printDashboard = (summaryData, timeFilter, options = {}) => {
  return enhancedDashboardPrintExport(summaryData, timeFilter, {
    isPdf: false,
    detailed: true,
    ...options
  });
};

/**
 * Print comprehensive dashboard report with all details
 * @param {Object} summaryData - The dashboard summary data object
 * @param {Object} options - Options for the print format
 */
export const printDashboardReport = (summaryData, options = {}) => {
  return enhancedDashboardPrintExport(summaryData, options.period || 'Custom Period', {
    isPdf: false,
    detailed: true,
    includeCharts: true,
    ...options
  });
};

/**
 * Export dashboard as PDF with enhanced styling
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 * @param {string} exportType - 'detailed' or 'summary'
 */
export const exportDashboardAsPDF = (summaryData, timeFilterTitle, exportType = 'detailed') => {
  return enhancedDashboardPrintExport(summaryData, timeFilterTitle, {
    isPdf: true,
    detailed: exportType === 'detailed',
    compactMode: exportType !== 'detailed',
    maxPages: exportType === 'detailed' ? 0 : 1,
    pdfFileName: `Financial_Dashboard_${exportType}_${new Date().toISOString().slice(0, 10)}.pdf`
  });
};

/**
 * Export dashboard PDF with charts included
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 * @param {Object} chartRefs - References to chart components for capturing
 */
export const exportDashboardWithCharts = async (summaryData, timeFilterTitle, chartRefs = {}) => {
  return enhancedDashboardPrintExport(summaryData, timeFilterTitle, {
    isPdf: true,
    detailed: true,
    includeCharts: true,
    landscape: true,
    pdfFileName: `Financial_Dashboard_Full_${new Date().toISOString().slice(0, 10)}.pdf`
  });
};

/**
 * Export dashboard data as CSV
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 */
export const exportDashboardAsCSV = (summaryData, timeFilterTitle) => {
  try {
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Category,Amount,Percentage of Total\n';
    
    // Add expense by category rows
    if (summaryData.expenses_by_category && summaryData.expenses_by_category.length > 0) {
      summaryData.expenses_by_category.forEach(category => {
        const percentage = ((category.total / summaryData.total_expenses) * 100).toFixed(2);
        csvContent += `${category.category.name},${category.total.toFixed(2)},${percentage}%\n`;
      });
    }
    
    // Add total row
    csvContent += `Total,${summaryData.total_expenses.toFixed(2)},100.00%\n\n`;
    
    // Add budget section if available
    if (summaryData.budget_usage && summaryData.budget_usage.length > 0) {
      csvContent += '\nBudget Overview\n';
      csvContent += 'Category,Budget,Spent,Remaining,Usage %\n';
      
      summaryData.budget_usage.forEach(budget => {
        const remaining = budget.budget - budget.spent;
        csvContent += `${budget.category},${budget.budget.toFixed(2)},${budget.spent.toFixed(2)},${remaining.toFixed(2)},${budget.percentage.toFixed(2)}%\n`;
      });
    }
    
    // Add monthly trends if available
    if (summaryData.trends && summaryData.trends.length > 0) {
      csvContent += '\nMonthly Trends\n';
      csvContent += 'Month,Amount\n';
      
      summaryData.trends.forEach(trend => {
        csvContent += `${trend.period},${trend.total.toFixed(2)}\n`;
      });
    }
    
    // Create download link and trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Financial_Dashboard_${timeFilterTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Error creating CSV file. Using print dialog instead.');
    
    // Fall back to print if CSV generation fails
    return printDashboard(summaryData, timeFilterTitle, { compactMode: true });
  }
};

/**
 * Export dashboard data as Excel
 * This is a placeholder - in a real implementation, would use a library like XLSX.js
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 */
export const exportDashboardAsExcel = async (summaryData, timeFilterTitle) => {
  try {
    // Would implement Excel generation here
    // In a production app, you'd use SheetJS (XLSX) library to create Excel files
    // For this example, we'll use CSV export as a fallback
    
    alert('Excel export functionality requires the SheetJS library. Using CSV export instead.');
    return exportDashboardAsCSV(summaryData, timeFilterTitle);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    alert('Error creating Excel file. Using print dialog instead.');
    
    // Fall back to print if Excel generation fails
    return printDashboard(summaryData, timeFilterTitle, { compactMode: true });
  }
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

/**
 * Integration function to use the new print/export utilities from the Dashboard
 * This function can be used in the Dashboard component's handlers
 * @param {string} type - Export type: 'print', 'pdf', 'csv', 'excel'
 * @param {Object} summaryData - The dashboard summary data
 * @param {string} timeFilterTitle - The time period filter title
 * @param {Object} chartRefs - References to chart components
 */
export const handleDashboardExport = (type, summaryData, timeFilterTitle, chartRefs = {}) => {
  switch (type) {
    case 'print':
      return printDashboard(summaryData, timeFilterTitle);
    case 'pdf':
      return exportDashboardAsPDF(summaryData, timeFilterTitle, 'detailed');
    case 'pdf-summary':
      return exportDashboardAsPDF(summaryData, timeFilterTitle, 'summary');
    case 'pdf-charts':
      return exportDashboardWithCharts(summaryData, timeFilterTitle, chartRefs);
    case 'csv':
      return exportDashboardAsCSV(summaryData, timeFilterTitle);
    case 'excel':
      return exportDashboardAsExcel(summaryData, timeFilterTitle);
    default:
      return printDashboard(summaryData, timeFilterTitle);
  }
};
