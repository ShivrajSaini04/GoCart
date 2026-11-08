import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut,
  Plus, Search, Pencil, Trash2, AlertTriangle, IndianRupee,
  Clock, CheckCircle2, ChevronLeft, ChevronRight, UserCircle,
  Eye, MapPin, ExternalLink
} from 'lucide-react';
import '../style/adminDashboard.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const PER_PAGE = 8;

const AdminDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Data
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active tab
  const [tab, setTab] = useState('overview'); // overview | products | orders | users

  // Search / filter
  const [productSearch, setProductSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Pagination
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  // Edit modal
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Status update modal
  const [statusOrder, setStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // View order full details modal
  const [viewOrder, setViewOrder] = useState(null);

  const token = localStorage.getItem('gocartToken');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  // ─── Fetch ────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/orders`, { headers: authHeader }).then(r => r.json()),
        fetch(`${API_BASE}/products`).then(r => r.json()),
        fetch(`${API_BASE}/users`, { headers: authHeader }).then(r => r.json()),
      ]);
      setOrders(Array.isArray(ordersRes) ? ordersRes : []);
      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch {
      setError('Failed to load dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ─── Derived stats ────────────────────────────────────
  const totalIncome = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  // ─── Filtered / paginated lists ───────────────────────
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );
  const productPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pagedProducts = filteredProducts.slice((productPage - 1) * PER_PAGE, productPage * PER_PAGE);

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter);
  const orderPages = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const pagedOrders = filteredOrders.slice((orderPage - 1) * PER_PAGE, orderPage * PER_PAGE);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const userPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const pagedUsers = filteredUsers.slice((userPage - 1) * PER_PAGE, userPage * PER_PAGE);

  // ─── Direct Navigation from KPI Cards ─────────────────
  const navigateToProducts = () => {
    setTab('products');
    setProductSearch('');
    setProductPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToOrders = (filter = 'all') => {
    setTab('orders');
    setOrderFilter(filter);
    setOrderPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToUsers = () => {
    setTab('users');
    setUserSearch('');
    setUserPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Actions ──────────────────────────────────────────
  const handleDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${API_BASE}/products/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader });
      setProducts(prev => prev.filter(p => p._id !== deleteTarget._id));
    } catch { /* silent */ }
    setDeleteTarget(null);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setEditForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    setEditImage(null);
  };

  const handleEditSave = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (editImage) fd.append('image', editImage);
      const res = await fetch(`${API_BASE}/products/${editProduct._id}`, {
        method: 'PUT', headers: authHeader, body: fd,
      });
      if (res.ok) {
        const updated = await res.json();
        setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
      }
    } catch { /* silent */ }
    setSaving(false);
    setEditProduct(null);
  };

  const handleStatusUpdate = async () => {
    if (!statusOrder || !newStatus) return;
    try {
      await fetch(`${API_BASE}/orders/${statusOrder._id}/status`, {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders(prev => prev.map(o => o._id === statusOrder._id ? { ...o, status: newStatus } : o));
      if (viewOrder && viewOrder._id === statusOrder._id) {
        setViewOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch { /* silent */ }
    setStatusOrder(null);
    setNewStatus('');
  };

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  // ─── Helpers ──────────────────────────────────────────
  const formatPrice = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const statusColor = (s) => {
    if (s === 'delivered') return { background: '#e6ffed', color: '#1e7b46' };
    if (s === 'shipped') return { background: '#f0f4ff', color: '#2563eb' };
    return { background: '#fff7e6', color: '#b45309' };
  };

  const roleStyle = (r) => {
    if (r === 'admin') return { background: '#fff0e6', color: '#e65100' };
    return { background: '#f4f7fb', color: '#4a5568' };
  };

  // ─── Loading / Error ──────────────────────────────────
  if (loading) return (
    <div className="admin-page">
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="admin-page">
      <div className="admin-error">
        <AlertTriangle size={48} />
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button className="admin-btn-retry" onClick={fetchAll}>Try Again</button>
      </div>
    </div>
  );

  // ─── Tabs array ───────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'Products', icon: <Package size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
  ];

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="admin-page">

      {/* ── Header ── */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
          <p>Manage your store, track orders, and monitor performance</p>
        </div>
        <div className="admin-header-right">
          <div className="admin-user-info">
            <UserCircle size={20} />
            <span className="admin-user-name">{user?.name || 'Admin'}</span>
          </div>
          <button className="admin-btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* ── Tab Nav ── */}
      <nav className="admin-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`admin-nav-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
        <Link to="/admin/add-product" className="admin-nav-item admin-add-product">
          <Plus size={18} /> Add Product
        </Link>
      </nav>

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {tab === 'overview' && (
        <section className="admin-overview">
          {/* KPI Cards — Clickable with Direct Navigation to Exact Details */}
          <div className="admin-kpi-grid">
            {/* 1. Total Products */}
            <div
              className="admin-kpi-card admin-kpi-products"
              onClick={navigateToProducts}
              role="button"
              tabIndex={0}
              title="Click to view all products and stock details"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToProducts()}
            >
              <div className="admin-kpi-icon"><Package size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Total Products</span>
                <span className="admin-kpi-value">{products.length}</span>
                <span className="admin-kpi-action">View all {products.length} products <ChevronRight size={13} /></span>
              </div>
            </div>

            {/* 2. Total Orders */}
            <div
              className="admin-kpi-card admin-kpi-orders"
              onClick={() => navigateToOrders('all')}
              role="button"
              tabIndex={0}
              title="Click to view full list of customer orders"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToOrders('all')}
            >
              <div className="admin-kpi-icon"><ShoppingCart size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Total Orders</span>
                <span className="admin-kpi-value">{orders.length}</span>
                <span className="admin-kpi-action">View all {orders.length} orders <ChevronRight size={13} /></span>
              </div>
            </div>

            {/* 3. Pending Orders */}
            <div
              className="admin-kpi-card admin-kpi-pending"
              onClick={() => navigateToOrders('pending')}
              role="button"
              tabIndex={0}
              title="Click to view and process pending orders"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToOrders('pending')}
            >
              <div className="admin-kpi-icon"><Clock size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Pending</span>
                <span className="admin-kpi-value">{pendingCount}</span>
                {pendingCount > 0 ? (
                  <span className="admin-kpi-trend admin-trend-warn">Needs attention • Click to review →</span>
                ) : (
                  <span className="admin-kpi-action">View pending orders <ChevronRight size={13} /></span>
                )}
              </div>
            </div>

            {/* 4. Total Revenue */}
            <div
              className="admin-kpi-card admin-kpi-income"
              onClick={() => navigateToOrders('all')}
              role="button"
              tabIndex={0}
              title="Click to view sales and order details"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToOrders('all')}
            >
              <div className="admin-kpi-icon"><IndianRupee size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Total Revenue</span>
                <span className="admin-kpi-value">{formatPrice(totalIncome)}</span>
                <span className="admin-kpi-action">View sales transactions <ChevronRight size={13} /></span>
              </div>
            </div>

            {/* 5. Registered Users */}
            <div
              className="admin-kpi-card admin-kpi-users"
              onClick={navigateToUsers}
              role="button"
              tabIndex={0}
              title="Click to view user accounts and verification details"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToUsers()}
            >
              <div className="admin-kpi-icon"><Users size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Registered Users</span>
                <span className="admin-kpi-value">{users.length}</span>
                <span className="admin-kpi-action">View {users.length} user accounts <ChevronRight size={13} /></span>
              </div>
            </div>

            {/* 6. Delivered Orders */}
            <div
              className="admin-kpi-card admin-kpi-placed"
              onClick={() => navigateToOrders('delivered')}
              role="button"
              tabIndex={0}
              title="Click to view delivered orders"
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateToOrders('delivered')}
            >
              <div className="admin-kpi-icon"><CheckCircle2 size={26} /></div>
              <div className="admin-kpi-content">
                <span className="admin-kpi-label">Delivered</span>
                <span className="admin-kpi-value">{deliveredCount}</span>
                <span className="admin-kpi-action" style={{ color: '#16a34a' }}>View {deliveredCount} delivered <ChevronRight size={13} /></span>
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="admin-overview-grid">
            {/* Order breakdown */}
            <div className="admin-panel">
              <h3>Order Status Breakdown <span style={{ fontSize: '0.8rem', color: '#8a94a6', fontWeight: 400 }}>(Click row to filter)</span></h3>
              <div className="admin-status-list">
                {[
                  { label: 'Pending', filter: 'pending', count: pendingCount, color: '#f59e0b' },
                  { label: 'Shipped', filter: 'shipped', count: shippedCount, color: '#2563eb' },
                  { label: 'Delivered', filter: 'delivered', count: deliveredCount, color: '#16a34a' },
                ].map(s => (
                  <div
                    className="admin-status-row"
                    key={s.label}
                    onClick={() => navigateToOrders(s.filter)}
                    role="button"
                    tabIndex={0}
                    title={`Click to view all ${s.label.toLowerCase()} orders`}
                  >
                    <span className="admin-status-name">{s.label}</span>
                    <div className="admin-status-bar">
                      <div
                        className="admin-status-fill"
                        style={{
                          width: orders.length ? `${(s.count / orders.length) * 100}%` : '0%',
                          background: s.color,
                        }}
                      />
                    </div>
                    <span className="admin-status-count">{s.count} <ChevronRight size={12} style={{ verticalAlign: -1, color: '#a0aec0' }} /></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent orders */}
            <div className="admin-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ margin: 0 }}>Recent Orders</h3>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#ff6b00', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => navigateToOrders('all')}
                >
                  View All ({orders.length}) →
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="admin-empty">No orders yet</p>
              ) : (
                <div className="admin-recent-list">
                  {orders.slice(0, 5).map(o => (
                    <div
                      className="admin-recent-item"
                      key={o._id}
                      onClick={() => setViewOrder(o)}
                      role="button"
                      tabIndex={0}
                      title="Click to view full order details"
                    >
                      <div className="admin-recent-user">
                        <UserCircle size={20} />
                        <div>
                          <strong>{o.user?.name || o.address?.fullname || 'Customer'}</strong>
                          <small>{formatDate(o.createdAt)} • #{o._id?.slice(-6)}</small>
                        </div>
                      </div>
                      <div className="admin-recent-meta">
                        <span className="admin-badge-status" style={statusColor(o.status)}>
                          {o.status}
                        </span>
                        <span className="admin-recent-amount">{formatPrice(o.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ PRODUCTS TAB ══════════════ */}
      {tab === 'products' && (
        <section className="admin-products">
          <div className="admin-panel-top">
            <div className="admin-panel-title"><h2>All Products ({filteredProducts.length})</h2></div>
            <div className="admin-panel-actions">
              <div className="admin-search-box">
                <Search size={18} />
                <input
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={e => { setProductSearch(e.target.value); setProductPage(1); }}
                />
              </div>
              <Link to="/admin/add-product" className="admin-btn-primary"><Plus size={18} /> Add Product</Link>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedProducts.length === 0 ? (
                  <tr><td colSpan="6" className="admin-empty-row">No products found</td></tr>
                ) : pagedProducts.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={p.imageUrl} alt={p.name} />
                        <div>
                          <div className="admin-product-name">{p.name}</div>
                          <div className="admin-product-id">#{p._id?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td>{formatPrice(p.price)}</td>
                    <td className={p.stock <= 5 ? 'admin-low-stock' : ''}>{p.stock}{p.stock <= 5 ? ' ⚠' : ''}</td>
                    <td>{p.rating ? `${p.rating} ★` : '—'}</td>
                    <td>
                      <div className="admin-actions-cell">
                        <button className="admin-btn-icon admin-btn-edit" onClick={() => openEdit(p)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="admin-btn-icon admin-btn-delete" onClick={() => setDeleteTarget(p)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-pagination-btn" disabled={productPage <= 1} onClick={() => setProductPage(p => p - 1)}><ChevronLeft size={16} /> Previous</button>
              <span className="admin-pagination-info">Page {productPage} of {productPages}</span>
              <button className="admin-pagination-btn" disabled={productPage >= productPages} onClick={() => setProductPage(p => p + 1)}>Next <ChevronRight size={16} /></button>
            </div>
          )}
        </section>
      )}

      {/* ══════════════ ORDERS TAB ══════════════ */}
      {tab === 'orders' && (
        <section className="admin-orders">
          <div className="admin-panel-top">
            <div className="admin-panel-title">
              <h2>
                {orderFilter === 'all'
                  ? `All Orders (${filteredOrders.length})`
                  : `${orderFilter.toUpperCase()} Orders (${filteredOrders.length})`}
              </h2>
            </div>
            <div className="admin-panel-actions">
              <select className="admin-select" value={orderFilter} onChange={e => { setOrderFilter(e.target.value); setOrderPage(1); }}>
                <option value="all">All Status ({orders.length})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="shipped">Shipped ({shippedCount})</option>
                <option value="delivered">Delivered ({deliveredCount})</option>
              </select>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.length === 0 ? (
                  <tr><td colSpan="7" className="admin-empty-row">No orders found for status: {orderFilter}</td></tr>
                ) : pagedOrders.map(o => (
                  <tr key={o._id}>
                    <td>
                      <span
                        className="admin-order-id admin-order-id-clickable"
                        onClick={() => setViewOrder(o)}
                        title="Click to view full order details"
                      >
                        #{o._id?.slice(-6)}
                      </span>
                    </td>
                    <td>{o.user?.name || o.address?.fullname || o.user?.email || '—'}</td>
                    <td>
                      {o.items?.map((it, i) => (
                        <span className="admin-item-tag" key={i}>
                          {it.product?.name?.split(' ').slice(0, 3).join(' ') || 'Product'} ×{it.quantity}
                        </span>
                      ))}
                    </td>
                    <td><strong>{formatPrice(o.totalAmount)}</strong></td>
                    <td><span className="admin-badge-status" style={statusColor(o.status)}>{o.status}</span></td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          className="admin-btn-icon admin-btn-view"
                          onClick={() => setViewOrder(o)}
                          title="View order details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="admin-btn-icon admin-btn-edit"
                          onClick={() => { setStatusOrder(o); setNewStatus(o.status); }}
                          title="Update status"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orderPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-pagination-btn" disabled={orderPage <= 1} onClick={() => setOrderPage(p => p - 1)}><ChevronLeft size={16} /> Previous</button>
              <span className="admin-pagination-info">Page {orderPage} of {orderPages}</span>
              <button className="admin-pagination-btn" disabled={orderPage >= orderPages} onClick={() => setOrderPage(p => p + 1)}>Next <ChevronRight size={16} /></button>
            </div>
          )}
        </section>
      )}

      {/* ══════════════ USERS TAB ══════════════ */}
      {tab === 'users' && (
        <section className="admin-users">
          <div className="admin-panel-top">
            <div className="admin-panel-title"><h2>Registered Users ({filteredUsers.length})</h2></div>
            <div className="admin-panel-actions">
              <div className="admin-search-box">
                <Search size={18} />
                <input
                  placeholder="Search by name or email…"
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setUserPage(1); }}
                />
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Email Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.length === 0 ? (
                  <tr><td colSpan="6" className="admin-empty-row">No users found</td></tr>
                ) : pagedUsers.map((u, idx) => (
                  <tr key={u._id}>
                    <td>{(userPage - 1) * PER_PAGE + idx + 1}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="admin-badge-role" style={roleStyle(u.role)}>{u.role}</span></td>
                    <td>{u.verified ? <span className="admin-verified">Verified ✓</span> : <span className="admin-pending">Pending</span>}</td>
                    <td>{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userPages > 1 && (
            <div className="admin-pagination">
              <button className="admin-pagination-btn" disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)}><ChevronLeft size={16} /> Previous</button>
              <span className="admin-pagination-info">Page {userPage} of {userPages}</span>
              <button className="admin-pagination-btn" disabled={userPage >= userPages} onClick={() => setUserPage(p => p + 1)}>Next <ChevronRight size={16} /></button>
            </div>
          )}
        </section>
      )}

      {/* ══════════════ VIEW ORDER DETAILS MODAL ══════════════ */}
      {viewOrder && (
        <div className="admin-modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 660 }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Order #{viewOrder._id?.slice(-8).toUpperCase()}</h3>
                <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  Placed on {formatDate(viewOrder.createdAt)}
                </span>
              </div>
              <button className="admin-modal-close" onClick={() => setViewOrder(null)}>×</button>
            </div>
            <div style={{ padding: '22px 26px' }}>
              {/* Customer & Status Header */}
              <div className="admin-order-detail-grid">
                <div className="admin-order-detail-box">
                  <div className="admin-order-detail-label">Customer Information</div>
                  <div className="admin-order-detail-val">{viewOrder.user?.name || viewOrder.address?.fullname || 'Customer'}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6c757d', marginTop: 3 }}>
                    {viewOrder.user?.email || 'No account email recorded'}
                  </div>
                </div>
                <div className="admin-order-detail-box">
                  <div className="admin-order-detail-label">Delivery Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span className="admin-badge-status" style={statusColor(viewOrder.status)}>
                      {viewOrder.status}
                    </span>
                    <button
                      className="admin-btn-icon admin-btn-edit"
                      style={{ width: 28, height: 28 }}
                      onClick={() => {
                        const cur = viewOrder;
                        setViewOrder(null);
                        setStatusOrder(cur);
                        setNewStatus(cur.status);
                      }}
                      title="Update order status"
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="admin-order-detail-box" style={{ marginBottom: 18 }}>
                <div className="admin-order-detail-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} /> Shipping Destination
                </div>
                <div className="admin-order-detail-val" style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  <strong>{viewOrder.address?.fullname || viewOrder.user?.name}</strong><br />
                  {viewOrder.address?.street}<br />
                  {viewOrder.address?.city}, {viewOrder.address?.postalCode}<br />
                  {viewOrder.address?.country}
                </div>
              </div>

              {/* Order Items */}
              <div className="admin-order-detail-label">
                Purchased Sneakers ({viewOrder.items?.reduce((s, it) => s + (it.quantity || 1), 0)} pairs)
              </div>
              <div className="admin-order-items-list">
                {viewOrder.items?.map((it, idx) => (
                  <div className="admin-order-item-card" key={idx}>
                    {it.product?.imageUrl ? (
                      <img src={it.product.imageUrl} alt={it.product?.name || 'Sneaker'} className="admin-order-item-img" />
                    ) : (
                      <div className="admin-order-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="#8a94a6" />
                      </div>
                    )}
                    <div className="admin-order-item-info">
                      <div className="admin-order-item-name">{it.product?.name || 'Sneaker Item'}</div>
                      <div className="admin-order-item-meta">
                        Qty: {it.quantity} × {formatPrice(it.price || it.product?.price || 0)}
                      </div>
                    </div>
                    <div className="admin-order-item-price">
                      {formatPrice((it.price || it.product?.price || 0) * (it.quantity || 1))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment & Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid #e6e9f0', marginTop: 14 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 700, textTransform: 'uppercase' }}>Payment Reference</div>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#1d2939', marginTop: 2 }}>
                    {viewOrder.paymentId ? viewOrder.paymentId : 'Razorpay / Prepaid Order'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 700, textTransform: 'uppercase' }}>Total Amount Paid</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111111' }}>
                    {formatPrice(viewOrder.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: 14 }}>
                <button className="admin-btn-secondary" onClick={() => setViewOrder(null)}>Close</button>
                <button
                  className="admin-btn-primary"
                  onClick={() => {
                    const cur = viewOrder;
                    setViewOrder(null);
                    setStatusOrder(cur);
                    setNewStatus(cur.status);
                  }}
                >
                  <Pencil size={15} /> Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ EDIT PRODUCT MODAL ══════════════ */}
      {editProduct && (
        <div className="admin-modal-overlay" onClick={() => setEditProduct(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Product</h3>
              <button className="admin-modal-close" onClick={() => setEditProduct(null)}>×</button>
            </div>
            <div style={{ padding: '22px 26px' }}>
              <div className="admin-form-group">
                <label>Product Name</label>
                <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={editForm.price || ''} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div className="admin-form-group">
                  <label>Stock</label>
                  <input type="number" value={editForm.stock || ''} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Category</label>
                <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea rows={3} value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="admin-form-group">
                <label>Replace Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setEditImage(e.target.files?.[0] || null)} />
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn-secondary" onClick={() => setEditProduct(null)}>Cancel</button>
                <button className="admin-btn-primary" disabled={saving} onClick={handleEditSave}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ DELETE CONFIRM MODAL ══════════════ */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-modal-small" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Delete Product</h3>
              <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div style={{ padding: '22px 26px' }}>
              <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.</p>
              <div className="admin-modal-actions" style={{ marginTop: 20 }}>
                <button className="admin-btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="admin-btn-primary admin-btn-delete" onClick={handleDeleteProduct}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ STATUS UPDATE MODAL ══════════════ */}
      {statusOrder && (
        <div className="admin-modal-overlay" onClick={() => setStatusOrder(null)}>
          <div className="admin-modal admin-modal-small" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Update Order Status</h3>
              <button className="admin-modal-close" onClick={() => setStatusOrder(null)}>×</button>
            </div>
            <div style={{ padding: '22px 26px' }}>
              <p style={{ marginBottom: 16 }}>Order <strong>#{statusOrder._id?.slice(-6)}</strong> — {statusOrder.user?.name || statusOrder.address?.fullname || 'Customer'}</p>
              <div className="admin-form-group">
                <label>New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button className="admin-btn-secondary" onClick={() => setStatusOrder(null)}>Cancel</button>
                <button className="admin-btn-primary" onClick={handleStatusUpdate}>Update Status</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
