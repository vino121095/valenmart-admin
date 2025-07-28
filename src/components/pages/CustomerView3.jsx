import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Grid, Paper, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, TextField, Breadcrumbs, Link
} from '@mui/material';
import { green, orange } from '@mui/material/colors';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useNavigate, useParams } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerManagementView3() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (id) {
      fetch(baseurl + '/api/order/all')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            const customerOrders = data.data.filter(
              (order) => parseInt(order.customer_id) === parseInt(id)
            );

            // Group by order_id
            const grouped = {};
            customerOrders.forEach(order => {
              if (!grouped[order.order_id]) {
                grouped[order.order_id] = {
                  ...order,
                  items: 1
                };
              } else {
                grouped[order.order_id].items += 1;
                grouped[order.order_id].total_amount += parseFloat(order.total_amount || 0); // optional sum
              }
            });

            const consolidatedOrders = Object.values(grouped);
            setOrders(consolidatedOrders);
            setFilteredOrders(consolidatedOrders);
          }
        })
        .catch((err) => {
          console.error('Error fetching order data:', err);
        });
    }
  }, [id]);

  const applyFilters = () => {
    let result = [...orders];

    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }

    // (Optional) Date range filter logic can go here

    setFilteredOrders(result);
  };

  const resetFilters = () => {
    setStatusFilter('All');
    setDateRange('');
    setFilteredOrders(orders);
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/customer">Customer Management</Link>
        <Typography color="text.primary">Customer Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Customer Details - Tech University
      </Typography>

      <Button variant="outlined" onClick={() => navigate('/customer')} sx={{ mb: 3 }}>
        &larr; Back
      </Button>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2">Total Orders</Typography>
            <Typography variant="h5" fontWeight="bold">{filteredOrders.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2">Total Spending</Typography>
            <Typography variant="h5" fontWeight="bold">
              ₹{filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2">Average Order Value</Typography>
            <Typography variant="h5" fontWeight="bold">
              ₹{filteredOrders.length > 0
                ? (filteredOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0) / filteredOrders.length).toFixed(2)
                : '0.00'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography>Filter by Status :</Typography>
            <Select
              fullWidth
              value={statusFilter}
              size="small"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Shipped">Shipped</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography>Date Range :</Typography>
            <TextField
              fullWidth
              size="small"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder="05/01/2025 - 05/06/2025"
              InputProps={{
                startAdornment: <CalendarMonthIcon sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="contained" sx={{ mt: { xs: 2, md: 0 }, bgcolor: '#2CA66F' }} onClick={applyFilters}>
              Apply
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button variant="outlined" sx={{ mt: { xs: 2, md: 0 } }} onClick={resetFilters}>
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2CA66F' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Items</TableCell>
              <TableCell sx={{ color: 'white' }}>Total</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{order.order_id}</TableCell>
                  <TableCell>{new Date(order.order_date).toDateString()}</TableCell>
                  <TableCell>{order.items} item{order.items > 1 ? 's' : ''}</TableCell>
                  <TableCell>₹{parseFloat(order.total_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        bgcolor:
                          order.status === 'Delivered' ? green[50] :
                            order.status === 'Shipped' ? orange[50] :
                              '#eee',
                        color:
                          order.status === 'Delivered' ? green[600] :
                            order.status === 'Shipped' ? orange[800] :
                              'black',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/customer/order/${order.oid}`)}
                    >
                      View Details
                    </Button>

                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
