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
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Inline editing state
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingUnit, setEditingUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculate paginated data
  const paginatedProducts = products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (column) => {
    // Cancel any editing when sorting
    cancelEditing();
    
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

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    // Cancel any editing when changing page
    cancelEditing();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    // Cancel any editing when changing rows per page
    cancelEditing();
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Inline edit handlers
  const startEditing = (productId, currentUnit) => {
    setEditingProductId(productId);
    setEditingUnit(currentUnit);
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditingUnit('');
  };

  const handleUnitChange = (e) => {
    // Only allow numbers
    const value = e.target.value;
    if (/^\d*$/.test(value) || value === '') {
      setEditingUnit(value);
    }
  };

  const saveUnit = async (productId) => {
    // Validate unit
    if (!editingUnit || isNaN(parseInt(editingUnit))) {
      alert('Please enter a valid unit value');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update product unit
      const response = await fetch(`${baseurl}/api/product/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit: editingUnit, // Send raw number to API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product unit');
      }

      // Update both data states with new unit
      const updateProduct = (products) => {
        return products.map(product => {
          if (product.pid === productId) {
            return {
              ...product,
              unit: editingUnit,
            };
          }
          return product;
        });
      };

      setProducts(updateProduct(products));

      // Show success feedback
      alert('Product unit updated successfully!');
    } catch (error) {
      console.error('Error updating product unit:', error);
      alert('Failed to update product unit. Please try again.');
    } finally {
      setIsSubmitting(false);
      cancelEditing();
    }
  };

  const handleViewProduct = (id) => {
    cancelEditing();
    window.location.href = `/view-product/${id}`;
  };

  const tableHeaders = [
    { id: 'index', label: 'Product ID', sortable: false },
    { id: 'image', label: 'Image', sortable: false },
    { id: 'name', label: 'Product Name', sortable: true },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'unit', label: 'Weight (units)', sortable: true },
    { id: 'price', label: 'Amount per kg (₹)', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  // Render Unit Cell with Edit Functionality
  const renderUnitCell = (product) => {
    const isEditing = editingProductId === product.pid;

    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            value={editingUnit}
            onChange={handleUnitChange}
            InputProps={{
              sx: { width: '80px' }
            }}
            autoFocus
            disabled={isSubmitting}
          />
          <Box sx={{ ml: 1 }}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => saveUnit(product.pid)}
              disabled={isSubmitting}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={cancelEditing}
              disabled={isSubmitting}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: '4px',
            padding: '2px 4px'
          }
        }}
        onClick={() => startEditing(product.pid, product.unit)}
      >
        <Tooltip title="Click to edit unit">
          <Box>
            {product.unit}
            <EditIcon
              fontSize="small"
              sx={{
                ml: 0.5,
                color: 'action.active',
                fontSize: '14px',
                opacity: 0.5
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00b574' }} />} sx={{ mb: 1 }}>
        <Link color="#00b574" underline="hover" href="#" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Dashboard</Link>
        <Typography color="#07100dff" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Inventory</Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Inventory Management</Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#333' }}>Total Products</Typography>
                <StatsNumber>{totalProducts}</StatsNumber>
              </Box>
            </Box>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#333' }}>Available Products</Typography>
                <StatsNumber>{availableProducts}</StatsNumber>
              </Box>
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
              <RedCircle sx={{marginLeft: "10px"}}>
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
                {paginatedProducts.map((product, index) => {
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
                      <TableCell sx={{ py: 2, fontSize: '0.8rem' }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <img
                          src={`${baseurl}/${product.product_image.replace(/\\/g, '/')}`}
                          alt={product.product_name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.product_name}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>{product.category}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem'}}>
                        {renderUnitCell(product)}
                      </TableCell>
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
                          onClick={() => handleViewProduct(product.pid)}
                          disabled={editingProductId === product.pid}
                        >
                          View
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No products found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
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
      </Paper>
    </Box>
  );
}