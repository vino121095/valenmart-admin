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
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import baseurl from '../ApiService/ApiService';

export default function VendorView() {
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

        // Debug: log API response
        // console.log("API data:", json.data);

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

  const handleEdit = () => {
    navigate(`/vendor-edit/${id}`);
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
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Link underline="hover" href="/vendors">Vendor/Farmar Management</Link>
        <Typography color="text.primary">View Vendor/Farmar Management</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#00A67E", fontWeight: "bold" }}
          >
            {vendorData.type} Information
          </Typography>
          <Chip
            label={vendorData.status}
            sx={{
              backgroundColor:
                vendorData.status === "Active" ? "#e6f7ed" : "#ffebee",
              color: vendorData.status === "Active" ? "#00A67E" : "#f44336",
              fontWeight: "medium",
            }}
          />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Contact Person / Company Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.contact_person || "N/A"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.type}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email Address
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.email}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone Number
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.phone}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="h6"
          sx={{ color: "#00A67E", fontWeight: "bold", mb: 2 }}
        >
          Address Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.address}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              City
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.city}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              State/Province
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.state}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Pincode
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {vendorData.pincode}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleEdit}
            sx={{
              bgcolor: "#00A67E",
              "&:hover": {
                bgcolor: "#007a5e",
              },
            }}
          >
            Edit Details
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
