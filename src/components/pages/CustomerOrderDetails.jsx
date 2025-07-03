import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Chip,
  Divider,
  TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function CustomerOrderDetails() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/order/${oid}`)
      .then((res) => res.json())
      .then((data) => {
        setOrderDetails(data.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [oid]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

  const Field = ({ label, value }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ color: '#888' }}>
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  );

  if (loading) return <CircularProgress sx={{ mt: 5 }} />;
  if (!orderDetails)
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No order found for OID: {oid}</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Box>
    );

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4, maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Order #{orderDetails.order_id}</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </Box>

      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        {/* Order Status and Payment */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={orderDetails.status}
            color={orderDetails.status === 'Delivered' ? 'success' : 'warning'}
            variant="filled"
          />
          <Typography variant="h6" sx={{ mt: { xs: 2, md: 0 } }}>
            ₹ {orderDetails.total_amount}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Section 1: Customer Info */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}><PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Customer Info</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Field label="Contact Person" value={orderDetails.CustomerProfile?.contact_person_name} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Institution Name" value={orderDetails.CustomerProfile?.institution_name} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Email" value={orderDetails.CustomerProfile?.contact_person_email} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 2: Delivery Address */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}><LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Delivery Address</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Field label="Address" value={orderDetails.address} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Field label="City" value={orderDetails.city} />
            </Grid>
            <Grid item xs={6} md={2}>
              <Field label="State" value={orderDetails.state} />
            </Grid>
            <Grid item xs={6} md={2}>
              <Field label="Postal Code" value={orderDetails.postal_code} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 3: Delivery Contact */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}><LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Delivery Contact</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Field label="Contact Name" value={orderDetails.delivery_contact_name} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field label="Phone" value={orderDetails.delivery_contact_phone} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 4: Order Info */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}><CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Order Info</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Field label="Order Date" value={formatDate(orderDetails.order_date)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Delivery Date" value={formatDate(orderDetails.delivery_date)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Field label="Delivery Time" value={orderDetails.delivery_time} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Special Instructions" value={orderDetails.special_instructions} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 5: Payment */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}><PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Payment</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Field label="Payment Method" value={orderDetails.payment_method} />
            </Grid>
          </Grid>
        </Box>

        {/* Section 6: Driver Info */}
        {orderDetails.DriversDetail && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Driver Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Field label="First Name" value={orderDetails.DriversDetail.first_name} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Field label="Last Name" value={orderDetails.DriversDetail.last_name} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Field label="Phone" value={orderDetails.DriversDetail.phone} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Field label="Vehicle Number" value={orderDetails.DriversDetail.vehicle_number} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
