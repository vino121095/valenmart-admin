import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import baseurl from '../ApiService/ApiService';

const ViewProductDetail = () => {
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    weightKg: '',
    amount: '',
    season: '',
    status: '',
    image: '',
    lastUpdated: ''
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(`${baseurl}/api/product/${id}`);
      const data = await response.json();

      if (data && data.data) {
        const productData = data.data;

        // Handle season display properly
        let seasonDisplay = productData.season;
        if (!seasonDisplay || seasonDisplay === "") {
          seasonDisplay = productData.is_seasonal === true ? 'Seasonal' : 'All Season';
        }

        setProduct({
          id: productData.pid,
          name: productData.product_name,
          description: productData.discription,
          weightKg: productData.unit,
          amount: productData.price,
          season: seasonDisplay,
          status: productData.is_active ? 'Available' : 'Unavailable',
          image: productData.product_image.replace(/\\/g, '/'),
          lastUpdated: new Date(productData.updatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleBack = () => {
    navigate('/products');
  };

  const handleEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`${baseurl}/api/product/${id}`, {
          method: 'DELETE',
        });
        navigate('/product-management');
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>


          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00B074' }} />}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="#00B074"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              underline="hover"
              color="#00B074"
              href="/products"
            >
              Product Management
            </Link>
            <Typography color="#666666">
              Product Details
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>
      <Typography variant="h5" fontWeight="bold" color="#333333">
        Product Details
      </Typography><br /> 

      {/* Main Content */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column - Product Image */}
            <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={`${baseurl}/${product.image}`}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x250?text=Product+Image';
                  }}
                />
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  <Chip
                    label={product.status}
                    size="small"
                    sx={{
                      backgroundColor: product.status === 'Available' ? '#e8f5e9' : '#ffebee',
                      color: product.status === 'Available' ? '#2e7d32' : '#c62828',
                      fontWeight: 'normal'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Product Details */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Product Information
                </Typography>

                <Box>
                  <Tooltip title="Edit Product">
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        mr: 1,
                        bgcolor: '#00B074',
                        color: 'white',
                        '&:hover': { bgcolor: '#009565' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Product">
                    <IconButton
                      onClick={handleDelete}
                      sx={{
                        bgcolor: '#F44336',
                        color: 'white',
                        '&:hover': { bgcolor: '#d32f2f' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Product Details - 3 Column Layout */}
              <Grid container spacing={3}>
                {/* First Row */}
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Product ID
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {product.id}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Weight
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {product.weightKg} Kg
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Price
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0, color: '#00B074' }}>
                      {product.amount}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Second Row */}
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Season
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {product.season}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Stock Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      <Chip
                        label={product.status}
                        size="small"
                        sx={{
                          backgroundColor: product.status === 'Available' ? '#e8f5e9' : '#ffebee',
                          color: product.status === 'Available' ? '#2e7d32' : '#c62828',
                          fontWeight: 'normal'
                        }}
                      />
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Last Updated
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {product.lastUpdated}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Product Description */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Product Description
                </Typography>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2">
                    {product.description || "No description available."}
                  </Typography>
                </Paper>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: '#00B074',
                    color: '#00B074',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      borderColor: '#00B074'
                    },
                    px: 3,
                    py: 1,
                    fontWeight: 'normal'
                  }}
                >
                  Back to Products
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEdit}
                  sx={{
                    bgcolor: '#00B074',
                    '&:hover': { bgcolor: '#009565' },
                    px: 3,
                    py: 1,
                    fontWeight: 'normal'
                  }}
                >
                  Edit Product
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewProductDetail;