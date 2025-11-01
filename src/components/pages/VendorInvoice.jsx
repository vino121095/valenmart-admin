import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Breadcrumbs,
    Link,
    TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import baseurl from '../ApiService/ApiService';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// Map procurement status to MUI Chip colors; adjust or extend as needed
const statusColor = {
    Approved: 'success',
    Requested: 'warning',
    Rejected: 'error',
    Pending: 'info',
    Delivered: 'success',
    Received: 'success',
    // add other statuses if present
};

export default function ProcurementInvoiceManagement() {
    const navigate = useNavigate();

    // Menu state for action menu in table rows
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Data & loading
    const [loading, setLoading] = useState(true);
    const [procurements, setProcurements] = useState([]); // full list
    const [filteredProcurements, setFilteredProcurements] = useState([]);
    const [products, setProducts] = useState([]);

    // Filters
    const [filterStatus, setFilterStatus] = useState('');
    const [startDate, setStartDate] = useState(''); // filter on order_date
    const [endDate, setEndDate] = useState('');

    // For status dropdown options: derive unique statuses after fetch
    const [statusOptions, setStatusOptions] = useState([]);

    // Sorting state
    const [orderDirection, setOrderDirection] = useState({});
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch procurement data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(baseurl + '/api/procurement/all');
                if (!res.ok) {
                    console.error('Failed to fetch procurements, status:', res.status);
                    setProcurements([]);
                    setFilteredProcurements([]);
                    return;
                }
                const data = await res.json();
                console.log('API procurement response:', data); // Debug log
                const arr = Array.isArray(data.data) ? data.data : [];
                setProcurements(arr);
                setFilteredProcurements(arr);

                // Derive unique status options from data
                const statuses = Array.from(new Set(arr.map(p => p.status).filter(s => s)));
                setStatusOptions(statuses);
            } catch (err) {
                console.error('Error loading procurements:', err);
                setProcurements([]);
                setFilteredProcurements([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        fetch(baseurl + '/api/product/all')
            .then(res => res.json())
            .then(data => setProducts(data.data || []))
            .catch(() => setProducts([]));
    }, []);

    // Re-apply filters when procurements or filter fields change
    useEffect(() => {
        applyFilters();
    }, [procurements, filterStatus, startDate, endDate]);

    const handleMenuClick = (event, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const applyFilters = () => {
        let result = [...procurements];

        // Filter by status
        if (filterStatus) {
            result = result.filter(p => p.status === filterStatus);
        }

        // Filter by date range (order_date)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(p => {
                if (!p.order_date) return false;
                const od = new Date(p.order_date);
                return od >= start && od <= end;
            });
        }

        setFilteredProcurements(result);
        setPage(0); // Reset to first page when filters change
    };

    const handleResetFilters = () => {
        setFilterStatus('');
        setStartDate('');
        setEndDate('');
        setFilteredProcurements(procurements);
        setPage(0); // Reset to first page when filters are reset
    };

    // Calculate vendor invoice amount for a procurement entry:
    // vendor typically receives (subtotal + taxes), excluding delivery_fee.
    // subtotal = unit * price
    // taxes = (cgst% + sgst%) on subtotal
    const calculateVendorAmount = (proc) => {
        let itemsArr = [];
        try {
            itemsArr = typeof proc.items === 'string' ? JSON.parse(proc.items) : proc.items;
        } catch {
            itemsArr = [];
        }
        if (!Array.isArray(itemsArr)) itemsArr = [];
        const subtotal = itemsArr.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const rate = parseFloat(item.unit_price) || 0;
            return sum + qty * rate;
        }, 0);

        const cgstRate = parseFloat(proc.cgst) || 0;
        const sgstRate = parseFloat(proc.sgst) || 0;
        const taxAmount = (subtotal * cgstRate) / 100 + (subtotal * sgstRate) / 100;

        // Exclude delivery_fee for vendor invoice
        return subtotal + taxAmount;
    };

    // Handle payment receive action
    const handleReceivePayment = (procurementId) => {
        // Here you would typically make an API call to update the status
        console.log(`Marking procurement ${procurementId} as received`);

        // Update the local state for demonstration
        setProcurements(prev => prev.map(p =>
            p.procurement_id === procurementId ? { ...p, status: 'Received' } : p
        ));

        // Show confirmation or error message
        alert(`Payment for procurement ${procurementId} marked as received`);
    };

    // Helper to display 'Delivered' for 'Received' status
    const getDisplayStatus = (status) => {
        if (status === 'Received') return 'Delivered';
        return status;
    };

    // Check if payment should be marked as received
    const isPaymentReceived = (status) => {
        return status === 'Received' || status === 'Delivered';
    };

    const handleSort = (column) => {
        const isAsc = orderDirection[column] === 'asc';
        setOrderDirection({
            ...orderDirection,
            [column]: isAsc ? 'desc' : 'asc',
        });

        const sortedProcurements = [...filteredProcurements].sort((a, b) => {
            let aValue, bValue;

            switch (column) {
                case 'invoice':
                    aValue = a.order_id;
                    bValue = b.order_id;
                    break;
                case 'vendor':
                    aValue = a.vendor?.contact_person || a.vendor_name || '';
                    bValue = b.vendor?.contact_person || b.vendor_name || '';
                    break;
                case 'orderDate':
                    aValue = new Date(a.order_date);
                    bValue = new Date(b.order_date);
                    break;
                case 'deliveryDate':
                    aValue = new Date(a.expected_delivery_date);
                    bValue = new Date(b.expected_delivery_date);
                    break;
                case 'amount':
                    aValue = calculateVendorAmount(a);
                    bValue = calculateVendorAmount(b);
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
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

        setFilteredProcurements(sortedProcurements);
    };

    const getSortIcon = (column) => {
        if (!orderDirection[column]) return null;
        return orderDirection[column] === 'asc' ?
            <ArrowUpwardIcon fontSize="small" /> :
            <ArrowDownwardIcon fontSize="small" />;
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Calculate paginated data
    const paginatedProcurements = filteredProcurements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading) {
        return (
            <Box
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Summary counts & totals
    const approvedProcs = filteredProcurements.filter(p => p.status === 'Approved');
    const pendingProcs = filteredProcurements.filter(p => p.status !== 'Approved');

    const approvedCount = approvedProcs.length;
    const pendingCount = pendingProcs.length;

    const approvedTotal = approvedProcs.reduce((sum, p) => sum + calculateVendorAmount(p), 0);
    const pendingTotal = pendingProcs.reduce((sum, p) => sum + calculateVendorAmount(p), 0);

    return (
        <Box>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{ color: '#00b574' }} />} sx={{ mb: 1 }}>
                <Link color="#00b574" underline="hover" href="#" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Dashboard</Link>
                <Typography color="#07100dff" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>Vendor Invoice & Payment Tracking</Typography>
            </Breadcrumbs>
            <Typography variant="h5" fontWeight="bold" mb={3}>Vendor Invoice & Payment Tracking</Typography>

            {/* Tabs to switch invoice split */}
            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="outlined" onClick={() => navigate('/invoice')}>Customer Invoice</Button>
                <Button variant="contained" onClick={() => navigate('/vendor-invoice')}>Vendor Invoice</Button>
                <Button variant="outlined" onClick={() => navigate('/driver-invoice')}>Driver Invoice</Button>
            </Stack>

            {/* Summary Cards */}
            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
                <SummaryCard
                    label="Pending Procurements"
                    value={pendingCount}
                    sub={`₹${pendingTotal.toFixed(2)}`}
                    icon="⏳"
                />
                <SummaryCard
                    label="Approved Procurements"
                    value={approvedCount}
                    sub={`₹${approvedTotal.toFixed(2)}`}
                    icon="✔️"
                />
            </Stack>

            {/* Filters */}
            <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        label="Filter by Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        {statusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    type="date"
                    label="Start Date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <TextField
                    type="date"
                    label="End Date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <Button variant="contained" color="success" onClick={applyFilters}>
                    Apply
                </Button>
                <Button variant="outlined" color="inherit" onClick={handleResetFilters}>
                    Reset
                </Button>
            </Stack>

            {/* Procurement Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#00B074', height: 60 }}>
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
                                onClick={() => handleSort('invoice')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Invoice #
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('invoice')}</Box>
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
                                onClick={() => handleSort('vendor')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Vendor
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('vendor')}</Box>
                                </Box>
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Items</TableCell>
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
                                onClick={() => handleSort('orderDate')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Order Date
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('orderDate')}</Box>
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
                                onClick={() => handleSort('deliveryDate')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Expected Delivery
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('deliveryDate')}</Box>
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
                                onClick={() => handleSort('amount')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Vendor Amount (₹)
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('amount')}</Box>
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
                                onClick={() => handleSort('status')}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Status
                                    <Box sx={{ ml: 0.5 }}>{getSortIcon('status')}</Box>
                                </Box>
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Payment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProcurements.map((proc, index) => {
                            const vendorAmt = calculateVendorAmount(proc);
                            const isReceived = isPaymentReceived(proc.status);
                            return (
                                <TableRow
                                    key={proc.procurement_id || index}
                                    sx={{
                                        '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' },
                                        height: 80
                                    }}
                                >
                                    <TableCell sx={{ py: 2 }}>{proc.order_id}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        {proc.vendor?.contact_person || proc.vendor_name || '-'}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        {(() => {
                                            let itemsArr = [];
                                            try {
                                                itemsArr = typeof proc.items === 'string' ? JSON.parse(proc.items) : proc.items;
                                            } catch {
                                                itemsArr = [];
                                            }
                                            if (!Array.isArray(itemsArr)) itemsArr = [];
                                            return itemsArr.length > 0
                                                ? itemsArr.map((item, idx) => {
                                                    const product = products.find(
                                                        p => p.pid === item.product_id || p.id === item.product_id
                                                    );
                                                    return (
                                                        <div key={idx}>
                                                            {(product ? product.product_name || product.name : `Product ${item.product_id}`)}
                                                            {` (${item.quantity} × ₹${item.unit_price})`}
                                                        </div>
                                                    );
                                                })
                                                : '-';
                                        })()}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        {proc.order_date
                                            ? new Date(proc.order_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        {proc.expected_delivery_date
                                            ? new Date(proc.expected_delivery_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>₹{vendorAmt.toFixed(2)}</TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Chip
                                            label={getDisplayStatus(proc.status)}
                                            color={statusColor[proc.status] || 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <IconButton onClick={(e) => handleMenuClick(e, index)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        {selectedIndex === index && (
                                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                                {(proc.status === 'Delivered' || proc.status === 'Received') && (
                                                    <MenuItem onClick={() => navigate(`/vendor-invoice-view/${proc.procurement_id}`)}>View Details</MenuItem>
                                                )}
                                                <MenuItem onClick={() => navigate(`/vendor-invoice-history/${proc.procurement_id}`)}>Payment History</MenuItem>
                                            </Menu>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ py: 2 }}>
                                        <Button
                                            variant={isReceived ? "outlined" : "contained"}
                                            color="success"
                                            disabled={isReceived}
                                            onClick={() => !isReceived && handleReceivePayment(proc.procurement_id)}
                                        >
                                            {isReceived ? 'Received' : 'Receive'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredProcurements.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    No procurement records found.<br />
                                    <span style={{ fontSize: '0.9em', color: '#888' }}>
                                        Possible reasons: No data from API, filters too strict, or data structure mismatch.<br />
                                        Check browser console for API response.
                                    </span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProcurements.length}
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
            </TableContainer>
        </Box>
    );
}

// Summary Card component
function SummaryCard({ label, value, sub, icon }) {
    return (
        <Paper elevation={2} sx={{ p: 2, minWidth: 200 }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="medium">{label}</Typography>
                    <Typography>{icon}</Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">
                    {value}{' '}
                    <Typography variant="body2" component="span">
                        Entries
                    </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total Value: {sub}
                </Typography>
            </Stack>
        </Paper>
    );
}