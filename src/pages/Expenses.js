import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogActions, 
  DialogContent, DialogContentText, DialogTitle, TextField, MenuItem,
  Grid, CircularProgress, TablePagination, Chip, InputAdornment,
  Card, CardContent, useTheme, Snackbar, Alert, FormControl, InputLabel,
  Select, Stack, Fade, Zoom
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import MainLayout from '../layouts/MainLayout';
import { exportExpensesToCSV, exportExpensesToPDF } from '../utils/exportUtils';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { getExpenses, addExpense, updateExpense, deleteExpense } from '../api/expenses';
import { getCategories } from '../api/categories';

const Expenses = () => {
  const theme = useTheme();

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-out-cubic',
    });
    
    // Refresh AOS when the component updates
    return () => {
      AOS.refresh();
    };
  }, []);

  // State for expenses data
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for filtering and searching
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Function to handle export
  const handleExport = (format) => {
    if (!expenses || expenses.length === 0) {
      console.error('No expenses available to export.');
      return;
    }

    if (format === 'csv') {
      exportExpensesToCSV(expenses, `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    } else if (format === 'pdf') {
      exportExpensesToPDF(expenses, `expenses_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
  };
  
  // State for form dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    description: '',
    category_id: '',
    receipt_path: null
  });
  const [formErrors, setFormErrors] = useState({});
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, [page, rowsPerPage, filters]);

  // Refresh AOS when expenses are loaded
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [loading, expenses]);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error) {
        console.error('Error fetching categories:', error);
        showSnackbar('Failed to load categories', 'error');
      }
    };

    fetchCategories();
  }, []);

  // Function to fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        category_id: filters.category || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        search: filters.searchTerm || undefined,
        sort_by: 'date',
        sort_order: 'desc'
      };
      
      const response = await getExpenses(params);
      
      if (response && Array.isArray(response.data)) {
        setExpenses(response.data);
        setTotalExpenses(response.total || response.data.length);
      } else if (Array.isArray(response)) {
        setExpenses(response);
        setTotalExpenses(response.length);
      } else {
        console.error('Unexpected response format:', response);
        setExpenses([]);
        setTotalExpenses(0);
      }
      
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showSnackbar('Failed to load expenses', 'error');
      setExpenses([]);
      setTotalExpenses(0);
    } finally {
      setLoading(false);
    }
  };

  // Add cleanup for search timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Add validateDateFilters function before filter handlers
  const validateDateFilters = () => {
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      
      if (fromDate > toDate) {
        showSnackbar('From date cannot be after To date', 'error');
        return false;
      }
    }
    return true;
  };

  // Enhanced filter handlers
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
        fetchExpenses();
      }, 500);
      setSearchTimeout(timeoutId);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  // Toggle filter visibility with animation
  const handleToggleFilters = () => {
    setShowFilters(prev => !prev);
    // Refresh AOS to make animations work with newly visible elements
    setTimeout(() => {
      AOS.refresh();
    }, 100);
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
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    if (!formData.category_id) {
      errors.category_id = 'Please select a category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      description: '',
      category_id: '',
      receipt_path: null
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (expense) => {
    setCurrentExpense(expense);
    setFormData({
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description || '',
      category_id: expense.category_id,
      receipt_path: expense.receipt_path
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (expense) => {
    setCurrentExpense(expense);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentExpense(null);
  };

  // CRUD operations
  const handleAddExpense = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const expenseData = {
        ...formData,
        category_id: parseInt(formData.category_id, 10)
      };
      
      await addExpense(expenseData);
      handleCloseDialog();
      showSnackbar('Expense added successfully', 'success');
      fetchExpenses(); // Refresh the expenses list
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add expense';
      console.error('Error:', errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = async () => {
    if (!validateForm() || !currentExpense) return;
    
    try {
      setLoading(true);
      
      await updateExpense(currentExpense.id, formData);
      handleCloseDialog();
      showSnackbar('Expense updated successfully', 'success');
      fetchExpenses(); // Refresh the expenses list
      
    } catch (error) {
      console.error('Error updating expense:', error);
      showSnackbar('Failed to update expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!currentExpense) return;
    
    try {
      setLoading(true);
      
      await deleteExpense(currentExpense.id);
      handleCloseDialog();
      showSnackbar('Expense deleted successfully', 'success');
      fetchExpenses(); // Refresh the expenses list
      
    } catch (error) {
      console.error('Error deleting expense:', error);
      showSnackbar('Failed to delete expense', 'error');
    } finally {
      setLoading(false);
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

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const renderFilters = () => (
    <Card 
      sx={{ mb: 3, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}
      data-aos="fade-up"
      data-aos-delay="100"
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search expenses..."
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
            />
          </Grid>
          <Grid item xs={12} md={6}>
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
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={() => handleExport('csv')}
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
                Export CSV
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
                <Grid item xs={12} md={3} data-aos="fade-right" data-aos-delay="100">
                  <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: category.color
                              }}
                            />
                            {category.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3} data-aos="fade-right" data-aos-delay="200">
                  <TextField
                    fullWidth
                    label="From Date"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={3} data-aos="fade-right" data-aos-delay="300">
                  <TextField
                    fullWidth
                    label="To Date"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} md={3} data-aos="fade-right" data-aos-delay="400">
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (validateDateFilters()) {
                          setPage(0);
                          fetchExpenses();
                        }
                      }}
                      fullWidth
                      sx={{
                        borderRadius: 8,
                        py: 1,
                        boxShadow: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      Apply
                    </Button>
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
                      Clear
                    </Button>
                  </Stack>
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
          Expenses
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ mb: 2 }}
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Manage and track your expenses with ease
        </Typography>
      </Box>

      {/* Add Expense Button */}
      <Box 
        sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}
        data-aos="fade-left"
        data-aos-delay="200"
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
        >
          Add Expense
        </Button>
      </Box>

      {/* Filters with animation */}
      {renderFilters()}

      {/* Expenses Table */}
      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2, 
          boxShadow: 3, 
          borderRadius: 2,
          overflow: 'hidden'
        }}
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="expenses table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main + '15' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
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
              ) : expenses && expenses.length > 0 ? (
                expenses.map((expense, index) => (
                  <TableRow 
                    key={expense.id}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '05',
                        transform: 'translateY(-2px)',
                        boxShadow: 1
                      }
                    }}
                    // data-aos="fade-up"
                    // data-aos-delay={100 + (index * 50)}
                  >
                    <TableCell component="th" scope="row">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.category?.name || 'Unknown'}
                        size="small"
                        sx={{ 
                          bgcolor: expense.category?.color || theme.palette.primary.light,
                          color: theme.palette.getContrastText(expense.category?.color || theme.palette.primary.light),
                          fontWeight: 500,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {expense.description || '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium', 
                          fontSize: '0.9rem',
                          fontFamily: 'monospace',
                          letterSpacing: 0.5
                        }}
                      >
                        ₱{parseFloat(expense.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(expense)}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: theme.palette.primary.main + '20'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(expense)}
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: theme.palette.error.main + '20'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box data-aos="fade-up">
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                        No expenses found
                      </Typography>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />} 
                        sx={{ 
                          mt: 1,
                          borderRadius: 8,
                          px: 3,
                          py: 1,
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                        onClick={handleOpenAddDialog}
                      >
                        Add your first expense
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalExpenses || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              margin: 0,
            },
            '.MuiTablePagination-select': {
              paddingTop: 0,
              paddingBottom: 0,
            }
          }}
        />
      </Paper>

      {/* Add Expense Dialog with animation */}
      <Dialog 
        open={openAddDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 5,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(45deg, #2196F3, #3f51b5)', py: 1 }}>
          <DialogTitle sx={{ color: 'white', fontSize: '1.2rem' }}>
            Add New Expense
          </DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  sx: { borderRadius: 2 }
                }}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category_id} required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category_id"
                  value={formData.category_id}
                  label="Category"
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: category.color
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Receipt Image URL (Optional)"
                name="receipt_path"
                value={formData.receipt_path || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/receipt.jpg"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            sx={{
              borderRadius: 8,
              px: 3,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.grey[200]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: 8,
              px: 3,
              background: 'linear-gradient(45deg, #2196F3, #3f51b5)',
              transition: 'all 0.3s',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog with animation */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        transitionDuration={400}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 5,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(45deg, #4CAF50, #2E7D32)', py: 1 }}>
          <DialogTitle sx={{ color: 'white', fontSize: '1.2rem' }}>
            Edit Expense
          </DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  sx: { borderRadius: 2 }
                }}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date}
                helperText={formErrors.date}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category_id} required>
                <InputLabel id="category-edit-label">Category</InputLabel>
                <Select
                  labelId="category-edit-label"
                  name="category_id"
                  value={formData.category_id}
                  label="Category"
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: category.color
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.category_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Receipt Image URL (Optional)"
                name="receipt_path"
                value={formData.receipt_path || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/receipt.jpg"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            sx={{
              borderRadius: 8,
              px: 3,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.grey[200]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditExpense} 
            variant="contained" 
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: 8,
              px: 3,
              background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
              transition: 'all 0.3s',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {loading ? 'Updating...' : 'Update Expense'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog with animation */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={handleCloseDialog}
        TransitionComponent={Zoom}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 5,
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ background: 'linear-gradient(45deg, #f44336, #d32f2f)', py: 1 }}>
          <DialogTitle sx={{ color: 'white', fontSize: '1.2rem' }}>
            Confirm Delete
          </DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 1, px: 3 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete this expense? This action cannot be undone.
          </DialogContentText>
          {currentExpense && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2.5, 
                bgcolor: 'background.paper', 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: theme.palette.grey[200],
                boxShadow: 1,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: theme.palette.grey[300]
                }
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Date:</Typography>
                  <Typography variant="body1" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    {formatDate(currentExpense.date)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Amount:</Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '1rem', mt: 0.5 }}>
                    ₱{parseFloat(currentExpense.amount).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Category:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: currentExpense.category?.color || theme.palette.primary.main
                      }}
                    />
                    <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                      {currentExpense.category?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                {currentExpense.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary">Description:</Typography>
                    <Typography variant="body1" sx={{ fontSize: '1rem', mt: 0.5 }}>
                      {currentExpense.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            sx={{
              borderRadius: 8,
              px: 3,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.grey[200]
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteExpense} 
            variant="contained" 
            color="error"
            disabled={loading}
            sx={{
              borderRadius: 8,
              px: 3,
              background: 'linear-gradient(45deg, #f44336, #d32f2f)',
              transition: 'all 0.3s',
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications with animation */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3,
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

// Make sure to update the imports section with AOS
export default Expenses;