import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Button,
    Box,
    Chip,
    IconButton,
    Typography,
    Breadcrumbs,
    Link,
    Pagination,
    Tabs,
    Tab,
    useMediaQuery,
    useTheme,
    Card,
    Grid,
    TextField,
    InputAdornment,
    Tooltip
} from '@mui/material';
import {
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    NavigateNext as NavigateNextIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Visibility as VisibilityIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';
import img from '../assets/download.jpg';

const ProductManagement = () => {
    const [productData, setProductData] = useState([]);
    const [orderCounts, setOrderCounts] = useState({
        all: 0,
        Summer: 0,
        Winter: 0,
        Spring: 0,
        Autumn: 0,
        AllSeason: 0
    });

    // Component State
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderDirection, setOrderDirection] = useState({});
    const [selectedTab, setSelectedTab] = useState(0);
    const [paginationPage, setPaginationPage] = useState(1);
    
    // Inline editing state
    const [editingProductId, setEditingProductId] = useState(null);
    const [editingAmount, setEditingAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleNavigateToAddProduct = () => {
        navigate('/add-product');
    };

    useEffect(() => {
        console.log("Fetching product data...");
        // Fetch product data from API
        fetch(`${baseurl}/api/product/all`)
            .then(response => response.json())
            .then(data => {
                // Map API data to component expected format with fixed season mapping
                const mappedData = data.data.map(item => {
                    return {
                        id: item.pid,
                        name: item.product_name,
                        description: item.discription,
                        category: item.category,
                        weightKg: item.unit,
                        image: item.product_image.replace(/\\/g, '/'), // fix backslashes in path
                        is_seasonal: item.is_seasonal, // Store the raw is_seasonal value for filtering
                        seasonStart: item.season_start,
                        seasonEnd: item.season_end,
                        status: item.is_active,
                        amount: item.price,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        action: 'View'
                    };
                });
                
                console.log("Mapped data with seasons:", mappedData.map(p => ({id: p.id, name: p.name, season: p.is_seasonal})));
                
                setProductData(mappedData);
                setFilteredOrders(mappedData);
                
                // Update counts for all season types
                updateOrderCounts(mappedData);
            })
            .catch(error => {
                console.error('Error fetching product data:', error);
                setProductData([]);
                setFilteredOrders([]);
                updateOrderCounts([]);
            });
    }, []);

    // Fixed function to update order counts for all seasons
    const updateOrderCounts = (data) => {
        console.log("Updating counts for data:", data.map(p => ({id: p.id, season: p.is_seasonal})));
        
        setOrderCounts({
            all: data.length,
            Summer: data.filter(item => item.is_seasonal === 'summer').length,
            Winter: data.filter(item => item.is_seasonal === 'winter').length,
            Spring: data.filter(item => item.is_seasonal === 'spring').length,
            Autumn: data.filter(item => item.is_seasonal === 'autumn').length,
            AllSeason: data.filter(item => item.is_seasonal === 'all-season').length
        });
    };

    // Status Chip Component
    const StatusChip = ({ status }) => {
        let color;
        switch (status) {
            case 'Available':
                color = '#4CAF50';
                break;
            case 'Unavailable':
                color = '#F44336';
                break;
            default:
                color = '#757575';
        }

        return (
            <Chip
                label={status}
                sx={{
                    backgroundColor: `${color}20`,
                    color: color,
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    padding: '0 8px',
                }}
                size="small"
            />
        );
    };

    // Season Chip Component
    const SeasonChip = ({ season }) => {
        let color;
        let value;
        switch (season) {
            case 'summer':
                value = 'Summer'
                color = '#FF9800'; // Orange
                break;
            case 'winter':
                value = 'Winter'
                color = '#2196F3'; // Blue
                break;
            case 'spring':
                value = 'Spring'
                color = '#4CAF50'; // Green
                break;
            case 'autumn':
                value = 'Autumn'
                color = '#795548'; // Brown
                break;
            case 'all-season':
                value = 'All Season'
                color = '#9C27B0'; // Purple
                break;
            default:
                value = season || 'Unknown';
                color = '#757575'; // Grey
        }

        return (
            <Chip
                label={value}
                sx={{
                    backgroundColor: `${color}20`,
                    color: color,
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    padding: '0 8px',
                }}
                size="small"
            />
        );
    };

    // Table Handlers
    const handleChangePage = (event, newPage) => {
        // Cancel any editing when changing pages
        cancelEditing();
        setTablePage(newPage);
        // Update the pagination page state as well
        setPaginationPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event) => {
        // Cancel any editing when changing rows per page
        cancelEditing();
        setRowsPerPage(parseInt(event.target.value, 10));
        setTablePage(0);
        setPaginationPage(1);
    };

    const handleSort = (column) => {
        // Cancel any editing when sorting
        cancelEditing();
        
        const isAsc = orderDirection[column] === 'asc';
        setOrderDirection({
            ...orderDirection,
            [column]: isAsc ? 'desc' : 'asc',
        });

        // Apply sorting to filtered orders
        const sortedOrders = [...filteredOrders].sort((a, b) => {
            let aValue, bValue;
            
            switch(column) {
                case 'productname':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'weight':
                    aValue = parseFloat(a.weightKg);
                    bValue = parseFloat(b.weightKg);
                    break;
                case 'amount':
                    // Remove currency symbol and convert to number
                    aValue = parseFloat(a.amount.replace(/[^0-9.]/g, ''));
                    bValue = parseFloat(b.amount.replace(/[^0-9.]/g, ''));
                    break;
                case 'season':
                    aValue = a.is_seasonal;
                    bValue = b.is_seasonal;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a[column];
                    bValue = b[column];
            }
            
            // Handle non-numeric comparison
            if (isNaN(aValue) || isNaN(bValue)) {
                if (isAsc) {
                    return String(aValue).localeCompare(String(bValue));
                } else {
                    return String(bValue).localeCompare(String(aValue));
                }
            }
            
            // Handle numeric comparison
            return isAsc ? aValue - bValue : bValue - aValue;
        });
        
        setFilteredOrders(sortedOrders);
    };

    const getSortIcon = (column) => {
        if (!orderDirection[column]) return null;
        return orderDirection[column] === 'asc' ?
            <ArrowUpwardIcon fontSize="small" /> :
            <ArrowDownwardIcon fontSize="small" />;
    };

    // Filter Tab Handlers
    const handleTabChange = (event, newValue) => {
        // Cancel any editing when changing tabs
        cancelEditing();
        
        setSelectedTab(newValue);
        const tabFilters = ['all', 'summer', 'winter', 'spring', 'autumn', 'all-season'];
        handleFilterChange(tabFilters[newValue]);
    };

    // Fixed filter function to correctly match season values
    const handleFilterChange = (filter) => {
        console.log(`Filtering by: ${filter}`);
        
        if (filter === 'all') {
            setFilteredOrders(productData);
        } else {
            // Filter by the actual is_seasonal value from the API
            const filtered = productData.filter(product => {
                console.log(`Comparing product season "${product.is_seasonal}" with filter "${filter}"`);
                return product.is_seasonal === filter;
            });
            
            console.log(`Filtered ${filtered.length} products for season: ${filter}`);
            setFilteredOrders(filtered);
        }
        
        // Reset pagination
        setPaginationPage(1);
        setTablePage(0);
    };

    // Navigation Handlers
    const handleViewProduct = (id) => {
        cancelEditing();
        // Use the correct API endpoint for viewing product by ID
        fetch(`${baseurl}/api/product/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                return response.json();
            })
            .then(data => {
                // Navigate to view product page with the product ID
                navigate(`/view-product/${id}`);
            })
            .catch(error => {
                console.error('Error viewing product:', error);
                alert('Failed to view product details. Please try again.');
            });
    };

    const handleEditProduct = (id) => {
        cancelEditing();
        // Use the correct API endpoint for fetching product details before navigating to edit
        fetch(`${baseurl}/api/product/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch product details for editing');
                }
                return response.json();
            })
            .then(data => {
                // Navigate to edit product page with the product ID
                navigate(`/edit-product/${id}`);
            })
            .catch(error => {
                console.error('Error fetching product details for editing:', error);
                alert('Failed to load product details for editing. Please try again.');
            });
    };

    const handleDeleteProduct = async (id) => {
        cancelEditing();
        
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Use the correct API endpoint for deleting a product
                const response = await fetch(`${baseurl}/api/product/delete/${id}`, {
                    method: 'DELETE',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to delete product');
                }
                
                // Refresh product list after deletion
                const updatedProducts = productData.filter(product => product.id !== id);
                setProductData(updatedProducts);
                setFilteredOrders(updatedProducts);
                
                // Update counts for all seasons
                updateOrderCounts(updatedProducts);
                
                alert('Product deleted successfully!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product. Please try again.');
            }
        }
    };

    // Pagination Handler
    const handlePaginationChange = (event, value) => {
        cancelEditing();
        setPaginationPage(value);
        setTablePage(value - 1);
    };

    // Inline edit handlers
    const startEditing = (productId, currentAmount) => {
        // Make sure currentAmount is a string and then extract only the numeric part
        const amountStr = String(currentAmount);
        const numericAmount = amountStr.replace(/[^0-9.]/g, '');
        setEditingProductId(productId);
        setEditingAmount(numericAmount);
    };

    const cancelEditing = () => {
        setEditingProductId(null);
        setEditingAmount('');
    };

    const handleAmountChange = (e) => {
        // Only allow numbers and decimals
        const value = e.target.value;
        if (/^(\d*\.?\d*)$/.test(value) || value === '') {
            setEditingAmount(value);
        }
    };

    const saveAmount = async (productId) => {
        // Validate amount
        if (!editingAmount || isNaN(parseFloat(editingAmount))) {
            alert('Please enter a valid amount');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create formatted amount with currency symbol
            const formattedAmount = `₹${parseFloat(editingAmount).toFixed(2)}`;

            // Use the correct API endpoint for updating product price
            const response = await fetch(`${baseurl}/api/product/update/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: editingAmount, // Send raw number to API
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update product price');
            }

            // Update both data states with new amount
            const updateProduct = (products) => {
                return products.map(product => {
                    if (product.id === productId) {
                        return {
                            ...product,
                            amount: formattedAmount,
                        };
                    }
                    return product;
                });
            };

            setProductData(updateProduct(productData));
            setFilteredOrders(updateProduct(filteredOrders));
            
            // Show success feedback
            alert('Product price updated successfully!');
        } catch (error) {
            console.error('Error updating product price:', error);
            alert('Failed to update product price. Please try again.');
        } finally {
            setIsSubmitting(false);
            cancelEditing();
        }
    };

    // Table Configuration
    const headerCells = [
        { id: 'id', label: 'Product ID' },
        { id: 'image', label: 'Product Image', sortable: false },
        { id: 'productname', label: 'Product Name', sortable: true },
        { id: 'weight', label: 'Weights in Kg', sortable: true },
        { id: 'amount', label: 'Amount', sortable: true },
        { id: 'season', label: 'Season', sortable: true },
        { id: 'status', label: 'Status', sortable: true },
        { id: 'action', label: 'Action' },
    ];

    const emptyRows = tablePage > 0 ? Math.max(0, (1 + tablePage) * rowsPerPage - filteredOrders.length) : 0;

    // Tab Configuration with new seasonal filters
    const tabFilters = [
        { label: `All (${orderCounts.all})`, value: 'all' },
        { label: `Summer (${orderCounts.Summer})`, value: 'summer' },
        { label: `Winter (${orderCounts.Winter})`, value: 'winter' },
        { label: `Spring (${orderCounts.Spring})`, value: 'spring' },
        { label: `Autumn (${orderCounts.Autumn})`, value: 'autumn' },
        { label: `All Season (${orderCounts.AllSeason})`, value: 'all-season' }
    ];

    // Render Amount Cell with Edit Functionality
    const renderAmountCell = (row) => {
        const isEditing = editingProductId === row.id;
        
        if (isEditing) {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                        size="small"
                        value={editingAmount}
                        onChange={handleAmountChange}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            sx: { width: '100px' }
                        }}
                        autoFocus
                        disabled={isSubmitting}
                    />
                    <Box sx={{ ml: 1 }}>
                        <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => saveAmount(row.id)}
                            disabled={isSubmitting}
                        >
                            <SaveIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            color="error" 
                            onClick={cancelEditing}
                            disabled={isSubmitting}
                        >
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            );
        }
        
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: '4px',
                        padding: '2px 4px'
                    }
                }}
                onClick={() => startEditing(row.id, row.amount)}
            >
                <Tooltip title="Click to edit price">
                    <Box>
                        {row.amount}
                        <EditIcon 
                            fontSize="small" 
                            sx={{ 
                                ml: 0.5, 
                                color: 'action.active',
                                fontSize: '14px',
                                opacity: 0.5
                            }} 
                        />
                    </Box>
                </Tooltip>
            </Box>
        );
    };

    return (
        <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ mb: 2 }}
            >
                <Link
                    underline="hover"
                    color="inherit"
                    href="/"
                    sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    Dashboard
                </Link>
                <Typography
                    color="text.primary"
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.875rem'
                    }}
                >
                    Product Management
                </Typography>
            </Breadcrumbs>

            {/* Page Title */}
            <Typography
                variant="h5"
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    mb: 3
                }}
            >
                Product Management
            </Typography>

            {/* Filter Tabs */}
            <Box sx={{ mt: 2, mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderColor: 'success.main',
                                bgcolor: '#00B0740D',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                p: 2,
                                borderRadius: 2,
                                boxShadow: 'none',
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 200 }}>
                                <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    Create New Product
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add vegetable details, images, pricing and seasonal availability
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                onClick={handleNavigateToAddProduct}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    backgroundColor: 'success.dark',
                                    '&:hover': {
                                        backgroundColor: 'success.main',
                                    },
                                    mt: { xs: 2, md: 0 },
                                    marginLeft: "20px"
                                }}
                            >
                                Create
                            </Button>
                        </Card>
                    </Grid>
                </Grid>
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2 }}>
                        By Season
                    </Typography>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        variant={isMobile ? "scrollable" : "standard"}
                        scrollButtons={isMobile ? "auto" : false}
                        aria-label="order status filter tabs"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                minWidth: 'auto',
                                px: 3,
                                py: 1,
                                fontSize: '0.875rem',
                            },
                            '& .Mui-selected': {
                                color: theme.palette.primary.main,
                                fontWeight: 'bold',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.palette.primary.main,
                            },
                        }}
                    >
                        {tabFilters.map((tab, index) => (
                            <Tab key={index} label={tab.label} />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            {/* Order Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 700 }} aria-label="order table">
                        <TableHead>
                            <TableRow>
                                {headerCells.map((cell) => (
                                    <TableCell
                                        key={cell.id}
                                        align={cell.id === 'action' ? 'center' : 'left'}
                                        sx={{
                                            backgroundColor: '#00B074',
                                            cursor: cell.sortable ? 'pointer' : 'default',
                                            color: '#fff',
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
                            {filteredOrders.length > 0 ? (
                                filteredOrders
                                    .slice(tablePage * rowsPerPage, tablePage * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow
                                            hover
                                            key={row.id}
                                            sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                                        >
                                            <TableCell>{row.id}</TableCell>
                                            <TableCell>
                                                <img
                                                    src={`${baseurl}/${row.image}`}
                                                    alt={row.name}
                                                    style={{ width: 50, height: 50, borderRadius: 4 }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = img;
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.weightKg}</TableCell>
                                            <TableCell>
                                                {renderAmountCell(row)}
                                            </TableCell>
                                            <TableCell>
                                                <SeasonChip season={row.is_seasonal} />
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip status={row.status} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton 
                                                    color="primary" 
                                                    size="small"
                                                    onClick={() => handleViewProduct(row.id)}
                                                    disabled={editingProductId === row.id}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton 
                                                    color="info" 
                                                    size="small"
                                                    onClick={() => handleEditProduct(row.id)}
                                                    disabled={editingProductId === row.id}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    color="error" 
                                                    size="small"
                                                    onClick={() => handleDeleteProduct(row.id)}
                                                    disabled={editingProductId === row.id}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No products found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={8} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={tablePage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Bottom Pagination */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 2
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Showing {filteredOrders.length > 0 ? tablePage * rowsPerPage + 1 : 0} to {Math.min((tablePage + 1) * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} Entries
                </Typography>

                <Pagination
                    count={Math.ceil(filteredOrders.length / rowsPerPage)}
                    page={paginationPage}
                    onChange={handlePaginationChange}
                    color="primary"
                    shape="rounded"
                    showFirstButton
                    showLastButton
                />
            </Box>
        </Box>
    );
};

export default ProductManagement;