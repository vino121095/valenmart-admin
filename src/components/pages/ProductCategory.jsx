import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  TablePagination,
  Breadcrumbs,
  Link,
  IconButton,
  Select,
  MenuItem,
  Grid,
  Card,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import baseurl from "../ApiService/ApiService";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
}));

const StyledTableHead = styled(TableHead)({
  backgroundColor: "#00AB6B",
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "white",
  fontWeight: "bold",
}));

const StyledPaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  padding: theme.spacing(2),
  alignItems: "center",
}));

const CreateButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#00AB6B",
  color: "white",
  "&:hover": {
    backgroundColor: "#008F59",
  },
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ActionIconButton = styled(IconButton)(({ theme, color }) => ({
  backgroundColor:
    color === "primary"
      ? "#00AB6B"
      : color === "error"
      ? "#f44336"
      : "transparent",
  color: color === "primary" || color === "error" ? "white" : "#555",
  border: color === "default" ? "1px solid #ccc" : "none",
  margin: theme.spacing(0, 0.5),
  padding: theme.spacing(1),
  "&:hover": {
    backgroundColor:
      color === "primary"
        ? "#008F59"
        : color === "error"
        ? "#d32f2f"
        : "#f5f5f5",
  },
}));

const StyledBreadcrumbs = styled(Breadcrumbs)({
  marginBottom: 16,
});

const DashboardLink = styled(Link)({
  color: "#00AB6B",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "underline",
  },
});

const ImagePreview = styled('img')({
  width: 50,
  height: 50,
  objectFit: 'cover',
  borderRadius: 4,
});

const ProductCategoryManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/category/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Adjust according to your actual API response structure
      setCategories(data.data || data);
      setTotalCount(data.data.length || data.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load categories',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Navigation handlers
  const handleCreateClick = () => {
    navigate('/create-category');
  };

  const handleViewClick = (id) => {
    navigate(`/view-category/${id}`);
  };

  const handleEditClick = (id) => {
    navigate(`/edit-category/${id}`);
  };

  // Delete handlers
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

const handleDeleteConfirm = async () => {
  if (!categoryToDelete) return;

  try {
    const response = await fetch(`${baseurl}/api/category/delete/${categoryToDelete.cid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    setSnackbar({
      open: true,
      message: 'Category deleted successfully',
      severity: 'success',
    });

    fetchCategories(); // Refresh the list
  } catch (error) {
    setSnackbar({
      open: true,
      message: 'Failed to delete category',
      severity: 'error',
    });
  } finally {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  }
};


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          underline="hover"
          href="/"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          Product Category
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Product Category
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card
            variant="outlined"
            sx={{
              borderColor: "success.main",
              bgcolor: "#00B0740D",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              p: 2,
              borderRadius: 2,
              boxShadow: "none",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography
                variant="subtitle1"
                sx={{ color: "success.main", fontWeight: 600 }}
              >
                Create New Product Category
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add vegetable details, images, pricing and seasonal availability
              </Typography>
            </Box>

            <Button
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                // backgroundColor: "success.dark",
                // "&:hover": {
                //   backgroundColor: "success.main",
                // },
                mt: { xs: 2, md: 0 },
                marginLeft: "20px",
              }}
              onClick={handleCreateClick}
            >
              Create
            </Button>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#00AB6B' }} />
        </Box>
      ) : (
        <StyledTableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <StyledTableHead sx={{color: "#00B074"}}>
              <TableRow sx={{color: "#00B074"}}>
                <StyledTableCell>Category ID</StyledTableCell>
                <StyledTableCell>Category Name</StyledTableCell>
                <StyledTableCell>Category Image</StyledTableCell>
                <StyledTableCell>Action</StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {categories.length > 0 ? (
                categories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.cid}</TableCell>
                      <TableCell>{category.category_name}</TableCell>
                      <TableCell>
                        {category.category_image ? (
                          <ImagePreview 
                            src={category.category_image.startsWith('http') 
                              ? category.category_image 
                              : `${baseurl}/${category.category_image}`} 
                            alt={category.category_name} 
                          />
                        ) : (
                          'No image'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleViewClick(category.cid)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleEditClick(category.cid)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteClick(category)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <StyledPaginationContainer>
            <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
              <Typography variant="body2" sx={{ marginRight: 1 }}>
                Rows per page:
              </Typography>
              <Select
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                size="small"
                sx={{ height: 32 }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </Box>

            <Typography variant="body2" sx={{ marginRight: 2 }}>
              {categories.length > 0 
                ? `${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, totalCount)} of ${totalCount}`
                : '0-0 of 0'}
            </Typography>

            <Box sx={{ display: "flex" }}>
              <IconButton 
                size="small" 
                disabled={page === 0}
                onClick={() => setPage(0)}
              >
                <FirstPageIcon />
              </IconButton>
              <IconButton 
                size="small"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <NavigateBeforeIcon />
              </IconButton>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#00AB6B",
                  color: "white",
                  width: 32,
                  height: 32,
                  borderRadius: "4px",
                  margin: "0 4px",
                }}
              >
                {page + 1}
              </Box>
              <IconButton 
                size="small"
                disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                onClick={() => setPage(page + 1)}
              >
                <NavigateNextIcon />
              </IconButton>
              <IconButton 
                size="small"
                disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                onClick={() => setPage(Math.ceil(totalCount / rowsPerPage) - 1)}
              >
                <LastPageIcon />
              </IconButton>
            </Box>
          </StyledPaginationContainer>
        </StyledTableContainer>
      )}

      <Box sx={{ marginTop: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {categories.length > 0 
            ? `Showing ${page * rowsPerPage + 1} to ${Math.min((page + 1) * rowsPerPage, totalCount)} of ${totalCount} Entries`
            : 'No entries to show'}
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the category "{categoryToDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCategoryManagement;