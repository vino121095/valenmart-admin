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
  CircularProgress,
  Breadcrumbs,
  Link,
  TablePagination
} from '@mui/material';
import { green, red, orange, blue } from '@mui/material/colors';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function InvoiceManagementHistory() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [orderDirection, setOrderDirection] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!orderId) {
      navigate('/customerview1');
      return;
    }

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch order details
        const orderRes = await fetch(`${baseurl}/api/order/${orderId}`);
        const orderData = await orderRes.json();
        const details = orderData.data;

        // Fetch order items
        const itemsRes = await fetch(baseurl + '/api/order-items/all');
        const itemsData = await itemsRes.json();
        const filteredItems = itemsData.data.filter(
          (item) => item.order_id === Number(orderId)
        );

        setOrderDetails(details);
        setOrderItems(filteredItems);

      } catch (err) {
        console.error('Error loading order data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [orderId, navigate]);

  // Calculate totals
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

  // This effect runs after order details and items are loaded and grandTotal is calculated.
  useEffect(() => {
    if (orderDetails && grandTotal > 0) {
      // Mock payment history - in a real app, you would fetch this from an API
      const mockPayments = [
        {
          date: new Date().toISOString().split('T')[0],
          transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
          method: orderDetails?.payment_method || 'Cash',
          amount: grandTotal, // Use the calculated grandTotal
          status: orderDetails.status === 'Delivered' ? 'Completed' : 'Pending',
        }
      ];
      setPaymentHistory(mockPayments);
    }
  }, [orderDetails, grandTotal]);

  if (loading) return <CircularProgress />;
  if (!orderDetails) return <Typography>No order details found.</Typography>;

  // Determine payment status based on order status
  const getPaymentStatus = () => {
    switch (orderDetails.status) {
      case 'Delivered':
        return 'Paid';
      case 'Out for Delivery':
        return 'Pending';
      case 'New Order':
        return 'Not Processed';
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedPayments = paymentHistory.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/invoice">Customer Invoice & Payment Tracking</Link>
        <Typography color="text.primary">Payment History</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Payment History -  {orderDetails.CustomerProfile?.institution_name || 'Customer'}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2">Invoice Amount</Typography>
            <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>₹{grandTotal.toFixed(2)}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" sx={{marginTop: "-8px"}}>Payment Status</Typography>
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
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2">Balance Due</Typography>
            <Typography variant="h6" sx={{ mt: 1, mb: 1, color: paymentStatus === 'Paid' ? green[600] : red[600] }}>
              {paymentStatus === 'Paid' ? '₹0.00' : `₹${grandTotal.toFixed(2)}`}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Timeline */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Payment History Timeline
      </Typography>
      <Box marginLeft= "-120px" justifyContent="flex-start" marginTop= "30px" marginBottom="50px">
      <Stepper alternativeLabel activeStep={paymentStatus === 'Paid' ? 3 : paymentStatus === 'Pending' ? 2 : 1} sx={{ mb: 4, textAlign: "left" }}>
        <Step>
          <StepLabel>Order Created</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment Initiated</StepLabel>
        </Step>
        <Step>
          <StepLabel>Payment {paymentStatus === 'Paid' ? 'Completed' : 'Processing'}</StepLabel>
        </Step>
        <Step>
          <StepLabel>Order {orderDetails.status === 'Delivered' ? 'Delivered' : 'Delivery'}</StepLabel>
        </Step>
      </Stepper>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight="bold">Invoice Created</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{orderDetails.order_date}</Typography>
            <Typography variant="body2">Amount: ₹{grandTotal.toFixed(2)}</Typography>
            <Typography variant="body2" sx={{ color: green[600], mt: 1 }}>
              By: {orderDetails.CustomerProfile?.contact_person_name || 'Customer'}
            </Typography>
          </Paper>
        </Grid>

        {paymentHistory.length > 0 && (
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {paymentHistory[0].status === 'Completed' ? 'Payment Received' : 'Payment Initiated'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>{paymentHistory[0].date}</Typography>
              <Typography variant="body2">Amount: ₹{paymentHistory[0].amount}</Typography>
              <Typography variant="body2" sx={{ color: blue[600], textDecoration: 'underline', cursor: 'pointer', mt: 1 }}>
                Transaction ID: {paymentHistory[0].transactionId}
              </Typography>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight="bold">Current Status</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{orderDetails.status}</Typography>
            <Typography variant="body2">
              Balance: {paymentStatus === 'Paid' ? '₹0.00' : `₹${grandTotal.toFixed(2)}`}
            </Typography>
            <Typography variant="body2" sx={{
              color: paymentStatus === 'Paid' ? green[600] : red[600],
              mt: 1
            }}>
              {paymentStatus === 'Paid' ? 'Payment Complete' : 'Action Required'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Details Table */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
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
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment, index) => (
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={paymentHistory.length}
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