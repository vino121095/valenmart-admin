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
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import baseurl from '../ApiService/ApiService';

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
    };

    const handleResetFilters = () => {
        setFilterStatus('');
        setStartDate('');
        setEndDate('');
        setFilteredProcurements(procurements);
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
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Vendor Procurement Invoices
            </Typography>

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
                        <TableRow sx={{ backgroundColor: '#00a67e' }}>
                            <TableCell sx={{ color: 'white' }}>Invoice #</TableCell>
                            <TableCell sx={{ color: 'white' }}>Vendor</TableCell>
                            <TableCell sx={{ color: 'white' }}>Items</TableCell>
                            <TableCell sx={{ color: 'white' }}>Order Date</TableCell>
                            <TableCell sx={{ color: 'white' }}>Expected Delivery</TableCell>
                            <TableCell sx={{ color: 'white' }}>Vendor Amount (₹)</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            <TableCell sx={{ color: 'white' }}>Payment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProcurements.map((proc, index) => {
                            const vendorAmt = calculateVendorAmount(proc);
                            const isReceived = isPaymentReceived(proc.status);
                            return (
                                <TableRow key={proc.procurement_id || index}>
                                    <TableCell>{proc.order_id}</TableCell>
                                    <TableCell>
                                        {proc.vendor?.contact_person || proc.vendor_name || '-'}
                                    </TableCell>
                                    <TableCell>
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
                                    <TableCell>
                                        {proc.order_date
                                            ? new Date(proc.order_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {proc.expected_delivery_date
                                            ? new Date(proc.expected_delivery_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell>₹{vendorAmt.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getDisplayStatus(proc.status)}
                                            color={statusColor[proc.status] || 'default'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton onClick={(e) => handleMenuClick(e, index)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        {selectedIndex === index && (
                                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                                {(proc.status === 'Delivered' || proc.status === 'Received') && (
                                                    <MenuItem onClick={() => navigate(`/vendor-invoice-view/${proc.procurement_id}`)}>View Details</MenuItem>
                                                )}
                                                <MenuItem onClick={() => navigate(`/invoicehistory/${proc.procurement_id}`)}>Payment History</MenuItem>
                                            </Menu>
                                        )}
                                    </TableCell>
                                    <TableCell>
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

                {/* Simple pagination placeholder */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                    }}
                >
                    <Typography variant="body2">
                        Showing {filteredProcurements.length} entries
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" disabled>
                            Previous
                        </Button>
                        <Button variant="contained" size="small" color="primary">
                            1
                        </Button>
                        <Button variant="outlined" size="small" disabled>
                            Next
                        </Button>
                    </Stack>
                </Box>
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
