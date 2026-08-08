import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const dataDir = process.env.FRESH_DATA_DIR || path.join(rootDir, 'data');
const dataFile = process.env.FRESH_DATA_FILE || path.join(dataDir, 'fresh-data.json');
const usersFile = process.env.FRESH_USERS_FILE || path.join(dataDir, 'fresh-users.json');
const distDir = path.join(rootDir, 'dist');
const maxBodySize = 8 * 1024 * 1024;
const accessToken = String(process.env.FRESH_ACCESS_TOKEN || '').trim();
const sessionTtlMs = 12 * 60 * 60 * 1000;

let sharedState = null;
let revision = 0;
let updatedAt = null;
let users = [];
const eventClients = new Set();
const sessions = new Map();

const stateKeys = ['products', 'orders', 'tables', 'inventory', 'staff'];
const rolePermissions = {
  manager: stateKeys,
  staff: ['products', 'orders', 'tables'],
  kitchen: ['orders', 'tables'],
};
const defaultUsers = [
  { username: 'admin', name: 'Quản lý Fresh', role: 'manager', password: 'admin123' },
  { username: 'phucvu', name: 'Nhân viên phục vụ', role: 'staff', password: 'phucvu123' },
  { username: 'bep', name: 'Bếp Fresh', role: 'kitchen', password: 'bep12345' },
];

function normalizeState(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    version: 3,
    products: Array.isArray(source.products) ? source.products : [],
    orders: Array.isArray(source.orders) ? source.orders : [],
    tables: Array.isArray(source.tables) ? source.tables : [],
    inventory: Array.isArray(source.inventory) ? source.inventory : [],
    staff: Array.isArray(source.staff) ? source.staff : [],
  };
}

function loadState() {
  try {
    const stored = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    if (stored?.state && typeof stored.state === 'object') {
      sharedState = normalizeState(stored.state);
      revision = Number(stored.revision) || 0;
      updatedAt = stored.updatedAt || null;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`[fresh] Không đọc được dữ liệu: ${error.message}`);
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = String(storedHash).split(':');
    const expected = Buffer.from(hash, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return expected.length > 0 && actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function persistUsers() {
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(users, null, 2));
  fs.renameSync(temporaryFile, usersFile);
}

function loadUsers() {
  try {
    const stored = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    users = Array.isArray(stored) ? stored : [];
  } catch (error) {
    if (error.code !== 'ENOENT') console.error(`[fresh] Không đọc được tài khoản: ${error.message}`);
    users = [];
  }
  if (users.length === 0) {
    users = defaultUsers.map((user, index) => ({
      id: `user-${index + 1}`,
      username: user.username,
      name: user.name,
      role: user.role,
      passwordHash: hashPassword(user.password),
      active: true,
      createdAt: new Date().toISOString(),
    }));
    persistUsers();
  }
}

function safeUser(user) {
  if (!user) return null;
  return { id: user.id, username: user.username, name: user.name, role: user.role, active: user.active !== false, createdAt: user.createdAt };
}

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions) if (session.expiresAt <= now) sessions.delete(token);
}

function createSession(user) {
  cleanExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { userId: user.id, expiresAt: Date.now() + sessionTtlMs });
  return token;
}

function sessionTokenFrom(request, url) {
  const authorization = String(request.headers.authorization || '');
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : url.searchParams.get('session');
}

function persistState() {
  fs.mkdirSync(dataDir, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify({ state: sharedState, revision, updatedAt }, null, 2));
  fs.renameSync(temporaryFile, dataFile);
}

function statePayload() {
  return { state: sharedState, revision, updatedAt };
}

function isOrderClosed(order) {
  return order?.status === 'Hoàn tất'
    || order?.paymentStatus === 'paid'
    || order?.kitchenCleared === true
    || order?.kitchenStatus === 'Đã xong';
}

// Each device synchronizes a full local orders array. Merge it on the server
// so an older kitchen/staff snapshot cannot reopen a completed order.
function mergeOrders(currentOrders, incomingOrders) {
  const current = Array.isArray(currentOrders) ? currentOrders : [];
  const incoming = Array.isArray(incomingOrders) ? incomingOrders : [];
  const currentById = new Map(current.filter((order) => order && order.id != null).map((order) => [String(order.id), order]));
  const seen = new Set();
  const merged = incoming.map((incomingOrder) => {
    if (!incomingOrder || typeof incomingOrder !== 'object' || incomingOrder.id == null) return incomingOrder;
    const id = String(incomingOrder.id);
    seen.add(id);
    const currentOrder = currentById.get(id);
    if (!currentOrder) return incomingOrder;
    if (isOrderClosed(currentOrder) && !isOrderClosed(incomingOrder)) return currentOrder;
    return { ...currentOrder, ...incomingOrder };
  });

  // A stale device may not know about a newer order yet; never delete it via PATCH.
  current.forEach((order) => {
    if (order && order.id != null && !seen.has(String(order.id))) merged.push(order);
  });
  return merged;
}

function mergeStateChanges(currentState, changes) {
  const nextState = { ...currentState };
  Object.entries(changes || {}).forEach(([key, value]) => {
    nextState[key] = key === 'orders' ? mergeOrders(currentState.orders, value) : value;
  });
  return nextState;
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(payload));
}

function authorized(request, url, response) {
  if (!accessToken) {
    writeJson(response, 503, { ok: false, error: 'Chưa cấu hình FRESH_ACCESS_TOKEN cho máy chủ.' });
    return false;
  }
  const requestToken = request.headers['x-fresh-token'] || url.searchParams.get('token');
  if (requestToken !== accessToken) {
    writeJson(response, 401, { ok: false, error: 'Mã truy cập máy chủ không đúng.' });
    return false;
  }
  return true;
}

function requireUser(request, url, response) {
  if (!authorized(request, url, response)) return null;
  cleanExpiredSessions();
  const session = sessions.get(sessionTokenFrom(request, url));
  const user = session ? users.find((candidate) => candidate.id === session.userId) : null;
  if (!user || user.active === false) {
    writeJson(response, 401, { ok: false, error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    return null;
  }
  return user;
}

function requireRole(request, url, response, roles) {
  const user = requireUser(request, url, response);
  if (!user) return null;
  if (roles && !roles.includes(user.role)) {
    writeJson(response, 403, { ok: false, error: 'Tài khoản không có quyền thực hiện thao tác này.' });
    return null;
  }
  return user;
}

function writeEvent(response, payload) {
  response.write(`event: state\ndata: ${JSON.stringify(payload)}\n\n`);
}

function broadcastState() {
  const payload = statePayload();
  for (const response of eventClients) writeEvent(response, payload);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > maxBodySize) {
        reject(new Error('Payload quá lớn'));
        request.destroy();
      }
    });
    request.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Payload JSON không hợp lệ'));
      }
    });
    request.on('error', reject);
  });
}

function updateState(nextState) {
  sharedState = normalizeState(nextState);
  revision += 1;
  updatedAt = new Date().toISOString();
  persistState();
  broadcastState();
  return statePayload();
}

function applyChanges(changes) {
  if (!changes || typeof changes !== 'object') return null;
  const current = sharedState || normalizeState({});
  const next = mergeStateChanges(current, changes);
  return updateState(next);
}

function mimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
  }[extension] || 'application/octet-stream';
}

function serveStatic(request, response, pathname) {
  if (!fs.existsSync(distDir)) return writeJson(response, 503, { ok: false, error: 'Chưa build giao diện. Hãy chạy npm run build.' });
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const safePath = path.normalize(path.join(distDir, decodedPath));
  const filePath = safePath.startsWith(distDir) && fs.existsSync(safePath) && fs.statSync(safePath).isFile() ? safePath : path.join(distDir, 'index.html');
  if (!fs.existsSync(filePath)) return writeJson(response, 404, { ok: false, error: 'Không tìm thấy giao diện.' });
  response.writeHead(200, { 'Content-Type': mimeType(filePath), 'Cache-Control': path.basename(filePath) === 'index.html' ? 'no-store' : 'public, max-age=3600' });
  fs.createReadStream(filePath).pipe(response);
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    return response.end();
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    return writeJson(response, 200, { ok: true, service: 'fresh-server', revision, updatedAt, initialized: Boolean(sharedState), authConfigured: Boolean(accessToken) });
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') {
    if (!authorized(request, url, response)) return;
    try {
      const body = await readBody(request);
      const username = String(body.username || '').trim().toLowerCase();
      const password = String(body.password || '');
      const user = users.find((candidate) => candidate.username.toLowerCase() === username);
      if (!user || user.active === false || !verifyPassword(password, user.passwordHash)) return writeJson(response, 401, { ok: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
      return writeJson(response, 200, { ok: true, sessionToken: createSession(user), user: safeUser(user), expiresIn: sessionTtlMs });
    } catch (error) {
      return writeJson(response, 400, { ok: false, error: error.message });
    }
  }

  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = requireUser(request, url, response);
    if (!user) return;
    return writeJson(response, 200, { ok: true, user: safeUser(user) });
  }

  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const user = requireUser(request, url, response);
    if (!user) return;
    sessions.delete(sessionTokenFrom(request, url));
    return writeJson(response, 200, { ok: true });
  }

  if (pathname === '/api/auth/users' && request.method === 'GET') {
    const user = requireRole(request, url, response, ['manager']);
    if (!user) return;
    return writeJson(response, 200, { ok: true, users: users.map(safeUser) });
  }

  if (pathname === '/api/auth/users' && request.method === 'POST') {
    const user = requireRole(request, url, response, ['manager']);
    if (!user) return;
    try {
      const body = await readBody(request);
      const username = String(body.username || '').trim().toLowerCase();
      const name = String(body.name || '').trim();
      const password = String(body.password || '');
      const role = String(body.role || 'staff');
      if (!/^[a-z0-9._-]{3,30}$/.test(username)) return writeJson(response, 400, { ok: false, error: 'Tên đăng nhập phải có 3–30 ký tự a-z, số, dấu chấm, gạch ngang hoặc gạch dưới.' });
      if (!name || password.length < 6 || !rolePermissions[role]) return writeJson(response, 400, { ok: false, error: 'Vui lòng nhập đủ tên, mật khẩu tối thiểu 6 ký tự và vai trò hợp lệ.' });
      if (users.some((candidate) => candidate.username.toLowerCase() === username)) return writeJson(response, 409, { ok: false, error: 'Tên đăng nhập đã tồn tại.' });
      const newUser = { id: `user-${Date.now()}`, username, name, role, passwordHash: hashPassword(password), active: true, createdAt: new Date().toISOString() };
      users = [...users, newUser];
      persistUsers();
      return writeJson(response, 201, { ok: true, user: safeUser(newUser) });
    } catch (error) {
      return writeJson(response, 400, { ok: false, error: error.message });
    }
  }

  if (pathname === '/api/state' && request.method === 'GET') {
    const user = requireUser(request, url, response);
    if (!user) return;
    return writeJson(response, 200, { ok: true, ...statePayload() });
  }

  if (pathname === '/api/events' && request.method === 'GET') {
    const user = requireUser(request, url, response);
    if (!user) return;
    response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
    response.flushHeaders?.();
    eventClients.add(response);
    writeEvent(response, statePayload());
    const heartbeat = setInterval(() => response.write(': ping\n\n'), 25000);
    request.on('close', () => { clearInterval(heartbeat); eventClients.delete(response); });
    return;
  }

  if ((pathname === '/api/state' && (request.method === 'PUT' || request.method === 'PATCH'))) {
    const user = request.method === 'PUT' ? requireRole(request, url, response, ['manager']) : requireRole(request, url, response, ['manager', 'staff', 'kitchen']);
    if (!user) return;
    try {
      const body = await readBody(request);
      if (request.method === 'PUT') return writeJson(response, 200, { ok: true, ...updateState(body.state) });
      const changes = body.changes && typeof body.changes === 'object' ? body.changes : null;
      if (!changes) return writeJson(response, 400, { ok: false, error: 'Dữ liệu đồng bộ không hợp lệ.' });
      const allowedKeys = rolePermissions[user.role] || [];
      const forbiddenKeys = Object.keys(changes).filter((key) => !allowedKeys.includes(key));
      if (forbiddenKeys.length) return writeJson(response, 403, { ok: false, error: 'Tài khoản không có quyền cập nhật dữ liệu này.' });
      const payload = applyChanges(changes);
      if (!payload) return writeJson(response, 400, { ok: false, error: 'Dữ liệu đồng bộ không hợp lệ.' });
      return writeJson(response, 200, { ok: true, ...payload });
    } catch (error) {
      return writeJson(response, 400, { ok: false, error: error.message });
    }
  }

  if (pathname.startsWith('/api/')) return writeJson(response, 404, { ok: false, error: 'API không tồn tại.' });
  return serveStatic(request, response, pathname);
}

loadState();
loadUsers();
const server = http.createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    console.error(`[fresh] ${error.stack || error.message}`);
    if (!response.headersSent) writeJson(response, 500, { ok: false, error: 'Lỗi máy chủ.' });
    else response.end();
  });
});

server.listen(port, host, () => {
  console.log(`[fresh] Máy chủ quản lý đang chạy tại http://localhost:${port}`);
  console.log(`[fresh] Xác thực LAN: ${accessToken ? 'đã bật' : 'chưa cấu hình — API đang khóa'}`);
  console.log(`[fresh] Máy gọi món và máy bếp dùng cùng URL, màn hình được chọn theo tài khoản đăng nhập.`);
});
