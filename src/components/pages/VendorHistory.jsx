import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { month: 'May', delivery: 30, quality: 28 },
  { month: 'Jun', delivery: 40, quality: 35 },
  { month: 'Jul', delivery: 50, quality: 38 },
  { month: 'Aug', delivery: 42, quality: 36 },
  { month: 'Sep', delivery: 52, quality: 41 },
  { month: 'Oct', delivery: 60, quality: 44 },
  { month: 'Nov', delivery: 68, quality: 48 },
  { month: 'Dec', delivery: 75, quality: 51 },
  { month: 'Jan', delivery: 78, quality: 49 },
  { month: 'Feb', delivery: 85, quality: 53 },
  { month: 'Mar', delivery: 82, quality: 52 },
  { month: 'Apr', delivery: 88, quality: 56 },
  { month: 'May', delivery: 94, quality: 60 },
];

export default function VendorHistory() {
         const navigate = useNavigate();
    
  const theme = useTheme();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vendor/Farmer Management
      </Typography>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Active Vendors/Farmers</Typography>
            <Typography variant="h5">42</Typography>
            <Typography variant="body2" color="text.secondary">From 12 Different Regions</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Fulfillment Efficiency</Typography>
            <Typography variant="h5">92%</Typography>
            <Typography variant="body2" color="text.secondary">On-time Delivery Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Pending Approvals</Typography>
            <Typography variant="h5">5</Typography>
            <Typography variant="body2" color="text.secondary">Registration Requests</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
             <Button variant="outlined"onClick={() => navigate('/vendors')}>Vendor/Former</Button>
             <Button variant="outlined"onClick={() => navigate('/vendoractive')}>Active Vendors</Button>
             <Button variant="outlined"onClick={() => navigate('/vendorperform')}>Performance Metrics</Button>
             <Button variant="contained"onClick={() => navigate('/vendorhistory')}>Historical Data</Button>
           </Box>

      {/* Line chart */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Vendor Performance Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="delivery" stroke={theme.palette.success.main} name="On-Time Delivery" />
            <Line type="monotone" dataKey="quality" stroke={theme.palette.primary.main} name="Quality Score" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Lower summary cards */}
      <Grid container spacing={2}>
        {/* Year-over-Year */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Year-over-Year Comparison</Typography>
            <Typography variant="h6">+24%</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>2024-25: 92%</Typography>
            <Typography variant="body2">2023-24: 74%</Typography>
            <Typography variant="body2">Target: 95%</Typography>
          </Paper>
        </Grid>

        {/* Average Rating */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Average Vendor Rating</Typography>
            <Typography variant="h4" sx={{ my: 1 }}>4.6 <Typography variant="caption">/5.0</Typography></Typography>
            <Typography variant="body2">★★★★★</Typography>
          </Paper>
        </Grid>

        {/* Vendor Count by Status */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="subtitle2">Vendor Count by Status</Typography>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={[
                { name: 'Active', count: 42 },
                { name: 'Pending', count: 8 },
                { name: 'Inactive', count: 3 },
                { name: 'New', count: 12 },
              ]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={theme.palette.success.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
