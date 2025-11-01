import React, { useState, useEffect } from "react";
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
  Stack,
  Avatar,
  Switch,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  NavigateNext as NavigateNextIcon,
  LocalShipping,
  ReceiptLong,
  Pageview,
  BrokenImage,
  Edit,
  Visibility,
} from "@mui/icons-material";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";
import AdminProcurement from "./AdminProcurement";

const ProcurementOrderManagement = ({ reportMode = false }) => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    Requested: 0,
    Approved: 0,
    Picked: 0,
    Received: 0,
    Rejected: 0,
  });

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderDirection, setOrderDirection] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [paginationPage, setPaginationPage] = useState(1);
  const [isAdminView, setIsAdminView] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [products, setProducts] = useState([]);
  const [multiEditOrder, setMultiEditOrder] = useState(null);
  const [multiEditAmounts, setMultiEditAmounts] = useState({});
  const [multiEditOpen, setMultiEditOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Force admin view in report mode
  useEffect(() => {
    if (reportMode) {
      setIsAdminView(true);
    }
  }, [reportMode]);

  useEffect(() => {
    fetch(`${baseurl}/api/procurement/all`)
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          const parsedData = data.data.map(row => ({
            ...row,
            items: typeof row.items === 'string'
              ? (() => { try { return JSON.parse(row.items); } catch { return []; } })()
              : row.items
          }));
          setOrderData(parsedData);
          setFilteredOrders(parsedData);

          // Calculate counts
          const counts = {
            all: data.data.length,
            Requested: 0,
            Approved: 0,
            Picked: 0,
            Received: 0,
            Rejected: 0,
          };

          data.data.forEach((order) => {
            if (order.status in counts) {
              counts[order.status]++;
            }
          });
          setOrderCounts(counts);
        }
      })
      .catch((error) => {
        console.error("Error fetching procurement data:", error);
      });

    fetch(`${baseurl}/api/product/all`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(() => setProducts([]));
  }, []);

  const handleViewToggle = (event) => {
    setIsAdminView(!event.target.checked);
  };

  const ProductImage = ({ imageUrl, itemName }) => {
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
      setImgError(true);
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!imgError ? (
          <Avatar
            src={imageUrl}
            alt={itemName}
            variant="rounded"
            onError={handleImageError}
            sx={{
              width: 50,
              height: 50,
              border: '1px solid #e0e0e0',
            }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#f0f0f0',
              color: '#9e9e9e',
              border: '1px solid #e0e0e0',
            }}
          >
            <BrokenImage fontSize="small" />
          </Avatar>
        )}
      </Box>
    );
  };

  const StatusChip = ({ status }) => {
    let color;
    switch (status) {
      case "Requested":
        color = "#FFC107";
        break;
      case "Confirmed":
        color = "#4CAF50";
        break;
      case "Waiting for Approval":
        color = "#2196F3";
        break;
      case "Approved":
        color = "#388E3C";
        break;
      case "Picked":
        color = "#2196F3";
        break;
      case "Received":
        color = "#9C27B0";
        break;
      case "Rejected":
        color = "#F44336";
        break;
      default:
        color = "#757575";
    }

    return (
      <Chip
        label={status}
        sx={{
          backgroundColor: `${color}20`,
          color: color,
          borderRadius: "16px",
          fontSize: "0.75rem",
          padding: "0 8px",
        }}
        size="small"
      />
    );
  };

  const ActionButtons = ({ status, orderId }) => {
    const handleConfirm = async (id) => {
      try {
        const response = await fetch(`${baseurl}/api/procurement/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Confirmed" })
        });
        const data = await response.json();
        if (response.ok && !data.error) {
          setOrderData((prev) =>
            prev.map((order) =>
              order.procurement_id === id ? { ...order, status: "Confirmed" } : order
            )
          );
          setFilteredOrders((prev) =>
            prev.map((order) =>
              order.procurement_id === id ? { ...order, status: "Confirmed" } : order
            )
          );
        } else {
          alert("Failed to update: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error confirming procurement:", error);
        alert("Something went wrong.");
      }
    };

    const handleReject = async (id) => {
      try {
        const response = await fetch(`${baseurl}/api/procurement/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Rejected" })
        });
        const data = await response.json();
        if (response.ok && !data.error) {
          setOrderData((prev) =>
            prev.map((order) =>
              order.procurement_id === id ? { ...order, status: "Rejected" } : order
            )
          );
          setFilteredOrders((prev) =>
            prev.map((order) =>
              order.procurement_id === id ? { ...order, status: "Rejected" } : order
            )
          );
        } else {
          alert("Failed to update: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error confirming procurement:", error);
        alert("Something went wrong.");
      }
    };

    const handleAssign = (id) => {
      const order = orderData.find(o => o.procurement_id === id);
      navigate('/drivertask', { state: { orderData: order } });
    };

    const handleView = (id) => {
      navigate(`/procurement-view/${id}`);
    };

    const handleViewImage = async (order) => {
      setModalOrder(order);
      setImageModalOpen(true);
      setImageLoading(true);
      setImageError(null);
      setImageUrl('');
      try {
        const response = await fetch(`${baseurl}/api/delivery/get-delivery/${order.procurement_id}`);
        if (!response.ok) throw new Error('Failed to fetch image');
        const data = await response.json();
        const image = baseurl + '/uploads/delivery_image/' + data.data.delivery_image;
        setImageUrl(image || '');
      } catch (err) {
        setImageError('Image not found or failed to load.');
      } finally {
        setImageLoading(false);
      }
    };

    switch (status) {
      case "Requested":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleConfirm(orderId)}
            >
              Confirm
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              sx={{
                fontSize: "0.75rem",
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
              onClick={() => handleReject(orderId)}
            >
              Reject
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
          </Stack>
        );
      case "Confirmed":
        if (!isAdminView) {
          return (
            <Button
              size="small"
              color="primary"
              variant="contained"
              startIcon={<LocalShipping fontSize="small" />}
              onClick={() => handleAssign(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              Assign
            </Button>
          );
        } else {
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
          );
        }
      case "Waiting for Approval":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="warning"
              variant="contained"
              startIcon={<LocalShipping fontSize="small" />}
              onClick={() => handleAssign(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              Edit Assign
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
          </Stack>
        );
      case "Approved":
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
        );
      case "Picked":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="warning"
              variant="contained"
              startIcon={<ReceiptLong fontSize="small" />}
              onClick={() => handleView(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              View
            </Button>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => handleViewImage(orderData.find(o => o.procurement_id === orderId))}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              View Image
            </Button>
          </Stack>
        );
      case "Received":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              onClick={() => navigate(`/vendor-invoice-view/${orderId}`)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
          </Stack>
        );
      case "Rejected":
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
              onClick={() => handleView(orderId)}
            >
              View
            </Button>
        );
      default:
        return null;
    }
  };

  const handleChangePage = (event, newPage) => {
    setTablePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setTablePage(0);
  };

  const handleSort = (column) => {
    const isAsc = orderDirection[column] === "asc";
    setOrderDirection({
      ...orderDirection,
      [column]: isAsc ? "desc" : "asc",
    });
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    const tabFilters = [
      "all",
      "Requested",
      "Approved",
      "Picked",
      "Received",
      "Rejected",
    ];
    handleFilterChange(tabFilters[newValue]);
  };

  const handleFilterChange = (filter) => {
    if (filter === "all") {
      setFilteredOrders(orderData);
    } else {
      const filtered = orderData.filter(
        (order) => order.status === filter
      );
      setFilteredOrders(filtered);
    }
    setPaginationPage(1);
    setTablePage(0);
  };

  const handlePaginationChange = (event, value) => {
    setPaginationPage(value);
  };

  const headerCells = [
    { id: "id", label: "Order ID", sortable: true },
    { id: "type", label: "Type", sortable: true },
    { id: "vendor/farmer", label: "Vendor/Farmar", sortable: true },
    { id: "product", label: "Product Image", sortable: false },
    { id: "items", label: "Items", sortable: true },
    { id: "price", label: "Price", sortable: true },
    { id: "requestdata", label: "Request Date", sortable: true },
    { id: "pickupdriver", label: "Pickup Driver", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "action", label: "Action", sortable: false },
  ];

  const emptyRows =
    tablePage > 0
      ? Math.max(0, (1 + tablePage) * rowsPerPage - filteredOrders.length)
      : 0;

  const tabFilters = [
    { label: `All (${orderCounts.all})`, value: 0 },
    { label: `Requested (${orderCounts.Requested})`, value: 1 },
    { label: `Approved (${orderCounts.Approved})`, value: 2 },
    { label: `Picked (${orderCounts.Picked})`, value: 3 },
    { label: `Received (${orderCounts.Received})`, value: 4 },
    { label: `Rejected (${orderCounts.Rejected})`, value: 5 },
  ];

  const handleAmountSave = async (id) => {
    const row = orderData.find(order => order.procurement_id === id);
    let itemsArr = [];
    if (typeof row.items === 'string') {
      try { itemsArr = JSON.parse(row.items); } catch { itemsArr = []; }
    } else if (Array.isArray(row.items)) {
      itemsArr = [...row.items];
    }
    if (itemsArr.length > 0) {
      itemsArr[0].unit_price = editAmount;
    }
    try {
      const response = await fetch(`${baseurl}/api/procurement/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: JSON.stringify(itemsArr), negotiationtype: 'admin' })
      });
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to update amount');
      }
    } catch (err) {
      alert('Error updating amount');
    }
    setEditingId(null);
    setEditAmount('');
  };

  const handleMultiEditOpen = (order) => {
    setMultiEditOrder(order);
    const priceMap = {};
    order.items.forEach(item => {
      priceMap[item.product_id] = item.unit_price || '';
    });
    setMultiEditAmounts(priceMap);
    setMultiEditOpen(true);
  };

  const handleMultiEditChange = (product_id, value) => {
    setMultiEditAmounts(prev => ({ ...prev, [product_id]: value }));
  };

  const handleMultiEditSave = async () => {
    if (!multiEditOrder) return;
    const row = orderData.find(order => order.procurement_id === multiEditOrder.procurement_id);
    let itemsArr = [];
    if (typeof row.items === 'string') {
      try { itemsArr = JSON.parse(row.items); } catch { itemsArr = []; }
    } else if (Array.isArray(row.items)) {
      itemsArr = [...row.items];
    }

    itemsArr.forEach(item => {
      if (multiEditAmounts[item.product_id] !== undefined) {
        item.unit_price = multiEditAmounts[item.product_id];
      }
    });

    try {
      const response = await fetch(`${baseurl}/api/procurement/update/${multiEditOrder.procurement_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: JSON.stringify(itemsArr), negotiationtype: 'admin' })
      });
      if (response.ok) {
        setMultiEditOpen(false);
        setMultiEditOrder(null);
        setMultiEditAmounts({});
        window.location.reload();
      } else {
        alert('Failed to update prices');
      }
    } catch (err) {
      alert('Error updating prices');
    }
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setImageUrl('');
    setImageError(null);
    setModalOrder(null);
  };

  const handleMarkAsReceived = async () => {
    if (!modalOrder) return;
    try {
      const response = await fetch(`${baseurl}/api/procurement/update/${modalOrder.procurement_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Received' })
      });
      if (response.ok) {
        window.location.reload();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
    handleCloseImageModal();
  };

  const RegularProcurementTable = ({ data }) => {
    const emptyRows =
      tablePage > 0
        ? Math.max(0, (1 + tablePage) * rowsPerPage - data.length)
        : 0;

    return (
      <Paper
       sx={{ width: '100%', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e0e0e0' }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 700 }} aria-label="customer table">
            <TableHead>
              <TableRow>
                {headerCells.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align="left"
                    sx={{
                      backgroundColor: '#00B074',
                      cursor: cell.sortable ? 'pointer' : 'default',
                      color: '#fff',
                      fontWeight: "bold",
                      fontSize: '14px',
                      padding: '16px',
                      borderBottom: 'none',
                      whiteSpace: 'nowrap',
                      '&:hover': cell.sortable ? {
                        backgroundColor: '#009e64',
                      } : {},
                    }}
                    onClick={() => cell.sortable && handleSort(cell.id)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {cell.label}
                      {cell.sortable && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                          {getSortIcon(cell.id)}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data
                .slice(
                  tablePage * rowsPerPage,
                  tablePage * rowsPerPage + rowsPerPage
                )
                .map((row, index) => {
                  let items = row.items || [];
                  return (
                    <TableRow
                      hover
                      key={row.procurement_id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                        height: 80,
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>{index + 1}</TableCell>
                      <TableCell sx={{ py: 2 }}>{row.type}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {row.vendor_name || row.vendor?.contact_person || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <ProductImage
                          imageUrl={
                            row.procurement_product_image
                              ? `${baseurl}${row.procurement_product_image}`
                              : `${baseurl}/procurement_product_image/${items && items[0] && products.find(p => p.pid === items[0].product_id || p.id === items[0].product_id)?.name || 'default'}.jpg`
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {items.map((item, idx) => {
                          const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
                          return (
                            <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              {product ? product.product_name || product.name : 'Product'}
                              {` (${item.quantity} kg)`}
                            </Typography>
                          );
                        })}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {row.status === "Requested" ? (
                          items.length === 1 ? (
                            editingId === row.procurement_id ? (
                              <TextField
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                onBlur={() => handleAmountSave(row.procurement_id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleAmountSave(row.procurement_id);
                                }}
                                size="small"
                                type="number"
                                inputProps={{ min: 0 }}
                                autoFocus
                              />
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span>₹{items[0].unit_price}</span>
                                <Edit
                                  fontSize="small"
                                  sx={{ ml: 1, cursor: 'pointer', color: '#888' }}
                                  onClick={() => {
                                    setEditingId(row.procurement_id);
                                    setEditAmount(items[0].unit_price);
                                  }}
                                />
                              </Box>
                            )
                          ) : (
                            <IconButton onClick={() => handleMultiEditOpen(row)}>
                              <Edit />
                            </IconButton>
                          )
                        ) : (
                          items.length === 1 ? (
                            <span>₹{items[0].unit_price}</span>
                          ) : (
                            <Box>
                              {items.map((item, idx) => (
                                <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                  ₹{item.unit_price}
                                </Typography>
                              ))}
                            </Box>
                          )
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>{row.order_date}</TableCell>
                      <TableCell sx={{ py: 2 }}>
                        {row.driver
                          ? `${row.driver.first_name || ""} ${row.driver.last_name || ""}`.trim()
                          : "N/A"}
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <StatusChip status={row.status} />
                      </TableCell>
                      <TableCell align="left" sx={{ py: 2 }}>
                        <ActionButtons
                          status={row.status}
                          orderId={row.procurement_id}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
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
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={tablePage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    );
  };

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
            color="inherit"
            href="/"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Dashboard
          </Link>
          <Typography
            color="text.primary"
            sx={{
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Procurement Order Management
          </Typography>
        </Breadcrumbs>
      )}

      {!reportMode && (
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: "bold",
            mb: 3,
          }}
        >
          Procurement Order Management
        </Typography>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        <Grid container spacing={2}>
          {!reportMode && (
            <Grid item xs={12} md={6}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: "success.main",
                  bgcolor: "#00B0740D",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  p: 2,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "success.main", fontWeight: 600 }}
                  >
                    Create New Procurement Order
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add vegetables to order, assign vendors and schedule pickup
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={() => navigate("/create-procurement")}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    mt: { xs: 2, md: 2 },
                    marginLeft: "20px",
                  }}
                >
                  Create
                </Button>
              </Card>
            </Grid>
          )}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!isAdminView}
                  onChange={handleViewToggle}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {!isAdminView ? "Vendor/Farmer View" : "Admin View"}
                </Typography>
              }
              sx={{ mr: 2 }}
            />
          </Grid>
        </Grid>
        <Box sx={{ width: "100%", mb: 2 }}>
          {!reportMode && (
            <Typography variant="subtitle1" sx={{ fontWeight: "medium", mt: 2 }}>
              By Order Status
            </Typography>
          )}
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            aria-label="order status filter tabs"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": {
                textTransform: "none",
                minWidth: "auto",
                px: 3,
                py: 1,
                fontSize: "0.875rem",
              },
              "& .Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
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

      {!isAdminView ? (
        <RegularProcurementTable
          data={filteredOrders.filter((order) => order.type === "vendor" || order.type === 'farmer')}
        />
      ) : (
        <AdminProcurement
          data={filteredOrders.filter((order) => order.type === "admin")}
          page={tablePage}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onSort={handleSort}
          orderDirection={orderDirection}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          flexDirection: isMobile ? "column" : "row",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {tablePage * rowsPerPage + 1} to{" "}
          {Math.min((tablePage + 1) * rowsPerPage, filteredOrders.length)} of{" "}
          {filteredOrders.length} Entries
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

      <Dialog open={multiEditOpen} onClose={() => setMultiEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product Prices</DialogTitle>
        <DialogContent>
          {multiEditOrder && multiEditOrder.items.map((item, idx) => {
            const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
            return (
              <Box key={item.product_id} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {product ? product.product_name || product.name : 'Product'} ({item.quantity} kg)
                </Typography>
                <TextField
                  value={multiEditAmounts[item.product_id] || ''}
                  onChange={e => handleMultiEditChange(item.product_id, e.target.value)}
                  size="small"
                  type="number"
                  inputProps={{ min: 0 }}
                  sx={{ mt: 1 }}
                />
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMultiEditOpen(false)} color="primary">Cancel</Button>
          <Button onClick={handleMultiEditSave} color="success" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageModalOpen} onClose={handleCloseImageModal} maxWidth="sm" fullWidth>
        <DialogTitle>Driver Uploaded Image</DialogTitle>
        <DialogContent>
          {imageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <span>Loading...</span>
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
          {modalOrder && modalOrder.status === 'Picked' && (
            <Button onClick={handleMarkAsReceived} color="success" variant="contained">
              Mark as Received
            </Button>
          )}
          <Button onClick={handleCloseImageModal} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcurementOrderManagement;