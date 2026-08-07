import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const navItems = [
  { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { id: 'tables', label: 'Bàn ăn', icon: 'table' },
  { id: 'kitchen', label: 'Màn hình bếp', icon: 'chef' },
  { id: 'products', label: 'Thực đơn', icon: 'box' },
  { id: 'staff', label: 'Nhân viên', icon: 'users' },
  { id: 'inventory', label: 'Kho nguyên liệu', icon: 'warehouse' },
  { id: 'orders', label: 'Đơn hàng', icon: 'clipboard' },
  { id: 'reports', label: 'Báo cáo', icon: 'chart' },
];

const categories = ['Tất cả', 'Coffee', 'Trà Sữa', 'Trà Trái Cây', 'Đá Xay', 'Sữa Chua', 'Nước Ép', 'Soda', 'Đồ Ăn Nhanh', 'Mỳ Cay', 'Pizza', 'Gà Rán & Sốt', 'Cơm Gà', 'Sét Gà', 'Set Gà', 'Bánh Mỳ', 'Khác', 'Đồ uống', 'Ăn vặt', 'Combo'];

const initialProducts = [
  { id: 'peach-tea', name: 'Trà đào cam sả', category: 'Đồ uống', price: 35000, sold: 128, revenue: 2816000, accent: 'orange', icon: '🍊', stock: 42 },
  { id: 'fries', name: 'Khoai tây lắc phô mai', category: 'Ăn vặt', price: 39000, sold: 96, revenue: 1728000, accent: 'green', icon: '🍟', stock: 24 },
  { id: 'tokbokki', name: 'Tokbokki sốt cay', category: 'Ăn vặt', price: 45000, sold: 72, revenue: 1368000, accent: 'red', icon: '🍲', stock: 18 },
  { id: 'matcha', name: 'Trà sữa matcha', category: 'Đồ uống', price: 39000, sold: 64, revenue: 1248000, accent: 'lime', icon: '🥤', stock: 31 },
  { id: 'combo', name: 'Combo ăn vặt', category: 'Combo', price: 69000, sold: 51, revenue: 1098000, accent: 'yellow', icon: '🍿', stock: 12 },
  { id: 'lemon-tea', name: 'Trà chanh', category: 'Đồ uống', price: 29000, sold: 44, revenue: 638000, accent: 'lemon', icon: '🍋', stock: 38 },
  { id: 'black-coffee', name: 'Coffee Đen', category: 'Coffee', price: 25000, sold: 38, revenue: 950000, accent: 'purple', icon: '☕', stock: 44 },
  { id: 'milk-tea', name: 'Trà Sữa Trân Châu Đường Đen', category: 'Trà Sữa', price: 30000, sold: 42, revenue: 1260000, accent: 'yellow', icon: '🧋', stock: 35 },
  { id: 'peach-mango', name: 'Trà Đào Cam Sả', category: 'Trà Trái Cây', price: 30000, sold: 32, revenue: 960000, accent: 'orange', icon: '🍑', stock: 29 },
  { id: 'matcha-ice', name: 'Đá Xay Matcha', category: 'Đá Xay', price: 30000, sold: 27, revenue: 810000, accent: 'lime', icon: '🍵', stock: 22 },
  { id: 'fried-chicken', name: 'Đùi Gà Chiên', category: 'Gà Rán & Sốt', price: 32000, sold: 25, revenue: 800000, accent: 'yellow', icon: '🍗', stock: 20 },
  { id: 'pizza', name: 'Pizza Hải Sản size S', category: 'Pizza', price: 50000, sold: 18, revenue: 900000, accent: 'red', icon: '🍕', stock: 15 },
  { id: 'spicy-noodle', name: 'Mỳ Kim Chi Hải Sản', category: 'Mỳ Cay', price: 50000, sold: 20, revenue: 1000000, accent: 'red', icon: '🍜', stock: 17 },
  { id: 'chicken-rice', name: 'Cơm Đùi Sốt Mắm', category: 'Cơm Gà', price: 50000, sold: 16, revenue: 800000, accent: 'orange', icon: '🍱', stock: 18 },
  { id: 'banh-mi', name: 'Bánh Mỳ Ấp Chảo Truyền Thống', category: 'Bánh Mỳ', price: 40000, sold: 14, revenue: 560000, accent: 'yellow', icon: '🥖', stock: 12 },
];

const userMenuCatalog = [
  [1,'Coffee Đen','Coffee',25000],[2,'Coffee Nâu','Coffee',25000],[3,'Coffee Kem Muối','Coffee',25000],[4,'Coffee Kem Trứng','Coffee',35000],[5,'Coffee Bạc Xỉu','Coffee',30000],[6,'Coffee Cốt Dừa','Coffee',36000],[7,'Phindi Hạnh Nhân','Coffee',30000],[8,'Phindi Caramel','Coffee',30000],
  [9,'Trà Sữa Trân Châu Đường Đen','Trà Sữa',30000],[10,'Trà Sữa Socola','Trà Sữa',30000],[11,'Trà Sữa Hồng Trà','Trà Sữa',30000],[12,'Trà Sữa Nhài','Trà Sữa',30000],[13,'Trà Sữa Ô Long','Trà Sữa',30000],[14,'Trà Sữa Dâu Tây','Trà Sữa',30000],[15,'Trà Sữa Kem Matcha','Trà Sữa',35000],[16,'Trà Sữa Hồng Trà Kem Mặn','Trà Sữa',35000],[17,'Trà Sữa Kem Trứng Dừa Nướng','Trà Sữa',35000],[18,'Sữa Tươi Trân Châu Đường Đen','Trà Sữa',30000],
  [19,'Trà Đào','Trà Trái Cây',20000],[20,'Trà Chanh','Trà Trái Cây',15000],[21,'Trà Quất Nha Đam','Trà Trái Cây',15000],[22,'Trà O Long Sen Vàng','Trà Trái Cây',35000],[23,'Trà Sen Lá Nếp','Trà Trái Cây',35000],[24,'Trà Xoài Chanh Dây','Trà Trái Cây',30000],[25,'Trà Cam Xoài','Trà Trái Cây',30000],[26,'Trà Kiwi','Trà Trái Cây',30000],[27,'Trà Đào Cam Sả','Trà Trái Cây',30000],
  [28,'Đá Xay Matcha','Đá Xay',30000],[29,'Đá Xay Việt Quất','Đá Xay',30000],[30,'Đá Xay Bạc Hà','Đá Xay',30000],[31,'Đá Xay Matcha Latte','Đá Xay',35000],[32,'Sữa Chua Kiều Mạch','Sữa Chua',35000],[33,'Sữa Chua Đá Xay','Sữa Chua',25000],[34,'Sữa Chua Xoài Dâu','Sữa Chua',30000],[35,'Sữa Chua Chanh Dây','Sữa Chua',30000],
  [36,'Nước Ép Cam','Nước Ép',30000],[37,'Nước Ép Dưa Hấu','Nước Ép',30000],[38,'Nước Ép Táo','Nước Ép',30000],[39,'Soda Việt Quất','Soda',25000],[40,'Soda Dâu','Soda',25000],[41,'Soda Bạc Hà','Soda',25000],[42,'Soda Biển Xanh','Soda',25000],[43,'Soda Táo','Soda',25000],
  [44,'Xúc Xích','Đồ Ăn Nhanh',10000],[45,'Lạp Xưởng','Đồ Ăn Nhanh',15000],[46,'Nem Chua Rán','Đồ Ăn Nhanh',35000],[47,'Phomai Que','Đồ Ăn Nhanh',30000],[48,'Chả Cá Chiên Viên','Đồ Ăn Nhanh',30000],[49,'Khoai Tây Lắc Phô Mai','Đồ Ăn Nhanh',30000],[50,'Khoai Lang Kén','Đồ Ăn Nhanh',30000],[51,'Kimbap Chiên','Đồ Ăn Nhanh',35000],[52,'Topokki Sốt Phomai','Đồ Ăn Nhanh',40000],[53,'Chân Gà Sốt Thái','Đồ Ăn Nhanh',55000],[54,'Xoài Lắc','Đồ Ăn Nhanh',30000],[55,'Mẹt Chiên 7 Món','Đồ Ăn Nhanh',90000],
  [56,'Mỳ Kim Chi Xúc Xích','Mỳ Cay',30000],[57,'Mỳ Kim Chi Thập Cẩm','Mỳ Cay',50000],[58,'Mỳ Kim Chi Hải Sản','Mỳ Cay',50000],[59,'Mỳ Bò Mỹ','Mỳ Cay',40000],[60,'Mỳ Sụn','Mỳ Cay',40000],
  [61,'Pizza Thập Cẩm (size S)','Pizza',40000],[62,'Pizza Thập Cẩm (size M)','Pizza',70000],[63,'Pizza Hải Sản (size S)','Pizza',50000],[64,'Pizza Hải Sản (size M)','Pizza',80000],[65,'Pizza Chicago','Pizza',70000],
  [66,'Đùi Gà Chiên','Gà Rán & Sốt',32000],[67,'Cánh Gà','Gà Rán & Sốt',32000],[68,'Miếng Gà Giòn','Gà Rán & Sốt',60000],[69,'Đùi/Cánh Sốt Hàn','Gà Rán & Sốt',35000],[70,'Đùi/Cánh Kem Hành','Gà Rán & Sốt',35000],[71,'Miếng Gà Giòn Sốt 3 Vị','Gà Rán & Sốt',70000],[72,'Đùi/Cánh Sốt Phomai','Gà Rán & Sốt',35000],
  [73,'Cơm Đùi Sốt Mắm','Cơm Gà',50000],[74,'Cơm Đùi Sốt Hàn','Cơm Gà',50000],[75,'Sét Cánh Gà Chiên Mắm','Cơm Gà',90000],[76,'Sét Gà Miếng + Kimmbap','Sét Gà',80000],[77,'Sét Gà Miếng + Khoai Tây','Sét Gà',80000],[78,'Sét Gà Miếng + Kimmbap (2 người)','Sét Gà',150000],
  [79,'Nem Nướng','Bánh Mỳ',40000],[80,'Bánh Mỳ Áp Chảo Truyền Thống','Bánh Mỳ',40000],[81,'Bánh Mỳ Áp Chảo Bò Tiêu','Bánh Mỳ',45000],[82,'Bò Húc','Khác',15000],[83,'Coca','Khác',10000],
].map(([id,name,category,price]) => ({ id:`menu-${id}`, name, category, price, available:true, sold:0, revenue:0, stock:50, accent:'orange', icon:'🍽️' }));

function mergeMenuProducts(savedProducts) {
  const saved = Array.isArray(savedProducts) && savedProducts.length ? savedProducts : [];
  const ids = new Set(saved.map((product) => product.id));
  const names = new Set(saved.map((product) => product.name.trim().toLowerCase()));
  const defaults = [...initialProducts, ...userMenuCatalog];
  const missing = defaults.filter((product) => !ids.has(product.id) && !names.has(product.name.trim().toLowerCase()));
  return saved.length ? [...saved, ...missing] : defaults;
}

const initialOrders = [
  { id: '#F-1048', customer: 'Khách tại quầy', table: 'Bàn 03', items: '2x Trà đào cam sả, 1x Tokbokki sốt cay', total: 115000, status: 'Đang xử lý', kitchenStatus: 'Chờ chế biến', time: '09:24', tone: 'pending' },
  { id: '#F-1047', customer: 'Nguyễn Minh', table: 'Bàn 05', items: '1x Khoai tây lắc phô mai, 2x Trà đào cam sả', total: 109000, status: 'Hoàn tất', kitchenStatus: 'Đã xong', time: '09:05', tone: 'success' },
  { id: '#F-1046', customer: 'Trần Anh', table: 'Bàn 01', items: '1x Combo ăn vặt, 1x Trà đào cam sả', total: 104000, status: 'Hoàn tất', kitchenStatus: 'Đã xong', time: '08:42', tone: 'success' },
  { id: '#F-1045', customer: 'Khách đặt online', table: 'Mang đi', items: '2x Trà sữa matcha', total: 78000, status: 'Hoàn tất', kitchenStatus: 'Đã xong', time: '08:27', tone: 'success' },
  { id: '#F-1044', customer: 'Lê Hà', table: 'Bàn 02', items: '1x Tokbokki sốt cay, 1x Trà chanh', total: 74000, status: 'Đã hủy', kitchenStatus: 'Chờ chế biến', time: '08:04', tone: 'cancelled' },
];

const initialTables = [
  { id: 'T01', name: 'Bàn 01', seats: 2, zone: 'Trong nhà', status: 'Đang phục vụ', orderId: '#F-1046', total: 104000, since: '08:42' },
  { id: 'T02', name: 'Bàn 02', seats: 4, zone: 'Trong nhà', status: 'Đặt trước', orderId: null, total: 0, since: '18:30' },
  { id: 'T03', name: 'Bàn 03', seats: 4, zone: 'Trong nhà', status: 'Đang phục vụ', orderId: '#F-1048', total: 115000, since: '09:24' },
  { id: 'T04', name: 'Bàn 04', seats: 6, zone: 'Trong nhà', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T05', name: 'Bàn 05', seats: 4, zone: 'Sân vườn', status: 'Chờ thanh toán', orderId: '#F-1047', total: 109000, since: '09:05' },
  { id: 'T06', name: 'Bàn 06', seats: 2, zone: 'Sân vườn', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T07', name: 'Bàn 07', seats: 4, zone: 'Sân vườn', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T08', name: 'Bàn 08', seats: 6, zone: 'Sân vườn', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T09', name: 'Bàn 09', seats: 2, zone: 'Tầng lửng', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T10', name: 'Bàn 10', seats: 4, zone: 'Tầng lửng', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T11', name: 'Bàn 11', seats: 4, zone: 'Tầng lửng', status: 'Trống', orderId: null, total: 0, since: null },
  { id: 'T12', name: 'Bàn 12', seats: 8, zone: 'Tầng lửng', status: 'Trống', orderId: null, total: 0, since: null },
];
const initialTables20 = [...initialTables, ...Array.from({ length: 8 }, (_, index) => ({ id: `T${String(index + 13).padStart(2, '0')}`, name: `Bàn ${index + 13}`, seats: [2, 4, 4, 6][index % 4], zone: 'Tầng lửng', status: 'Trống', orderId: null, total: 0, since: null }))];

const initialInventory = [
  { id: 'inv-tea', name: 'Trà đào & cam sả', group: 'Nguyên liệu đồ uống', unit: 'kg', stock: 12.5, minStock: 5, supplier: 'Fresh Beverage' },
  { id: 'inv-milk', name: 'Sữa tươi thanh trùng', group: 'Nguyên liệu đồ uống', unit: 'lít', stock: 18, minStock: 8, supplier: 'Nông trại xanh' },
  { id: 'inv-cheese', name: 'Phô mai lắc', group: 'Nguyên liệu bếp', unit: 'kg', stock: 3.2, minStock: 5, supplier: 'Bếp nhà hàng' },
  { id: 'inv-ricecake', name: 'Bánh gạo Hàn Quốc', group: 'Nguyên liệu bếp', unit: 'kg', stock: 8, minStock: 4, supplier: 'K-food supply' },
  { id: 'inv-cup', name: 'Ly nhựa 500ml', group: 'Bao bì', unit: 'cái', stock: 240, minStock: 100, supplier: 'Fresh Packaging' },
  { id: 'inv-potato', name: 'Khoai tây đông lạnh', group: 'Nguyên liệu bếp', unit: 'kg', stock: 2.5, minStock: 6, supplier: 'Bếp nhà hàng' },
];

const initialStaff = [
  { id: 'staff-1', name: 'Nguyễn Thị Lan', role: 'Quản lý', shift: 'Sáng (6h–14h)', phone: 'Chưa cập nhật', active: true },
  { id: 'staff-2', name: 'Trần Văn Minh', role: 'Phục vụ', shift: 'Sáng (6h–14h)', phone: 'Chưa cập nhật', active: true },
  { id: 'staff-3', name: 'Lê Thị Hoa', role: 'Phục vụ', shift: 'Chiều (14h–22h)', phone: 'Chưa cập nhật', active: true },
  { id: 'staff-4', name: 'Phạm Văn Nam', role: 'Bếp trưởng', shift: 'Cả ngày', phone: 'Chưa cập nhật', active: true },
  { id: 'staff-5', name: 'Hoàng Thị Mai', role: 'Thu ngân', shift: 'Chiều (14h–22h)', phone: 'Chưa cập nhật', active: false },
  { id: 'staff-6', name: 'Đỗ Văn Tuấn', role: 'Phục vụ', shift: 'Tối (18h–23h)', phone: 'Chưa cập nhật', active: true },
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
const STORAGE_KEY = 'fresh-restaurant-manager:v1';
const LEGACY_STORAGE_KEY = 'fresh-sales-manager:v1';
const BASE_TODAY_STATS = { revenue: 8450000, orders: 86 };
const sharedStateKeys = ['products', 'orders', 'tables', 'inventory', 'staff'];
const API_TOKEN_STORAGE_KEY = 'fresh-api-token:v1';
const SESSION_STORAGE_KEY = 'fresh-session:v1';
const roleLabels = { manager: 'Quản lý', staff: 'Nhân viên gọi món', kitchen: 'Bếp' };
const deviceModes = {
  manager: { label: 'Máy quản lý', initialView: 'overview' },
  staff: { label: 'Máy gọi món', initialView: 'tables' },
  kitchen: { label: 'Máy bếp', initialView: 'kitchen' },
};

function stableJson(value) {
  return JSON.stringify(value);
}

function sharedStateFrom(products, orders, tables, inventory, staff) {
  return { products, orders, tables, inventory, staff };
}

function deviceModeForRole(role) {
  return role === 'manager' ? 'manager' : role === 'kitchen' ? 'kitchen' : 'staff';
}

function readApiToken() {
  if (typeof window === 'undefined') return '';
  const queryToken = new URLSearchParams(window.location.search).get('token');
  if (queryToken) {
    try { window.localStorage.setItem(API_TOKEN_STORAGE_KEY, queryToken); } catch { /* optional convenience */ }
    return queryToken;
  }
  try { return import.meta.env.VITE_FRESH_ACCESS_TOKEN || window.localStorage.getItem(API_TOKEN_STORAGE_KEY) || ''; } catch { return ''; }
}

const API_TOKEN = readApiToken();
const getSessionToken = () => {
  try { return window.localStorage.getItem(SESSION_STORAGE_KEY) || ''; } catch { return ''; }
};
const apiRequest = (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (API_TOKEN) headers.set('X-Fresh-Token', API_TOKEN);
  const sessionToken = getSessionToken();
  if (sessionToken) headers.set('Authorization', `Bearer ${sessionToken}`);
  return fetch(url, { ...options, credentials: options.credentials || 'same-origin', headers });
};
const apiEventsUrl = () => {
  const params = new URLSearchParams();
  if (API_TOKEN) params.set('token', API_TOKEN);
  const sessionToken = getSessionToken();
  if (sessionToken) params.set('session', sessionToken);
  return `/api/events?${params.toString()}`;
};
const apiUnavailableMessage = 'Không kết nối được máy chủ Fresh. Hãy chạy API bằng "npm run api" rồi tải lại trang.';
const readApiJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(response.status >= 500 || response.status === 404 ? apiUnavailableMessage : 'Máy chủ trả về dữ liệu không hợp lệ.');
  }
};
const displayApiError = (error, fallback = 'Không thể hoàn tất thao tác.') => {
  const message = String(error?.message || error || '');
  return /fetch failed|failed to fetch|networkerror|unexpected token|not valid json/i.test(message) ? apiUnavailableMessage : message || fallback;
};

function readStoredState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY) || '{}';
    const stored = JSON.parse(raw);
    return stored?.version === 1 || stored?.version === 2 || stored?.version === 3 ? stored : {};
  } catch {
    return {};
  }
}

const toneForStatus = (status) => ({ 'Đang xử lý': 'pending', 'Hoàn tất': 'success', 'Đã hủy': 'cancelled' }[status] || 'pending');
const tableToneForStatus = (status) => ({ Trống: 'success', 'Đang phục vụ': 'pending', 'Chờ thanh toán': 'warning', 'Đặt trước': 'reserved' }[status] || 'pending');
const kitchenStageFor = (order) => order.kitchenStatus || (order.status === 'Hoàn tất' ? 'Đã xong' : 'Chờ chế biến');

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    table: <><path d="M4 10h16M6 10v9M18 10v9M3 6h18l-1 4H4Z" /><path d="M9 19h6" /></>,
    chef: <><path d="M6 10h12v10H6z" /><path d="M8 10V7.5a2.5 2.5 0 0 1 5-1 2.5 2.5 0 0 1 5 1V10" /><path d="M9 14h6M9 17h4" /></>,
    warehouse: <><path d="m3 10 9-6 9 6v10H3Z" /><path d="M7 20v-6h10v6M7 11h10" /></>,
    users: <><path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20" /><circle cx="10" cy="7" r="3" /><path d="M16 4.5a3 3 0 0 1 0 5.8M20 20v-1.2a3.5 3.5 0 0 0-2.5-3.3" /></>,
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

function Sidebar({ activeView, onNavigate, items = navItems, user }) {
  return <aside className="sidebar">
    <div className="sidebar-brand"><FreshMark /></div>
    <nav className="side-nav" aria-label="Điều hướng chính">
      {items.map((item) => <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
        <Icon name={item.icon} size={20} />
        <span>{item.label}</span>
      </button>)}
    </nav>
    <div className="sidebar-profile">
      <div className="store-avatar"><Icon name="store" size={18} /></div>
      <div><strong>{user?.name || 'fresh'}</strong><span>{roleLabels[user?.role] || 'Chủ cửa hàng'}</span></div>
      <Icon name="down" size={16} />
    </div>
  </aside>;
}

function MobileNav({ activeView, onNavigate, items = navItems }) {
  return <nav className="mobile-nav" aria-label="Điều hướng di động">
    {items.map((item) => <button key={item.id} className={`mobile-nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
      <Icon name={item.icon} size={19} />
      <span>{item.label}</span>
    </button>)}
  </nav>;
}

function Topbar({ title, globalSearch, onSearch, onMenu, onNotification, deviceMode, syncStatus, onReconnect, user, onLogout }) {
  const syncLabels = { connecting: 'Đang kết nối', syncing: 'Đang đồng bộ', online: 'Máy chủ live', offline: 'Chỉ máy này' };
  const initials = (user?.name || 'Fresh').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Mở menu"><Icon name="menu" size={22} /></button>
    <h1>{title}</h1>
    <div className="topbar-tools">
      <label className="global-search"><Icon name="search" size={18} /><input value={globalSearch} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm đơn, món, bàn..." /></label>
      <div className="account-chip"><div className="user-avatar">{initials}</div><span><strong>{user?.name || 'Fresh'}</strong><small>{roleLabels[user?.role] || deviceModes[deviceMode]?.label}</small></span></div>
      <button className={`sync-pill ${syncStatus}`} onClick={onReconnect} title="Bấm để kết nối lại máy chủ"><span /> {syncLabels[syncStatus] || syncLabels.offline}</button>
      <button className="icon-button notification" onClick={onNotification} aria-label="Thông báo"><Icon name="bell" size={21} /><span>3</span></button>
      <button className="logout-button" onClick={onLogout}>Đăng xuất</button>
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

function QuickOrderPanel({ products, basket, onQuantityChange, onCheckout, full = false, contextLabel = '' }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [showAll, setShowAll] = useState(!contextLabel);
  useEffect(() => { setShowAll(!contextLabel); }, [contextLabel]);
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Tất cả' || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesBasket = showAll || basket[product.id] > 0;
    return matchesCategory && matchesSearch && matchesBasket;
  }), [products, category, search, basket, showAll]);
  const basketItems = products.filter((product) => basket[product.id] > 0);
  const totalItems = basketItems.reduce((sum, product) => sum + basket[product.id], 0);
  const total = basketItems.reduce((sum, product) => sum + product.price * basket[product.id], 0);

  return <section className={`quick-order-panel ${full ? 'full' : ''}`}>
    <SectionHeading title={contextLabel ? `Gọi món · ${contextLabel}` : 'Tạo đơn nhanh'} action={contextLabel ? (showAll ? 'Chỉ món đã gọi' : 'Thêm món') : undefined} onAction={() => setShowAll((current) => !current)} />
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

function TableSnapshot({ tables, onNavigate }) {
  const tableCounts = [
    { label: 'Trống', value: tables.filter((table) => table.status === 'Trống').length, tone: 'empty' },
    { label: 'Đang phục vụ', value: tables.filter((table) => table.status === 'Đang phục vụ').length, tone: 'serving' },
    { label: 'Chờ thanh toán', value: tables.filter((table) => table.status === 'Chờ thanh toán').length, tone: 'payment' },
  ];
  const occupiedTables = tables.filter((table) => table.status !== 'Trống').slice(0, 4);
  return <section className="table-snapshot"><SectionHeading title="Tình trạng bàn" action="Mở sơ đồ bàn" onAction={() => onNavigate('tables')} /><div className="table-summary-grid">{tableCounts.map((item) => <div className={`table-summary-item ${item.tone}`} key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div><div className="table-mini-list">{occupiedTables.map((table) => <button className="table-mini-item" key={table.id} onClick={() => onNavigate('tables')}><span className="table-mini-name"><strong>{table.name}</strong><small>{table.seats} chỗ · {table.zone}</small></span><StatusBadge tone={tableToneForStatus(table.status)}>{table.status}</StatusBadge></button>)}{occupiedTables.length === 0 && <p className="table-mini-empty">Tất cả bàn đang sẵn sàng đón khách.</p>}</div></section>;
}

function Overview({ products, orders, tables, basket, stats, onQuantityChange, onCheckout, onNavigate, onSelectOrder }) {
  return <div className="page-content overview-page">
    <div className="welcome-row"><div><h2>Chào buổi sáng, Fresh</h2><p>Thứ Năm, 07 tháng 08, 2026</p></div><button className="primary-button" onClick={() => onNavigate('sales')}><Icon name="plus" size={18} /> Tạo đơn mới</button></div>
    <div className="stats-grid"><StatCard label="Doanh thu hôm nay" value={money(stats.revenue)} change="18,6%" icon="dollar" /><StatCard label="Đơn hàng hôm nay" value={stats.orders} change="12,5%" icon="cart" /><StatCard label="Giá trị trung bình" value={money(stats.average)} change="4,3%" trend="down" icon="trendUp" /></div>
    <div className="dashboard-grid"><div className="main-column"><TableSnapshot tables={tables} onNavigate={onNavigate} /><section className="chart-panel"><SectionHeading title="Doanh thu 7 ngày" /><RevenueChart /></section><section className="orders-panel"><SectionHeading title="Đơn hàng gần đây" action="Xem tất cả" onAction={() => onNavigate('orders')} /><OrderList orders={orders} onSelect={onSelectOrder} /></section><BestSellers products={products} onNavigate={onNavigate} /></div><div className="order-rail"><QuickOrderPanel products={products} basket={basket} onQuantityChange={onQuantityChange} onCheckout={onCheckout} /></div></div>
  </div>;
}

function TableCard({ table, onSelect }) {
  const detail = table.status === 'Trống' ? 'Sẵn sàng nhận khách' : table.status === 'Đặt trước' ? `Đặt lúc ${table.since}` : `${table.orderId || 'Chưa có đơn'} · ${money(table.total)}`;
  return <button className={`table-card ${table.status === 'Trống' ? 'is-empty' : ''}`} onClick={() => onSelect(table)}><div className="table-card-top"><span className="table-number">{table.id}</span><StatusBadge tone={tableToneForStatus(table.status)}>{table.status}</StatusBadge></div><div className="table-card-icon"><Icon name="table" size={29} /></div><div className="table-card-copy"><strong>{table.name}</strong><span>{table.seats} chỗ ngồi · {table.zone}</span></div><div className="table-card-footer"><small>{detail}</small><span>{table.status === 'Trống' ? 'Mở bàn' : 'Xem bàn'} <Icon name="arrow" size={14} /></span></div></button>;
}

function TablesPage({ tables, searchValue, onSearch, onSelectTable }) {
  const [zone, setZone] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const zones = ['Tất cả', ...new Set(tables.map((table) => table.zone))];
  const filteredTables = tables.filter((table) => {
    const query = searchValue.trim().toLowerCase();
    return (zone === 'Tất cả' || table.zone === zone) && (status === 'Tất cả' || table.status === status) && (!query || `${table.id} ${table.name} ${table.zone}`.toLowerCase().includes(query));
  });
  return <div className="page-content"><div className="page-intro"><div><h2>Quản lý bàn</h2><p>Sơ đồ bàn và trạng thái phục vụ theo từng khu vực.</p></div><button className="primary-button" onClick={() => onSelectTable({ id: null, name: 'Mang đi', status: 'Trống' })}><Icon name="plus" size={18} /> Tạo đơn mang đi</button></div><section className="table-management"><div className="table-management-head"><div><h3>Sơ đồ nhà hàng</h3><p>{filteredTables.length} / {tables.length} bàn đang hiển thị</p></div><label className="local-search table-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm bàn hoặc khu vực..." /></label></div><div className="table-filters"><div className="filter-tabs">{['Tất cả', 'Trống', 'Đang phục vụ', 'Chờ thanh toán', 'Đặt trước'].map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item}<span>{item === 'Tất cả' ? tables.length : tables.filter((table) => table.status === item).length}</span></button>)}</div><select className="select-control" value={zone} onChange={(event) => setZone(event.target.value)} aria-label="Lọc khu vực">{zones.map((item) => <option key={item}>{item}</option>)}</select></div><div className="tables-grid">{filteredTables.map((table) => <TableCard key={table.id} table={table} onSelect={onSelectTable} />)}</div>{filteredTables.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không tìm thấy bàn phù hợp</p></div>}</section></div>;
}

const kitchenStages = ['Chờ chế biến', 'Đang chế biến', 'Đã xong'];
const nextKitchenStage = { 'Chờ chế biến': 'Đang chế biến', 'Đang chế biến': 'Đã xong' };

function KitchenTicket({ order, onStageChange, onSelectOrder }) {
  const stage = kitchenStageFor(order);
  return <article className="kitchen-ticket"><div className="kitchen-ticket-head"><strong>{order.id}</strong><time>{order.time}</time></div><div className="kitchen-ticket-context"><span>{order.table || 'Mang đi'}</span><span>{order.customer}</span></div><p>{order.items}</p><div className="kitchen-ticket-foot">{nextKitchenStage[stage] ? <button className="primary-button" onClick={() => onStageChange(order.id, nextKitchenStage[stage])}>{stage === 'Chờ chế biến' ? 'Bắt đầu chế biến' : 'Đánh dấu đã xong'} <Icon name="arrow" size={14} /></button> : <StatusBadge tone="success">Đã hoàn tất</StatusBadge>}<button className="icon-button small-icon" onClick={() => onSelectOrder(order)} aria-label={`Xem ${order.id}`}><Icon name="chevron" size={17} /></button></div></article>;
}

function KitchenPage({ orders, searchValue, onSearch, onStageChange, onSelectOrder }) {
  const query = searchValue.trim().toLowerCase();
  const kitchenOrders = orders.filter((order) => order.status !== 'Đã hủy' && (!query || `${order.id} ${order.customer} ${order.table || ''} ${order.items}`.toLowerCase().includes(query)));
  return <div className="page-content"><div className="page-intro"><div><h2>Màn hình bếp</h2><p>Nhận món, chế biến và cập nhật trạng thái phục vụ theo thời gian thực.</p></div><span className="live-status"><span /> Bếp đang hoạt động</span></div><div className="kitchen-summary"><div><strong>{kitchenOrders.filter((order) => kitchenStageFor(order) === 'Chờ chế biến').length}</strong><span>Chờ chế biến</span></div><div><strong>{kitchenOrders.filter((order) => kitchenStageFor(order) === 'Đang chế biến').length}</strong><span>Đang chế biến</span></div><div><strong>{kitchenOrders.filter((order) => kitchenStageFor(order) === 'Đã xong').length}</strong><span>Đã xong</span></div><label className="local-search kitchen-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm mã đơn, bàn..." /></label></div><div className="kitchen-board">{kitchenStages.map((stage) => <section className={`kitchen-column ${stage === 'Đang chế biến' ? 'in-progress' : ''}`} key={stage}><div className="kitchen-column-head"><h3>{stage}</h3><span>{kitchenOrders.filter((order) => kitchenStageFor(order) === stage).length}</span></div><div className="kitchen-ticket-list">{kitchenOrders.filter((order) => kitchenStageFor(order) === stage).map((order) => <KitchenTicket key={order.id} order={order} onStageChange={onStageChange} onSelectOrder={onSelectOrder} />)}{kitchenOrders.filter((order) => kitchenStageFor(order) === stage).length === 0 && <div className="kitchen-empty"><Icon name="chef" size={22} /><span>Chưa có món</span></div>}</div></section>)}</div></div>;
}

function InventoryPage({ inventory, searchValue, onSearch, onRestock }) {
  const query = searchValue.trim().toLowerCase();
  const filteredInventory = inventory.filter((item) => !query || `${item.name} ${item.group} ${item.supplier}`.toLowerCase().includes(query));
  const lowStockCount = inventory.filter((item) => item.stock <= item.minStock).length;
  const quantity = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value);
  return <div className="page-content"><div className="page-intro"><div><h2>Kho nguyên liệu</h2><p>Theo dõi tồn kho nguyên liệu, bao bì và mức cần nhập.</p></div><button className="outline-button" onClick={() => window.print()}><Icon name="clipboard" size={17} /> In danh sách kho</button></div><div className="inventory-summary"><div><span>Tổng mặt hàng</span><strong>{inventory.length}</strong></div><div className={lowStockCount ? 'is-warning' : ''}><span>Sắp hết hàng</span><strong>{lowStockCount}</strong></div><div><span>Nhà cung cấp</span><strong>{new Set(inventory.map((item) => item.supplier)).size}</strong></div></div><section className="management-panel"><div className="management-toolbar"><label className="local-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm nguyên liệu..." /></label><span className="inventory-note"><Icon name="spark" size={15} /> Cập nhật theo ca</span></div><div className="products-table-wrap"><table className="products-table inventory-table"><thead><tr><th>Nguyên liệu</th><th>Nhóm</th><th>Tồn hiện tại</th><th>Mức tối thiểu</th><th>Trạng thái</th><th /></tr></thead><tbody>{filteredInventory.map((item) => { const isLow = item.stock <= item.minStock; return <tr key={item.id}><td><div className="inventory-name"><span className={`inventory-dot ${isLow ? 'low' : ''}`} /><div><strong>{item.name}</strong><small>{item.supplier}</small></div></div></td><td>{item.group}</td><td><strong className={isLow ? 'stock low' : 'stock'}>{quantity(item.stock)} {item.unit}</strong></td><td>{quantity(item.minStock)} {item.unit}</td><td><StatusBadge tone={isLow ? 'warning' : 'success'}>{isLow ? 'Cần nhập' : 'Đủ dùng'}</StatusBadge></td><td><button className="outline-button restock-button" onClick={() => onRestock(item)}><Icon name="plus" size={14} /> Nhập thêm</button></td></tr>; })}</tbody></table>{filteredInventory.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không tìm thấy nguyên liệu</p></div>}</div></section></div>;
}

function AccountsPanel({ accounts, onCreate }) {
  return <section className="management-panel accounts-panel"><div className="section-heading"><div><h2>Tài khoản đăng nhập</h2><p className="panel-subtitle">Phân quyền truy cập cho máy quản lý, máy gọi món và máy bếp.</p></div><button className="outline-button" onClick={onCreate}><Icon name="plus" size={16} /> Tạo tài khoản</button></div><div className="products-table-wrap"><table className="products-table accounts-table"><thead><tr><th>Tài khoản</th><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id}><td><strong>{account.username}</strong></td><td>{account.name}</td><td><span className="role-badge">{roleLabels[account.role] || account.role}</span></td><td><StatusBadge tone={account.active ? 'success' : 'cancelled'}>{account.active ? 'Đang hoạt động' : 'Đã khóa'}</StatusBadge></td></tr>)}</tbody></table>{accounts.length === 0 && <div className="empty-state table-empty"><Icon name="users" size={22} /><p>Chưa tải được danh sách tài khoản</p></div>}</div></section>;
}

function StaffPage({ staff, accounts, searchValue, onSearch, onCreate, onCreateAccount, onEdit, onToggle, onDelete }) {
  const query = searchValue.trim().toLowerCase();
  const visible = staff.filter((person) => !query || `${person.name} ${person.role} ${person.phone}`.toLowerCase().includes(query));
  return <div className="page-content"><div className="page-intro"><div><h2>Nhân viên</h2><p>Quản lý nhân sự, ca làm và tài khoản truy cập.</p></div><div className="toolbar-actions"><button className="outline-button" onClick={onCreateAccount}><Icon name="users" size={16} /> Tạo tài khoản</button><button className="primary-button" onClick={onCreate}><Icon name="plus" size={18} /> Thêm nhân viên</button></div></div><section className="management-panel"><div className="management-toolbar"><label className="local-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm tên, chức vụ, số điện thoại..." /></label><span className="inventory-note"><Icon name="users" size={15} /> {staff.filter((person) => person.active).length} nhân viên đang làm việc</span></div><div className="products-table-wrap"><table className="products-table staff-table"><thead><tr><th>Họ tên</th><th>Chức vụ</th><th>Ca làm</th><th>Số điện thoại</th><th>Trạng thái</th><th /></tr></thead><tbody>{visible.map((person) => <tr key={person.id}><td><strong>{person.name}</strong></td><td><span className="role-badge">{person.role}</span></td><td>{person.shift}</td><td>{person.phone}</td><td><StatusBadge tone={person.active ? 'success' : 'cancelled'}>{person.active ? 'Đang làm' : 'Nghỉ'}</StatusBadge></td><td><div className="row-actions"><button className="outline-button staff-action" onClick={() => onToggle(person)}>{person.active ? 'Cho nghỉ' : 'Kích hoạt'}</button><button className="icon-button small-icon" onClick={() => onEdit(person)} aria-label={`Sửa ${person.name}`}><Icon name="edit" size={16} /></button><button className="icon-button small-icon" onClick={() => onDelete(person)} aria-label={`Xóa ${person.name}`}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không tìm thấy nhân viên</p></div>}</div></section><AccountsPanel accounts={accounts} onCreate={onCreateAccount} /></div>;
}

function StaffFormModal({ staff, onClose, onSave }) {
  const [draft, setDraft] = useState(() => staff ? { ...staff } : { name: '', role: 'Phục vụ', shift: 'Sáng (6h–14h)', phone: '', active: true });
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const canSave = draft.name.trim() && draft.phone.trim();
  const submit = (event) => { event.preventDefault(); if (canSave) onSave({ ...draft, name: draft.name.trim(), phone: draft.phone.trim() }); };
  return <div className="modal-backdrop" onClick={onClose}><form className="form-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="detail-header"><div><span>{staff ? 'Chỉnh sửa thông tin' : 'Thêm nhân viên mới'}</span><h2>{staff ? staff.name : 'Nhân viên mới'}</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="form-grid"><label><span>Họ và tên</span><input value={draft.name} onChange={(event) => update('name', event.target.value)} autoFocus /></label><label><span>Chức vụ</span><select value={draft.role} onChange={(event) => update('role', event.target.value)}><option>Quản lý</option><option>Phục vụ</option><option>Bếp trưởng</option><option>Thu ngân</option><option>Part-time</option></select></label><label><span>Ca làm</span><select value={draft.shift} onChange={(event) => update('shift', event.target.value)}><option>Sáng (6h–14h)</option><option>Chiều (14h–22h)</option><option>Tối (18h–23h)</option><option>Cả ngày</option></select></label><label><span>Số điện thoại</span><input value={draft.phone} onChange={(event) => update('phone', event.target.value)} /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Hủy</button><button type="submit" className="primary-button" disabled={!canSave}>{staff ? 'Lưu thay đổi' : 'Thêm nhân viên'}</button></div></form></div>;
}

function AccountFormModal({ onClose, onSave }) {
  const [draft, setDraft] = useState({ username: '', name: '', role: 'staff', password: '' });
  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const canSave = /^[a-z0-9._-]{3,30}$/.test(draft.username.trim().toLowerCase()) && draft.name.trim() && draft.password.length >= 6;
  const submit = (event) => { event.preventDefault(); if (canSave) onSave({ ...draft, username: draft.username.trim().toLowerCase(), name: draft.name.trim() }); };
  return <div className="modal-backdrop" onClick={onClose}><form className="form-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="detail-header"><div><span>Tài khoản đăng nhập</span><h2>Tạo tài khoản mới</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="form-grid"><label><span>Tên đăng nhập</span><input value={draft.username} onChange={(event) => update('username', event.target.value)} placeholder="phucvu02" autoFocus /></label><label><span>Tên hiển thị</span><input value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="Nhân viên mới" /></label><label><span>Vai trò</span><select value={draft.role} onChange={(event) => update('role', event.target.value)}><option value="staff">Nhân viên gọi món</option><option value="kitchen">Bếp</option><option value="manager">Quản lý</option></select></label><label><span>Mật khẩu</span><input type="password" value={draft.password} onChange={(event) => update('password', event.target.value)} placeholder="Tối thiểu 6 ký tự" /></label></div><p className="form-hint">Mật khẩu được mã hóa trên máy chủ, không lưu dạng văn bản.</p><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Hủy</button><button type="submit" className="primary-button" disabled={!canSave}>Tạo tài khoản</button></div></form></div>;
}

function SalesPage({ products, basket, activeTable, onQuantityChange, onCheckout, onNavigate }) {
  const [category, setCategory] = useState('Tất cả');
  const visibleProducts = category === 'Tất cả' ? products : products.filter((product) => product.category === category);
  return <div className="page-content sales-page"><div className="page-intro"><div><h2>Bán hàng</h2><p>Chọn món để thêm vào đơn mới.</p></div><div className="sales-context-actions">{activeTable ? <span className="table-context"><Icon name="table" size={16} /> {activeTable.name} · {activeTable.seats} chỗ</span> : <button className="outline-button" onClick={() => onNavigate('tables')}><Icon name="table" size={16} /> Chọn bàn</button>}<span className="live-status"><span /> Đang mở cửa</span></div></div><div className="sales-layout"><div className="sales-catalog"><div className="catalog-header"><div><h3>Thực đơn hôm nay</h3><p>{visibleProducts.length} món đang hiển thị</p></div><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Lọc thực đơn">{categories.map((item) => <option key={item}>{item}</option>)}</select></div><div className="catalog-grid">{visibleProducts.map((product) => <article className="catalog-product" key={product.id}><ProductArt product /><div className="catalog-product-body"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3><strong>{money(product.price)}</strong></div><button className="add-product-button" onClick={() => onQuantityChange(product.id, 1)} aria-label={`Thêm ${product.name}`}><Icon name="plus" size={17} /></button></div></article>)}</div>{visibleProducts.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Chưa có món trong danh mục này</p></div>}</div><QuickOrderPanel products={products} basket={basket} onQuantityChange={onQuantityChange} onCheckout={onCheckout} contextLabel={activeTable?.name} full /></div></div>;
}

function ProductsPage({ products, searchValue, onSearch, onCreateProduct, onEditProduct, onDeleteProduct }) {
  const [category, setCategory] = useState('Tất cả');
  const filteredProducts = products.filter((product) => {
    const query = searchValue.trim().toLowerCase();
    return (category === 'Tất cả' || product.category === category) && (!query || `${product.name} ${product.category}`.toLowerCase().includes(query));
  });
  return <div className="page-content"><div className="page-intro"><div><h2>Thực đơn</h2><p>Quản lý món ăn, đồ uống, giá bán và tồn kho theo món.</p></div><button className="primary-button" onClick={onCreateProduct}><Icon name="plus" size={18} /> Thêm món mới</button></div><section className="management-panel"><div className="management-toolbar"><label className="local-search"><Icon name="search" size={17} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} placeholder="Tìm món trong thực đơn..." /></label><div className="toolbar-actions"><select className="select-control" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Lọc danh mục">{categories.map((item) => <option key={item}>{item}</option>)}</select><button className="icon-button" aria-label="Xem báo cáo thực đơn"><Icon name="chart" size={18} /></button></div></div><div className="products-table-wrap"><table className="products-table"><thead><tr><th>Món ăn / đồ uống</th><th>Danh mục</th><th>Giá bán</th><th>Đã bán</th><th>Tồn kho</th><th /></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id}><td><div className="table-product"><ProductArt product small /><strong>{product.name}</strong></div></td><td>{product.category}</td><td><strong>{money(product.price)}</strong></td><td>{product.sold} phần</td><td><span className={`stock ${product.stock < 15 ? 'low' : ''}`}>{product.stock} phần</span></td><td><div className="row-actions"><button className="icon-button small-icon" aria-label={`Sửa ${product.name}`} onClick={() => onEditProduct(product)}><Icon name="edit" size={16} /></button><button className="icon-button small-icon" aria-label={`Xóa ${product.name}`} onClick={() => onDeleteProduct(product)}><Icon name="trash" size={16} /></button></div></td></tr>)}</tbody></table>{filteredProducts.length === 0 && <div className="empty-state table-empty"><Icon name="search" size={22} /><p>Không có món phù hợp</p></div>}</div></section></div>;
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

function CheckoutModal({ products, basket, activeTable, onClose, onConfirm }) {
  const [customer, setCustomer] = useState('Khách tại quầy');
  const [payment, setPayment] = useState('Tiền mặt');
  const [note, setNote] = useState('');
  const items = products.filter((product) => basket[product.id] > 0);
  const total = items.reduce((sum, product) => sum + product.price * basket[product.id], 0);
  const submit = (event) => { event.preventDefault(); onConfirm({ customer: customer.trim() || 'Khách tại quầy', payment, note: note.trim() }); };
  return <div className="modal-backdrop" onClick={onClose}><form className="form-modal checkout-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}><div className="detail-header"><div><span>Hoàn tất đơn hàng</span><h2>Xác nhận thanh toán</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div>{activeTable && <div className="checkout-table-banner"><Icon name="table" size={18} /><div><span>Bàn phục vụ</span><strong>{activeTable.name}</strong></div></div>}<div className="checkout-items">{items.map((product) => <div className="checkout-item" key={product.id}><span>{basket[product.id]}x {product.name}</span><strong>{money(product.price * basket[product.id])}</strong></div>)}</div><div className="checkout-total"><span>Tổng thanh toán</span><strong>{money(total)}</strong></div><div className="form-grid"><label><span>Tên khách hàng</span><input value={customer} onChange={(event) => setCustomer(event.target.value)} /></label><label><span>Phương thức thanh toán</span><select value={payment} onChange={(event) => setPayment(event.target.value)}><option>Tiền mặt</option><option>Chuyển khoản</option><option>Ví điện tử</option></select></label><label className="full-field"><span>Ghi chú đơn hàng</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: ít cay, giao tại quầy..." rows="2" /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Quay lại</button><button type="submit" className="primary-button"><Icon name="check" size={17} /> Xác nhận tạo đơn</button></div></form></div>;
}

function MobileMenuSheet({ open, activeView, onNavigate, onClose, items = navItems }) {
  if (!open) return null;
  return <div className="modal-backdrop mobile-menu-backdrop" onClick={onClose}><aside className="mobile-menu-sheet" onClick={(event) => event.stopPropagation()}><div className="detail-header"><div><span>Điều hướng</span><h2>fresh</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng menu"><Icon name="close" size={19} /></button></div><nav className="mobile-sheet-nav">{items.map((item) => <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => { onNavigate(item.id); onClose(); }}><Icon name={item.icon} size={20} /><span>{item.label}</span></button>)}</nav></aside></div>;
}

function ReportsPage({ stats, products, orders }) {
  const completedOrders = orders.filter((order) => order.status === 'Hoàn tất').length;
  const bestSeller = [...products].sort((first, second) => second.sold - first.sold)[0];
  return <div className="page-content"><div className="page-intro"><div><h2>Báo cáo</h2><p>Nhìn nhanh hiệu quả kinh doanh của cửa hàng.</p></div><button className="outline-button"><Icon name="chart" size={17} /> Tuần này <Icon name="down" size={15} /></button></div><div className="report-grid"><section className="chart-panel report-chart"><SectionHeading title="Doanh thu 7 ngày" /><RevenueChart /></section><section className="report-summary"><SectionHeading title="Tóm tắt hôm nay" /><div className="report-metric"><span>Tổng doanh thu</span><strong>{money(stats.revenue)}</strong><small className="positive">+18,6% so với hôm qua</small></div><div className="report-metric"><span>Số đơn hoàn tất</span><strong>{completedOrders} / {stats.orders}</strong><small>{stats.orders ? `${((completedOrders / stats.orders) * 100).toFixed(1).replace('.', ',')}% tỷ lệ hoàn tất` : 'Chưa có đơn hàng'}</small></div><div className="report-metric"><span>Món bán chạy nhất</span><strong>{bestSeller?.name || 'Chưa có dữ liệu'}</strong><small>{bestSeller ? `${bestSeller.sold} phần trong tuần` : 'Thêm sản phẩm để xem báo cáo'}</small></div></section></div><section className="category-performance"><SectionHeading title="Doanh thu theo danh mục" /><div className="category-bars"><div><span>Đồ uống</span><strong>{money(4732000)}</strong><i><em style={{ width: '78%' }} /></i></div><div><span>Ăn vặt</span><strong>{money(3824000)}</strong><i><em style={{ width: '63%' }} /></i></div><div><span>Combo</span><strong>{money(1098000)}</strong><i><em style={{ width: '25%' }} /></i></div></div></section></div>;
}

function OrderDetail({ order, onClose, onStatusChange, onPrint }) {
  if (!order) return null;
  const nextStatus = order.status === 'Đang xử lý' ? 'Hoàn tất' : order.status === 'Hoàn tất' ? null : 'Đang xử lý';
  return <div className="modal-backdrop" onClick={onClose}><aside className="order-detail" onClick={(event) => event.stopPropagation()}><div className="detail-header"><div><span>Chi tiết đơn hàng</span><h2>{order.id}</h2></div><button className="icon-button" onClick={onClose} aria-label="Đóng"><Icon name="close" size={19} /></button></div><div className="detail-status"><StatusBadge tone={order.tone}>{order.status}</StatusBadge><span>{order.time} · {order.customer}{order.table ? ` · ${order.table}` : ''}</span></div><div className="detail-items"><h3>Món đã gọi</h3><div className="detail-item"><div><strong>{order.items.split(',')[0]}</strong><span>{order.payment || 'Tiền mặt'} · {order.customer}</span></div><strong>{money(order.total)}</strong></div>{order.items.split(',').slice(1).map((item) => <div className="detail-item detail-item-secondary" key={item}><span>{item.trim()}</span></div>)}</div><div className="detail-total"><span>Tổng thanh toán</span><strong>{money(order.total)}</strong></div><div className="detail-actions">{nextStatus && <button className="primary-button" onClick={() => onStatusChange(order.id, nextStatus)}><Icon name="check" size={17} /> {nextStatus === 'Hoàn tất' ? 'Đánh dấu hoàn tất' : 'Mở lại đơn'}</button>}<button className="outline-button" onClick={onPrint}><Icon name="clipboard" size={17} /> In hóa đơn</button><button className="outline-button full-button" onClick={onClose}>Đóng chi tiết</button></div></aside></div>;
}

function LoginPage({ onLogin, error, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = (event) => { event.preventDefault(); onLogin({ username, password }); };
  return <main className="auth-page"><section className="auth-card"><FreshMark /><div className="auth-heading"><span>Hệ thống quản lý nhà hàng</span><h1>Đăng nhập Fresh</h1><p>Đăng nhập theo vị trí làm việc để mở đúng màn hình.</p></div><form className="auth-form" onSubmit={submit}><label><span>Tên đăng nhập</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoFocus placeholder="Nhập tên đăng nhập" /></label><label><span>Mật khẩu</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" /></label>{error && <div className="auth-error">{error}</div>}<button className="primary-button full-button" type="submit" disabled={loading || !username.trim() || !password}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button></form><div className="default-accounts"><strong>Tài khoản mặc định</strong><span><b>admin</b> / admin123 · Quản lý</span><span><b>phucvu</b> / phucvu123 · Gọi món</span><span><b>bep</b> / bep12345 · Bếp</span></div></section></main>;
}

function AuthGate() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/auth/me').then(async (response) => {
      if (!response.ok) throw new Error('Phiên đăng nhập đã hết hạn.');
      const payload = await readApiJson(response);
      setUser(payload.user);
    }).catch(() => {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }).finally(() => setLoading(false));
  }, []);

  const login = async ({ username, password }) => {
    setLoginLoading(true);
    setError('');
    try {
      const response = await apiRequest('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const payload = await readApiJson(response);
      if (!response.ok) throw new Error(payload.error || 'Không thể đăng nhập.');
      if (payload.sessionToken) window.localStorage.setItem(SESSION_STORAGE_KEY, payload.sessionToken);
      setUser(payload.user);
    } catch (loginError) {
      setError(displayApiError(loginError, 'Không thể đăng nhập.'));
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try { await apiRequest('/api/auth/logout', { method: 'POST' }); } catch { /* phiên có thể đã hết hạn */ }
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  if (loading) return <main className="auth-page"><div className="auth-loading"><FreshMark /><span>Đang kiểm tra phiên đăng nhập...</span></div></main>;
  return user ? <App user={user} onLogout={logout} /> : <LoginPage onLogin={login} error={error} loading={loginLoading} />;
}

function App({ user, onLogout }) {
  const deviceMode = deviceModeForRole(user.role);
  const [activeView, setActiveView] = useState(() => deviceModes[deviceMode]?.initialView || 'overview');
  const [persisted] = useState(readStoredState);
  const [products, setProducts] = useState(() => mergeMenuProducts(persisted.products));
  const [orders, setOrders] = useState(() => Array.isArray(persisted.orders) && persisted.orders.length ? persisted.orders : initialOrders);
  const [tables, setTables] = useState(() => Array.isArray(persisted.tables) && persisted.tables.length >= 20 ? persisted.tables : initialTables20);
  const [inventory, setInventory] = useState(() => Array.isArray(persisted.inventory) && persisted.inventory.length ? persisted.inventory : initialInventory);
  const [staff, setStaff] = useState(() => Array.isArray(persisted.staff) && persisted.staff.length ? persisted.staff : initialStaff);
  const [basket, setBasket] = useState(() => {
    if (persisted.basket) return persisted.basket;
    return deviceMode === 'manager' ? { 'peach-tea': 2, tokbokki: 1 } : {};
  });
  const [activeTable, setActiveTable] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState('');
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [staffModal, setStaffModal] = useState({ open: false, staff: null });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('connecting');
  const [remoteReady, setRemoteReady] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const sharedState = useMemo(() => sharedStateFrom(products, orders, tables, inventory, staff), [products, orders, tables, inventory, staff]);
  const sharedStateRef = useRef(sharedState);
  const lastSyncedSharedRef = useRef(null);
  const remoteRevisionRef = useRef(0);
  const skipSyncRef = useRef(false);
  const syncTimerRef = useRef(null);
  const syncSharedStateRef = useRef(null);

  sharedStateRef.current = sharedState;

  const applyRemoteState = (remoteState) => {
    if (!remoteState || typeof remoteState !== 'object') return;
    const nextProducts = mergeMenuProducts(remoteState.products);
    const nextOrders = Array.isArray(remoteState.orders) && remoteState.orders.length ? remoteState.orders : initialOrders;
    const nextTables = Array.isArray(remoteState.tables) && remoteState.tables.length >= 20 ? remoteState.tables : initialTables20;
    const nextInventory = Array.isArray(remoteState.inventory) && remoteState.inventory.length ? remoteState.inventory : initialInventory;
    const nextStaff = Array.isArray(remoteState.staff) && remoteState.staff.length ? remoteState.staff : initialStaff;
    const nextSharedState = sharedStateFrom(nextProducts, nextOrders, nextTables, nextInventory, nextStaff);
    skipSyncRef.current = true;
    setProducts(nextProducts);
    setOrders(nextOrders);
    setTables(nextTables);
    setInventory(nextInventory);
    setStaff(nextStaff);
    lastSyncedSharedRef.current = nextSharedState;
  };

  const syncSharedState = async (replace = false) => {
    if (!remoteReady && !replace) return;
    const current = sharedStateRef.current;
    const changes = {};
    if (!replace && lastSyncedSharedRef.current) {
      sharedStateKeys.forEach((key) => {
        if (stableJson(current[key]) !== stableJson(lastSyncedSharedRef.current[key])) changes[key] = current[key];
      });
      if (!Object.keys(changes).length) return;
    }
    try {
      setSyncStatus('syncing');
      const response = await apiRequest('/api/state', {
        method: replace ? 'PUT' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replace ? { state: current, deviceMode } : { changes, deviceMode }),
      });
      if (!response.ok) throw new Error('Máy chủ không nhận dữ liệu');
      const payload = await readApiJson(response);
      remoteRevisionRef.current = payload.revision || remoteRevisionRef.current;
      if (payload.state) applyRemoteState(payload.state);
      setServerAvailable(true);
      setSyncStatus('online');
    } catch {
      setServerAvailable(false);
      setSyncStatus('offline');
    }
  };
  syncSharedStateRef.current = syncSharedState;

  useEffect(() => {
    let cancelled = false;
    const connect = async () => {
      setSyncStatus('connecting');
      try {
        const response = await apiRequest('/api/state', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Máy chủ không phản hồi');
        const payload = await readApiJson(response);
        if (cancelled) return;
        remoteRevisionRef.current = payload.revision || 0;
        if (payload.state) {
          const menuNeedsBootstrap = deviceMode === 'manager' && mergeMenuProducts(payload.state.products).length !== (payload.state.products || []).length;
          applyRemoteState(payload.state);
          if (menuNeedsBootstrap) await syncSharedStateRef.current?.(true);
        } else if (deviceMode === 'manager') {
          await syncSharedStateRef.current?.(true);
        } else {
          lastSyncedSharedRef.current = sharedStateRef.current;
        }
        if (cancelled) return;
        setServerAvailable(true);
        setRemoteReady(true);
        setSyncStatus('online');
      } catch {
        if (cancelled) return;
        setServerAvailable(false);
        setRemoteReady(true);
        setSyncStatus('offline');
      }
    };
    connect();
    return () => { cancelled = true; };
  }, [deviceMode, connectionAttempt]);

  useEffect(() => {
    if (!serverAvailable) return undefined;
    let cancelled = false;
    const pollState = async () => {
      try {
        const response = await apiRequest('/api/state', { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Máy chủ không phản hồi');
        const payload = await readApiJson(response);
        if (cancelled) return;
        if (payload.state && (!payload.revision || payload.revision > remoteRevisionRef.current)) {
          remoteRevisionRef.current = payload.revision || remoteRevisionRef.current;
          applyRemoteState(payload.state);
        }
        setSyncStatus('online');
      } catch {
        if (!cancelled) setSyncStatus('offline');
      }
    };
    pollState();
    const timer = window.setInterval(pollState, 2500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [serverAvailable]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, products, orders, tables, inventory, staff, basket }));
    } catch {
      // Local storage is a convenience layer; the UI still works if it is blocked.
    }
    if (!remoteReady) return undefined;
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return undefined;
    }
    window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => syncSharedStateRef.current?.(), 350);
    return () => window.clearTimeout(syncTimerRef.current);
  }, [products, orders, tables, inventory, staff, basket, remoteReady]);

  useEffect(() => {
    if (user.role !== 'manager') return;
    apiRequest('/api/auth/users').then(async (response) => {
      if (!response.ok) return;
      const payload = await readApiJson(response);
      setAccounts(Array.isArray(payload.users) ? payload.users : []);
    }).catch(() => setAccounts([]));
  }, [user.role]);

  const pageTitles = { overview: 'Tổng quan', tables: 'Bàn ăn', sales: 'Bán hàng', kitchen: 'Màn hình bếp', products: 'Thực đơn', staff: 'Nhân viên', inventory: 'Kho nguyên liệu', orders: 'Đơn hàng', reports: 'Báo cáo' };
  const visibleNavItems = useMemo(() => {
    if (deviceMode === 'manager') return navItems;
    return navItems.filter((item) => deviceMode === 'staff' ? item.id === 'tables' : item.id === 'kitchen');
  }, [deviceMode]);
  const navigate = (view) => {
    const isInternalOrderView = view === 'sales';
    if (!isInternalOrderView && !visibleNavItems.some((item) => item.id === view)) return;
    setActiveView(view);
    setGlobalSearch('');
  };
  const reconnectServer = () => {
    setServerAvailable(false);
    setRemoteReady(false);
    setConnectionAttempt((current) => current + 1);
  };
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3200); };
  const selectTable = (table) => {
    const isTakeaway = !table.id;
    setActiveTable(isTakeaway ? { id: null, name: 'Mang đi', seats: 0, status: 'Trống' } : table);
    if (!isTakeaway && table.status === 'Trống') {
      setTables((current) => current.map((item) => item.id === table.id ? { ...item, status: 'Đang phục vụ', since: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) } : item));
    }
    setActiveView('sales');
    setGlobalSearch('');
    notify(isTakeaway ? 'Đã mở đơn mang đi' : `Đã mở ${table.name} để gọi món`);
  };
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
    const newOrder = { id: `#F-${newOrderNumber}`, customer, table: activeTable?.name || 'Mang đi', items: items.map((item) => `${basket[item.id]}x ${item.name}`).join(', '), total, payment, note, status: 'Đang xử lý', kitchenStatus: 'Chờ chế biến', time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }), tone: 'pending' };
    setOrders((current) => [newOrder, ...current]);
    setProducts((current) => current.map((product) => {
      const quantity = basket[product.id] || 0;
      return quantity ? { ...product, stock: Math.max(0, product.stock - quantity), sold: product.sold + quantity, revenue: product.revenue + product.price * quantity } : product;
    }));
    setBasket({});
    setCheckoutOpen(false);
    if (activeTable?.id) {
      setTables((current) => current.map((table) => table.id === activeTable.id ? { ...table, status: 'Đang phục vụ', orderId: newOrder.id, total, since: newOrder.time } : table));
    }
    setActiveTable(null);
    setActiveView(deviceMode === 'staff' ? 'tables' : 'orders');
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
  const updateKitchenStage = (orderId, kitchenStatus) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, kitchenStatus } : order));
    if (kitchenStatus === 'Đã xong') {
      setTables((current) => current.map((table) => table.orderId === orderId ? { ...table, status: 'Chờ thanh toán' } : table));
    }
    notify(`Đơn ${orderId} đã chuyển sang “${kitchenStatus}”`);
  };
  const restockInventory = (item) => {
    const refillAmount = Math.max(item.minStock, 5);
    setInventory((current) => current.map((entry) => entry.id === item.id ? { ...entry, stock: Number((entry.stock + refillAmount).toFixed(1)) } : entry));
    notify(`Đã nhập thêm ${item.name}`);
  };
  const saveStaff = (draft) => {
    const person = { ...draft, id: draft.id || `staff-${Date.now()}` };
    setStaff((current) => draft.id ? current.map((item) => item.id === draft.id ? { ...item, ...person } : item) : [...current, person]);
    setStaffModal({ open: false, staff: null });
    notify(draft.id ? 'Đã cập nhật thông tin nhân viên' : 'Đã thêm nhân viên mới');
  };
  const saveAccount = async (draft) => {
    try {
      const response = await apiRequest('/api/auth/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
      const payload = await readApiJson(response);
      if (!response.ok) throw new Error(payload.error || 'Không thể tạo tài khoản.');
      setAccounts((current) => [...current, payload.user]);
      setAccountModalOpen(false);
      notify(`Đã tạo tài khoản ${payload.user.username}`);
    } catch (accountError) {
      notify(displayApiError(accountError, 'Không thể tạo tài khoản'));
    }
  };
  const toggleStaff = (person) => {
    setStaff((current) => current.map((item) => item.id === person.id ? { ...item, active: !item.active } : item));
    notify(person.active ? `Đã chuyển ${person.name} sang trạng thái nghỉ` : `Đã kích hoạt ${person.name}`);
  };
  const deleteStaff = (person) => {
    if (!window.confirm(`Xóa nhân viên “${person.name}”?`)) return;
    setStaff((current) => current.filter((item) => item.id !== person.id));
    notify(`Đã xóa ${person.name}`);
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
  if (activeView === 'overview') content = <Overview products={products} orders={orders} tables={tables} stats={stats} basket={basket} onQuantityChange={changeQuantity} onCheckout={openCheckout} onNavigate={navigate} onSelectOrder={setSelectedOrder} />;
  if (activeView === 'tables') content = <TablesPage tables={tables} searchValue={globalSearch} onSearch={setGlobalSearch} onSelectTable={selectTable} />;
  if (activeView === 'sales') content = <SalesPage products={products} basket={basket} activeTable={activeTable} onQuantityChange={changeQuantity} onCheckout={openCheckout} onNavigate={navigate} />;
  if (activeView === 'kitchen') content = <KitchenPage orders={orders} searchValue={globalSearch} onSearch={setGlobalSearch} onStageChange={updateKitchenStage} onSelectOrder={setSelectedOrder} />;
  if (activeView === 'products') content = <ProductsPage products={products} searchValue={globalSearch} onSearch={setGlobalSearch} onCreateProduct={() => setProductModal({ open: true, product: null })} onEditProduct={(product) => setProductModal({ open: true, product })} onDeleteProduct={deleteProduct} />;
  if (activeView === 'staff') content = <StaffPage staff={staff} accounts={accounts} searchValue={globalSearch} onSearch={setGlobalSearch} onCreate={() => setStaffModal({ open: true, staff: null })} onCreateAccount={() => setAccountModalOpen(true)} onEdit={(person) => setStaffModal({ open: true, staff: person })} onToggle={toggleStaff} onDelete={deleteStaff} />;
  if (activeView === 'inventory') content = <InventoryPage inventory={inventory} searchValue={globalSearch} onSearch={setGlobalSearch} onRestock={restockInventory} />;
  if (activeView === 'orders') content = <OrdersPage orders={orders} searchValue={globalSearch} onSearch={setGlobalSearch} onSelectOrder={setSelectedOrder} onExport={exportOrders} />;
  if (activeView === 'reports') content = <ReportsPage stats={stats} products={products} orders={orders} />;

  return <div className="app-shell"><Sidebar activeView={activeView} onNavigate={navigate} items={visibleNavItems} user={user} /><main className="main-shell"><Topbar title={pageTitles[activeView]} globalSearch={globalSearch} onSearch={setGlobalSearch} onMenu={() => setMenuOpen(true)} onNotification={() => notify('Bạn có 3 thông báo cần xem')} deviceMode={deviceMode} syncStatus={syncStatus} onReconnect={reconnectServer} user={user} onLogout={onLogout} /><div className="content-scroll">{content}</div></main><MobileNav activeView={activeView} onNavigate={navigate} items={visibleNavItems} /><MobileMenuSheet open={menuOpen} activeView={activeView} onNavigate={navigate} onClose={() => setMenuOpen(false)} items={visibleNavItems} /><OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateOrderStatus} onPrint={() => { window.print(); }} />{productModal.open && <ProductFormModal product={productModal.product} onClose={() => setProductModal({ open: false, product: null })} onSave={saveProduct} />}{staffModal.open && <StaffFormModal staff={staffModal.staff} onClose={() => setStaffModal({ open: false, staff: null })} onSave={saveStaff} />}{accountModalOpen && <AccountFormModal onClose={() => setAccountModalOpen(false)} onSave={saveAccount} />}{checkoutOpen && <CheckoutModal products={products} basket={basket} activeTable={activeTable} onClose={() => setCheckoutOpen(false)} onConfirm={completeCheckout} />}{toast && <div className="toast"><span className="toast-check"><Icon name="check" size={16} /></span>{toast}</div>}</div>;
}

createRoot(document.getElementById('root')).render(<AuthGate />);
