import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, FormControl,
  InputLabel, Select, MenuItem, IconButton, Divider, Alert, Snackbar, Breadcrumbs, Link
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerEditAccount() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetch(`${baseurl}/api/customer-profile/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        const customer = data?.data;
        if (customer) {
          setFormData({
            name: customer.contact_person_name || '',
            email: customer.contact_person_email || '',
            phone: customer.contact_person_phone || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            pincode: customer.postal_code?.replace(/\s/g, '') || '',
            status: 'Active'
          });
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setSnackbar({
          open: true,
          message: 'Failed to fetch customer details',
          severity: 'error'
        });
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Customer name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?\d{10,12}$/.test(formData.phone.replace(/\s/g, '')))
      newErrors.phone = 'Phone number is invalid';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Please correct the errors in the form', severity: 'error' });
      return;
    }

    const updatedData = {
      contact_person_name: formData.name,
      contact_person_email: formData.email,
      contact_person_phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.pincode
    };

    try {
      const response = await fetch(`${baseurl}/api/customer-profile/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      setSnackbar({ open: true, message: 'Customer details updated successfully!', severity: 'success' });
      setTimeout(() => navigate('/customer'), 1500);
    } catch (error) {
      console.error('Update error:', error);
      setSnackbar({ open: true, message: 'Failed to update customer', severity: 'error' });
    }
  };

  const handleCancel = () => navigate(-1);
  const handleBack = () => navigate(-1);
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/customer">Customer Management</Link>
        <Typography color="text.primary">Edit ustomer Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3}>Edit Customer Details</Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Customer Name" name="name" value={formData.name}
                onChange={handleChange} error={!!errors.name} helperText={errors.name} required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Email Address" name="email" value={formData.email}
                onChange={handleChange} error={!!errors.email} helperText={errors.email} required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Phone Number" name="phone" value={formData.phone}
                onChange={handleChange} error={!!errors.phone} helperText={errors.phone} required
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Address Information</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth label="Address" name="address" value={formData.address}
                onChange={handleChange} error={!!errors.address} helperText={errors.address} required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth label="City" name="city" value={formData.city}
                onChange={handleChange} error={!!errors.city} helperText={errors.city} required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth label="State" name="state" value={formData.state}
                onChange={handleChange} error={!!errors.state} helperText={errors.state} required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth label="Pincode" name="pincode" value={formData.pincode}
                onChange={handleChange} error={!!errors.pincode} helperText={errors.pincode} required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#00A67E', '&:hover': { bgcolor: '#007a5e' }, mr: 2 }}>
                  Edid Customer
                </Button>
                <Button variant="outlined" onClick={() => navigate('/customer')}>
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
