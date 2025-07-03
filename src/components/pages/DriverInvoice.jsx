import React, { useState, useEffect } from 'react';
import {
    Box, Button, Chip, IconButton, Menu, MenuItem, Paper,
    Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Typography, Select,
    FormControl, InputLabel, MenuItem as SelectItem, CircularProgress, Collapse
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
};

const typeColor = {
    'Vendor': 'primary',
    'Customer': 'primary',
};

function DriverRow({ driver, driverDeliveries, formatCurrency }) {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const navigate = useNavigate();

    const handleMenuClick = (event, index) => {
        setAnchorEl(event.currentTarget);
        setSelectedIndex(index);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedIndex(null);
    };

    const totalCharges = driverDeliveries.reduce((sum, delivery) => sum + (parseFloat(delivery.charges) || 0), 0);
    const allDeliveriesCompleted = driverDeliveries.every(d => d.status === 'Completed');

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
                <TableCell>{driverDeliveries.length}</TableCell>
                <TableCell>{formatCurrency(totalCharges)}</TableCell>
                <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, driver.did)}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={selectedIndex === driver.did} onClose={handleClose}>
                        <MenuItem onClick={() => navigate(`/driver-invoice-view/${driver.did}`)}>View Details</MenuItem>
                        {/* <MenuItem onClick={() => navigate(`/driver-invoice-history/${driver.did}`)}>Payment History</MenuItem> */}
                    </Menu>
                </TableCell>
                <TableCell>
                    <Button
                        variant={allDeliveriesCompleted ? 'outlined' : 'contained'}
                        color="success"
                        disabled={allDeliveriesCompleted}
                    >
                        {allDeliveriesCompleted ? 'Received' : 'Receive'}
                    </Button>
                </TableCell>

            </TableRow>
            <TableRow>
                <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom>Delivery Details</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Delivery ID</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Time Slot</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Charges</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {driverDeliveries.map((delivery, index) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{delivery.timeSlot}</TableCell>
                                            <TableCell>
                                                <Chip label={delivery.type} color={typeColor[delivery.type]} variant="outlined" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={delivery.status} color={statusColor[delivery.status]} variant="outlined" />
                                            </TableCell>
                                            <TableCell>{formatCurrency(delivery.charges)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>Total Charges:</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{formatCurrency(totalCharges)}</TableCell>
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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const deliveriesRes = await fetch('http://localhost:8000/api/delivery/all');
                const deliveriesData = await deliveriesRes.json();
                setDeliveries(deliveriesData);

                const driversRes = await fetch('http://localhost:8000/api/driver-details/all');
                const driversData = await driversRes.json();
                setDrivers(driversData.data);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [deliveries, filterStatus, filterType, startDate, endDate]);

    const applyFilters = () => {
        let result = [...deliveries];

        if (filterStatus) {
            result = result.filter(delivery => delivery.status === filterStatus);
        }
        if (filterType) {
            result = result.filter(delivery => delivery.type === filterType);
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
        setStartDate('');
        setEndDate('');
        setFilteredDeliveries(deliveries);
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', minimumFractionDigits: 2
    }).format(amount || 0);

    const groupDeliveriesByDriver = () => {
        const grouped = new Map();
        filteredDeliveries.forEach(delivery => {
            const driverId = delivery.driver.did;
            if (!grouped.has(driverId)) {
                grouped.set(driverId, {
                    driver: drivers.find(d => d.did === driverId),
                    deliveries: []
                });
            }
            grouped.get(driverId).deliveries.push(delivery);
        });
        return Array.from(grouped.values());
    };

    const calculateTotalCharges = (deliveries) => deliveries.reduce((total, delivery) => total + (parseFloat(delivery.charges) || 0), 0);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    const groupedData = groupDeliveriesByDriver();
    const totalAllCharges = calculateTotalCharges(filteredDeliveries);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>Driver Delivery Management</Typography>

            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="outlined" onClick={() => navigate('/invoice')}>Customer Invoice</Button>
                <Button variant="outlined" onClick={() => navigate('/vendor-invoice')}>Vendor Invoice</Button>
                <Button variant="contained" onClick={() => navigate('/driver-invoice')}>Driver Invoice</Button>
            </Stack>

            <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
                <SummaryCard label="Total Drivers" value={groupedData.length} sub={`Total Earnings: ${formatCurrency(totalAllCharges)}`} icon="🚚" />
                <SummaryCard label="Total Deliveries" value={filteredDeliveries.length} sub={`Avg. per Driver: ${(filteredDeliveries.length / (groupedData.length || 1)).toFixed(1)}`} icon="📦" />
                <SummaryCard label="Active Drivers" value={groupedData.filter(g => g.driver.status === 'Available').length} sub={`${((groupedData.filter(g => g.driver.status === 'Available').length / (groupedData.length || 1)) * 100).toFixed(0)}% Available`} icon="👤" />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" mb={2} flexWrap="wrap">
                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select label="Filter by Status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select label="Filter by Type" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                    </Select>
                </FormControl>

                <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <Button variant="contained" color="success" onClick={applyFilters}>Apply</Button>
                <Button variant="outlined" color="inherit" onClick={handleResetFilters}>Reset</Button>
            </Stack>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#00A67E' }}>
                            <TableCell sx={{ color: 'white' }}></TableCell>
                            <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
                            <TableCell sx={{ color: 'white' }}>Vehicle Number</TableCell>
                            <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                            <TableCell sx={{ color: 'white' }}>Total Deliveries</TableCell>
                            <TableCell sx={{ color: 'white' }}>Total Charges</TableCell>
                            <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                            <TableCell sx={{ color: 'white' }}>Payment</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groupedData.map(({ driver, deliveries }) => (
                            <DriverRow
                                key={driver.did}
                                driver={driver}
                                driverDeliveries={deliveries}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </TableBody>
                </Table>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2">Showing {groupedData.length} drivers with {filteredDeliveries.length} total deliveries</Typography>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" disabled>Previous</Button>
                        <Button variant="contained" size="small" color="success">1</Button>
                        <Button variant="outlined" size="small" disabled>Next</Button>
                    </Stack>
                </Box>
            </TableContainer>
        </Box>
    );
}

function SummaryCard({ label, value, sub, icon }) {
    return (
        <Paper elevation={2} sx={{ p: 2, minWidth: 200 }}>
            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight="medium">{label}</Typography>
                    <Typography>{icon}</Typography>
                </Stack>
                <Typography variant="h5" fontWeight="bold">{value}</Typography>
                <Typography variant="body2" color="text.secondary">{sub}</Typography>
            </Stack>
        </Paper>
    );
}
