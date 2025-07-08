import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  InputAdornment, 
  IconButton,
  Divider,
  Fade,
  Grow,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login, 
  Facebook, 
  Google, 
  Twitter,
  LocalGroceryStore
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App'; // Import the useAuth hook
import baseurl from '../ApiService/ApiService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // Get login function and auth status

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(baseurl + '/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      
      // Debug: Log the entire response to see what we're getting
      console.log('API Response:', data);
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      if (response.ok) {
        // Login successful
        setSuccess('Login successful! Redirecting...');
        
        // Extract token and user data from response
        const token = data.token || data.accessToken || data.authToken || data.access_token;
        const userData = data.user || data.data || data.userInfo || data.profile || {
          email: email,
          name: data.name || email.split('@')[0],
          id: data.id || data.userId || Date.now()
        };

        // Use the auth context login function
        if (token && userData) {
          login(token, userData);
          console.log('Login successful, redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          // Fallback: even without perfect token/user structure, try to login
          console.warn('Token or user data missing, using fallback approach');
          const fallbackToken = token || 'session_' + Date.now();
          const fallbackUser = userData || { 
            email, 
            name: email.split('@')[0], 
            id: Date.now() 
          };
          login(fallbackToken, fallbackUser);
          navigate('/dashboard');
        }

      } else {
        // Handle error response
        console.error('Login failed with response:', data);
        setError(data.message || data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Debug function to check localStorage (you can call this from browser console)
  const checkLocalStorage = () => {
  };

  // Expose debug function to window for easy access
  React.useEffect(() => {
    window.checkLocalStorage = checkLocalStorage;
    return () => {
      delete window.checkLocalStorage;
    };
  }, []);

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Fade in timeout={1000}>
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Grow in timeout={1200}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3 
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 0 }}
              >
                <LocalGroceryStore 
                  color="success" 
                  fontSize="large" 
                  sx={{ mr: 1 }} 
                />
              </motion.div>
              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Velaan Mart
              </Typography>
            </Box>
          </Grow>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Welcome Back!
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              variant="outlined"
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            {/* <Typography 
              variant="body2" 
              align="right" 
              sx={{ mt: 1, mb: 2, color: 'primary.main', cursor: 'pointer' }}
            >
              Forgot Password?
            </Typography> */}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="success"
              size="large"
              sx={{ mt: 2, mb: 3, py: 1.5, borderRadius: 2 }}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Login />}
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default LoginPage;