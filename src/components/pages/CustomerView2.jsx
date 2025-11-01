import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Breadcrumbs,
  Link,
  TablePagination
} from '@mui/material';
import { green, blue } from '@mui/material/colors';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerManagementView2() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = state || {};
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDirection, setOrderDirection] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!orderId) {
      return navigate('/customerview1');
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${baseurl}/api/order/${orderId}`);
        const data = await res.json();
        setOrderDetails(data.data);
      } catch (err) {
        console.error('Error loading order details:', err);
      }
    };

    const fetchOrderItems = async () => {
      try {
        const res = await fetch(baseurl + '/api/order-items/all');
        const data = await res.json();

        const filteredItems = data.data.filter(item => item.order_id === orderId);
        setOrderItems(filteredItems);
      } catch (err) {
        console.error('Error loading order items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    fetchOrderItems();
  }, [orderId, navigate]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;
  if (!orderDetails) return <Box p={4}><Typography>Error loading order details.</Typography></Box>;

  const {
    order_id,
    order_date,
    status,
    payment_method,
    CustomerProfile: {
      contact_person_email = ''
    } = {},
  } = orderDetails || {};

  const subtotal = orderItems.reduce((sum, item) => {
    const lineTotal = parseFloat(item.line_total) || 0;
    return sum + lineTotal;
  }, 0);

  let cgstAmount = 0;
  let sgstAmount = 0;

  orderItems.forEach(item => {
    const cgstRate = item.Product?.cgst || 0;
    const sgstRate = item.Product?.sgst || 0;
    const lineTotal = parseFloat(item.line_total) || 0;

    cgstAmount += (lineTotal * cgstRate) / 100;
    sgstAmount += (lineTotal * sgstRate) / 100;
  });

  const totalDeliveryFee = orderItems.reduce(
    (acc, row) => acc + (Number(row.Product?.delivery_fee) || 0),
    0
  );

  const grandTotal = subtotal + cgstAmount + sgstAmount + totalDeliveryFee;

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedItems = [...orderItems].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'item':
          aValue = a.product_id;
          bValue = b.product_id;
          break;
        case 'productName':
          aValue = a.Product?.product_name || '';
          bValue = b.Product?.product_name || '';
          break;
        case 'quantity':
          aValue = parseFloat(a.quantity || 0);
          bValue = parseFloat(b.quantity || 0);
          break;
        case 'unitPrice':
          aValue = parseFloat(a.unit_price || 0);
          bValue = parseFloat(b.unit_price || 0);
          break;
        case 'total':
          aValue = parseFloat(a.line_total || 0);
          bValue = parseFloat(b.line_total || 0);
          break;
        default:
          aValue = a[column];
          bValue = b[column];
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
    
    setOrderItems(sortedItems);
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
  const paginatedOrderItems = orderItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/customer">Customer Management</Link>
        <Typography color="text.primary">Order Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3}}>
        Order Details - #{order_id}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Order Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Order ID:</strong> {order_id}</Typography>
            <Typography><strong>Order Date:</strong> {order_date}</Typography>
            <Typography><strong>Customer:</strong> {contact_person_email}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Amount:</strong> ₹{grandTotal.toFixed(2)}</Typography>
            <Typography>
              <strong>Status:</strong>{' '}
              <Chip label={status} size="small" sx={{ bgcolor: blue[50], color: blue[600], ml: 1 }} />
            </Typography>
            <Typography>
              <strong>Payment:</strong>{' '}
              <Chip label={payment_method} size="small" sx={{ bgcolor: green[100], color: green[800], ml: 1 }} />
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#00B074' }}>
            <TableRow sx={{ height: 60 }}>
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
                onClick={() => handleSort('item')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Item
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('item')}</Box>
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
                onClick={() => handleSort('productName')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Product Name
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('productName')}</Box>
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
                onClick={() => handleSort('quantity')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Quantity
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('quantity')}</Box>
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
                onClick={() => handleSort('unitPrice')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Unit Price
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('unitPrice')}</Box>
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
                onClick={() => handleSort('total')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Total
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('total')}</Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No order items found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrderItems.map((row, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    height: 80
                  }}
                >
                  <TableCell sx={{ py: 2 }}>{row.product_id}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.Product?.product_name}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.quantity}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.unit_price}</TableCell>
                  <TableCell sx={{ py: 2 }}>{row.line_total}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orderItems.length}
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Box
          sx={{
            width: '300px',
            bgcolor: '#f1f8f6',
            p: 2,
            borderRadius: 2,
            fontSize: '14px'
          }}
        >
          <Grid container justifyContent="space-between">
            <Typography>Subtotal:</Typography>
            <Typography>₹{subtotal.toFixed(2)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography>CGST:</Typography>
            <Typography>₹{cgstAmount.toFixed(2)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography>SGST:</Typography>
            <Typography>₹{sgstAmount.toFixed(2)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between">
            <Typography>Delivery Fee:</Typography>
            <Typography>₹{totalDeliveryFee.toFixed(2)}</Typography>
          </Grid>
          <Grid container justifyContent="space-between" sx={{ fontWeight: 'bold', mt: 1 }}>
            <Typography>Total:</Typography>
            <Typography>₹{grandTotal.toFixed(2)}</Typography>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#2CA66F',
            '&:disabled': {
              bgcolor: '#f5f5f5', // Grey background when disabled
              color: '#9e9e9e'    // Grey text when disabled
            }
          }}
          onClick={() => navigate(`/invoice-view/${orderId}`)}
          disabled={status !== 'Delivered'}
        >
          Download Invoice
        </Button>
      </Box>
    </Box>
  );
}