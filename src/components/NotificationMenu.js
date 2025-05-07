import React, { useState, useContext } from 'react';
import {
  Menu,
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  Avatar,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  DeleteSweep as DeleteAllIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationMenu = ({ anchorEl, open, onClose }) => {
  const { 
    notifications, 
    notificationCount, 
    loading: notificationLoading, 
    markAllAsRead, 
    markAsRead,
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();
  
  // State for delete confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type if needed
    if (notification.type && notification.type.startsWith('budget_') && notification.related_id) {
      onClose();
      // Navigate to budgets page
      window.location.href = '/budgets';
    }
  };
  
  // Handle delete notification
  const handleDeleteClick = (event, notification) => {
    event.stopPropagation(); // Prevent notification click event
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete notification
  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete.id);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };
  
  // Handle delete all notifications
  const handleDeleteAllClick = () => {
    setDeleteAllDialogOpen(true);
  };
  
  // Confirm delete all notifications
  const confirmDeleteAll = () => {
    deleteAllNotifications();
    setDeleteAllDialogOpen(false);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            mt: 1.5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Modern Gradient Header with Actions */}
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(135deg, #3a8dff 0%, #1565c0 100%)', 
          color: 'white',
          borderRadius: '16px 16px 0 0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <Typography variant="h6" fontWeight={600} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: '1.1rem' 
          }}>
            <span role="img" aria-label="bell">🔔</span> Notifications
          </Typography>
          
          <Stack direction="row" spacing={1}>
            {notificationCount > 0 && (
              <Tooltip title="Mark all as read">
                <Button 
                  size="small" 
                  onClick={markAllAsRead}
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    minWidth: 'auto',
                    p: 0.75,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.25)',
                    }
                  }}
                >
                  <CheckIcon fontSize="small" />
                </Button>
              </Tooltip>
            )}
            
            {notifications.length > 0 && (
              <Tooltip title="Delete all notifications">
                <Button 
                  size="small" 
                  onClick={handleDeleteAllClick}
                  sx={{ 
                    color: 'white', 
                    textTransform: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    minWidth: 'auto',
                    p: 0.75,
                    '&:hover': {
                      background: 'rgba(255,70,70,0.25)',
                    }
                  }}
                >
                  <DeleteAllIcon fontSize="small" />
                </Button>
              </Tooltip>
            )}
          </Stack>
        </Box>
        
        {/* Loading State */}
        {notificationLoading ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading your updates...
            </Typography>
          </Box>
        ) : notifications.length > 0 ? (
          // Notification List
          <List sx={{ py: 1, px: 0 }}>
            {notifications.map((notification) => (
              <ListItem 
                key={notification.id} 
                onClick={() => handleNotificationClick(notification)}
                sx={{ 
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  bgcolor: notification.is_read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                  '&:hover': { 
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    transform: 'translateX(4px)'
                  },
                  '&:last-child': {
                    borderBottom: 'none'
                  }
                }}
                disablePadding
              >
                <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
                  {/* Notification Icon with Emoji */}
                  <Box sx={{ mr: 2, mt: 0.5 }}>
                    {notification.type && notification.type.includes('exceeded') ? (
                      <Avatar sx={{ 
                        bgcolor: 'error.light', 
                        width: 36, 
                        height: 36,
                        boxShadow: '0 3px 8px rgba(211, 47, 47, 0.3)'
                      }}>
                        <span role="img" aria-label="alert" style={{ fontSize: '18px' }}>⚠️</span>
                      </Avatar>
                    ) : notification.type && notification.type.includes('warning') ? (
                      <Avatar sx={{ 
                        bgcolor: 'warning.light', 
                        width: 36, 
                        height: 36,
                        boxShadow: '0 3px 8px rgba(237, 108, 2, 0.3)'
                      }}>
                        <span role="img" aria-label="warning" style={{ fontSize: '18px' }}>📊</span>
                      </Avatar>
                    ) : notification.type && notification.type.includes('approaching') ? (
                      <Avatar sx={{ 
                        bgcolor: 'info.light', 
                        width: 36, 
                        height: 36,
                        boxShadow: '0 3px 8px rgba(2, 136, 209, 0.3)'
                      }}>
                        <span role="img" aria-label="info" style={{ fontSize: '18px' }}>📈</span>
                      </Avatar>
                    ) : (
                      <Avatar sx={{ 
                        bgcolor: 'primary.light', 
                        width: 36, 
                        height: 36,
                        boxShadow: '0 3px 8px rgba(25, 118, 210, 0.3)'
                      }}>
                        <span role="img" aria-label="notification" style={{ fontSize: '18px' }}>📌</span>
                      </Avatar>
                    )}
                  </Box>
                  
                  {/* Notification Content */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={notification.is_read ? 500 : 700}
                      sx={{ 
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: notification.is_read ? 'text.primary' : 'primary.dark',
                        fontSize: '0.9rem'
                      }}
                    >
                      {notification.title}
                      {!notification.is_read && (
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            ml: 1,
                            position: 'relative',
                            top: -2
                          }}
                        />
                      )}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        fontSize: '0.85rem'
                      }}
                    >
                      {notification.message}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          fontSize: '0.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <span role="img" aria-label="time" style={{ fontSize: '0.7rem', opacity: 0.7 }}>🕒</span>
                        {new Date(notification.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                      
                      {/* Delete button */}
                      <Tooltip title="Delete notification">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleDeleteClick(e, notification)}
                          sx={{ 
                            color: 'text.secondary',
                            opacity: 0.6,
                            '&:hover': { 
                              color: 'error.main',
                              opacity: 1
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          // Empty State
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ fontSize: '3rem', mb: 2 }}>
              <span role="img" aria-label="no notifications">🔕</span>
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              You'll see budget alerts and important updates here
            </Typography>
          </Box>
        )}
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 5,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1 
        }}>
          <DeleteIcon color="error" />
          Delete Notification
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this notification?
          </Typography>
          {notificationToDelete && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'background.paper',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider' 
            }}>
              <Typography variant="subtitle2" gutterBottom>
                {notificationToDelete.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {notificationToDelete.message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete All Confirmation Dialog */}
      <Dialog
        open={deleteAllDialogOpen}
        onClose={() => setDeleteAllDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 5,
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'error.main'
        }}>
          <DeleteAllIcon color="error" />
          Delete All Notifications
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to delete all notifications? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will lose all notification history including budget alerts and system messages.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteAllDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteAll}
            color="error"
            variant="contained"
            startIcon={<DeleteAllIcon />}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationMenu;