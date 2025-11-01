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
  Breadcrumbs,
  Link,
  IconButton,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerOrderDetails() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseurl}/api/order/${oid}`)
      .then((res) => res.json())
      .then((data) => {
        setOrderDetails(data.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [oid]);

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

  const Field = ({ label, value, icon }) => (
    <Box sx={{ 
      mb: 2.5, 
      p: 2, 
      borderRadius: 1.5, 
      bgcolor: '#f8f9fa',
      borderLeft: '3px solid #00A67E',
      transition: 'all 0.2s',
      '&:hover': {
        bgcolor: '#f0f9f4',
        transform: 'translateX(3px)'
      }
    }}>
      <Typography variant="body2" sx={{ 
        color: '#666', 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 500,
        mb: 0.5
      }}>
        {icon && <Box component="span" sx={{ mr: 1, color: '#00A67E' }}>{icon}</Box>}
        <Typography variant="body1"  fontWeight="bold" sx={{ color: '#333' }}>
        {label || '—'}
      </Typography>
      </Typography>
      <Typography variant="body2" sx={{ color: '#333' }}>
        {value || '—'}
      </Typography>
    </Box>
  );

  const SectionHeader = ({ title, icon }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      mb: 3, 
      pb: 1.5,
      borderBottom: '2px solid #e0f2f1'
    }}>
      <Box sx={{ 
        width: 36, 
        height: 36, 
        borderRadius: '50%', 
        bgcolor: '#00A67E', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mr: 2
      }}>
        {React.cloneElement(icon, { sx: { color: 'white', fontSize: 20 } })}
      </Box>
      <Typography variant="h6" fontWeight="bold" color="#00A67E">
        {title}
      </Typography>
    </Box>
  );

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <CircularProgress sx={{ color: '#00A67E' }} />
    </Box>
  );
  
  if (!orderDetails)
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">No order found for OID: {oid}</Typography>
      </Box>
    );

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/" color="#00A67E">Dashboard</Link>
        <Link underline="hover" href="/customer" color="#00A67E">Customer Management</Link>
        <Typography color="text.primary">Order Details</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="bold">Order #{orderDetails.order_id}</Typography>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        {/* Order Status and Payment */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body1" color="#000" fontWeight="bold" sx={{ mb: 0.5 }}>Order Status</Typography>
            <Chip
              label={orderDetails.status}
              color={orderDetails.status === 'Delivered' ? 'success' : 'warning'}
              variant="filled"
              size="medium"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          <Box textAlign="right">
            <Typography variant="body1" color="#000"  fontWeight="bold" sx={{ mb: 0.5 }}>Total Amount</Typography>
            <Typography variant="h5" fontWeight="bold" color="#00A67E">
              ₹ {orderDetails.total_amount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Section 1: Customer Info */}
        <SectionHeader title="Customer Information" icon={<PersonIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Field 
              label="Contact Person" 
              value={orderDetails.CustomerProfile?.contact_person_name} 
              icon={<PersonIcon />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field 
              label="Institution Name" 
              value={orderDetails.CustomerProfile?.institution_name} 
              icon={<BusinessIcon />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Field 
              label="Email" 
              value={orderDetails.CustomerProfile?.contact_person_email} 
              icon={<EmailIcon />}
            />
          </Grid>
        </Grid>

        {/* Section 2: Delivery Address */}
        <SectionHeader title="Delivery Address" icon={<LocationOnIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Field 
              label="Address" 
              value={orderDetails.address} 
              icon={<LocationOnIcon />}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Field label="City" value={orderDetails.city} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Field label="State" value={orderDetails.state} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Field label="Postal Code" value={orderDetails.postal_code} />
          </Grid>
        </Grid>

        {/* Section 3: Delivery Contact */}
        <SectionHeader title="Delivery Contact" icon={<LocalShippingIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Field 
              label="Contact Name" 
              value={orderDetails.delivery_contact_name} 
              icon={<PersonIcon />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Field 
              label="Phone" 
              value={orderDetails.delivery_contact_phone} 
              icon={<PhoneIcon />}
            />
          </Grid>
        </Grid>

        {/* Section 4: Order Info */}
        <SectionHeader title="Order Information" icon={<CalendarTodayIcon />} />
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

        {/* Section 5: Payment */}
        <SectionHeader title="Payment Information" icon={<PaymentIcon />} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Field 
              label="Payment Method" 
              value={orderDetails.payment_method} 
              icon={<PaymentIcon />}
            />
          </Grid>
        </Grid>

        {/* Section 6: Driver Info */}
        {orderDetails.DriversDetail && (
          <>
            <SectionHeader title="Driver Details" icon={<LocalShippingIcon />} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Field 
                  label="First Name" 
                  value={orderDetails.DriversDetail.first_name} 
                  icon={<PersonIcon />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Field 
                  label="Last Name" 
                  value={orderDetails.DriversDetail.last_name} 
                  icon={<PersonIcon />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Field 
                  label="Phone" 
                  value={orderDetails.DriversDetail.phone} 
                  icon={<PhoneIcon />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Field 
                  label="Vehicle Number" 
                  value={orderDetails.DriversDetail.vehicle_number} 
                  icon={<LocalShippingIcon />}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          startIcon={<ReceiptIcon />}
          onClick={() => navigate(`/invoice-view/${oid}`)}
          disabled={orderDetails.status !== 'Delivered'}
          sx={{ 
            bgcolor: '#00A67E',
            '&:hover': { bgcolor: '#008F59' },
            '&:disabled': { 
              bgcolor: '#e0e0e0', 
              color: '#9e9e9e' 
            }
          }}
        >
          Download Invoice
        </Button>
      </Box>
    </Box>
  );
}