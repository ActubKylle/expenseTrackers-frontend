// src/api/notifications.js
import axios from './axios';

// Get all notifications with optional filters
export const getNotifications = async (params = {}) => {
  try {
    const response = await axios.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get('/notifications/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification count:', error);
    throw error;
  }
};

// Mark a notification as read
export const markAsRead = async (id) => {
  try {
    const response = await axios.post(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (type = null) => {
  try {
    const params = type ? { type } : {};
    const response = await axios.post('/notifications/read-all', params);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Delete all notifications
export const deleteAllNotifications = async (params = {}) => {
  try {
    const response = await axios.delete('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};