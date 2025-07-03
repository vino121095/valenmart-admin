import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';

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
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);

  const chartRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [customersRes, vendorsRes, driversRes, deliveriesRes] = await Promise.all([
          fetch('http://localhost:8000/api/customer-profile/all'),
          fetch('http://localhost:8000/api/vendor/all'),
          fetch('http://localhost:8000/api/driver-details/all'),
          fetch('http://localhost:8000/api/delivery/all')
        ]);
        const customersData = await customersRes.json();
        const vendorsData = await vendorsRes.json();
        const driversData = await driversRes.json();
        const deliveriesData = await deliveriesRes.json();
        // Only count deliveries with status 'Completed'
        let completedDeliveries = 0;
        if (Array.isArray(deliveriesData)) {
          completedDeliveries = deliveriesData.filter(d => d.status === 'Completed').length;
        } else if (Array.isArray(deliveriesData.data)) {
          completedDeliveries = deliveriesData.data.filter(d => d.status === 'Completed').length;
        }
        setStats({
          customers: customersData.data ? customersData.data.length : 0,
          vendors: vendorsData.data ? vendorsData.data.length : 0,
          drivers: driversData.data ? driversData.data.length : 0,
          deliveries: completedDeliveries
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
        // For demo, use deliveries as today's orders (filter by today's date if needed)
        const deliveriesRes = await fetch('http://localhost:8000/api/delivery/all');
        const deliveriesData = await deliveriesRes.json();
        let ordersArr = Array.isArray(deliveriesData) ? deliveriesData : deliveriesData.data || [];
        // Optionally filter for today's date
        // const today = new Date().toISOString().split('T')[0];
        // ordersArr = ordersArr.filter(o => o.date === today);
        setOrders(ordersArr);
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
        const productsRes = await fetch('http://localhost:8000/api/product/all');
        const productsData = await productsRes.json();
        const products = productsData.data || [];
        // Simulate low stock: unit === '1'
        const lowStock = products.filter(p => parseInt(p.unit) <= 10).map(p => ({
          name: p.product_name,
          current: `${p.unit} unit`,
          threshold: 'Restock soon'
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

  // Fetch Sales Insights (simulate by type count)
  useEffect(() => {
    const fetchSales = async () => {
      setLoadingSales(true);
      try {
        const deliveriesRes = await fetch('http://localhost:8000/api/delivery/all');
        const deliveriesData = await deliveriesRes.json();
        const deliveries = Array.isArray(deliveriesData) ? deliveriesData : deliveriesData.data || [];
        // Count by type
        const vendorCount = deliveries.filter(d => d.type === 'Vendor').length;
        const customerCount = deliveries.filter(d => d.type === 'Customer').length;
        // For demo, split into 3 segments
        setSalesData([
          { segment: 'Vendor Deliveries', percentage: vendorCount, color: '#64b5f6' },
          { segment: 'Customer Deliveries', percentage: customerCount, color: '#66bb6a' },
          { segment: 'Other', percentage: deliveries.length - vendorCount - customerCount, color: '#ef5350' }
        ]);
      } catch (err) {
        setSalesData([]);
      } finally {
        setLoadingSales(false);
      }
    };
    fetchSales();
  }, []);

  const statsCards = [
    { title: 'Total Customers', value: stats.customers !== null ? stats.customers : '...', growth: '+1.03%', trend: 'up' },
    { title: 'Total Vendors', value: stats.vendors !== null ? stats.vendors : '...', growth: '+0.85%', trend: 'up' },
    { title: 'Total Drivers', value: stats.drivers !== null ? stats.drivers : '...', growth: '+0.93%', trend: 'up' },
    { title: 'Total Deliveries', value: stats.deliveries !== null ? stats.deliveries : '...', growth: '+0.68%', trend: 'up' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#d4f5d3';
      case 'Active': return '#fff2cc';
      case 'Processing': return '#d1e3f8';
      case 'Pending': return '#ffded9';
      default: return '#f0f0f0';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'Completed': return '#218838';
      case 'Active': return '#856404';
      case 'Processing': return '#0c5460';
      case 'Pending': return '#721c24';
      default: return '#333333';
    }
  };

  // Mock data for chart - would be replaced with actual chart component
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calculate sales percentages for donut chart
  const totalSales = salesData.reduce((sum, s) => sum + s.percentage, 0) || 1;
  const salesDataWithPercent = salesData.map(s => ({ ...s, percent: ((s.percentage / totalSales) * 100).toFixed(0) }));

  function downloadCSV(orders) {
    if (!orders || orders.length === 0) return;
    const header = ['Order ID', 'Driver', 'Type', 'Status', 'Charges'];
    const rows = orders.map(order => [
      order.id,
      order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : '-',
      order.type,
      order.status,
      order.charges !== null && order.charges !== undefined ? order.charges : '-'
    ]);
    const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-summary-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const downloadChartImage = () => {
    if (!chartRef.current) return;
    html2canvas(chartRef.current, { backgroundColor: null }).then(canvas => {
      const link = document.createElement('a');
      link.download = `order-summary-chart-${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f6f5fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {/* <header style={{ 
        backgroundColor: '#fff', 
        padding: '16px', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            height: '32px', 
            width: '32px', 
            backgroundColor: '#e0e0e0', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px'
          }}>
            Logo
          </div>
          <div style={{ position: 'relative', width: '320px' }}>
            <input 
              type="text" 
              placeholder="Search here..." 
              style={{
                width: '100%',
                padding: '8px 16px 8px 40px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '8px', color: '#9e9e9e' }}>
              🔍
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '20px', color: '#757575' }}>🔔</span>
            <span style={{ 
              position: 'absolute', 
              top: '-5px', 
              right: '-5px', 
              height: '16px', 
              width: '16px', 
              backgroundColor: '#2196f3', 
              borderRadius: '50%', 
              color: 'white', 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              3
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: '20px', color: '#757575' }}>💬</span>
            <span style={{ 
              position: 'absolute', 
              top: '-5px', 
              right: '-5px', 
              height: '16px', 
              width: '16px', 
              backgroundColor: '#2196f3', 
              borderRadius: '50%', 
              color: 'white', 
              fontSize: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              5
            </span>
          </div>
          <span style={{ fontSize: '20px', color: '#757575' }}>⚙️</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>Hello, John</span>
            <div style={{ 
              height: '32px', 
              width: '32px', 
              backgroundColor: '#bdbdbd', 
              borderRadius: '50%', 
              overflow: 'hidden' 
            }}>
              <div style={{ height: '100%', width: '100%', backgroundColor: '#757575' }}></div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        {/* <aside style={{ 
          width: '224px', 
          backgroundColor: '#fff', 
          borderRight: '1px solid #e0e0e0', 
          padding: '16px' 
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ 
              backgroundColor: '#e8f5e9', 
              color: '#2e7d32', 
              borderRadius: '4px', 
              padding: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px' 
            }}>
              <span style={{ color: '#4caf50' }}>◆</span>
              Dashboard
            </div>
            {[
              'Customer Order Management',
              'Procurement Order Management',
              'Product Management',
              'Inventory Management',
              'Vendor/Farmer Management',
              'Driver & Delivery Management',
              'Customer Management',
              'Invoice & Payment Tracking',
              'Reports & Analytics',
              'Settings & Configuration'
            ].map((item, index) => (
              <div key={index} style={{ 
                padding: '12px', 
                borderRadius: '4px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                cursor: 'pointer'
              }}>
                <span style={{ color: '#9e9e9e' }}>◆</span>
                <span style={{ color: '#616161' }}>{item}</span>
              </div>
            ))}
          </nav>
        </aside> */}

        {/* Dashboard Content */}
        <main style={{ flex: 1, padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Dashboard</h2>
            <p style={{ color: '#757575', margin: '8px 0 0 0' }}>Hi, John. Welcome back to Velanmart Admin!</p>
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px', 
            marginBottom: '24px' 
          }}>
            {statsCards.map((card, index) => (
              <div key={index} style={{ 
                backgroundColor: '#fff', 
                padding: '24px', 
                borderRadius: '8px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
              }}>
                <h3 style={{ fontSize: '14px', color: '#757575', marginTop: 0, marginBottom: '8px' }}>{card.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', fontWeight: 700 }}>{loading ? '...' : card.value}</span>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#4caf50', fontSize: '14px' }}>
                    <span style={{ marginRight: '4px' }}>↑</span>
                    {card.growth}
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
            {/* Order Summary */}
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '24px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Order Summary</h3>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#4caf50',
                    fontSize: '14px',
                    border: '1px solid #4caf50',
                    borderRadius: '4px',
                    padding: '4px 12px'
                  }}
                  onClick={downloadChartImage}
                >
                  <span style={{ marginRight: '4px' }}>⬇️</span>
                  Save Report
                </button>
              </div>
              <p style={{ color: '#9e9e9e', fontSize: '14px', marginBottom: '24px' }}>Total Orders: {loadingOrders ? '...' : orders.length}</p>
              {/* Chart - In a real app, replace with actual chart component */}
              <div ref={chartRef} style={{ height: '256px', position: 'relative' }}>
                {/* Simple line chart simulation */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: '192px', 
                  borderTop: '1px solid #e0e0e0' 
                }}>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <div style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      background: 'linear-gradient(to top, rgba(200, 230, 201, 0.5), transparent)' 
                    }}></div>
                    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                      {daysOfWeek.map((day, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div 
                            style={{ 
                              height: `${Math.floor(Math.random() * 80) + 20}px`,
                              width: '5px',
                              backgroundColor: '#4CAF50'
                            }}
                          ></div>
                          <span style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>{day.substring(0, 3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Sample data point */}
                <div style={{ 
                  position: 'absolute', 
                  left: '33%', 
                  bottom: '50%', 
                  backgroundColor: '#fff', 
                  border: '2px solid #4caf50', 
                  borderRadius: '50%', 
                  height: '16px', 
                  width: '16px' 
                }}></div>
                <div style={{ position: 'absolute', left: '33%', bottom: '33%', fontSize: '12px', color: '#616161' }}>
                  <div>{loadingOrders ? '...' : orders.length} Orders</div>
                  <div style={{ color: '#9e9e9e' }}>{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Sales Insights */}
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '24px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginTop: 0, marginBottom: '24px' }}>Sales Insights</h3>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* Donut chart simulation */}
                <div style={{ position: 'relative', width: '192px', height: '192px' }}>
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    borderRadius: '50%', 
                    border: '8px solid #f5f5f5' 
                  }}></div>
                  {/* Simplified donut chart */}
                  <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
                    {salesDataWithPercent.reduce((acc, item, idx) => {
                      const prev = acc.offset;
                      const dash = (item.percent / 100) * 100;
                      acc.offset += dash;
                      acc.circles.push(
                        <circle
                          key={item.segment}
                          cx="50" cy="50" r="40" fill="transparent"
                          stroke={item.color}
                          strokeWidth="15"
                          strokeDasharray={`${dash} 100`}
                          strokeDashoffset={-prev}
                        />
                      );
                      return acc;
                    }, { offset: 0, circles: [] }).circles}
                  </svg>
                  {/* Center content */}
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '20px' }}>{loadingSales ? '...' : totalSales}</div>
                    <div style={{ fontSize: '12px', color: '#9e9e9e' }}>Total Deliveries</div>
                  </div>
                </div>
                {/* Legend */}
                <div style={{ marginLeft: '24px' }}>
                  {salesDataWithPercent.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ 
                        backgroundColor: item.color, 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '2px', 
                        marginRight: '8px' 
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#616161' }}>{item.segment} ({item.percent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Alerts Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px'
          }}>
            {/* Today's Orders */}
            <div style={{ 
              gridColumn: 'span 2', 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Today's Orders (Customer + Procurement)</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#4caf50', color: '#fff' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Driver</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Charges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>No orders found.</td></tr>
                    ) : orders.map((order, index) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px 16px' }}>{order.id}</td>
                        <td style={{ padding: '12px 16px' }}>{order.driver ? `${order.driver.first_name} ${order.driver.last_name}` : '-'}</td>
                        <td style={{ padding: '12px 16px' }}>{order.type}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            backgroundColor: getStatusColor(order.status),
                            color: getStatusTextColor(order.status),
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '14px'
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{order.charges !== null && order.charges !== undefined ? `₹${order.charges}` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div style={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Low Stock Alerts</h3>
              </div>
              <div style={{ padding: '16px' }}>
                {loadingLowStock ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>Loading...</div>
                ) : lowStockItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>No low stock items.</div>
                ) : lowStockItems.map((item, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#ffebee', 
                    padding: '16px', 
                    borderRadius: '8px',
                    marginBottom: index < lowStockItems.length - 1 ? '16px' : 0
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ color: '#f44336', marginRight: '8px', fontSize: '18px' }}>⚠️</span>
                      <div>
                        <h4 style={{ fontWeight: 500, color: '#f44336', margin: 0 }}>{item.name}</h4>
                        <p style={{ fontSize: '14px', marginTop: '4px', marginBottom: 0 }}>
                          Current : {item.current}<br />
                          Threshold : {item.threshold}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;