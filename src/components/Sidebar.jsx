// src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigation = (path) => {
    navigate(path);
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const sidebarItems = [
    { id: 1, text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { 
      id: 2, 
      text: "Customer Order Management", 
      icon: <ShoppingCartIcon />, 
      path: "/customer-orders",
      relatedPaths: [
        "/customer-orders",
        "/order-view",
        "/track-order"
      ]
    },
    { 
      id: 3, 
      text: "Procurement Order Management", 
      icon: <BusinessCenterIcon />, 
      path: "/procurement",
      relatedPaths: [
        "/procurement",
        "/create-procurement",
        "/procurement-view",
      ]
    },
    { 
      id: 4, 
      text: "Product Management", 
      icon: <Inventory2Icon />, 
      path: "/products",
      relatedPaths: [
        "/products",
        "/add-product",
        "/view-product",
        "/edit-product"
      ]
    },
    { 
      id: 5, 
      text: "Product Category", 
      icon: <Inventory2Icon />, 
      path: "/product-category",
      relatedPaths: [
        "/product-category",
        "/create-category",
        "/view-category",
        "/edit-category"
      ]
    },
    { id: 6, text: "Inventory Management", icon: <InventoryIcon />, path: "/inventory" },
    { 
      id: 7, 
      text: "Vendor/Farmer Management", 
      icon: <PeopleIcon />, 
      path: "/vendors",
      relatedPaths: [
        "/vendors",
        "/vendor-registration",
        "/vendor-view",
        "/vendor-edit",
        "/vendoractive",
        "/vendorperform",
        "/vendorhistory"
      ]
    },
    { 
      id: 8, 
      text: "Driver & Delivery Management", 
      icon: <LocalShippingIcon />, 
      path: "/delivery",
      relatedPaths: [
        "/delivery",
        "/driveradd",
        "/drivertask",
        "/drivertrack",
        "/driverlog",
        "/driver"
      ]
    },
    { 
      id: 9, 
      text: "Customer Management", 
      icon: <PersonIcon />, 
      path: "/customer",
      relatedPaths: [
        "/customer",
        "/create-customer",
        "/customerview1",
        "/customerview2",
        "/customerview3",
        "/customer-edit"
      ]
    },
    { 
      id: 10, 
      text: "Invoice & Payment Tracking", 
      icon: <ReceiptIcon />, 
      path: "/invoice",
      relatedPaths: [
        "/invoice",
        "/invoice-view",
        "/invoicehistory",
        "/vendor-invoice",
        "/vendor-invoice-view",
        "/vendor-invoice-history",
        "/driver-invoice",
        "/driver-invoice-view"
      ]
    },
    { id: 11, text: "Reports & Analytics", icon: <BarChartIcon />, path: "/report-analysis" },
    { id: 12, text: "Settings & Configuration", icon: <SettingsIcon />, path: "/settings" },
  ];

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      <List sx={{ pt: '64px' }}>
        {sidebarItems.map((item) => {
          // Check if current path matches the item's path or starts with any of its related paths
          const isActive = 
            (item.relatedPaths && item.relatedPaths.some(path => 
              currentPath === path || currentPath.startsWith(path + '/')
            )) ||
            currentPath === item.path;

          return (
            <ListItem
              disablePadding
              key={item.id}
              sx={{
                mb: 0.5,
                backgroundColor: isActive ? 'rgba(0, 166, 126, 0.08)' : 'transparent',
                borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
              }}
            >
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 166, 126, 0.05)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 2,
                    justifyContent: 'center',
                    color: isActive ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'inherit',
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 400,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="sidebar navigation"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#fff',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            backgroundColor: '#fff',
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            borderRight: 'none',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;