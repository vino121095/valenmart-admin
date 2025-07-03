import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  Available: 'success',
  Break: 'error',
  Idle: 'warning',
  Offline: 'default',
};

export default function DeliveryManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [summary, setSummary] = useState({
    activeDrivers: 0,
    tasksInProgress: 0,
    completedToday: 0,
  });
  const [deliveries, setDeliveries] = useState([]);
  const [completedDeliveries, setCompletedDeliveries] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:8000/api/driver-details/all')
      .then((response) => response.json())
      .then((data) => {
        const driverData = data?.data || [];
        setDrivers(driverData);

        const activeDrivers = driverData.filter(driver => driver.status === 'Available').length;

        setSummary(prev => ({
          ...prev,
          activeDrivers,
        }));

        setPagination(prev => ({
          ...prev,
          total: Math.ceil(driverData.length / 5),
        }));
      })
      .catch((error) => {
        console.error('Error fetching driver data:', error);
        setDrivers([]);
      });
  }, [pagination.page]);

  useEffect(() => {
    fetch('http://localhost:8000/api/delivery/all')
      .then((res) => res.json())
      .then((data) => {
        const deliveryData = Array.isArray(data) ? data : [];
        setDeliveries(deliveryData);

        // Group completed deliveries by date
        const completed = deliveryData.filter(d => d.status === 'Completed');
        setCompletedDeliveries(completed);

        const today = new Date().toISOString().split('T')[0];
        const completedToday = completed.filter(d => d.date === today);

        setSummary(prev => ({
          ...prev,
          tasksInProgress: deliveryData.filter(d => d.status === 'In Progress').length,
          completedToday: completedToday.length,
        }));
      })
      .catch((err) => {
        console.error('Error fetching delivery data:', err);
        setDeliveries([]);
      });
  }, []);

  const handlePaginationChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  const filteredCompletedDeliveries = () => {
    if (dateFilter === 'all') return completedDeliveries;

    const today = new Date().toISOString().split('T')[0];
    if (dateFilter === 'today') {
      return completedDeliveries.filter(d => d.date === today);
    }

    // For week/month filtering
    const now = new Date();
    if (dateFilter === 'week') {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return completedDeliveries.filter(d => new Date(d.date) >= oneWeekAgo);
    }
    if (dateFilter === 'month') {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return completedDeliveries.filter(d => new Date(d.date) >= oneMonthAgo);
    }

    return completedDeliveries;
  };

  const groupDeliveriesByDate = () => {
    const grouped = {};
    filteredCompletedDeliveries().forEach(delivery => {
      if (!grouped[delivery.date]) {
        grouped[delivery.date] = [];
      }
      grouped[delivery.date].push(delivery);
    });
    return grouped;
  };

  const groupByDriver = (deliveries) => {
    return deliveries.reduce((groups, delivery) => {
      const driverId = delivery.driver?.did || 'unassigned';
      if (!groups[driverId]) {
        groups[driverId] = [];
      }
      groups[driverId].push(delivery);
      return groups;
    }, {});
  };

  const countByType = (deliveries) => {
    const counts = {};
    deliveries.forEach(d => {
      counts[d.type] = (counts[d.type] || 0) + 1;
    });
    return Object.entries(counts);
  };

  const dateGroups = groupDeliveriesByDate();
  const start = (pagination.page - 1) * 5;
  const end = pagination.page * 5;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Driver & Delivery Management</Typography>
        <Button variant="contained" color="success" onClick={() => navigate('/driveradd')}>Add Driver</Button>
      </Box>

      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="contained" onClick={() => navigate('/delivery')}>Driver Accounts</Button>
        <Button variant="outlined" onClick={() => navigate('/drivertask')}>Assign Tasks</Button>
        <Button variant="outlined" onClick={() => navigate('/drivertrack')}>Live Tracking</Button>
        <Button variant="outlined" onClick={() => navigate('/driverlog')}>Driver Logs</Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Active Drivers</Typography>
            <Typography variant="h5">
              {summary.activeDrivers} <Typography component="span" sx={{ color: 'green', fontSize: 16 }}>+2</Typography>
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f0fce6' }}>
            <Typography variant="subtitle2" color="text.secondary">Task in Progress</Typography>
            <Typography variant="h5">{summary.tasksInProgress}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#fdf0ff', cursor: 'pointer' }}>
            <Typography variant="subtitle2" color="text.secondary">Completed Today</Typography>
            <Typography variant="h5">{summary.completedToday}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Driver Management" />
        <Tab label="Completed Deliveries" />
      </Tabs>

      {tabValue === 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#00A67E' }}>
                <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Current Task</TableCell>
                <TableCell sx={{ color: 'white' }}>Completed Today</TableCell>
                <TableCell sx={{ color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.slice(start, end).map((driver, index) => {
                const driverDeliveries = deliveries.filter(
                  delivery => delivery.driver?.did === driver.did
                );
                const completedTodayCount = driverDeliveries.filter(
                  delivery => delivery.status === 'Completed' && delivery.date === new Date().toISOString().split('T')[0]
                ).length;

                return (
                  <TableRow key={index}>
                    <TableCell>{`${driver.first_name} ${driver.last_name}`}</TableCell>
                    <TableCell>
                      <Chip
                        label={driver.status}
                        color={statusColors[driver.status] || 'default'}
                        variant="soft"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {driverDeliveries
                        .filter(delivery => delivery.status === 'In Progress')
                        .map(delivery => delivery.deliveryNo || 'N/A')
                        .join(', ') || 'None'}
                    </TableCell>
                    <TableCell>
                      {completedTodayCount || '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="outlined" size="small" onClick={() => navigate(`/driver/${driver.did}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2">
              Showing {start + 1} to {Math.min(end, drivers.length)} of {drivers.length} Entries
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" size="small" onClick={(e) => handlePaginationChange(e, pagination.page - 1)} disabled={pagination.page <= 1}>Previous</Button>
              {[...Array(pagination.total)].map((_, index) => (
                <Button
                  key={index}
                  variant={pagination.page === index + 1 ? 'contained' : 'outlined'}
                  size="small"
                  color={pagination.page === index + 1 ? 'success' : 'inherit'}
                  onClick={(e) => handlePaginationChange(e, index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button variant="outlined" size="small" onClick={(e) => handlePaginationChange(e, pagination.page + 1)} disabled={pagination.page >= pagination.total}>Next</Button>
            </Stack>
          </Box>
        </TableContainer>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
            <select
              value={dateFilter}
              onChange={handleDateFilterChange}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Button
              variant="outlined"
              onClick={() => setDateFilter('all')}
              size="small"
            >
              Clear Filters
            </Button>
          </Box>

          {Object.keys(dateGroups).length === 0 ? (
            <Typography variant="body1" sx={{ p: 2 }}>No completed deliveries found</Typography>
          ) : (
            Object.entries(dateGroups).map(([date, deliveries]) => (
              <Box key={date} sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 1, color: '#00A67E' }}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  <Typography component="span" sx={{ ml: 2, fontSize: '0.9rem', color: 'text.secondary' }}>
                    {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'}
                  </Typography>
                </Typography>

                {/* Group deliveries by driver */}
                {Object.entries(groupByDriver(deliveries)).map(([driverId, driverDeliveries]) => {
                  const driver = driverDeliveries[0].driver;
                  return (
                    <Box key={driverId} sx={{ mb: 3 }}>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Chip
                                  label={driver ? `${driver.first_name} ${driver.last_name}` : 'Unassigned'}
                                  sx={{ ml: 2, marginTop: "20px" }}
                                  color="primary"
                                  size="small"
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 2, marginTop: "20px" }}>
                                  Vehicle: {driver?.vehicle_number || 'N/A'}
                                </Typography>
                              </Typography>
                            </TableRow>
                            <TableRow sx={{ backgroundColor: '#00A67E' }}>
                              <TableCell sx={{ color: 'white' }}>Delivery ID</TableCell>
                              <TableCell sx={{ color: 'white' }}>Time Slot</TableCell>
                              <TableCell sx={{ color: 'white' }}>Type</TableCell>
                              <TableCell sx={{ color: 'white' }}>Charges (₹)</TableCell>
                              <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {driverDeliveries.map((delivery, index) => (
                              <TableRow key={index}>
                                <TableCell>{delivery.deliveryNo}</TableCell>
                                <TableCell>{delivery.timeSlot}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={delivery.type}
                                    size="small"
                                    color={delivery.type === 'Customer' ? 'primary' : 'secondary'}
                                  />
                                </TableCell>
                                <TableCell>₹{delivery.charges}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={delivery.status}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                            {/* <TableRow sx={{ backgroundColor: '#fafafa' }}>
                              <TableCell colSpan={3} align="right">
                                <strong>Driver Total:</strong>
                              </TableCell>
                              <TableCell>
                                <strong>₹{driverDeliveries.reduce((sum, d) => sum + d.charges, 0)}</strong>
                              </TableCell>
                              <TableCell>
                                {driverDeliveries.length} deliveries
                              </TableCell>
                            </TableRow> */}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}

                {/* Date Summary */}
                {/* <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f7ff', borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    Date Summary: {deliveries.length} total deliveries |
                    Total Charges: ₹{deliveries.reduce((sum, d) => sum + d.charges, 0)} |
                    {countByType(deliveries).map(([type, count]) => (
                      <span key={type} style={{ marginLeft: '8px' }}>
                        {count} {type}
                      </span>
                    ))}
                  </Typography>
                </Box> */}
              </Box>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}