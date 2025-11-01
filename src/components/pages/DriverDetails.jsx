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
  Box,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import baseurl from '../ApiService/ApiService';

const DriverDetails = () => {
  const { id: driverId } = useParams();
  const navigate = useNavigate();
  const [completedTodayList, setCompletedTodayList] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const deliveryResponse = await fetch(baseurl + '/api/delivery/all');
        if (!deliveryResponse.ok) throw new Error('Failed to fetch deliveries');
        const deliveryData = await deliveryResponse.json();

        // Fetch driver info
        if (driverId) {
          const driverResponse = await fetch(baseurl + '/api/driver-details/all');
          if (driverResponse.ok) {
            const driverData = await driverResponse.json();
            const driver = driverData.data?.find(d => d.did === parseInt(driverId));
            setDriverInfo(driver);
          }
        }

        const today = new Date().toISOString().split('T')[0];
        let todayCompleted = deliveryData.filter(
          delivery => delivery.date === today && delivery.status === 'Completed'
        );

        if (driverId) {
          todayCompleted = todayCompleted.filter(
            delivery => delivery.driver?.did === parseInt(driverId)
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
    <div>
      {/* ✅ Breadcrumbs Section */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="#00A67E" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          Dashboard
        </Link>
        <Link underline="hover" color="#00A67E" sx={{ cursor: 'pointer' }} onClick={() => navigate('/delivery')}>
          Driver Management
        </Link>
        <Typography color="text.primary">
          Completed Deliveries
        </Typography>
      </Breadcrumbs>

      {/* ✅ Page Title */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
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
              {/* Total Charges Row */}
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
