import axios from './axios';

// Get user settings
export const getUserSettings = async () => {
  try {
    // UNCOMMENT THIS WHEN BACKEND IS READY
    // const response = await axios.get('/settings');
    // return response.data;
    
    // MOCK DATA FOR DEVELOPMENT
    console.log('Using mock data for user settings');
    
    return {
      profile: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      },
      preferences: {
        language: 'en',
        currency: 'PHP',
        darkMode: false,
        emailNotifications: true,
        budgetAlerts: true
      }
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    // UNCOMMENT THIS WHEN BACKEND IS READY
    // const response = await axios.put('/settings/profile', profileData);
    // return response.data;
    
    // MOCK DATA FOR DEVELOPMENT
    console.log('Using mock data for updating user profile', profileData);
    
    return {
      success: true,
      message: 'Profile updated successfully',
      profile: profileData
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update user preferences
export const updateUserPreferences = async (preferencesData) => {
  try {
    // UNCOMMENT THIS WHEN BACKEND IS READY
    // const response = await axios.put('/settings/preferences', preferencesData);
    // return response.data;
    
    // MOCK DATA FOR DEVELOPMENT
    console.log('Using mock data for updating user preferences', preferencesData);
    
    return {
      success: true,
      message: 'Preferences updated successfully',
      preferences: preferencesData
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

// Change user password
export const changeUserPassword = async (passwordData) => {
  try {
    // UNCOMMENT THIS WHEN BACKEND IS READY
    // const response = await axios.put('/settings/password', passwordData);
    // return response.data;
    
    // MOCK DATA FOR DEVELOPMENT
    console.log('Using mock data for changing user password');
    
    // Simulate password validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (passwordData.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing user password:', error);
    throw error;
  }
};

// Delete user account
export const deleteUserAccount = async (confirmation) => {
  try {
    // UNCOMMENT THIS WHEN BACKEND IS READY
    // const response = await axios.delete('/settings/account', { data: { confirmation } });
    // return response.data;
    
    // MOCK DATA FOR DEVELOPMENT
    console.log('Using mock data for deleting user account');
    
    // Simulate confirmation validation
    if (confirmation !== 'DELETE') {
      throw new Error('Invalid confirmation');
    }
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};