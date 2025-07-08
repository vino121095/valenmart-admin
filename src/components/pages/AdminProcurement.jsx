import React, { useEffect, useState } from "react";
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
  Avatar,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  LocalShipping,
  ReceiptLong,
  Pageview,
  BrokenImage,
  Edit,
} from "@mui/icons-material";
import baseurl from "../ApiService/ApiService";
import { useNavigate } from "react-router-dom";

const AdminProcurement = ({
  data,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  orderDirection,
}) => {
  const navigate = useNavigate();
  const [imageModalOpen, setImageModalOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageLoading, setImageLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState(null);
  const [modalOrder, setModalOrder] = React.useState(null);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [multiEditOrder, setMultiEditOrder] = useState(null);
  const [multiEditAmounts, setMultiEditAmounts] = useState({});
  const [multiEditOpen, setMultiEditOpen] = useState(false);

  useEffect(() => {
    // Fetch all products for lookup
    fetch(`${baseurl}/api/product/all`)
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(() => setProducts([]));
  }, []);

  const adminHeaderCells = [
    { id: "id", label: "Order ID" },
    { id: "type", label: "Type", sortable: true },
    { id: "vendorname", label: "Vendor Name", sortable: true },
    { id: "product", label: "Product Image", sortable: true },
    { id: "items", label: "Items", sortable: true },
    { id: "price", label: "Price", sortable: true },
    { id: "requestdata", label: "Request Date", sortable: true },
    { id: "pickupdriver", label: "Pickup Driver", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "action", label: "Action" },
  ];

  const StatusChip = ({ status }) => {
    let color;
    switch (status) {
      case "Requested":
        color = "#FFC107";
        break;
      case "Comfirmed":
      case "Confirmed":
        color = "#4CAF50"; // Green for Confirmed
        break;
      case "Waiting for Approval":
        color = "#2196F3"; // Blue for Waiting for Approval
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

  const ProductImage = ({ imageUrl, itemName }) => {
    const [imgError, setImgError] = React.useState(false);

    const handleImageError = () => {
      setImgError(true);
    };

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {!imgError ? (
          <Avatar
            src={imageUrl}
            alt={itemName}
            variant="rounded"
            onError={handleImageError}
            sx={{ width: 40, height: 40, border: "1px solid #e0e0e0" }}
          />
        ) : (
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#f0f0f0",
              color: "#9e9e9e",
              border: "1px solid #e0e0e0",
            }}
          >
            <BrokenImage fontSize="small" />
          </Avatar>
        )}
        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
          {itemName}
        </Typography>
      </Box>
    );
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

  const handleAmountSave = async (id) => {
    // Find the original row
    const row = data.find(order => order.procurement_id === id);
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
    // Initialize prices for each product
    const priceMap = {};
    order.items.forEach(item => {
      priceMap[item.product_id] = item.unit_price;
    });
    setMultiEditAmounts(priceMap);
    setMultiEditOpen(true);
  };

  const handleMultiEditChange = (product_id, value) => {
    setMultiEditAmounts(prev => ({ ...prev, [product_id]: value }));
  };

  const handleMultiEditSave = async () => {
    if (!multiEditOrder) return;
    // Find the original row
    const row = data.find(order => order.procurement_id === multiEditOrder.procurement_id);
    let itemsArr = [];
    if (typeof row.items === 'string') {
      try { itemsArr = JSON.parse(row.items); } catch { itemsArr = []; }
    } else if (Array.isArray(row.items)) {
      itemsArr = [...row.items];
    }
    // Update unit_price for each item
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

  const ActionButtons = ({ status, orderId }) => {
    const order = data.find(o => o.procurement_id === orderId);
    const handleAssign = (id) => {
      const order = data.find(o => o.procurement_id === id);
      navigate(`/drivertask`, { state: { orderData: order } });
    };

    const handleReceive = (id) => {
      // console.log(`Receiving order ${id}`);
    };

    const handleView = (id) => {
      navigate(`/procurement-view/${id}`);
    };

    const handleConfirm = async (id) => {
      try {
        const response = await fetch(`${baseurl}/api/procurement/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Confirmed" }),
        });

        if (response.ok) {
          alert("Procurement status updated to Approved");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert("Failed to update: " + errorData.message);
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
        if (response.ok) {
          alert("Procurement status updated to Rejected");
          window.location.reload();
        } else {
          const errorData = await response.json();
          alert("Failed to update: " + errorData.message);
        }
      } catch (error) {
        console.error("Error rejecting procurement:", error);
        alert("Something went wrong.");
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
              onClick={() => handleConfirm(orderId)}
            >
              Confirm
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={() => handleReject(orderId)}>
              Reject
            </Button>
          </Stack>
        );
      case "Confirmed":
        return (
          <Button
            size="small"
            color="primary"
            variant="contained"
            startIcon={<LocalShipping fontSize="small" />}
            onClick={() => handleAssign(orderId)}
          >
            Assign
          </Button>
        );
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
              startIcon={<ReceiptLong fontSize="small" />}
              onClick={() => handleView(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              View
            </Button>
          </Stack>
        );
      case "Approved":
        return (
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
        );
      case "Picked":
        return (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="warning"
              variant="contained"
              startIcon={<ReceiptLong fontSize="small" />}
              onClick={() => handleReceive(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              View
            </Button>
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => handleViewImage(order)}
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
              color="warning"
              variant="contained"
              startIcon={<ReceiptLong fontSize="small" />}
              onClick={() => handleView(orderId)}
              sx={{ fontSize: "0.75rem", textTransform: "none" }}
            >
              View
            </Button>
          </Stack>
        );
      case "Rejected":
        return (
          <Button
            size="small"
            color="info"
            variant="outlined"
            startIcon={<Pageview fontSize="small" />}
            onClick={() => handleView(orderId)}
          >
            View
          </Button>
        );
      default:
        return null;
    }
  };

  const getSortIcon = (column) => {
    if (!orderDirection[column]) return null;
    return orderDirection[column] === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  let filteredData = data.filter((row) => row.type === "admin");
  // Parse items JSON string to array for each row
  filteredData = filteredData.map(row => ({
    ...row,
    items: typeof row.items === 'string' ? (() => { try { return JSON.parse(row.items); } catch { return []; } })() : row.items
  }));

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredData.length) : 0;

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        boxShadow: "none",
        border: "1px solid #e0e0e0",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 700 }} aria-label="admin procurement table">
          <TableHead>
            <TableRow>
              {adminHeaderCells.map((cell) => (
                <TableCell
                  key={cell.id}
                  align={cell.id === "action" ? "center" : "left"}
                  sx={{
                    backgroundColor: "#00B074",
                    cursor: cell.sortable ? "pointer" : "default",
                    color: "#fff",
                  }}
                  onClick={() => cell.sortable && onSort(cell.id)}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {cell.label}
                    {cell.sortable && (
                      <Box sx={{ ml: 0.5 }}>{getSortIcon(cell.id)}</Box>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow
                  hover
                  key={row.procurement_id}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.vendor_name || row.vendor?.contact_person}</TableCell>
                  <TableCell>
                    <ProductImage
                      imageUrl={
                        row.procurement_product_image
                          ? `${baseurl}${row.procurement_product_image}`
                          : `${baseurl}/procurement_product_image/${
                              row.items && row.items[0] && typeof (row.items[0].product_name || row.items[0].name) === 'string'
                                ? (row.items[0].product_name || row.items[0].name).toLowerCase().replace(/\s+/g, "-")
                                : 'default'
                            }.jpg`
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {row.items.map((item, index) => {
                      const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
                      return (
                        <Typography key={index} variant="body2" noWrap sx={{ maxWidth: 180 }}>
                          {product ? product.product_name || product.name : 'Product'}
                          {` (${item.quantity} 1/kg)`}
                        </Typography>
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    {row.status === "Requested" ? (
                      row.items.length === 1 ? (
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
                            <span>₹{row.items[0].unit_price}</span>
                            <Edit
                              fontSize="small"
                              sx={{ ml: 1, cursor: 'pointer', color: '#888' }}
                              onClick={() => {
                                setEditingId(row.procurement_id);
                                setEditAmount(row.items[0].unit_price);
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
                      row.items.length === 1 ? (
                        <span>₹{row.items[0].unit_price}</span>
                      ) : (
                        <Box>
                          {row.items.map((item, idx) => (
                            <Typography key={idx} variant="body2" noWrap sx={{ maxWidth: 180 }}>
                              ₹{item.unit_price}
                            </Typography>
                          ))}
                        </Box>
                      )
                    )}
                  </TableCell>
                  <TableCell>{row.order_date}</TableCell>
                  <TableCell> {row.driver
                          ? `${row.driver.first_name || ""} ${row.driver.last_name || ""}`.trim()
                          : "N/A"}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell align="center">
                    <ActionButtons
                      status={row.status}
                      orderId={row.procurement_id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={10} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
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
      <Dialog open={multiEditOpen} onClose={() => setMultiEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product Prices</DialogTitle>
        <DialogContent>
          {multiEditOrder && multiEditOrder.items.map((item, idx) => {
            const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
            return (
              <Box key={item.product_id} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {product ? product.product_name || product.name : 'Product'} ({item.quantity} 1/kg)
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
    </Paper>
  );
};

export default AdminProcurement;