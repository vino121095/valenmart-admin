import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  TableSortLabel,
  Breadcrumbs,
  Link
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';

const statusColor = {
  Active: 'success',
  Inactive: 'error',
  Pending: 'warning',
};

const headerCells = [
  { id: 'institution_name', label: 'Customer', sortable: true },
  { id: 'contact_person_email', label: 'Email', sortable: true },
  { id: 'contact_person_phone', label: 'Phone', sortable: true },
  // { id: 'address', label: 'Address', sortable: true },
  // { id: 'city', label: 'City', sortable: true },
  // { id: 'state', label: 'State', sortable: true },
  // { id: 'postal_code', label: 'Pincode', sortable: true },
  { id: 'orderCount', label: 'Recent Orders', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'action', label: 'Actions', sortable: false },
];

export default function CustomerManagement({ reportMode = false }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Table state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('institution_name');
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customerRes, orderRes] = await Promise.all([
          fetch(baseurl + '/api/customer-profile/all'),
          fetch(baseurl + '/api/order/all')
        ]);

        if (!customerRes.ok || !orderRes.ok) throw new Error('Failed to fetch data');

        const customerData = await customerRes.json();
        const orderData = await orderRes.json();

        const ordersByCustomer = {};
        orderData.data.forEach(order => {
          const cid = order.customer_id;
          if (!ordersByCustomer[cid]) {
            ordersByCustomer[cid] = 0;
          }
          ordersByCustomer[cid]++;
        });

        const enrichedCustomers = customerData.data.map(customer => ({
          ...customer,
          orderCount: ordersByCustomer[customer.cpid] || 0,
          status: customer.status || 'Active' // Default to Active if status not provided
        }));

        setCustomers(enrichedCustomers);
        setFilteredCustomers(enrichedCustomers);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    let result = [...customers];
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(customer => 
        customer.institution_name.toLowerCase().includes(term) ||
        customer.contact_person_email.toLowerCase().includes(term) ||
        customer.contact_person_phone.includes(term) ||
        customer.address.toLowerCase().includes(term) ||
        customer.city.toLowerCase().includes(term) ||
        customer.state.toLowerCase().includes(term) ||
        customer.postal_code.includes(term)
      );
    }
    
    setFilteredCustomers(result);
    setTablePage(0); // Reset to first page when filters change
  }, [searchTerm, statusFilter, customers]);

  const handleMenuClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedIndex(null);
  };

  const handleAddCustomer = () => {
    navigate('/create-customer');
  };

  const handleEditCustomer = (customerId) => {
    if (!customerId) {
      console.error("Customer ID is undefined");
      return;
    }
    navigate(`/customer-edit/${String(customerId).replace('#', '')}`);
    handleClose();
  };

  const handleDeleteCustomer = (customerId) => {
    if (!customerId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    fetch(`${baseurl}/api/customer-profile/delete/${customerId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete customer');
        const updatedCustomers = customers.filter((cust) => cust.cpid !== customerId);
        setCustomers(updatedCustomers);
        handleClose();
      })
      .catch((err) => {
        console.error('Delete error:', err);
        alert('Failed to delete customer. Please try again.');
      });
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  const getSortIcon = (cellId) => {
    if (orderBy !== cellId) {
      return null;
    }
    return order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  const sortedCustomers = filteredCustomers.sort((a, b) => {
    if (orderBy === 'orderCount') {
      return order === 'asc' ? a.orderCount - b.orderCount : b.orderCount - a.orderCount;
    }
    if (orderBy === 'status') {
      return order === 'asc' 
        ? a.status.localeCompare(b.status) 
        : b.status.localeCompare(a.status);
    }
    return order === 'asc' 
      ? a[orderBy]?.localeCompare(b[orderBy]) 
      : b[orderBy]?.localeCompare(a[orderBy]);
  });

  return (
    <Box>
      {!reportMode && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            underline="hover"
            href="/"
            sx={{
              color: '#00A67E',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Dashboard
          </Link>
          <Typography
            sx={{
              color: '#070d0cff',
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          >
            Customer Management
          </Typography>
        </Breadcrumbs>
      )}
      {!reportMode && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Customer Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomer}
          >
            Add Customer
          </Button>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select 
            label="Filter by Status" 
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="Search Customer"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button 
          variant="outlined" 
          onClick={resetFilters}
          disabled={!searchTerm && !statusFilter}
        >
          Reset Filters
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table sx={{ minWidth: 700 }} aria-label="customer table">
            <TableHead>
              <TableRow sx={{ height: 60 }}>
                {headerCells.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.id === 'action' ? 'center' : 'left'}
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
                    onClick={() => cell.sortable && handleSort(cell.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {cell.label}
                      {cell.sortable && (
                        <Box sx={{ ml: 0.5 }}>
                          {getSortIcon(cell.id)}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center" sx={{ color: 'error.main' }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : sortedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headerCells.length} align="center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                sortedCustomers
                  .slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                  .map((customer, index) => (
                    <TableRow
                      hover
                      key={customer.cpid}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                        height: 80
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography fontWeight="medium">{customer.institution_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{customer.id}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>{customer.contact_person_email}</TableCell>
                      <TableCell sx={{ py: 2 }}>{customer.contact_person_phone}</TableCell>
                      {/* <TableCell sx={{ py: 2 }}>{customer.address}</TableCell> */}
                      {/* <TableCell sx={{ py: 2 }}>{customer.city}</TableCell>
                      <TableCell sx={{ py: 2 }}>{customer.state}</TableCell>
                      <TableCell sx={{ py: 2 }}>{customer.postal_code}</TableCell> */}
                      <TableCell align="center" sx={{ py: 2 }}>{customer.orderCount}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={customer.status}
                          color={statusColor[customer.status]}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 2 }}>
                        <IconButton onClick={(e) => handleMenuClick(e, index)}>
                          <MoreVertIcon />
                        </IconButton>
                        {selectedIndex === index && (
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem onClick={() => navigate(`/customerview1/${customer.cpid}`)}>View Details</MenuItem>
                            <MenuItem onClick={() => handleEditCustomer(customer.cpid)}>Edit Account</MenuItem>
                            <MenuItem onClick={() => navigate(`/customerview3/${customer.cpid}`)}>View Purchase History</MenuItem>
                            <MenuItem onClick={() => handleDeleteCustomer(customer.cpid)} sx={{ color: 'red' }}>Delete Account</MenuItem>
                          </Menu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedCustomers.length}
          rowsPerPage={rowsPerPage}
          page={tablePage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}