import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Input,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import baseurl from '../ApiService/ApiService';

export default function DriverAdd() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    vehicle_type: '',
    vehicle_number: '',
    vehicle: '',
    license_number: '',
    license_expiry_date: '',
    id_proof: null,
    phone: '',
    emergency_phone: '',
    state: '',
    country: '',
    driver_image: null,
    status: '',
    last_login_time: '',
    last_logout_time: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const availableIdProofs = ['Aadhar', 'PAN', 'Voter ID', 'Passport'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'id_proof') {
      setFormData(prev => ({ ...prev, id_proof: files[0] }));
    } else if (name === 'driver_image') {
      setFormData(prev => ({ ...prev, driver_image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const bodyFormData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if ((key === 'driver_image' || key === 'id_proof') && value) {
          bodyFormData.append(key, value);
        } else if (value !== '' && key !== 'id_proof' && key !== 'driver_image') {
          bodyFormData.append(key, value);
        }
      });

      const response = await fetch(baseurl + '/api/driver-details/create', {
        method: 'POST',
        body: bodyFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add driver');
      }

      alert('Driver added successfully!');
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        date_of_birth: '',
        vehicle_type: '',
        vehicle_number: '',
        vehicle: '',
        license_number: '',
        license_expiry_date: '',
        id_proof: null,
        phone: '',
        emergency_phone: '',
        state: '',
        country: '',
        driver_image: null,
        status: '',
        last_login_time: '',
        last_logout_time: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f7', minHeight: '100vh', p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="green">
          Dashboard &gt; Driver & Delivery Management &gt; Add New Driver
        </Typography>
        <Typography variant="h5" fontWeight="bold" mt={3} mb={3}>
          Add New Driver
        </Typography>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Grid container spacing={2}>
            {/* Personal Info */}
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(prev => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Emergency Phone"
                name="emergency_phone"
                type="tel"
                value={formData.emergency_phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Vehicle Info */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Vehicle Type"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Vehicle Number"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Vehicle Condition"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* License */}
            <Grid item xs={12} md={6}>
              <TextField
                label="License Number"
                name="license_number"
                value={formData.license_number}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="License Expiry Date"
                name="license_expiry_date"
                type="date"
                value={formData.license_expiry_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* ID Proof Upload */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                ID Proof (Upload document):
              </Typography>
              <Input
                type="file"
                name="id_proof"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleChange}
                fullWidth
              />
              {formData.id_proof && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    ID Proof Preview:
                  </Typography>
                  {formData.id_proof.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(formData.id_proof)}
                      alt="ID Proof"
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Typography variant="body2">{formData.id_proof.name}</Typography>
                  )}
                </Box>
              )}
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <TextField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Driver Image Upload */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Driver Image (Upload driver's photo):
              </Typography>
              <Input
                type="file"
                name="driver_image"
                accept="image/*"
                onChange={handleChange}
                fullWidth
              />
              {formData.driver_image && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Image Preview:
                  </Typography>
                  <img
                    src={URL.createObjectURL(formData.driver_image)}
                    alt="Driver"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
            </Grid>

            {/* Profile Pic Upload */}
            <Grid item xs={12} md={6}>
              {/* Removed profile_pic upload field */}
            </Grid>
          </Grid>

          {/* Submit and Cancel */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Add Driver'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ textTransform: 'none' }}
              onClick={() => setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                date_of_birth: '',
                vehicle_type: '',
                vehicle_number: '',
                vehicle: '',
                license_number: '',
                license_expiry_date: '',
                id_proof: null,
                phone: '',
                emergency_phone: '',
                state: '',
                country: '',
                driver_image: null,
                status: '',
                last_login_time: '',
                last_logout_time: '',
              })}
            >
              Cancel
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </form>
      </Paper>
    </Box>
  );
}
