import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

const GreenHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: '#10B981',
  padding: theme.spacing(2),
  color: 'white',
  borderRadius: '4px 4px 0 0',
  marginBottom: 0
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '0 0 4px 4px',
  marginBottom: theme.spacing(3)
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1, 0),
  '& > :first-of-type': {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
  }
}));

const OrderView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the order ID from location state or URL params
    const orderId = location.state?.orderData?.id || location.state?.orderData?.oid;

    if (orderId) {
      fetchOrderData(orderId);
      fetchOrderItems();
    } else {
      setError("Order ID not found");
      setLoading(false);
    }
  }, [location]);

  const fetchOrderData = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/order/${orderId}`);

      if (!response.ok) {
        throw new Error(`Error fetching order: ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.data) {
        setOrderData(data.data);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      setError(error.message);
    }
  };

  const fetchOrderItems = async () => {
    try {
      const response = await fetch(`${baseurl}/api/order-items/all`);
      if (!response.ok) {
        throw new Error(`Error fetching order items: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.data) {
        setOrderItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      setLoading(false);
    }
  };

const calculateOrderTotal = () => {
  if (!orderData || !orderItems.length) return 0;
  
  const itemsForOrder = orderItems.filter(item => item.order_id === parseInt(orderData.id || orderData.oid));
  
  if (itemsForOrder.length === 0) return 0;
  
  const subtotal = itemsForOrder.reduce((sum, item) => {
    const lineTotal = parseFloat(item.line_total) || 0;
    return sum + lineTotal;
  }, 0);

  let cgstAmount = 0;
  let sgstAmount = 0;

  itemsForOrder.forEach(item => {
    const cgstRate = item.Product?.cgst || 0;
    const sgstRate = item.Product?.sgst || 0;
    const lineTotal = parseFloat(item.line_total) || 0;

    cgstAmount += (lineTotal * cgstRate) / 100;
    sgstAmount += (lineTotal * sgstRate) / 100;
  });

  const totalDeliveryFee = itemsForOrder.reduce(
    (acc, item) => acc + (Number(item.Product?.delivery_fee) || 0),
    0
  );

  const grandTotal = Number(subtotal) + Number(cgstAmount) + Number(sgstAmount) + Number(totalDeliveryFee);
  return grandTotal.toFixed(2);
};

  const handleNavigateToInvoiceView = () => {
    navigate(`/invoice-view/${orderData.id || orderData.oid}`, { state: { orderData } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!orderData) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">Order not found</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover" sx={{ color: '#10B981' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/customer-orders" underline="hover" sx={{ color: '#10B981' }}>
          Customer Order Management
        </Link>
        <Typography color="textPrimary">View Order</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        View Order
      </Typography>

      <Box sx={{ mb: 4 }}>
        <GreenHeader elevation={0}>
          <Typography variant="h6">Order Information</Typography>
        </GreenHeader>
        <StyledPaper elevation={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoRow>
                <Typography>Order ID :</Typography>
                <Typography>{orderData.oid || orderData.id}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Customer :</Typography>
                <Typography>{orderData.CustomerProfile?.contact_person_name}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Amount :</Typography>
                <Typography>₹{calculateOrderTotal()}</Typography>
              </InfoRow>
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoRow>
                <Typography>Ordered Date :</Typography>
                <Typography>{orderData.order_date}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Delivery Date :</Typography>
                <Typography>{orderData.delivery_date}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Status :</Typography>
                <Chip
                  label={orderData.status}
                  size="small"
                  sx={{
                    bgcolor: getStatusChipColor(orderData.status).bg,
                    color: getStatusChipColor(orderData.status).color,
                    borderRadius: '16px',
                    fontWeight: 500
                  }}
                />
              </InfoRow>
            </Grid>
          </Grid>
        </StyledPaper>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GreenHeader elevation={0}>
            <Typography variant="h6">Driver Information</Typography>
          </GreenHeader>
          <StyledPaper elevation={1}>
            <InfoRow>
              <Typography>Driver Name :</Typography>
              <Typography>
                {orderData?.DriversDetail
                  ? `${orderData.DriversDetail.first_name} ${orderData.DriversDetail.last_name}`
                  : 'Not Assigned'}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography>Contact No. :</Typography>
              <Typography>
                {orderData?.DriversDetail?.phone || 'Not Assigned'}
              </Typography>
            </InfoRow>
            <InfoRow>
              <Typography>Vehicle No. :</Typography>
              <Typography>
                {orderData?.DriversDetail?.vehicle_number || 'Not Assigned'}
              </Typography>
            </InfoRow>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <GreenHeader elevation={0}>
  <Typography variant="h6">Payment Information</Typography>
</GreenHeader>
<StyledPaper elevation={1}>
  <InfoRow>
    <Typography>Payment Method :</Typography>
    <Typography sx={{ color: orderData.payment_method === 'cash on delivery' ? '#F97316' : '#10B981' }}>
      {orderData.payment_method?.toUpperCase() || 'N/A'}
    </Typography>
  </InfoRow>

  <InfoRow>
    <Typography>Payment Status :</Typography>
    <Typography>
      {orderData.status === 'Delivered' ? 'Paid' : (orderData.payment_status || 'Pending')}
    </Typography>
  </InfoRow>

  {orderData.status === 'Delivered' && (
    <InfoRow>
      <Typography>Invoice No. :</Typography>
      <Typography>{orderData.order_id || 'Not Generated'}</Typography>
    </InfoRow>
  )}
</StyledPaper>

        </Grid>
      </Grid>

      {/* Order Items Section */}
      {orderItems.filter(item => item.order_id === parseInt(orderData.id || orderData.oid)).length > 0 && (
        <Box sx={{ mt: 3 }}>
          <GreenHeader elevation={0}>
            <Typography variant="h6">Order Items</Typography>
          </GreenHeader>
          <StyledPaper elevation={1}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <Typography fontWeight="bold">Product</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography fontWeight="bold" align="right">Qty</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography fontWeight="bold" align="right">Price</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography fontWeight="bold" align="right">Total</Typography>
              </Grid>
            </Grid>
            {orderItems
              .filter(item => item.order_id === parseInt(orderData.id || orderData.oid))
              .map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ py: 1, borderBottom: '1px solid #eee' }}>
                  <Grid item xs={5}>
                    <Typography>{item.Product?.product_name || 'Unknown Product'}</Typography>
                    {item.notes && <Typography variant="caption" color="text.secondary">{item.notes}</Typography>}
                  </Grid>
                  <Grid item xs={2}>
                    <Typography align="right">{item.quantity}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography align="right">₹{item.unit_price}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography align="right">₹{item.line_total}</Typography>
                  </Grid>
                </Grid>
              ))}
          </StyledPaper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          sx={{
            mr: 2,
            bgcolor: '#10B981',
            '&:hover': { bgcolor: '#059669' }
          }}
          onClick={handleNavigateToInvoiceView}
        >
          View Invoice
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#D1D5DB',
            color: '#000',
            '&:hover': { bgcolor: '#9CA3AF' }
          }}
          onClick={handleBack}
        >
          Back
        </Button>
      </Box>
    </Container>
  );
};

// Helper function to get chip colors based on status
const getStatusChipColor = (status) => {
  switch (status) {
    case 'New Order':
      return { bg: '#FFF4CC', color: '#FFC107' };
    case 'Confirmed':
      return { bg: '#DCFCE7', color: '#4CAF50' };
    case 'Out for Delivery':
      return { bg: '#DBEAFE', color: '#2196F3' };
    case 'Delivered':
      return { bg: '#F3E8FF', color: '#9333EA' };
    case 'Cancelled':
      return { bg: '#FEE2E2', color: '#F44336' };
    case 'Shipped':
      return { bg: '#DBEAFE', color: '#2196F3' };
    default:
      return { bg: '#F3F4F6', color: '#757575' };
  }
};

export default OrderView;