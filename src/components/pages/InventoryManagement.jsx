import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Breadcrumbs,
  Link,
  Card,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import baseurl from '../ApiService/ApiService';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  borderRadius: '8px',
  padding: theme.spacing(3),
  backgroundColor: '#ffffff'
}));

const GreenChip = styled(Chip)(() => ({
  backgroundColor: '#e6f7f0',
  color: '#00b574',
  fontWeight: 'bold',
  borderRadius: '50px',
  padding: '0 4px'
}));

const GrayChip = styled(Chip)(() => ({
  backgroundColor: '#f0f0f0',
  color: '#666666',
  fontWeight: 'medium',
  borderRadius: '50px'
}));

const ActionButton = styled(Button)(() => ({
  backgroundColor: '#00b574',
  color: 'white',
  borderRadius: '4px',
  padding: '6px 16px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#009e64',
  },
}));

const StatsNumber = styled(Typography)(() => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: '0.5rem',
  marginTop: '0.5rem'
}));

const RedCircle = styled(Box)(() => ({
  backgroundColor: '#ffeeee',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const GreenCircle = styled(Box)(() => ({
  backgroundColor: '#e6f7f0',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const GrayCircle = styled(Box)(() => ({
  backgroundColor: '#f0f0f0',
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseurl}/api/product/all`);
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.is_active === 'Available').length;
  const lowStockProductsList = products.filter(p => parseInt(p.unit) <= 10).map(p => ({
    product_name: p.product_name,
    current: `${p.unit} unit`,
    threshold: 'Restock soon'
  }));
  const lowStockProductsCount = lowStockProductsList.length;

  return (
    <Box sx={{ bgcolor: '#f5f5f7', minHeight: '100vh', p: 3, width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00b574' }} />} sx={{ mb: 2 }}>
        <Link color="#00b574" underline="hover" href="#" sx={{ fontWeight: 'medium' }}>Dashboard</Link>
        <Typography color="#00b574" sx={{ fontWeight: 'medium' }}>Inventory Management</Typography>
      </Breadcrumbs>

      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Inventory Management</Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Products */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#333' }}>Total Products</Typography>
                <StatsNumber>{totalProducts}</StatsNumber>
                <Typography variant="body1" color="text.secondary">{availableProducts} Available</Typography>
              </Box>
              <GreenCircle>
                <Typography sx={{ color: '#00b574', fontWeight: 'bold' }}>{availableProducts}</Typography>
              </GreenCircle>
            </Box>
          </StyledCard>
        </Grid>

        {/* Available Products */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#333' }}>Available Products</Typography>
                <StatsNumber>{availableProducts}</StatsNumber>
                <Typography variant="body1" color="text.secondary">{totalProducts} Total</Typography>
              </Box>
              <GrayCircle>
                <Typography sx={{ color: '#666', fontWeight: 'bold' }}>
                  {((availableProducts / (totalProducts || 1)) * 100).toFixed(0)}%
                </Typography>
              </GrayCircle>
            </Box>
          </StyledCard>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#333' }}>Low Stock Alerts</Typography>
                <StatsNumber sx={{ color: '#ff3333' }}>{lowStockProductsCount} Items</StatsNumber>
                {/* <Typography variant="body1" color="text.secondary">Action Required</Typography> */}
                {/* {lowStockProductsCount > 0 && (
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                    {lowStockProductsList.map(p => (
                      <li key={p.pid} style={{ fontSize: '0.9rem', color: '#ff3333' }}>
                        {p.product_name}
                      </li>
                    ))}
                  </ul>
                )} */}
              </Box>
              <RedCircle>
                <ErrorOutlineIcon sx={{ color: '#ff3333', fontSize: '1.8rem' }} />
              </RedCircle>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Product Table */}
      <Paper sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Product Inventory</Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Image', 'Product Name', 'Category', 'Unit', 'Price (₹)', 'Status', 'Actions'].map(title => (
                    <TableCell key={title} sx={{ fontWeight: 'bold', color: '#fff', bgcolor: '#00b574' }}>{title}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => {
                  const isLowStock = parseInt(product.unit) <= 10;
                  return (
                    <TableRow
                      key={product.pid}
                      sx={{
                        backgroundColor: isLowStock ? '#ff3333a8' : 'inherit',
                        borderLeft: isLowStock ? '6px solidhsla(0, 100.00%, 60.00%, 0.49)' : 'none'
                      }}
                    >
                      <TableCell>
                        <img
                          src={`${baseurl}/${product.product_image.replace(/\\/g, '/')}`}
                          alt={product.product_name}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                        />
                      </TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        {product.is_active === 'Available' ? (
                          <GreenChip label="Available" size="small" />
                        ) : (
                          <GrayChip label="Unavailable" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <ActionButton
                          size="small"
                          onClick={() => window.location.href = `/view-product/${product.pid}`}
                        >
                          View
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">No products found.</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
