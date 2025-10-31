import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  Button,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { 
  NavigateNext as NavigateNextIcon,
  FileDownload as FileDownloadIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import CustomerOrder from './CustomerOrder';
import ProcurementOrderManagement from './ProcurementOrderManagement';
import ProductManagement from './ProductManagement';
import Vendors from './Vendors';    
import Customer from './Customer';
import * as XLSX from 'xlsx';

const ReportAnalysis = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDateDialog = () => {
    setAnchorEl(null);
    setOpenDateDialog(true);
  };

  const handleCloseDateDialog = () => {
    setOpenDateDialog(false);
  };

  // Generate data based on the active tab and date range
  const getReportData = (dateRange) => {
    // This function would retrieve the actual data from your components
    // For example, you might have a method in each component to get the data
    let data = [];
    let fileName = '';
    
    switch (activeTab) {
      case 0:
        // Get Customer Order data
        // This would be implemented in your CustomerOrder component
        // For now, I'll create a sample data structure
        data = [
          { id: 1, customer: 'ABC Corp', product: 'Widget', quantity: 100, orderDate: '2025-05-15', status: 'Completed' },
          { id: 2, customer: 'XYZ Inc', product: 'Gadget', quantity: 50, orderDate: '2025-05-16', status: 'Processing' }
        ];
        fileName = 'Customer_Order_Report';
        break;
      case 1:
        // Get Procurement Order data
        data = [
          { id: 101, vendor: 'Supplier A', material: 'Raw Material X', quantity: 500, orderDate: '2025-05-10', status: 'Delivered' },
          { id: 102, vendor: 'Supplier B', material: 'Raw Material Y', quantity: 300, orderDate: '2025-05-12', status: 'In Transit' }
        ];
        fileName = 'Procurement_Order_Report';
        break;
      case 2:
        // Get Product Management data
        data = [
          { id: 201, name: 'Product A', category: 'Electronics', stock: 150, price: 299.99, lastUpdated: '2025-05-14' },
          { id: 202, name: 'Product B', category: 'Furniture', stock: 75, price: 499.99, lastUpdated: '2025-05-13' }
        ];
        fileName = 'Product_Management_Report';
        break;
      case 3:
        // Get Vendor data
        data = [
          { id: 301, name: 'Vendor X', contact: 'John Doe', email: 'john@vendorx.com', phone: '555-1234', rating: 4.8 },
          { id: 302, name: 'Vendor Y', contact: 'Jane Smith', email: 'jane@vendory.com', phone: '555-5678', rating: 4.5 }
        ];
        fileName = 'Vendor_Report';
        break;
      case 4:
        // Get Customer data
        data = [
          { id: 401, name: 'Customer 1', contact: 'Alice Johnson', email: 'alice@example.com', phone: '555-9876', totalOrders: 12 },
          { id: 402, name: 'Customer 2', contact: 'Bob Wilson', email: 'bob@example.com', phone: '555-5432', totalOrders: 8 }
        ];
        fileName = 'Customer_Management_Report';
        break;
      default:
        break;
    }

    // Include date range in filename
    fileName += `_${dateRange}`;
    
    return { data, fileName };
  };

  // Export data to Excel
  const exportToExcel = (dateRange) => {
    const { data, fileName } = getReportData(dateRange);
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    handleMenuClose();
  };

  // Export weekly data
  const exportWeekly = () => {
    // Get current date
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const formattedStartDate = oneWeekAgo.toISOString().split('T')[0];
    const formattedEndDate = today.toISOString().split('T')[0];
    const dateRange = `Weekly_${formattedStartDate}_to_${formattedEndDate}`;
    
    exportToExcel(dateRange);
  };

  // Export monthly data
  const exportMonthly = () => {
    // Get current date
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const formattedStartDate = firstDayOfMonth.toISOString().split('T')[0];
    const formattedEndDate = today.toISOString().split('T')[0];
    const dateRange = `Monthly_${formattedStartDate}_to_${formattedEndDate}`;
    
    exportToExcel(dateRange);
  };

  // Export custom date range data
  const exportCustomDateRange = () => {
    if (startDate && endDate) {
      const dateRange = `Custom_${startDate}_to_${endDate}`;
      exportToExcel(dateRange);
      handleCloseDateDialog();
    }
  };

  const getTabName = () => {
    const tabNames = [
      "Customer Order",
      "Procurement Order",
      "Product Management",
      "Vendor",
      "Customer Management"
    ];
    return tabNames[activeTab] || "Report";
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
          Report Analysis
        </Typography>
      </Breadcrumbs>

      {/* Page Title with Export Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 'bold'
          }}
        >
          Report Analysis
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
          sx={{
            textTransform: 'none'
          }}
        >
          Export {getTabName()} Report
        </Button>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={exportWeekly}>Export Weekly Report</MenuItem>
          <MenuItem onClick={exportMonthly}>Export Monthly Report</MenuItem>
          <MenuItem onClick={handleOpenDateDialog}>Custom Date Range...</MenuItem>
        </Menu>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              py: 2
            },
            '& .Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 'bold',
              backgroundColor: `${theme.palette.primary.main}10`
            }
          }}
        >
          <Tab label="Customer Order Report" />
          <Tab label="Procurement Order Report" />
          <Tab label="Product Management" />
          <Tab label="Vendor Report" />
          <Tab label="Customer Management" />
        </Tabs>
      </Paper>

      {/* Content based on active tab */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 ? (
          <CustomerOrder reportMode={true} />
        ) : activeTab === 1 ? (
          <ProcurementOrderManagement reportMode={true} />
        ) : activeTab === 2 ? (
          <ProductManagement reportMode={true} />
        ) : activeTab === 3 ? (
          <Vendors reportMode={true} />
        ) : (
          <Customer reportMode={true} />
        )}
      </Box>

      {/* Custom Date Range Dialog */}
      <Dialog open={openDateDialog} onClose={handleCloseDateDialog}>
        <DialogTitle>Export Custom Date Range</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: '300px' }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDateDialog}>Cancel</Button>
          <Button 
            onClick={exportCustomDateRange} 
            variant="contained" 
            disabled={!startDate || !endDate}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportAnalysis;