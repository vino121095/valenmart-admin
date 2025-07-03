import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const ShipmentTrackingDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link 
          color="primary" 
          href="#" 
          underline="hover"
          sx={{ color: '#00c853', fontWeight: 500 }}
        >
          Dashboard
        </Link>
        <Link 
          color="primary" 
          href="#" 
          underline="hover"
          sx={{ color: '#00c853', fontWeight: 500 }}
        >
          Inventory Management
        </Link>
        <Link 
          color="primary" 
          href="#" 
          underline="hover"
          sx={{ color: '#00c853', fontWeight: 500 }}
        >
          Shipment Tracking
        </Link>
      </Breadcrumbs>

      {/* Page Title */}
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 3 }}>
        Shipment Tracking - Green Farms Co.
      </Typography>

      {/* Shipment Summary */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
          Shipment Summary
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mr: 1 }}>
                Order ID :
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                GF-2025-0542
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mr: 1 }}>
                Status :
              </Typography>
              <Chip 
                label="Enroute" 
                size="small" 
                sx={{ 
                  bgcolor: '#e8f5e9', 
                  color: '#2e7d32',
                  fontWeight: 500,
                  borderRadius: 1
                }} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mr: 1 }}>
                ETA :
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                Today, May 5, 2025
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tracking Timeline */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
          Tracking Timeline
        </Typography>

        <Box>
          {[
            {
              status: "Order Confirmed",
              date: "May 4, 2025 - 09:15 AM",
              description: "85 Kgs of fresh produce ordered from Green Farms Co.",
              color: "#4caf50",
              bgColor: "#e8f5e9",
              isBlue: false
            },
            {
              status: "Order Confirmed",
              date: "May 4, 2025 - 09:15 AM",
              description: "85 Kgs of fresh produce ordered from Green Farms Co.",
              color: "#4caf50",
              bgColor: "#e8f5e9",
              isBlue: false
            },
            {
              status: "Order Confirmed",
              date: "May 4, 2025 - 09:15 AM",
              description: "85 Kgs of fresh produce ordered from Green Farms Co.",
              color: "#2196f3",
              bgColor: "#e3f2fd",
              isBlue: true
            }
          ].map((item, index, array) => (
            <Box key={index} sx={{ display: 'flex', mb: index < array.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                />
                {index < array.length - 1 && (
                  <Box
                    sx={{
                      width: 2,
                      flexGrow: 1,
                      bgcolor: '#e0e0e0',
                      my: 0.5
                    }}
                  />
                )}
              </Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: item.bgColor,
                  borderRadius: 1,
                  width: '100%',
                  mb: 1
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.date}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.description}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Live Tracking and Shipment Details */}
      <Grid container spacing={3}>
        {/* Live Tracking Map */}
        <Grid item xs={12} md={7}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
              Live Tracking
            </Typography>
            <Box
              component="img"
              src="/api/placeholder/600/400"
              alt="Tracking Map"
              sx={{
                width: '100%',
                height: 350,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Paper>
        </Grid>

        {/* Shipment Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%', width: '120%'}}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ mb: 3 }}>
              Shipment Details
            </Typography>
            
            <TableContainer component={Box}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', pl: 0, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Items</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', pr: 0, borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'Tomatoes', quantity: '25 kg' },
                    { name: 'Cucumbers', quantity: '15 kg' },
                    { name: 'Bell Peppers', quantity: '20 kg' },
                  ].map((row) => (
                    <TableRow key={row.name}>
                      <TableCell sx={{ pl: 0, py: 2 }}>{row.name}</TableCell>
                      <TableCell align="right" sx={{ pr: 0, py: 2 }}>{row.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ pl: 0, pt: 3, fontWeight: 'bold', fontSize: '1rem', borderBottom: 'none' }}>Total Weight :</TableCell>
                    <TableCell align="right" sx={{ pr: 0, pt: 3, fontWeight: 'bold', fontSize: '1rem', borderBottom: 'none' }}>85 Kg</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Button 
                variant="contained" 
                fullWidth
                sx={{ 
                  bgcolor: '#00c853', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#009624',
                  },
                  py: 1.5
                }}
              >
                Contact Driver
              </Button>
              <Button 
                variant="outlined" 
                fullWidth
                sx={{ 
                  color: '#00c853', 
                  borderColor: '#00c853',
                  '&:hover': {
                    borderColor: '#009624',
                    bgcolor: 'rgba(0, 200, 83, 0.04)',
                  },
                  py: 1.5
                }}
              >
                View Invoice
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShipmentTrackingDashboard;