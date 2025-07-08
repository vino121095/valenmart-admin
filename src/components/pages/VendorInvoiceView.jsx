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
  CircularProgress,
  Breadcrumbs,
  Link,
  Container,
  Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import baseurl from '../ApiService/ApiService';

const borderStyle = '1px solid #000';
const noBorderStyle = 'none';
const cellStyle = {
  padding: '4px 8px',
  borderLeft: borderStyle,
  borderRight: noBorderStyle,
  borderTop: noBorderStyle,
  borderBottom: noBorderStyle,
  fontSize: '14px'
};
const headerCellStyle = {
  ...cellStyle,
  fontWeight: 'bold'
};
const rightAlignedCell = {
  ...cellStyle,
  textAlign: 'right'
};

const invoiceData = {
  companyName: "VELAAN MART AGRITECH PRIVATE LIMITED",
  companyAddress: [
    "Velaan Mart, FORUM - TABIF",
    "Navalurkkottapattu",
    "Trichy Tamil Nadu 620027",
    "India",
    "GSTIN 33AAKCV5016C1ZO"
  ],
  terms: "Due on Receipt",
  placeOfSupply: "Tamil Nadu (33)",
  supplierGSTIN: "33AAKCV5016C1ZO",
  contact: "9715129387",
  notes: "Thank you for the Order. You just made our day.",
  termsAndConditions: "All sales are final, and no refund will be issued. The Company does not offer any Return or Refund. Replacement Only available at the time of delivery incase of any poor quality or Wrong Products. Payment of the amount outstanding on the invoice is due fifteen calendar days from the date of the invoice.",
};

function numberToWords(num) {
  // Simple number to words for Rupees (up to Crores)
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  function convertTwoDigit(num) {
    if (num < 10) return units[num];
    else if (num >= 10 && num < 20) return teens[num - 10];
    else {
      return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
    }
  }

  function convertNumberToWords(num) {
    if (num === 0) return 'Zero';
    let result = '';
    let scaleIndex = 0;
    while (num > 0) {
      let chunk = num % 1000;
      let chunkWords = '';
      const hundreds = Math.floor(chunk / 100);
      const remainder = chunk % 100;
      if (hundreds) chunkWords += units[hundreds] + ' Hundred ';
      if (remainder) {
        chunkWords += convertTwoDigit(remainder) + ' ';
      }
      if (chunkWords) {
        result = chunkWords + scales[scaleIndex] + ' ' + result;
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }
    return result.trim();
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = convertNumberToWords(rupees) + ' Rupees';
  if (paise > 0) {
    words += ' and ' + convertNumberToWords(paise) + ' Paise';
  }
  return words;
}

export default function VendorInvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef();

  const [procurement, setProcurement] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!id) {
      navigate('/vendor-invoice');
      return;
    }
    const fetchData = async () => {
      try {
        // Fetch procurement details
        const res = await fetch(`${baseurl}/api/procurement/${id}`);
        const data = await res.json();
        // console.log(`API response for /procurement/${id}:`, data);

        const procurementData = data.data;

        if (procurementData) {
          const details = Array.isArray(procurementData) ? procurementData[0] : procurementData;

          if (details) {
            setProcurement(details);
            // Fetch vendor details
            const vendorId = details.vendor_id;
            if (vendorId) {
              const vendorRes = await fetch(`${baseurl}/api/vendor/${vendorId}`);
              const vendorData = await vendorRes.json();
              // console.log(`API response for /vendor/${vendorId}:`, vendorData);
              
              if (vendorData.data) {
                const vDetails = Array.isArray(vendorData.data) ? vendorData.data[0] : vendorData.data;
                if(vDetails) {
                    setVendor(vDetails);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading procurement/vendor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    fetch(baseurl + '/api/product/all')
      .then(res => res.json())
      .then(data => setProducts(data.data || []))
      .catch(() => setProducts([]));
  }, []);

  const exportToPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, {
      scale: 2, // Increase for better quality
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
      pdf.save(`invoice-${procurement?.procurement_id || 'unknown'}.pdf`);
    });
  };

  if (loading) return <CircularProgress />;
  if (!procurement) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6">No procurement details found.</Typography>
        <Typography color="text.secondary" component="div">
          Please check the browser console for API responses from 
          <code>/api/procurement/:id</code> and <code>/api/vendor/:id</code>.
        </Typography>
        <Typography color="text.secondary">
          The procurement ID may not exist or the API returned an unexpected format.
        </Typography>
      </Container>
    );
  }

  // Parse items array
  let items = [];
  try {
    items = procurement && procurement.items ? (typeof procurement.items === 'string' ? JSON.parse(procurement.items) : procurement.items) : [];
  } catch {
    items = [];
  }

  // Calculate taxes and totals
  const subtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.unit_price) || 0;
    return sum + qty * rate;
  }, 0);
  const cgstRate = parseFloat(procurement.cgst) || 0;
  const sgstRate = parseFloat(procurement.sgst) || 0;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const deliveryFee = parseFloat(procurement.delivery_fee) || 0;
  const grandTotal = subtotal + cgstAmount + sgstAmount + deliveryFee;

  return (
    <Container>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover" sx={{ color: '#10B981' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/vendor-invoice" underline="hover" sx={{ color: '#10B981' }}>
          Vendor Invoice Management
        </Link>
        <Typography color="textPrimary">View Vendor Invoice</Typography>
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

      <Paper ref={pdfRef} sx={{
        maxWidth: '900px',
        margin: '20px auto',
        border: borderStyle,
        p: 0,
        borderRadius: 0,
        boxShadow: 'none'
      }}>
        {/* Header - Company and Invoice Title */}
        <Box sx={{
          display: 'flex',
          borderBottom: borderStyle
        }}>
          <Box sx={{
            width: '100px',
            p: 1,
            borderRight: borderStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/velaan-logo.png" alt="Velaan Mart" style={{ maxWidth: '80px', height: 'auto' }} />
          </Box>
          <Box sx={{
            flex: 1,
            p: 1,
            borderRight: borderStyle
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
              {invoiceData.companyName}
            </Typography>
            {invoiceData.companyAddress.map((line, index) => (
              <Typography key={index} variant="body2" sx={{ fontSize: '12px' }}>
                {line}
              </Typography>
            ))}
          </Box>
          <Box sx={{
            width: '250px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              TAX INVOICE
            </Typography>
          </Box>
        </Box>

        {/* Invoice Details and Company Information */}
        <Box sx={{
          display: 'flex',
          borderBottom: borderStyle
        }}>
          {/* Left Column - Invoice Details */}
          <Box sx={{
            width: '50%',
            borderRight: borderStyle
          }}>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ ...headerCellStyle, width: '35%' }}>#</TableCell>
                  <TableCell sx={cellStyle}>: {procurement.order_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Invoice Date</TableCell>
                  <TableCell sx={cellStyle}>: {procurement.order_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Terms</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.terms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Due Date</TableCell>
                  <TableCell sx={cellStyle}>: {procurement.expected_delivery_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>P.O.#</TableCell>
                  <TableCell sx={cellStyle}>: {procurement.order_id}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>

          {/* Right Column - GSTIN etc. */}
          <Box sx={{
            width: '50%'
          }}>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ ...headerCellStyle, width: '50%' }}>Place Of Supply</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.placeOfSupply}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>GSTIN</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.supplierGSTIN}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Contact</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.contact}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {/* Bill To and Ship To */}
        <Box sx={{
          display: 'flex',
          borderBottom: borderStyle
        }}>
          {/* Bill To */}
          <Box sx={{
            width: '50%',
            p: 2,
            borderRight: borderStyle
          }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Bill To</Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{invoiceData.companyName}</Typography>
            {invoiceData.companyAddress.map((line, index) => (
              <Typography key={index} sx={{ fontSize: '14px' }}>{line}</Typography>
            ))}
          </Box>

          {/* Ship To */}
          <Box sx={{
            width: '50%',
            p: 2
          }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Ship To</Typography>
            {vendor?.contact_person}<br />
            {vendor?.email}<br />
            {vendor?.address}, {vendor?.city}, {vendor?.state} - {vendor?.pincode}
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '40px' }}>#</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '180px' }}>Item & Description</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '100px' }}>Category</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '80px' }}>Qty</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '80px' }}>Rate</TableCell>
                <TableCell colSpan={2} align="center" sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle }}>CGST</TableCell>
                <TableCell colSpan={2} align="center" sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle }}>SGST</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, textAlign: 'right', width: '100px' }}>Amount</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '40px', textAlign: 'center' }}>%</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '80px', textAlign: 'right' }}>Amt</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '40px', textAlign: 'center' }}>%</TableCell>
                <TableCell sx={{ ...headerCellStyle, borderTop: borderStyle, borderBottom: borderStyle, width: '80px', textAlign: 'right' }}>Amt</TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => {
                const product = products.find(p => p.pid === item.product_id || p.id === item.product_id);
                // Calculate per-item taxes and amount
                const qty = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.unit_price) || 0;
                const amount = qty * rate;
                const cgst = parseFloat(procurement.cgst) || 0;
                const sgst = parseFloat(procurement.sgst) || 0;
                const cgstAmt = (amount * cgst) / 100;
                const sgstAmt = (amount * sgst) / 100;
                return (
                  <TableRow key={idx}>
                    <TableCell sx={cellStyle}>{idx + 1}</TableCell>
                    <TableCell sx={cellStyle}>
                      {product ? product.product_name || product.name : 'Product'}
                      <br />
                      <span style={{ fontSize: 12, color: '#888' }}>
                        {qty} {product ? product.unit : ''} @ ₹{rate}
                      </span>
                      {procurement.notes && idx === 0 && (
                        <div style={{ fontSize: 12, color: '#888' }}>- {procurement.notes}</div>
                      )}
                    </TableCell>
                    <TableCell sx={cellStyle}>{procurement.category}</TableCell>
                    <TableCell sx={cellStyle}>{qty}</TableCell>
                    <TableCell sx={cellStyle}>{rate.toFixed(2)}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>{cgst}%</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'right' }}>{cgstAmt.toFixed(2)}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>{sgst}%</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'right' }}>{sgstAmt.toFixed(2)}</TableCell>
                    <TableCell sx={rightAlignedCell}>{amount.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer Section */}
        <Box sx={{
          display: 'flex',
          borderTop: borderStyle
        }}>
          {/* Left Column - Notes and Terms */}
          <Box sx={{
            width: '50%',
            p: 2,
            borderRight: borderStyle
          }}>
            <Typography sx={{ fontSize: '14px', mb: 1 }}>
              Items in Total {procurement.unit}
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
              Total In Words
            </Typography>
            <Typography sx={{ fontStyle: 'italic', fontSize: '14px', mb: 2 }}>
              {numberToWords(grandTotal)}
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
              Notes
            </Typography>
            <Typography sx={{ fontSize: '14px', mb: 2 }}>
              {invoiceData.notes}
            </Typography>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
              Terms & Conditions
            </Typography>
            <Typography sx={{ fontSize: '12px' }}>
              {invoiceData.termsAndConditions}
            </Typography>
            {/* QR Code */}
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box
                component="img"
                src="/qr-code.png"
                alt="QR Code"
                sx={{ width: '100px', height: '100px', border: '1px solid #ccc' }}
              />
              <Typography sx={{ fontSize: '12px', maxWidth: '180px', mt: 1 }}>
                Scan the QR code to view the configured information.
              </Typography>
            </Box>
          </Box>
          {/* Right Column - Summary and Totals */}
          <Box sx={{ width: '50%' }}>
            <Table size="small" sx={{ tableLayout: 'fixed' }}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2 }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>
                      Sub Total
                    </Typography>
                    <Typography sx={{ fontSize: '10px' }}>
                      (Tax Inclusive)
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...rightAlignedCell, width: '25%' }}>
                    {subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2 }}>
                    CGST
                  </TableCell>
                  <TableCell sx={rightAlignedCell}>
                    {cgstAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2 }}>
                    SGST
                  </TableCell>
                  <TableCell sx={rightAlignedCell}>
                    {sgstAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2 }}>
                    Delivery Fee
                  </TableCell>
                  <TableCell sx={rightAlignedCell}>
                    {deliveryFee.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2, fontWeight: 'bold' }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ ...rightAlignedCell, fontWeight: 'bold' }}>
                    ₹{grandTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ ...rightAlignedCell, pr: 2, fontWeight: 'bold' }}>
                    Balance Due
                  </TableCell>
                  <TableCell sx={{ ...rightAlignedCell, fontWeight: 'bold' }}>
                    ₹{grandTotal.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {/* Signature */}
            <Box sx={{
              p: 2,
              mt: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <Box sx={{
                borderTop: '1px solid #000',
                width: '200px',
                textAlign: 'center',
                pt: 1
              }}>
                <Typography sx={{ fontSize: '14px' }}>
                  Authorized Signature
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}