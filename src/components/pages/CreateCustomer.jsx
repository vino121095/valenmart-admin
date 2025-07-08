import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  Breadcrumbs,
  Link,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import baseurl from '../ApiService/ApiService';

export default function CustomerRegistrationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institution_name: '',
    institution_type: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.institution_name) newErrors.institution_name = 'Institution name is required';
    if (!formData.institution_type) newErrors.institution_type = 'Institution type is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.postal_code) newErrors.postal_code = 'Postal code is required';
    if (!formData.contact_person_name) newErrors.contact_person_name = 'Contact name is required';
    if (!formData.contact_person_email) {
      newErrors.contact_person_email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.contact_person_email)) {
      newErrors.contact_person_email = 'Invalid email format';
    }
    if (!formData.contact_person_phone) newErrors.contact_person_phone = 'Phone is required';
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const payload = {
      institution_name: formData.institution_name,
      institution_type: formData.institution_type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postal_code: formData.postal_code,
      contact_person_name: formData.contact_person_name,
      contact_person_email: formData.contact_person_email,
      contact_person_phone: formData.contact_person_phone,
      password: formData.password
    };

    try {
      const response = await fetch(baseurl + '/api/customer-profile/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Customer profile created successfully!');
        navigate('/customer');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create customer profile.');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/" sx={{ color: '#00A67E', fontWeight: 500, fontSize: '0.875rem' }}>
          Dashboard
        </Link>
        <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
          Customer Management
        </Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ color: '#00A67E', fontWeight: 'bold', mb: 2 }}>
            Institution Details
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Institution Name" name="institution_name" value={formData.institution_name} onChange={handleChange} error={!!errors.institution_name} helperText={errors.institution_name} required />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth select label="Institution Type" name="institution_type" value={formData.institution_type} onChange={handleChange} error={!!errors.institution_type} helperText={errors.institution_type} required>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="College">College</MenuItem>
                <MenuItem value="University">University</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} error={!!errors.address} helperText={errors.address} required />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} error={!!errors.state} helperText={errors.state} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} error={!!errors.postal_code} helperText={errors.postal_code} required />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ color: '#00A67E', fontWeight: 'bold', mb: 2 }}>
            Contact Person
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Contact Person Name" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} error={!!errors.contact_person_name} helperText={errors.contact_person_name} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="contact_person_email" value={formData.contact_person_email} onChange={handleChange} error={!!errors.contact_person_email} helperText={errors.contact_person_email} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" name="contact_person_phone" value={formData.contact_person_phone} onChange={handleChange} error={!!errors.contact_person_phone} helperText={errors.contact_person_phone} required />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" sx={{ color: '#00A67E', fontWeight: 'bold', mb: 2 }}>
            Login Credentials
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="password" label="Password" name="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="password" label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={!!errors.confirmPassword} helperText={errors.confirmPassword} required />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => navigate('/customer')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#00A67E', '&:hover': { bgcolor: '#007a5e' } }}>
              Create Customer
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
