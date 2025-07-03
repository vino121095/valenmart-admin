import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Container,
  Breadcrumbs,
  Link,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

// Styled component for file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AddProduct = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    discription: '',
    unit: '',
    price: '',
    is_seasonal: 'false', // Default to non-seasonal
    season_type: 'all-season', // Default season type
    category: '', // Default category
    is_active: '', // Default to active
    season_start: '',
    season_end: '',
  });
  
  // Category state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  
  // File upload state
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');
      
      const response = await fetch(`${baseurl}/api/category/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug: Log the actual response to understand its structure
      console.log('Categories API Response:', data);
      console.log('Response type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      // Handle different possible response structures
      let categoryList = [];
      
      // Case 1: Direct array response
      if (Array.isArray(data)) {
        categoryList = data;
      }
      // Case 2: Object with success and data property
      else if (data && data.success && data.data) {
        categoryList = Array.isArray(data.data) ? data.data : [];
      }
      // Case 3: Object with categories property
      else if (data && data.categories) {
        categoryList = Array.isArray(data.categories) ? data.categories : [];
      }
      // Case 4: Object with results property
      else if (data && data.results) {
        categoryList = Array.isArray(data.results) ? data.results : [];
      }
      // Case 5: Direct object properties (check if it has category-like properties)
      else if (data && typeof data === 'object') {
        // Try to find array property in the response
        const possibleArrays = Object.values(data).filter(value => Array.isArray(value));
        if (possibleArrays.length > 0) {
          categoryList = possibleArrays[0];
        } else {
          // If no arrays found, check if data itself has category properties
          const keys = Object.keys(data);
          console.log('Available keys in response:', keys);
          
          // If it's a single category object, wrap it in an array
          if (data.id || data.name || data.category_name) {
            categoryList = [data];
          } else {
            throw new Error(`Invalid response format. Available keys: ${keys.join(', ')}`);
          }
        }
      }
      else {
        throw new Error('Invalid response format - no recognizable structure');
      }
      
      // Validate that we have a proper array
      if (!Array.isArray(categoryList)) {
        throw new Error('Category data is not an array');
      }
      
      // Log the final category list for debugging
      console.log('Processed categories:', categoryList);
      
      setCategories(categoryList);
      
      // Clear any previous errors if successful
      if (categoryList.length > 0) {
        setCategoriesError('');
      }
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategoriesError(err.message || 'Failed to load categories');
      
      // Clear categories on error
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For all other fields, just update normally
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Special handling for is_seasonal toggle
    if (name === 'is_seasonal') {
      // If switching to 'false', reset the season dates
      if (value === 'false') {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          season_start: '',
          season_end: ''
        }));
      }
    }
  };

  // Handle toggle change for is_seasonal
  const handleSeasonalToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      is_seasonal: isChecked ? 'true' : 'false',
      // If toggling to non-seasonal, reset the season dates
      ...(isChecked ? {} : { season_start: '', season_end: '' })
    }));
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.product_name || !formData.unit || !formData.price || !formData.category) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!productImage) {
      setError('Please upload a product image');
      return;
    }
    
    // If product is seasonal, check if season dates are provided
    if (formData.is_seasonal === 'true' && (!formData.season_start || !formData.season_end)) {
      setError('Please provide season start and end dates');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Create form data object for API submission
    const productFormData = new FormData();
    
    // Prepare data to send to the API
    const dataToSend = {
      ...formData
    };
    
    // When seasonal, use the selected season type
    if (formData.is_seasonal === 'true') {
      dataToSend.is_seasonal = formData.season_type;
    } else {
      dataToSend.is_seasonal = 'all-season';
    }
    
    // Append all form data fields
    Object.keys(dataToSend).forEach(key => {
      // Skip season_type as it's handled above
      if (key !== 'season_type') {
        productFormData.append(key, dataToSend[key]);
      }
    });
    
    // Append image file
    productFormData.append('product_image', productImage);
    
    try {
      // Call API to create product
      const response = await fetch(`${baseurl}/api/product/create`, {
        method: 'POST',
        body: productFormData,
        // No Content-Type header needed, browser sets it with proper boundary for FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
      
      const data = await response.json();
      setSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate('/products');
      }, 2000);
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel button
  const handleCancel = () => {
    navigate('/product-management');
  };

  // Retry fetching categories
  const retryFetchCategories = () => {
    fetchCategories();
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f7', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Success message */}
        <Snackbar 
          open={success} 
          autoHideDuration={3000} 
          onClose={() => setSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" variant="filled">
            Product created successfully!
          </Alert>
        </Snackbar>
        
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link 
            color="primary" 
            underline="hover" 
            href="/"
            sx={{ color: '#00b894', fontWeight: 500 }}
          >
            Dashboard
          </Link>
          <Link 
            color="primary" 
            underline="hover" 
            href="/product-management"
            sx={{ color: '#00b894', fontWeight: 500 }}
          >
            Product Management
          </Link>
          <Typography color="textPrimary" sx={{ color: '#00b894', fontWeight: 500 }}>Add Product</Typography>
        </Breadcrumbs>
        
        {/* Title and subtitle */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Create New Product
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Add Vegetable details, images, pricing and Seasonal availability
        </Typography>
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Categories API Error */}
        {categoriesError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={retryFetchCategories}
                disabled={categoriesLoading}
              >
                {categoriesLoading ? <CircularProgress size={16} /> : 'Retry'}
              </Button>
            }
          >
            {categoriesError}. Please fix the API or retry.
          </Alert>
        )}
        
        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
            {/* Basic Information Section */}
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Basic Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Product ID (Optional)"
                variant="outlined"
                name="product_id"
                value={formData.product_id}
                onChange={handleInputChange}
                helperText="Leave blank for auto-generated ID"
              />
              <TextField
                fullWidth
                label="Product Name"
                variant="outlined"
                required
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">
                  {categoriesLoading ? 'Loading Categories...' : 'Select Category'}
                </InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  label={categoriesLoading ? 'Loading Categories...' : 'Select Category'}
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={categoriesLoading}
                  endIcon={categoriesLoading ? <CircularProgress size={20} /> : undefined}
                >
                  {categories.map((category) => (
                    <MenuItem 
                      key={category.id || category.name} 
                      value={category.name || category.category_name || category}
                    >
                      {category.name || category.category_name || category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth required>
                <InputLabel id="status-label">Product Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="is_active"
                  label="Product Status"
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                >
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              multiline
              rows={4}
              sx={{ mb: 3 }}
              name="discription"
              value={formData.discription}
              onChange={handleInputChange}
            />
            
            {/* Pricing & Availability Section */}
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Pricing & Availability
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 3 }}>
              {/* New Toggle for Is Seasonal */}
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_seasonal === 'true'}
                      onChange={handleSeasonalToggle}
                      color="primary"
                    />
                  }
                  label="Is Seasonal Product"
                  sx={{ mb: 1 }}
                />
              </FormControl>
              
              <TextField
                label="Weight in Kg"
                variant="outlined"
                required
                fullWidth
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*(\.[0-9]+)?' }}
              />
              <TextField
                label="Price (₹)"
                variant="outlined"
                required
                fullWidth
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*(\.[0-9]+)?' }}
              />
            </Box>
            
            {/* Show season selector only if product is seasonal */}
            {formData.is_seasonal === 'true' && (
              <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel id="season-type-label">Season Type</InputLabel>
                  <Select
                    labelId="season-type-label"
                    id="season_type"
                    label="Season Type"
                    name="season_type"
                    value={formData.season_type}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="summer">Summer</MenuItem>
                    <MenuItem value="winter">Winter</MenuItem>
                    <MenuItem value="spring">Spring</MenuItem>
                    <MenuItem value="autumn">Autumn</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
            
            {/* Seasonal dates - only shown when seasonal is toggled on */}
            {formData.is_seasonal === 'true' && (
              <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 3 }}>
                <TextField
                  label="Season Start Date"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="season_start"
                  value={formData.season_start}
                  onChange={handleInputChange}
                />
                <TextField
                  label="Season End Date"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="season_end"
                  value={formData.season_end}
                  onChange={handleInputChange}
                />
              </Box>
            )}
            
            {/* Product Image Section */}
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
              Product Image
            </Typography>
            
            <Box 
              sx={{ 
                border: '2px dashed #ddd', 
                borderRadius: 1, 
                p: 8, 
                textAlign: 'center',
                mb: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                bgcolor: '#f9f9f9',
                backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '200px'
              }}
            >
              {!imagePreview && (
                <Stack direction="column" alignItems="center" spacing={1}>
                  <CloudUploadIcon sx={{ color: '#aaa', fontSize: 40 }} />
                  <Typography color="textSecondary">
                    Drag & Drop Image here or Click to Browse
                  </Typography>
                  <Button
                    component="label"
                    variant="contained"
                    sx={{ 
                      bgcolor: '#00b894', 
                      '&:hover': { bgcolor: '#00a382' },
                      mt: 2
                    }}
                  >
                    Upload Image
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Stack>
              )}
              
              {imagePreview && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 16, 
                    right: 16,
                    bgcolor: 'rgba(255,255,255,0.8)',
                    p: 1,
                    borderRadius: 1
                  }}
                >
                  <Button
                    component="label"
                    variant="contained"
                    size="small"
                    sx={{ 
                      bgcolor: '#00b894', 
                      '&:hover': { bgcolor: '#00a382' }
                    }}
                  >
                    Change Image
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              type="submit"
              variant="contained" 
              disabled={loading || categoriesLoading}
              sx={{ 
                bgcolor: '#00b894', 
                '&:hover': { bgcolor: '#00a382' },
                px: 4
              }}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button 
              variant="contained" 
              onClick={handleCancel}
              disabled={loading}
              sx={{ 
                bgcolor: '#aaa', 
                '&:hover': { bgcolor: '#999' },
                px: 4
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Container>
    </Box>
  );
}

export default AddProduct;