import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Button, Switch, 
  Divider, Select, MenuItem, FormControl,
  Card, CardContent, Alert, Snackbar, List, 
  ListItem, ListItemText, ListItemSecondaryAction,
  useTheme
} from '@mui/material';
import { 
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // App settings
  const [appSettings, setAppSettings] = useState({
    language: 'en',
    currency: 'PHP',
    emailNotifications: true,
    budgetAlerts: true
  });
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Handle app settings changes
  const handleSettingChange = (e) => {
    const { name, value, checked } = e.target;
    setAppSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  // Save app settings
  const handleSaveSettings = () => {
    // In a real app, you would call API to save settings
    console.log('Saving settings:', appSettings);
    showSnackbar('Settings saved successfully');
  };
  
  // Show notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // Close notification
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Currency options
  const currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'PHP', label: 'Philippine Peso (₱)' }
  ];
  
  // Language options
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'tl', label: 'Tagalog' }
  ];
  
  return (
    <MainLayout>
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 500,
            fontSize: { xs: '1.8rem', md: '2.125rem' }
          }}
        >
          Settings
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ mb: 2 }}
        >
          Manage your application preferences
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Display Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1 }} color="primary" /> Display Settings
              </Typography>
              <Divider sx={{ mb: 3, mt: 1 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Language" 
                    secondary="Choose your preferred language"
                  />
                  <FormControl sx={{ minWidth: 150 }} size="small">
                    <Select
                      name="language"
                      value={appSettings.language}
                      onChange={handleSettingChange}
                    >
                      {languages.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>

                <ListItem>
                  <ListItemText 
                    primary="Currency" 
                    secondary="Set your preferred currency for expenses"
                  />
                  <FormControl sx={{ minWidth: 150 }} size="small">
                    <Select
                      name="currency"
                      value={appSettings.currency}
                      onChange={handleSettingChange}
                    >
                      {currencies.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            boxShadow: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} color="primary" /> Notification Settings
              </Typography>
              <Divider sx={{ mb: 3, mt: 1 }} />
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive email alerts for important updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="emailNotifications"
                      checked={appSettings.emailNotifications}
                      onChange={handleSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText 
                    primary="Budget Alerts" 
                    secondary="Get notified when you're near budget limits"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      name="budgetAlerts"
                      checked={appSettings.budgetAlerts}
                      onChange={handleSettingChange}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Save Button */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          sx={{ px: 4, py: 1 }}
        >
          Save All Settings
        </Button>
      </Box>
      
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

export default Settings;