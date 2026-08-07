import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { id: 'sales', label: 'Bán hàng', icon: 'cart' },
  { id: 'products', label: 'Sản phẩm', icon: 'box' },
  { id: 'orders', label: 'Đơn hàng', icon: 'clipboard' },
  { id: 'reports', label: 'Báo cáo', icon: 'chart' },
];

const categories = ['Tất cả', 'Đồ uống', 'Ăn vặt', 'Combo'];

const initialProducts = [
  { id: 'peach-tea', name: 'Trà đào cam sả', category: 'Đồ uống', price: 35000, sold: 128, revenue: 2816000, accent: 'orange', icon: '🍊', stock: 42 },
  { id: 'fries', name: 'Khoai tây lắc phô mai', category: 'Ăn vặt', price: 39000, sold: 96, revenue: 1728000, accent: 'green', icon: '🍟', stock: 24 },
  { id: 'tokbokki', name: 'Tokbokki sốt cay', category: 'Ăn vặt', price: 45000, sold: 72, revenue: 1368000, accent: 'red', icon: '🍲', stock: 18 },
  { id: 'matcha', name: 'Trà sữa matcha', category: 'Đồ uống', price: 39000, sold: 64, revenue: 1248000, accent: 'lime', icon: '🥤', stock: 31 },
  { id: 'combo', name: 'Combo ăn vặt', category: 'Combo', price: 69000, sold: 51, revenue: 1098000, accent: 'yellow', icon: '🍿', stock: 12 },
  { id: 'lemon-tea', name: 'Trà chanh', category: 'Đồ uống', price: 29000, sold: 44, revenue: 638000, accent: 'lemon', icon: '🍋', stock: 38 },
];

const initialOrders = [
  { id: '#F-1048', customer: 'Khách tại quầy', items: '2x Trà đào cam sả, 1x Tokbokki sốt cay', total: 115000, status: 'Đang xử lý', time: '09:24', tone: 'pending' },
  { id: '#F-1047', customer: 'Nguyễn Minh', items: '1x Khoai tây lắc phô mai, 2x Trà đào cam sả', total: 109000, status: 'Hoàn tất', time: '09:05', tone: 'success' },
  { id: '#F-1046', customer: 'Trần Anh', items: '1x Combo ăn vặt, 1x Trà đào cam sả', total: 104000, status: 'Hoàn tất', time: '08:42', tone: 'success' },
  { id: '#F-1045', customer: 'Khách đặt online', items: '2x Trà sữa matcha', total: 78000, status: 'Hoàn tất', time: '08:27', tone: 'success' },
  { id: '#F-1044', customer: 'Lê Hà', items: '1x Tokbokki sốt cay, 1x Trà chanh', total: 74000, status: 'Đã hủy', time: '08:04', tone: 'cancelled' },
];

const revenuePoints = [
  { day: 'Sáu', date: '01/08', value: 3200000 },
  { day: 'Bảy', date: '02/08', value: 5100000 },
  { day: 'CN', date: '03/08', value: 3500000 },
  { day: 'Hai', date: '04/08', value: 4100000 },
  { day: 'Ba', date: '05/08', value: 6000000 },
  { day: 'Tư', date: '06/08', value: 5500000 },
  { day: 'Năm', date: '07/08', value: 8450000 },
];

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
const compactMoney = (value) => `${new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)} ₫`;
const STORAGE_KEY = 'fresh-sales-manager:v1';
const BASE_TODAY_STATS = { revenue: 8450000, orders: 86 };

function readStoredState() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return stored?.version === 1 ? stored : {};
  } catch {
    return {};
  }
}

const toneForStatus = (status) => ({ 'Đang xử lý': 'pending', 'Hoàn tất': 'success', 'Đã hủy': 'cancelled' }[status] || 'pending');

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    cart: <><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 1.9-1.5L21 8H6" /></>,
    box: <><path d="m4 7 8-4 8 4v10l-8 4-8-4Z" /><path d="m4 7 8 4 8-4M12 11v10" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h5" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-5 3 2 5-7" /><path d="M19 5h-3M19 5v3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.4 4.4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    down: <path d="m6 9 6 6 6-6" />,
    up: <><path d="m6 15 6-6 6 6" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    trendUp: <><path d="m4 16 5-5 4 3 7-8" /><path d="M15 6h5v5" /></>,
    trendDown: <><path d="m4 8 5 5 4-3 7 8" /><path d="M15 18h5v-5" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    dollar: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.7-1.7-1.1-3-1.1-1.6 0-2.7.8-2.7 2 0 3.1 5.5 1.2 5.5 4.2 0 1.2-1.1 2.1-2.8 2.1-1.3 0-2.4-.4-3.1-1.2M12 5v14" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4Z" /><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6Z" /></>,
    store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 20v-5h6v5" /></>,
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}

function FreshMark({ compact = false }) {
  return <div className={`fresh-mark ${compact ? 'is-compact' : ''}`}><span className="fresh-leaf">⌁</span><span>fresh</span></div>;
}

function Sidebar({ activeView, onNavigate }) {
  return <aside className="sidebar">
    <div className="sidebar-brand"><FreshMark /></div>
    <nav className="side-nav" aria-label="Điều hướng chính">
      {navItems.map((item) => <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
        <Icon name={item.icon} size={20} />
        <span>{item.label}</span>
      </button>)}
    </nav>
    <div className="sidebar-profile">
      <div className="store-avatar"><Icon name="store" size={18} /></div>
      <div><strong>fresh</strong><span>Chủ cửa hàng</span></div>
      <Icon name="down" size={16} />
    </div>
  </aside>;
}

function MobileNav({ activeView, onNavigate }) {
  return <nav className="mobile-nav" aria-label="Điều hướng di động">
    {navItems.map((item) => <button key={item.id} className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
      <Icon name={item.icon} size={19} />
      <span>{item.label}</span>
    </button>)}
  </nav>;
}

function Topbar({ title, globalSearch, onSearch, onMenu, onNotification }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Mở menu"><Icon name="menu" size={22} /></button>
    <h1>{title}</h1>
    <div className="topbar-tools">
      <label className="global-search"><Icon name="search" size={18} /><input value={globalSearch} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm kiếm đơn hàng, sản phẩm..." /></label>
      <button className="icon-button notification" onClick={onNotification} aria-label="Thông báo"><Icon name="bell" size={21} /><span>3</span></button>
      <div className="user-menu"><div className="user-avatar">NH</div><Icon name="down" size={16} /></div>
    </div>
  </header>;
}

function StatCard({ label, value, change, trend = 'up', icon }) {
  return <article className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value-row"><strong>{value}</strong><span className={`stat-icon ${trend === 'down' ? 'warm' : ''}`}><Icon name={icon} size={19} /></span></div>
    <div className={`stat-change ${trend === 'down' ? 'down' : ''}`}><Icon name={trend === 'down' ? 'trendDown' : 'trendUp'} size={14} /> {change}<span>so với hôm qua</span></div>
  </article>;
}

function RevenueChart({ compact = false }) {
  const width = compact ? 280 : 640;
  const height = compact ? 142 : 210;
  const left = compact ? 22 : 42;
  const right = compact ? 12 : 18;
  const top = compact ? 18 : 24;
  const bottom = compact ? 34 : 38;
  const max = 12000000;
  const usableWidth = width - left - right;
  const usableHeight = height - top - bottom;
  const coordinates = revenuePoints.map((point, index) => ({
    x: left + (usableWidth / (revenuePoints.length - 1)) * index,
    y: top + usableHeight - (point.value / max) * usableHeight,
    ...point,
  }));
  const line = coordinates.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${left},${top + usableHeight} ${line} ${left + usableWidth},${top + usableHeight}`;
  const labels = compact ? coordinates.filter((_, index) => index % 2 === 0 || index === coordinates.length - 1) : coordinates;

  return <div className={`chart-wrap ${compact ? 'compact' : ''}`}>
    <svg className="revenue-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ doanh thu 7 ngày">
      <defs><linearGradient id={`chart-fill-${compact ? 'small' : 'large'}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#54c890" stopOpacity=".24" /><stop offset="1" stopColor="#54c890" stopOpacity=".02" /></linearGradient></defs>
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => <line key={ratio} x1={left} x2={left + usableWidth} y1={top + usableHeight * ratio} y2={top + usableHeight * ratio} className="chart-grid" />)}
      {!compact && [0, 3000000, 6000000, 9000000, 12000000].map((value) => <text key={value} x="0" y={top + usableHeight - (value / max) * usableHeight + 4} className="chart-axis">{value === 0 ? '0 ₫' : `${value / 1000000}M ₫`}</text>)}
      <polygon points={area} fill={`url(#chart-fill-${compact ? 'small' : 'large'})`} />
      <polyline points={line} className="chart-line" />
      {coordinates.map((point, index) => <circle key={point.date} cx={point.x} cy={point.y} r={index === coordinates.length - 1 ? 4.5 : 3.5} className={index === coordinates.length - 1 ? 'chart-point selected' : 'chart-point'} />)}
      {!compact && <g className="chart-tooltip"><rect x={coordinates[6].x - 52} y={coordinates[6].y - 53} width="86" height="42" rx="8" /><text x={coordinates[6].x - 40} y={coordinates[6].y - 36}>07/08</text><text x={coordinates[6].x - 40} y={coordinates[6].y - 19}>{money(8450000)}</text></g>}
      {labels.map((point) => <g key={point.date}><text x={point.x} y={height - 17} className="chart-day" textAnchor="middle">{point.day}</text><text x={point.x} y={height - 3} className="chart-date" textAnchor="middle">{point.date}</text></g>)}
    </svg>
  </div>;
}

function SectionHeading({ title, action, onAction }) {
  return <div className="section-heading"><h2>{title}</h2>{action && <button className="text-button" onClick={onAction}>{action}</button>}</div>;
}

function StatusBadge({ tone, children }) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

function OrderList({ orders, compact = false, onSelect }) {
  if (compact) return <div className="compact-orders">
    {orders.slice(0, 3).map((order) => <button className="compact-order" key={order.id} onClick={() => onSelect?.(order)}>
      <div><strong>{order.id}</strong><span>{order.customer}</span></div><div className="compact-order-meta"><time>{order.time}</time><StatusBadge tone={order.tone}>{order.status}</StatusBadge></div>
    </button>)}
  </div>;

  return <div className="orders-table-wrap"><table className="orders-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thời gian</th><th aria-label="Chi tiết" /></tr></thead><tbody>
    {orders.map((order) => <tr key={order.id} onClick={() => onSelect?.(order)}><td><strong className="order-id">{order.id}</strong></td><td>{order.customer}</td><td className="order-items">{order.items}</td><td><strong>{money(order.total)}</strong></td><td><StatusBadge tone={order.tone}>{order.status}</StatusBadge></td><td>{order.time}</td><td><Icon name="chevron" size={17} /></td></tr>)}
  </tbody></table></div>;
}

function ProductArt({ product, small = false }) {
  return <div className={`product-art ${product.accent} ${small ? 'small' : ''}`} aria-hidden="true"><span>{product.icon}</span></div>;
}

function QuantityControl({ quantity, onDecrease, onIncrease, disabled = false }) {
  return <div className={`quantity-control ${disabled ? 'disabled' : ''}`}>
    <button onClick={onDecrease} disabled={disabled || quantity === 0} aria-label="Giảm số lượng"><Icon name="minus" size={15} /></button><span>{quantity}</span><button onClick={onIncrease} disabled={disabled} aria-label="Tăng số lượng"><Icon name="plus" size={15} /></button>
  </div>;
}

function QuickOrderPanel({ products, basket, onQuantityChange, onCheckout, full = false }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Tất cả' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, category, search]);
  const basketItems = products.filter((product) => basket[product.id] > 0);
  const totalItems = basketItems.reduce((sum, product) => sum + basket[product.id], 0);
  const total = basketItems.reduce((sum, product) => sum + product.price * basket[product.id], 0);

  return <section className={`quick-order-panel ${full ? 'full' : ''}`}>
    <SectionHeading title="Tạo đơn nhanh" />
    <label className="local-search"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm món ăn hoặc đồ uống" /></label>
    <div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="quick-product-list">
      {filteredProducts.map((product) => <div className="quick-product" key={product.id}><ProductArt product={product} small /><div className="quick-product-info"><strong>{product.name}</strong><span>{money(product.price)}</span></div><QuantityControl quantity={basket[product.id] || 0} onDecrease={() => onQuantityChange(product.id, -1)} onIncrease={() => onQuantityChange(product.id, 1)} /></div>)}
      {filteredProducts.length === 0 && <div className="empty-state small-empty"><Icon name="search" size={22} /><p>Không tìm thấy món phù hợp</p></div>}
    </div>
    <div className="basket-summary"><div><span>Tổng cộng ({totalItems} món)</span><strong>{money(total)}</strong></div><button className="primary-button full-button" onClick={onCheckout} disabled={!totalItems}><Icon name="cart" size={18} /> Tạo đơn</button></div>
  </section>;
}

function BestSellers({ products, onNavigate }) {
  const bestSellers = [...products].sort((first, second) => second.sold - first.sold).slice(0, 3);
  return <section className="best-sellers"><SectionHeading title="Món bán chạy" action="Xem tất cả" onAction={() => onNavigate('products')} /><div className="best-seller-list">
    {bestSellers.map((product, index) => <div className="best-seller" key={product.id}><div className={`rank rank-${index + 1}`}>{index + 1}</div><ProductArt product={product} small /><div className="best-seller-copy"><strong>{product.name}</strong><span>{product.sold} phần</span><small>Doanh thu {money(product.revenue)}</small></div></div>)}
  </div></section>;
}

function Overview({ products, orders, basket, stats, onQuantityChange, onCheckout, onNavigate, onSelectOrder }) {
  return <div className="page-content overview-page">
    <div className="welcome-row"><div><h2>Chào buổi sáng, Fresh</h2><p>Thứ Năm, 07 tháng 08, 2026</p></div><button className="primary-button" onClick={() => onNavigate('sales')}><Icon name="plus" size={18} /> Tạo đơn mới</button></div>
    <div className="stats-grid"><StatCard label="Doanh thu hôm nay" value={money(stats.revenue)} change="18,6%" icon="dollar" /><StatCard label="Đơn hàng hôm nay" value={stats.orders} change="12,5%" icon="cart" /><StatCard label="Giá trị trung bình" value={money(stats.average)} change="4,3%" trend="down" icon="trendUp" /></div>
    <div className="dashboard-grid"><div className="main-column"><section className="chart-panel"><SectionHeading title="Doanh thu 7 ngày" /><RevenueChart /></section><section className="orders-panel"><SectionHeading title="Đơn hàng gần đây" action="Xem tất cả" onAction={() => onNavigate('orders')} /><OrderList orders={orders} onSelect={onSelectOrder} /></section><BestSellers products={products} onNavigate={onNavigate} /></div><div className="order-rail"><QuickOrderPanel products={products} basket={basket} onQuantityChange={onQuantityChange} onCheckout={onCheckout} /></div></div>
  </div>;
}

function SalesPage({ products, basket, onQuantityChange, onCheckout }) {
  const [category, setCategory] = useState('Tất cả');
  const visibleProducts = category === 'Tất cả' ? products : products.filter((product) => product.category === category);
  return <div className="page-content sales-page"><div className="page-intro"><div><h2>Bán hàng</h2><p>Chọn món để thêm vào đơn mới.</p></div><span className="live-status"><span /> Đang mở cửa</span></div><div className="sales-layout"><div className="sales-catalog"><div className="catalog-header"><div><h3>Thực đơn hôm nay</h3><p>{visibleProducts.length} món đang hiển thị</p></div><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Lọc thực đơn">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="catalog-grid">{visibleProducts.map((product) => <article className="catalog-product" key={product.id}><ProductArt product /><div className="catalog-product-body"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3><strong>{money(product.price)}</strong></div><button className="add-product-button" onClick={() => onQuantityChange(product.id, 1)} aria-label={`Thêm ${product.name}`}><Icon name="plus" size={17} /></button></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Chưa có món trong danh mục này</p></div>}</div><QuickOrderPanel products={products} basket={basket} onQuantityChange={onQuantityChange} onCheckout={onCheckout} full /></div></div>;
}

function ProductsPage({ products, searchValue, onSearch, onCreateProduct, onEditProduct, onDeleteProduct }) {
  const [category, setCategory] = useState('Tất cả');
  const filteredProducts = products.filter((product) => {
    const query = searchValue.trim().toLowerCase();
    return (category === 'Tất cả' || product.category === category) && (!query || `${product.name} ${product.category}`.toLowerCase().includes(query));
  });
  return <div className="page-content"><div className="page-intro"><div><h2>Sản phẩm</h2><p>Quản lý thực đơn, giá bán và tồn kho.</p></div><button className="primary-button" onClick={onCreateProduct}><Icon name="plus" size={18} /> Thêm sản phẩm</button></div><section className="management-panel"><div className="management-toolbar"><label className="local-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm sản phẩm..." /></label><div className="toolbar-actions"><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Lọc danh mục">{categories.map((item) => <option key={item}>{item}</option>)}</select><button className="icon-button" aria-label="Xem báo cáo sản phẩm"><Icon name="chart" size={18} /></button></div></div><div className="products-table-wrap"><table className="products-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Đã bán</th><th>Tồn kho</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="table-product"><ProductArt product small /><strong>{product.name}</strong></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong></td><td>{product.sold} phần</td><td><span className={`stock ${product.stock < 15 ? 'low' : ''}`}>{product.stock} phần</span></td><td><div className="row-actions"><button className="icon-button small-icon" aria-label={`Sửa ${product.name}`} onClick={() => onEditProduct(product)}><Icon name="edit" size={16} /></button><button className="icon-button small-icon" aria-label={`Xóa ${product.name}`} onClick={() => onDeleteProduct(product)}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody></table>{filteredProducts.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không có sản phẩm phù hợp</p></div>}</div></section></div>;
}

function OrdersPage({ orders, searchValue, onSearch, onSelectOrder, onExport }) {
  const [filter, setFilter] = useState('Tất cả');
  const filtered = orders.filter((order) => {
    const query = searchValue.trim().toLowerCase();
    const matchesFilter = filter === 'Tất cả' || order.status === filter;
    const matchesSearch = !query || `${order.id} ${order.customer} ${order.items}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
  return <div className="page-content"><div className="page-intro"><div><h2>Đơn hàng</h2><p>Theo dõi và xử lý toàn bộ đơn hàng của Fresh.</p></div><button className="outline-button" onClick={onExport}><Icon name="filter" size={17} /> Xuất báo cáo</button></div><section className="management-panel"><div className="orders-toolbar"><div className="filter-tabs">{['Tất cả', 'Đang xử lý', 'Hoàn tất', 'Đã hủy'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}<span>{item === 'Tất cả' ? orders.length : orders.filter((order) => order.status === item).length}</span></button>)}</div><label className="local-search compact-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm mã đơn hoặc khách hàng..." /></label></div><OrderList orders={filtered} onSelect={onSelectOrder} />{filtered.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không tìm thấy đơn hàng</p></div>}</section></div>;
}

function ProductFormModal({ product, onClose, onSave }) {
  const [draft, setDraft] = useState(() => product ? { ...product, price: String(product.price), stock: String(product.stock) } : { name: '', category: 'Ăn vặt', price: '', stock: '', icon: '🍡', accent: 'purple' });
  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const canSave = draft.name.trim() && Number(draft.price) > 0 && Number(draft.stock) >= 0;
  const submit = (event) => {
    event.preventDefault();
    if (!canSave) return;
    onSave({ ...draft, name: draft.name.trim(), price: Number(draft.price), stock: Number(draft.stock), sold: product?.sold || 0, revenue: product?.revenue || 0 });
  };
  return <div className="modal-backdrop" onClick={onClose}><form className="form-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="detail-header"><div><span>{product ? 'Chỉnh sửa thông tin' : 'Thêm sản phẩm mới'}</span><h2>{product ? product.name : 'Món mới'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="form-grid"><label><span>Tên sản phẩm</span><input value={draft.name} onChange={(event) => updateDraft('name', event.target.value)} placeholder="Ví dụ: Gà viên phô mai" autoFocus /></label><label><span>Danh mục</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Giá bán (₫)</span><input type="number" min="0" step="1000" value={draft.price} onChange={(event) => updateDraft('price', event.target.value)} placeholder="35000" /></label><label><span>Tồn kho</span><input type="number" min="0" step="1" value={draft.stock} onChange={(event) => updateDraft('stock', event.target.value)} placeholder="20" /></label><label><span>Biểu tượng món</span><input value={draft.icon} onChange={(event) => updateDraft('icon', event.target.value)} placeholder="🍡" maxLength="4" /></label><label><span>Màu hiển thị</span><select value={draft.accent} onChange={(event) => updateDraft('accent', event.target.value)}><option value="orange">Cam</option><option value="green">Xanh</option><option value="red">Đỏ</option><option value="lime">Xanh chanh</option><option value="yellow">Vàng</option><option value="lemon">Vàng chanh</option><option value="purple">Tím</option></select></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Hủy</button><button type="submit" className="primary-button" disabled={!canSave}>{product ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button></div></form></div>;
}

function CheckoutModal({ products, basket, onClose, onConfirm }) {
  const [customer, setCustomer] = useState('Khách tại quầy');
  const [payment, setPayment] = useState('Tiền mặt');
  const [note, setNote] = useState('');
  const items = products.filter((product) => basket[product.id] > 0);
  const total = items.reduce((sum, product) => sum + product.price * basket[product.id], 0);
  const submit = (event) => { event.preventDefault(); onConfirm({ customer: customer.trim() || 'Khách tại quầy', payment, note: note.trim() }); };
  return <div className="modal-backdrop" onClick={onClose}><form className="form-modal checkout-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="detail-header"><div><span>Hoàn tất đơn hàng</span><h2>Xác nhận thanh toán</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="checkout-items">{items.map((product) => <div className="checkout-item" key={product.id}><span>{basket[product.id]}x {product.name}</span><strong>{money(product.price * basket[product.id])}</strong></div>)}</div><div className="checkout-total"><span>Tổng thanh toán</span><strong>{money(total)}</strong></div><div className="form-grid"><label><span>Tên khách hàng</span><input value={customer} onChange={(event) => setCustomer(event.target.value)} /></label><label><span>Phương thức thanh toán</span><select value={payment} onChange={(event) => setPayment(event.target.value)}><option>Tiền mặt</option><option>Chuyển khoản</option><option>Ví điện tử</option></select></label><label className="full-field"><span>Ghi chú đơn hàng</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: ít cay, giao tại quầy..." rows="2" /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Quay lại</button><button type="submit" className="primary-button"><Icon name="check" size={17} /> Xác nhận tạo đơn</button></div></form></div>;
}

function MobileMenuSheet({ open, activeView, onNavigate, onClose }) {
  if (!open) return null;
  return <div className="modal-backdrop mobile-menu-backdrop" onClick={onClose}><aside className="mobile-menu-sheet" onClick={(event) => event.stopPropagation()}><div className="detail-header"><div><span>Điều hướng</span><h2>fresh</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng menu"><Icon name="close" size={19} /></button></div><nav className="mobile-sheet-nav">{navItems.map((item) => <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => { onNavigate(item.id); onClose(); }}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}</nav></aside></div>;
}

function ReportsPage({ stats, products, orders }) {
  const completedOrders = orders.filter((order) => order.status === 'Hoàn tất').length;
  const bestSeller = [...products].sort((first, second) => second.sold - first.sold)[0];
  return <div className="page-content"><div className="page-intro"><div><h2>Báo cáo</h2><p>Nhìn nhanh hiệu quả kinh doanh của cửa hàng.</p></div><button className="outline-button"><Icon name="chart" size={17} /> Tuần này <Icon name="down" size={15} /></button></div><div className="report-grid"><section className="chart-panel report-chart"><SectionHeading title="Doanh thu 7 ngày" /><RevenueChart /></section><section className="report-summary"><SectionHeading title="Tóm tắt hôm nay" /><div className="report-metric"><span>Tổng doanh thu</span><strong>{money(stats.revenue)}</strong><small className="positive">+18,6% so với hôm qua</small></div><div className="report-metric"><span>Số đơn hoàn tất</span><strong>{completedOrders} / {stats.orders}</strong><small>{stats.orders ? `${((completedOrders / stats.orders) * 100).toFixed(1).replace('.', ',')}% tỷ lệ hoàn tất` : 'Chưa có đơn hàng'}</small></div><div className="report-metric"><span>Món bán chạy nhất</span><strong>{bestSeller?.name || 'Chưa có dữ liệu'}</strong><small>{bestSeller ? `${bestSeller.sold} phần trong tuần` : 'Thêm sản phẩm để xem báo cáo'}</small></div></section></div><section className="category-performance"><SectionHeading title="Doanh thu theo danh mục" /><div className="category-bars"><div><span>Đồ uống</span><strong>{money(4732000)}</strong><i><em style={{ width: '78%' }} /></i></div><div><span>Ăn vặt</span><strong>{money(3824000)}</strong><i><em style={{ width: '63%' }} /></i></div><div><span>Combo</span><strong>{money(1098000)}</strong><i><em style={{ width: '25%' }} /></i></div></div></section></div>;
}

function OrderDetail({ order, onClose, onStatusChange, onPrint }) {
  if (!order) return null;
  const nextStatus = order.status === 'Đang xử lý' ? 'Hoàn tất' : order.status === 'Hoàn tất' ? null : 'Đang xử lý';
  return <div className="modal-backdrop" onClick={onClose}><aside className="order-detail" onClick={(event) => event.stopPropagation()}><div className="detail-header"><div><span>Chi tiết đơn hàng</span><h2>{order.id}</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="detail-status"><StatusBadge tone={order.tone}>{order.status}</StatusBadge><span>{order.time} · {order.customer}</span></div><div className="detail-items"><h3>Món đã gọi</h3><div className="detail-item"><div><strong>{order.items.split(',')[0]}</strong><span>{order.payment || 'Tiền mặt'} · {order.customer}</span></div><strong>{money(order.total)}</strong></div>{order.items.split(',').slice(1).map((item) => <div className="detail-item detail-item-secondary" key={item}><span>{item.trim()}</span></div>)}</div><div className="detail-total"><span>Tổng thanh toán</span><strong>{money(order.total)}</strong></div><div className="detail-actions">{nextStatus && <button className="primary-button" onClick={() => onStatusChange(order.id, nextStatus)}><Icon name="check" size={17} /> {nextStatus === 'Hoàn tất' ? 'Đánh dấu hoàn tất' : 'Mở lại đơn'}</button>}<button className="outline-button" onClick={onPrint}><Icon name="clipboard" size={17} /> In hóa đơn</button><button className="outline-button full-button" onClick={onClose}>Đóng chi tiết</button></div></aside></div>;
}

function App() {
  const [activeView, setActiveView] = useState('overview');
  const [persisted] = useState(readStoredState);
  const [products, setProducts] = useState(() => Array.isArray(persisted.products) && persisted.products.length ? persisted.products : initialProducts);
  const [orders, setOrders] = useState(() => Array.isArray(persisted.orders) && persisted.orders.length ? persisted.orders : initialOrders);
  const [basket, setBasket] = useState(() => persisted.basket || { 'peach-tea': 2, tokbokki: 1 });
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, products, orders, basket }));
    } catch {
      // Local storage is a convenience layer; the UI still works if it is blocked.
    }
  }, [products, orders, basket]);

  const pageTitles = { overview: 'Tổng quan', sales: 'Bán hàng', products: 'Sản phẩm', orders: 'Đơn hàng', reports: 'Báo cáo' };
  const navigate = (view) => { setActiveView(view); setGlobalSearch(''); };
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const changeQuantity = (productId, amount) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const nextQuantity = Math.max(0, (basket[productId] || 0) + amount);
    if (amount > 0 && nextQuantity > product.stock) {
      notify(`Món ${product.name} chỉ còn ${product.stock} phần`);
      return;
    }
    setBasket((current) => {
      return { ...current, [productId]: Math.max(0, (current[productId] || 0) + amount) };
    });
  };
  const openCheckout = () => {
    const items = products.filter((product) => basket[product.id] > 0);
    if (items.length) setCheckoutOpen(true);
  };
  const completeCheckout = ({ customer, payment, note }) => {
    const items = products.filter((product) => basket[product.id] > 0);
    const total = items.reduce((sum, product) => sum + product.price * basket[product.id], 0);
    if (!items.length) return;
    const newOrderNumber = 1049 + Math.max(0, orders.length - initialOrders.length);
    const newOrder = { id: `#F-${newOrderNumber}`, customer, items: items.map((item) => `${basket[item.id]}x ${item.name}`).join(', '), total, payment, note, status: 'Đang xử lý', time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), tone: 'pending' };
    setOrders((current) => [newOrder, ...current]);
    setProducts((current) => current.map((product) => {
      const quantity = basket[product.id] || 0;
      return quantity ? { ...product, stock: Math.max(0, product.stock - quantity), sold: product.sold + quantity, revenue: product.revenue + product.price * quantity } : product;
    }));
    setBasket({});
    setCheckoutOpen(false);
    setActiveView('orders');
    notify(`Đã tạo đơn ${newOrder.id} thành công`);
  };
  const saveProduct = (draft) => {
    const product = { ...draft, id: draft.id || `product-${Date.now()}` };
    setProducts((current) => draft.id ? current.map((item) => item.id === draft.id ? { ...item, ...product } : item) : [...current, product]);
    setProductModal({ open: false, product: null });
    notify(draft.id ? 'Đã lưu thay đổi sản phẩm' : 'Đã thêm sản phẩm mới');
  };
  const deleteProduct = (product) => {
    if (!window.confirm(`Xóa sản phẩm “${product.name}” khỏi thực đơn?`)) return;
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setBasket((current) => { const next = { ...current }; delete next[product.id]; return next; });
    notify(`Đã xóa ${product.name}`);
  };
  const updateOrderStatus = (orderId, status) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status, tone: toneForStatus(status) } : order));
    setSelectedOrder((current) => current?.id === orderId ? { ...current, status, tone: toneForStatus(status) } : current);
    notify(`Đơn ${orderId} đã chuyển sang “${status}”`);
  };
  const exportOrders = () => {
    const rows = [['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái', 'Thời gian'], ...orders.map((order) => [order.id, order.customer, order.items, order.total, order.status, order.time])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `fresh-don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Đã xuất file danh sách đơn hàng');
  };

  const newOrders = orders.length > initialOrders.length ? orders.slice(0, orders.length - initialOrders.length) : [];
  const todayRevenue = BASE_TODAY_STATS.revenue + newOrders.filter((order) => order.status !== 'Đã hủy').reduce((sum, order) => sum + order.total, 0);
  const todayOrderCount = BASE_TODAY_STATS.orders + newOrders.filter((order) => order.status !== 'Đã hủy').length;
  const stats = { revenue: todayRevenue, orders: todayOrderCount, average: todayOrderCount ? Math.round(todayRevenue / todayOrderCount) : 0 };

  let content;
  if (activeView === 'overview') content = <Overview products={products} orders={orders} stats={stats} basket={basket} onQuantityChange={changeQuantity} onCheckout={openCheckout} onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
  if (activeView === 'sales') content = <SalesPage products={products} basket={basket} onQuantityChange={changeQuantity} onCheckout={openCheckout} />;
  if (activeView === 'products') content = <ProductsPage products={products} searchValue={globalSearch} onSearch={setGlobalSearch} onCreateProduct={() => setProductModal({ open: true, product: null })} onEditProduct={(product) => setProductModal({ open: true, product })} onDeleteProduct={deleteProduct} />;
  if (activeView === 'orders') content = <OrdersPage orders={orders} searchValue={globalSearch} onSearch={setGlobalSearch} onSelectOrder={setSelectedOrder} onExport={exportOrders} />;
  if (activeView === 'reports') content = <ReportsPage stats={stats} products={products} orders={orders} />;

  return <div className="app-shell"><Sidebar activeView={activeView} onNavigate={navigate} /><main className="main-shell"><Topbar title={pageTitles[activeView]} globalSearch={globalSearch} onSearch={setGlobalSearch} onMenu={() => setMenuOpen(true)} onNotification={() => notify('Bạn có 3 thông báo cần xem')} /><div className="content-scroll">{content}</div></main><MobileNav activeView={activeView} onNavigate={navigate} /><MobileMenuSheet open={menuOpen} activeView={activeView} onNavigate={navigate} onClose={() => setMenuOpen(false)} /><OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateOrderStatus} onPrint={() => { window.print(); }} />{productModal.open && <ProductFormModal product={productModal.product} onClose={() => setProductModal({ open: false, product: null })} onSave={saveProduct} />}{checkoutOpen && <CheckoutModal products={products} basket={basket} onClose={() => setCheckoutOpen(false)} onConfirm={completeCheckout} />}{toast && <div className="toast"><span className="toast-check"><Icon name="check" size={16} /></span>{toast}</div>}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
