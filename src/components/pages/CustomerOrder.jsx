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
    Stack,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
  } from '@mui/material';
  import {
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    NavigateNext as NavigateNextIcon
  } from '@mui/icons-material';
  import baseurl from '../ApiService/ApiService';
  import { useNavigate } from 'react-router-dom';

  const CustomerOrder = () => {
    const navigate = useNavigate();
    const [orderCounts, setOrderCounts] = useState({
      all: 0,
      new: 0,
      confirmed: 0,
      outForDelivery: 0,
      delivered: 0,
      cancelled: 0,
      waitingforapproval: 0
    });
    const [allOrders, setAllOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [tablePage, setTablePage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderDirection, setOrderDirection] = useState({});
    const [selectedTab, setSelectedTab] = useState(0);
    const [paginationPage, setPaginationPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(null);
    const [modalOrder, setModalOrder] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
      fetchAllOrders();
      fetchOrderItems();
    }, []);

    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseurl}/api/order/all`);

        if (!response.ok) {
          throw new Error(`Error fetching orders: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.data) {
          setAllOrders(data.data);
          setFilteredOrders(data.data);

          // Calculate order counts
          const counts = {
            all: data.data.length,
            new: 0,
            confirmed: 0,
            outForDelivery: 0,
            delivered: 0,
            cancelled: 0,
            waitingforapproval: 0
          };

          data.data.forEach(order => {
            switch (order.status) {
              case 'New Order':
                counts.new++;
                break;
              case 'Confirmed':
                counts.confirmed++;
                break;
              case 'Out for Delivery':
                counts.outForDelivery++;
                break;
              case 'Delivered':
                counts.delivered++;
                break;
              case 'Cancelled':
                counts.cancelled++;
                break;
              case 'Waiting for Approval':
                counts.waitingforapproval++;
                break;
              default:
                break;
            }
          });

          setOrderCounts(counts);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchOrderItems = async () => {
      try {
        const response = await fetch(`${baseurl}/api/order-items/all`);
        if (!response.ok) {
          throw new Error(`Error fetching order items: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.data) {
          setOrderItems(data.data);
        }
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    };

    const calculateOrderTotal = (orderId) => {
      const items = orderItems.filter(item => item.order_id === orderId);
      
      if (items.length === 0) return "0.00";
      
      const subtotal = items.reduce((sum, item) => {
        const lineTotal = parseFloat(item.line_total) || 0;
        return sum + lineTotal;
      }, 0);

      let cgstAmount = 0;
      let sgstAmount = 0;

      items.forEach(item => {
        const cgstRate = item.Product?.cgst || 0;
        const sgstRate = item.Product?.sgst || 0;
        const lineTotal = parseFloat(item.line_total) || 0;

        cgstAmount += (lineTotal * cgstRate) / 100;
        sgstAmount += (lineTotal * sgstRate) / 100;
      });

      const totalDeliveryFee = items.reduce(
        (acc, item) => acc + (Number(item.Product?.delivery_fee) || 0),
        0
      );

      const grandTotal = Number(subtotal) + Number(cgstAmount) + Number(sgstAmount) + Number(totalDeliveryFee);

      // Always return a string with two decimals
      return isNaN(grandTotal) ? "0.00" : grandTotal.toFixed(2);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
      try {
        const response = await fetch(`${baseurl}/api/order/update/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              status: newStatus
          }),
        });
        if (!response.ok) {
          throw new Error(`Error updating order: ${response.statusText}`);
        }
        
        const updatedOrders = allOrders.map(order => 
          order.oid === orderId ? { ...order, status: newStatus } : order
        );
        const updatedFilteredOrders = filteredOrders.map(order => 
          order.oid === orderId ? { ...order, status: newStatus } : order
        );
        
        setAllOrders(updatedOrders);
        setFilteredOrders(updatedFilteredOrders);
        
        const counts = { ...orderCounts };
        const oldOrder = allOrders.find(order => order.oid === orderId);
        if (oldOrder) {
          switch (oldOrder.status) {
            case 'New Order':
              counts.new--;
              break;
            case 'Confirmed':
              counts.confirmed--;
              break;
            case 'Out for Delivery':
              counts.outForDelivery--;
              break;
            case 'Delivered':
              counts.delivered--;
              break;
            case 'Cancelled':
              counts.cancelled--;
              break;
            case 'Waiting for Approval':
              counts.waitingforapproval--;
              break;
            default:
              break;
          }
          
          switch (newStatus) {
            case 'New Order':
              counts.new++;
              break;
            case 'Confirmed':
              counts.confirmed++;
              break;
            case 'Out for Delivery':
              counts.outForDelivery++;
              break;
            case 'Delivered':
              counts.delivered++;
              break;
            case 'Cancelled':
              counts.cancelled++;
              break;
            case 'Waiting for Approval':
              counts.waitingforapproval++;
              break;
            default:
              break;
          }
          
          setOrderCounts(counts);
        }
      } catch (error) {
        console.error("Error updating order:", error);
        setError(error.message);
      }
    };

    const handleNavigateToAssignDriver = (order) => {
      navigate('/drivertask', { state: { orderData: order } });
    };

    const handleNavigateToOrderView = (order) => {
      navigate('/order-view', { state: { orderData: { id: order.id || order.oid } } });
    };

    const handleNavigateToInvoiceView = (order) => {
      navigate('/invoice-view', { state: { orderData: order } });
    };

    const handleViewImage = async (order) => {
      setModalOrder(order);
      setImageModalOpen(true);
      setImageLoading(true);
      setImageError(null);
      setImageUrl('');
      try {
        // Adjust endpoint as needed
        const response = await fetch(`${baseurl}/api/delivery/get-delivery/${order.oid}`);
        if (!response.ok) throw new Error('Failed to fetch image');
        const data = await response.json();
        // Assume data.imageUrl or similar
        const image = baseurl+'/uploads/delivery_image/'+data.data.delivery_image;
        setImageUrl(image || '');
      } catch (err) {
        setImageError('Image not found or failed to load.');
      } finally {
        setImageLoading(false);
      }
    };

    const handleCloseImageModal = () => {
      setImageModalOpen(false);
      setImageUrl('');
      setImageError(null);
    };

    const StatusChip = ({ status }) => {
      let color;
      switch (status) {
        case 'New Order':
          color = '#FFC107';
          break;
        case 'Confirmed':
          color = '#4CAF50';
          break;
        case 'Out for Delivery':
          color = '#2196F3';
          break;
        case 'Delivered':
          color = '#9C27B0';
          break;
        case 'Cancelled':
          color = '#F44336';
          break;
        case 'Waiting for Approval':
          color = '#2196F3';
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

    const ActionButton = ({ status, order }) => {
      const handleConfirm = () => {
        updateOrderStatus(order.oid, 'Confirmed');
      };
      const handleReject = () => {
        updateOrderStatus(order.oid, 'Cancelled');
      };
      const handleMarkAsDelivered = () => {
        updateOrderStatus(order.oid, 'Delivered');
      };

      const renderActionButtons = () => {
        switch (status) {
          case 'New Order':
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={handleReject}
                >
                  Reject
                </Button>
              </Stack>
            );

          case 'Confirmed':
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleNavigateToAssignDriver(order)}
                >
                  Assign
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleNavigateToOrderView(order)}
                >
                  View
                </Button>
              </Stack>
            );

          case 'Delivered':
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => navigate(`/invoice-view/${order.oid}`)}
                >
                  Invoice
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleNavigateToOrderView(order)}
                >
                  View
                </Button>
              </Stack>
            );

          case 'Shipped':
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="info"
                  variant="contained"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => navigate(`/track-order/${order.oid}`)}
                >
                  Track Order
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => handleNavigateToOrderView(order)}
                >
                  View
                </Button>
              </Stack>
            );

          case 'Completed':
            return (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  sx={{ fontSize: '0.75rem', textTransform: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => handleViewImage(order)}
                >
                  View Image
                </Button>
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', textTransform: 'none', whiteSpace: 'nowrap' }}
                  onClick={() => handleNavigateToOrderView(order)}
                >
                  View
                </Button>
              </Stack>
            );

          default:
            return (
              <Button
                size="small"
                color="inherit"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => handleNavigateToOrderView(order)}
              >
                View
              </Button>
            );
        }
      };

      return renderActionButtons();
    };

    const handleChangePage = (event, newPage) => {
      setTablePage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setTablePage(0);
    };

    const handleSort = (column) => {
      const isAsc = orderDirection[column] === 'asc';
      setOrderDirection({
        ...orderDirection,
        [column]: isAsc ? 'desc' : 'asc',
      });

      const sortedOrders = [...filteredOrders].sort((a, b) => {
        if (column === 'customer') {
          const aValue = a.CustomerProfile?.contact_person_name || '';
          const bValue = b.CustomerProfile?.contact_person_name || '';
          return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (column === 'orderedDate') {
          return isAsc
            ? new Date(a.order_date) - new Date(b.order_date)
            : new Date(b.order_date) - new Date(a.order_date);
        } else if (column === 'deliveryDate') {
          return isAsc
            ? new Date(a.delivery_date) - new Date(b.delivery_date)
            : new Date(b.delivery_date) - new Date(a.delivery_date);
        } else if (column === 'amount') {
          const aAmount = parseFloat(calculateOrderTotal(a.oid));
          const bAmount = parseFloat(calculateOrderTotal(b.oid));
          return isAsc ? aAmount - bAmount : bAmount - aAmount;
        } else if (column === 'payment') {
          return isAsc
            ? a.payment_method.localeCompare(b.payment_method)
            : b.payment_method.localeCompare(a.payment_method);
        } else if (column === 'status') {
          return isAsc
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        } else if (column === 'driver') {
          const aValue = a.Driversdetail?.driver_name || '';
          const bValue = b.Driversdetail?.driver_name || '';
          return isAsc ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });

      setFilteredOrders(sortedOrders);
    };

    const getSortIcon = (column) => {
      if (!orderDirection[column]) return null;
      return orderDirection[column] === 'asc' ?
        <ArrowUpwardIcon fontSize="small" /> :
        <ArrowDownwardIcon fontSize="small" />;
    };

    const handleTabChange = (event, newValue) => {
      setSelectedTab(newValue);
      const tabFilters = ['all', 'new', 'confirmed', 'outForDelivery', 'delivered', 'cancelled', 'waitingforapproval'];
      handleFilterChange(tabFilters[newValue]);
    };

    const handleFilterChange = (filter) => {
      if (filter === 'all') {
        setFilteredOrders(allOrders);
      } else {
        const statusMap = {
          'new': 'New Order',
          'confirmed': 'Confirmed',
          'outForDelivery': 'Out for Delivery',
          'delivered': 'Delivered',
          'cancelled': 'Cancelled',
          'waitingforapproval': 'Waiting for Approval',
        };

        const filtered = allOrders.filter(order => order.status === statusMap[filter]);
        setFilteredOrders(filtered);
      }
      setPaginationPage(1);
      setTablePage(0);
    };

    const handlePaginationChange = (event, value) => {
      setPaginationPage(value);
      setTablePage(value - 1);
    };

    const headerCells = [
      { id: 'id', label: 'Order ID' },
      { id: 'customer', label: 'Customer', sortable: true },
      { id: 'orderedDate', label: 'Ordered Date', sortable: true },
      { id: 'deliveryDate', label: 'Delivery Date', sortable: true },
      { id: 'amount', label: 'Amount', sortable: true },
      { id: 'payment', label: 'Payment', sortable: true },
      { id: 'status', label: 'Status', sortable: true },
      { id: 'driver', label: 'Driver', sortable: true },
      { id: 'action', label: 'Action' },
    ];

    const emptyRows = tablePage > 0 ? Math.max(0, (1 + tablePage) * rowsPerPage - filteredOrders.length) : 0;

    const tabFilters = [
      { label: `All (${orderCounts.all})`, value: 'all' },
      { label: `New (${orderCounts.new})`, value: 'new' },
      { label: `Confirmed (${orderCounts.confirmed})`, value: 'confirmed' },
      { label: `Out for Delivery (${orderCounts.outForDelivery})`, value: 'outForDelivery' },
      { label: `Delivered (${orderCounts.delivered})`, value: 'delivered' },
      { label: `Cancelled (${orderCounts.cancelled})`, value: 'cancelled' },
      { label: `Waiting for Approval (${orderCounts.waitingforapproval})`, value: 'waitingforapproval' },
    ];

    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error" variant="h6">Error: {error}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={fetchAllOrders}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return (
      <Box>
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
            Customer Order Management
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Customer Order Management
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
            By Order Status
          </Typography>
          <Box sx={{ width: '100%', mb: 2 }}>
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
                        key={row.id || row.oid}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}
                      >
                        <TableCell>{row.order_id}</TableCell>
                        <TableCell>{row.CustomerProfile?.contact_person_name}</TableCell>
                        <TableCell>{row.order_date}</TableCell>
                        <TableCell>{row.delivery_date}</TableCell>
                        <TableCell>₹{calculateOrderTotal(row.oid)}</TableCell>
                        <TableCell>
                          <Box sx={{ color: row.payment_method === 'cash on delivery' ? '#FF9800' : '#4CAF50' }}>
                            {row.payment_method}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={row.status} />
                        </TableCell>
                        <TableCell>{row.DriversDetail ? `${row.DriversDetail.first_name} ${row.DriversDetail.last_name}` : 'Not Assigned'}</TableCell>
                        <TableCell align="center">
                          <ActionButton status={row.status} order={row} />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={9} />
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
            Showing {filteredOrders.length === 0 ? 0 : tablePage * rowsPerPage + 1} to {Math.min((tablePage + 1) * rowsPerPage, filteredOrders.length)} of {filteredOrders.length} Entries
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

        <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="sm" fullWidth>
          <DialogTitle>Driver Uploaded Image</DialogTitle>
          <DialogContent>
            {imageLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
              </Box>
            ) : imageError ? (
              <Typography color="error">{imageError}</Typography>
            ) : imageUrl ? (
              <Box sx={{ textAlign: 'center' }}>
                <img src={imageUrl} alt="Driver Upload" style={{ maxWidth: '100%', maxHeight: 400 }} />
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions>
            {modalOrder && modalOrder.status === 'Completed' && (
              <Button onClick={() => { updateOrderStatus(modalOrder.oid, 'Delivered'); handleCloseImageModal(); }} color="success" variant="contained">
                Mark as Delivered
              </Button>
            )}
            <Button onClick={handleCloseImageModal} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  export default CustomerOrder;