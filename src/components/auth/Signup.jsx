import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  PersonAdd, 
  Facebook, 
  Google, 
  Twitter,
  LocalGroceryStore,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SignupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const steps = ['Personal Information', 'Account Details'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your signup logic here
    console.log('Signup with:', { firstName, lastName, email, password });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
            borderRadius: 2
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
                FreshVeggies
              </Typography>
            </Box>
          </Grow>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Your Account
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {activeStep === 0 ? (
              <Fade in timeout={500}>
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 2, mb: 2, py: 1.5, borderRadius: 2 }}
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                  >
                    Continue
                  </Button>
                </Box>
              </Fade>
            ) : (
              <Fade in timeout={500}>
                <Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
                    <Button
                      variant="outlined"
                      color="success"
                      size="large"
                      sx={{ py: 1.5, borderRadius: 2, flex: 1 }}
                      onClick={handleBack}
                      startIcon={<ArrowBack />}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      size="large"
                      sx={{ py: 1.5, borderRadius: 2, flex: 1 }}
                      endIcon={<PersonAdd />}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR SIGN UP WITH
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
              <IconButton 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  p: 1
                }}
              >
                <Google />
              </IconButton>
              <IconButton 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  p: 1
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                sx={{ 
                  border: '1px solid', 
                  borderColor: 'divider',
                  p: 1
                }}
              >
                <Twitter />
              </IconButton>
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography component="span" color="success.main" fontWeight="bold">
                    Sign In
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default SignupPage;