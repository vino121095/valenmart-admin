import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Cancel,
  ShoppingCart,
  AssignmentTurnedIn,
  HourglassEmpty,
  LocationOn,
  Person,
  Phone,
  Email,
  Home,
  ArrowBack
} from '@mui/icons-material';
import baseurl from '../ApiService/ApiService';

const TrackOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryImage, setDeliveryImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get order ID from navigation state or URL params
  const orderId = location.state?.orderData?.id || location.pathname.split('/').pop();

  // Calculate order total from order items
  const calculateOrderTotal = () => {
    if (!orderItems || orderItems.length === 0) return '0.00';
    
    const itemsForOrder = orderItems.filter(item => item.order_id === parseInt(orderId));
    
    if (itemsForOrder.length === 0) return '0.00';
    
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
    return isNaN(grandTotal) ? '0.00' : grandTotal.toFixed(2);
  };

  // Define tracking steps based on order status
  const getTrackingSteps = () => {
    if (!order) return [];
    
    const steps = [
      {
        label: 'Order Placed',
        description: 'Your order has been received',
        icon: <ShoppingCart />,
        active: true,
        completed: true,
        date: order?.order_date || ''
      },
      {
        label: 'Order Confirmed',
        description: 'Seller has confirmed your order',
        icon: <AssignmentTurnedIn />,
        active: order?.status === 'Confirmed' || 
               order?.status === 'Out for Delivery' || 
               order?.status === 'Delivered' || 
               order?.status === 'Shipped',
        completed: ['Confirmed', 'Out for Delivery', 'Delivered', 'Shipped'].includes(order?.status),
        date: order?.status === 'New Order' ? 'Pending' : order?.confirmed_date || ''
      },
      {
        label: order?.status === 'Shipped' ? 'Order Shipped' : 'Processing',
        description: order?.status === 'Shipped' ? 'Your order has been shipped' : 'Preparing your order',
        icon: order?.status === 'Shipped' ? <LocalShipping /> : <HourglassEmpty />,
        active: order?.status === 'Out for Delivery' || 
               order?.status === 'Delivered' || 
               order?.status === 'Shipped',
        completed: ['Out for Delivery', 'Delivered', 'Shipped'].includes(order?.status),
        date: order?.status === 'Shipped' ? order?.shipped_date || '' : ''
      },
      {
        label: order?.status === 'Out for Delivery' ? 'Out for Delivery' : 'Ready for Delivery',
        description: order?.status === 'Out for Delivery' ? 'Your order is on its way' : 'Waiting for delivery',
        icon: <LocalShipping />,
        active: order?.status === 'Out for Delivery' || order?.status === 'Delivered',
        completed: ['Out for Delivery', 'Delivered'].includes(order?.status),
        date: order?.status === 'Out for Delivery' ? order?.out_for_delivery_date || '' : ''
      },
      {
        label: 'Delivered',
        description: 'Your order has been delivered',
        icon: <CheckCircle />,
        active: order?.status === 'Delivered',
        completed: order?.status === 'Delivered',
        date: order?.status === 'Delivered' ? order?.delivered_date || '' : ''
      }
    ];

    if (order?.status === 'Cancelled') {
      steps.push({
        label: 'Cancelled',
        description: 'Your order has been cancelled',
        icon: <Cancel />,
        active: true,
        completed: true,
        date: order?.cancelled_date || ''
      });
    }

    return steps;
  };

  // Helper to display status (treat 'Shipped' as 'Delivered')
  const getDisplayStatus = (status) => (status === 'Shipped' ? 'Delivered' : status);

  const getStatusChip = () => {
    if (!order) return null;
    let color, icon;
    const displayStatus = getDisplayStatus(order.status);
    switch (displayStatus) {
      case 'New Order':
        color = 'warning';
        icon = <HourglassEmpty />;
        break;
      case 'Confirmed':
        color = 'info';
        icon = <AssignmentTurnedIn />;
        break;
      case 'Out for Delivery':
        color = 'primary';
        icon = <LocalShipping />;
        break;
      case 'Delivered':
        color = 'success';
        icon = <CheckCircle />;
        break;
      case 'Cancelled':
        color = 'error';
        icon = <Cancel />;
        break;
      default:
        color = 'default';
        icon = <HourglassEmpty />;
    }
    return (
      <Chip
        icon={icon}
        label={displayStatus}
        color={color}
        sx={{
          fontSize: '1rem',
          padding: '8px 16px',
          borderRadius: '4px'
        }}
      />
    );
  };

  // Delivery image upload handler
  const handleDeliveryImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDeliveryImage(e.target.files[0]);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!deliveryImage) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('delivery_image', deliveryImage);
      const res = await fetch(`${baseurl}/api/delivery/mark-delivered/${orderId}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to mark as delivered');
      // Refresh order details
      const orderResponse = await fetch(`${baseurl}/api/order/${orderId}`);
      const orderData = await orderResponse.json();
      setOrder(orderData.data);
      setDeliveryImage(null);
    } catch (err) {
      alert('Error uploading delivery image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleManualMarkDelivered = async () => {
    setUploading(true);
    try {
      const res = await fetch(`${baseurl}/api/order/update/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Delivered' })
      });
      if (!res.ok) throw new Error('Failed to update status');
      // Refresh order details
      const orderResponse = await fetch(`${baseurl}/api/order/${orderId}`);
      const orderData = await orderResponse.json();
      setOrder(orderData.data);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch order details
        const orderResponse = await fetch(`${baseurl}/api/order/${orderId}`);
        if (!orderResponse.ok) {
          throw new Error(`Error fetching order: ${orderResponse.statusText}`);
        }
        const orderData = await orderResponse.json();
        
        // Fetch order items
        const itemsResponse = await fetch(`${baseurl}/api/order-items/all`);
        if (!itemsResponse.ok) {
          throw new Error(`Error fetching order items: ${itemsResponse.statusText}`);
        }
        const itemsData = await itemsResponse.json();
        
        if (orderData && orderData.data) {
          setOrder(orderData.data);
        } else {
          throw new Error("Invalid order data structure");
        }
        
        if (itemsData && itemsData.data) {
          setOrderItems(itemsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && orderId !== 'track-order') {
      fetchOrderDetails();
    } else {
      setError("No order ID provided");
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Order not found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Orders
      </Button>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Order Tracking
      </Typography>

      <Grid container spacing={3}>
        {/* Order Tracking Stepper */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Order #{order.order_id}
              </Typography>
              {getStatusChip()}
            </Box>

            {/* Manual update shipped -> delivered */}
            {order.status === 'Shipped' && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleManualMarkDelivered}
                  disabled={uploading}
                >
                  {uploading ? 'Updating...' : 'Mark as Delivered'}
                </Button>
              </Box>
            )}

            <Stepper orientation="vertical" activeStep={getTrackingSteps().findIndex(step => step.active && !step.completed)}>
              {getTrackingSteps().map((step, index) => (
                <Step key={step.label} completed={step.completed} active={step.active}>
                  <StepLabel
                    optional={step.date ? <Typography variant="caption">{step.date}</Typography> : null}
                    icon={
                      <Avatar
                        sx={{
                          bgcolor: step.completed ? theme.palette.success.main : 
                                  step.active ? theme.palette.primary.main : 
                                  theme.palette.grey[300],
                          color: step.completed || step.active ? '#fff' : theme.palette.text.primary
                        }}
                      >
                        {step.icon}
                      </Avatar>
                    }
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2">{step.description}</Typography>
                    {/* Show upload UI if Out for Delivery */}
                    {order.status === 'Out for Delivery' && step.label === 'Out for Delivery' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Upload Delivery Image & Mark as Delivered
                        </Typography>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleDeliveryImageChange}
                          disabled={uploading}
                        />
                        <Button
                          variant="contained"
                          color="success"
                          sx={{ ml: 2, mt: 1 }}
                          onClick={handleMarkAsDelivered}
                          disabled={!deliveryImage || uploading}
                        >
                          {uploading ? 'Uploading...' : 'Mark as Delivered'}
                        </Button>
                        {deliveryImage && (
                          <Box mt={2}>
                            <Typography variant="body2">Preview:</Typography>
                            <img
                              src={URL.createObjectURL(deliveryImage)}
                              alt="Preview"
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #eee' }}
                            />
                          </Box>
                        )}
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            {order.status === 'Out for Delivery' && order.DriversDetail && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Delivery Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Driver Name" 
                          secondary={order.DriversDetail.driver_name || `${order.DriversDetail.first_name} ${order.DriversDetail.last_name}`} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <Phone />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Contact Number" 
                          secondary={order.DriversDetail.phone || order.DriversDetail.contact_number} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <List dense>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <LocalShipping />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Vehicle" 
                          secondary={order.DriversDetail.vehicle_type || 'Not specified'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar>
                            <LocationOn />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary="Current Location" 
                          secondary={order.DriversDetail.current_location || 'In transit'} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Order Summary
            </Typography>

            {/* Show delivery image if present */}
            {order.delivery_image && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Delivery Image Uploaded by Driver:
                </Typography>
                <img
                  src={order.delivery_image.startsWith('http') ? order.delivery_image : `${baseurl}/${order.delivery_image}`}
                  alt="Delivery"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    border: '1px solid #eee',
                  }}
                />
              </Box>
            )}

            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Order Date" 
                  secondary={order.order_date} 
                  secondaryTypographyProps={{ color: 'text.primary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Delivery Date" 
                  secondary={order.delivery_date || 'Not specified'} 
                  secondaryTypographyProps={{ color: 'text.primary' }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Payment Method" 
                  secondary={order.payment_method} 
                  secondaryTypographyProps={{ 
                    color: order.payment_method === 'cash on delivery' ? theme.palette.warning.main : theme.palette.success.main,
                    fontWeight: 'medium'
                  }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Total Amount" 
                  secondary={`₹${calculateOrderTotal()}`} 
                  secondaryTypographyProps={{ 
                    color: 'text.primary',
                    fontWeight: 'bold',
                    fontSize: '1.1rem'
                  }}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Delivery Address
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Home color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {order.CustomerProfile?.address || 'No address provided'}
              </Typography>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Customer Contact
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {order.CustomerProfile?.contact_person_name || 'No name provided'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {order.CustomerProfile?.contact_person_phone || 'No phone provided'}
              </Typography>
            </Box>
            {order.CustomerProfile?.email && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {order.CustomerProfile.email}
                </Typography>
              </Box>
            )}
          </Paper>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => navigate('/invoice-view', { state: { orderData: order } })}
            sx={{ mb: 2 }}
          >
            View Invoice
          </Button>

          {order.status === 'Out for Delivery' && (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                // Implement call driver functionality
                window.location.href = `tel:${order.DriversDetail?.phone || order.DriversDetail?.contact_number}`;
              }}
            >
              Call Driver
            </Button>
          )}
        </Grid>
      </Grid>

      {/* Order Items - Only show if order has items */}
      {orderItems.filter(item => item.order_id === parseInt(orderId)).length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Order Items
          </Typography>
          <List>
            {orderItems
              .filter(item => item.order_id === parseInt(orderId))
              .map((item, index) => (
                <ListItem key={index} divider={index < orderItems.length - 1}>
                  <ListItemAvatar>
                    <Avatar 
                      variant="square"
                      sx={{ bgcolor: theme.palette.grey[200] }}
                    >
                      {item.Product?.product_name?.charAt(0) || 'I'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.Product?.product_name || 'Unknown Product'}
                    secondary={`Quantity: ${item.quantity} | Price: ₹${item.unit_price}`}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    ₹{item.line_total}
                  </Typography>
                </ListItem>
              ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default TrackOrder;