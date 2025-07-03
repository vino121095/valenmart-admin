import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const data = {
  activeVendors: 42,
  regions: 12,
  fulfillmentEfficiency: 92,
  pendingApprovals: 5,
  metrics: {
    onTimeDeliveryRate: { value: '92%', change: '+5%' },
    qualityCompliance: { value: '87%', change: '-2%' },
    orderFulfillmentRate: { value: '95%', change: '+3%' },
    responseTime: { value: '3.2h', change: '-0.5h' },
    priceCompetitiveness: { value: '81%', change: '+7%' },
    sustainabilityScore: { value: '4.5', change: '+0.3' },
  }
};

export default function VendorPerform() {
  const navigate = useNavigate();

  const Card = ({ title, value, subtitle }) => (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>{value}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      )}
    </Paper>
  );

  const MetricCard = ({ title, value, change }) => (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">Compared to previous period ({change})</Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vendor/Farmer Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card title="Active Vendors/Farmers" value={data.activeVendors} subtitle={`From ${data.regions} Different Regions`} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card title="Fulfillment Efficiency" value={`${data.fulfillmentEfficiency}%`} subtitle="On-time Delivery Rate" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card title="Pending Approvals" value={data.pendingApprovals} subtitle="Registration Requests" />
        </Grid>
      </Grid>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={() => navigate('/vendors')}>Vendor/Former</Button>
        <Button variant="outlined" onClick={() => navigate('/vendoractive')}>Active Vendors</Button>
        <Button variant="contained" onClick={() => navigate('/vendorperform')}>Performance Metrics</Button>
        <Button variant="outlined" onClick={() => navigate('/vendorhistory')}>Historical Data</Button>
      </Box>

      {/* Performance Metrics Section */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="On-Time Delivery Rate" {...data.metrics.onTimeDeliveryRate} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Quality Compliance" {...data.metrics.qualityCompliance} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Order Fulfillment Rate" {...data.metrics.orderFulfillmentRate} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Response Time" {...data.metrics.responseTime} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Price Competitiveness" {...data.metrics.priceCompetitiveness} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard title="Sustainability Score" {...data.metrics.sustainabilityScore} />
        </Grid>
      </Grid>
    </Box>
  );
}
