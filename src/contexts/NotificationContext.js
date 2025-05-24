import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { getNotifications } from '../api/notifications';
import { useAuth } from './AuthContext';

// Create a global event bus for instant communication
const NotificationEventBus = {
  listeners: {},
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  },
  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  publish(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

// Export event bus for direct usage in expense form
export { NotificationEventBus };

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const lastFetchTime = useRef(new Date());
  const notificationsCache = useRef(new Map());
  const pollingRef = useRef(null);
  
  // Track deleted notifications to prevent them from reappearing
  const deletedNotificationIds = useRef(new Set());
  // Track notifications that have been processed already
  const processedNotificationIds = useRef(new Set());
  
  // Reset tracking when user changes
  useEffect(() => {
    if (user) {
      // Reset tracking sets when user logs in/changes
      deletedNotificationIds.current.clear();
      processedNotificationIds.current.clear();
    }
  }, [user]);
  
  // Function to fetch all notifications
  const fetchAllNotifications = async (force = false) => {
    if (!user) return;
    
    try {
      const response = await getNotifications();
      
      // Filter out notifications that have been deleted
      const filteredNotificationsData = (response.data || []).filter(
        notif => !deletedNotificationIds.current.has(notif.id)
      );
      
      // Process notifications to detect new ones, excluding deleted ones
      const existingIds = new Set(notificationsCache.current.keys());
      const newNotifications = filteredNotificationsData.filter(notif => 
        !existingIds.has(notif.id) && !processedNotificationIds.current.has(notif.id)
      );
      
      // Add all current IDs to the processed set
      filteredNotificationsData.forEach(notif => {
        processedNotificationIds.current.add(notif.id);
      });
      
      // Update cache with filtered notifications
      notificationsCache.current.clear();
      filteredNotificationsData.forEach(notif => {
        notificationsCache.current.set(notif.id, notif);
      });
      
      setNotifications(filteredNotificationsData);
      const newUnreadCount = filteredNotificationsData.filter(notif => !notif.is_read).length;
      setUnreadCount(newUnreadCount);
      
      // If new notifications detected, notify subscribers
      if (newNotifications.length > 0 || force) {
        NotificationEventBus.publish('NEW_NOTIFICATIONS', {
          count: newUnreadCount,
          newItems: newNotifications
        });
        
        // Force refresh of components
        setRefreshKey(prev => prev + 1);
      }
      
      lastFetchTime.current = new Date();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  // Check for new notifications
  const checkNewNotifications = async () => {
    await fetchAllNotifications();
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      await axios.post(`/notifications/${notificationId}/read`);
      
      // Update local state optimistically
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update cache
      if (notificationsCache.current.has(notificationId)) {
        const updatedNotif = { ...notificationsCache.current.get(notificationId), is_read: true };
        notificationsCache.current.set(notificationId, updatedNotif);
      }
      
      // Notify subscribers
      NotificationEventBus.publish('NOTIFICATION_READ', { id: notificationId });
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update on error
      fetchAllNotifications(true);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await axios.post('/notifications/read-all');
      
      // Update local state optimistically
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => ({ ...notif, is_read: true }))
      );
      
      setUnreadCount(0);
      
      // Update cache
      notificationsCache.current.forEach((notif, id) => {
        notificationsCache.current.set(id, { ...notif, is_read: true });
      });
      
      // Notify subscribers
      NotificationEventBus.publish('ALL_NOTIFICATIONS_READ');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update on error
      fetchAllNotifications(true);
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!user) return;
    
    try {
      await axios.delete(`/notifications/${notificationId}`);
      
      // Add the notification ID to the deleted set
      deletedNotificationIds.current.add(notificationId);
      
      // Update local state optimistically
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
      
      // Update unread count if needed
      const wasUnread = notificationsCache.current.get(notificationId)?.is_read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Remove from cache
      notificationsCache.current.delete(notificationId);
      
      // Notify subscribers
      NotificationEventBus.publish('NOTIFICATION_DELETED', { id: notificationId });
      
      // Force refresh
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert optimistic update on error
      fetchAllNotifications(true);
    }
  };
  
  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!user) return;
    
    try {
      await axios.delete('/notifications');
      
      // Add all current notification IDs to the deleted set
      notifications.forEach(notif => {
        deletedNotificationIds.current.add(notif.id);
      });
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      // Clear cache
      notificationsCache.current.clear();
      
      // Notify subscribers
      NotificationEventBus.publish('ALL_NOTIFICATIONS_DELETED');
      
      // Force refresh
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      // Revert optimistic update on error
      fetchAllNotifications(true);
    }
  };
  
  // Listen for direct notification updates from expense form
  useEffect(() => {
    const unsubscribe = NotificationEventBus.subscribe('EXPENSE_CREATED', () => {
      // Wait a short moment for the backend to process the notification
      setTimeout(() => fetchAllNotifications(true), 500);
    });
    
    return unsubscribe;
  }, []);
  
  // Setup initial fetch and polling
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchAllNotifications(true);
    
    // Set up aggressive polling (every 2 seconds)
    pollingRef.current = setInterval(() => {
      checkNewNotifications();
    }, 2000);
    
    // Also check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchAllNotifications(true);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup a WebWorker for background fetching if supported
    let worker;
    if (window.Worker) {
      const workerCode = `
        let timer;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            timer = setInterval(() => {
              self.postMessage('check');
            }, 1000);
          } else if (e.data === 'stop') {
            clearInterval(timer);
          }
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = function(e) {
        if (e.data === 'check') {
          checkNewNotifications();
        }
      };
      
      worker.postMessage('start');
    }
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (worker) {
        worker.postMessage('stop');
        worker.terminate();
      }
    };
  }, [user]);
  
  // Return context value
  const value = {
    notifications,
    unreadCount,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshKey
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;