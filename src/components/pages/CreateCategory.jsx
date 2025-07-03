import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Breadcrumbs,
  Link,
  FormControl,
  FormHelperText,
  Card,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useNavigate } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00AB6B",
  color: "white",
  "&:hover": {
    backgroundColor: "#008F59",
  },
  marginTop: theme.spacing(2),
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: "#555",
  borderColor: "#ccc",
  marginTop: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  border: "1px dashed #ccc",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#f8f8f8",
  borderRadius: theme.shape.borderRadius,
  width: "100%",
  "&:hover": {
    backgroundColor: "#f0f0f0",
    borderColor: "#00AB6B",
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  position: "relative",
  width: "100%",
  height: 200,
  backgroundColor: "#f0f0f0",
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}));

const BackButton = styled(IconButton)(({ theme }) => ({
  color: "#00AB6B",
  marginBottom: theme.spacing(2),
}));

const CreateCategory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_name: "",
    category_description: "",
  });
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category_name.trim()) {
      newErrors.category_name = "Category name is required";
    }
    if (!imageFile) {
      newErrors.category_image = "Category image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        
        // Create FormData object to send to the API
        const formDataToSend = new FormData();
        formDataToSend.append("category_name", formData.category_name);
        
        if (formData.category_description) {
          formDataToSend.append("category_description", formData.category_description);
        }
        
        if (imageFile) {
          formDataToSend.append("category_image", imageFile);
        }
        
        // Make the API call
        const response = await fetch(
          `${baseurl}/api/category/create`,
          {
            method: 'POST',
            body: formDataToSend,
            // Don't set Content-Type header when using FormData, let the browser set it
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        setSnackbar({
          open: true,
          message: "Category created successfully!",
          severity: "success",
        });
        
        // Navigate back to categories list after a short delay
        setTimeout(() => {
          navigate("/product-category");
        }, 2000);
      } catch (error) {
        console.error("Error creating category:", error);
        setSnackbar({
          open: true,
          message: error.message || "Failed to create category",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ padding: 3, maxWidth: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <BackButton 
          aria-label="back" 
          onClick={() => navigate("/categories")}
        >
          <ArrowBackIcon />
        </BackButton>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            underline="hover"
            href="/"
            sx={{
              color: "#00AB6B",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Dashboard
          </Link>
          <Link
            underline="hover"
            href="/categories"
            sx={{
              color: "#00AB6B",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Product Management
          </Link>
          <Typography
            color="text.primary"
            sx={{
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Create Category
          </Typography>
        </Breadcrumbs>
      </Box>

      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Create Product Category
      </Typography>

      <Card
        variant="outlined"
        sx={{
          borderColor: "success.main",
          bgcolor: "#00B0740D",
          p: 2,
          mb: 3,
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: "success.main", fontWeight: 600 }}
        >
          Category Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details to create a new product category
        </Typography>
      </Card>

      <StyledPaper elevation={1}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.category_name}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Category Name*
                </Typography>
                <TextField
                  name="category_name"
                  placeholder="Enter category name"
                  variant="outlined"
                  fullWidth
                  value={formData.category_name}
                  onChange={handleInputChange}
                  error={!!errors.category_name}
                  helperText={errors.category_name}
                  InputProps={{
                    sx: {
                      borderRadius: 1,
                    },
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Description
                </Typography>
                <TextField
                  name="category_description"
                  placeholder="Enter category description"
                  variant="outlined"
                  fullWidth
                  value={formData.category_description}
                  onChange={handleInputChange}
                  InputProps={{
                    sx: {
                      borderRadius: 1,
                    },
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category_image}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1 }}
                >
                  Category Image*
                </Typography>
                <UploadButton
                  component="label"
                  variant="outlined"
                  color="inherit"
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 40, color: "#00AB6B", mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Drag and drop or click to upload
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Supports JPG, PNG. Max size 2MB
                  </Typography>
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </UploadButton>
                {errors.image && (
                  <FormHelperText error>{errors.category_image}</FormHelperText>
                )}
              </FormControl>

              {image && (
                <ImagePreviewContainer>
                  <img
                    src={image}
                    alt="Category preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </ImagePreviewContainer>
              )}
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 4,
            }}
          >
            <CancelButton
              variant="outlined"
              onClick={() => navigate("/categories")}
              disabled={loading}
            >
              Cancel
            </CancelButton>
            <SubmitButton 
              type="submit" 
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Category"
              )}
            </SubmitButton>
          </Box>
        </form>
      </StyledPaper>

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

export default CreateCategory;