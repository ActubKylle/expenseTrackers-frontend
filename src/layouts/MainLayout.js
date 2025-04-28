import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, IconButton, Typography, Drawer, Divider, 
  List, ListItem, ListItemIcon, ListItemText, Box, useTheme, useMediaQuery, 
  Menu, MenuItem, Avatar, Badge, Paper, Button
} from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard, Category, 
  AccountCircle, Logout, BarChart, ChevronLeft, ChevronRight,
  Savings as SavingsIcon, Notifications as NotificationsIcon,
  AccountBalanceWallet
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const drawerWidth = 280;
const miniDrawerWidth = 80;

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

// Define which routes should hide the header title
const hideHeaderRoutes = ['/dashboard', '/expenses', '/categories', '/budgets'];

const MainLayout = ({ children, hideHeader = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [miniDrawer, setMiniDrawer] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  
  // Check if the header should be hidden based on the current route
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) || hideHeader;

  // Add useEffect to update the page title based on current route
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
  
      // navigate('/register ');
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

  // Enhanced drawer content with better transitions and visual effects
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
        <Toolbar sx={{ minHeight: 56, height: 56 }}> {/* Set explicit height */}
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
                  fontSize: '1.1rem', // Reduced size
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> {/* Reduced gap */}
              <IconButton
                color="inherit"
                aria-label="notifications"
                onClick={handleNotificationOpen}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(8px)',
                  padding: 1, // Reduced padding
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <Badge
                  badgeContent={3}
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
                  p: 0.4, // Reduced padding
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
                    width: 28, // Reduced size 
                    height: 28, // Reduced size
                    bgcolor: 'primary.light',
                    fontWeight: 600,
                    fontSize: '0.8rem', // Reduced font size
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={notificationAnchorEl}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationClose}
                PaperProps={{
                  sx: {
                    width: 320,
                    maxHeight: 400,
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
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '8px 8px 0 0' }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
                    Notifications
                  </Typography>
                </Box>
                <MenuItem 
                  onClick={handleNotificationClose}
                  sx={{ 
                    borderRadius: '8px', 
                    my: 1,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.light', 
                      transform: 'translateX(4px)' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2">Budget Alert</Typography>
                    <Typography variant="body2" color="text.secondary">
                      You've reached 90% of your Food budget (₱3,000)
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={handleNotificationClose}
                  sx={{ 
                    borderRadius: '8px', 
                    my: 1,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'primary.light',
                      transform: 'translateX(4px)' 
                    } 
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2">New Feature</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try our new budget planning tool!
                    </Typography>
                  </Box>
                </MenuItem>
              </Menu>

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