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
  TableContainer,
  Breadcrumbs, 
  Link,
  TablePagination
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { green, yellow } from '@mui/material/colors';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function CustomerManagementView1() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); // from route: /customerview1/:id
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDirection, setOrderDirection] = useState({});
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedOrders = [...orders].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'orderId':
          aValue = a.order_id; // Changed from a.oid to a.order_id
          bValue = b.order_id; // Changed from b.oid to b.order_id
          break;
        case 'orderDate':
          aValue = new Date(a.order_date);
          bValue = new Date(b.order_date);
          break;
        case 'amount':
          aValue = parseFloat(a.total_amount || 0);
          bValue = parseFloat(b.total_amount || 0);
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
    
    setOrders(sortedOrders);
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
  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/customer">Customer Management</Link>
        <Typography color="text.primary">Customer Details</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3}}>
        Customer Details - {customer.institution_name}
      </Typography>
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

      {/* Orders Table */}
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
                onClick={() => handleSort('orderId')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Order ID
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('orderId')}</Box>
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
                onClick={() => handleSort('orderDate')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Order Date
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('orderDate')}</Box>
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
                onClick={() => handleSort('amount')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Amount
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('amount')}</Box>
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
                onClick={() => handleSort('status')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Status
                  <Box sx={{ ml: 0.5 }}>{getSortIcon('status')}</Box>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Actions</TableCell>
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
              paginatedOrders.map((order) => (
                <TableRow 
                  key={order.oid}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    height: 80
                  }}
                >
                  <TableCell sx={{ py: 2 }}>{order.order_id}</TableCell> {/* Changed from order.oid to order.order_id */}
                  <TableCell sx={{ py: 2 }}>{order.order_date}</TableCell>
                  <TableCell sx={{ py: 2 }}>{order.total_amount}</TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {order.status === 'Delivered' ? (
                      <Chip label="Delivered" size="small" sx={{ bgcolor: green[100], color: green[800] }} />
                    ) : (
                      <Chip label={order.status} size="small" sx={{ bgcolor: yellow[100], color: '#B28900' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
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