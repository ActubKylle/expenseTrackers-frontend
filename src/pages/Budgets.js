import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogActions, 
  DialogContent, DialogTitle, TextField, InputAdornment, 
  Grid, CircularProgress, LinearProgress, Tooltip, Card, 
  CardContent, useTheme, Snackbar, Alert, FormControl, InputLabel, 
  Select, MenuItem, TablePagination, Fade, Zoom, Stack, Chip,
  DialogContentText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Savings as SavingsIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { debounce } from 'lodash';

import { exportBudgetsToCSV, exportBudgetsToPDF } from '../utils/exportUtils';
import { getBudgetsForMonth, addBudget, updateBudget, deleteBudget } from '../api/budgets';
import { getCategories } from '../api/categories';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Add custom styles for hardware acceleration and optimized animations
const globalStyles = `
  .hardware-accelerated {
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .aos-init {
    will-change: transform, opacity;
  }

  .aos-animate {
    will-change: auto;
  }

  .transition-row {
    transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
  }

  @media (max-width: 768px) {
    [data-aos] {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
`;

const Budgets = () => {
  const theme = useTheme();
  
  // Initialize AOS with optimized settings
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      mirror: false,
      easing: 'ease-out',
      offset: 120,
      debounceDelay: 50,
      throttleDelay: 99,
      disable: window.innerWidth < 768,
    });
    
    // Apply global styles for optimized animations
    const styleTag = document.createElement('style');
    styleTag.innerHTML = globalStyles;
    document.head.appendChild(styleTag);
    
    // Refresh AOS when the component updates
    return () => {
      AOS.refresh();
      if (styleTag && document.head.contains(styleTag)) {
        document.head.removeChild(styleTag);
      }
    };
  }, []);

  // Debounced refresh function for better performance
  const debouncedRefresh = useCallback(
    debounce(() => {
      AOS.refresh();
    }, 150),
    []
  );
  
  // State for budgets data
  const [budgets, setBudgets] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBudgets, setTotalBudgets] = useState(0);
  
  // State for visible rows (used for lazy loading)
  const [visibleRows, setVisibleRows] = useState({});
  const rowObserver = useRef(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  // State for filtering and searching
  const [filters, setFilters] = useState({
    searchTerm: '',
    month: currentMonth
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // State for form dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    month: currentMonth
  });
  const [formErrors, setFormErrors] = useState({});
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Generate available months
  const availableMonths = (() => {
    const months = [];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    
    // Add previous 12 months + current month + next 12 months
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentYear, currentMonthIndex + i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();
      const monthValue = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthName = `${monthNames[monthIndex]} ${year}`;
      
      months.push({ 
        value: monthValue, 
        name: monthName,
        isPast: i < 0,
        isCurrent: i === 0,
        isFuture: i > 0
      });
    }
    
    return months;
  })();

  // Helper functions for month status
  const isCurrentMonth = useCallback((monthValue) => {
    const now = new Date();
    const currentMonthValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return monthValue === currentMonthValue;
  }, []);

  const isPastMonth = useCallback((monthValue) => {
    const [year, month] = monthValue.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    return (year < currentYear) || (year === currentYear && month < currentMonth);
  }, []);

  // Add cleanup for search timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Setup intersection observer for lazy loading row animations
  useEffect(() => {
    rowObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleRows(prev => ({
              ...prev,
              [entry.target.dataset.rowid]: true
            }));
            rowObserver.current.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    return () => {
      if (rowObserver.current) {
        rowObserver.current.disconnect();
      }
    };
  }, []);

  // Reset visible rows when page changes
  useEffect(() => {
    setVisibleRows({});
  }, [page]);

  // Row reference callback for intersection observer
  const rowRef = useCallback(node => {
    if (node !== null && rowObserver.current) {
      rowObserver.current.observe(node);
    }
  }, []);

  // Handle mobile optimization
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Disable most animations on mobile for better performance
        document.querySelectorAll('[data-aos]').forEach(el => {
          el.removeAttribute('data-aos');
          el.removeAttribute('data-aos-delay');
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Run once on mount
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Fetch budgets and categories on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [filters.month]);

  // Apply search filter and pagination to budgets
  useEffect(() => {
    if (budgets.length > 0) {
      const filtered = budgets.filter(budget => {
        const matchesSearch = filters.searchTerm ? (
          budget.category.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        ) : true;
        
        return matchesSearch;
      });
      
      setFilteredBudgets(filtered);
      setTotalBudgets(filtered.length);
    } else {
      setFilteredBudgets([]);
      setTotalBudgets(0);
    }
  }, [budgets, filters.searchTerm]);

  // Refresh AOS when budgets are loaded - using debounced refresh for better performance
  useEffect(() => {
    if (!loading) {
      debouncedRefresh();
    }
  }, [loading, filteredBudgets, debouncedRefresh]);

  // Function to fetch budgets and categories with progressive loading
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const categoriesResponse = await getCategories();
      const budgetsResponse = await getBudgetsForMonth(filters.month);
      
      setCategories(categoriesResponse);
      
      // Filter budgets by month
      const filteredBudgets = budgetsResponse.filter(
        budget => budget.month === filters.month
      );
      
      // Progressive loading for larger datasets
      if (filteredBudgets.length > 15) {
        setBudgets([]); // Clear current budgets
        
        // Load in chunks to avoid jank
        const chunkSize = 5;
        for (let i = 0; i < filteredBudgets.length; i += chunkSize) {
          const chunk = filteredBudgets.slice(i, i + chunkSize);
          setTimeout(() => {
            setBudgets(prev => [...prev, ...chunk]);
          }, i * 30); // Small staggered delay
        }
      } else {
        // For smaller datasets, load all at once
        setBudgets(filteredBudgets);
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
      setLoading(false);
    }
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handlers
  const handleFilterChange = (field, value) => {
    clearTimeout(searchTimeout);
    
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));

    // Debounce search
    if (field === 'searchTerm') {
      const timeoutId = setTimeout(() => {
        setPage(0);
      }, 500);
      setSearchTimeout(timeoutId);
    }

    // If month changes, update form data too
    if (field === 'month') {
      setCurrentMonth(value);
      setFormData(prev => ({
        ...prev,
        month: value
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters(prev => ({
      ...prev,
      searchTerm: ''
    }));
  };

  // Toggle filter visibility with animation
  const handleToggleFilters = () => {
    setShowFilters(prev => !prev);
    // Refresh AOS to make animations work with newly visible elements
    debouncedRefresh();
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if any
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'Please select a category';
    } else {
      const budgetExists = budgets.some(
        budget => budget.category_id === parseInt(formData.category_id) && 
                 (currentBudget ? budget.id !== currentBudget.id : true)
      );
      
      if (budgetExists && !openEditDialog) {
        errors.category_id = 'A budget for this category already exists';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormData({
      amount: '',
      category_id: '',
      month: filters.month
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (budget) => {
    setCurrentBudget(budget);
    setFormData({
      amount: budget.amount.toString(),
      category_id: budget.category_id.toString(),
      month: budget.month
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (budget) => {
    setCurrentBudget(budget);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentBudget(null);
  };

  // CRUD operations
  const handleAddBudget = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      await addBudget(formData);
      
      const selectedCategory = categories.find(
        cat => cat.id === parseInt(formData.category_id)
      );
      
      const selectedMonth = availableMonths.find(
        month => month.value === formData.month
      );
      
      const newBudget = {
        id: budgets.length + 1,
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id),
        category: selectedCategory,
        month: formData.month,
        month_name: selectedMonth.name,
        spent: 0
      };
      
      setBudgets(prev => [...prev, newBudget]);
      handleCloseDialog();
      showSnackbar('Budget added successfully');
      setLoading(false);
      
    } catch (error) {
      console.error('Error adding budget:', error);
      showSnackbar('Failed to add budget', 'error');
      setLoading(false);
    }
  };

  const handleEditBudget = async () => {
    if (!validateForm() || !currentBudget) return;
    
    try {
      setLoading(true);
      
      await updateBudget(currentBudget.id, formData);
      
      const selectedCategory = categories.find(
        cat => cat.id === parseInt(formData.category_id)
      );
      
      const selectedMonth = availableMonths.find(
        month => month.value === formData.month
      );
      
      const updatedBudgets = budgets.map(budget => {
        if (budget.id === currentBudget.id) {
          return {
            ...budget,
            amount: parseFloat(formData.amount),
            category_id: parseInt(formData.category_id),
            category: selectedCategory,
            month: formData.month,
            month_name: selectedMonth.name
          };
        }
        return budget;
      });
      
      setBudgets(updatedBudgets);
      handleCloseDialog();
      showSnackbar('Budget updated successfully');
      setLoading(false);
      
    } catch (error) {
      console.error('Error updating budget:', error);
      showSnackbar('Failed to update budget', 'error');
      setLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!currentBudget) return;
    
    try {
      setLoading(true);
      
      await deleteBudget(currentBudget.id);
      
      const filteredBudgets = budgets.filter(
        budget => budget.id !== currentBudget.id
      );
      
      setBudgets(filteredBudgets);
      handleCloseDialog();
      showSnackbar('Budget deleted successfully');
      setLoading(false);
      
    } catch (error) {
      console.error('Error deleting budget:', error);
      showSnackbar('Failed to delete budget', 'error');
      setLoading(false);
    }
  };

  // Handle month change for filtering
  const handleMonthChange = (e) => {
    handleFilterChange('month', e.target.value);
  };

  // Handle export
  const handleExport = (format) => {
    const monthName = availableMonths.find(m => m.value === filters.month)?.name || filters.month;
    
    if (format === 'csv') {
      exportBudgetsToCSV(filteredBudgets, `budgets_${monthName.replace(' ', '_')}.csv`);
    } else if (format === 'pdf') {
      exportBudgetsToPDF(filteredBudgets, monthName, `budgets_${monthName.replace(' ', '_')}.pdf`);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  // Calculate budget status text and color
  const getBudgetStatus = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    let color, text;
    
    if (percentage >= 100) {
      color = 'error';
      text = 'Over budget';
    } else if (percentage >= 80) {
      color = 'warning';
      text = 'Near limit';
    } else if (percentage >= 50) {
      color = 'info';
      text = 'On track';
    } else {
      color = 'success';
      text = 'Under budget';
    }
    
    return { color, text, percentage };
  };

  // Calculate total budget and spent for displayed budgets
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get current page items
  const paginatedBudgets = filteredBudgets.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );

  // Render filter section
  const renderFilters = () => (
    <Card 
      sx={{ mb: 3, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}
      data-aos="fade-up"
      className="hardware-accelerated"
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search budgets by category..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange('searchTerm', '')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                  }
                }
              }}
              size="small"
              sx={{ mb: { xs: 2, md: 0 } }}
            />
          </Grid>
                        <Grid item xs={12} md={4}>
               
            <FormControl fullWidth size="small">
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={filters.month}
                label="Month"
                onChange={handleMonthChange}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)'
                  }
                }}
              >
                {availableMonths.map((month) => (
                  <MenuItem 
                    key={month.value} 
                    value={month.value}
                    sx={{
                      ...(month.isPast && { color: 'text.secondary' }),
                      ...(month.isCurrent && { 
                        color: 'primary.main', 
                        fontWeight: 600,
                        position: 'relative',
                        '&::after': {
                          content: '"(Current)"',
                          position: 'absolute',
                          right: '8px',
                          fontSize: '0.75rem',
                          color: 'primary.main',
                        },
                      }),
                    }}
                  >
                    {month.name}
                    {month.isCurrent && (
                      <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'primary.main' }}>
                        (Current)
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={handleToggleFilters}
                startIcon={<FilterIcon />}
                size="medium"
                sx={{
                  borderRadius: 8,
                  px: 2,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                {showFilters ? 'Hide Options' : 'More Options'}
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {showFilters && (
          <Fade in={showFilters} timeout={500}>
            <Box 
              sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                boxShadow: 1
              }}
              data-aos="fade-down"
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => handleExport('csv')}
                      size="small"
                      sx={{
                        borderRadius: 8,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => handleExport('pdf')}
                      size="small"
                      sx={{
                        borderRadius: 8,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      Export PDF
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" color="textSecondary">
                    {isCurrentMonth(filters.month) ? 
                      "Viewing current month's budgets" : 
                      isPastMonth(filters.month) ?
                      "Viewing historical budget data" :
                      "Planning future budgets"}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    fullWidth
                    sx={{
                      borderRadius: 8,
                      py: 1,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    Clear Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <Box sx={{ mb: 4, px: 1 }} data-aos="fade-down">
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.8rem', md: '2.125rem' },
            backgroundImage: 'linear-gradient(45deg, #2196F3, #3f51b5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Budget Planning
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ mb: 2 }}
        >
          Set and track your monthly budgets by category
        </Typography>
      </Box>

      {/* Add Budget Button */}
      <Box 
        sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}
        data-aos="fade-left"
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            borderRadius: 8,
            boxShadow: 3,
            background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 5,
              transform: 'translateY(-2px)'
            }
          }}
          className="hardware-accelerated"
        >
          Add Budget
        </Button>
      </Box>

      {/* Filters section */}
      {renderFilters()}

      {/* Budget Summary Card */}
      {filteredBudgets.length > 0 && (
        <Card 
          sx={{ mb: 3, boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}
          data-aos="fade-up"
          className="hardware-accelerated"
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {availableMonths.find(m => m.value === filters.month)?.name} Budget Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Budget: ₱{totalBudget.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={totalPercentage > 100 ? "error.main" : "textSecondary"}
                    >
                      Spent: ₱{totalSpent.toFixed(2)} ({totalPercentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(totalPercentage, 100)} 
                    color={
                      totalPercentage > 100 ? "error" : 
                      totalPercentage > 80 ? "warning" : "primary"
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Chip 
                    label={`${filteredBudgets.length} Categories`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip 
                    label={totalPercentage > 100 ? "Over Budget" : 
                           totalPercentage > 80 ? "Near Limit" : 
                           totalPercentage > 0 ? "On Track" : "Not Started"}
                    size="small"
                    color={totalPercentage > 100 ? "error" : 
                           totalPercentage > 80 ? "warning" : 
                           totalPercentage > 0 ? "info" : "default"}
                    sx={{ fontWeight: 500 }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Budgets Table */}
      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2, 
          boxShadow: 3, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="budgets table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main + '15' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Budget Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Spent</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedBudgets.length > 0 ? (
                paginatedBudgets.map((budget, index) => {
                  const status = getBudgetStatus(budget);
                  return (
                    <TableRow 
                      key={budget.id}
                      ref={rowRef}
                      data-rowid={budget.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease',
                        opacity: visibleRows[budget.id] ? 1 : 0.4,
                        transform: visibleRows[budget.id] ? 'translateY(0)' : 'translateY(10px)',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main + '05',
                          transform: 'translateY(-2px)',
                          boxShadow: 1
                        }
                      }}
                      className="transition-row"
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 16, 
                              height: 16, 
                              borderRadius: '50%',
                              bgcolor: budget.category.color,
                              mr: 1.5
                            }} 
                          />
                          <Typography variant="body1">
                            {budget.category.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          ₱{budget.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body1" 
                          color={status.percentage > 100 ? "error.main" : "inherit"}
                          sx={{ fontWeight: status.percentage > 100 ? 'bold' : 'regular' }}
                        >
                          ₱{budget.spent.toFixed(2)}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="textSecondary"
                            sx={{ ml: 0.75 }}
                          >
                            ({status.percentage.toFixed(1)}%)
                          </Typography>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(status.percentage, 100)} 
                              color={status.color}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: 'rgba(0, 0, 0, 0.05)'
                              }}
                            />
                          </Box>
                          <Typography 
                            variant="caption" 
                            color={`${status.color}.main`}
                            sx={{ fontWeight: 'medium' }}
                          >
                            {status.text}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(budget)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleOpenDeleteDialog(budget)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                      <SavingsIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No budgets found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 3 }}>
                        {filters.searchTerm ? 
                          'Try adjusting your search criteria or clear filters' : 
                          `No budgets have been set for ${availableMonths.find(m => m.value === filters.month)?.name || 'this month'}`}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{
                          borderRadius: 8,
                          px: 3,
                          boxShadow: 2,
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                      >
                        Create Budget
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {filteredBudgets.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalBudgets}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                margin: 0
              }
            }}
          />
        )}
      </Paper>

      {/* Add Budget Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Add New Budget
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category_id}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: category.color,
                            mr: 1
                          }} 
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category_id && (
                  <Typography variant="caption" color="error">
                    {formErrors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="month-select-label">Month</InputLabel>
                <Select
                  labelId="month-select-label"
                  id="month-select"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  label="Month"
                >
                  {availableMonths.map((month) => (
                    <MenuItem 
                      key={month.value} 
                      value={month.value}
                      sx={{
                        ...(month.isCurrent && { 
                          fontWeight: 600,
                        }),
                      }}
                    >
                      {month.name}
                      {month.isCurrent && " (Current)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 8, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddBudget}
            variant="contained"
            sx={{ 
              borderRadius: 8, 
              px: 3,
              boxShadow: 2,
              background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
            }}
          >
            Add Budget
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 600 }}>
          Edit Budget
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category_id}>
                <InputLabel id="edit-category-select-label">Category</InputLabel>
                <Select
                  labelId="edit-category-select-label"
                  id="edit-category-select"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id.toString()}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%',
                            bgcolor: category.color,
                            mr: 1
                          }} 
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category_id && (
                  <Typography variant="caption" color="error">
                    {formErrors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="edit-month-select-label">Month</InputLabel>
                <Select
                  labelId="edit-month-select-label"
                  id="edit-month-select"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  label="Month"
                >
                  {availableMonths.map((month) => (
                    <MenuItem 
                      key={month.value} 
                      value={month.value}
                      sx={{
                        ...(month.isCurrent && { 
                          fontWeight: 600,
                        }),
                      }}
                    >
                      {month.name}
                      {month.isCurrent && " (Current)"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 8, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditBudget}
            variant="contained"
            sx={{ 
              borderRadius: 8, 
              px: 3,
              boxShadow: 2,
              background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Budget Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 600 }}>
          Delete Budget
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the budget for <strong>{currentBudget?.category?.name}</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 8, px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteBudget}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 8, 
              px: 3,
              boxShadow: 2,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Budgets;