import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Select,
  Button,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Chip,
  Stack,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isBefore } from 'date-fns';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const DriverTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.orderData || {};

  const [selectedDriver, setSelectedDriver] = useState(order.DriversDetail?.first_name || '');
  const [driverId, setDriverId] = useState(order.driver_id || null);
  const [date, setDate] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [status, setStatus] = useState('');
  const [charges, setCharges] = useState('');
  const [message, setMessage] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  const [type, setType] = useState(order.customer_id ? 'Customer' : 'Vendor');
  const [customerId, setCustomerId] = useState(order.customer_id || null);
  const [vendorId, setVendorId] = useState(order.vendor_id || null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  useEffect(() => {
    if (order.customer_id) {
      setType('Customer');
      setCustomerId(order.customer_id);
    } else if (order.vendor_id) {
      setType('Vendor');
      setVendorId(order.vendor_id);
    }
  }, [order]);

  const handleDriverChange = (e) => {
    const selectedId = e.target.value;
    setSelectedDriver(selectedId);
    setDriverId(selectedId);
  };

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${baseurl}/api/driver-details/all`);
        const result = await response.json();
        if (result.data) setDrivers(result.data);
      } catch (error) {
        console.error('Error fetching drivers:', error);
      }
    };
    fetchDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!date || !timeSlot || !status || !driverId) {
      setMessage('All fields are required.');
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');

    const payload = {
      driver_id: driverId,
      order_id: order.oid || null,
      procurement_id: order.procurement_id || null,
      date: formattedDate,
      timeSlot,
      status,
      type,
      charges: charges || null,
      ...(type === 'Customer' && { customer_id: customerId }),
      ...(type === 'Vendor' && { vendor_id: vendorId })
    };

    try {
      const createDelivery = fetch(`${baseurl}/api/delivery/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let updateOrder = Promise.resolve();
      if (order.oid) {
        updateOrder = fetch(`${baseurl}/api/order/update/${order.oid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_id: driverId, status: 'Waiting for Approval' })
        });
      } else if (order.procurement_id) {
        updateOrder = fetch(`${baseurl}/api/procurement/update/${order.procurement_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_id: driverId, status: 'Waiting for Approval' })
        });
      }

      const [createResponse, updateResponse] = await Promise.all([createDelivery, updateOrder]);

      const createData = await createResponse.json();
      if (createResponse.ok) {
        setMessage('Delivery created successfully!');
        fetchDeliveries();
      } else {
        setMessage(`Error creating delivery: ${createData.message}`);
      }

      if (order.oid || order.procurement_id) {
        const updateData = await updateResponse.json();
        if (updateResponse.ok) {
          setMessage((prev) => `${prev} Order updated successfully!`);
          navigate(-1);
        } else {
          setMessage((prev) => `${prev} Error updating order: ${updateData.message}`);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage('Error processing request');
    }
  };

  const fetchDeliveries = async () => {
    try {
      const response = await fetch(`${baseurl}/api/delivery/all`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const customerTasks = tasks.filter(task => task.type === 'Customer');
  const vendorTasks = tasks.filter(task => task.type === 'Vendor');

  const renderTaskTable = (taskList) => {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#2CA66F' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Task ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Order/Procurement ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Date & Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Charges</TableCell>
              <TableCell sx={{ color: 'white' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {taskList.map((task, index) => (
              <TableRow key={task.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {task.driver ? `${task.driver.first_name} ${task.driver.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {task.deliveryNo ? `${task.deliveryNo}` : task.deliveryNo ? `${task.procurement_id}` : 'N/A'}
                </TableCell>
                <TableCell>{`${task.date} | ${task.timeSlot}`}</TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    size="small"
                    sx={{
                      bgcolor: task.status === 'Active' ? '#E6FFF2' :
                        task.status === 'Completed' ? '#E6F7FF' :
                          task.status === 'Cancelled' ? '#FFEBEE' : '#FFF7E6',
                      color: task.status === 'Active' ? '#2CA66F' :
                        task.status === 'Completed' ? '#1976D2' :
                          task.status === 'Cancelled' ? '#F44336' : '#FF9800'
                    }}
                  />
                </TableCell>
                <TableCell>{task.charges || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewDetails(task)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Function to disable dates before today
  const disablePastDates = (date) => {
    return isBefore(date, new Date().setHours(0, 0, 0, 0));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link underline="hover" href="/">Dashboard</Link>
          <Typography color="text.primary">Driver & Delivery Management</Typography>
        </Breadcrumbs>
        <Typography variant="h5" fontWeight="bold" mb={3}>Driver & Delivery Management</Typography>

        <Stack direction="row" spacing={2} mb={3}>
          <Button variant="outlined" onClick={() => navigate('/delivery')}>Driver Accounts</Button>
          <Button variant="contained" onClick={() => navigate('/drivertask')}>Assign Tasks</Button>
          <Button variant="outlined" onClick={() => navigate('/drivertrack')}>Live Tracking</Button>
          <Button variant="outlined" onClick={() => navigate('/driverlog')}>Driver Logs</Button>
        </Stack>

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Create New Task Assignment</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Select Driver</Typography>
                <Select fullWidth value={selectedDriver} onChange={handleDriverChange} displayEmpty>
                  <MenuItem value="" disabled><em>Select Driver</em></MenuItem>
                  {drivers.map(driver => (
                    <MenuItem key={driver.did} value={driver.did}>
                      {driver.first_name} {driver.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Order ID</Typography>
                <TextField fullWidth value={order.order_id || order.oid || order.procurement_id || ''} disabled />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Date</Typography>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newValue) => setDate(newValue)}
                  shouldDisableDate={disablePastDates}
                  minDate={new Date()}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" fullWidth margin="normal" required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Time Slot</Typography>
                <Select fullWidth value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} displayEmpty>
                  <MenuItem value="" disabled><em>Select Time</em></MenuItem>
                  <MenuItem value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</MenuItem>
                  <MenuItem value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</MenuItem>
                  <MenuItem value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</MenuItem>
                  <MenuItem value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</MenuItem>
                  <MenuItem value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</MenuItem>
                  <MenuItem value="04:00 PM - 06:00 PM">07:00 PM - 08:00 PM</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Status</Typography>
                <Select fullWidth value={status} onChange={(e) => setStatus(e.target.value)} displayEmpty>
                  <MenuItem value="" disabled><em>Select Status</em></MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Type</Typography>
                <TextField fullWidth value={type} disabled />
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="body2">Charges</Typography>
                <TextField fullWidth value={charges} onChange={(e) => setCharges(e.target.value)} type="number" InputProps={{ inputProps: { min: 0 } }} />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" sx={{ mt: 3, bgcolor: '#2CA66F' }}>
              Assign
            </Button>
            {message && (
              <Typography variant="body1" sx={{ mt: 2, color: message.includes('Error') ? 'error.main' : 'success.main' }}>
                {message}
              </Typography>
            )}
          </form>
        </Paper>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="delivery tabs">
            <Tab label="Customer Deliveries" />
            <Tab label="Vendor Deliveries" />
            {/* <Tab label="All Deliveries" /> */}
          </Tabs>
        </Box>

        {tabValue === 0 && <>
          <Typography variant="h6" sx={{ mt: 2 }}>Customer Deliveries</Typography>
          {customerTasks.length > 0 ? renderTaskTable(customerTasks) : <Typography sx={{ mt: 2 }}>No customer deliveries found</Typography>}
        </>}

        {tabValue === 1 && <>
          <Typography variant="h6" sx={{ mt: 2 }}>Vendor Deliveries</Typography>
          {vendorTasks.length > 0 ? renderTaskTable(vendorTasks) : <Typography sx={{ mt: 2 }}>No vendor deliveries found</Typography>}
        </>}

        {tabValue === 2 && <>
          <Typography variant="h6" sx={{ mt: 2 }}>All Deliveries</Typography>
          {tasks.length > 0 ? renderTaskTable(tasks) : <Typography sx={{ mt: 2 }}>No deliveries found</Typography>}
        </>}

        {/* View Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            Delivery Task Details
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTask ? (
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Driver</strong></TableCell>
                    <TableCell>{selectedTask.driver?.first_name} {selectedTask.driver?.last_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell>{selectedTask.date}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Time Slot</strong></TableCell>
                    <TableCell>{selectedTask.timeSlot}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell>{selectedTask.status}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Charges</strong></TableCell>
                    <TableCell>₹{selectedTask.charges || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell>{selectedTask.deliveryNo || selectedTask.procurement_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell>{selectedTask.type}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Typography>No task selected</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default DriverTask;