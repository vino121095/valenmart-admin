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

  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    discription: '',
    unit: '',
    price: '',
    is_seasonal: 'false',
    season_type: 'All Season',
    category: '',
    is_active: '',
    season_start: '',
    season_end: '',
    cgst: '',
    sgst: '',
    delivery_fee: '',
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'is_seasonal' && value === 'false') {
      setFormData((prev) => ({
        ...prev,
        season_start: '',
        season_end: ''
      }));
    }
  };

  const handleSeasonalToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      is_seasonal: isChecked ? 'true' : 'false',
      ...(isChecked ? {} : { season_start: '', season_end: '' })
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.product_name ||
      !formData.unit ||
      !formData.price ||
      !formData.category
    ) {
      setError('Please fill all required fields including CGST, SGST and Delivery Fee');
      return;
    }

    if (!productImage) {
      setError('Please upload a product image');
      return;
    }

    if (
      formData.is_seasonal === 'true' &&
      (!formData.season_start || !formData.season_end)
    ) {
      setError('Please provide season start and end dates');
      return;
    }

    setLoading(true);
    setError('');

    const productFormData = new FormData();
    const dataToSend = {
      ...formData,
      is_seasonal: formData.is_seasonal === 'true' ? formData.season_type : 'All Season',
      cgst: formData.cgst ? parseFloat(formData.cgst) : null,
      sgst: formData.sgst ? parseFloat(formData.sgst) : null,
      delivery_fee: formData.delivery_fee ? parseFloat(formData.delivery_fee) : null,
    };

    Object.keys(dataToSend).forEach((key) => {
      if (key !== 'season_type') {
        productFormData.append(key, dataToSend[key]);
      }
    });

    productFormData.append('product_image', productImage);

    try {
      const response = await fetch(`${baseurl}/api/product/create`, {
        method: 'POST',
        body: productFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      await response.json();
      setSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <Box>
        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
          <Alert severity="success" variant="filled">
            Product created successfully!
          </Alert>
        </Snackbar>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" href="/">Dashboard</Link>
          <Link underline="hover" href="/products">Product Management</Link>
          <Typography color="text.primary">Add Product</Typography>
        </Breadcrumbs>

        <Typography variant="h5" fontWeight="bold" gutterBottom>Create New Product</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Basic Information</Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              <TextField fullWidth label="Product ID (Optional)" name="product_id" value={formData.product_id} onChange={handleInputChange} />
              <TextField fullWidth label="Product Name" name="product_name" value={formData.product_name} onChange={handleInputChange} required />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Category</InputLabel>
                <Select label="select category" name="category" value={formData.category} onChange={handleInputChange}>
                  {categories.map((category) => (
                    <MenuItem key={category.id || category.name} value={category.name || category.category_name}>
                      {category.name || category.category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select label="is_active" name="is_active" value={formData.is_active} onChange={handleInputChange}>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField fullWidth multiline rows={3} label="Description" name="discription" value={formData.discription} onChange={handleInputChange} sx={{ mb: 3 }} />

            <Typography variant="h5" fontWeight="bold" gutterBottom>Pricing & Availability</Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              <FormControlLabel
                control={<Switch checked={formData.is_seasonal === 'true'} onChange={handleSeasonalToggle} />}
                label="Is Seasonal Product"
              />
              <TextField fullWidth label="Weight (kg)" name="unit" value={formData.unit} onChange={handleInputChange} required />
              <TextField fullWidth label="Price (₹)" name="price" value={formData.price} onChange={handleInputChange} required />
            </Box>

            {/* Season Type & Dates */}
            {formData.is_seasonal === 'true' && (
              <>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Season Type</InputLabel>
                    <Select label="season_type" name="season_type" value={formData.season_type} onChange={handleInputChange}>
                      <MenuItem value="summer">Summer</MenuItem>
                      <MenuItem value="winter">Winter</MenuItem>
                      <MenuItem value="spring">Spring</MenuItem>
                      <MenuItem value="autumn">Autumn</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                  <TextField type="date" label="Season Start Date" name="season_start" InputLabelProps={{ shrink: true }} value={formData.season_start} onChange={handleInputChange} fullWidth required />
                  <TextField type="date" label="Season End Date" name="season_end" InputLabelProps={{ shrink: true }} value={formData.season_end} onChange={handleInputChange} fullWidth required />
                </Box>
              </>
            )}

            {/* GST & Delivery Fee */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              <TextField label="CGST (%)" name="cgst" value={formData.cgst} onChange={handleInputChange} fullWidth />
              <TextField label="SGST (%)" name="sgst" value={formData.sgst} onChange={handleInputChange} fullWidth />
              <TextField label="Delivery Fee (₹)" name="delivery_fee" value={formData.delivery_fee} onChange={handleInputChange} fullWidth />
            </Box>

            {/* Image Upload */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>Product Image</Typography>
            <Box sx={{ border: '2px dashed #ddd', p: 4, mb: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
              {!imagePreview && (
                <Stack spacing={2} alignItems="center">
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#aaa' }} />
                  <Typography>Drag & Drop or Click to Upload</Typography>
                  <Button component="label" variant="contained">
                    Upload Image
                    <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Stack>
              )}
              {imagePreview && <img src={imagePreview} alt="Preview" width="200" style={{ marginTop: 8 }} />}
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#00b894' }}>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          </Box>
        </form>
    </Box>
  );
};

export default AddProduct;

