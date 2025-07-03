import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Avatar, Button, Divider, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const getStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return '#4caf50'; // green
    case 'Pending':
      return '#ff9800'; // orange
    case 'Inactive':
      return '#f44336'; // red
    default:
      return '#9e9e9e'; // grey fallback
  }
};

const VendorCard = ({ name, city, initials, color, status, contactPerson, onView }) => (
  <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
    <Grid container spacing={2}>
      <Grid item>
        <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{initials}</Avatar>
      </Grid>
      <Grid item xs>
        <Typography variant="subtitle1">{name}</Typography>
        <Typography variant="body2" color="text.secondary">{city}</Typography>
      </Grid>
    </Grid>
    <Divider sx={{ my: 2 }} />
    <Box>
      <Typography variant="body2"><strong>Products :</strong> Potato, Tomato, Carrot...</Typography>
      <Typography variant="body2"><strong>Contact :</strong> {contactPerson}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <Typography variant="body2" sx={{ mr: 1 }}><strong>Rating :</strong></Typography>
        <Rating value={4} readOnly size="small" />
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} fullWidth onClick={onView}>View</Button>
    </Box>
  </Paper>
);

export default function VendorActive() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/vendor/all');
        if (response.data.message === "Vendors retrieved successfully") {
          setVendors(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };

    fetchVendors();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vendor/Farmer Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Active Vendors/Farmers</Typography>
            <Typography variant="h5">{vendors.filter(v => v.status === 'Active').length}</Typography>
            <Typography variant="body2" color="text.secondary">From 12 Different Regions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Fulfillment Efficiency</Typography>
            <Typography variant="h5">92%</Typography>
            <Typography variant="body2" color="text.secondary">On-time Delivery Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Pending Approvals</Typography>
            <Typography variant="h5">{vendors.filter(v => v.status === 'Pending').length}</Typography>
            <Typography variant="body2" color="text.secondary">Registration Requests</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/vendors')}>Vendor/Former</Button>
        <Button variant="contained" onClick={() => navigate('/vendoractive')}>Active Vendors</Button>
        {/* <Button variant="outlined" onClick={() => navigate('/vendorperform')}>Performance Metrics</Button>
        <Button variant="outlined" onClick={() => navigate('/vendorhistory')}>Historical Data</Button> */}
      </Box>

      <Grid container spacing={2}>
        {vendors.map((vendor) => {
          const initials = vendor.contact_person
            ? vendor.contact_person.split(' ').map(n => n[0]).join('').toUpperCase()
            : vendor.type[0];
          const color = getStatusColor(vendor.status);

          return (
            <Grid item xs={12} sm={6} md={4} key={vendor.vendor_id}>
              <VendorCard
                name={vendor.type === 'Vendor' ? vendor.contact_person : vendor.type + ' - ' + vendor.contact_person}
                city={vendor.city}
                initials={initials}
                color={color}
                status={vendor.status}
                contactPerson={vendor.contact_person}
                onView={() => navigate(`/vendor-view/${vendor.vendor_id}`)}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
