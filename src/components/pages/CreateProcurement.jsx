import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Breadcrumbs,
    Link,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    InputAdornment,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    NavigateNext as NavigateNextIcon,
    CalendarToday,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import baseurl from '../ApiService/ApiService';

const CreateProcurement = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // API-driven state
    const [vendors, setVendors] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        // Fetch vendors
        fetch(baseurl + '/api/vendor/all')
            .then(res => res.json())
            .then(data => setVendors(data.data || []))
            .catch(() => setVendors([]));
        // Fetch products
        fetch(baseurl + '/api/product/all')
            .then(res => res.json())
            .then(data => setProducts(data.data || []))
            .catch(() => setProducts([]));
        // Fetch categories
        fetch(baseurl + '/api/category/all')
            .then(res => res.json())
            .then(data => {
                setCategories(data.data || []);
                setCategoriesLoading(false);
            })
            .catch(() => {
                setCategories([]);
                setCategoriesLoading(false);
                setCategoriesError('Failed to load categories');
            });
    }, []);

    const [orderDate] = useState(new Date().toISOString().slice(0, 10));
    const [expectedDate, setExpectedDate] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [productList, setProductList] = useState([
        { productId: '', quantity: 0, unitPrice: 0 }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [unit, setUnit] = useState('');
    const [notes, setNotes] = useState('');
    const [cgst, setCgst] = useState('');
    const [sgst, setSgst] = useState('');
    const [type, setType] = useState('admin');
    const [image, setImage] = useState(null);

    const handleVendorChange = (e) => {
        const vendorId = e.target.value;
        setSelectedVendor(vendorId);
        const vendor = vendors.find(v => v.vendor_id === vendorId || v.id === vendorId || v.vid === vendorId);
        setContactNumber(vendor?.phone || vendor?.contact || vendor?.contact_number || '');
    };

    const handleProductChange = (index, key, value) => {
        const updatedList = [...productList];
        updatedList[index][key] = value;

        if (key === 'productId') {
            const product = products.find(p => p.id === value || p.pid === value);
            updatedList[index].unitPrice = product?.price || product?.unit_price || 0;
            updatedList[index].unit = product?.unit || '';
        }

        setProductList(updatedList);
    };

    const handleAddProduct = () => {
        setProductList([...productList, { productId: '', quantity: 0, unitPrice: 0 }]);
    };

    const handleRemoveProduct = (index) => {
        const updatedList = productList.filter((_, i) => i !== index);
        setProductList(updatedList);
    };

    const getTotal = (quantity, unitPrice) => quantity * unitPrice;

    const getTotalAmount = () =>
        productList.reduce((sum, item) => sum + getTotal(item.quantity, item.unitPrice), 0);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const selectedVendorObj = vendors.find(
                v => v.vendor_id === selectedVendor || v.id === selectedVendor || v.vid === selectedVendor
            );
            const vendorName = selectedVendorObj?.contact_person || '';

            const formData = new FormData();
            formData.append('order_date', orderDate);
            formData.append('expected_delivery_date', expectedDate);
            formData.append('vendor_id', selectedVendor);
            formData.append('contact_number', contactNumber);
            formData.append('items', JSON.stringify(productList.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice
            }))));
            formData.append('price', getTotalAmount());
            formData.append('type', type);
            formData.append('status', 'Requested');
            formData.append('category', category);
            formData.append('unit', productList[0]?.unit || '');
            formData.append('notes', notes || '-');
            formData.append('cgst', cgst || 0);
            formData.append('sgst', sgst || 0);
            if (image) {
                formData.append('procurement_product_image', image);
            }
            if (type === 'admin') {
                formData.append('vendor_name', vendorName);
            }

            const response = await fetch(baseurl + '/api/procurement/create', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create procurement order');
            }
            
            setSuccess('Procurement order created successfully!');
            // Reset form
            setExpectedDate('');
            setSelectedVendor('');
            setContactNumber('');
            setProductList([{ productId: '', quantity: 0, unitPrice: 0 }]);
            setCategory('');
            setNotes('');
            setCgst('');
            setSgst('');
            setType('admin');
            setImage(null);
        } catch (err) {
            setError(err.message || 'Failed to create procurement order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
                <Link underline="hover" href="/">Dashboard</Link>
                <Link underline="hover" href="/procurement">Procurement Order Management</Link>
                <Typography color="text.primary">Create Procurement</Typography>
            </Breadcrumbs>

            {/* Page Title */}
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Create New Procurement Order
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {/* Order Information */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Order Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <TextField label="Order ID" value="Auto-generated" disabled fullWidth sx={{ maxWidth: 250 }} />
                    <TextField label="Order Date" value={orderDate} disabled fullWidth sx={{ maxWidth: 250 }} />
                    <TextField
                        label="Expected Delivery Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={expectedDate}
                        onChange={(e) => setExpectedDate(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                    />
                </Box>

                {/* Vendor Info */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Vendor Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <TextField
                        label="Select Vendor"
                        select
                        value={selectedVendor}
                        onChange={handleVendorChange}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                    >
                        {vendors.map((vendor) => (
                            <MenuItem key={vendor.vendor_id || vendor.id || vendor.vid} value={vendor.vendor_id || vendor.id || vendor.vid}>
                                {vendor.contact_person} {vendor.phone ? `(${vendor.phone})` : ''}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Contact Number"
                        value={contactNumber}
                        disabled
                        fullWidth
                        sx={{ maxWidth: 250 }}
                    />
                </Box>

                {/* Additional Information */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Additional Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                    <TextField
                        label="Category"
                        select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                        disabled={categoriesLoading}
                        error={!!categoriesError}
                        helperText={categoriesError}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id || cat.cid} value={cat.name || cat.category_name}>
                                {cat.name || cat.category_name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Notes"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 250 }}
                    />
                    <TextField
                        label="CGST (%)"
                        type="number"
                        value={cgst}
                        onChange={e => setCgst(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 150 }}
                    />
                    <TextField
                        label="SGST (%)"
                        type="number"
                        value={sgst}
                        onChange={e => setSgst(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 150 }}
                    />
                    <TextField
                        label="Type"
                        select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        fullWidth
                        sx={{ maxWidth: 150 }}
                    >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="vendor">Vendor</MenuItem>
                    </TextField>
                    <Button
                        variant="outlined"
                        component="label"
                        sx={{ maxWidth: 200 }}
                    >
                        Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                        />
                    </Button>
                    {image && (
                        <Typography variant="body2" sx={{ ml: 1 }}>
                            {image.name}
                        </Typography>
                    )}
                </Box>

                {/* Products Table */}
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Products
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Unit Price (₹)</TableCell>
                            <TableCell>Total (₹)</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productList.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        select
                                        value={item.productId}
                                        onChange={(e) =>
                                            handleProductChange(index, 'productId', Number(e.target.value))
                                        }
                                        fullWidth
                                    >
                                        {products.map((p) => (
                                            <MenuItem key={p.id || p.pid} value={p.id || p.pid}>
                                                {p.name || p.product_name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleProductChange(index, 'quantity', Number(e.target.value))
                                        }
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField value={item.unitPrice} disabled fullWidth />
                                </TableCell>
                                <TableCell>
                                    ₹{getTotal(item.quantity, item.unitPrice).toFixed(2)}
                                    {item.unit && (
                                        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                                            {item.unit}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleRemoveProduct(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Button variant="outlined" onClick={handleAddProduct} sx={{ mt: 2 }}>
                    + Add Product
                </Button>

                {/* Total Amount */}
                <Box mt={3} display="flex" justifyContent="flex-end">
                    <Typography fontWeight="bold">
                        Total Amount: ₹{getTotalAmount().toFixed(2)}
                    </Typography>
                </Box>

                {/* Action Buttons */}
                <Box mt={4} display="flex" gap={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="warning"
                        disabled={loading}
                    >
                        Save as Draft
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || !selectedVendor || !expectedDate || productList.some(item => !item.productId || item.quantity <= 0)}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default CreateProcurement;
