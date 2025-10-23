import React, { useState, useEffect } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box
} from '@mui/material';
import { useParams } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

const DriverDetails = () => {
  const { id: driverId } = useParams();
  const [completedTodayList, setCompletedTodayList] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deliveries
        const deliveryResponse = await fetch(baseurl + '/api/delivery/all');
        if (!deliveryResponse.ok) {
          throw new Error('Failed to fetch deliveries');
        }
        const deliveryData = await deliveryResponse.json();
        
        // Fetch driver info if driverId is provided
        if (driverId) {
          const driverResponse = await fetch(baseurl + '/api/driver-details/all');
          if (driverResponse.ok) {
            const driverData = await driverResponse.json();
            const driver = driverData.data?.find(d => d.did === parseInt(driverId));
            setDriverInfo(driver);
          }
        }
        
        // Filter for today's completed deliveries
        const today = new Date().toISOString().split('T')[0];
        let todayCompleted = deliveryData.filter(delivery => 
          delivery.date === today && delivery.status === 'Completed'
        );
        
        // If driverId is provided, filter for specific driver
        if (driverId) {
          todayCompleted = todayCompleted.filter(delivery => 
            delivery.driver?.did === parseInt(driverId)
          );
        }
        
        setCompletedTodayList(todayCompleted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [driverId]);

  // Calculate total charges
  const totalCharges = completedTodayList.reduce((sum, delivery) => {
    return sum + (parseFloat(delivery.charges) || 0);
  }, 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="h6" align="center" mt={4}>
        Error: {error}
      </Typography>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        {driverInfo ? `${driverInfo.first_name} ${driverInfo.last_name}'s` : 'Today\'s'} Completed Deliveries
      </Typography>
      {driverInfo && (
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Vehicle: {driverInfo.vehicle_number} | Status: {driverInfo.status}
        </Typography>
      )}
      
      {completedTodayList.length === 0 ? (
        <Typography variant="body1" mt={2}>
          No completed deliveries for today.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#00A67E' }}>
                <TableCell sx={{ color: 'white' }}><strong>Driver</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Delivery ID</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Time Slot</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Type</strong></TableCell>
                <TableCell sx={{ color: 'white' }}><strong>Charges (₹)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {completedTodayList.map((delivery) => (
                <TableRow key={delivery.id} hover>
                  <TableCell>
                    {delivery.driver ? `${delivery.driver.first_name} ${delivery.driver.last_name}` : 'N/A'}
                    <br />
                    <small>{delivery.driver?.vehicle_number}</small>
                  </TableCell>
                  <TableCell>{delivery.deliveryNo}</TableCell>
                  <TableCell>{delivery.timeSlot}</TableCell>
                  <TableCell>{delivery.type}</TableCell>
                  <TableCell>₹{delivery.charges}</TableCell>
                </TableRow>
              ))}
              {/* Total charges row */}
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell colSpan={4} align="right">
                  <strong>Total Charges:</strong>
                </TableCell>
                <TableCell>
                  <strong>₹{totalCharges.toFixed(2)}</strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default DriverDetails;