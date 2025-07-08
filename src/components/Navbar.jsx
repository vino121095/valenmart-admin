// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../App'; // Import the useAuth hook
import baseurl from "./ApiService/ApiService";
import velaanLogo from './assets/velaanLogo.png';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#f5f5f5',
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(12),
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(12),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#888',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  width: 40,
  height: 40,
  margin: '0 8px',
}));

const Navbar = ({ handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // Get logout function and user data from auth context
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const open = Boolean(anchorEl);
  // --- Notification states ---
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [adminNotificationsLoading, setAdminNotificationsLoading] = useState(false);
  const [adminNotificationAnchorEl, setAdminNotificationAnchorEl] = useState(null);
  const adminNotificationMenuOpen = Boolean(adminNotificationAnchorEl);
  const [admin_id, setAdmin_id] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userData'))?.aid;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!admin_id) return;
    let isMounted = true;

    const fetchAdminNotifications = () => {
      fetch(`${baseurl}/api/admin-notification/all/${admin_id}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) setAdminNotifications(data.notifications || []);
        })
        .catch(() => {
          if (isMounted) setAdminNotifications([]);
        })
        .finally(() => {
          if (isMounted) setAdminNotificationsLoading(false);
        });
    };

    setAdminNotificationsLoading(true);
    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 30000); // 30 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [admin_id]);

  // Debug function to check localStorage before logout
  const checkStorageBeforeLogout = () => {
    console.log('=== Before Logout - LocalStorage Contents ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}:`, localStorage.getItem(key));
    }
    console.log('==========================================');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    // Navigate to profile page
    console.log('Navigate to profile');
    navigate('/profile'); // Update this to your actual profile route
    handleMenuClose();
  };

  const handleSettings = () => {
    // Navigate to settings page
    console.log('Navigate to settings');
    navigate('/settings'); // Update this to your actual settings route
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    // Debug: Check what's in localStorage before logout
    checkStorageBeforeLogout();
    setLogoutDialogOpen(true);
    handleMenuClose();
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log('Starting logout process...');
      
      // Use the auth context logout function
      logout();
      
      // Clear sessionStorage as additional cleanup
      sessionStorage.clear();
      console.log('SessionStorage cleared');
      
      // Clear any cookies (if you're using them)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      console.log('Cookies cleared');
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to login page
      console.log('Redirecting to login...');
      navigate('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to redirect to login
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user) {
      return user.name || user.username || user.email?.split('@')[0] || 'User';
    }
    return 'User';
  };

  // Function to format time for notifications
  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, backgroundColor: '#fff', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img src={velaanLogo} alt="Velaan Mart Logo" style={{ height: '50px', width: 'auto', marginRight: 12 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Velaan Mart
            </Typography>
          </Box>
          
          <Box sx={{ width: { xs: '5%', sm: '10%' } }} />

          <Search sx={{ flexGrow: 1, maxWidth: { sm: 500 } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search here..."
              inputProps={{ 'aria-label': 'search' }}
              fullWidth
            />
          </Search>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Enhanced Admin Notifications Icon */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                onClick={(e) => setAdminNotificationAnchorEl(e.currentTarget)}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: 'rgba(0, 166, 126, 0.1)',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 166, 126, 0.15)',
                    border: '2px solid rgba(0, 166, 126, 0.3)',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Badge 
                  badgeContent={adminNotifications.filter(notif => !notif.is_read).length} 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#ff4757',
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '18px',
                      height: '18px',
                      fontSize: '0.75rem',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      animation: adminNotifications.filter(notif => !notif.is_read).length > 0 
                        ? 'notificationPulse 2s infinite' : 'none',
                    }
                  }}
                >
                  <NotificationsIcon 
                    sx={{ 
                      color: '#00a67e', 
                      fontSize: 22,
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                    }} 
                  />
                </Badge>
              </IconButton>
            </Box>
            
            {/* Settings Icon */}
            <IconContainer sx={{ backgroundColor: '#fff0f0', cursor: 'pointer' }} onClick={handleSettings}>
              <Badge 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    height: '20px',
                  }
                }}
              >
                <SettingsIcon sx={{ color: '#ef4444', fontSize: 20 }} />
              </Badge>
            </IconContainer>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Hello, {getUserDisplayName()}
                </Typography>
              </Box>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar 
                  alt={getUserDisplayName()} 
                  src={user?.avatar || user?.profilePicture || "/static/images/avatar/1.jpg"}
                >
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            {/* User Account Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon >
                <ListItemText>Account Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>

            {/* Enhanced Notification Menu */}
            <Menu
              anchorEl={adminNotificationAnchorEl}
              open={adminNotificationMenuOpen}
              onClose={() => setAdminNotificationAnchorEl(null)}
              PaperProps={{
                sx: {
                  maxHeight: 480,
                  width: 380,
                  padding: 0,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  mt: 1,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Enhanced Header */}
              <Box 
                sx={{ 
                  px: 3, 
                  py: 2, 
                  background: 'linear-gradient(135deg, #00a67e 0%, #00b386 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <NotificationsIcon sx={{ fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    Notifications
                  </Typography>
                </Box>
                {adminNotifications.filter(notif => !notif.is_read).length > 0 && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: '12px',
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {adminNotifications.filter(notif => !notif.is_read).length} new
                  </Box>
                )}
              </Box>

              {/* Notification Content */}
              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {adminNotificationsLoading ? (
                  <Box sx={{ p: 3 }}>
                    {[...Array(3)].map((_, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #f0f0f0, #e0e0e0)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              height: 14,
                              backgroundColor: '#f0f0f0',
                              borderRadius: 1,
                              mb: 1,
                              width: '80%',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                          <Box
                            sx={{
                              height: 12,
                              backgroundColor: '#f0f0f0',
                              borderRadius: 1,
                              width: '60%',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : adminNotifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                      No notifications
                    </Typography>
                    <Typography variant="body2">
                      You're all caught up! New notifications will appear here.
                    </Typography>
                  </Box>
                ) : (
                  adminNotifications.map((notif, idx) => (
                    <MenuItem
                      key={notif._id || idx}
                      sx={{
                        whiteSpace: 'normal',
                        alignItems: 'flex-start',
                        py: 2,
                        px: 3,
                        borderLeft: notif.is_read ? 'none' : '4px solid #00a67e',
                        backgroundColor: notif.is_read ? 'transparent' : 'rgba(0, 166, 126, 0.05)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: notif.is_read ? 'rgba(0,0,0,0.04)' : 'rgba(0, 166, 126, 0.08)',
                          transform: 'translateX(2px)',
                        },
                        '&:not(:last-of-type)': {
                          borderBottom: '1px solid rgba(0,0,0,0.06)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                        {/* Notification Icon */}
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: notif.is_read 
                              ? 'linear-gradient(45deg, #e0e0e0, #f0f0f0)' 
                              : 'linear-gradient(45deg, #00a67e, #00b386)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            mt: 0.5,
                          }}
                        >
                          <NotificationsIcon 
                            sx={{ 
                              fontSize: 18, 
                              color: notif.is_read ? '#888' : 'white' 
                            }} 
                          />
                        </Box>

                        {/* Notification Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: notif.is_read ? 400 : 600,
                              color: notif.is_read ? 'text.secondary' : 'text.primary',
                              mb: 0.5,
                              lineHeight: 1.4,
                            }}
                          >
                            {notif.message || notif.title || 'Notification'}
                          </Typography>
                          
                          {notif.createdAt && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {formatNotificationTime(notif.createdAt)}
                              </Typography>
                              {!notif.is_read && (
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: '#00a67e',
                                  }}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Box>

              {/* Enhanced Footer */}
              {adminNotifications.length > 0 && (
                <>
                  <Divider />
                  <Box 
                    sx={{ 
                      p: 2, 
                      backgroundColor: '#fafafa',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Button
                      size="small"
                      onClick={async () => {
                        try {
                          await fetch(`${baseurl}/api/admin-notification/mark-read/${admin_id}`, { 
                            method: 'PUT' 
                          });
                          // Update local state to reflect all notifications as read
                          setAdminNotifications(prev => 
                            prev.map(notif => ({ ...notif, is_read: true }))
                          );
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }}
                      disabled={adminNotifications.filter(notif => !notif.is_read).length === 0}
                      sx={{
                        color: '#00a67e',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 166, 126, 0.08)',
                        },
                        '&:disabled': {
                          color: 'text.disabled',
                        },
                      }}
                    >
                      Mark all as read
                    </Button>
                    
                    <Button
                      size="small"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)',
                        },
                      }}
                    >
                      View all
                    </Button>
                  </Box>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Logout Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout? You will need to login again to access your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleLogoutCancel}
            color="primary"
            disabled={isLoggingOut}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
            color="primary"
            variant="contained"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>

      <style>
        {`
          @keyframes notificationPulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 1; 
            }
            50% { 
              transform: scale(1.1); 
              opacity: 0.8; 
            }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;