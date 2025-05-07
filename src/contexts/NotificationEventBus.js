// src/contexts/NotificationEventBus.js

// Simple event bus for direct communication between components
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
  
  export default NotificationEventBus;