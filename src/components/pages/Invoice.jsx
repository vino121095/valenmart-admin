import React, { useState, useEffect } from 'react';
import {
  Box, Button, Chip, IconButton, Menu, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Select,
  FormControl, InputLabel, MenuItem as SelectItem, InputAdornment,
  CircularProgress, Tab, Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import baseurl from '../ApiService/ApiService';

const statusColor = {
  'Delivered': 'success',
  'Pending': 'error',
  'New Order': 'warning',
  'Out for Delivery': 'info',
};

export default function InvoiceManagement() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch(baseurl + '/api/order/all');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data);

        const itemsRes = await fetch(baseurl + '/api/order-items/all');
        const itemsData = await itemsRes.json();
        setOrderItems(itemsData.data);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filterStatus, startDate, endDate]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const applyFilters = () => {
    let result = [...orders];

    if (filterStatus) {
      result = result.filter(order => order.status === filterStatus);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      result = result.filter(order => {
        const orderDate = new Date(order.order_date);
        return orderDate >= start && orderDate <= end;
      });
    }

    setFilteredOrders(result);
  };

  const handleResetFilters = () => {
    setFilterStatus('');
    setStartDate('');
    setEndDate('');
    setFilteredOrders(orders);
  };

  const calculateGrandTotal = (orderId) => {
    const items = orderItems.filter(item => item.order_id === orderId);

    const subtotal = items.reduce((sum, item) => {
      const lineTotal = parseFloat(item.line_total) || 0;
      return sum + lineTotal;
    }, 0);

    let cgstAmount = 0;
    let sgstAmount = 0;

    items.forEach(item => {
      const cgstRate = item.Product?.cgst || 0;
      const sgstRate = item.Product?.sgst || 0;
      const lineTotal = parseFloat(item.line_total) || 0;

      cgstAmount += (lineTotal * cgstRate) / 100;
      sgstAmount += (lineTotal * sgstRate) / 100;
    });

    const totalDeliveryFee = items.reduce(
      (acc, item) => acc + (Number(item.Product?.delivery_fee) || 0),
      0
    );

    return subtotal + cgstAmount + sgstAmount + totalDeliveryFee;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>Invoice & Payment Tracking</Typography>

      {/* Tabs to switch invoice split */}
      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" onClick={() => navigate('/invoice')}>Customer Invoice</Button>
        <Button variant="outlined" onClick={() => navigate('/vendor-invoice')}>Vendor Invoice</Button>
        <Button variant="outlined" onClick={() => navigate('/driver-invoice')}>Driver Invoice</Button>
      </Stack>

      {/* Summary Cards */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <SummaryCard
          label="Pending Invoices"
          value={filteredOrders.filter(o => o.status !== 'Delivered' && o.status !== 'New Order').length}
          sub={`₹${filteredOrders
            .filter(o => o.status !== 'Delivered' && o.status !== 'New Order')
            .reduce((sum, o) => sum + calculateGrandTotal(o.oid), 0)
            .toFixed(2)}`}
          icon="❗"
        />
        <SummaryCard
          label="Delivered Invoices"
          value={filteredOrders.filter(o => o.status === 'Delivered').length}
          sub={`₹${filteredOrders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + calculateGrandTotal(o.oid), 0).toFixed(2)}`}
          icon="₹"
        />
        <SummaryCard
          label="New Orders"
          value={filteredOrders.filter(o => o.status === 'New Order').length}
          sub={`₹${filteredOrders.filter(o => o.status === 'New Order').reduce((sum, o) => sum + calculateGrandTotal(o.oid), 0).toFixed(2)}`}
          icon="📦"
        />
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select label="Filter by Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="New Order">New Order</SelectItem>
            <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
          </Select>
        </FormControl>

        <TextField
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          type="date"
          label="End Date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <Button variant="contained" color="success" onClick={applyFilters}>Apply</Button>
        <Button variant="outlined" color="inherit" onClick={handleResetFilters}>Reset</Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#00A67E' }}>
              <TableCell sx={{ color: 'white' }}>Invoice #</TableCell>
              <TableCell sx={{ color: 'white' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white' }}>Order Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Delivery Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount (₹)</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              <TableCell sx={{ color: 'white' }}>Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>{order.order_id}</TableCell>
                <TableCell>{order.CustomerProfile?.contact_person_name}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(order.delivery_date).toLocaleDateString()}</TableCell>
                <TableCell>₹{calculateGrandTotal(order.oid).toFixed(2)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color={statusColor[order.status]} variant="outlined" />
                </TableCell>
                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, index)}>
                    <MoreVertIcon />
                  </IconButton>
                  {selectedIndex === index && (
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                      {order.status === 'Delivered' && (
                        <MenuItem onClick={() => navigate(`/invoice-view/${order.oid}`)}>View Details</MenuItem>
                      )}
                      <MenuItem onClick={() => navigate(`/invoicehistory/${order.oid}`)}>Payment History</MenuItem>
                    </Menu>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={order.status === 'Delivered' ? 'outlined' : 'contained'}
                    color="success"
                    disabled={order.status === 'Delivered'}
                  >
                    {order.status === 'Delivered' ? 'Received' : 'Receive'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2">Showing {filteredOrders.length} entries</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" disabled>Previous</Button>
            <Button variant="contained" size="small" color="success">1</Button>
            <Button variant="outlined" size="small" disabled>Next</Button>
          </Stack>
        </Box>
      </TableContainer>
    </Box>
  );
}

// Summary Card component
function SummaryCard({ label, value, sub, icon }) {
  return (
    <Paper elevation={2} sx={{ p: 2, minWidth: 200 }}>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="medium">{label}</Typography>
          <Typography>{icon}</Typography>
        </Stack>
        <Typography variant="h5" fontWeight="bold">
          {value} <Typography variant="body2" component="span">Orders</Typography>
        </Typography>
        <Typography variant="body2" color="text.secondary">Total Value: {sub}</Typography>
      </Stack>
    </Paper>
  );
}
