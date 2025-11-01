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
  Link,
  TablePagination
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
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
  const [orderDirection, setOrderDirection] = useState({});
  const [sortedCustomerTasks, setSortedCustomerTasks] = useState([]);
  const [sortedVendorTasks, setSortedVendorTasks] = useState([]);
  
  // Pagination states
  const [customerPage, setCustomerPage] = useState(0);
  const [customerRowsPerPage, setCustomerRowsPerPage] = useState(10);
  const [vendorPage, setVendorPage] = useState(0);
  const [vendorRowsPerPage, setVendorRowsPerPage] = useState(10);
  const [allPage, setAllPage] = useState(0);
  const [allRowsPerPage, setAllRowsPerPage] = useState(10);

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

  const handleSort = (column, data, setDataFn) => {
    const isAsc = orderDirection[column] === 'asc';
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? 'desc' : 'asc',
    });

    const sorted = [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch(column) {
        case 'taskId':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'driverName':
          aValue = a.driver ? `${a.driver.first_name} ${a.driver.last_name}` : '';
          bValue = b.driver ? `${b.driver.first_name} ${b.driver.last_name}` : '';
          break;
        case 'orderId':
          aValue = a.deliveryNo || a.procurement_id || '';
          bValue = b.deliveryNo || b.procurement_id || '';
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'charges':
          aValue = parseFloat(a.charges || 0);
          bValue = parseFloat(b.charges || 0);
          break;
        default:
          aValue = a[column];
          bValue = b[column];
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }
      
      if (isAsc) {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
    
    setDataFn(sorted);
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === 'asc' ?
      <ArrowUpwardIcon fontSize="small" /> :
      <ArrowDownwardIcon fontSize="small" />;
  };

  const customerTasks = tasks.filter(task => task.type === 'Customer');
  const vendorTasks = tasks.filter(task => task.type === 'Vendor');

  // Initialize sorted data when tasks change
  useEffect(() => {
    setSortedCustomerTasks(customerTasks);
    setSortedVendorTasks(vendorTasks);
  }, [tasks]);

  // Pagination handlers
  const handleCustomerChangePage = (event, newPage) => {
    setCustomerPage(newPage);
  };

  const handleCustomerChangeRowsPerPage = (event) => {
    setCustomerRowsPerPage(parseInt(event.target.value, 10));
    setCustomerPage(0);
  };

  const handleVendorChangePage = (event, newPage) => {
    setVendorPage(newPage);
  };

  const handleVendorChangeRowsPerPage = (event) => {
    setVendorRowsPerPage(parseInt(event.target.value, 10));
    setVendorPage(0);
  };

  const handleAllChangePage = (event, newPage) => {
    setAllPage(newPage);
  };

  const handleAllChangeRowsPerPage = (event) => {
    setAllRowsPerPage(parseInt(event.target.value, 10));
    setAllPage(0);
  };

  const renderTaskTable = (taskList, setDataFn, page, rowsPerPage, handleChangePage, handleChangeRowsPerPage) => {
    // Calculate the paginated data
    const paginatedList = taskList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    return (
      <>
        <TableContainer component={Paper} sx={{ borderRadius: 2, mt: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#00B074' }}>
              <TableRow sx={{ height: 60 }}>
                <TableCell 
                  sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('taskId', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Task ID
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('taskId')}</Box>
                  </Box>
                </TableCell>
                <TableCell 
                 sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('driverName', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Driver Name
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('driverName')}</Box>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('orderId', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Order/Procurement ID
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('orderId')}</Box>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('date', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Date & Time
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('date')}</Box>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('status', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Status
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('status')}</Box>
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                      backgroundColor: '#00B074',
                      cursor: 'pointer',
                      color: '#fff',
                      fontWeight: 'bold',
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#009e64',
                      }
                    }}
                  onClick={() => handleSort('charges', taskList, setDataFn)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Charges
                    <Box sx={{ ml: 0.5 }}>{getSortIcon('charges')}</Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedList.map((task, index) => (
                <TableRow 
                  key={task.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                    height: 80
                  }}
                >
                  <TableCell sx={{ py: 2 }}>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {task.driver ? `${task.driver.first_name} ${task.driver.last_name}` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {task.deliveryNo ? `${task.deliveryNo}` : task.procurement_id ? `${task.procurement_id}` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>{`${task.date} | ${task.timeSlot}`}</TableCell>
                  <TableCell sx={{ py: 2 }}>
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
                  <TableCell sx={{ py: 2 }}>{task.charges || 'N/A'}</TableCell>
                  <TableCell sx={{ py: 2 }}>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={taskList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '14px',
              fontWeight: 400,
              color: '#666'
            }
          }}
        />
      </>
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
          {sortedCustomerTasks.length > 0 ? 
            renderTaskTable(
              sortedCustomerTasks, 
              setSortedCustomerTasks, 
              customerPage, 
              customerRowsPerPage,
              handleCustomerChangePage,
              handleCustomerChangeRowsPerPage
            ) : 
            <Typography sx={{ mt: 2 }}>No customer deliveries found</Typography>
          }
        </>}

        {tabValue === 1 && <>
          <Typography variant="h6" sx={{ mt: 2 }}>Vendor Deliveries</Typography>
          {sortedVendorTasks.length > 0 ? 
            renderTaskTable(
              sortedVendorTasks, 
              setSortedVendorTasks, 
              vendorPage, 
              vendorRowsPerPage,
              handleVendorChangePage,
              handleVendorChangeRowsPerPage
            ) : 
            <Typography sx={{ mt: 2 }}>No vendor deliveries found</Typography>
          }
        </>}

        {tabValue === 2 && <>
          <Typography variant="h6" sx={{ mt: 2 }}>All Deliveries</Typography>
          {tasks.length > 0 ? 
            renderTaskTable(
              tasks, 
              setTasks, 
              allPage, 
              allRowsPerPage,
              handleAllChangePage,
              handleAllChangeRowsPerPage
            ) : 
            <Typography sx={{ mt: 2 }}>No deliveries found</Typography>
          }
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
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default DriverTask;