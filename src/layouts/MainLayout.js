import React, { useState, useEffect, useRef } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Drawer, Divider, 
  List, ListItem, ListItemIcon, ListItemText, Box, useTheme, useMediaQuery, 
  Menu, MenuItem, Avatar, Badge, Paper, Button, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Tooltip, Stack
} from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard, Category, 
  AccountCircle, Logout, BarChart, ChevronLeft, ChevronRight,
  Savings as SavingsIcon, Notifications as NotificationsIcon,
  AccountBalanceWallet, ErrorOutline as ErrorOutlineIcon,
  WarningAmber as WarningAmberIcon, InfoOutlined as InfoOutlinedIcon,
  NotificationsNone as NotificationsNoneIcon, NotificationsOff as NotificationsOffIcon,
  Delete as DeleteIcon, DeleteSweep as DeleteAllIcon, Check as CheckIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../api/notifications';
import NotificationEventBus from '../contexts/NotificationEventBus';

// Define drawer dimensions
const drawerWidth = 280;
const miniDrawerWidth = 80;

// Define which routes should hide the header title
const hideHeaderRoutes = ['/dashboard', '/expenses', '/categories', '/budgets'];

// Define styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  minHeight: 56, // Reduced from 64px
  justifyContent: 'space-between',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
}));

// Enhanced StyledListItem with better animation and visual effects
const StyledListItem = styled(ListItem)(({ theme, active, mini }) => ({
  margin: '8px 12px',
  borderRadius: '16px',
  padding: mini ? '14px 10px' : '10px 16px',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '25',
    transform: 'translateX(4px)',
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
      transform: 'scale(1.1)',
      transition: 'all 0.3s ease',
    },
    '&::after': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '10%',
    width: '80%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
    opacity: 0,
    transform: 'scale(0.8)',
    transition: 'all 0.3s ease',
  },
  ...(active && {
    backgroundColor: theme.palette.primary.light + '40',
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      height: '70%',
      width: '4px',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 4px 4px 0',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 700,
    },
    '&::after': {
      opacity: 1,
      transform: 'scale(1)',
    },
  }),
}));

const StyledAppBar = styled(AppBar)(({ theme, open, miniDrawer }) => ({
  width: {
    xs: '100%',
    md: open ? `calc(100% - ${miniDrawer ? miniDrawerWidth : drawerWidth}px)` : '100%'
  },
  marginLeft: {
    xs: 0,
    md: open ? (miniDrawer ? miniDrawerWidth : drawerWidth) : 0
  },
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  minHeight: 56, // Reduced from 70px
  height: 56,     // Reduced from 70px
  boxShadow: 'none',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid',
  borderColor: 'rgba(255, 255, 255, 0.12)',
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
}));

// Enhanced drawer header with better gradients and animations
const StyledDrawerHeader = styled(DrawerHeader)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(0, 2),
  minHeight: 56, // Reduced from 70px
  height: 56,     // Added explicit height
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
    animation: 'shimmer 4s infinite linear',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  }
}));

// Add a stylized section header for drawer sections
const SectionHeader = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0, 3, 0.5, 3),
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: theme.palette.text.secondary,
  background: `linear-gradient(90deg, ${theme.palette.text.secondary}, transparent)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  opacity: 0.8,
}));

const MainLayout = ({ children, hideHeader = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Add the audioRef definition
  const audioRef = useRef(null);

  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [miniDrawer, setMiniDrawer] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  // State for delete dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  
  // Check if the header should be hidden based on the current route
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) || hideHeader;

  // Function to fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await getNotifications({ per_page: 10 });
      setNotifications(response.data || []);
      
      // Update unread count
      const countResponse = await getUnreadCount();
      setNotificationCount(countResponse.total || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Function to handle marking a notification as read
  const handleNotificationRead = async (id) => {
    try {
      await markAsRead(id);
      // Update notifications
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
      // Decrement unread count
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Function to mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Update all notifications to read
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, is_read: true }))
      );
      // Reset unread count
      setNotificationCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification deletion
  const handleDeleteClick = (e, notification) => {
    e.stopPropagation(); // Prevent notification click event
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };
  
  // Function to delete a notification
  const handleDeleteNotification = async () => {
    if (!notificationToDelete) return;
    
    try {
      await deleteNotification(notificationToDelete.id);
      
      // Update the notifications list by removing the deleted notification
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
      
      // Update unread count if needed
      if (!notificationToDelete.is_read) {
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
      
      setNotificationToDelete(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting notification:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete notification',
        icon: 'error',
        timer: 2000
      });
    }
  };
  
  // Function to delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      
      // Clear the notifications list
      setNotifications([]);
      setNotificationCount(0);
      setDeleteAllDialogOpen(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete all notifications',
        icon: 'error',
        timer: 2000
      });
    }
  };

  // Preload notification sound for better playback performance
  useEffect(() => {
    // Create audio element if it doesn't exist yet
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Try a couple different paths to find the audio file
      // This helps solve path issues depending on your project structure
      const possiblePaths = [
        '/notification.mp3',
        '/sounds/notification.mp3',
        '/assets/sounds/notification.mp3',
        '/audio/notification.mp3',
        process.env.PUBLIC_URL + '/notification.mp3'
      ];
      
      // Test loading the audio file from different paths
      const testAudio = (paths, index = 0) => {
        if (index >= paths.length) {
          console.error('Could not find notification sound file');
          return;
        }
        
        audioRef.current.src = paths[index];
        audioRef.current.volume = 0.5;
        
        // Try to load the audio file
        audioRef.current.addEventListener('error', () => {
          console.log(`Audio file not found at ${paths[index]}, trying next path...`);
          testAudio(paths, index + 1);
        }, { once: true });
        
        // Preload audio
        audioRef.current.load();
      };
      
      testAudio(possiblePaths);
      
      // Define enableAudio function
      const enableAudio = () => {
        // Try to play and immediately pause to enable audio
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          console.log('Audio enabled for future notifications');
        }).catch(e => {
          console.log('Audio still not enabled, will try again on next interaction');
        });
      };
      
      // Add the listener to multiple interaction events
      document.addEventListener('click', enableAudio, { once: true });
      document.addEventListener('touchstart', enableAudio, { once: true });
      document.addEventListener('keydown', enableAudio, { once: true });
      
      return () => {
        // Cleanup event listeners when component unmounts
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
        document.removeEventListener('keydown', enableAudio);
      };
    }
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (!audioRef.current) return;
    
    // Reset the audio to the beginning
    audioRef.current.currentTime = 0;
    
    // Play the sound
    audioRef.current.play().catch(e => {
      console.log('Audio play failed: Browser requires user interaction first');
    });
  };

  // Subscribe to notification events for real-time updates
  useEffect(() => {
    // Function to handle new notifications
    const handleNewNotification = (data) => {
      console.log("New notification received in MainLayout:", data);
      
      // Play notification sound
      playNotificationSound();
      
      // Fetch the latest notifications
      fetchNotifications();
    };
    
    // Subscribe to the NEW_NOTIFICATIONS event
    const unsubscribe = NotificationEventBus.subscribe('NEW_NOTIFICATIONS', handleNewNotification);
    
    // Cleanup subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch notifications when notification drawer opens
  useEffect(() => {
    if (notificationAnchorEl) {
      fetchNotifications();
    }
  }, [notificationAnchorEl]);

  // Poll for new notifications periodically
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getUnreadCount();
        setNotificationCount(response.total || 0);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up polling every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Keep your existing useEffect for page title updates
  useEffect(() => {
    let currentTitle = "Expense Tracker";
    let currentPageTitle = "Dashboard";
    
    // Determine title based on current path
    if (location.pathname === '/dashboard') {
      currentTitle = "Dashboard | Expense Tracker";
      currentPageTitle = "Dashboard";
    } else if (location.pathname === '/expenses') {
      currentTitle = "Expenses | Expense Tracker";
      currentPageTitle = "Manage Expenses";
    } else if (location.pathname === '/categories') {
      currentTitle = "Categories | Expense Tracker";
      currentPageTitle = "Expense Categories";
    } else if (location.pathname === '/budgets') {
      currentTitle = "Budgets | Expense Tracker";
      currentPageTitle = "Budget Management";
    } else if (location.pathname === '/profile') {
      currentTitle = "Profile | Expense Tracker";
      currentPageTitle = "User Profile";
    }
    
    // Update document title
    document.title = currentTitle;
    setPageTitle(currentPageTitle);
  }, [location.pathname]);

  // Keep your existing drawer open/close handlers
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Add the logout handler
  const handleLogout = async () => {
    handleMenuClose();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    });
  
    if (result.isConfirmed) {
      await logout();
      Swal.fire({
        title: 'Logged out!',
        text: 'You have been successfully logged out.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const toggleMiniDrawer = () => {
    if (!isMobile) {
      setMiniDrawer(prev => !prev);
    }
  };

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menuItems = [
    {
      section: 'Overview',
      items: [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
      ]
    },
    {
      section: 'Management',
      items: [
        { text: 'Expenses', icon: <Typography component="span" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>₱</Typography>, path: '/expenses' },
        { text: 'Categories', icon: <Category />, path: '/categories' },
        { text: 'Budgets', icon: <AccountBalanceWallet />, path: '/budgets' },
      ]
    },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  // Get user initials function
  const getUserInitials = () => {
    if (!user) return 'U';
    
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Define the drawerContent variable
  const drawerContent = (
    <>
      <StyledDrawerHeader>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          transition: 'all 0.3s ease-in-out',
          ml: miniDrawer ? -1 : 0 
        }}>
          <SavingsIcon sx={{ 
            color: 'white', 
            fontSize: 24, // Reduced from 28
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' },
            }
          }} />
          {!miniDrawer && (
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 700,
              fontSize: '1.1rem', // Reduced size
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px'
            }}>
              Expense Tracker
            </Typography>
          )}
        </Box>
        {!isMobile && (
          <IconButton 
            onClick={toggleMiniDrawer} 
            sx={{ 
              color: 'white',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'rotate(180deg)',
                background: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            {miniDrawer ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </StyledDrawerHeader>

      <Divider sx={{ 
        mb: 2, 
        opacity: 0.6,
        background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)'
      }} />

      <Box sx={{ 
        height: 'calc(100% - 56px)', // Adjusted from 70px
        overflowY: 'visible', 
        overflowX: 'hidden'
      }}>
        {menuItems.map((section, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            {!miniDrawer && (
              <SectionHeader>
                {section.section}
              </SectionHeader>
            )}
            <List sx={{ mt: 1 }}>
              {section.items.map((item) => (
                <StyledListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  active={isActiveRoute(item.path)}
                  mini={miniDrawer}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: miniDrawer ? 'auto' : 40,
                      transition: 'all 0.3s ease',
                      color: isActiveRoute(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!miniDrawer && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: isActiveRoute(item.path) ? 600 : 400,
                        transition: 'all 0.2s ease',
                      }}
                    />
                  )}
                  {miniDrawer && isActiveRoute(item.path) && (
                    <Box sx={{
                      position: 'absolute',
                      right: 4,
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                    }} />
                  )}
                </StyledListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" open={open} miniDrawer={miniDrawer}>
        <Toolbar sx={{ minHeight: 56, height: 56 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerOpen}
            sx={{
              mr: 2,
              ...(open && !isMobile && { display: 'none' }),
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                transform: 'rotate(180deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {(!open || isMobile) && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                animation: 'fadeIn 0.3s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0, transform: 'translateX(-10px)' },
                  '100%': { opacity: 1, transform: 'translateX(0)' },
                },
              }}
            >
              <SavingsIcon sx={{ color: 'white', fontSize: 22 }} />
              <Typography
                variant="h6"
                sx={{
                  flexGrow: 1,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  color: 'white',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                Expense Tracker
              </Typography>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="inherit"
                aria-label="notifications"
                onClick={handleNotificationOpen}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Badge
                  badgeContent={notificationCount}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: 10,
                      height: 16,
                      minWidth: 16,
                      padding: 0
                    },
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>

              <IconButton
                onClick={handleMenuClick}
                sx={{
                  p: 0.4,
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: 'primary.light',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>

              {/* Enhanced Notification Menu with Delete Options */}
              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationClose}
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
                          onClick={handleMarkAllAsRead}
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
                          onClick={() => setDeleteAllDialogOpen(true)}
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
                        onClick={() => {
                          if (!notification.is_read) {
                            handleNotificationRead(notification.id);
                          }
                          handleNotificationClose();
                          
                          // Handle navigation based on notification type if needed
                          if (notification.type && notification.type.startsWith('budget_') && notification.related_id) {
                            navigate('/budgets');
                          }
                        }}
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

              {/* User Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    width: 220,
                    mt: 1.5,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                    '& .MuiList-root': {
                      padding: '8px',
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem 
                  onClick={() => {
                    handleMenuClose();
                    navigate('/profile');
                  }}
                  sx={{ 
                    borderRadius: '8px', 
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.light',
                      transform: 'translateX(4px)' 
                    } 
                  }}
                >
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: '8px', 
                    my: 0.5,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.light',
                      transform: 'translateX(4px)' 
                    } 
                  }}
                >
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
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
                  <DialogContentText>
                    Are you sure you want to delete this notification?
                  </DialogContentText>
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
                    onClick={handleDeleteNotification}
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
                  <DialogContentText paragraph>
                    Are you sure you want to delete all notifications? This action cannot be undone.
                  </DialogContentText>
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
                    onClick={handleDeleteAllNotifications}
                    color="error"
                    variant="contained"
                    startIcon={<DeleteAllIcon />}
                  >
                    Delete All
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
        </Toolbar>
      </StyledAppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerClose}
        sx={{
          width: miniDrawer ? miniDrawerWidth : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: miniDrawer ? miniDrawerWidth : drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            boxShadow: '2px 0 16px rgba(0,0,0,0.08)',
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${miniDrawer ? miniDrawerWidth : drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          pt: { xs: 7, sm: 8 }, // Reduced from xs: 8, sm: 9 to account for smaller header
        }}
      >
        {/* Page Title with enhanced styling - now conditionally rendered */}
        {!shouldHideHeader && (
          <Box 
            sx={{ 
              mb: 3,
              animation: 'fadeInDown 0.5s ease-out',
              '@keyframes fadeInDown': {
                '0%': { opacity: 0, transform: 'translateY(-10px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  width: 60,
                  height: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  borderRadius: 2
                }
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
        )}

        {children}
      </Box>

      {isMobile && open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            zIndex: theme.zIndex.drawer - 1,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s',
          }}
          onClick={handleDrawerClose}
        />
      )}
    </Box>
  );
};

export default MainLayout;