import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogActions, 
  DialogContent, DialogTitle, TextField, InputLabel, 
  Grid, CircularProgress, Chip, InputAdornment, Tooltip,
  Card, CardContent, useTheme, Snackbar, Alert, DialogContentText,
  TablePagination, Stack, Fade, Zoom, FormControl, Select, MenuItem
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  Palette as PaletteIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../api/categories';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Categories = () => {
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
  
  // State for categories data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCategories, setTotalCategories] = useState(0);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for filtering and searching
  const [filters, setFilters] = useState({
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // State for form dialogs
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#1976d2'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // State for notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Predefined colors for easy selection
  const colorPresets = [
    '#F44336', // Red
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#03A9F4', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#CDDC39', // Lime
    '#FFEB3B', // Yellow
    '#FFC107', // Amber
    '#FF9800', // Orange
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];

  // Fetch categories on component mount and when filters/pagination change
  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage, filters]);

  // Refresh AOS when categories are loaded
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  }, [loading, categories]);

  // Add cleanup for search timeout
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Make search call with proper parameters
      const response = await getCategories({
        page: page + 1,
        per_page: rowsPerPage,
        searchTerm: filters.searchTerm ? filters.searchTerm.trim() : undefined
      });
      
      if (response && Array.isArray(response.data)) {
        // Client-side priority sorting if backend isn't handling it properly
        let sortedData = [...response.data];
        
        if (filters.searchTerm && filters.searchTerm.trim() !== '') {
          const searchTerm = filters.searchTerm.trim().toLowerCase();
          
          // Sort by relevance (exact match, starts with, contains)
          sortedData.sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            
            // Exact match
            if (nameA === searchTerm && nameB !== searchTerm) return -1;
            if (nameB === searchTerm && nameA !== searchTerm) return 1;
            
            // Starts with
            if (nameA.startsWith(searchTerm) && !nameB.startsWith(searchTerm)) return -1;
            if (nameB.startsWith(searchTerm) && !nameA.startsWith(searchTerm)) return 1;
            
            // Default sort by name if both have same relevance
            return nameA.localeCompare(nameB);
          });
        }
        
        setCategories(sortedData);
        setTotalCategories(response.total || sortedData.length);
      } else if (Array.isArray(response)) {
        setCategories(response);
        setTotalCategories(response.length);
      }
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('Failed to load categories', 'error');
      setCategories([]);
      setTotalCategories(0);
    } finally {
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
    
    // Update the filter state
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  
    // For search term changes
    if (field === 'searchTerm') {
      // Special handling for empty search (when clearing the search)
      if (!value || value.trim() === '') {
        // Immediately fetch all categories when search is cleared
        setPage(0);
        const timeoutId = setTimeout(() => {
          fetchCategories();
        }, 100); // Very short timeout for immediate response
        setSearchTimeout(timeoutId);
      } else {
        // Normal debounce for non-empty search
        const timeoutId = setTimeout(() => {
          setPage(0);
          fetchCategories();
        }, 300);
        setSearchTimeout(timeoutId);
      }
    }
  };
  
  const handleClearFilters = () => {
    setFilters({
      searchTerm: ''
    });
    
    // Immediately fetch all categories when clearing filters
    setPage(0);
    fetchCategories();
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

  const handleColorSelect = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Category name is required';
    }
    
    if (!formData.color) {
      errors.color = 'Please select a color';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      color: '#1976d2'
    });
    setFormErrors({});
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      color: category.color
    });
    setFormErrors({});
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (category) => {
    setCurrentCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentCategory(null);
  };

  // CRUD operations
  const handleAddCategory = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      await addCategory(formData);
      handleCloseDialog();
      showSnackbar('Category added successfully', 'success');
      fetchCategories(); // Refresh the categories list
      
    } catch (error) {
      console.error('Error adding category:', error);
      showSnackbar('Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!validateForm() || !currentCategory) return;
    
    try {
      setLoading(true);
      
      await updateCategory(currentCategory.id, formData);
      handleCloseDialog();
      showSnackbar('Category updated successfully', 'success');
      fetchCategories(); // Refresh the categories list
      
    } catch (error) {
      console.error('Error updating category:', error);
      showSnackbar('Failed to update category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      setLoading(true);
      
      await deleteCategory(currentCategory.id);
      handleCloseDialog();
      showSnackbar('Category deleted successfully', 'success');
      fetchCategories(); // Refresh the categories list
      
    } catch (error) {
      console.error('Error deleting category:', error);
      showSnackbar('Failed to delete category', 'error');
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
  placeholder="Search categories..."
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
        <IconButton 
          size="small" 
          onClick={() => {
            // This ensures the search is cleared AND data is reloaded
            handleFilterChange('searchTerm', '');
            // Force immediate reload
            setTimeout(() => fetchCategories(), 50);
          }}
        >
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
                <Grid item xs={12} md={9} data-aos="fade-right" data-aos-delay="100">
                  <Typography variant="body2" color="textSecondary">
                    Use the search box above to find categories by name.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={3} data-aos="fade-right" data-aos-delay="200">
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
          Categories
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ mb: 2 }}
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Manage expense categories to organize your transactions
        </Typography>
      </Box>

      {/* Add Category Button */}
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
          Add Category
        </Button>
      </Box>

      {/* Filters with animation */}
      {renderFilters()}

      {/* Categories Table */}
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
          <Table sx={{ minWidth: 650 }} aria-label="categories table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main + '15' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <TableRow 
                    key={category.id}
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
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant="body1">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={category.name}
                        size="small"
                        sx={{ 
                          bgcolor: category.color || theme.palette.primary.light,
                          color: theme.palette.getContrastText(category.color || theme.palette.primary.light),
                          fontWeight: 500,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditDialog(category)}
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
                          onClick={() => handleOpenDeleteDialog(category)}
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
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Box data-aos="fade-up">
                      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                        No categories found
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
                        Add your first category
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
          count={totalCategories || 0}
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

      {/* Add Category Dialog with animation */}
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
            Add New Category
          </DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel shrink>Color</InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mt: 1,
                  mb: 2
                }}
              >
                {colorPresets.map((color) => (
                  <Tooltip title={color} key={color}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: color,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid' : '1px solid',
                        borderColor: formData.color === color ? theme.palette.grey[800] : theme.palette.grey[300],
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  </Tooltip>
                ))}
              </Box>
              <TextField
                fullWidth
                label="Custom Color (HEX)"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                error={!!formErrors.color}
                helperText={formErrors.color}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: formData.color || '#000',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
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
            onClick={handleAddCategory} 
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
            {loading ? 'Saving...' : 'Save Category'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog with animation */}
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
            Edit Category
          </DialogTitle>
        </Box>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel shrink>Color</InputLabel>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  mt: 1,
                  mb: 2
                }}
              >
                {colorPresets.map((color) => (
                  <Tooltip title={color} key={color}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: color,
                        cursor: 'pointer',
                        border: formData.color === color ? '3px solid' : '1px solid',
                        borderColor: formData.color === color ? theme.palette.grey[800] : theme.palette.grey[300],
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: 2
                        }
                      }}
                      onClick={() => handleColorSelect(color)}
                    />
                  </Tooltip>
                ))}
              </Box>
              <TextField
                fullWidth
                label="Custom Color (HEX)"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                error={!!formErrors.color}
                helperText={formErrors.color}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: formData.color || '#000',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
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
            onClick={handleEditCategory} 
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
            {loading ? 'Updating...' : 'Update Category'}
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
            Are you sure you want to delete this category? This will also delete all expenses associated with this category and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
          <Button 
            onClick={handleDeleteCategory} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};

export default Categories;