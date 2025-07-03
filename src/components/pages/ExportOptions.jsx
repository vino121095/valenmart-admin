import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';

const ExportOptions = ({ reportName, exportData }) => {
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [fileName, setFileName] = useState(`${reportName}_${new Date().toISOString().split('T')[0]}`);

  const handleDateRangeChange = (event) => {
    const selectedRange = event.target.value;
    setDateRange(selectedRange);
    
    const currentDate = new Date();
    
    if (selectedRange === 'week') {
      // Set date to beginning of current week (Sunday)
      const firstDay = new Date(currentDate);
      const day = currentDate.getDay();
      firstDay.setDate(currentDate.getDate() - day);
      setStartDate(firstDay);
      
      // End of week (Saturday)
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      setEndDate(lastDay);
    } 
    else if (selectedRange === 'month') {
      // Beginning of current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      setStartDate(firstDay);
      
      // End of current month
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      setEndDate(lastDay);
    }
    else if (selectedRange === 'quarter') {
      // Calculate current quarter
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      
      // Start of quarter
      const firstDay = new Date(currentDate.getFullYear(), currentQuarter * 3, 1);
      setStartDate(firstDay);
      
      // End of quarter
      const lastDay = new Date(currentDate.getFullYear(), (currentQuarter + 1) * 3, 0);
      setEndDate(lastDay);
    }
    else if (selectedRange === 'year') {
      // Beginning of year
      const firstDay = new Date(currentDate.getFullYear(), 0, 1);
      setStartDate(firstDay);
      
      // End of year
      const lastDay = new Date(currentDate.getFullYear(), 11, 31);
      setEndDate(lastDay);
    }
  };

  const handleExportClick = () => {
    setShowExportDialog(true);
  };

  const handleCloseDialog = () => {
    setShowExportDialog(false);
  };

  const handleExport = () => {
    // Filter data based on date range if needed
    const filteredData = exportData();
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportName);
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    handleCloseDialog();
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'stretch', sm: 'center' }}
        sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', minWidth: 120 }}>
          Export Options:
        </Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="date-range-label">Date Range</InputLabel>
          <Select
            labelId="date-range-label"
            id="date-range-select"
            value={dateRange}
            label="Date Range"
            onChange={handleDateRangeChange}
            size="small"
          >
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
            <MenuItem value="quarter">Quarterly</MenuItem>
            <MenuItem value="year">Yearly</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>
        
        {dateRange === 'custom' && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField size="small" {...params} />}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField size="small" {...params} />}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
          </LocalizationProvider>
        )}
        
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportClick}
          sx={{ ml: { sm: 'auto' } }}
        >
          Export to Excel
        </Button>
      </Stack>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={handleCloseDialog}>
        <DialogTitle>Export to Excel</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Exporting {reportName} data from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <TextField
              autoFocus
              margin="dense"
              id="fileName"
              label="File Name"
              type="text"
              fullWidth
              variant="outlined"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleExport}>Export</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExportOptions;