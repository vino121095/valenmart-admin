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
  MenuItem as SelectItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const statusColor = {
  Active: 'success',
  Inactive: 'error',
  Pending: 'warning',
};

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, orderRes] = await Promise.all([
          fetch('http://localhost:8000/api/customer-profile/all'),
          fetch('http://localhost:8000/api/order/all')
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
          orderCount: ordersByCustomer[customer.cpid] || 0
        }));

        setCustomers(enrichedCustomers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

    fetch(`http://localhost:8000/api/customer-profile/delete/${customerId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete customer');
        setCustomers(customers.filter((cust) => cust.cpid !== customerId));
        handleClose();
      })
      .catch((err) => {
        console.error('Delete error:', err);
        alert('Failed to delete customer. Please try again.');
      });
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
          <Select label="Filter by Status" defaultValue="">
            <SelectItem value="">All</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Search Customer"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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
            {customers.map((customer, index) => (
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
                    label="Active"
                    color={statusColor['Active']}
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
                      <MenuItem onClick={handleClose}>Set as Active</MenuItem>
                      <MenuItem onClick={() => navigate(`/customerview3/${customer.cpid}`)}>View Purchase History</MenuItem>
                      <MenuItem onClick={() => handleDeleteCustomer(customer.cpid)} sx={{ color: 'red' }}>Delete Account</MenuItem>
                    </Menu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2">Showing 1 to 5 of {customers.length} Entries</Typography>
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
