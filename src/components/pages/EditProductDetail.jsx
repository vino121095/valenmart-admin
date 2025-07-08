import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Breadcrumbs,
  Link,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Container,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import baseurl from '../ApiService/ApiService';

// Styled component for file input (matching AddProduct component)
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

const EditProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Category options (matching AddProduct component)
  const categoryOptions = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Grains',
    'Dairy',
    'Organic',
    'Exotic'
  ];

  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    discription: '',
    unit: '',
    price: '',
    is_seasonal: 'false',
    season_type: 'all-season',
    category: '',
    is_active: '',
    season_start: '',
    season_end: '',
    cgst: '',
    sgst: '',
    delivery_fee: '',

  });

  // File upload state
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [originalImage, setOriginalImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch product details when component mounts
    fetchProductDetails();
    fetchCategories();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${baseurl}/api/category/all`);
      const data = await response.json();

      let categoryList = [];

      if (Array.isArray(data)) {
        categoryList = data;
      } else if (data?.data && Array.isArray(data.data)) {
        categoryList = data.data;
      } else if (data?.categories && Array.isArray(data.categories)) {
        categoryList = data.categories;
      }

      setCategories(categoryList);
    } catch (err) {
      setCategoriesError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/product/${id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data && data.data) {
        const productData = data.data;

        // Convert API data to match our form structure
        setFormData({
          product_id: productData.pid || '',
          product_name: productData.product_name || '',
          discription: productData.discription || '',
          unit: productData.weightKg || productData.unit || '',
          price: productData.price || '',
          is_seasonal: productData.is_seasonal && productData.is_seasonal !== 'all-season' ? 'true' : 'false',
          season_type: productData.is_seasonal !== 'all-season' ? productData.is_seasonal : 'all-season',
          category: productData.category || '',
          is_active: productData.is_active ? 'Available' : 'Unvailable',
          season_start: productData.season_start || '',
          season_end: productData.season_end || '',
          cgst: productData.cgst || '',
          sgst: productData.sgst || '',
          delivery_fee: productData.delivery_fee || '',

        });

        // Set image preview if available
        if (productData.product_image) {
          const imagePath = productData.product_image.replace(/\\/g, '/');
          setOriginalImage(imagePath);
          setImagePreview(`${baseurl}/${imagePath}`);
        }
      } else {
        throw new Error('No product data found in response');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError(`Failed to load product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.product_name || !formData.unit || !formData.price) {
      setError('Please fill all required fields');
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

    // Append image file only if a new one was selected
    if (productImage) {
      productFormData.append('product_image', productImage);
    }

    try {
      // Call API to update product
      const response = await fetch(`${baseurl}/api/product/update/${formData.product_id}`, {
        method: 'PUT',
        body: productFormData,
        // No Content-Type header needed, browser sets it with proper boundary for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      const data = await response.json();
      setSuccess(true);

      // Navigate back after successful update
      setTimeout(() => {
        navigate('/products');
      }, 2000);

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset button
  const handleReset = () => {
    fetchProductDetails();
  };

  // Handle cancel button
  const handleCancel = () => {
    navigate('/products');
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    return isoString.split('T')[0]; // Extracts 'YYYY-MM-DD'
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
            Product updated successfully!
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
          <Typography color="textPrimary" sx={{ color: '#00b894', fontWeight: 500 }}>Edit Product</Typography>
        </Breadcrumbs>

        {/* Title and subtitle */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Edit Product
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Update product details, images, pricing and seasonal availability
        </Typography>

        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading state */}
        {loading && !error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Main Form */}
        {!loading && (
          <form onSubmit={handleSubmit}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
              {/* Basic Information Section */}
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
                Basic Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Product ID"
                  variant="outlined"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  disabled // Product ID should not be editable
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

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                <FormControl fullWidth required>
                  <InputLabel id="category-label">Select Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    label="Select Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <MenuItem
                        key={category.id || category.name || category.category_name}
                        value={category.name || category.category_name}
                      >
                        {category.name || category.category_name}
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

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                {/* Toggle for Is Seasonal */}
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
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
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  <TextField
                    label="Season Start Date"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                    name="season_start"
                    value={formatDateForInput(formData.season_start)}
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
                    value={formatDateForInput(formData.season_end)}
                    onChange={handleInputChange}
                  />

                </Box>
              )}

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                <TextField
                  label="CGST (%)"
                  variant="outlined"
                  fullWidth
                  name="cgst"
                  value={formData.cgst}
                  onChange={handleInputChange}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*(\\.[0-9]+)?' }}
                />
                <TextField
                  label="SGST (%)"
                  variant="outlined"
                  fullWidth
                  name="sgst"
                  value={formData.sgst}
                  onChange={handleInputChange}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*(\\.[0-9]+)?' }}
                />
                <TextField
                  label="Delivery Fee (₹)"
                  variant="outlined"
                  fullWidth
                  name="delivery_fee"
                  value={formData.delivery_fee}
                  onChange={handleInputChange}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*(\\.[0-9]+)?' }}
                />
              </Box>


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
                disabled={loading}
                sx={{
                  bgcolor: '#00b894',
                  '&:hover': { bgcolor: '#00a382' },
                  px: 4
                }}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
                sx={{
                  borderColor: '#00b894',
                  color: '#00b894',
                  '&:hover': { borderColor: '#00a382', bgcolor: 'rgba(0, 184, 148, 0.1)' },
                  px: 4
                }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  borderColor: '#aaa',
                  color: '#aaa',
                  '&:hover': { borderColor: '#999', bgcolor: 'rgba(170, 170, 170, 0.1)' },
                  px: 4
                }}
              >
                Cancel
              </Button>
            </Box>
          </form>
        )}
      </Container>
    </Box>
  );
}

export default EditProductDetail;
