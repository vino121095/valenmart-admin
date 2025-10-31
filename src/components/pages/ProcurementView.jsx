import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Button,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

const GreenHeader = styled(Paper)(({ theme }) => ({
  backgroundColor: '#10B981',
  padding: theme.spacing(2),
  color: 'white',
  borderRadius: '4px 4px 0 0',
  marginBottom: 0
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '0 0 4px 4px',
  marginBottom: theme.spacing(3)
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  margin: theme.spacing(1, 0),
  alignItems: 'center', // Ensure vertical alignment
  '& > :first-of-type': {
    fontWeight: 'bold',
    marginRight: theme.spacing(1),
    minWidth: '180px', // Add a fixed width for labels to accommodate longer text
    flexShrink: 0, // Prevent the label from shrinking
  },
  '& > :last-child': {
    flex: 1, // Allow the value to take up remaining space
    display: 'flex',
    alignItems: 'center' // Ensure vertical alignment for values
  }
}));

const ProcurementView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [procurement, setProcurement] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchProcurementData(id);
      fetchProducts();
    } else {
      setError('Procurement ID not found');
      setLoading(false);
    }
  }, [id]);

  const fetchProcurementData = async (pid) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseurl}/api/procurement/${pid}`);
      if (!response.ok) throw new Error('Error fetching procurement');
      const data = await response.json();
      if (data && data.data) {
        setProcurement(Array.isArray(data.data) ? data.data[0] : data.data);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseurl}/api/product/all`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch {
      setProducts([]);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Add parser for custom items string
  function parseItemsString(itemsString) {
    if (!itemsString) return [];
    const itemStrings = itemsString.split(/\),\s*/).map(s => s.endsWith(')') ? s : s + ')');
    return itemStrings.map(itemStr => {
      const nameMatch = itemStr.match(/^(.+?)\s*\(/);
      const qtyMatch = itemStr.match(/\(([^k]+)kg/);
      const priceMatch = itemStr.match(/@\s*₹([\d.]+)\/kg/);
      const typeMatch = itemStr.match(/Type:\s*([^)]+)/);
      return {
        name: nameMatch ? nameMatch[1].trim() : '',
        quantity: qtyMatch ? qtyMatch[1].trim() : '',
        unit: 'kg',
        unit_price: priceMatch ? priceMatch[1].trim() : '',
        type: typeMatch ? typeMatch[1].trim() : '',
      };
    });
  }

  // Parse items array
  let items = [];
  if (procurement && procurement.items) {
    if (typeof procurement.items === 'string' && procurement.items.trim().startsWith('[')) {
      try { items = JSON.parse(procurement.items); } catch { items = []; }
    } else if (typeof procurement.items === 'string') {
      items = parseItemsString(procurement.items);
    } else if (Array.isArray(procurement.items)) {
      items = procurement.items;
    }
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Procurement Orders
        </Button>
      </Container>
    );
  }

  if (!procurement) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">Procurement not found</Typography>
        <Button variant="contained" onClick={handleBack} sx={{ mt: 2 }}>
          Back to Procurement Orders
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pl: 0, width: '100%' }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover" sx={{ color: '#10B981' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/procurement" underline="hover" sx={{ color: '#10B981' }}>
          Admin Procurement
        </Link>
        <Typography color="textPrimary">View Procurement</Typography>
      </Breadcrumbs>

      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        View Procurement
      </Typography>

      <Box sx={{ mb: 4 }}>
        <GreenHeader elevation={0}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Procurement Information</Typography>
        </GreenHeader>
        <StyledPaper elevation={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoRow>
                <Typography>Procurement ID :</Typography>
                <Typography>{procurement.procurement_id}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Vendor :</Typography>
                <Typography>{procurement.vendor_name || procurement.vendor?.contact_person}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Amount :</Typography>
                <Typography>₹{procurement.price}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Pickup Driver :</Typography>
                <Typography>
                  {procurement.driver
                    ? `${procurement.driver.first_name || ''} ${procurement.driver.last_name || ''}`.trim() || procurement.driver.name || procurement.driver.username
                    : 'N/A'}
                </Typography>
              </InfoRow>
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoRow>
                <Typography>Order Date :</Typography>
                <Typography>{procurement.order_date}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Expected Delivery Date :</Typography>
                <Typography>{procurement.expected_delivery_date}</Typography>
              </InfoRow>
              <InfoRow>
                <Typography>Status :</Typography>
                <Grid item xs={6} display="flex" justifyContent="flex-start">
                <Chip
                  label={procurement.status}
                  size="small"
                  sx={{
                    bgcolor: getStatusChipColor(procurement.status).bg,
                    color: getStatusChipColor(procurement.status).color,
                    borderRadius: '16px',
                    fontWeight: "bold"
                  }}
                />
                </Grid>
              </InfoRow>
            </Grid>
          </Grid>
        </StyledPaper>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GreenHeader elevation={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Vendor Information</Typography>
          </GreenHeader>
          <StyledPaper elevation={1}>
            <InfoRow>
              <Typography>Vendor Name :</Typography>
              <Typography>{procurement.vendor_name || procurement.vendor?.contact_person}</Typography>
            </InfoRow>
            <InfoRow>
              <Typography>Contact No. :</Typography>
              <Typography>{procurement.vendor?.phone || procurement.vendor?.contact || procurement.contact_number || 'N/A'}</Typography>
            </InfoRow>
            <InfoRow>
              <Typography>Category :</Typography>
              <Typography>{procurement.category}</Typography>
            </InfoRow>
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <GreenHeader elevation={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Other Information</Typography>
          </GreenHeader>
          <StyledPaper elevation={1}>
            <InfoRow>
              <Typography>Notes :</Typography>
              <Typography>{procurement.notes}</Typography>
            </InfoRow>
            <InfoRow>
              <Typography>CGST :</Typography>
              <Typography>{procurement.cgst}%</Typography>
            </InfoRow>
            <InfoRow>
              <Typography>SGST :</Typography>
              <Typography>{procurement.sgst}%</Typography>
            </InfoRow>
          </StyledPaper>
        </Grid>
      </Grid>

      {/* Items Section */}
      {items.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <GreenHeader elevation={0}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Procurement Items</Typography>
          </GreenHeader>
          <StyledPaper elevation={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => {
                    // If item has name, quantity, unit_price (from parsed string)
                    if (item.name && item.quantity && item.unit_price) {
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography>{item.name}</Typography>
                            {item.type && <Typography variant="caption" color="text.secondary">{item.type}</Typography>}
                          </TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          <TableCell>₹{item.unit_price}</TableCell>
                          <TableCell>₹{(parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2)}</TableCell>
                        </TableRow>
                      );
                    }

                    // For array items that need to look up the product
                    const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
                    const productName = product ? product.product_name || product.name : 'Unknown Product';

                    return (
                      <TableRow key={index}>
                        <TableCell>{productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.unit_price}</TableCell>
                        <TableCell>₹{(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          sx={{
            mr: 2,
            bgcolor: '#10B981',
            '&:hover': { bgcolor: '#059669' },
            fontWeight: 'bold'
          }}
          onClick={() => navigate(`/vendor-invoice-view/${procurement.procurement_id}`)}
        >
          View Invoice
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#D1D5DB',
            color: '#000',
            '&:hover': { bgcolor: '#9CA3AF' },
            fontWeight: 'bold'
          }}
          onClick={handleBack}
        >
          Back
        </Button>
      </Box>
    </Box>
  );
};

// Helper function to get chip colors based on status
const getStatusChipColor = (status) => {
  switch (status) {
    case 'Requested':
      return { bg: '#FFF4CC', color: '#FFC107' };
    case 'Confirmed':
      return { bg: '#DCFCE7', color: '#4CAF50' };
    case 'Approved':
      return { bg: '#E8F5E9', color: '#388E3C' };
    case 'Picked':
      return { bg: '#DBEAFE', color: '#2196F3' };
    case 'Received':
      return { bg: '#F3E8FF', color: '#9333EA' };
    case 'Rejected':
      return { bg: '#FEE2E2', color: '#F44336' };
    default:
      return { bg: '#F3F4F6', color: '#757575' };
  }
};

export default ProcurementView;