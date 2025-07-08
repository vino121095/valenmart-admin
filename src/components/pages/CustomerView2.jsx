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
  CircularProgress
} from '@mui/material';
import { green, blue } from '@mui/material/colors';
import { useLocation, useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

export default function CustomerManagementView2() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { orderId } = state || {};
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f4f8', minHeight: '100vh' }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Dashboard &gt; Customer Management &gt; Customer Details &gt; Order Details
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Order Details - #{order_id}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
        &larr; Back
      </Button>

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
          <TableHead sx={{ bgcolor: '#2CA66F' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Item</TableCell>
              <TableCell sx={{ color: 'white' }}>Product Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Quantity</TableCell>
              <TableCell sx={{ color: 'white' }}>Unit Price</TableCell>
              <TableCell sx={{ color: 'white' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderItems.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.product_id}</TableCell>
                <TableCell>{row.Product?.product_name}</TableCell>
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.unit_price}</TableCell>
                <TableCell>{row.line_total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
