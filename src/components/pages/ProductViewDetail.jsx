import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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
    // Fetch product details when component mounts
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      // In a real application, fetch data from your API
      const response = await fetch(`${baseurl}/api/product/${id}`);
      const data = await response.json();
      
      if (data && data.data) {
        const productData = data.data;
        console.log('Product data received:', productData); // Debug log to see what's coming from API
        
        // Handle season display properly
        let seasonDisplay = productData.season;
        
        // If season is empty or null, use a fallback
        if (!seasonDisplay || seasonDisplay === "") {
          seasonDisplay = productData.is_seasonal === true ? 'Seasonal' : 'All Season';
        }
        
        setProduct({
          id: productData.pid,
          name: productData.product_name,
          description: productData.discription,
          weightKg: productData.unit,
          amount: productData.price,
          season: productData.is_seasonal,
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
    navigate('/product-management');
  };

  const handleEdit = () => {
    navigate(`/edit-product/${id}`);
  };

  const handleDelete = async () => {
    // In a real application, send a DELETE request to your API
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
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00B074' }} />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          color="#00B074"
          href="/dashboard"
          sx={{ fontWeight: 500 }}
        >
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="#00B074"
          href="/product-management"
          sx={{ fontWeight: 500 }}
        >
          Product Management
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 500 }}>
          Product Details
        </Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Typography
        variant="h5"
        component="h1"
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        Product Details
      </Typography>

      {/* Back Button */}
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          mb: 3,
          bgcolor: '#f5f5f5',
          color: '#333',
          '&:hover': { bgcolor: '#e0e0e0' },
          textTransform: 'none',
          fontWeight: 'medium',
          boxShadow: 'none'
        }}
      >
        Back
      </Button>

      {/* Product Details Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          bgcolor: '#fff'
        }}
      >
        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid item xs={12} md={4}>
            <img
              src={`${baseurl}/${product.image}`}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 8,
                maxHeight: '300px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
              }}
            />
          </Grid>

          {/* Product Information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h2" gutterBottom>
              {product.name}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Product ID :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">
                  {product.id}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Weight :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">
                  {product.weightKg} Kg
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Price :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">
                  {product.amount}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Season :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">
                  {product.season}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Stock Status :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Chip
                  label={product.status}
                  sx={{
                    backgroundColor: product.status === 'Available' ? '#4CAF5020' : '#F4433620',
                    color: product.status === 'Available' ? '#4CAF50' : '#F44336',
                    borderRadius: '16px',
                    fontSize: '0.875rem',
                    fontWeight: 'medium'
                  }}
                />
              </Grid>

              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated :
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body1" fontWeight="medium">
                  {product.lastUpdated}
                </Typography>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleEdit}
                sx={{
                  bgcolor: '#00B074',
                  '&:hover': { bgcolor: '#009565' },
                  px: 4
                }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                sx={{
                  borderColor: '#F44336',
                  color: '#F44336',
                  '&:hover': {
                    bgcolor: '#F4433610',
                    borderColor: '#F44336'
                  },
                  px: 4
                }}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Product Description Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Product Description
          </Typography>
          <Typography variant="body1" paragraph>
            {product.description || "No description available."}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ViewProductDetail;