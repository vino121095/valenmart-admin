import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import baseurl from '../ApiService/ApiService';

const statusColor = {
  Active: 'success',
  Inactive: 'error',
  Pending: 'warning',
};

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, orderRes] = await Promise.all([
          fetch(baseurl + '/api/customer-profile/all'),
          fetch(baseurl + '/api/order/all')
        ]);

        if (!customerRes.ok || !orderRes.ok) throw new Error('Failed to fetch data');

        const customerData = await customerRes.json();
        const orderData = await orderRes.json();

        const ordersByCustomer = {};
        orderData.data.forEach(order => {
          const cid = order.customer_id;
          if (!ordersByCustomer[cid]) {
            ordersByCustomer[cid] = 0;
          }
          ordersByCustomer[cid]++;
        });

        const enrichedCustomers = customerData.data.map(customer => ({
          ...customer,
          orderCount: ordersByCustomer[customer.cpid] || 0,
          status: customer.status || 'Active' // Default to Active if status not provided
        }));

        setCustomers(enrichedCustomers);
        setFilteredCustomers(enrichedCustomers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    let result = [...customers];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.institution_name.toLowerCase().includes(term) ||
        customer.contact_person_email.toLowerCase().includes(term) ||
        customer.contact_person_phone.includes(term) ||
        customer.address.toLowerCase().includes(term) ||
        customer.city.toLowerCase().includes(term) ||
        customer.state.toLowerCase().includes(term) ||
        customer.postal_code.includes(term)
      );
    }
    
    setFilteredCustomers(result);
  }, [searchTerm, statusFilter, customers]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const handleAddCustomer = () => {
    navigate('/create-customer');
  };

  const handleEditCustomer = (customerId) => {
    if (!customerId) {
      console.error("Customer ID is undefined");
      return;
    }
    navigate(`/customer-edit/${String(customerId).replace('#', '')}`);
    handleClose();
  };

  const handleDeleteCustomer = (customerId) => {
    if (!customerId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    fetch(`${baseurl}/api/customer-profile/delete/${customerId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete customer');
        const updatedCustomers = customers.filter((cust) => cust.cpid !== customerId);
        setCustomers(updatedCustomers);
        handleClose();
      })
      .catch((err) => {
        console.error('Delete error:', err);
        alert('Failed to delete customer. Please try again.');
      });
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="p" fontWeight="light" color="#00B074" fontSize="14px" mb={3}>
        Dashboard &gt; Invoice & Payment Tracking
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Customer Management</Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleAddCustomer}
        >
          Add Customer
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select 
            label="Filter by Status" 
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Search Customer"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button 
          variant="outlined" 
          onClick={resetFilters}
          disabled={!searchTerm && !statusFilter}
        >
          Reset Filters
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#00A67E' }}>
              <TableCell sx={{ color: 'white' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white' }}>Email</TableCell>
              <TableCell sx={{ color: 'white' }}>Phone</TableCell>
              <TableCell sx={{ color: 'white' }}>Address</TableCell>
              <TableCell sx={{ color: 'white' }}>City</TableCell>
              <TableCell sx={{ color: 'white' }}>State</TableCell>
              <TableCell sx={{ color: 'white' }}>Pincode</TableCell>
              <TableCell sx={{ color: 'white' }}>Recent Orders</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ color: 'error.main' }}>
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography fontWeight="medium">{customer.institution_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{customer.id}</Typography>
                  </TableCell>
                  <TableCell>{customer.contact_person_email}</TableCell>
                  <TableCell>{customer.contact_person_phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.city}</TableCell>
                  <TableCell>{customer.state}</TableCell>
                  <TableCell>{customer.postal_code}</TableCell>
                  <TableCell align="center">{customer.orderCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={customer.status}
                      color={statusColor[customer.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, index)}>
                      <MoreVertIcon />
                    </IconButton>
                    {selectedIndex === index && (
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={() => navigate(`/customerview1/${customer.cpid}`)}>View Details</MenuItem>
                        <MenuItem onClick={() => handleEditCustomer(customer.cpid)}>Edit Account</MenuItem>
                        <MenuItem onClick={() => navigate(`/customerview3/${customer.cpid}`)}>View Purchase History</MenuItem>
                        <MenuItem onClick={() => handleDeleteCustomer(customer.cpid)} sx={{ color: 'red' }}>Delete Account</MenuItem>
                      </Menu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2">
            Showing {filteredCustomers.length} of {customers.length} customers
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small">Previous</Button>
            {[1, 2, 3, 4].map((page) => (
              <Button
                key={page}
                variant={page === 1 ? 'contained' : 'outlined'}
                size="small"
                color={page === 1 ? 'success' : 'inherit'}
              >
                {page}
              </Button>
            ))}
            <Button variant="outlined" size="small">Next</Button>
          </Stack>
        </Box>
      </TableContainer>
    </Box>
  );
}
