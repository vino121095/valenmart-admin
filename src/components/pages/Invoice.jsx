import React, { useState, useEffect } from 'react';
import {
  Box, Button, Chip, IconButton, Menu, MenuItem, Paper,
  Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Select,
  FormControl, InputLabel, MenuItem as SelectItem, InputAdornment,
  CircularProgress, Tab, Tabs, Breadcrumbs, Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
  const [orderDirection, setOrderDirection] = useState({});

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

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'invoice':
          aValue = a.order_id;
          bValue = b.order_id;
          break;
        case 'customer':
          aValue = a.CustomerProfile?.contact_person_name || '';
          bValue = b.CustomerProfile?.contact_person_name || '';
          break;
        case 'orderDate':
          aValue = new Date(a.order_date);
          bValue = new Date(b.order_date);
          break;
        case 'deliveryDate':
          aValue = new Date(a.delivery_date);
          bValue = new Date(b.delivery_date);
          break;
        case 'amount':
          aValue = calculateGrandTotal(a.oid);
          bValue = calculateGrandTotal(b.oid);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[column];
          bValue = b[column];
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      if (isAsc) {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    setFilteredOrders(sortedOrders);
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00b574' }} />} sx={{ mb: 1 }}>
        <Link color="#00b574" underline="hover" href="#" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Dashboard</Link>
        <Typography color="#07100dff" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Customer Invoice & Payment Tracking</Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontWeight="bold" mb={3}>Customer Invoice & Payment Tracking</Typography>

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
            <TableRow sx={{ backgroundColor: '#00B074', height: 60 }}>
              <TableCell 
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
                onClick={() => handleSort('invoice')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Invoice #
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('invoice')}</Box>
                </Box>
              </TableCell>
              <TableCell 
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
                onClick={() => handleSort('customer')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Customer
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('customer')}</Box>
                </Box>
              </TableCell>
              <TableCell 
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
                onClick={() => handleSort('orderDate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Order Date
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('orderDate')}</Box>
                </Box>
              </TableCell>
              <TableCell 
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
                onClick={() => handleSort('deliveryDate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Delivery Date
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('deliveryDate')}</Box>
                </Box>
              </TableCell>
              <TableCell 
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
                onClick={() => handleSort('amount')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Amount (₹)
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('amount')}</Box>
                </Box>
              </TableCell>
              <TableCell 
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
                onClick={() => handleSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('status')}</Box>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Actions</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Payment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order, index) => (
              <TableRow 
                key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                  height: 80
                }}
              >
                <TableCell sx={{ py: 2 }}>{order.order_id}</TableCell>
                <TableCell sx={{ py: 2 }}>{order.CustomerProfile?.contact_person_name}</TableCell>
                <TableCell sx={{ py: 2 }}>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ py: 2 }}>{new Date(order.delivery_date).toLocaleDateString()}</TableCell>
                <TableCell sx={{ py: 2 }}>₹{calculateGrandTotal(order.oid).toFixed(2)}</TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip label={order.status} color={statusColor[order.status]} variant="outlined" />
                </TableCell>
                <TableCell sx={{ py: 2 }}>
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
                <TableCell sx={{ py: 2 }}>
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
