import React, { useState, useEffect, useRef } from 'react';
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
  Tab,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const statusColors = {
  Available: 'success',
  Break: 'error',
  Idle: 'warning',
  Offline: 'default',
};

const vehicleTypes = ['Bike', 'Car', 'Truck', 'Van'];
const statusOptions = ['Available', 'Break', 'Idle', 'Offline'];

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
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setOpenViewDialog(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setEditFormData({
      first_name: driver.first_name,
      last_name: driver.last_name,
      email: driver.email,
      phone: driver.phone,
      emergency_phone: driver.emergency_phone,
      vehicle_type: driver.vehicle_type,
      vehicle_number: driver.vehicle_number,
      status: driver.status,
      license_number: driver.license_number,
      license_expiry_date: driver.license_expiry_date.split('T')[0]
    });
    setOpenEditDialog(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateDriver = () => {
    // Here you would typically make an API call to update the driver
    console.log('Updating driver:', selectedDriver.did, editFormData);
    // For demo purposes, we'll just update the local state
    setDrivers(prev => prev.map(driver =>
      driver.did === selectedDriver.did ? { ...driver, ...editFormData } : driver
    ));
    setOpenEditDialog(false);
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

  const handleDownloadIdProof = (filePath) => {
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
  const fullUrl = filePath.startsWith('http') ? filePath : `${baseUrl}/${filePath}`;
  
  // Method 1: Simple anchor tag download (works for same-origin files)
  const link = document.createElement('a');
  link.href = fullUrl;
  link.setAttribute('download', 'id_proof.pdf'); // Force download
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Method 2: For external/CORS issues, fetch and download (requires backend support)
  // fetch(fullUrl, { headers: { Authorization: `Bearer ${token}` } })
  //   .then(res => res.blob())
  //   .then(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'id_proof.pdf';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   });
};

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
        <Tab label="Driver Accounts" />
        <Tab label="Driver Management" />
        <Tab label="Completed Deliveries" />
      </Tabs>

      {tabValue === 1 ? (
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
      ) : tabValue === 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#00A67E' }}>
                <TableCell sx={{ color: 'white' }}>Driver</TableCell>
                <TableCell sx={{ color: 'white' }}>Contact</TableCell>
                <TableCell sx={{ color: 'white' }}>Vehicle</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>License</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drivers.map((driver, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={`http://localhost:8000/${driver.driver_image}`}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body1">{`${driver.first_name} ${driver.last_name}`}</Typography>
                        <Typography variant="body2" color="text.secondary">{driver.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{driver.phone}</Typography>
                    <Typography variant="body2" color="text.secondary">Emergency: {driver.emergency_phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{driver.vehicle_type}</Typography>
                    <Typography variant="body2" color="text.secondary">{driver.vehicle_number}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={driver.status}
                      color={statusColors[driver.status] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{driver.license_number}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Exp: {new Date(driver.license_expiry_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewDriver(driver)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    {/* <IconButton onClick={() => handleEditDriver(driver)} color="secondary">
                      <EditIcon />
                    </IconButton> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  );
                })}
              </Box>
            ))
          )}
        </Box>
      )}

      {/* View Driver Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Driver Details</DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={`http://localhost:8000/${selectedDriver.driver_image}`}
                  sx={{ width: 100, height: 100, mb: 1 }}
                  alt="Driver Avatar"
                />
                <Typography variant="h6" fontWeight="bold">
                  {selectedDriver.first_name} {selectedDriver.last_name}
                </Typography>
                <Chip
                  label={selectedDriver.status}
                  color={statusColors[selectedDriver.status] || 'default'}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    fullWidth
                    value={selectedDriver.email || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone"
                    fullWidth
                    value={selectedDriver.phone || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Emergency Contact"
                    fullWidth
                    value={selectedDriver.emergency_phone || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Birth"
                    fullWidth
                    value={new Date(selectedDriver.date_of_birth).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vehicle Type"
                    fullWidth
                    value={selectedDriver.vehicle_type || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Vehicle Number"
                    fullWidth
                    value={selectedDriver.vehicle_number || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="License Number"
                    fullWidth
                    value={selectedDriver.license_number || ''}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="License Expiry"
                    fullWidth
                    value={new Date(selectedDriver.license_expiry_date).toLocaleDateString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    fullWidth
                    value={`${selectedDriver.state}, ${selectedDriver.country}`}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Login"
                    fullWidth
                    value={
                      selectedDriver.last_login_time
                        ? new Date(selectedDriver.last_login_time).toLocaleString()
                        : 'Never'
                    }
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
  {selectedDriver.id_proof ? (
    <Button
      variant="outlined"
      fullWidth
      onClick={() => handleDownloadIdProof(selectedDriver.id_proof)}
    >
      Download ID Proof
    </Button>
  ) : (
    <TextField
      label="ID Proof"
      fullWidth
      value="Not uploaded"
      InputProps={{ readOnly: true }}
    />
  )}
</Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenViewDialog(false);
              navigate(`/driveradd/${selectedDriver.did}`);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>


      {/* Edit Driver Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Driver Details</DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={editFormData.first_name || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={editFormData.last_name || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={editFormData.email || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={editFormData.phone || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Phone"
                  name="emergency_phone"
                  value={editFormData.emergency_phone || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    name="vehicle_type"
                    value={editFormData.vehicle_type || ''}
                    onChange={handleEditFormChange}
                    label="Vehicle Type"
                  >
                    {vehicleTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicle_number"
                  value={editFormData.vehicle_number || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license_number"
                  value={editFormData.license_number || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Expiry Date"
                  name="license_expiry_date"
                  type="date"
                  value={editFormData.license_expiry_date || ''}
                  onChange={handleEditFormChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={editFormData.status || ''}
                    onChange={handleEditFormChange}
                    label="Status"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateDriver}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
