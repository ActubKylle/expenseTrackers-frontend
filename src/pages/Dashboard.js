import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, CircularProgress, 
  Card, CardContent, Divider, List, ListItem, 
  ListItemText, useTheme, LinearProgress, Button, IconButton,
  Menu, MenuItem, ListItemIcon, Chip, Skeleton, Tooltip,
  Dialog, DialogActions, DialogContent, DialogTitle,
  Collapse, Alert, useMediaQuery
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  FilterList as FilterIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  DateRange as DateRangeIcon,
  ShowChart as ShowChartIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Category as CategoryIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  PlayCircleOutline as TourIcon,
  CheckCircleOutline as SuccessIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import { getDashboardSummary } from '../api/dashboard';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { format, getYear, getMonth, getDate } from 'date-fns';
import { printDashboard } from '../utils/printUtils';
import { Helmet } from "react-helmet";
// Import AOS
import AOS from 'aos';
import 'aos/dist/aos.css';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// Add chart gradient setup
const createGradient = (ctx, color) => {
  if (!ctx) return color + '80';
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color + '80');
  gradient.addColorStop(1, color + '10');
  return gradient;
};

// Custom MiniChart component
const MiniChart = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1; // Prevent division by zero
  
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * 100,
    y: 100 - ((value - minValue) / range) * 100
  }));

  const path = points.reduce((acc, point, i) => {
    return acc + (i === 0 ? `M ${point.x},${point.y}` : ` L ${point.x},${point.y}`);
  }, '');

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '50px', display: 'block' }}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

// Dashboard Tour Component
const DashboardTour = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const getTourContent = () => {
    switch(step) {
      case 1:
        return {
          title: "Welcome to Your Financial Dashboard",
          content: "This dashboard gives you a complete overview of your expenses. Let's explore the key features to help you track your finances effectively."
        };
      case 2:
        return {
          title: "Summary Cards",
          content: "These cards show your key financial metrics at a glance. You can see your total expenses, spending trends compared to previous periods, and breakdowns by category."
        };
      case 3:
        return {
          title: "Monthly Analysis",
          content: "This section shows how your spending changes over time. You can identify trends, see your highest and lowest spending months, and track your progress toward financial goals."
        };
      case 4:
        return {
          title: "Budget Overview",
          content: "Track how your actual expenses compare to your planned budget. Progress bars show each category's spending as a percentage of your budget, helping you identify areas where you might be overspending."
        };
      case 5:
        return {
          title: "Filtering & Exporting",
          content: "Use the filter option to view data for different time periods. The export button lets you save or print your financial reports for record-keeping or sharing."
        };
      default:
        return { title: "", content: "" };
    }
  };
  
  const content = getTourContent();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TourIcon sx={{ mr: 1 }} />
          {content.title}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {content.content}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                mx: 0.5,
                bgcolor: idx + 1 === step ? 'primary.main' : 'grey.300'
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          variant={step === totalSteps ? "contained" : "text"}
          autoFocus
        >
          {step === totalSteps ? "Finish" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Help Dialog Component
const HelpDialog = ({ open, onClose, title, content }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <HelpIcon sx={{ mr: 1 }} />
          {title}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1">
          {content}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got It
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Dynamic filtering state
  const [timeFilter, setTimeFilter] = useState('current');
  const [printMenuAnchor, setPrintMenuAnchor] = useState(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  
  // First-time user experience states
  const [showTutorialAlert, setShowTutorialAlert] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);
  
  // Feature explanation dialog
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpDialogContent, setHelpDialogContent] = useState({ title: '', content: '' });

  // Optimize data fetching with caching
  const [dataCache, setDataCache] = useState({
    timestamp: null,
    data: null
  });

  // Initialize AOS when component mounts
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
      delay: 0,
      mirror: false,
      anchorPlacement: 'top-bottom',
      disable: window.innerWidth < 768 ? true : false
    });
    
    // Refresh AOS on window resize for responsive behavior
    window.addEventListener('resize', () => {
      AOS.refresh();
    });
    
    // Check if it's the user's first visit and open tour automatically
    const isFirstVisit = !localStorage.getItem('dashboardVisited');
    if (isFirstVisit) {
      // Wait for data to load before showing tour
      setTimeout(() => {
        setTourOpen(true);
        localStorage.setItem('dashboardVisited', 'true');
      }, 1500);
    }
    
    return () => {
      window.removeEventListener('resize', () => {
        AOS.refresh();
      });
    };
  }, []);

  // Refresh AOS when data loads or changes
  useEffect(() => {
    if (!loading && summaryData) {
      // Use setTimeout to ensure DOM is updated before refreshing AOS
      const timer = setTimeout(() => {
        AOS.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, summaryData]);

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // Print menu handlers
  const handlePrintMenuOpen = (event) => {
    setPrintMenuAnchor(event.currentTarget);
  };

  const handlePrintMenuClose = () => {
    setPrintMenuAnchor(null);
  };

  // Filter menu handlers
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };

  // Help dialog handlers
  const openHelpDialog = (title, content) => {
    setHelpDialogContent({ title, content });
    setHelpDialogOpen(true);
  };

  // Simulate print functionality
  const handlePrint = (type) => {
    handlePrintMenuClose();
    if (type === 'print') {
      printDashboard(summaryData, getTimeFilterTitle());
    } else {
      alert('PDF export functionality coming soon!');
    }
  };

  // Handle time filter change
  const handleTimeFilterChange = (filterValue) => {
    setTimeFilter(filterValue);
    setLoading(true);
    handleFilterMenuClose();
  };

  // Enhanced fetch function with caching
  const fetchDashboardData = useCallback(async (force = false) => {
    try {
      // Check cache validity (5 minutes)
      const cacheValid = dataCache.timestamp && 
        (Date.now() - dataCache.timestamp) < 300000 && 
        !force;

      if (cacheValid && dataCache.data) {
        setSummaryData(dataCache.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // Calculate date parameters based on selected filter
      const now = new Date();
      let startDate, endDate;
      
      switch(timeFilter) {
        case 'lastMonth':
          startDate = new Date(getYear(now), getMonth(now) - 1, 1);
          endDate = new Date(getYear(now), getMonth(now), 0);
          break;
        case 'lastThreeMonths':
          startDate = new Date(getYear(now), getMonth(now) - 3, 1);
          endDate = now;
          break;
        case 'lastSixMonths':
          startDate = new Date(getYear(now), getMonth(now) - 6, 1);
          endDate = now;
          break;
        case 'year':
          startDate = new Date(getYear(now), 0, 1);
          endDate = now;
          break;
        case 'current':
        default:
          startDate = new Date(getYear(now), getMonth(now), 1);
          endDate = new Date(getYear(now), getMonth(now) + 1, 0);
      }
      
      // Format dates for API request
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const params = {
        start_date: formattedStartDate,
        end_date: formattedEndDate
      };

      const response = await getDashboardSummary(params);

      if (response) {
        setSummaryData(response);
        setDataCache({
          timestamp: Date.now(),
          data: response
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setSummaryData({
        total_expenses: 0,
        expenses_by_category: [],
        trends: [],
        budget_usage: []
      });
    } finally {
      setLoading(false);
    }
  }, [timeFilter, dataCache.timestamp]);

  // Optimize monthly analysis calculations
  const monthlyAnalysis = useMemo(() => {
    if (!summaryData?.trends?.length) return null;

    const trends = summaryData.trends;
    const calculations = {
      averageSpending: 0,
      highestMonth: null,
      lowestMonth: null,
      monthOverMonthGrowth: []
    };

    // Single pass through the data
    calculations.averageSpending = trends.reduce((sum, month) => sum + month.total, 0) / trends.length;
    calculations.highestMonth = trends.reduce((max, month) => month.total > (max?.total || 0) ? month : max, trends[0]);
    calculations.lowestMonth = trends.reduce((min, month) => month.total < (min?.total || 0) ? month : min, trends[0]);

    // Calculate growth in same loop
    calculations.monthOverMonthGrowth = trends.slice(0, -1).map((month, i) => ({
      period: month.period,
      growth: ((month.total - trends[i + 1].total) / trends[i + 1].total) * 100
    }));

    return calculations;
  }, [summaryData?.trends]);

  // Enhanced loading state management
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const loadData = async () => {
      try {
        if (!mounted) return;
        await fetchDashboardData();
      } catch (error) {
        if (!mounted || retryCount >= maxRetries) return;
        retryCount++;
        setTimeout(loadData, retryDelay * retryCount);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [fetchDashboardData, refreshKey]);

  // Prepare data for category pie chart
  const pieChartData = useMemo(() => {
    return {
      labels: summaryData?.expenses_by_category?.map(item => item.category.name) || [],
      datasets: [
        {
          data: summaryData?.expenses_by_category?.map(item => item.total) || [],
          backgroundColor: summaryData?.expenses_by_category?.map(item => item.category.color) || [],
          borderWidth: 1,
        },
      ],
    };
  }, [summaryData?.expenses_by_category]);

  // Prepare data for spending trends line chart
  const lineChartData = useMemo(() => {
    if (!summaryData?.trends?.length) return { labels: [], datasets: [] };

    // Create reversed array so time flows left to right
    const reversedTrends = [...summaryData.trends].reverse();
    
    return {
      labels: reversedTrends.map(trend => trend.period),
      datasets: [
        {
          label: 'Monthly Expenses',
          data: reversedTrends.map(trend => trend.total),
          fill: true,
          borderColor: theme.palette.primary.main,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx } = chart;
            return createGradient(ctx, theme.palette.primary.main);
          },
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: theme.palette.primary.main,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [summaryData?.trends, theme.palette.primary.main]);

  // Enhanced pie chart configuration
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 15,
          padding: 15,
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: label, // Only display the category name
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].backgroundColor[i],
              lineWidth: 1,
              hidden: false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            // Display category name and amount
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = Math.round((context.parsed * 100) / total);
            return `${context.label}: ₱${context.parsed.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };

  // Enhanced line chart options with gradients
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `₱${context.parsed.y.toFixed(2)}`,
          title: (tooltipItems) => format(new Date(tooltipItems[0].label), 'MMMM yyyy')
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 0 }
      },
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: {
          callback: (value) => `₱${value.toFixed(0)}`
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  // Enhanced card component with mini-chart and fixed height
  const StatsCard = ({ 
    title, 
    value, 
    trend, 
    color, 
    data, 
    icon, 
    isCount = false,
    subtitle,
    index = 0, // Used for staggered animations
    helpText = null // New parameter for help text
  }) => (
    <Card 
      sx={{
        ...cardStyles,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}02 100%)`,
        borderLeft: `4px solid ${color}`,
        height: '100%', // Ensure all cards have same height within their grid cell
        display: 'flex',
        flexDirection: 'column'
      }}
      data-aos="fade-up"
      data-aos-delay={100 + (index * 100)} // Staggered delay based on card index
    >
      <CardContent sx={{ 
        p: 3, 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 150 // Set minimum height for consistency
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ width: '75%' }}> {/* Limit width to prevent expansion */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  mb: 0.5
                }}
              >
                {title}
              </Typography>
              {helpText && (
                <Tooltip title={helpText} arrow placement="top">
                  <InfoIcon 
                    color="info" 
                    fontSize="small" 
                    sx={{ ml: 0.5, opacity: 0.7, cursor: 'help', fontSize: '16px' }} 
                  />
                </Tooltip>
              )}
            </Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isCount ? value : `₱${value.toFixed(2)}`}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  mt: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box 
            sx={{ 
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}15`,
              height: 'fit-content'
            }}
          >
            {React.cloneElement(icon, { sx: { color } })}
          </Box>
        </Box>

        {trend !== 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Chip
              size="small"
              icon={trend > 0 ? <TrendingUpIcon /> : trend < 0 ? <TrendingDownIcon /> : <TrendingFlatIcon />}
              label={`${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`}
              color={trend > 0 ? 'error' : trend < 0 ? 'success' : 'default'}
              sx={{ height: '24px' }}
            />
            <Typography variant="caption" color="text.secondary">
              vs previous period
            </Typography>
          </Box>
        )}

        {data && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            opacity: 0.2,
            overflow: 'hidden'
          }}>
            <MiniChart data={data} color={color} />
          </Box>
        )}
      </CardContent>
    </Card>
  );

 

  const renderMonthlyTrends = () => (
    <Paper 
      sx={{ 
        p: 3, 
        boxShadow: 2,
        height: '100%',
        ...cardStyles
      }}
      data-aos="fade-up"
      data-aos-delay="300"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Monthly Spending Analysis
          </Typography>
          <Tooltip title="See how your spending changes over time and identify trends" arrow placement="top">
            <InfoIcon color="info" fontSize="small" sx={{ ml: 1, opacity: 0.7, cursor: 'help' }} />
          </Tooltip>
        </Box>
        
        <Button
          size="small"
          startIcon={<HelpIcon />}
          onClick={() => openHelpDialog(
            "Understanding Your Monthly Trends", 
            "This chart shows how your expenses change over time. Look for patterns to help identify seasonal spending, unexpected costs, or areas where you might save money. A downward trend is generally good as it means you're spending less."
          )}
          sx={{ textTransform: 'none' }}
        >
          Learn More
        </Button>
      </Box>
      
      <Box 
        sx={{ 
          height: 300, 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        data-aos="fade-up"
        data-aos-delay="400"
      >
        {summaryData?.trends?.length > 0 ? (
          <Line data={lineChartData} options={lineChartOptions} />
        ) : (
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <ShowChartIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography>No spending trend data available yet</Typography>
            <Typography variant="caption">Start tracking your expenses to see trends over time</Typography>
          </Box>
        )}
      </Box>
      
    {monthlyAnalysis && (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4}>
      <Card 
        sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2
        }}
        data-aos="zoom-in"
        data-aos-delay="400"
      >
        <CardContent sx={{ 
          minHeight: 120,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography variant="subtitle2">Average Monthly Spending</Typography>
          <Typography variant="h4" sx={{ 
            mt: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            ₱{monthlyAnalysis.averageSpending.toFixed(2)}
          </Typography>
          <Typography variant="caption">
            {summaryData?.trends?.length === 1 
              ? "Based on 1 month of data" 
              : `Based on ${summaryData?.trends?.length || 0} months of data`}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  
    <Grid item xs={12} md={4}>
      <Card 
        sx={{ 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2
        }}
        data-aos="zoom-in"
        data-aos-delay="500"
      >
        <CardContent sx={{ 
          minHeight: 120,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography variant="subtitle2">
            {summaryData?.trends?.length === 1 ? "Current" : "Highest"} Spending Month
          </Typography>
          <Typography variant="h4" sx={{ 
            mt: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            ₱{monthlyAnalysis.highestMonth.total.toFixed(2)}
          </Typography>
          <Typography variant="caption">
            {monthlyAnalysis.highestMonth.period}
            {summaryData?.trends?.length === 1 && " (only data available)"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  
    <Grid item xs={12} md={4}>
      <Card 
        sx={{ 
          bgcolor: 'success.light', 
          color: 'success.contrastText',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2
        }}
        data-aos="zoom-in"
        data-aos-delay="600"
      >
        <CardContent sx={{ 
          minHeight: 120,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography variant="subtitle2">
            {summaryData?.trends?.length === 1 ? "Current" : "Lowest"} Spending Month
          </Typography>
          <Typography variant="h4" sx={{ 
            mt: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            ₱{monthlyAnalysis.lowestMonth.total.toFixed(2)}
          </Typography>
          <Typography variant="caption">
            {monthlyAnalysis.lowestMonth.period}
            {summaryData?.trends?.length === 1 && " (only data available)"}
          </Typography>
        </CardContent>
      </Card>
    </Grid>

    {/* Only show month-over-month changes if we have enough data */}
    {monthlyAnalysis.monthOverMonthGrowth.length > 0 && (
      <Grid item xs={12}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            mt: 2 
          }}
          data-aos="fade-up"
          data-aos-delay="700"
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Month-over-Month Changes
            </Typography>
            <Tooltip title="See how your spending increases or decreases each month compared to the previous month. Negative values (green) indicate spending reductions." arrow placement="top">
              <InfoIcon color="info" fontSize="small" sx={{ ml: 1, opacity: 0.7, cursor: 'help' }} />
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {monthlyAnalysis.monthOverMonthGrowth.map((item, index) => (
              <Chip
                key={index}
                label={`${item.period}: ${item.growth > 0 ? '+' : ''}${item.growth.toFixed(1)}%`}
                color={item.growth > 0 ? 'error' : 'success'}
                variant="outlined"
                size="small"
                data-aos="fade-right"
                data-aos-delay={700 + (index * 50)}
                data-aos-duration={600}
              />
            ))}
          </Box>
        </Box>
      </Grid>
    )}
      
    {summaryData?.trends?.length === 1 && (
      <Grid item xs={12}>
        <Alert 
          severity="info" 
          sx={{ mt: 2 }}
          icon={<InfoIcon />}
        >
          Add more expenses over time to see trends and comparisons between months.
        </Alert>
      </Grid>
    )}
  </Grid>
)}
    </Paper>
  );

  // Render summary cards with mini-charts
  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Total Expenses"
          value={summaryData?.total_expenses || 0}
          trend={monthlyAnalysis?.monthOverMonthGrowth?.[0]?.growth || 0}
          color={theme.palette.primary.main}
          data={summaryData?.trends?.map(t => t.total)}
          icon={<MonetizationOnIcon />}
          index={0}
          helpText="The total amount you've spent during the selected time period"
        />
      </Grid>
  
      {/* Fix: Remove "const render" from this Grid item declaration */}
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Average Monthly"
          value={monthlyAnalysis?.averageSpending || 0}
          trend={((summaryData?.total_expenses || 0) / (monthlyAnalysis?.averageSpending || 1) - 1) * 100}
          color={theme.palette.info.main}
          data={summaryData?.trends?.map(t => t.total)}
          icon={<AccountBalanceIcon />}
          index={1}
          helpText="Your average monthly spending - helps you understand your typical expenses"
        />
      </Grid> 
  
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Highest Category"
          value={Math.max(...(summaryData?.expenses_by_category?.map(c => c.total) || [0]))}
          trend={0}
          color={theme.palette.warning.main}
          icon={<AssessmentIcon />}
          data={summaryData?.expenses_by_category?.map(c => c.total)}
          subtitle={summaryData?.expenses_by_category?.sort((a, b) => b.total - a.total)[0]?.category?.name}
          index={2}
          helpText="Your biggest spending category for this period"
        />
      </Grid>
  
      <Grid item xs={12} sm={6} md={3}>
        <StatsCard
          title="Active Categories"
          value={summaryData?.expenses_by_category?.length || 0}
          trend={0}
          color={theme.palette.success.main}
          icon={<CategoryIcon />}
          isCount={true}
          subtitle="Total Categories"
          index={3}
          helpText="Number of expense categories you're currently using"
        />
      </Grid>
    </Grid>
  );
  // Enhanced budget section with interactive features and explanations
  const renderBudgetSection = () => {
    // Create a map of category names to their colors from the expenses_by_category data
    const categoryColorMap = {};
    summaryData?.expenses_by_category?.forEach(item => {
      categoryColorMap[item.category.name] = item.category.color;
    });

    return (
      <Paper 
        sx={{ 
          ...cardStyles, 
          p: 3,
          height: '100%'
        }}
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Budget Overview
            </Typography>
            <Tooltip title="Track your spending against your budget limits for each category" arrow placement="top">
              <InfoIcon color="info" fontSize="small" sx={{ ml: 1, opacity: 0.7, cursor: 'help' }} />
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<HelpIcon />}
              onClick={() => openHelpDialog(
                "Understanding Your Budget Overview", 
                "Budget bars show how close you are to your spending limits. Green means you're well under budget, yellow means you're approaching your limit, and red means you've exceeded it. Managing your budget helps you control spending and save money for your financial goals."
              )}
              sx={{ textTransform: 'none' }}
            >
              How to Read
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              href="/budgets"
              sx={{ textTransform: 'none' }}
            >
              Manage Budgets
            </Button>
          </Box>
        </Box>
        
        {!summaryData?.budget_usage?.length ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4, 
              color: 'text.secondary',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider'
            }}
            data-aos="fade-up"
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>No Budget Data Yet</Typography>
            <Typography sx={{ mb: 2 }}>
              Setting up budgets helps you control spending and reach your financial goals
            </Typography>
            <Button 
              variant="contained" 
              href="/budgets"
              sx={{ 
                borderRadius: 8,
                px: 3,
                boxShadow: 2
              }}
            >
              Create Your First Budget
            </Button>
          </Box>
        ) : (
          <>
            {/* Legend explanation */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3,
                flexWrap: 'wrap'
              }}
              data-aos="fade-up"
            >
              <Chip 
                size="small" 
                label="Under Budget" 
                sx={{ bgcolor: theme.palette.success.main, color: 'white' }} 
              />
              <Chip 
                size="small" 
                label="Near Limit (>80%)" 
                sx={{ bgcolor: theme.palette.warning.main, color: 'white' }} 
              />
              <Chip 
                size="small" 
                label="Over Budget" 
                sx={{ bgcolor: theme.palette.error.main, color: 'white' }} 
              />
            </Box>
            
            {summaryData?.budget_usage?.map((budget, index) => {
              // Get the color for this category from the map, or use a default color
              const categoryColor = categoryColorMap[budget.category] || theme.palette.primary.main;
              
              // Determine progress bar color based on percentage
              const progressColor = budget.percentage > 100 ? theme.palette.error.main : 
                                  budget.percentage > 80 ? theme.palette.warning.main : 
                                  theme.palette.success.main;
              
              return (
                <Box 
                  key={index} 
                  sx={{ mb: 3 }}
                  data-aos="fade-right"
                  data-aos-delay={400 + (index * 50)}
                  data-aos-duration={600}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      width: '60%' // Limit width for category name
                    }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: categoryColor,
                          flexShrink: 0
                        }} 
                      />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {budget.category}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2"
                      color={budget.percentage > 100 ? 'error.main' : 'text.secondary'}
                      sx={{
                        whiteSpace: 'nowrap'
                      }}
                    >
                      ₱{budget.spent.toFixed(2)} / ₱{budget.budget.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ position: 'relative' }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(budget.percentage, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'background.paper',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                          transition: 'transform 0.4s ease',
                          backgroundColor: progressColor
                        }
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        textShadow: '0 0 2px rgba(0,0,0,0.5)',
                        zIndex: 1
                      }}
                    >
                      {budget.percentage.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            
            {/* Helpful tips section */}
            <Box 
              sx={{ 
                mt: 4, 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2
              }}
              data-aos="fade-up"
              data-aos-delay="700"
            >
              <InfoIcon color="inherit" sx={{ mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Budget Tip</Typography>
                <Typography variant="body2">
                  A common budgeting approach is the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. 
                  Track your expenses for a few months to identify your spending patterns before setting strict budgets.
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    );
  };

  // Render expense distribution section
  const renderExpenseDistribution = () => (
    <Paper 
      sx={{
        ...cardStyles,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      data-aos="fade-up"
      data-aos-delay="500"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            Expense Distribution
          </Typography>
          <Tooltip title="See which categories account for most of your spending" arrow placement="top">
            <InfoIcon color="info" fontSize="small" sx={{ ml: 1, opacity: 0.7, cursor: 'help' }} />
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ 
        flexGrow: 1,
        height: '280px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {pieChartData.labels.length > 0 ? (
          <Pie data={pieChartData} options={pieChartOptions} />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%" flexDirection="column">
            <CategoryIcon sx={{ fontSize: 60, opacity: 0.3, mb: 2, color: 'text.secondary' }} />
            <Typography variant="body1" color="textSecondary">
              No expense data available
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Add expenses to see your spending distribution
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* Chart Legend Explanation */}
      {pieChartData.labels.length > 0 && (
        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            How to Use This Chart
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Larger segments represent categories where you spend more. 
            Focus on reducing expenses in your largest categories for the biggest impact on your finances.
          </Typography>
        </Box>
      )}
    </Paper>
  );

  // Function to get filter title
  const getTimeFilterTitle = () => {
    switch(timeFilter) {
      case 'lastMonth': return 'Last Month';
      case 'lastThreeMonths': return 'Last 3 Months';
      case 'lastSixMonths': return 'Last 6 Months';
      case 'year': return 'This Year';
      case 'current':
      default: return 'Current Month';
    }
  };

  // Enhanced styles for dashboard components
  const cardStyles = {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(0,0,0,0.05)',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    }
  };

  // Enhanced print menu
  const printMenu = (
    <Menu
      anchorEl={printMenuAnchor}
      open={Boolean(printMenuAnchor)}
      onClose={handlePrintMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: '12px',
          mt: 1,
        }
      }}
    >
      <MenuItem onClick={() => {
        handlePrintMenuClose();
        printDashboard(summaryData, getTimeFilterTitle());
      }}>
        <ListItemIcon>
          <PrintIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Print Report" secondary="Create a printable version" />
      </MenuItem>
      <MenuItem onClick={() => {
        handlePrintMenuClose();
        // Here you can implement PDF export
        alert('PDF export functionality coming soon!');
      }}>
        <ListItemIcon>
          <PdfIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Export as PDF" secondary="Save for your records" />
      </MenuItem>
    </Menu>
  );

  // Enhanced filter menu with animations
  const filterMenu = (
    <Menu
      anchorEl={filterMenuAnchor}
      open={Boolean(filterMenuAnchor)}
      onClose={handleFilterMenuClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: '12px',
          mt: 1,
          '& .MuiMenuItem-root': {
            py: 1.5,
            transition: 'background-color 0.2s',
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              }
            }
          }
        }
      }}
    >
      {[
        { value: 'current', label: 'Current Month' },
        { value: 'lastMonth', label: 'Last Month' },
        { value: 'lastThreeMonths', label: 'Last 3 Months' },
        { value: 'lastSixMonths', label: 'Last 6 Months' },
        { value: 'year', label: 'This Year' }
      ].map((option) => (
        <MenuItem
          key={option.value}
          selected={timeFilter === option.value}
          onClick={() => handleTimeFilterChange(option.value)}
        >
          <ListItemIcon>
            <DateRangeIcon 
              fontSize="small" 
              sx={{ 
                color: timeFilter === option.value ? 'primary.main' : 'inherit'
              }} 
            />
          </ListItemIcon>
          <ListItemText 
            primary={option.label}
            primaryTypographyProps={{
              fontWeight: timeFilter === option.value ? 600 : 400
            }}
          />
        </MenuItem>
      ))}
    </Menu>
  );

  // Optimized rendering with load states
  const renderContent = () => {
    if (loading && !summaryData) {
      return <LoadingPlaceholder />;
    }

    if (error && !summaryData) {
      return <ErrorDisplay error={error} onRetry={() => fetchDashboardData(true)} />;
    }

    return (
      <>
        {renderSummaryCards()}

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {renderMonthlyTrends()}
          </Grid>

          <Grid item xs={12} lg={4}>
            {renderExpenseDistribution()}
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12}>
            {renderBudgetSection()}
          </Grid>
        </Grid>
      </>
    );
  };

  // Loading placeholder component with AOS animations
  const LoadingPlaceholder = () => (
    <Box sx={{ py: 4 }}>
      <Box data-aos="fade-up" data-aos-duration="600">
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box data-aos="fade-up" data-aos-delay="200" data-aos-duration="600">
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box data-aos="fade-up" data-aos-delay="300" data-aos-duration="600">
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  // Error display component with AOS animation
  const ErrorDisplay = ({ error, onRetry }) => (
    <Box sx={{ textAlign: 'center', py: 4 }} data-aos="fade-up" data-aos-duration="600">
      <Typography color="error" gutterBottom>
        {error}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        We couldn't load your dashboard data. This might be due to a connection issue or the server might be temporarily unavailable.
      </Typography>
      <Button
        variant="outlined"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
        sx={{ borderRadius: 8, px: 3 }}
      >
        Retry Loading
      </Button>
    </Box>
  );

  return (
    <MainLayout>
      <Helmet>
        <title>Financial Dashboard | Expense Tracker</title>
      </Helmet>
      
      {/* First-time user tutorial alert */}
      <Collapse in={showTutorialAlert}>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                color="info" 
                size="small" 
                onClick={() => setTourOpen(true)}
                sx={{ mr: 1 }}
              >
                Take Tour
              </Button>
              <IconButton 
                size="small" 
                onClick={() => setShowTutorialAlert(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Welcome to your Financial Dashboard! 
            </Typography>
          </Box>
          <Typography variant="body2">
            This dashboard gives you a complete overview of your expenses. Take a quick tour to learn how to use all features.
          </Typography>
        </Alert>
      </Collapse>
      
      <Box className="dashboard-content" sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Box 
          sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}
          data-aos="fade-down"
          data-aos-duration="800"
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Financial Dashboard
            </Typography>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <DateRangeIcon sx={{ fontSize: 20 }} />
              {getTimeFilterTitle()} Overview
            </Typography>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap'
            }}
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleFilterMenuOpen}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                }
              }}
            >
              {isMobile ? 'Filter' : 'Time Period'}
            </Button>

            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintMenuOpen}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 15px rgba(25, 118, 210, 0.3)',
                }
              }}
            >
              {isMobile ? 'Export' : 'Export Report'}
            </Button>

            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={handleRefresh} 
                color="primary" 
                aria-label="refresh data"
                sx={{ 
                  borderRadius: '50%', 
                  p: 1.2,
                  border: '1px solid',
                  borderColor: 'divider' 
                }}
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Dashboard Help">
              <IconButton 
                onClick={() => setTourOpen(true)} 
                color="primary" 
                aria-label="dashboard help"
                sx={{ 
                  borderRadius: '50%', 
                  p: 1.2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {renderContent()}
      </Box>
      
      {/* Dashboard tour component */}
      <DashboardTour open={tourOpen} onClose={() => setTourOpen(false)} />
      
      {/* Help dialog component */}
      <HelpDialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        title={helpDialogContent.title}
        content={helpDialogContent.content}
      />
      
      {/* Menus */}
      {filterMenu}
      {printMenu}
    </MainLayout>
  );
};

export default React.memo(Dashboard);
             