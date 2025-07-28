import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Breadcrumbs,
  Link,
  Card,
  IconButton,
  CircularProgress,
  Divider,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const EditButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00AB6B",
  color: "white",
  "&:hover": {
    backgroundColor: "#008F59",
  },
  marginTop: theme.spacing(2),
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  color: "#00AB6B",
  marginBottom: theme.spacing(2),
}));

const DetailCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
}));

const LabelTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  fontSize: "0.875rem",
}));

const ValueTypography = styled(Typography)({
  fontWeight: 400,
  marginTop: 4,
});

const ImageContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  height: 250,
  backgroundColor: "#f5f5f5",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  marginTop: theme.spacing(1),
}));

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
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/product-category">Product Category</Link>
        <Typography color="text.primary">View Category</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: "bold",
          }}
        >
          Category Details
        </Typography>

        <EditButton 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => navigate(`/edit-category/${category.cid}`)}
        >
          Edit Category
        </EditButton>
      </Box>

      <DetailCard elevation={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: "#00AB6B", fontWeight: 600, mb: 1 }}
              >
                Category ID: {category.cid}
              </Typography>
              <Divider />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <LabelTypography>Category Name</LabelTypography>
            <ValueTypography variant="body1">{category.category_name}</ValueTypography>
          </Grid>

          {category.category_description && (
            <Grid item xs={12} md={6}>
              <LabelTypography>Description</LabelTypography>
              <ValueTypography variant="body1">{category.category_description}</ValueTypography>
            </Grid>
          )}

          <Grid item xs={12}>
            <LabelTypography>Category Image</LabelTypography>
            <ImageContainer>
              {category.category_image ? (
                <img
                  src={category.category_image.startsWith('http') 
                    ? category.category_image 
                    : `${baseurl}/${category.category_image}`}
                  alt={category.category_name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No image available
                </Typography>
              )}
            </ImageContainer>
          </Grid>

          {category.createdAt && (
            <Grid item xs={12} md={6}>
              <LabelTypography>Created At</LabelTypography>
              <ValueTypography variant="body2">
                {new Date(category.createdAt).toLocaleString()}
              </ValueTypography>
            </Grid>
          )}

          {category.updatedAt && (
            <Grid item xs={12} md={6}>
              <LabelTypography>Last Updated</LabelTypography>
              <ValueTypography variant="body2">
                {new Date(category.updatedAt).toLocaleString()}
              </ValueTypography>
            </Grid>
          )}
        </Grid>
      </DetailCard>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/product-category")}
          sx={{
            color: "#555",
            borderColor: "#ccc",
            "&:hover": {
              borderColor: "#00AB6B",
              backgroundColor: "#f5f5f5",
            }
          }}
        >
          Back to Categories
        </Button>
      </Box>

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
