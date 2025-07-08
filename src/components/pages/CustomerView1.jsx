import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { green, yellow } from '@mui/material/colors';
import baseurl from '../ApiService/ApiService';

export default function CustomerManagementView1() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); // from route: /customerview1/:id
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${baseurl}/api/customer-profile/all`)
      .then((res) => res.json())
      .then((data) => {
        const customerList = data.data || [];
        const matchedCustomer = customerList.find(c => String(c.cpid) === id);
        setCustomer(matchedCustomer || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch customer details:', err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    // Fetch all orders, then filter by customer_id
    fetch(`${baseurl}/api/order/all`)
      .then((res) => res.json())
      .then((data) => {
        const allOrders = data.data || [];
        const filteredOrders = allOrders.filter((order) => String(order.customer_id) === id);
        setOrders(filteredOrders);
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err);
      });
  }, [id]);

  if (loading) {
    return <Typography sx={{ p: 4 }}>Loading...</Typography>;
  }

  if (!customer) {
    return <Typography sx={{ p: 4, color: 'error.main' }}>Customer not found.</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f4f8', minHeight: '100vh' }}>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        Dashboard &gt; Customer Management &gt; Customer Details
      </Typography>

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Customer Details - {customer.institution_name}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate(-1)}>
        &larr; Back
      </Button>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Customer Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Customer ID:</strong> #{customer.cpid}</Typography>
            <Typography><strong>Customer Name:</strong> {customer.institution_name}</Typography>
            <Typography><strong>Email:</strong> {customer.contact_person_email}</Typography>
            <Typography>
              <strong>Status:</strong>{' '}
              <Chip label="Active" size="small" sx={{ bgcolor: green[100], color: green[800], ml: 1 }} />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Contact Person:</strong> {customer.contact_person_name}</Typography>
            <Typography><strong>Phone Number:</strong> {customer.contact_person_phone}</Typography>
            <Typography>
              <strong>Billing Address:</strong>{' '}
              {customer.address}, {customer.city}, {customer.state} - {customer.postal_code}
            </Typography>
            <Typography><strong>Registration Date:</strong>{' '}
              {new Date(customer.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table (placeholder) */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2CA66F' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Order Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No orders found for this customer.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.oid}>
                  <TableCell>{order.oid}</TableCell>
                  <TableCell>{order.order_date}</TableCell>
                  <TableCell>{order.total_amount}</TableCell>
                  <TableCell>
                    {order.status === 'Delivered' ? (
                      <Chip label="Delivered" size="small" sx={{ bgcolor: green[100], color: green[800] }} />
                    ) : (
                      <Chip label={order.status} size="small" sx={{ bgcolor: yellow[100], color: '#B28900' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/customerview2', { state: { orderId: order.oid } })}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
      </TableContainer>
    </Box>
  );
}
