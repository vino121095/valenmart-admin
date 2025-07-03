import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Select, MenuItem, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Pagination, FormControl, InputLabel,
  Card, CardContent, Grid, Stack, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  Online: '#D1FAE5',
  Offline: '#E5E7EB'
};

export default function DriverLog() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [driverData, setDriverData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({ online: 0, offline: 0 });

  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchDriverLogs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/driver-log/all');
        const result = await res.json();
        const logs = result.data || [];

        setDriverData(logs);

        const today = new Date().toISOString().split('T')[0];
        const online = logs.filter(log => {
          const loginDate = log.login_time ? new Date(log.login_time).toISOString().split('T')[0] : null;
          return log.login_time && !log.logout_time && loginDate === today;
        }).length;

        const offline = logs.length - online;
        setSummaryStats({ online, offline });
      } catch (error) {
        console.error('Failed to fetch driver logs:', error);
      }
    };

    fetchDriverLogs();
  }, []);

  const handleFilterReset = () => {
    setStatusFilter('All');
    setNameFilter('');
    setDateFilter('');
  };

  const exportCSV = () => {
    if (!selectedLog) return;

    const csvHeader = "Driver Name,Date,Login Time,Logout Time,Duration\n";
    const driverName = `${selectedLog.driver?.first_name || ''} ${selectedLog.driver?.last_name || ''}`;
    const date = new Date(selectedLog.log_date).toLocaleDateString('en-GB');
    const login = selectedLog.login_time
      ? new Date(selectedLog.login_time).toLocaleTimeString('en-IN')
      : 'N/A';
    const logout = selectedLog.logout_time
      ? new Date(selectedLog.logout_time).toLocaleTimeString('en-IN')
      : 'N/A';

    const duration = selectedLog.login_time && selectedLog.logout_time ? (() => {
      const loginTime = new Date(selectedLog.login_time);
      const logoutTime = new Date(selectedLog.logout_time);
      const diff = logoutTime - loginTime;
      if (diff <= 0) return 'Invalid';
      const seconds = Math.floor(diff / 1000);
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    })() : '—';

    const csvRow = `${driverName},${date},${login},${logout},${duration}`;
    const blob = new Blob([csvHeader + csvRow], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${driverName}-${date}-log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueDriverNames = [
    ...new Set(driverData.map(log =>
      log.driver ? `${log.driver.first_name} ${log.driver.last_name}` : 'Unknown'
    ))
  ];

  const filteredData = driverData.filter(log => {
    const loginDate = log.login_time ? new Date(log.login_time).toISOString().split('T')[0] : null;
    const today = new Date().toISOString().split('T')[0];
    const status = log.login_time && !log.logout_time && loginDate === today ? 'Online' : 'Offline';

    const driverName = log.driver ? `${log.driver.first_name} ${log.driver.last_name}` : 'Unknown';
    const matchesName = nameFilter === '' || driverName === nameFilter;
    const matchesDate = dateFilter === '' || new Date(log.log_date).toISOString().split('T')[0] === dateFilter;
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesStatus && matchesName && matchesDate;
  });

  return (
    <Box p={4} bgcolor="#f4f4f6">
      {/* <Typography variant="body2" color="green">Dashboard &gt; Driver & Delivery Management</Typography> */}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography variant="h5" fontWeight="bold" mt={1} mb={3}>Driver Login Logs</Typography>
        <Button variant="contained" color="success" onClick={() => navigate('/driveradd')}>Add Driver</Button>
      </Box>

      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="outlined" onClick={() => navigate('/delivery')}>Driver Accounts</Button>
        <Button variant="outlined" onClick={() => navigate('/drivertask')}>Assign Tasks</Button>
        <Button variant="outlined" onClick={() => navigate('/drivertrack')}>Live Tracking</Button>
        <Button variant="contained" onClick={() => navigate('/driverlog')}>Driver Logs</Button>
      </Stack>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2">Online Drivers</Typography>
              <Typography variant="h4">{summaryStats.online}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ bgcolor: '#f9fef5' }}>
            <CardContent>
              <Typography variant="body2">Offline Drivers</Typography>
              <Typography variant="h4">{summaryStats.offline}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* FILTER SECTION */}
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
            <MenuItem value="Offline">Offline</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Driver Name</InputLabel>
          <Select
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            label="Driver Name"
          >
            <MenuItem value="">All</MenuItem>
            {uniqueDriverNames.map((name, idx) => (
              <MenuItem key={idx} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="date"
          label="Log Date"
          InputLabelProps={{ shrink: true }}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />

        <Button variant="contained" color="success">Apply</Button>
        <Button variant="outlined" onClick={handleFilterReset}>Reset</Button>
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#10B981' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>Driver Name</TableCell>
              <TableCell sx={{ color: 'white' }}>Date</TableCell>
              <TableCell sx={{ color: 'white' }}>Login Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Logout Time</TableCell>
              <TableCell sx={{ color: 'white' }}>Duration</TableCell>
              <TableCell sx={{ color: 'white' }}>Status</TableCell>
              <TableCell sx={{ color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((log, index) => {
              const driverName = log.driver
                ? `${log.driver.first_name} ${log.driver.last_name}`
                : 'Unknown';
              const loginTime = log.login_time
                ? new Date(log.login_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
                : 'N/A';
              const logoutTime = log.logout_time
                ? new Date(log.logout_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })
                : 'N/A';
              const duration = log.login_time && log.logout_time ? (() => {
                const login = new Date(log.login_time);
                const logout = new Date(log.logout_time);
                const diffMs = logout - login;
                if (diffMs <= 0) return 'Invalid';
                const diffSeconds = Math.floor(diffMs / 1000);
                const hours = Math.floor(diffSeconds / 3600);
                const minutes = Math.floor((diffSeconds % 3600) / 60);
                const seconds = diffSeconds % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              })() : '—';
              const loginDate = log.login_time ? new Date(log.login_time).toISOString().split('T')[0] : null;
              const today = new Date().toISOString().split('T')[0];
              const status = log.login_time && !log.logout_time && loginDate === today ? 'Online' : 'Offline';

              return (
                <TableRow key={index}>
                  <TableCell>{driverName}</TableCell>
                  <TableCell>{new Date(log.log_date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell>{loginTime}</TableCell>
                  <TableCell>{logoutTime}</TableCell>
                  <TableCell>{duration}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: statusColors[status],
                        px: 2,
                        py: 0.5,
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSelectedLog(log);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Typography variant="body2">Showing {filteredData.length} of {driverData.length} Entries</Typography>
        <Pagination count={1} page={1} variant="outlined" shape="rounded" />
      </Box>

      {/* DETAILS DIALOG */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Driver Login Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <>
              <Typography variant="subtitle1" mb={1}>
                <strong>Driver:</strong> {selectedLog.driver?.first_name} {selectedLog.driver?.last_name}
              </Typography>
              <Typography variant="subtitle2" mb={2}>
                <strong>Date:</strong> {new Date(selectedLog.log_date).toLocaleDateString('en-GB')}
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Login Time</TableCell>
                    <TableCell>Logout Time</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{selectedLog.login_time ? new Date(selectedLog.login_time).toLocaleTimeString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>{selectedLog.logout_time ? new Date(selectedLog.logout_time).toLocaleTimeString('en-IN') : 'N/A'}</TableCell>
                    <TableCell>{selectedLog.login_time && selectedLog.logout_time ? (() => {
                      const login = new Date(selectedLog.login_time);
                      const logout = new Date(selectedLog.logout_time);
                      const diffMs = logout - login;
                      if (diffMs <= 0) return 'Invalid';
                      const diffSeconds = Math.floor(diffMs / 1000);
                      const h = Math.floor(diffSeconds / 3600).toString().padStart(2, '0');
                      const m = Math.floor((diffSeconds % 3600) / 60).toString().padStart(2, '0');
                      const s = (diffSeconds % 60).toString().padStart(2, '0');
                      return `${h}:${m}:${s}`;
                    })() : '—'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={exportCSV} variant="outlined">Export CSV</Button>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="contained" color="success">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
