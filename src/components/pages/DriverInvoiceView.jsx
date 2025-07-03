import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  CircularProgress, Breadcrumbs, Link,
  Container,
  Button,
  MenuItem
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function DriverInvoiceView() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef();

  useEffect(() => {
    if (!driverId) {
      navigate('/driver-invoice');
      return;
    }

    const fetchDriverDetails = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/driver-details/${driverId}`);
        const data = await res.json();
        setDriver(data.data);
      } catch (err) {
        console.error('Error loading driver details:', err);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/delivery/all');
        const data = await res.json();
        // Filter deliveries for this driver
        const filtered = data.filter(delivery => delivery.driver && delivery.driver.did === Number(driverId));
        setDeliveries(filtered);
      } catch (err) {
        console.error('Error loading deliveries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetails();
    fetchDeliveries();
  }, [driverId, navigate]);

  const exportToPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`driver-invoice-${driverId || 'unknown'}.pdf`);
    });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2
  }).format(amount || 0);

  if (loading) return <CircularProgress />;
  if (!driver) return <Typography>No driver details found.</Typography>;

  // Calculate total charges
  const totalCharges = deliveries.reduce((sum, d) => sum + (parseFloat(d.charges) || 0), 0);
  const completedDeliveries = deliveries.filter(d => d.status === 'Completed').length;
  const activeDeliveries = deliveries.filter(d => d.status === 'Active').length;

  return (
    <Container>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover" sx={{ color: '#10B981' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/driver-invoice" underline="hover" sx={{ color: '#10B981' }}>
          Driver Invoice Management
        </Link>
        <Typography color="textPrimary">Driver Invoice View</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          onClick={exportToPDF}
          sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#0D9F6E' } }}
        >
          Export as PDF
        </Button>
      </Box>

      <Paper ref={pdfRef} sx={{ maxWidth: '900px', margin: '20px auto', border: '1px solid #000', p: 0, borderRadius: 0, boxShadow: 'none' }}>
        {/* Header - Driver and Invoice Title */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <Box sx={{ width: '120px', p: 1, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={driver.driver_image ? `/${driver.driver_image}` : '/velaan-logo.png'} alt="Driver" style={{ maxWidth: '100px', height: 'auto', borderRadius: '8px' }} />
          </Box>
          <Box sx={{ flex: 1, p: 1, borderRight: '1px solid #000' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
              {driver.first_name} {driver.last_name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>Phone: {driver.phone}</Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>Email: {driver.email}</Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>Vehicle: {driver.vehicle_type} ({driver.vehicle_number})</Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>License: {driver.license_number}</Typography>
            <Typography variant="body2" sx={{ fontSize: '12px' }}>Status: {driver.status}</Typography>
          </Box>
          <Box sx={{ width: '250px', p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              DRIVER INVOICE
            </Typography>
          </Box>
        </Box>

        {/* Invoice Summary */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid #000' }}>
          <Box sx={{ width: '50%', borderRight: '1px solid #000', p: 2 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Summary</Typography>
            <Typography sx={{ fontSize: '14px' }}>Total Deliveries: {deliveries.length}</Typography>
            <Typography sx={{ fontSize: '14px' }}>Completed: {completedDeliveries}</Typography>
            <Typography sx={{ fontSize: '14px' }}>Active: {activeDeliveries}</Typography>
            <Typography sx={{ fontSize: '14px', mt: 1, fontWeight: 'bold' }}>Total Charges: {formatCurrency(totalCharges)}</Typography>
          </Box>
          <Box sx={{ width: '50%', p: 2 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Contact & License</Typography>
            <Typography sx={{ fontSize: '14px' }}>DOB: {driver.date_of_birth}</Typography>
            <Typography sx={{ fontSize: '14px' }}>License Expiry: {driver.license_expiry_date}</Typography>
            <Typography sx={{ fontSize: '14px' }}>State: {driver.state}</Typography>
            <Typography sx={{ fontSize: '14px' }}>Country: {driver.country}</Typography>
          </Box>
        </Box>

        {/* Deliveries Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Time Slot</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Charges</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveries.map((delivery, idx) => (
                <TableRow key={delivery.id}>
                  <TableCell sx={{ border: '1px solid #000' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{new Date(delivery.date).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{delivery.timeSlot}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{delivery.type}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{delivery.status}</TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{formatCurrency(delivery.charges)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold', border: '1px solid #000' }}>Total Charges:</TableCell>
                <TableCell sx={{ fontWeight: 'bold', border: '1px solid #000' }}>{formatCurrency(totalCharges)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Section */}
        <Box sx={{ display: 'flex', borderTop: '1px solid #000' }}>
          <Box sx={{ width: '100%', p: 2 }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Notes</Typography>
            <Typography sx={{ fontSize: '14px', mb: 2 }}>
              This invoice summarizes all deliveries and charges for the driver. Please contact admin for any queries.
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>Terms & Conditions</Typography>
            <Typography sx={{ fontSize: '12px' }}>
              All payments are subject to company policy. Please ensure all delivery records are accurate and up to date.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
