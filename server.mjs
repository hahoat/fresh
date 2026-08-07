import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const dataDir = process.env.FRESH_DATA_DIR || path.join(rootDir, 'data');
const dataFile = process.env.FRESH_DATA_FILE || path.join(dataDir, 'fresh-data.json');
const distDir = path.join(rootDir, 'dist');
const maxBodySize = 8 * 1024 * 1024;
const accessToken = String(process.env.FRESH_ACCESS_TOKEN || '').trim();

let sharedState = null;
let revision = 0;
let updatedAt = null;
const eventClients = new Set();

const stateKeys = ['products', 'orders', 'tables', 'inventory', 'staff'];

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

function persistState() {
  fs.mkdirSync(dataDir, { recursive: true });
  const temporaryFile = `${dataFile}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify({ state: sharedState, revision, updatedAt }, null, 2));
  fs.renameSync(temporaryFile, dataFile);
}

function statePayload() {
  return { state: sharedState, revision, updatedAt };
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
  const next = { ...(sharedState || {}) };
  for (const key of stateKeys) {
    if (Object.prototype.hasOwnProperty.call(changes, key) && Array.isArray(changes[key])) next[key] = changes[key];
  }
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

  if (pathname === '/api/state' && request.method === 'GET') {
    if (!authorized(request, url, response)) return;
    return writeJson(response, 200, { ok: true, ...statePayload() });
  }

  if (pathname === '/api/events' && request.method === 'GET') {
    if (!authorized(request, url, response)) return;
    response.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' });
    response.flushHeaders?.();
    eventClients.add(response);
    writeEvent(response, statePayload());
    const heartbeat = setInterval(() => response.write(': ping\n\n'), 25000);
    request.on('close', () => { clearInterval(heartbeat); eventClients.delete(response); });
    return;
  }

  if ((pathname === '/api/state' && (request.method === 'PUT' || request.method === 'PATCH'))) {
    if (!authorized(request, url, response)) return;
    try {
      const body = await readBody(request);
      const payload = request.method === 'PUT' ? updateState(body.state) : applyChanges(body.changes);
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
  console.log(`[fresh] Thiết bị gọi món: http://<IP-MAY-CHU>:${port}/?mode=staff`);
  console.log(`[fresh] Màn hình bếp: http://<IP-MAY-CHU>:${port}/?mode=kitchen`);
});
