import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import baseurl from '../ApiService/ApiService';

const DriverAdd = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_of_birth: null,
    vehicle_type: '',
    vehicle_number: '',
    vehicle: '',
    license_number: '',
    license_expiry_date: null,
    phone: '',
    emergency_phone: '',
    state: '',
    country: '',
    status: 'Available'
  });

  const [files, setFiles] = useState({
    driver_image: null,
    id_proof: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const vehicleTypes = ['truck', 'Bike', 'Car', 'Van', 'Scooter'];
  const vehicleConditions = ['Excellent', 'Good', 'Fair', 'Poor'];
  const statusOptions = ['Available', 'On Delivery', 'On Break', 'Offline'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'first_name', 'last_name', 'email', 'password', 'date_of_birth',
      'vehicle_type', 'vehicle_number', 'vehicle', 'license_number',
      'license_expiry_date', 'phone', 'emergency_phone', 'state', 'country'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setMessage({ type: 'error', text: `${field.replace('_', ' ')} is required` });
        return false;
      }
    }

    if (!files.driver_image) {
      setMessage({ type: 'error', text: 'Driver image is required' });
      return false;
    }

    if (!files.id_proof) {
      setMessage({ type: 'error', text: 'ID proof is required' });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return false;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return false;
    }

    if (!phoneRegex.test(formData.emergency_phone)) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit emergency phone number' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          if (key === 'date_of_birth' || key === 'license_expiry_date') {
            formDataToSend.append(key, formData[key].toISOString().split('T')[0]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Add files
      formDataToSend.append('driver_image', files.driver_image);
      formDataToSend.append('id_proof', files.id_proof);

      const response = await fetch(`${baseurl}/api/driver-details/create`, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Driver added successfully!' });
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          date_of_birth: null,
          vehicle_type: '',
          vehicle_number: '',
          vehicle: '',
          license_number: '',
          license_expiry_date: null,
          phone: '',
          emergency_phone: '',
          state: '',
          country: '',
          status: 'Available'
        });
        setFiles({
          driver_image: null,
          id_proof: null
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to add driver' });
      }
    } catch (error) {
      console.error('Error adding driver:', error);
      setMessage({ type: 'error', text: 'An error occurred while adding the driver' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00A67E', fontWeight: 'bold' }}>
        Add New Driver
      </Typography>

      <Card sx={{ maxWidth: 1200, margin: '0 auto' }}>
        <CardContent>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#00A67E' }}>
                  Personal Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.date_of_birth}
                    onChange={(value) => handleDateChange('date_of_birth', value)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Emergency Phone"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              {/* Vehicle Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#00A67E', mt: 2 }}>
                  Vehicle Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleInputChange}
                    label="Vehicle Type"
                  >
                    {vehicleTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicle_number"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Vehicle Condition</InputLabel>
                  <Select
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleInputChange}
                    label="Vehicle Condition"
                  >
                    {vehicleConditions.map((condition) => (
                      <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="License Expiry Date"
                    value={formData.license_expiry_date}
                    onChange={(value) => handleDateChange('license_expiry_date', value)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* File Uploads */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#00A67E', mt: 2 }}>
                  Documents
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="driver-image-upload"
                  type="file"
                  name="driver_image"
                  onChange={handleFileChange}
                />
                <label htmlFor="driver-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ height: 56, borderColor: '#00A67E', color: '#00A67E' }}
                  >
                    {files.driver_image ? files.driver_image.name : 'Upload Driver Image'}
                  </Button>
                </label>
              </Grid>

              <Grid item xs={12} md={6}>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="id-proof-upload"
                  type="file"
                  name="id_proof"
                  onChange={handleFileChange}
                />
                <label htmlFor="id-proof-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ height: 56, borderColor: '#00A67E', color: '#00A67E' }}
                  >
                    {files.id_proof ? files.id_proof.name : 'Upload ID Proof'}
                  </Button>
                </label>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      backgroundColor: '#00A67E',
                      '&:hover': {
                        backgroundColor: '#008f6b'
                      },
                      minWidth: 200,
                      height: 50
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Add Driver'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DriverAdd;
