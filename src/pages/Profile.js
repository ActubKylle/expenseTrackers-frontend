import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Divider, Button, TextField,
  Grid, Card, CardContent, Switch, FormControlLabel, Tab, Tabs,
  Alert, CircularProgress, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Security as SecurityIcon, 
  Settings as SettingsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CreditCard as CreditCardIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    currency: 'PHP',
    language: 'en',
    darkMode: false
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currency: user.preferences?.currency || 'PHP',
        language: user.preferences?.language || 'en',
        darkMode: user.preferences?.darkMode || false
      });
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setUserData({
      ...userData,
      [name]: e.target.type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(userData);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully'
      });
      setEditMode(false);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          Profile
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="textSecondary"
          sx={{ mb: 2 }}
        >
          Manage your account information and preferences
        </Typography>
      </Box>

      {notification && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 3 }}
          onClose={() => setNotification(null)}
        >
          {notification.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main' 
                }}
              >
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {userData.name || 'User'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                {userData.email || 'No email provided'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>

          <Paper sx={{ p: 3 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab icon={<AccountIcon />} label="Account" value="account" />
              <Tab icon={<SecurityIcon />} label="Security" value="security" />
              <Tab icon={<SettingsIcon />} label="Preferences" value="preferences" />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* Account Tab */}
            {activeTab === 'account' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Account Information
                  </Typography>
                  {!editMode ? (
                    <Button 
                      startIcon={<EditIcon />} 
                      onClick={toggleEditMode}
                    >
                      Edit
                    </Button>
                  ) : (
                    <Button 
                      startIcon={<SaveIcon />} 
                      onClick={handleSave}
                      color="primary"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Security Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 2 }}>
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" color="primary">
                      Update Password
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.1rem', mb: 2 }}>
                    Account Access
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Two-factor authentication" 
                        secondary="Add an extra layer of security to your account" 
                      />
                      <Button variant="outlined" size="small">
                        Enable
                      </Button>
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Active sessions" 
                        secondary="Manage devices currently logged into your account" 
                      />
                      <Button variant="outlined" size="small">
                        Manage
                      </Button>
                    </ListItem>
                  </List>
                </Box>
              </Box>
            )}
            
            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preferences
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <CreditCardIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText 
                      primary="Currency" 
                      secondary="Set your preferred currency for expenses" 
                    />
                    <TextField
                      select
                      name="currency"
                      value={userData.currency}
                      onChange={handleInputChange}
                      SelectProps={{
                        native: true,
                      }}
                      sx={{ width: 120 }}
                    >
                      <option value="PHP">PHP (₱)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="GBP">GBP (£)</option>
                    </TextField>
                  </ListItem>
                  
                  <ListItem>
                    <LanguageIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText 
                      primary="Language" 
                      secondary="Choose your preferred language" 
                    />
                    <TextField
                      select
                      name="language"
                      value={userData.language}
                      onChange={handleInputChange}
                      SelectProps={{
                        native: true,
                      }}
                      sx={{ width: 120 }}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fil">Filipino</option>
                    </TextField>
                  </ListItem>
                  
                  <ListItem>
                    <DarkModeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <ListItemText 
                      primary="Dark Mode" 
                      secondary="Toggle between light and dark theme" 
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.darkMode}
                          onChange={handleInputChange}
                          name="darkMode"
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 3, textAlign: 'right' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
          
          {/* Account Statistics */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Account Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {user?.stats?.total_expenses || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Expenses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {user?.stats?.categories_count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Categories
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {user?.stats?.budgets_count || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Budgets
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {user?.stats?.days_active || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Days Active
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button variant="outlined" color="primary">
                Download Account Data
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Profile;