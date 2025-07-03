// src/components/Navbar.js
import React, { useState } from 'react';
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
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Velaan Mart
          </Typography>

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
            {/* Notifications Icon */}
            <IconContainer sx={{ backgroundColor: '#e6f5ff' }}>
              <Badge 
                badgeContent={21} 
                color="primary"
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: '#3b82f6',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    height: '20px',
                  }
                }}
              >
                <NotificationsIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
              </Badge>
            </IconContainer>
            
            {/* Chat Icon */}
            {/* <IconContainer sx={{ backgroundColor: '#eeeeff' }}>
              <Badge 
                badgeContent={53} 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    height: '20px',
                  }
                }}
              >
                <ChatIcon sx={{ color: '#4f46e5', fontSize: 20 }} />
              </Badge>
            </IconContainer> */}
            
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

            {/* Dropdown Menu */}
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
    </>
  );
};

export default Navbar;