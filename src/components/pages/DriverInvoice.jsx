import React, { useState, useEffect } from 'react';
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem, Paper,
    Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Select,
    FormControl, InputLabel, MenuItem as SelectItem, CircularProgress, Collapse, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const statusColor = {
    'Active': 'success',
    'Completed': 'info',
    'Cancelled': 'error',
    'Pending': 'warning',
    'Delivered': 'success'
};

const typeColor = {
    'Vendor': 'primary',
    'Customer': 'primary',
};

const paymentStatusColor = {
    'Receive': 'warning',
    'Received': 'success'
};

function DriverRow({ driver, driverDeliveries, formatCurrency, onPaymentComplete, refreshData, paymentStatus }) {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Filter deliveries based on payment status prop
    const filteredDeliveries = driverDeliveries.filter(delivery =>
        paymentStatus ? delivery.payment_status === paymentStatus : true
    );

    // Calculate totals
    const totalCharges = filteredDeliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.charges) || 0), 0);

    // Check if all deliveries are paid (only relevant for unpaid section)
    const allDeliveriesPaid = paymentStatus === 'Receive' && filteredDeliveries.length === 0;

    useEffect(() => {
        setPaymentAmount(totalCharges.toFixed(2));
    }, [totalCharges]);

    const handleMenuClick = (event, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const handlePaymentOpen = () => {
        if (filteredDeliveries.length === 0) {
            setError('No deliveries to pay for this driver');
            return;
        }
        setPaymentDialogOpen(true);
        setError('');
    };

    const handlePaymentClose = () => {
        setPaymentDialogOpen(false);
        setError('');
        setPaymentAmount(totalCharges.toFixed(2));
    };

    const handlePaymentSubmit = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }

        setPaymentLoading(true);
        setError('');

        try {
            // Get delivery IDs that need to be marked as paid
            const deliveryIds = filteredDeliveries.map(delivery => delivery.id);

            const response = await fetch('http://localhost:8000/api/deliveries/mark-paid', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deliveryIds,
                    paymentAmount: parseFloat(paymentAmount),
                    paymentMethod,
                    driverId: driver.did
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to process payment');
            }

            const result = await response.json();
            console.log('Payment recorded successfully:', result);

            // Call parent callback
            onPaymentComplete(driver.did, deliveryIds);

            // Refresh data to get updated payment status
            refreshData();

            handlePaymentClose();
        } catch (error) {
            console.error('Payment error:', error);
            setError(error.message || 'Failed to process payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <>
            <TableRow>
                <TableCell>
                    <IconButton onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{`${driver.first_name} ${driver.last_name}`}</TableCell>
                <TableCell>{driver.vehicle_number}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell>{filteredDeliveries.length}</TableCell>
                <TableCell>
                    {formatCurrency(totalCharges)}
                </TableCell>
                <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, driver.did)}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={selectedIndex === driver.did} onClose={handleClose}>
                        <MenuItem
                            onClick={() => navigate(`/driver-invoice-view/${driver.did}`)}
                            disabled={!driverDeliveries.some(d => d.payment_status === "Received")}
                        >
                            View Details
                        </MenuItem>
                    </Menu>
                </TableCell>
                <TableCell>
                    {paymentStatus === 'Receive' && (
                        <Button
                            variant={filteredDeliveries.length === 0 ? 'outlined' : 'contained'}
                            color={filteredDeliveries.length === 0 ? 'success' : 'warning'}
                            onClick={handlePaymentOpen}
                            disabled={filteredDeliveries.length === 0}
                        >
                            {filteredDeliveries.length === 0 ? 'All Received' : `Receive (${filteredDeliveries.length})`}
                        </Button>
                    )}
                    {paymentStatus === 'Received' && (
                        <Chip
                            label="Paid"
                            color="success"
                            variant="outlined"
                        />
                    )}
                    {!paymentStatus && (
                        <Typography variant="body2">
                            {formatCurrency(totalCharges)}
                        </Typography>
                    )}
                </TableCell>
            </TableRow>

            <Dialog open={paymentDialogOpen} onClose={handlePaymentClose} maxWidth="sm" fullWidth>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {error && <Alert severity="error">{error}</Alert>}

                        <Typography variant="h6">
                            Driver: {`${driver.first_name} ${driver.last_name}`}
                        </Typography>

                        <Typography variant="body1">
                            Deliveries to Pay: {filteredDeliveries.length}
                        </Typography>

                        <Typography variant="body1">
                            Total Charges: {formatCurrency(totalCharges)}
                        </Typography>

                        <TextField
                            label="Payment Amount"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                value={paymentMethod}
                                label="Payment Method"
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </Select>
                        </FormControl>

                        <Typography variant="body2" color="text.secondary">
                            This will mark {filteredDeliveries.length} deliveries as paid.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePaymentClose} disabled={paymentLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePaymentSubmit}
                        color="success"
                        variant="contained"
                        disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || paymentLoading}
                    >
                        {paymentLoading ? <CircularProgress size={20} /> : 'Confirm Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            <TableRow>
                <TableCell colSpan={8} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom>
                                Delivery Details
                            </Typography>

                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Delivery ID</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time Slot</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Charges</TableCell>
                                        <TableCell>Payment Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredDeliveries.map((delivery) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell>{delivery.deliveryNo || `#${delivery.id}`}</TableCell>
                                            <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{delivery.timeSlot}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={delivery.type}
                                                    color={typeColor[delivery.type]}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={delivery.status}
                                                    color={statusColor[delivery.status]}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{formatCurrency(delivery.charges)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={delivery.payment_status}
                                                    color={paymentStatusColor[delivery.payment_status]}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Summary Row */}
                            <Table size="small" sx={{ mt: 2 }}>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                                            Total:
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(totalCharges)}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function DriverInvoice() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [deliveries, setDeliveries] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const deliveriesRes = await fetch('http://localhost:8000/api/delivery/all');
            if (!deliveriesRes.ok) {
                throw new Error('Failed to fetch deliveries');
            }
            const deliveriesData = await deliveriesRes.json();
            setDeliveries(deliveriesData);

            const driversRes = await fetch('http://localhost:8000/api/driver-details/all');
            if (!driversRes.ok) {
                throw new Error('Failed to fetch drivers');
            }
            const driversData = await driversRes.json();
            setDrivers(driversData.data);

            setError('');
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [deliveries, filterStatus, filterType, filterPaymentStatus, startDate, endDate]);

    const applyFilters = () => {
        let result = [...deliveries];

        if (filterStatus) {
            result = result.filter(delivery => delivery.status === filterStatus);
        }
        if (filterType) {
            result = result.filter(delivery => delivery.type === filterType);
        }
        if (filterPaymentStatus) {
            result = result.filter(delivery => delivery.payment_status === filterPaymentStatus);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(delivery => {
                const deliveryDate = new Date(delivery.date);
                return deliveryDate >= start && deliveryDate <= end;
            });
        }

        setFilteredDeliveries(result);
    };

    const handleResetFilters = () => {
        setFilterStatus('');
        setFilterType('');
        setFilterPaymentStatus('');
        setStartDate('');
        setEndDate('');
        setFilteredDeliveries(deliveries);
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount || 0);

    const groupDeliveriesByDriver = (paymentStatus) => {
        const grouped = new Map();

        filteredDeliveries.forEach(delivery => {
            // Only include if paymentStatus matches (if specified)
            if (paymentStatus && delivery.payment_status !== paymentStatus) return;

            const driverId = delivery.driver.did;
            if (!grouped.has(driverId)) {
                const driver = drivers.find(d => d.did === driverId) || delivery.driver;
                grouped.set(driverId, {
                    driver,
                    deliveries: []
                });
            }
            grouped.get(driverId).deliveries.push(delivery);
        });

        return Array.from(grouped.values());
    };

    const calculateTotalCharges = (deliveries) =>
        deliveries.reduce((total, delivery) => total + (parseFloat(delivery.charges) || 0), 0);

    const handlePaymentComplete = (driverId, deliveryIds) => {
        console.log(`Payment completed for driver ${driverId}, deliveries: ${deliveryIds}`);
        // Data will be refreshed automatically via refreshData callback
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="contained" onClick={fetchData}>
                    Retry
                </Button>
            </Box>
        );
    }

    const unpaidGroupedData = groupDeliveriesByDriver('Receive');
    const paidGroupedData = groupDeliveriesByDriver('Received');
    const allGroupedData = groupDeliveriesByDriver();

    const totalAllCharges = calculateTotalCharges(filteredDeliveries);
    const totalUnpaidCharges = calculateTotalCharges(
        filteredDeliveries.filter(d => d.payment_status === 'Receive')
    );
    const totalPaidCharges = calculateTotalCharges(
        filteredDeliveries.filter(d => d.payment_status === 'Received')
    );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Driver Delivery Management
            </Typography>

            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="outlined" onClick={() => navigate('/invoice')}>
                    Customer Invoice
                </Button>
                <Button variant="outlined" onClick={() => navigate('/vendor-invoice')}>
                    Vendor Invoice
                </Button>
                <Button variant="contained" onClick={() => navigate('/driver-invoice')}>
                    Driver Invoice
                </Button>
            </Stack>

            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
                <SummaryCard
                    label="Total Drivers"
                    value={allGroupedData.length}
                    sub={`Total Earnings: ${formatCurrency(totalAllCharges)}`}
                    icon="🚚"
                />
                <SummaryCard
                    label="Total Deliveries"
                    value={filteredDeliveries.length}
                    sub={`Avg. per Driver: ${(filteredDeliveries.length / (allGroupedData.length || 1)).toFixed(1)}`}
                    icon="📦"
                />
                <SummaryCard
                    label="Paid Amount"
                    value={formatCurrency(totalPaidCharges)}
                    sub={`${filteredDeliveries.filter(d => d.payment_status === 'Received').length} deliveries`}
                    icon="💰"
                    color="success"
                />
                <SummaryCard
                    label="Unpaid Amount"
                    value={formatCurrency(totalUnpaidCharges)}
                    sub={`${filteredDeliveries.filter(d => d.payment_status === 'Receive').length} deliveries`}
                    icon="⚠️"
                    color="error"
                />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        label="Filter by Status"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                        label="Filter by Type"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        label="Payment Status"
                        value={filterPaymentStatus}
                        onChange={(e) => setFilterPaymentStatus(e.target.value)}
                    >
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Receive">Pending</SelectItem>
                        <SelectItem value="Received">Received</SelectItem>
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

            {/* Unpaid Section */}
            <Typography variant="h6" mt={4} mb={2} color="error">
                Unpaid Deliveries
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#FF6B6B' }}>
                            <TableCell sx={{ color: 'white' }}></TableCell>
                            <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Vehicle Number</TableCell>
                            <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                            <TableCell sx={{ color: 'white' }}>Deliveries</TableCell>
                            <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            <TableCell sx={{ color: 'white' }}>Payment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unpaidGroupedData.map(({ driver, deliveries }) => (
                            <DriverRow
                                key={`unpaid-${driver.did}`}
                                driver={driver}
                                driverDeliveries={deliveries}
                                formatCurrency={formatCurrency}
                                onPaymentComplete={handlePaymentComplete}
                                refreshData={fetchData}
                                paymentStatus="Receive"
                            />
                        ))}
                        {unpaidGroupedData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No unpaid deliveries found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Paid Section */}
            <Typography variant="h6" mt={4} mb={2} color="success">
                Paid Deliveries
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#00A67E' }}>
                            <TableCell sx={{ color: 'white' }}></TableCell>
                            <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Vehicle Number</TableCell>
                            <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                            <TableCell sx={{ color: 'white' }}>Deliveries</TableCell>
                            <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paidGroupedData.map(({ driver, deliveries }) => (
                            <DriverRow
                                key={`paid-${driver.did}`}
                                driver={driver}
                                driverDeliveries={deliveries}
                                formatCurrency={formatCurrency}
                                onPaymentComplete={handlePaymentComplete}
                                refreshData={fetchData}
                                paymentStatus="Received"
                            />
                        ))}
                        {paidGroupedData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No paid deliveries found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function SummaryCard({ label, value, sub, icon, color }) {
    return (
        <Paper elevation={2} sx={{ p: 2, minWidth: 200 }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="medium">{label}</Typography>
                    <Typography>{icon}</Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold" color={color}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">{sub}</Typography>
            </Stack>
        </Paper>
    );
}
