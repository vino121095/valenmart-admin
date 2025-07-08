import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress
} from '@mui/material';
import { green, red, orange, blue } from '@mui/material/colors';
import baseurl from '../ApiService/ApiService';

export default function VendorInvoiceHistory() {
  const { procurementId } = useParams();
  const navigate = useNavigate();
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (!procurementId) {
      navigate('/vendor-invoice');
      return;
    }

    const fetchProcurementDetails = async () => {
      try {
        const res = await fetch(`${baseurl}/api/procurement/${procurementId}`);
        const data = await res.json();
        
        const details = Array.isArray(data.data) ? data.data[0] : data.data;

        if (details) {
          setProcurement(details);
          // Calculate items and grandTotal before setting mockPayments
          let items = [];
          try {
            items = details && details.items ? (typeof details.items === 'string' ? JSON.parse(details.items) : details.items) : [];
          } catch {
            items = [];
          }
          if (!Array.isArray(items)) items = [];
          const subtotal = items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.unit_price) || 0;
            return sum + qty * rate;
          }, 0);
          const cgstRate = parseFloat(details.cgst) || 0;
          const sgstRate = parseFloat(details.sgst) || 0;
          const cgstAmount = (subtotal * cgstRate) / 100;
          const sgstAmount = (subtotal * sgstRate) / 100;
          const deliveryFee = parseFloat(details.delivery_fee) || 0;
          const grandTotal = subtotal + cgstAmount + sgstAmount + deliveryFee;
          // Mock payment history based on procurement data
          const mockPayments = [
            {
              date: new Date().toISOString().split('T')[0],
              transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
              method: 'Bank Transfer',
              amount: grandTotal,
              status: (details.status === 'Delivered' || details.status === 'Received') ? 'Completed' : 'Pending'
            }
          ];
          setPaymentHistory(mockPayments);
        }
      } catch (err) {
        console.error('Error loading procurement details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProcurementDetails();

  }, [procurementId, navigate]);

  if (loading) return <CircularProgress />;
  if (!procurement) return <Typography>No procurement details found.</Typography>;

  // Parse items array
  let items = [];
  try {
    items = procurement && procurement.items ? (typeof procurement.items === 'string' ? JSON.parse(procurement.items) : procurement.items) : [];
  } catch {
    items = [];
  }
  if (!Array.isArray(items)) items = [];

  // Calculate taxes and totals
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.unit_price) || 0;
    return sum + qty * rate;
  }, 0);
  const cgstRate = parseFloat(procurement.cgst) || 0;
  const sgstRate = parseFloat(procurement.sgst) || 0;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const deliveryFee = parseFloat(procurement.delivery_fee) || 0;
  const grandTotal = subtotal + cgstAmount + sgstAmount + deliveryFee;


  // Determine payment status based on procurement status
  const getPaymentStatus = () => {
    switch (procurement.status) {
      case 'Delivered':
      case 'Received':
        return 'Paid';
      case 'Approved':
      case 'Shipped':
        return 'Pending';
      case 'Requested':
        return 'Not Processed';
      default:
        return 'In Progress';
    }
  };

  const paymentStatus = getPaymentStatus();

  // Helper to display 'Delivered' for 'Received' status
  const getDisplayStatus = (status) => {
    if (status === 'Received') return 'Delivered';
    return status;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Dashboard &gt; Vendor Invoice &gt; Payment History
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Vendor Payment History
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Vendor: {procurement.vendor?.contact_person || procurement.vendor_name || 'N/A'}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
        &larr; Back
      </Button>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Invoice Amount</Typography>
            <Typography variant="h6">₹{grandTotal.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Payment Status</Typography>
            <Chip
              label={paymentStatus}
              sx={{
                bgcolor: paymentStatus === 'Paid' ? green[100] :
                  paymentStatus === 'Pending' ? orange[100] :
                    paymentStatus === 'Not Processed' ? red[100] : blue[100],
                color: paymentStatus === 'Paid' ? green[800] :
                  paymentStatus === 'Pending' ? orange[800] :
                    paymentStatus === 'Not Processed' ? red[800] : blue[800],
                mt: 1
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Balance Due</Typography>
            <Typography variant="h6" sx={{ color: paymentStatus === 'Paid' ? green[600] : red[600] }}>
              {paymentStatus === 'Paid' ? '₹0.00' : `₹${grandTotal.toFixed(2)}`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Timeline */}
      <Typography variant="h6" gutterBottom>
        Payment History Timeline
      </Typography>
      <Stepper alternativeLabel activeStep={paymentStatus === 'Paid' ? 3 : paymentStatus === 'Pending' ? 2 : 1} sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Procurement Created</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment Initiated</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment {paymentStatus === 'Paid' ? 'Completed' : 'Processing'}</StepLabel>
        </Step>
        <Step>
          <StepLabel>Order {getDisplayStatus(procurement.status)}</StepLabel>
        </Step>
      </Stepper>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Invoice Created</Typography>
            <Typography variant="body2">{procurement.order_date}</Typography>
            <Typography variant="body2">Amount: ₹{grandTotal.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ color: green[600] }}>
              By: Admin
            </Typography>
          </Paper>
        </Grid>

        {paymentHistory.length > 0 && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {paymentHistory[0].status === 'Completed' ? 'Payment Received' : 'Payment Initiated'}
              </Typography>
              <Typography variant="body2">{paymentHistory[0].date}</Typography>
              <Typography variant="body2">Amount: ₹{paymentHistory[0].amount}</Typography>
              <Typography variant="body2" sx={{ color: blue[600], textDecoration: 'underline', cursor: 'pointer' }}>
                Transaction ID: {paymentHistory[0].transactionId}
              </Typography>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Current Status</Typography>
            <Typography variant="body2">{getDisplayStatus(procurement.status)}</Typography>
            <Typography variant="body2">
              Balance: {paymentStatus === 'Paid' ? '₹0.00' : `₹${grandTotal.toFixed(2)}`}
            </Typography>
            <Typography variant="body2" sx={{
              color: paymentStatus === 'Paid' ? green[600] : red[600]
            }}>
              {paymentStatus === 'Paid' ? 'Payment Complete' : 'Action Required'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Details Table */}
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Transaction ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Payment Method</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>₹{parseFloat(payment.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      sx={{
                        bgcolor: payment.status === 'Completed' ? green[100] : orange[100],
                        color: payment.status === 'Completed' ? green[800] : orange[800]
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No payment records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}