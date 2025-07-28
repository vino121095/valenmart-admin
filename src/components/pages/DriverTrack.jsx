import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  Avatar,
  Stack,
  Breadcrumbs, 
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Components for Map Markers and Legend
function DriverMarker({ name, row, col, color }) {
  const positions = {
    gridRow: row,
    gridColumn: col,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    px: 2,
    py: 1,
    position: 'relative'
  };
  return (
    <Box sx={positions}>
      <Chip
        label=""
        size="small"
        sx={{
          width: 12,
          height: 12,
          bgcolor: color,
          borderRadius: '50%',
          mr: 1
        }}
      />
      <Typography fontSize="0.75rem">{name}</Typography>
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: '#3B82F6',
          transform: 'rotate(45deg)',
          ml: 1
        }}
      />
    </Box>
  );
}

function LegendDot({ label, color, shape }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: color === 'blue' ? '#3B82F6' : color,
          borderRadius: shape === 'diamond' ? '0' : '50%',
          transform: shape === 'diamond' ? 'rotate(45deg)' : 'none',
          mr: 1
        }}
      />
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

export default function DriverTrack() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    activeDrivers: 0,
    onDelivery: 0,
    completedToday: 0
  });

  useEffect(() => {
    fetch(baseurl + '/api/driver-details/all')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const drivers = data.data;
          setDrivers(drivers);

          const today = new Date().toISOString().split('T')[0];

          const activeDrivers = drivers.filter(d => d.status === 'Available').length;
          const onDelivery = drivers.filter(d => d.status === 'On Delivery').length;
          const completedToday = drivers.filter(d =>
            d.status === 'Available' &&
            new Date(d.updatedAt).toISOString().split('T')[0] === today
          ).length;

          setSummaryStats({
            activeDrivers,
            onDelivery,
            completedToday
          });
        }
      })
      .catch(err => {
        console.error('Error fetching drivers:', err);
      });
  }, []);

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link underline="hover" href="/">Dashboard</Link>
        <Typography color="text.primary">Driver & Delivery Management</Typography>
      </Breadcrumbs>
      <Typography variant="h5" fontWeight="bold" mt={1} mb={3}>Driver & Delivery Management</Typography>
      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="outlined" onClick={() => navigate('/delivery')}>Driver Accounts</Button>
        <Button variant="outlined" onClick={() => navigate('/drivertask')}>Assign Tasks</Button>
        <Button variant="contained" onClick={() => navigate('/drivertrack')}>Live Tracking</Button>
        <Button variant="outlined" onClick={() => navigate('/driverlog')}>Driver Logs</Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">Active Drivers</Typography>
            <Typography variant="h4" fontWeight="bold">
              {summaryStats.activeDrivers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#F5FEE5' }}>
            <Typography variant="body2">Task in Progress</Typography>
            <Typography variant="h4" fontWeight="bold">
              {summaryStats.onDelivery}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: '#F5E5F9' }}>
            <Typography variant="body2">Completed Today</Typography>
            <Typography variant="h4" fontWeight="bold">
              {summaryStats.completedToday}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Map Panel */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2, position: 'relative', height: 360 }}>
            <Box
              sx={{
                height: '100%',
                border: '1px solid #ccc',
                position: 'relative',
                bgcolor: 'white',
                display: 'grid',
                gridTemplateRows: 'repeat(3, 1fr)',
                gridTemplateColumns: 'repeat(3, 1fr)',
              }}
            >
              {drivers.map((driver, index) => {
                // Simple grid positioning logic (can be improved with coordinates or map later)
                const row = (index % 3) + 1;
                const col = Math.floor(index / 3) + 1;

                // Color based on status
                let color = '#ccc';
                if (driver.status === 'Available') color = 'green';
                else if (driver.status === 'On Delivery') color = 'red';
                else if (driver.status === 'On Break') color = 'yellow';

                return (
                  <DriverMarker
                    key={driver.did}
                    name={`${driver.first_name} ${driver.last_name}`}
                    row={row}
                    col={col}
                    color={color}
                  />
                );
              })}
            </Box>

            {/* Zoom buttons */}
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <Button variant="outlined" sx={{ minWidth: 32, mb: 1 }}>+</Button>
              <Button variant="outlined" sx={{ minWidth: 32 }}>−</Button>
            </Box>

            {/* Legend */}
            <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Stack direction="row" spacing={2}>
                <LegendDot label="Active" color="green" />
                <LegendDot label="Idle" color="red" />
                <LegendDot label="Break" color="yellow" />
                <LegendDot label="Destination" color="blue" shape="diamond" />
              </Stack>
            </Box>
          </Paper>
        </Grid>
        {/* Active Deliveries Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>Active Deliveries</Typography>
            {drivers.map((driver, i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{
                  p: 1.5,
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: `6px solid ${driver.status === 'Available' ? '#2CA66F' :
                    driver.status === 'On Delivery' ? '#FFA500' :
                      driver.status === 'On Break' ? '#FFD700' :
                        '#ccc'
                    }`
                }}
              >
                <Avatar sx={{ bgcolor: '#2CA66F', mr: 2 }}>
                  {driver.first_name?.[0]}{driver.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{driver.first_name} {driver.last_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {driver.status === 'Available'
                      ? `On Task • ${driver.vehicle_type} - ${driver.vehicle_number}`
                      : 'Idle • No current task'}
                  </Typography>
                </Box>
              </Paper>
            ))}
            <Button fullWidth variant="contained" sx={{ mt: 1, bgcolor: '#2CA66F' }}>
              View All Drivers
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
