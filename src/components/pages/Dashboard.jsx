import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import baseurl from '../ApiService/ApiService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: null,
    vendors: null,
    drivers: null,
    deliveries: null
  });
  const [orders, setOrders] = useState([]); // For today's orders
  const [lowStockItems, setLowStockItems] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [dailyDeliveries, setDailyDeliveries] = useState([]); // For daily delivery counts
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingDailyDeliveries, setLoadingDailyDeliveries] = useState(true);

  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllLowStock, setShowAllLowStock] = useState(false);

  const visibleOrders = showAllOrders ? orders : orders.slice(0, 3);
  const visibleItems = showAllLowStock ? lowStockItems : lowStockItems.slice(0, 2);

  const chartRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [customersRes, vendorsRes, driversRes, customerOrdersRes, vendorOrdersRes] = await Promise.all([
          fetch(baseurl + '/api/customer-profile/all'),
          fetch(baseurl + '/api/vendor/all'),
          fetch(baseurl + '/api/driver-details/all'),
          fetch(baseurl + '/api/order/all'),
          fetch(baseurl + '/api/procurement/all')
        ]);
        const customersData = await customersRes.json();
        const vendorsData = await vendorsRes.json();
        const driversData = await driversRes.json();
        const customerOrdersData = await customerOrdersRes.json();
        const vendorOrdersData = await vendorOrdersRes.json();
        
        // Count delivered customer orders
        let deliveredCustomerOrders = 0;
        if (Array.isArray(customerOrdersData)) {
          deliveredCustomerOrders = customerOrdersData.filter(o => o.status === 'Delivered').length;
        } else if (Array.isArray(customerOrdersData.data)) {
          deliveredCustomerOrders = customerOrdersData.data.filter(o => o.status === 'Delivered').length;
        }
        
        // Count received vendor orders
        let receivedVendorOrders = 0;
        if (Array.isArray(vendorOrdersData)) {
          receivedVendorOrders = vendorOrdersData.filter(o => o.status === 'Received').length;
        } else if (Array.isArray(vendorOrdersData.data)) {
          receivedVendorOrders = vendorOrdersData.data.filter(o => o.status === 'Received').length;
        }
        
        const totalDeliveries = deliveredCustomerOrders + receivedVendorOrders;
        
        setStats({
          customers: customersData.data ? customersData.data.length : 0,
          vendors: vendorsData.data ? vendorsData.data.length : 0,
          drivers: driversData.data ? driversData.data.length : 0,
          deliveries: totalDeliveries
        });
      } catch (err) {
        setStats({ customers: 0, vendors: 0, drivers: 0, deliveries: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch Today's Orders (Customer + Procurement)
  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        // Fetch both customer and vendor orders
        const [customerOrdersRes, vendorOrdersRes] = await Promise.all([
          fetch(baseurl + '/api/order/all'),
          fetch(baseurl + '/api/procurement/all')
        ]);
        
        const customerOrdersData = await customerOrdersRes.json();
        const vendorOrdersData = await vendorOrdersRes.json();
        
        const customerOrders = Array.isArray(customerOrdersData) ? customerOrdersData : customerOrdersData.data || [];
        const vendorOrders = Array.isArray(vendorOrdersData) ? vendorOrdersData : vendorOrdersData.data || [];
        
        // Combine orders with type information
        const combinedOrders = [
          ...customerOrders.map(order => ({ ...order, type: 'Customer' })),
          ...vendorOrders.map(order => ({ ...order, type: 'Vendor' }))
        ];
        
        setOrders(combinedOrders);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch Low Stock Alerts (simulate with products with unit === '1')
  useEffect(() => {
    const fetchLowStock = async () => {
      setLoadingLowStock(true);
      try {
        const productsRes = await fetch(baseurl + '/api/product/all');
        const productsData = await productsRes.json();
        const products = productsData.data || [];
        // Simulate low stock: unit === '1'
        const lowStock = products.filter(p => parseInt(p.unit) <= 10).map(p => ({
          name: p.product_name,
          current: `${p.unit} unit`,
          threshold: 'Restock soon',
          urgency: parseInt(p.unit) <= 5 ? 'high' : 'medium'
        }));
        setLowStockItems(lowStock);
      } catch (err) {
        setLowStockItems([]);
      } finally {
        setLoadingLowStock(false);
      }
    };
    fetchLowStock();
  }, []);

  // Fetch Daily Deliveries and Sales Insights
  useEffect(() => {
    const fetchDailyDeliveries = async () => {
      setLoadingDailyDeliveries(true);
      setLoadingSales(true);
      try {
        // Fetch both customer and vendor orders
        const [customerOrdersRes, vendorOrdersRes] = await Promise.all([
          fetch(baseurl + '/api/order/all'),
          fetch(baseurl + '/api/procurement/all')
        ]);
        
        const customerOrdersData = await customerOrdersRes.json();
        const vendorOrdersData = await vendorOrdersRes.json();
        
        const customerOrders = Array.isArray(customerOrdersData) ? customerOrdersData : customerOrdersData.data || [];
        const vendorOrders = Array.isArray(vendorOrdersData) ? vendorOrdersData : vendorOrdersData.data || [];
        
        // Filter only completed orders
        const completedCustomerOrders = customerOrders.filter(order => order.status === 'Delivered');
        const completedVendorOrders = vendorOrders.filter(order => order.status === 'Received');
        
        // Combine orders
        const allDeliveries = [
          ...completedCustomerOrders.map(order => ({ ...order, type: 'Customer' })),
          ...completedVendorOrders.map(order => ({ ...order, type: 'Vendor' }))
        ];
        
        // Group by date
        const groupedByDate = {};
        allDeliveries.forEach(delivery => {
          // Extract date part (assuming date format is YYYY-MM-DD or ISO string)
          const dateStr = delivery.order_date ? delivery.order_date.split('T')[0] : 
                         delivery.delivery_date ? delivery.delivery_date.split('T')[0] : 
                         new Date().toISOString().split('T')[0];
          
          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = {
              date: dateStr,
              customerCount: 0,
              vendorCount: 0,
              totalCount: 0
            };
          }
          
          if (delivery.type === 'Customer') {
            groupedByDate[dateStr].customerCount++;
          } else {
            groupedByDate[dateStr].vendorCount++;
          }
          groupedByDate[dateStr].totalCount++;
        });
        
        // Convert to array and sort by date
        const dailyData = Object.values(groupedByDate).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        // Take only the last 7 days
        const last7Days = dailyData.slice(-7);
        
        setDailyDeliveries(last7Days);
        
        // Calculate totals for Sales Insights
        const totalCustomerDeliveries = last7Days.reduce((sum, day) => sum + day.customerCount, 0);
        const totalVendorDeliveries = last7Days.reduce((sum, day) => sum + day.vendorCount, 0);
        
        setSalesData([
          { segment: 'Vendor Deliveries', percentage: totalVendorDeliveries, color: '#64b5f6' },
          { segment: 'Customer Deliveries', percentage: totalCustomerDeliveries, color: '#66bb6a' }
        ]);
      } catch (err) {
        console.error('Error fetching daily deliveries:', err);
        setDailyDeliveries([]);
        setSalesData([]);
      } finally {
        setLoadingDailyDeliveries(false);
        setLoadingSales(false);
      }
    };
    fetchDailyDeliveries();
  }, []);

  // Updated statsCards with icons and colors
  const statsCards = [
    { 
      title: 'Total Customers', 
      value: stats.customers !== null ? stats.customers : '...', 
      growth: '+1.03%', 
      trend: 'up',
      icon: '👥',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#fff'
    },
    { 
      title: 'Total Vendors', 
      value: stats.vendors !== null ? stats.vendors : '...', 
      growth: '+0.85%', 
      trend: 'up',
      icon: '🏪',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#fff'
    },
    { 
      title: 'Total Drivers', 
      value: stats.drivers !== null ? stats.drivers : '...', 
      growth: '+0.93%', 
      trend: 'up',
      icon: '🚚',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#fff'
    },
    { 
      title: 'Total Deliveries', 
      value: stats.deliveries !== null ? stats.deliveries : '...', 
      growth: '+0.68%', 
      trend: 'up',
      icon: '📦',
      bgColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      textColor: '#fff'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': 
      case 'Received': 
        return '#d4f5d3';
      case 'Active': return '#fff2cc';
      case 'Processing': return '#d1e3f8';
      case 'Pending': 
      case 'Waiting for Approval': 
        return '#ffded9';
      default: return '#f0f0f0';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Delivered': 
      case 'Received': 
        return '#218838';
      case 'Active': return '#856404';
      case 'Processing': return '#0c5460';
      case 'Pending': 
      case 'Waiting for Approval': 
        return '#721c24';
      default: return '#333333';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': 
      case 'Received': 
        return '✓';
      case 'Active': return '⚡';
      case 'Processing': return '⏳';
      case 'Pending': 
      case 'Waiting for Approval': 
        return '⏱️';
      default: return '❓';
    }
  };

  // Calculate sales percentages for donut chart
  const totalSales = salesData.reduce((sum, s) => sum + s.percentage, 0) || 1;
  const salesDataWithPercent = salesData.map(s => ({ ...s, percent: ((s.percentage / totalSales) * 100).toFixed(0) }));

  function downloadCSV(orders) {
    if (!orders || orders.length === 0) return;
    const header = ['Order ID', 'Driver', 'Type', 'Status', 'Charges'];
    const rows = orders.map(order => [
      order.order_id || order.procurement_id || order.id,
      order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : 
        order.DriversDetail ? `${order.DriversDetail.first_name} ${order.DriversDetail.last_name}` : 
        order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : '-',
      order.type,
      order.status,
      order.total_amount || order.charges !== null && order.charges !== undefined ? order.charges : '-'
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const downloadChartImage = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = `order-summary-chart-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // Get the maximum value for scaling the chart
  const maxDeliveryValue = Math.max(...dailyDeliveries.map(item => item.totalCount), 1);

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#f6f5fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Dashboard Content */}
        <main style={{ flex: 1, padding: '0' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Dashboard</h2>
            <p style={{ color: '#757575', margin: '8px 0 0 0' }}>Hi, Admin. Welcome back to Velanmart Admin!</p>
          </div>

          {/* Stats Cards - Redesigned */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {statsCards.map((card, index) => (
              <div key={index} style={{
                background: card.bgColor,
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                color: card.textColor,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              >
                {/* Decorative circle */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 500, margin: 0, opacity: 0.9 }}>{card.title}</h3>
                  <div style={{ fontSize: '32px' }}>{card.icon}</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
                      {loading ? '...' : card.value}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', opacity: 0.8 }}>
                      <span style={{ marginRight: '4px' }}>{card.trend === 'up' ? '↑' : '↓'}</span>
                      {card.growth}
                    </div>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div style={{ 
                    width: '60px', 
                    height: '4px', 
                    backgroundColor: 'rgba(255,255,255,0.3)', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: '70%', 
                      height: '100%', 
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '2px'
                    }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Order Summary - Modern Bar Chart */}
            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '50px', marginTop: '0' }}>Order Summary</h3>
                  <p style={{ color: '#9e9e9e', fontSize: '14px', margin: '4px 0 0 0' }}></p>
                </div>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4caf50',
                    fontSize: '14px',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease',
                    marginBottom: '50px', 
                    marginTop: '0'
                  }}
                  onClick={downloadChartImage}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4caf50';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#4caf50';
                  }}
                >
                  <span style={{ marginRight: '-1px' }}>⬇️</span>
                  Save Report
                </button>
              </div>
              
              {/* Modern Bar Chart */}
              <div ref={chartRef} style={{ height: '300px', position: 'relative' }}>
                {/* Chart background */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  right: '0',
                  bottom: '50px',
                  background: 'linear-gradient(to bottom, rgba(240,240,240,0.5) 0%, rgba(240,240,240,0) 100%)',
                  borderRadius: '8px'
                }}></div>
                
                {/* Grid lines */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '40px',
                  right: '20px',
                  bottom: '50px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.05)' }}></div>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div style={{ position: 'absolute', left: '0', top: '0', bottom: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '12px', color: '#757575', width: '35px', textAlign: 'right' }}>
                  <span>{maxDeliveryValue}</span>
                  <span>{Math.round(maxDeliveryValue * 0.75)}</span>
                  <span>{Math.round(maxDeliveryValue * 0.5)}</span>
                  <span>{Math.round(maxDeliveryValue * 0.25)}</span>
                  <span>0</span>
                </div>
                
                {/* Bars */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-around', 
                  height: '250px',
                  paddingLeft: '50px',
                  paddingRight: '20px',
                  paddingBottom: '50px',
                  position: 'relative'
                }}>
                  {dailyDeliveries.map((day, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10%', position: 'relative' }}>
                      {/* Bar container with animation */}
                      <div style={{ 
                        width: '100%', 
                        height: '200px', 
                        display: 'flex', 
                        flexDirection: 'column-reverse',
                        position: 'relative',
                        marginBottom: '10px'
                      }}>
                        {/* Customer Deliveries (bottom segment) */}
                        <div
                          style={{
                            height: `${(day.customerCount / maxDeliveryValue) * 200}px`,
                            backgroundColor: '#66bb6a',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Shimmer effect */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '30px',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }}></div>
                        </div>
                        
                        {/* Vendor Deliveries (top segment) */}
                        <div
                          style={{
                            height: `${(day.vendorCount / maxDeliveryValue) * 200}px`,
                            backgroundColor: '#64b5f6',
                            borderRadius: '4px',
                            transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Shimmer effect */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '30px',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }}></div>
                        </div>
                        
                        {/* Value label on top of bar */}
                        {day.totalCount > 0 && (
                          <div style={{ 
                            position: 'absolute', 
                            top: '-30px', 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            color: '#333',
                            background: 'rgba(255,255,255,0.8)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}>
                            {day.totalCount}
                          </div>
                        )}
                      </div>
                      
                      {/* Date label */}
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#616161',
                        fontWeight: 500,
                        textAlign: 'center'
                      }}>
                        {formatDate(day.date)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* X-axis line */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: '50px', 
                  left: '40px', 
                  right: '20px', 
                  height: '2px', 
                  backgroundColor: '#e0e0e0' 
                }}></div>
                
                {/* Legend */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: '20px',
                  paddingTop: '15px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                    <div style={{
                      backgroundColor: '#66bb6a',
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#424242', fontWeight: 500 }}>Customer</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      backgroundColor: '#64b5f6',
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}></div>
                    <span style={{ fontSize: '14px', color: '#424242', fontWeight: 500 }}>Vendor</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Insights - Modern Donut Chart */}
            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginTop: 0, marginBottom: '24px' }}>Sales Insights</h3>
              
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                {/* Modern Donut Chart */}
                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                  {/* Background circle */}
                  <div style={{
                    position: 'absolute',
                    inset: '10px',
                    borderRadius: '50%',
                    background: '#f5f5f5',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                  }}></div>
                  
                  {/* Donut chart */}
                  <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: '0', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
                    {salesDataWithPercent.reduce((acc, item, idx) => {
                      const prev = acc.offset;
                      const dash = (item.percent / 100) * 100;
                      acc.offset += dash;
                      acc.circles.push(
                        <circle
                          key={item.segment}
                          cx="50" cy="50" r="40" fill="transparent"
                          stroke={item.color}
                          strokeWidth="12"
                          strokeDasharray={`${dash} 100`}
                          strokeDashoffset={-prev}
                          strokeLinecap="round"
                        />
                      );
                      return acc;
                    }, { offset: 0, circles: [] }).circles}
                  </svg>
                  
                  {/* Center content */}
                  <div style={{
                    position: 'absolute',
                    inset: '0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    borderRadius: '50%',
                    width: '60%',
                    height: '60%',
                    margin: 'auto',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '24px', color: '#333' }}>
                      {loadingSales ? '...' : totalSales}
                    </div>
                    <div style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                      Completed
                    </div>
                  </div>
                </div>
                
                {/* Legend with enhanced styling */}
                <div style={{ marginLeft: '30px' }}>
                  {salesDataWithPercent.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '16px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div style={{
                        backgroundColor: item.color,
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        marginRight: '12px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}></div>
                      <div>
                        <div style={{ fontSize: '14px', color: '#424242', fontWeight: 500 }}>
                          {item.segment}
                        </div>
                        <div style={{ fontSize: '12px', color: '#757575' }}>
                          {item.percent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Alerts Section - Updated for even layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            alignItems: 'stretch'
          }}>
            {/* Today's Orders - Redesigned with Card UI */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                padding: '20px', 
                borderBottom: '1px solid #f0f0f0',
                background: 'linear-gradient(90deg, #00B074 0%, #3FC1C9 100%)',
                color: '#fff'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Today's Orders (Customer + Procurement)</h3>
              </div>
              
              <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                {loadingOrders ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #00B074', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '16px', color: '#757575' }}>Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <p style={{ color: '#757575' }}>No orders found for today.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {visibleOrders.map((order) => (
                      <div 
                        key={order.order_id || order.procurement_id || order.id} 
                        style={{ 
                          backgroundColor: '#f9f9f9', 
                          borderRadius: '12px', 
                          padding: '16px', 
                          borderLeft: `4px solid ${order.type === 'Customer' ? '#66bb6a' : '#64b5f6'}`,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ 
                                backgroundColor: order.type === 'Customer' ? '#66bb6a' : '#64b5f6', 
                                color: '#fff', 
                                padding: '4px 10px', 
                                borderRadius: '20px', 
                                fontSize: '12px', 
                                fontWeight: 'bold',
                                marginRight: '12px'
                              }}>
                                {order.type}
                              </span>
                              <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                                #{order.order_id || order.procurement_id || order.id}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ color: '#757575', fontSize: '14px', marginRight: '20px' }}>
                                <span style={{ marginRight: '6px' }}>👤</span>
                                {order.driver
                                  ? `${order.driver.first_name} ${order.driver.last_name}`
                                  : order.DriversDetail
                                  ? `${order.DriversDetail.first_name} ${order.DriversDetail.last_name}`
                                  : order.driver
                                  ? `${order.driver.first_name} ${order.driver.last_name}`
                                  : 'Unassigned'}
                              </span>
                              
                              <span style={{ color: '#757575', fontSize: '14px' }}>
                                <span style={{ marginRight: '6px' }}>💰</span>
                                {order.total_amount || order.charges !== null && order.charges !== undefined
                                  ? `₹${order.total_amount || order.charges}`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span
                              style={{
                                backgroundColor: getStatusColor(order.status),
                                color: getStatusTextColor(order.status),
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span style={{ marginRight: '6px' }}>{getStatusIcon(order.status)}</span>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!loadingOrders && orders.length > 2 && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        backgroundColor: "#00B074",
                        border: "none",
                        borderRadius: "30px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 8px rgba(0,176,116,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#00965f';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,176,116,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#00B074';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,176,116,0.3)';
                      }}
                    >
                      {showAllOrders ? 'Show Less Orders' : 'Show All Orders'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alerts - Redesigned with Alert UI */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ 
                padding: '20px', 
                borderBottom: '1px solid #f0f0f0',
                background: 'linear-gradient(90deg, #FF5252 0%, #FF8A80 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '20px', marginRight: '10px' }}>⚠️</span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Low Stock Alerts</h3>
              </div>
              
              <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                {loadingLowStock ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #FF5252', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <p style={{ marginTop: '16px', color: '#757575' }}>Checking inventory...</p>
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <p style={{ color: '#757575' }}>All products are well stocked.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {visibleItems.map((item, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: item.urgency === 'high' ? '#fff5f5' : '#fffbf0',
                          borderRadius: '12px',
                          padding: '16px',
                          borderLeft: `4px solid ${item.urgency === 'high' ? '#f44336' : '#ff9800'}`,
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          {item.urgency === 'high' ? (
                            <span style={{ backgroundColor: '#f44336', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(244,67,54,0.3)' }}>
                              HIGH
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#ff9800', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(255,152,0,0.3)' }}>
                              MEDIUM
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <span style={{ 
                            color: item.urgency === 'high' ? '#f44336' : '#ff9800', 
                            marginRight: '16px', 
                            fontSize: '28px' 
                          }}>
                            {item.urgency === 'high' ? '🔥' : '⚠️'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 600, color: '#333', margin: '0 0 12px 0', fontSize: '16px' }}>
                              {item.name}
                            </h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', color: '#757575' }}>Current Stock:</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.urgency === 'high' ? '#f44336' : '#ff9800' }}>
                                  {item.current}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '14px', color: '#757575' }}>Threshold:</span>
                                <span style={{ fontSize: '14px', color: '#333' }}>
                                  {item.threshold}
                                </span>
                              </div>
                            </div>
                            
                            <button
                              style={{
                                marginTop: '16px',
                                padding: '8px 16px',
                                backgroundColor: item.urgency === 'high' ? '#f44336' : '#ff9800',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                width: '100%',
                                transition: 'all 0.2s ease',
                                boxShadow: `0 4px 8px ${item.urgency === 'high' ? 'rgba(244,67,54,0.3)' : 'rgba(255,152,0,0.3)'}`
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = item.urgency === 'high' ? '#d32f2f' : '#f57c00';
                                e.currentTarget.style.boxShadow = `0 6px 12px ${item.urgency === 'high' ? 'rgba(244,67,54,0.4)' : 'rgba(255,152,0,0.4)'}`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = item.urgency === 'high' ? '#f44336' : '#ff9800';
                                e.currentTarget.style.boxShadow = `0 4px 8px ${item.urgency === 'high' ? 'rgba(244,67,54,0.3)' : 'rgba(255,152,0,0.3)'}`;
                              }}
                            >
                              {item.urgency === 'high' ? 'Restock Immediately' : 'Schedule Restock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!loadingLowStock && lowStockItems.length > 2 && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowAllLowStock(!showAllLowStock)}
                      style={{
                        padding: '10px 20px',
                        cursor: 'pointer',
                        backgroundColor: "#FF5252",
                        border: "none",
                        borderRadius: "30px",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 8px rgba(255,82,82,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e53935';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(255,82,82,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF5252';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(255,82,82,0.3)';
                      }}
                    >
                      {showAllLowStock ? 'Show Less Alerts' : 'Show All Alerts'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;