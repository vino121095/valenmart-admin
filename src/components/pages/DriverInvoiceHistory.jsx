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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';

export default function DriverInvoiceHistory() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [deliveryDetails, setDeliveryDetails] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [orderDirection, setOrderDirection] = useState({});

  useEffect(() => {
    if (!deliveryId) {
      navigate('/driver-invoice');
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch delivery details
        const deliveryRes = await fetch(`${baseurl}/api/delivery/${deliveryId}`);
        const deliveryData = await deliveryRes.json();
        const details = deliveryData;
        setDeliveryDetails(details);

        // Fetch driver details
        if (details && details.driver && details.driver.did) {
          const driverRes = await fetch(`${baseurl}/api/driver-details/${details.driver.did}`);
          const driverData = await driverRes.json();
          setDriverDetails(driverData.data);
        }
      } catch (err) {
        console.error('Error loading delivery/driver data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [deliveryId, navigate]);

  // Calculate total charges
  const grandTotal = parseFloat(deliveryDetails?.charges) || 0;

  // This effect runs after delivery details are loaded
  useEffect(() => {
    if (deliveryDetails && grandTotal >= 0) {
      // Mock payment history - in a real app, you would fetch this from an API
      const mockPayments = [
        {
          date: deliveryDetails.date,
          transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
          method: 'Cash',
          amount: grandTotal,
          status: deliveryDetails.status === 'Completed' ? 'Completed' : 'Pending',
        }
      ];
      setPaymentHistory(mockPayments);
    }
  }, [deliveryDetails, grandTotal]);

  if (loading) return <CircularProgress />;
  if (!deliveryDetails) return <Typography>No delivery details found.</Typography>;

  // Determine payment status based on delivery status
  const getPaymentStatus = () => {
    switch (deliveryDetails.status) {
      case 'Completed':
        return 'Paid';
      case 'Active':
        return 'Pending';
      case 'Cancelled':
        return 'Cancelled';
      default:
        return 'In Progress';
    }
  };

  const paymentStatus = getPaymentStatus();

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedPayments = [...paymentHistory].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'transactionId':
          aValue = a.transactionId;
          bValue = b.transactionId;
          break;
        case 'method':
          aValue = a.method;
          bValue = b.method;
          break;
        case 'amount':
          aValue = parseFloat(a.amount || 0);
          bValue = parseFloat(b.amount || 0);
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
    
    setPaymentHistory(sortedPayments);
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Breadcrumb */}
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Dashboard &gt; Driver Invoice & Payment Tracking &gt; Payment History
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Driver Payment History
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        {driverDetails ? `${driverDetails.first_name} ${driverDetails.last_name}` : 'Driver'}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
        &larr; Back
      </Button>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2">Delivery Charges</Typography>
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
                    paymentStatus === 'Cancelled' ? red[100] : blue[100],
                color: paymentStatus === 'Paid' ? green[800] :
                  paymentStatus === 'Pending' ? orange[800] :
                    paymentStatus === 'Cancelled' ? red[800] : blue[800],
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
          <StepLabel>Delivery Created</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment Initiated</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment {paymentStatus === 'Paid' ? 'Completed' : paymentStatus === 'Processing' ? 'Processing' : paymentStatus}</StepLabel>
        </Step>
        <Step>
          <StepLabel>Delivery {deliveryDetails.status === 'Completed' ? 'Completed' : deliveryDetails.status}</StepLabel>
        </Step>
      </Stepper>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">Delivery Created</Typography>
            <Typography variant="body2">{deliveryDetails.date}</Typography>
            <Typography variant="body2">Charges: ₹{grandTotal.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ color: green[600] }}>
              By: {driverDetails ? `${driverDetails.first_name} ${driverDetails.last_name}` : 'Driver'}
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
            <Typography variant="body2">{deliveryDetails.status}</Typography>
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
          <TableHead sx={{ bgcolor: '#00B074' }}>
            <TableRow sx={{ height: 60 }}>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', py: 2 }}
                onClick={() => handleSort('date')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Date
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('date')}</Box>
                </Box>
              </TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', py: 2 }}
                onClick={() => handleSort('transactionId')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Transaction ID
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('transactionId')}</Box>
                </Box>
              </TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', py: 2 }}
                onClick={() => handleSort('method')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Payment Method
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('method')}</Box>
                </Box>
              </TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', py: 2 }}
                onClick={() => handleSort('amount')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Amount
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('amount')}</Box>
                </Box>
              </TableCell>
              <TableCell 
                sx={{ color: 'white', fontWeight: 'bold', cursor: 'pointer', py: 2 }}
                onClick={() => handleSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('status')}</Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.length > 0 ? (
              paymentHistory.map((payment, index) => (
                <TableRow 
                  key={index}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    height: 80
                  }}
                >
                  <TableCell sx={{ py: 2 }}>{payment.date}</TableCell>
                  <TableCell sx={{ py: 2 }}>{payment.transactionId}</TableCell>
                  <TableCell sx={{ py: 2 }}>{payment.method}</TableCell>
                  <TableCell sx={{ py: 2 }}>₹{payment.amount.toFixed(2)}</TableCell>
                  <TableCell sx={{ py: 2 }}>
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
