const STATE_KEYS = ['products', 'orders', 'tables', 'inventory', 'staff'];
const ROLE_PERMISSIONS = {
  manager: STATE_KEYS,
  staff: ['products', 'orders', 'tables'],
  kitchen: ['orders', 'tables'],
};
const DEFAULT_USERS = [
  { id: 'user-1', username: 'admin', name: 'Quản lý Fresh', role: 'manager', password: 'admin123' },
  { id: 'user-2', username: 'phucvu', name: 'Nhân viên phục vụ', role: 'staff', password: 'phucvu123' },
  { id: 'user-3', username: 'bep', name: 'Bếp Fresh', role: 'kitchen', password: 'bep12345' },
];
const EMPTY_STATE = { version: 3, products: [], orders: [], tables: [], inventory: [], staff: [] };
// Cloudflare Workers currently accepts PBKDF2 iteration counts up to 100000.
const PASSWORD_ITERATIONS = 100000;
const MAX_BODY_SIZE = 8 * 1024 * 1024;
const databaseReady = new WeakMap();

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

function jsonResponse(payload, status = 200, extraHeaders = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  return new Response(JSON.stringify(payload), { status, headers });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ ok: false, error: message }, status);
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeEqual(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array) || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function derivePasswordHash(password, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PASSWORD_ITERATIONS, hash: 'SHA-256' },
    passwordKey,
    256,
  );
  return `pbkdf2$sha256$${PASSWORD_ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(derivedBits))}`;
}

async function verifyPassword(password, storedHash) {
  try {
    const [algorithm, digest, iterationsText, saltText, hashText] = String(storedHash || '').split('$');
    const iterations = Number(iterationsText);
    if (algorithm !== 'pbkdf2' || digest !== 'sha256' || !Number.isInteger(iterations) || iterations < 10000 || !saltText || !hashText) return false;
    const salt = base64ToBytes(saltText);
    const expected = base64ToBytes(hashText);
    const passwordKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
    const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, passwordKey, expected.length * 8);
    return constantTimeEqual(new Uint8Array(derivedBits), expected);
  } catch {
    return false;
  }
}

async function hashSessionToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return bytesToBase64Url(new Uint8Array(digest));
}

function sessionTtlSeconds(env) {
  const configured = Number(env.SESSION_TTL_SECONDS || 43200);
  return Number.isFinite(configured) && configured >= 900 ? Math.floor(configured) : 43200;
}

function cookieValue(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key === name) return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return '';
}

function requestSessionToken(request) {
  const cookieToken = cookieValue(request, 'fresh_session');
  if (cookieToken) return cookieToken;
  const authorization = request.headers.get('Authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

function sessionCookie(request, token, maxAge) {
  const url = new URL(request.url);
  const secure = url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  return `fresh_session=${encodeURIComponent(token)}; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function clearSessionCookie(request) {
  return sessionCookie(request, '', 0) + '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    active: Number(user.active) !== 0,
    createdAt: user.created_at || user.createdAt,
  };
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_BODY_SIZE) throw new Error('Payload quá lớn.');
  const text = await request.text();
  if (text.length > MAX_BODY_SIZE) throw new Error('Payload quá lớn.');
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Payload JSON không hợp lệ.');
  }
}

async function initializeDatabase(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state_json TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'staff', 'kitchen')),
      password_hash TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions (expires_at)'),
  ]);

  const now = new Date().toISOString();
  const stateRow = await db.prepare('SELECT id FROM app_state WHERE id = 1').first();
  if (!stateRow) {
    await db.prepare('INSERT INTO app_state (id, state_json, revision, updated_at) VALUES (1, ?, 0, ?)').bind(JSON.stringify(EMPTY_STATE), now).run();
  }

  const userCount = await db.prepare('SELECT COUNT(*) AS count FROM auth_users').first();
  if (Number(userCount?.count || 0) === 0) {
    const seedStatements = [];
    for (const user of DEFAULT_USERS) {
      seedStatements.push(db.prepare(`INSERT INTO auth_users (id, username, name, role, password_hash, active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)`)
        .bind(user.id, user.username, user.name, user.role, await derivePasswordHash(user.password), now));
    }
    await db.batch(seedStatements);
  }
}

async function ensureDatabase(env) {
  if (!env.DB) throw new Error('Chưa liên kết D1. Hãy tạo database và binding DB trong wrangler.jsonc.');
  if (!databaseReady.has(env.DB)) {
    databaseReady.set(env.DB, initializeDatabase(env.DB).catch((error) => {
      databaseReady.delete(env.DB);
      throw error;
    }));
  }
  await databaseReady.get(env.DB);
}

async function getState(db) {
  const row = await db.prepare('SELECT state_json, revision, updated_at FROM app_state WHERE id = 1').first();
  let state = EMPTY_STATE;
  try {
    state = normalizeState(JSON.parse(row?.state_json || '{}'));
  } catch {
    state = normalizeState({});
  }
  return { state, revision: Number(row?.revision || 0), updatedAt: row?.updated_at || null };
}

async function saveState(db, nextState) {
  const current = await getState(db);
  const revision = current.revision + 1;
  const updatedAt = new Date().toISOString();
  const state = normalizeState(nextState);
  await db.prepare('UPDATE app_state SET state_json = ?, revision = ?, updated_at = ? WHERE id = 1')
    .bind(JSON.stringify(state), revision, updatedAt)
    .run();
  return { state, revision, updatedAt };
}

async function findUser(request, db) {
  const token = requestSessionToken(request);
  if (!token) return null;
  const tokenHash = await hashSessionToken(token);
  const row = await db.prepare(`SELECT u.id, u.username, u.name, u.role, u.active, u.created_at
    FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`)
    .bind(tokenHash, Date.now())
    .first();
  return row && Number(row.active) !== 0 ? row : null;
}

async function requireUser(request, env) {
  await ensureDatabase(env);
  return findUser(request, env.DB);
}

async function requireRole(request, env, roles) {
  const user = await requireUser(request, env);
  if (!user) return { error: errorResponse('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401) };
  if (!roles.includes(user.role)) return { error: errorResponse('Tài khoản không có quyền thực hiện thao tác này.', 403) };
  return { user };
}

async function login(request, env) {
  await ensureDatabase(env);
  const body = await readJsonBody(request);
  const username = String(body.username || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = await env.DB.prepare('SELECT * FROM auth_users WHERE username = ? COLLATE NOCASE').bind(username).first();
  if (!user || Number(user.active) === 0 || !(await verifyPassword(password, user.password_hash))) {
    return errorResponse('Tên đăng nhập hoặc mật khẩu không đúng.', 401);
  }

  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = bytesToBase64Url(tokenBytes);
  const tokenHash = await hashSessionToken(token);
  const ttl = sessionTtlSeconds(env);
  const expiresAt = Date.now() + ttl * 1000;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').bind(Date.now()),
    env.DB.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(tokenHash, user.id, expiresAt),
  ]);
  const response = jsonResponse({ ok: true, user: safeUser(user), expiresIn: ttl * 1000 });
  response.headers.append('Set-Cookie', sessionCookie(request, token, ttl));
  return response;
}

async function createUser(request, env) {
  const body = await readJsonBody(request);
  const username = String(body.username || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const password = String(body.password || '');
  const role = String(body.role || 'staff');
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) return errorResponse('Tên đăng nhập phải có 3–30 ký tự a-z, số, dấu chấm, gạch ngang hoặc gạch dưới.');
  if (!name || password.length < 6 || !ROLE_PERMISSIONS[role]) return errorResponse('Vui lòng nhập đủ tên, mật khẩu tối thiểu 6 ký tự và vai trò hợp lệ.');
  const existing = await env.DB.prepare('SELECT id FROM auth_users WHERE username = ? COLLATE NOCASE').bind(username).first();
  if (existing) return errorResponse('Tên đăng nhập đã tồn tại.', 409);
  const newUser = {
    id: `user-${crypto.randomUUID()}`,
    username,
    name,
    role,
    passwordHash: await derivePasswordHash(password),
    active: 1,
    createdAt: new Date().toISOString(),
  };
  await env.DB.prepare(`INSERT INTO auth_users (id, username, name, role, password_hash, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(newUser.id, newUser.username, newUser.name, newUser.role, newUser.passwordHash, newUser.active, newUser.createdAt)
    .run();
  return jsonResponse({ ok: true, user: safeUser(newUser) }, 201);
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400' } });
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    try {
      await ensureDatabase(env);
      const payload = await getState(env.DB);
      return jsonResponse({ ok: true, service: 'fresh-cloudflare-worker', revision: payload.revision, updatedAt: payload.updatedAt, initialized: true, database: 'D1' });
    } catch (error) {
      return errorResponse(error.message || 'D1 chưa sẵn sàng.', 503);
    }
  }

  if (pathname === '/api/auth/login' && request.method === 'POST') return login(request, env);

  if (pathname === '/api/auth/me' && request.method === 'GET') {
    const user = await requireUser(request, env);
    if (!user) return errorResponse('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401);
    return jsonResponse({ ok: true, user: safeUser(user) });
  }

  if (pathname === '/api/auth/logout' && request.method === 'POST') {
    const user = await requireUser(request, env);
    if (!user) return errorResponse('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401);
    const token = requestSessionToken(request);
    if (token) await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(await hashSessionToken(token)).run();
    const response = jsonResponse({ ok: true });
    response.headers.append('Set-Cookie', clearSessionCookie(request));
    return response;
  }

  if (pathname === '/api/auth/users' && request.method === 'GET') {
    const result = await requireRole(request, env, ['manager']);
    if (result.error) return result.error;
    const { results } = await env.DB.prepare('SELECT id, username, name, role, active, created_at FROM auth_users ORDER BY created_at ASC').all();
    return jsonResponse({ ok: true, users: results.map(safeUser) });
  }

  if (pathname === '/api/auth/users' && request.method === 'POST') {
    const result = await requireRole(request, env, ['manager']);
    if (result.error) return result.error;
    return createUser(request, env);
  }

  if (pathname === '/api/admin/reset' && request.method === 'POST') {
    const result = await requireRole(request, env, ['manager']);
    if (result.error) return result.error;
    const body = await readJsonBody(request);
    if (body.confirm !== 'RESET_FRESH') return errorResponse('Cần xác nhận RESET_FRESH để đặt lại dữ liệu vận hành.');
    return jsonResponse({ ok: true, reset: true, ...(await saveState(env.DB, EMPTY_STATE)) });
  }

  if (pathname === '/api/state' && request.method === 'GET') {
    const user = await requireUser(request, env);
    if (!user) return errorResponse('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401);
    return jsonResponse({ ok: true, ...(await getState(env.DB)) });
  }

  if (pathname === '/api/state' && (request.method === 'PUT' || request.method === 'PATCH')) {
    const result = await requireRole(request, env, request.method === 'PUT' ? ['manager'] : ['manager', 'staff', 'kitchen']);
    if (result.error) return result.error;
    const body = await readJsonBody(request);
    if (request.method === 'PUT') return jsonResponse({ ok: true, ...(await saveState(env.DB, body.state)) });

    const changes = body.changes && typeof body.changes === 'object' ? body.changes : null;
    if (!changes) return errorResponse('Dữ liệu đồng bộ không hợp lệ.');
    const allowedKeys = ROLE_PERMISSIONS[result.user.role] || [];
    const changedKeys = Object.keys(changes);
    const forbiddenKeys = changedKeys.filter((key) => !allowedKeys.includes(key));
    if (forbiddenKeys.length) return errorResponse('Tài khoản không có quyền cập nhật dữ liệu này.', 403);
    if (changedKeys.some((key) => !Array.isArray(changes[key]))) return errorResponse('Dữ liệu đồng bộ không hợp lệ.');
    const current = await getState(env.DB);
    const nextState = { ...current.state };
    for (const key of changedKeys) nextState[key] = changes[key];
    return jsonResponse({ ok: true, ...(await saveState(env.DB, nextState)) });
  }

  return errorResponse('API không tồn tại.', 404);
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);
      if (!env.ASSETS) return errorResponse('Chưa cấu hình static assets cho Worker.', 503);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error(`[fresh-worker] ${error?.stack || error?.message || error}`);
      return errorResponse('Lỗi máy chủ Fresh.', 500);
    }
  },
};
