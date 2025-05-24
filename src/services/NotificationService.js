// src/services/NotificationService.js

import { getNotifications, getUnreadCount } from '../api/notifications';
import NotificationEventBus from '../contexts/NotificationEventBus';

/**
 * NotificationService - Manages background notification polling
 * Uses an intelligent polling mechanism that reduces server load
 * while still providing a near real-time experience
 */
class NotificationService {
  constructor() {
    this.pollInterval = 2000; // Start with 5 seconds
    this.maxPollInterval = 60000; // Max 1 minute
    this.minPollInterval = 3000; // Min 3 seconds
    this.backoffFactor = 1.5; // Increase poll time by this factor if no new notifications
    this.intervalId = null;
    this.lastFetchTime = new Date();
    this.activeCount = 0; // Track count of active polls
    this.isPolling = false;
    this.lastActivity = new Date();
    this.audioContext = null;
    this.audioBuffer = null;
    this.setupComplete = false;
    this.fallbackAudio = null;
    
    // Track ALL notifications we've seen to avoid duplicates
    this.processedNotificationIds = new Set();
    // Track specifically deleted notifications
    this.deletedNotificationIds = new Set();
    // Track notifications marked as read
    this.readNotificationIds = new Set();
    
    // Setup throttling - prevent excessive polls
    this.canPoll = true;
    this.throttleTimeout = 1000; // Min 1 second between polls
  }

  /**
   * Start the notification service
   */
  start() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.setupAudio();
    this.setupActivityTracking();
    
    console.log('Starting notification polling service');
    
    // Setup interval with adaptive polling
    this.pollForNotifications();
    this.intervalId = setInterval(() => {
      this.pollForNotifications();
    }, this.pollInterval);
  }

  /**
   * Stop the notification service
   */
  stop() {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Notification polling service stopped');
  }

  /**
   * Reset tracking when user logs out
   */
  reset() {
    this.processedNotificationIds.clear();
    this.deletedNotificationIds.clear();
    this.readNotificationIds.clear();
    console.log('Notification tracking reset');
  }

  /**
   * Add a notification ID to the deleted list
   * @param {number} id - Notification ID to mark as deleted
   */
  addDeletedNotification(id) {
    this.deletedNotificationIds.add(id);
    this.processedNotificationIds.add(id);
    console.log(`Notification ${id} marked as deleted`);
  }

  /**
   * Add multiple notification IDs to the deleted list
   * @param {Array<number>} ids - Array of notification IDs to mark as deleted
   */
  addDeletedNotifications(ids) {
    ids.forEach(id => {
      this.deletedNotificationIds.add(id);
      this.processedNotificationIds.add(id);
    });
    console.log(`${ids.length} notifications marked as deleted`);
  }

  /**
   * Mark a notification as read
   * @param {number} id - Notification ID to mark as read
   */
  markNotificationAsRead(id) {
    this.readNotificationIds.add(id);
    console.log(`Notification ${id} marked as read`);
  }

  /**
   * Poll for new notifications by comparing with previously seen notifications
   */
  async pollForNotifications() {
    if (!this.canPoll) return;
    
    // Throttle polls
    this.canPoll = false;
    setTimeout(() => {
      this.canPoll = true;
    }, this.throttleTimeout);
    
    try {
      this.activeCount++;
      
      // Since we don't have getNewNotifications, we'll use getNotifications
      // and compare with our lists of processed and deleted notifications
      const response = await getNotifications({ per_page: 20 }); // Fetch more to ensure we catch new ones
      const notifications = response.data || [];
      
      // Find new notifications by filtering out ones we've already processed or deleted
      const newNotifications = notifications.filter(notification => {
        // Skip if we've already processed this notification
        if (this.processedNotificationIds.has(notification.id)) {
          return false;
        }
        
        // Skip if this notification was previously deleted
        if (this.deletedNotificationIds.has(notification.id)) {
          return false;
        }
        
        // This is a new notification we haven't seen before
        // Add it to our processed set so we don't show it again
        this.processedNotificationIds.add(notification.id);
        
        // If it's already marked as read on the server, track that too
        if (notification.is_read) {
          this.readNotificationIds.add(notification.id);
        }
        
        return true;
      });
      
      // If new notifications found, publish event
      if (newNotifications.length > 0) {
        console.log(`Found ${newNotifications.length} new notifications`);
        
        // Publish event for components to react
        NotificationEventBus.publish('NEW_NOTIFICATIONS', {
          notifications: newNotifications,
          timestamp: new Date().toISOString()
        });
        
        // Play notification sound
        this.playNotificationSound();
        
        // Speed up polling when activity is detected
        this.decreasePollInterval();
      } else {
        // No new notifications, gradually increase polling interval
        this.increasePollInterval();
      }
      
      // Also update the unread count if tab is visible
      if (document.visibilityState === 'visible') {
        const countResponse = await getUnreadCount();
        if (countResponse) {
          NotificationEventBus.publish('UNREAD_COUNT_UPDATED', {
            count: countResponse.total || 0,
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Update last fetch time
      this.lastFetchTime = new Date();
    } catch (error) {
      console.error('Error polling for notifications:', error);
      
      // On error, increase poll interval to reduce server load
      this.increasePollInterval();
    } finally {
      this.activeCount--;
    }
  }

  /**
   * Increase poll interval (slower polling)
   */
  increasePollInterval() {
    const newInterval = Math.min(this.pollInterval * this.backoffFactor, this.maxPollInterval);
    
    if (newInterval !== this.pollInterval) {
      this.pollInterval = newInterval;
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.pollForNotifications();
        }, this.pollInterval);
      }
      
      console.log(`Increased poll interval to ${this.pollInterval}ms`);
    }
  }

  /**
   * Decrease poll interval (faster polling)
   */
  decreasePollInterval() {
    const newInterval = Math.max(this.pollInterval / this.backoffFactor, this.minPollInterval);
    
    if (newInterval !== this.pollInterval) {
      this.pollInterval = newInterval;
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.pollForNotifications();
        }, this.pollInterval);
      }
      
      console.log(`Decreased poll interval to ${this.pollInterval}ms`);
    }
  }

  /**
   * Setup activity tracking to adjust polling frequency
   * When user is active, poll more frequently
   */
  setupActivityTracking() {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      const now = new Date();
      const timeSinceLastActivity = now - this.lastActivity;
      
      // If user was inactive for more than 10 seconds and now active,
      // trigger an immediate poll and increase frequency
      if (timeSinceLastActivity > 10000) {
        this.decreasePollInterval();
        this.pollForNotifications();
      }
      
      this.lastActivity = now;
    };
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true });
    });
    
    // Also poll when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, polling for notifications');
        this.decreasePollInterval();
        this.pollForNotifications();
      } else {
        // When tab is hidden, slow down polling
        this.increasePollInterval();
      }
    });
  }

  /**
   * Setup audio for notification sounds
   * Uses Web Audio API for better compatibility
   */
  setupAudio() {
    if (this.setupComplete) return;
    
    try {
      // Create a hidden audio element
      this.fallbackAudio = new Audio();
      
      // Try different paths
      const possiblePaths = [
        '/notification.mp3',
        '/sounds/notification.mp3',
        '/assets/sounds/notification.mp3',
        '/audio/notification.mp3',
        process.env.PUBLIC_URL + '/notification.mp3'
      ];
      
      // Function to test a path
      const testPath = (index) => {
        if (index >= possiblePaths.length) {
          console.error('Could not find notification sound file');
          return;
        }
        
        this.fallbackAudio.src = possiblePaths[index];
        
        // Add load event
        this.fallbackAudio.addEventListener('canplaythrough', () => {
          console.log(`Fallback audio loaded from ${possiblePaths[index]}`);
          this.setupComplete = true;
          
          // Attempt to play and immediately pause to enable audio
          const enableAudio = () => {
            const playPromise = this.fallbackAudio.play();
            if (playPromise !== undefined) {
              playPromise.then(() => {
                this.fallbackAudio.pause();
                this.fallbackAudio.currentTime = 0;
                console.log('Fallback audio enabled');
              }).catch(e => {
                console.log('Could not enable fallback audio yet');
              });
            }
            
            // Remove listeners after first interaction
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
          };
          
          // Add listeners to enable audio on user interaction
          document.addEventListener('click', enableAudio, { once: true });
          document.addEventListener('keydown', enableAudio, { once: true });
          document.addEventListener('touchstart', enableAudio, { once: true });
        }, { once: true });
        
        // Add error event to try next path
        this.fallbackAudio.addEventListener('error', () => {
          console.log(`Could not load audio from ${possiblePaths[index]}, trying next...`);
          testPath(index + 1);
        }, { once: true });
        
        // Start loading
        this.fallbackAudio.load();
      };
      
      // Start testing paths
      testPath(0);
    } catch (error) {
      console.error('Error setting up fallback audio:', error);
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    if (!this.setupComplete) return;
    
    try {
      if (this.fallbackAudio) {
        // Fallback approach using Audio element
        this.fallbackAudio.currentTime = 0;
        this.fallbackAudio.volume = 0.5;
        
        const playPromise = this.fallbackAudio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Fallback audio play failed:', error);
          });
        }
        console.log('Played notification sound using fallback Audio');
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;