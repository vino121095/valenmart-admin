import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Avatar,
  Stack
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import baseurl from '../ApiService/ApiService';

const VendorView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${baseurl}/api/vendor/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch vendor data");
        }
        const json = await response.json();

        // Check if json.data is array or object
        if (Array.isArray(json.data)) {
          // Find vendor by id (id param is string, vendor_id is number)
          const vendor = json.data.find(
            (v) => v.vendor_id.toString() === id.toString()
          );
          if (!vendor) {
            throw new Error("Vendor not found");
          }
          setVendorData(vendor);
        } else if (json.data && typeof json.data === "object") {
          setVendorData(json.data);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id]);

  const handleBack = () => {
    navigate('/vendors');
  };

  const handleEdit = () => {
    navigate(`/vendor-edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`${baseurl}/api/vendor/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error("Failed to delete vendor");
        }
        navigate('/vendors');
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Failed to delete vendor. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "red" }}>
        <Typography variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

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
              href="/vendors"
            >
              Vendor Management
            </Link>
            <Typography color="#666666">
              Vendor Details
            </Typography>
          </Breadcrumbs>
        </Box>
      </Box>
      
      <Typography variant="h5" fontWeight="bold" color="#333333">
        Vendor Details
      </Typography><br /> 

      {/* Main Content */}
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Left Column - Vendor Profile */}
            {/* <Grid item xs={12} md={4}>
              <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardMedia
                  component="div"
                  sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      bgcolor: '#00B074',
                      fontSize: '3rem'
                    }}
                  >
                    {vendorData.contact_person ? vendorData.contact_person.charAt(0).toUpperCase() : 'V'}
                  </Avatar>
                </CardMedia>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {vendorData.contact_person || "Vendor"}
                  </Typography>
                  <Chip
                    label={vendorData.status}
                    size="small"
                    sx={{
                      backgroundColor: vendorData.status === "Active" ? '#e8f5e9' : '#ffebee',
                      color: vendorData.status === "Active" ? '#2e7d32' : '#c62828',
                      fontWeight: 'normal'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid> */}

            {/* Right Column - Vendor Details */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Vendor Information
                </Typography>

                <Box>
                  <Tooltip title="Edit Vendor">
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

                  <Tooltip title="Delete Vendor">
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

              {/* Vendor Details - 3 Column Layout */}
              <Grid container spacing={3}>
                {/* First Row */}
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: '#00B074' }} />
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Contact Person
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {vendorData.contact_person || "N/A"}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ mr: 1, color: '#00B074' }} />
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Type
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {vendorData.type}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Status
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      <Chip
                        label={vendorData.status}
                        size="small"
                        sx={{
                          backgroundColor: vendorData.status === "Active" ? '#e8f5e9' : '#ffebee',
                          color: vendorData.status === "Active" ? '#2e7d32' : '#c62828',
                          fontWeight: 'normal'
                        }}
                      />
                    </Typography>
                  </Paper>
                </Grid>

                {/* Second Row */}
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: '#00B074' }} />
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {vendorData.email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: '#00B074' }} />
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Phone
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 3 }}>
                      {vendorData.phone}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold" color="#000000">
                        Vendor ID
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 0 }}>
                      {vendorData.vendor_id}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Address Details */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Address Details
                </Typography>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 1, mt: 0.2, color: '#00B074' }} />
                        <Typography variant="body2">
                          {vendorData.address}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold">City</Typography>
                      <Typography variant="body2">{vendorData.city}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold">State/Province</Typography>
                      <Typography variant="body2">{vendorData.state}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" fontWeight="bold">Pincode</Typography>
                      <Typography variant="body2">{vendorData.pincode}</Typography>
                    </Grid>
                  </Grid>
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
                  Back to Vendors
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
                  Edit Vendor
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VendorView;