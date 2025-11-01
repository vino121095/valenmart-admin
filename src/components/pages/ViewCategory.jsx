import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

const ViewCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch category data
  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/category/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCategory(data.data);
    } catch (error) {
      console.error("Error fetching category:", error);
      setSnackbar({
        open: true,
        message: "Failed to load category details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBack = () => {
    navigate("/product-category");
  };

  const handleEdit = () => {
    navigate(`/edit-category/${category.cid}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`${baseurl}/api/category/${category.cid}`, {
          method: 'DELETE',
        });
        navigate("/product-category");
      } catch (error) {
        console.error('Error deleting category:', error);
        setSnackbar({
          open: true,
          message: "Failed to delete category",
          severity: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#00AB6B' }} />
      </Box>
    );
  }

  if (!category) {
    return (
      <Box sx={{ padding: 3, maxWidth: "100%" }}>
        <Typography variant="h6" color="error">
          Category not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/product-category")}
          sx={{ mt: 2 }}
        >
          Back to Categories
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00AB6B' }} />}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="#00AB6B"
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              underline="hover"
              color="#00AB6B"
              href="/product-category"
            >
              Product Category
            </Link>
            <Typography color="#666666">
              View Category
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>
      <Typography variant="h5" fontWeight="bold" color="#333333">
        Category Details
      </Typography><br />

      {/* Main Content */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column - Category Image */}
            <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={category.category_image && category.category_image.startsWith('http')
                    ? category.category_image
                    : `${baseurl}/${category.category_image}`}
                  alt={category.category_name}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Category+Image';
                  }}
                />
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {category.category_name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Category Details */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Category Information
                </Typography>

                <Box>
                  <Tooltip title="Edit Category">
                    <IconButton
                      onClick={handleEdit}
                      sx={{
                        mr: 1,
                        bgcolor: '#00AB6B',
                        color: 'white',
                        '&:hover': { bgcolor: '#008F59' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete Category">
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

              {/* Category Details - 2 Column Layout */}
              <Grid container spacing={3}>
                {/* First Row */}
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Category ID
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {category.cid}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Category Name
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {category.category_name}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Created At
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {category.createdAt ? new Date(category.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Third Row */}
                {category.updatedAt && (
                  <Grid item xs={12} sm={6}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold" color="#000000">
                          Last Updated
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ ml: 0 }}>
                        {new Date(category.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {/* Category Description */}
              {category.category_description && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Category Description
                  </Typography>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                    <Typography variant="body2">
                      {category.category_description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  sx={{
                    borderColor: '#00AB6B',
                    color: '#00AB6B',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      borderColor: '#00AB6B'
                    },
                    px: 3,
                    py: 1,
                    fontWeight: 'normal'
                  }}
                >
                  Back to Categories
                </Button>
                <Button
                  variant="contained"
                  onClick={handleEdit}
                  sx={{
                    bgcolor: '#00AB6B',
                    '&:hover': { bgcolor: '#008F59' },
                    px: 3,
                    py: 1,
                    fontWeight: 'normal'
                  }}
                >
                  Edit Category
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewCategory;