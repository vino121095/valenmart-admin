import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Container, Grid, Breadcrumbs,
  Link, MenuItem, FormControl, Select, InputLabel
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import baseurl from '../ApiService/ApiService';

const AssignDriver = () => {
  const location = useLocation();
  const order = location.state?.orderData || {};
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(order.DriversDetail?.first_name || '');
  const [driverId, setDriverId] = useState(order.driver_id || null);

  // Fetch driver data from API
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await fetch(`${baseurl}/api/driver-details/all`);
        const result = await res.json();
        setDrivers(result.data || []);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${baseurl}/api/order/update/${order.oid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_id: driverId, status: 'Out for Delivery' })
      });
      if (response.ok) {
        navigate(-1);
      } else {
        console.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDriverChange = (e) => {
    const selectedDid = e.target.value;
    const selected = drivers.find(driver => driver.did === selectedDid);
    setSelectedDriver(`${selected?.first_name} ${selected?.last_name}`);
    setDriverId(selectedDid);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" color="primary" href="#" sx={{ fontWeight: 500, color: '#10b981', '&:hover': { color: '#059669' } }}>Dashboard</Link>
        <Link underline="hover" color="primary" href="#" sx={{ fontWeight: 500, color: '#10b981', '&:hover': { color: '#059669' } }}>Customer Order Management</Link>
        <Typography color="text.primary" sx={{ fontWeight: 500, color: '#10b981' }}>Assign Driver</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4 }}>Assign Driver</Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Order details fields (same as before) */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500">Order ID</Typography>
            <TextField fullWidth variant="outlined" value={order.oid} readOnly />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500">Customer Name</Typography>
            <TextField fullWidth variant="outlined" value={order.CustomerProfile?.contact_person_name || ''} readOnly />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500">Delivery Address</Typography>
            <TextField fullWidth variant="outlined" value={order.CustomerProfile?.address || ''} readOnly />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500">Delivery Time Slot</Typography>
            <TextField fullWidth variant="outlined" value={order.delivery_time} readOnly />
          </Grid>

          {/* Dynamically loaded driver list */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="500">Driver Name</Typography>
            <FormControl fullWidth>
              <Select
                value={driverId || ''}
                onChange={handleDriverChange}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Driver</MenuItem>
                {drivers.map(driver => (
                  <MenuItem key={driver.did} value={driver.did}>
                    {driver.first_name} {driver.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type="submit" variant="contained" sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, borderRadius: 1, px: 4, py: 1 }}>
                Assign
              </Button>
              <Button variant="contained" onClick={() => navigate(-1)} sx={{ bgcolor: '#d1d5db', color: 'black', '&:hover': { bgcolor: '#9ca3af' }, borderRadius: 1, px: 4, py: 1 }}>
                Cancel
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AssignDriver;
