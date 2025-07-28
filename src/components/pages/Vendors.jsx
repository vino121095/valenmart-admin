import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  useTheme,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';

export default function VendorPending() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(baseurl + '/api/vendor/all');
      if (response.data.message === "Vendors retrieved successfully") {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleDelete = async (vendor_id) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await fetch(baseurl + '/api/vendor/delete/' + vendor_id, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete vendor');
        }

        const updatedVendors = vendors.filter(vendor => vendor.vendor_id !== vendor_id);
        setVendors(updatedVendors);

        alert('Vendor deleted successfully');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor');
      }
    }
  };

  const handleView = (vendor) => {
    navigate(`/vendor-view/${vendor.vendor_id}`);
  };

  const handleEdit = (vendor) => {
    navigate(`/vendor-edit/${vendor.vendor_id}`);
  };

  const handleAddVendor = () => {
    navigate('/vendor-registration');
  };

  // Function to get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'red';
      case 'Pending':
        return 'orange';
      default:
        return 'black';
    }
  };

  return (
    <Box>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          href="/"
          sx={{
            color: '#00A67E',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          Dashboard
        </Link>
        <Typography
          sx={{
            color: '#070d0cff',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          Vendor/Farmer Management
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Active Vendors/Farmers</Typography>
            <Typography variant="h5">{vendors.filter(v => v.status === 'Active').length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Registered Vendors</Typography>
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => navigate('/vendors')}>Vendor/Former</Button>
          <Button variant="outlined" onClick={() => navigate('/vendoractive')}>Active Vendors</Button>
          {/* <Button variant="outlined" onClick={() => navigate('/vendorperform')}>Performance Metrics</Button>
          <Button variant="outlined" onClick={() => navigate('/vendorhistory')}>Historical Data</Button> */}
        </Box>
        <Button
          variant="contained"
          onClick={handleAddVendor}
          sx={{
            bgcolor: '#00A67E',
            '&:hover': {
              bgcolor: '#007a5e'
            }
          }}
        >
          Add New Vendor/Farmer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#00A67E' }}>
              <TableCell sx={{ color: 'white' }}>Type</TableCell>
              <TableCell sx={{ color: 'white' }}>Full Name / Company Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Phone Number</TableCell>
              <TableCell sx={{ color: 'white' }}>Address</TableCell>
              <TableCell sx={{ color: 'white' }}>City</TableCell>
              <TableCell sx={{ color: 'white' }}>State/Province</TableCell>
              <TableCell sx={{ color: 'white' }}>Zip Code</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.vendor_id}>
                <TableCell>
                  <Typography>{vendor.type}</Typography>
                </TableCell>
                <TableCell>{vendor.contact_person}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>{vendor.address}</TableCell>
                <TableCell>{vendor.city}</TableCell>
                <TableCell>{vendor.state}</TableCell>
                <TableCell>{vendor.pincode}</TableCell>
                <TableCell>
                  <Typography sx={{ color: getStatusColor(vendor.status), fontWeight: 'bold' }}>
                    {vendor.status}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton color="primary" size="small" onClick={() => handleView(vendor)} sx={{ mr: 1 }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="info" size="small" onClick={() => handleEdit(vendor)} sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(vendor.vendor_id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
