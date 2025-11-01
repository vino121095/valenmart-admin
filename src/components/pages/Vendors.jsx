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
  TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import baseurl from '../ApiService/ApiService';

export default function VendorPending({ reportMode = false }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [vendors, setVendors] = useState([]);
  const [orderDirection, setOrderDirection] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedVendors = [...vendors].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'name':
          aValue = a.contact_person;
          bValue = b.contact_person;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'phone':
          aValue = a.phone;
          bValue = b.phone;
          break;
        case 'address':
          aValue = a.address;
          bValue = b.address;
          break;
        case 'city':
          aValue = a.city;
          bValue = b.city;
          break;
        case 'state':
          aValue = a.state;
          bValue = b.state;
          break;
        case 'pincode':
          aValue = a.pincode;
          bValue = b.pincode;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[column];
          bValue = b[column];
      }
      
      if (isNaN(aValue) || isNaN(bValue)) {
        if (isAsc) {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      }
      
      return isAsc ? aValue - bValue : bValue - aValue;
    });
    
    setVendors(sortedVendors);
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedVendors = vendors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const tableHeaders = [
    { id: 'type', label: 'Type', sortable: true },
    { id: 'name', label: 'Full Name / Company Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'phone', label: 'Phone Number', sortable: true },
    { id: 'address', label: 'Address', sortable: true },
    // { id: 'city', label: 'City', sortable: true },
    // { id: 'state', label: 'State/Province', sortable: true },
    // { id: 'pincode', label: 'Zip Code', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <Box>
      {!reportMode && (
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
      )}

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Vendor/Former Management</Typography>

      {!reportMode && (
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
      )}

      {!reportMode && (
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
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#00B074', height: 60 }}>
              {tableHeaders.map(header => (
                <TableCell 
                  key={header.id}
                  sx={{ 
                    backgroundColor: '#00B074',
                    cursor: 'pointer',
                    color: '#fff',
                    fontWeight: 'bold',
                    py: 2,
                    '&:hover': {
                      backgroundColor: '#009e64',
                    }
                  }}
                  onClick={() => header.sortable && handleSort(header.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {header.label}
                    {header.sortable && (
                      <Box sx={{ ml: 0.5 }}>{getSortIcon(header.id)}</Box>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedVendors.map((vendor) => (
              <TableRow 
                key={vendor.vendor_id}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                  height: 80
                }}
              >
                <TableCell sx={{ py: 2 }}>
                  <Typography>{vendor.type}</Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>{vendor.contact_person}</TableCell>
                <TableCell sx={{ py: 2 }}>{vendor.email}</TableCell>
                <TableCell sx={{ py: 2 }}>{vendor.phone}</TableCell>
                <TableCell sx={{ py: 2 }}>{vendor.address}</TableCell>
                {/* <TableCell sx={{ py: 2 }}>{vendor.city}</TableCell> */}
                {/* <TableCell sx={{ py: 2 }}>{vendor.state}</TableCell> */}
                {/* <TableCell sx={{ py: 2 }}>{vendor.pincode}</TableCell> */}
                <TableCell sx={{ py: 2 }}>
                  <Typography sx={{ color: getStatusColor(vendor.status), fontWeight: 'bold' }}>
                    {vendor.status}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={vendors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }
          }}
        />
      </TableContainer>
    </Box>
  );
}