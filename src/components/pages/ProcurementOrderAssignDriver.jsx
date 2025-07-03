import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Breadcrumbs,
  Avatar,
  Link,
  Container
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useParams } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

const ProcurementOrderAssignDriver = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch procurement order details
        const orderRes = await fetch(`${baseurl}/api/procurement/${id}`);
        const orderData = await orderRes.json();
        setOrderDetails(orderData.data);

        // Fetch all drivers and filter by 'Available' status
        const driversRes = await fetch(`${baseurl}/api/driver-details/all`);
        const driversData = await driversRes.json();
        const availableDrivers = (driversData.data || []).filter(driver => driver.status === 'Available');
        setDrivers(availableDrivers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Helper function to get chip style based on status
  const getChipStyle = (status) => {
    switch (status) {
      case 'Available':
        return { bgcolor: '#e6f7ed', color: '#00875a' };
      case 'Not Available':
        return { bgcolor: '#ffebe6', color: '#de350b' };
      case 'Approved':
        return { bgcolor: '#e6f7ed', color: '#00875a' };
      case '1 Pending':
        return { bgcolor: '#fffae6', color: '#ff8b00' };
      default:
        return {};
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2, '& .MuiBreadcrumbs-ol': { color: '#00b77e' } }}
      >
        <Link underline="hover" color="#00b77e" href="#">
          Dashboard
        </Link>
        <Link underline="hover" color="#00b77e" href="#">
          Procurement Order Management
        </Link>
        <Typography color="#00b77e">Assign Driver</Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>
        Assign Driver
      </Typography>

      {/* Order Details Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 3, 
            color: '#00b77e', 
            fontWeight: 'bold' 
          }}
        >
          Order Details
        </Typography>

        {orderDetails ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Order ID :
                </Typography>
                <Typography>{orderDetails.procurement_id || orderDetails.orderId}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Vendor/Farmer :
                </Typography>
                <Typography>
                  {orderDetails.vendor_name ||
                    (typeof orderDetails.vendor === 'object'
                      ? orderDetails.vendor?.contact_person
                      : orderDetails.vendor) ||
                    'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Items :
                </Typography>
                <Typography>{orderDetails.items}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Total Amount :
                </Typography>
                <Typography>{orderDetails.total_amount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Request Date :
                </Typography>
                <Typography>{orderDetails.order_date || orderDetails.requestDate}</Typography>
              </Box>
              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', width: 150 }}>
                  Status :
                </Typography>
                <Chip 
                  label={orderDetails.status} 
                  size="small" 
                  sx={getChipStyle(orderDetails.status)}
                />
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography color="error">Order details not found.</Typography>
        )}
      </Paper>

      {/* Available Drivers Section */}
      <Box sx={{ mb: 2 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 1, 
            color: '#00b77e', 
            fontWeight: 'bold' 
          }}
        >
          Available Drivers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a Driver to assign this order
        </Typography>
      </Box>

      {/* Driver Cards */}
      <Grid container spacing={3}>
        {drivers.length === 0 ? (
          <Grid item xs={12}><Typography>No available drivers found.</Typography></Grid>
        ) : (
          drivers.map((driver) => (
            <Grid item xs={12} md={6} key={driver.id || driver.did}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Avatar 
                    src={driver.avatar || driver.profile_image}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        {driver.name || `${driver.first_name} ${driver.last_name}`}
                      </Typography>
                      <Chip 
                        label={driver.status} 
                        size="small" 
                        sx={getChipStyle(driver.status)}
                      />
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ ml: 12 }}>
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Typography sx={{ color: 'text.secondary', width: 90 }}>
                      Vehicle :
                    </Typography>
                    <Typography>{driver.vehicle || driver.vehicle_number}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Typography sx={{ color: 'text.secondary', width: 90 }}>
                      Phone :
                    </Typography>
                    <Typography>{driver.phone || driver.mobile}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-start', ml: 12 }}>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      borderRadius: 50, 
                      textTransform: 'none',
                      bgcolor: '#00b77e',
                      '&:hover': {
                        bgcolor: '#009e6a',
                      },
                      mr: 2
                    }}
                  >
                    Assign Driver
                  </Button>
                  <Button 
                    variant="outlined" 
                    sx={{ 
                      borderRadius: 50, 
                      textTransform: 'none',
                      borderColor: '#ccc',
                      color: '#666',
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#e0e0e0',
                        borderColor: '#bbb',
                      }
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default ProcurementOrderAssignDriver;