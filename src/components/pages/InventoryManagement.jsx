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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
  borderRadius: '6px',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff'
}));

const GreenChip = styled(Chip)(() => ({
  backgroundColor: '#e6f7f0',
  color: '#00b574',
  fontWeight: 'bold',
  borderRadius: '50px',
  fontSize: '0.7rem',
}));

const GrayChip = styled(Chip)(() => ({
  backgroundColor: '#f0f0f0',
  color: '#666666',
  fontWeight: 'medium',
  borderRadius: '50px',
  fontSize: '0.7rem',
}));

const ActionButton = styled(Button)(() => ({
  backgroundColor: '#00b574',
  color: 'white',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '0.75rem',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#009e64',
  },
}));

const StatsNumber = styled(Typography)(() => ({
  fontSize: '1.6rem',
  fontWeight: 'bold',
  marginBottom: '0.3rem',
  marginTop: '0.3rem'
}));

const CircleBase = styled(Box)(() => ({
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  fontWeight: 'bold'
}));

const RedCircle = styled(CircleBase)(() => ({
  backgroundColor: '#ffeeee',
  color: '#ff3333'
}));

const GreenCircle = styled(CircleBase)(() => ({
  backgroundColor: '#e6f7f0',
  color: '#00b574'
}));

const GrayCircle = styled(CircleBase)(() => ({
  backgroundColor: '#f0f0f0',
  color: '#666'
}));

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderDirection, setOrderDirection] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseurl}/api/product/all`);
        const data = await res.json();
        setProducts(data.data || []);
      } catch {
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

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sortedProducts = [...products].sort((a, b) => {
      let aValue, bValue;

      switch (column) {
        case 'name':
          aValue = a.product_name;
          bValue = b.product_name;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'unit':
          aValue = parseInt(a.unit);
          bValue = parseInt(b.unit);
          break;
        case 'price':
          const priceA = typeof a.price === 'string' ? a.price : String(a.price || '0');
          const priceB = typeof b.price === 'string' ? b.price : String(b.price || '0');
          aValue = parseFloat(priceA.replace(/[^0-9.]/g, ''));
          bValue = parseFloat(priceB.replace(/[^0-9.]/g, ''));
          break;
        case 'status':
          aValue = a.is_active;
          bValue = b.is_active;
          break;
        default:
          aValue = a[column];
          bValue = b[column];
      }

      if (isNaN(aValue) || isNaN(bValue)) {
        if (isAsc) {
          return String(aValue).localeCompare(String(bValue));
        } else {
          return String(bValue).localeCompare(String(aValue));
        }
      }

      return isAsc ? aValue - bValue : bValue - aValue;
    });

    setProducts(sortedProducts);
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  const tableHeaders = [
    { id: 'image', label: 'Image', sortable: false },
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'unit', label: 'Unit', sortable: true },
    { id: 'price', label: 'Price (₹)', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00b574' }} />} sx={{ mb: 1 }}>
        <Link color="#00b574" underline="hover" href="#" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Dashboard</Link>
        <Typography color="#07100dff" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Inventory</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Inventory Overview</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#333' }}>Total Products</Typography>
                <StatsNumber>{totalProducts}</StatsNumber>
                <Typography variant="caption" color="text.secondary">{availableProducts} Available</Typography>
              </Box>
              <GreenCircle>{availableProducts}</GreenCircle>
            </Box>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#333' }}>Available Products</Typography>
                <StatsNumber>{availableProducts}</StatsNumber>
                <Typography variant="caption" color="text.secondary">{totalProducts} Total</Typography>
              </Box>
              <GrayCircle>
                {((availableProducts / (totalProducts || 1)) * 100).toFixed(0)}%
              </GrayCircle>
            </Box>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#333' }}>Low Stock Alerts</Typography>
                <StatsNumber sx={{ color: '#ff3333' }}>{lowStockProductsCount} Items</StatsNumber>
              </Box>
              <RedCircle>
                <ErrorOutlineIcon fontSize="small" />
              </RedCircle>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Product Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Product Inventory</Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 120 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TableContainer sx={{ minWidth: 700 }} aria-label="customer table">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ height: 60 }}>
                  {tableHeaders.map(header => (
                    <TableCell
                      key={header.id}
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
                      onClick={() => header.sortable && handleSort(header.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {header.label}
                        {header.sortable && (
                          <Box sx={{ ml: 0.5 }}>{getSortIcon(header.id)}</Box>
                        )}
                      </Box>
                    </TableCell>
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
                        backgroundColor: isLowStock ? '#fd6e6e' : 'inherit',
                        '&:nth-of-type(odd)': { backgroundColor: isLowStock ? '#fd6e6e' : '#f9f9f9' },
                        height: 80
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <img
                          src={`${baseurl}/${product.product_image.replace(/\\/g, '/')}`}
                          alt={product.product_name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.product_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.category}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.unit}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.price}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {product.is_active === 'Available' ? (
                          <GreenChip label="Available" size="small" />
                        ) : (
                          <GrayChip label="Unavailable" size="small" />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
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
