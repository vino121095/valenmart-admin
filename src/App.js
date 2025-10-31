import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './components/auth/Login';
import Dashboard from './components/pages/Dashboard';
import CustomerOrder from './components/pages/CustomerOrder';
import AssignDriver from './components/pages/AssignDriver';
import OrderView from './components/pages/OrderView';
import InvoiceView from './components/pages/InvoiceView';
import ProcurementOrderManagement from './components/pages/ProcurementOrderManagement';
import ProcurementOrderAssignDriver from './components/pages/ProcurementOrderAssignDriver';
import ProductManagement from './components/pages/ProductManagement';
import AddProduct from './components/pages/AddProduct';
import ViewProductDetail from './components/pages/ProductViewDetail';
import EditProductDetail from './components/pages/EditProductDetail';
import ProductCategoryManagement from './components/pages/ProductCategory';
import CreateCategory from './components/pages/CreateCategory';
import EditCategory from './components/pages/EditCategory';
import ViewCategory from './components/pages/ViewCategory';
import InventoryManagement from './components/pages/InventoryManagement';
import InventoryShipmentTracking from './components/pages/InventoryShipmentTracking';
import CreateProcurement from './components/pages/CreateProcurement';
import AdminProcurement from './components/pages/AdminProcurement';
import VendorManagement from './components/pages/Vendors';
import VendorRegistrationForm from './components/pages/VendorRegistrationForm';
import DeliveryManagement from './components/pages/Delivery';
import CustomerManagement from './components/pages/Customer';
import CreateCustomer from './components/pages/CreateCustomer';
import CustomerEditAccount from './components/pages/CustomerEditAccount';
import InvoiceManagement from './components/pages/Invoice';
import InvoiceManagementView from './components/pages/InvoiceView';
import InvoiceManagementHistory from './components/pages/InvoiceHistory';
import CustomerManagementView1 from './components/pages/CustomerView1';
import CustomerManagementView2 from './components/pages/CustomerView2';
import CustomerManagementView3 from './components/pages/CustomerView3';
import DriverTask from './components/pages/DriverTask';
import DriverTrack from './components/pages/DriverTrack';
import DriverLog from './components/pages/DriverLog';
import DriverAdd from './components/pages/DriverAdd';
import VendorActive from './components/pages/VendorActive';
import VendorPerform from './components/pages/VendorPerform';
import VendorHistory from './components/pages/VendorHistory';
import VendorView from './components/pages/VendorView';
import VendorEdit from './components/pages/VendorEdit';
import ReportAnalysis from './components/pages/ReportAnalysis';
import ExportOptions from './components/pages/ExportOptions';
import Settings from './components/pages/Settings';
import DriverDetails from './components/pages/DriverDetails';
import CustomerOrderDetails from './components/pages/CustomerOrderDetails';
import TrackOrder from './components/pages/TrackOrder';
import ProcurementInvoiceManagement from './components/pages/VendorInvoice';
import TaxVendorInvoiceView from './components/pages/VendorInvoiceView';
import VendorInvoiceHistory from './components/pages/VendorInvoiceHistory';
import DriverInvoice from './components/pages/DriverInvoice';
import DriverInvoiceView from './components/pages/DriverInvoiceView';
import DriverInvoiceHistory from './components/pages/DriverInvoiceHistory';
import ProcurementView from './components/pages/ProcurementView';
import AdminProfileForm from './components/pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00A67E',
    },
    secondary: {
      main: '#f5f5f5',
    },
    background: {
      default: '#f5f8fa',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
  },
});

// Create Authentication Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Provider Component
const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        Loading...
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Layout wrapper component that conditionally renders navbar and sidebar
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Pages that should not have the dashboard layout
  const authPages = ['/login'];
  const isAuthPage = authPages.includes(location.pathname);

  if (isAuthPage) {
    // Render without dashboard layout for auth pages
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default'
      }}>
        {children}
      </Box>
    );
  }
  // Render with dashboard layout for all other pages
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, md: 3 },
          width: { sm: `calc(100% - 240px)` },
          mt: '64px',
          overflowX: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <LayoutWrapper>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/customer-orders" element={
                <ProtectedRoute>
                  <CustomerOrder />
                </ProtectedRoute>
              } />
              <Route path="/assign-driver" element={
                <ProtectedRoute>
                  <AssignDriver />
                </ProtectedRoute>
              } />
              <Route path="/order-view" element={
                <ProtectedRoute>
                  <OrderView />
                </ProtectedRoute>
              } />
              <Route
                path="/invoice-view/:orderId"
                element={
                  <ProtectedRoute>
                    <InvoiceView />
                  </ProtectedRoute>
                }
              />
              <Route path="/procurement" element={
                <ProtectedRoute>
                  <ProcurementOrderManagement />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="/add-product" element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } />
              <Route path="/view-product/:id" element={
                <ProtectedRoute>
                  <ViewProductDetail />
                </ProtectedRoute>
              } />
              <Route path="/edit-product/:id" element={
                <ProtectedRoute>
                  <EditProductDetail />
                </ProtectedRoute>
              } />
              <Route path="/product-category" element={
                <ProtectedRoute>
                  <ProductCategoryManagement />
                </ProtectedRoute>
              } />
              <Route path="/create-category" element={
                <ProtectedRoute>
                  <CreateCategory />
                </ProtectedRoute>
              } />
              <Route path="/edit-category/:id" element={
                <ProtectedRoute>
                  <EditCategory />
                </ProtectedRoute>
              } />
              <Route path="/view-category/:id" element={
                <ProtectedRoute>
                  <ViewCategory />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <InventoryManagement />
                </ProtectedRoute>
              } />
              <Route path="/inventory-shipment-tracking" element={
                <ProtectedRoute>
                  <InventoryShipmentTracking />
                </ProtectedRoute>
              } />
              <Route path="/create-procurement" element={
                <ProtectedRoute>
                  <CreateProcurement />
                </ProtectedRoute>
              } />
              <Route path="/procurement-assign-driver/:id" element={
                <ProtectedRoute>
                  <ProcurementOrderAssignDriver />
                </ProtectedRoute>
              } />
              <Route path='/admin-procurement' element={
                <ProtectedRoute>
                  <AdminProcurement />
                </ProtectedRoute>
              } />
              <Route path="/vendors" element={
                <ProtectedRoute>
                  <VendorManagement />
                </ProtectedRoute>
              } />
              <Route path="/delivery" element={
                <ProtectedRoute>
                  <DeliveryManagement />
                </ProtectedRoute>
              } />
              <Route path="/customer" element={
                <ProtectedRoute>
                  <CustomerManagement />
                </ProtectedRoute>
              } />
              <Route path="/create-customer" element={
                <ProtectedRoute>
                  <CreateCustomer />
                </ProtectedRoute>
              } />
              <Route path="/customer-edit/:id" element={
                <ProtectedRoute>
                  <CustomerEditAccount />
                </ProtectedRoute>
              } />
              <Route path="/invoice" element={
                <ProtectedRoute>
                  <InvoiceManagement />
                </ProtectedRoute>
              } />
              <Route path="/driver-invoice" element={
                <ProtectedRoute>
                  <DriverInvoice />
                </ProtectedRoute>
              } />
              <Route path="/invoice-view/:id" element={
                <ProtectedRoute>
                  <InvoiceManagementView />
                </ProtectedRoute>
              } />
              <Route path="/vendor-invoice-view/:id" element={
                <ProtectedRoute>
                  <TaxVendorInvoiceView />
                </ProtectedRoute>
              } />
            <Route path="/driver-invoice-view/:driverId" element={
  <ProtectedRoute>
    <DriverInvoiceView />
  </ProtectedRoute>
} />
  <Route path="/driver-invoice-history/:deliveryId" element={
    <ProtectedRoute>
      <DriverInvoiceHistory />
    </ProtectedRoute>
  } />
              <Route path="/invoicehistory/:orderId" element={
                <ProtectedRoute>
                  <InvoiceManagementHistory />
                </ProtectedRoute>
              } />
              <Route path="/vendor-invoice" element={
                <ProtectedRoute>
                  <ProcurementInvoiceManagement />
                </ProtectedRoute>
              } />
              <Route path="/customerview1/:id" element={
                <ProtectedRoute>
                  <CustomerManagementView1 />
                </ProtectedRoute>
              } />
              <Route path="/customerview2" element={
                <ProtectedRoute>
                  <CustomerManagementView2 />
                </ProtectedRoute>
              } />
              <Route path="/customerview3/:id" element={
                <ProtectedRoute>
                  <CustomerManagementView3 />
                </ProtectedRoute>
              } />
              <Route path="/customer/order/:oid" element={
                <ProtectedRoute>
                  <CustomerOrderDetails />
                </ProtectedRoute>
              } />
              <Route path="/drivertask/:id?" element={
                <ProtectedRoute>
                  <DriverTask />
                </ProtectedRoute>
              } />
              <Route path="/drivertrack" element={
                <ProtectedRoute>
                  <DriverTrack />
                </ProtectedRoute>
              } />
              <Route path="/driverlog" element={
                <ProtectedRoute>
                  <DriverLog />
                </ProtectedRoute>
              } />
              <Route path="/driveradd/:id?" element={
                <ProtectedRoute>
                  <DriverAdd />
                </ProtectedRoute>
              } />
              <Route path="/vendoractive" element={
                <ProtectedRoute>
                  <VendorActive />
                </ProtectedRoute>
              } />
              <Route path="/vendorperform" element={
                <ProtectedRoute>
                  <VendorPerform />
                </ProtectedRoute>
              } />
              <Route path="/vendorhistory" element={
                <ProtectedRoute>
                  <VendorHistory />
                </ProtectedRoute>
              } />
              <Route path="/vendor-registration" element={
                <ProtectedRoute>
                  <VendorRegistrationForm />
                </ProtectedRoute>
              } />
              <Route path="/vendor-view/:id" element={
                <ProtectedRoute>
                  <VendorView />
                </ProtectedRoute>
              } />
              <Route path="/vendor-edit/:id" element={
                <ProtectedRoute>
                  <VendorEdit />
                </ProtectedRoute>
              } />
              <Route path="/report-analysis" element={
                <ProtectedRoute>
                  <ReportAnalysis />
                </ProtectedRoute>
              } />
              <Route path="/export-options" element={
                <ProtectedRoute>
                  <ExportOptions />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/driver/:id" element={
                <ProtectedRoute>
                  <DriverDetails />
                </ProtectedRoute>
              } />
              <Route path="/track-order/:id" element={
                <ProtectedRoute>
                  <TrackOrder />
                </ProtectedRoute>
              } />
              <Route path="/vendor-invoice-history/:procurementId" element={
                <ProtectedRoute>
                  <VendorInvoiceHistory />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <AdminProfileForm />
                </ProtectedRoute>
              } />
              <Route path="/procurement-view/:id" element={<ProcurementView />} />
            </Routes>
          </LayoutWrapper>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
