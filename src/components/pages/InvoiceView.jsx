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
  Button
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import baseurl from '../ApiService/ApiService';

export default function TaxInvoiceView() {

  const { orderId } = useParams(); // Assuming orderId is route param
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
    const pdfRef = useRef();

  // Dummy data based on the image
  const invoiceData = {
    companyName: "VELAAN MART AGRITECH PRIVATE LIMITED",
    companyAddress: [
      "Velaan Mart, FORUM - TABIF",
      "Navalurkkottapattu",
      "Trichy Tamil Nadu 620027",
      "India",
      "GSTIN 33AAKCV5016C1ZO"
    ],
    invoiceNumber: "INV-000144",
    invoiceDate: "13/05/2025",
    terms: "Due on Receipt",
    dueDate: "13/05/2025",
    poNumber: "SO-00809",
    placeOfSupply: "Tamil Nadu (33)",
    supplierGSTIN: "33AAKCV5016C1ZO",
    contact: "9715129387",
    billTo: {
      name: "The Nodal Officer, Agricultural College And Research Institute, Chettinad",
      address: [
        "Chettinad",
        "Kanadukathan",
        "Sivagangai",
        "630 103 Tamil Nadu",
        "India"
      ]
    },
    shipTo: {
      address: [
        "Chettinad",
        "Kanadukathan",
        "Sivagangai",
        "630 103 Tamil Nadu",
        "India"
      ]
    },
    items: [
      {
        id: 1,
        description: "Ghee",
        hsn: "04059020",
        qty: "20.00 kg",
        rate: 760.00,
        cgstPercent: 6,
        cgstAmount: 814.29,
        sgstPercent: 6,
        sgstAmount: 814.29,
        amount: 15200.00
      },
      {
        id: 2,
        description: "Pasi Paruppu ( Moong Dal )",
        hsn: "07133100",
        qty: "15.00 kg",
        rate: 120.00,
        cgstPercent: 0,
        cgstAmount: 0.00,
        sgstPercent: 0,
        sgstAmount: 0.00,
        amount: 1800.00
      }
    ],
    totalItems: "35.00",
    amountInWords: "Indian Rupee Seventeen Thousand Only",
    subTotal: 17000.00,
    totalTaxableAmount: 15371.42,
    cgst6: 814.29,
    sgst6: 814.29,
    cgst0: 0.00,
    sgst0: 0.00,
    total: 17000.00,
    balanceDue: 17000.00,
    notes: "Thank you for the Order. You just made our day.",
    termsAndConditions: "All sales are final, and no refund will be issued. The Company does not offer any Return or Refund. Replacement Only available at the time of delivery incase of any poor quality or Wrong Products. Payment of the amount outstanding on the invoice is due fifteen calendar days from the date of the invoice.",
    qrCodeText: "Scan the QR code to view the configured information."
  };

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

  useEffect(() => {
    if (!orderId) {
      navigate('/customerview1');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${baseurl}/api/order/${orderId}`);
        const data = await res.json();
        setOrderDetails(data.data);
      } catch (err) {
        console.error('Error loading order details:', err);
      }
    };

    const fetchOrderItems = async () => {
      try {
        const res = await fetch(baseurl + '/api/order-items/all');
        const data = await res.json();

        // order_id in API is a number, orderId from params likely a string, convert to number
        const filteredItems = data.data.filter(
          (item) => item.order_id === Number(orderId)
        );

        setOrderItems(filteredItems);
      } catch (err) {
        console.error('Error loading order items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    fetchOrderItems();
  }, [orderId, navigate]);

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
     pdf.save(`invoice-${orderId || 'unknown'}.pdf`);
    });
  };


  if (loading) return <CircularProgress />;

  if (!orderDetails) return <Typography>No order details found.</Typography>;

  const {
    order_id,
    order_date,
    delivery_date,
    status,
    payment_method,
    CustomerProfile: {
      address = '',
      contact_person_email = '',
      contact_person_name
    } = {},
  } = orderDetails || {};

  const subtotal = orderItems.reduce((sum, item) => {
    const lineTotal = parseFloat(item.line_total) || 0;
    return sum + lineTotal;
  }, 0);

  let cgstAmount = 0;
  let sgstAmount = 0;

  orderItems.forEach(item => {
    const cgstRate = item.Product?.cgst || 0;
    const sgstRate = item.Product?.sgst || 0;
    const lineTotal = parseFloat(item.line_total) || 0;

    cgstAmount += (lineTotal * cgstRate) / 100;
    sgstAmount += (lineTotal * sgstRate) / 100;
  });

  const totalDeliveryFee = orderItems.reduce(
    (acc, row) => acc + (Number(row.Product?.delivery_fee) || 0),
    0
  );

  const grandTotal = subtotal + cgstAmount + sgstAmount + totalDeliveryFee;

  // Simple number to words converter for amounts up to Crores
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

  function amountInWords(amount) {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let words = convertNumberToWords(rupees) + ' Rupees';
    if (paise > 0) {
      words += ' and ' + convertNumberToWords(paise) + ' Paise';
    }
    return words;
  }


  return (
    <Container>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/" underline="hover" sx={{ color: '#10B981' }}>
          Dashboard
        </Link>
        <Link color="inherit" href="/customer-orders" underline="hover" sx={{ color: '#10B981' }}>
          Customer Order Management
        </Link>
        <Typography color="textPrimary">View Order</Typography>
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
                  <TableCell sx={cellStyle}>: {order_id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Invoice Date</TableCell>
                  <TableCell sx={cellStyle}>: {order_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Terms</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.terms}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>Due Date</TableCell>
                  <TableCell sx={cellStyle}>: {delivery_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={headerCellStyle}>P.O.#</TableCell>
                  <TableCell sx={cellStyle}>: {invoiceData.poNumber}</TableCell>
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
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px' }}>{invoiceData.billTo.name}</Typography>
            {invoiceData.billTo.address.map((line, index) => (
              <Typography key={index} sx={{ fontSize: '14px' }}>{line}</Typography>
            ))}
          </Box>

          {/* Ship To */}
          <Box sx={{
            width: '50%',
            p: 2
          }}>
            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 1 }}>Ship To</Typography>
            {contact_person_name}<br />
            {contact_person_email}<br />
            {address}
          </Box>
        </Box>

        {/* Items Table */}
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '40px',
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '180px',
                  }}
                >
                  Item & Description
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '100px',
                  }}
                >
                  HSN / SAC
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '80px',
                  }}
                >
                  Qty
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '80px',
                  }}
                >
                  Rate
                </TableCell>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                  }}
                >
                  CGST
                </TableCell>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                  }}
                >
                  SGST
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    textAlign: 'right',
                    width: '100px',
                  }}
                >
                  Amount
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '40px',
                    textAlign: 'center',
                  }}
                >
                  %
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '80px',
                    textAlign: 'right',
                  }}
                >
                  Amt
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '40px',
                    textAlign: 'center',
                  }}
                >
                  %
                </TableCell>
                <TableCell
                  sx={{
                    ...headerCellStyle,
                    borderTop: borderStyle,
                    borderBottom: borderStyle,
                    width: '80px',
                    textAlign: 'right',
                  }}
                >
                  Amt
                </TableCell>
                <TableCell sx={{ ...cellStyle, height: '0px', padding: 0 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderItems.map((item, index) => {
                // Calculate CGST and SGST amounts:
                const quantity = Number(item.quantity);
                const rate = Number(item.unit_price);
                const cgstPercent = item.Product?.cgst ?? 0;
                const sgstPercent = item.Product?.sgst ?? 0;

                const amount = quantity * rate;
                const cgstAmount = (amount * cgstPercent) / 100;
                const sgstAmount = (amount * sgstPercent) / 100;

                return (
                  <TableRow key={item.order_item_id}>
                    <TableCell sx={cellStyle}>{index + 1}</TableCell>
                    <TableCell sx={cellStyle}>
                      {item.Product?.product_name}
                      {item.notes ? ` - ${item.notes}` : ''}
                    </TableCell>
                    <TableCell sx={cellStyle}>--</TableCell> {/* No HSN in API */}
                    <TableCell sx={cellStyle}>
                      {item.quantity} { /* No unit in API, you can add if known */}
                    </TableCell>
                    <TableCell sx={cellStyle}>{rate.toFixed(2)}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>
                      {cgstPercent}%
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'right' }}>
                      {cgstAmount.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'center' }}>
                      {sgstPercent}%
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: 'right' }}>
                      {sgstAmount.toFixed(2)}
                    </TableCell>
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
              Items in Total {subtotal.toFixed(2)}
            </Typography>

            <Typography sx={{ fontWeight: 'bold', fontSize: '14px', mb: 0.5 }}>
              Total In Words
            </Typography>
            <Typography sx={{ fontStyle: 'italic', fontSize: '14px', mb: 2 }}>
              {amountInWords(grandTotal)}
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
                    {totalDeliveryFee.toFixed(2)}
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