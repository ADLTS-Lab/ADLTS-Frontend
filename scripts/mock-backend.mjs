import http from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = 8080;
const API_PREFIX = '/api/v1';

const users = new Map();
const tokens = new Map();
const refreshTokens = new Map();
const resetTokens = new Map();
const candidateRecords = new Map();

function seedUser({ id, email, password, role, first_name, last_name, name, phone }) {
  users.set(email.toLowerCase(), {
    id,
    email: email.toLowerCase(),
    password,
    role,
    first_name,
    last_name,
    name,
    phone,
    licenseCategory: role === 'candidate' ? 'B' : undefined,
    testCenter: role === 'candidate' ? 'Bole Test Center' : undefined,
  });
}

seedUser({ id: 'super-admin-1', email: 'root@adlts.et', password: 'SuperSecure123!', role: 'super_admin', name: 'Root Admin' });
seedUser({ id: 'admin-1', email: 'admin@adlts.gov.et', password: 'admin123', role: 'admin', name: 'Admin User' });
seedUser({ id: 'admin-2', email: 'admin@adlts.et', password: 'AdminSecure123!', role: 'admin', name: 'Admin User' });
seedUser({ id: 'candidate-1', email: 'candidate@adlts.et', password: 'password123', role: 'candidate', first_name: 'Candidate', last_name: 'User', phone: '+251900000000' });
seedUser({ id: 'candidate-2', email: 'abebe.tesfaye@example.com', password: 'SecurePassword123!', role: 'candidate', first_name: 'Abebe', last_name: 'Tesfaye', phone: '+251912345678' });
seedUser({ id: 'expert-1', email: 'expert.john@example.com', password: 'ExpertSecure123!', role: 'expert', first_name: 'Expert', last_name: 'John', phone: '+251911111111' });
seedUser({ id: 'institute-1', email: 'institute.jane@example.com', password: 'InstituteSecure123!', role: 'institute', name: 'Institute Jane', phone: '+251922222222' });
seedUser({ id: 'authority-1', email: 'authority.jane@example.com', password: 'AuthoritySecure123!', role: 'transport_authority', name: 'Authority Jane', phone: '+251933333333' });

function seedCandidateRecord({ id, email, name, first_name, last_name, status = 'active', testCenter = 'Bole Test Center', licenseCategory = 'B' }) {
  candidateRecords.set(id, {
    id,
    email,
    name,
    first_name,
    last_name,
    status,
    testCenter,
    licenseCategory,
    phone: users.get(email)?.phone || '+251900000000',
  });
}

seedCandidateRecord({ id: 'candidate-1', email: 'candidate@adlts.et', first_name: 'Candidate', last_name: 'User', status: 'active', testCenter: 'Bole Test Center', licenseCategory: 'B' });
seedCandidateRecord({ id: 'candidate-2', email: 'abebe.tesfaye@example.com', first_name: 'Abebe', last_name: 'Tesfaye', status: 'active', testCenter: 'Bahir Dar Center', licenseCategory: 'C' });
seedCandidateRecord({ id: 'candidate-3', email: 'suspended.mary@example.com', first_name: 'Mary', last_name: 'Kebede', status: 'suspended', testCenter: 'Adama Center', licenseCategory: 'A' });

function toSafeUser(user) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function toCandidateRecord(user) {
  const record = candidateRecords.get(user.id);
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name || record?.first_name || '',
    last_name: user.last_name || record?.last_name || '',
    name: user.name || record?.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    phone: user.phone || record?.phone || '',
    status: record?.status || 'active',
    licenseCategory: user.licenseCategory || record?.licenseCategory || 'B',
    testCenter: user.testCenter || record?.testCenter || 'Bole Test Center',
    role: 'candidate',
  };
}

function json(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

function issueToken(user) {
  const accessToken = `mock-access-${user.role}-${randomUUID()}`;
  const refreshToken = `mock-refresh-${user.role}-${randomUUID()}`;
  tokens.set(accessToken, user.email);
  refreshTokens.set(refreshToken, user.email);
  return {
    success: true,
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      entity_type: user.role,
      user: toSafeUser(user),
    },
  };
}

function refreshTokensFromRequest(req, body = {}) {
  let refreshToken = String(body.refresh_token || '').trim();
  if (!refreshToken) {
    refreshToken = getBearerToken(req);
  }
  return refreshToken;
}

async function handleTokenRefresh(req, res) {
  const body = await parseBody(req);
  const refreshToken = refreshTokensFromRequest(req, body);

  if (!refreshToken) {
    json(res, 400, { success: false, message: 'Refresh token is required.' });
    return;
  }

  const email = refreshTokens.get(refreshToken);
  if (!email) {
    json(res, 401, { success: false, message: 'Invalid or expired refresh token.' });
    return;
  }

  const user = users.get(email);
  if (!user) {
    json(res, 401, { success: false, message: 'Invalid or expired refresh token.' });
    return;
  }

  json(res, 200, issueToken(user));
}

function authUserFromRequest(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  const email = tokens.get(token);
  if (!email) return null;
  return users.get(email) || null;
}

async function handleAuthLogin(req, res) {
  const body = await parseBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = users.get(email);

  if (!user || user.password !== password) {
    json(res, 401, { success: false, message: 'Invalid email or password.' });
    return;
  }

  json(res, 200, issueToken(user));
}

async function handleAuthRegister(req, res) {
  const body = await parseBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const confirmPassword = String(body.confirm_password || '');
  const name = String(body.name || '').trim();

  if (!email || !password || !confirmPassword) {
    json(res, 400, { success: false, message: 'Email, password, and confirm_password are required.' });
    return;
  }

  if (password !== confirmPassword) {
    json(res, 400, { success: false, message: 'Password and confirm password must match.' });
    return;
  }

  if (users.has(email)) {
    json(res, 409, { success: false, message: 'A user with that email already exists.' });
    return;
  }

  const [firstName, ...restName] = name ? name.split(/\s+/) : ['Candidate'];
  const lastName = restName.join(' ') || 'User';
  const user = {
    id: `candidate-${randomUUID()}`,
    email,
    password,
    role: 'candidate',
    first_name: body.first_name || firstName,
    last_name: body.last_name || lastName,
    phone: body.phone || '+251900000000',
    licenseCategory: 'B',
    testCenter: 'Bole Test Center',
  };

  users.set(email, user);
  seedCandidateRecord({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    status: 'active',
    testCenter: user.testCenter,
    licenseCategory: user.licenseCategory,
  });
  json(res, 201, issueToken(user));
}

async function handleForgotPassword(req, res) {
  const body = await parseBody(req);
  const email = String(body.email || '').trim().toLowerCase();
  const resetToken = `reset-${randomUUID()}`;

  if (email && users.has(email)) {
    resetTokens.set(resetToken, email);
  }

  json(res, 200, {
    success: true,
    message: 'If your email exists in our system, you will receive a reset link shortly.',
    data: { reset_token: resetToken },
  });
}

async function handleResetPassword(req, res) {
  const body = await parseBody(req);
  const token = String(body.token || body.reset_token || '').trim();
  const newPassword = String(body.password || body.new_password || '').trim();
  const confirmPassword = String(body.confirm_password || '').trim();

  if (!token || !newPassword || !confirmPassword) {
    json(res, 400, { success: false, message: 'Token, password, and confirm_password are required.' });
    return;
  }

  if (newPassword !== confirmPassword) {
    json(res, 400, { success: false, message: 'Password and confirm password must match.' });
    return;
  }

  const email = resetTokens.get(token);
  if (!email) {
    json(res, 400, { success: false, message: 'Invalid or expired reset token.' });
    return;
  }

  const user = users.get(email);
  if (!user) {
    json(res, 404, { success: false, message: 'User not found.' });
    return;
  }

  user.password = newPassword;
  resetTokens.delete(token);
  json(res, 200, { success: true, message: 'Password reset successful' });
}

function listCandidates(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const search = String(url.searchParams.get('search') || '').trim().toLowerCase();

  const candidates = Array.from(users.values())
    .filter((user) => user.role === 'candidate')
    .map((user) => toCandidateRecord(user))
    .filter((candidate) => {
      if (!search) return true;
      const haystack = [candidate.name, candidate.email, candidate.status, candidate.first_name, candidate.last_name].join(' ').toLowerCase();
      return haystack.includes(search);
    });

  json(res, 200, { success: true, data: candidates });
}

async function patchCandidateStatus(req, res, pathname) {
  const authUser = authUserFromRequest(req);
  if (!authUser) {
    json(res, 401, { success: false, message: 'Unauthorized.' });
    return;
  }

  if (authUser.role !== 'admin' && authUser.role !== 'super_admin') {
    json(res, 403, { success: false, message: 'Forbidden.' });
    return;
  }

  const match = pathname.match(/^\/api\/v1\/candidates\/([^/]+)\/status$/);
  const candidateId = match ? decodeURIComponent(match[1]) : '';
  const body = await parseBody(req);
  const status = String(body.status || '').trim().toLowerCase();

  const user = Array.from(users.values()).find((entry) => entry.id === candidateId && entry.role === 'candidate');
  if (!user) {
    json(res, 404, { success: false, message: 'Candidate not found.' });
    return;
  }

  if (!['active', 'suspended'].includes(status)) {
    json(res, 400, { success: false, message: 'Status must be active or suspended.' });
    return;
  }

  user.status = status;
  users.set(user.email, user);

  const candidate = candidateRecords.get(candidateId) || toCandidateRecord(user);
  candidate.status = status;
  candidateRecords.set(candidateId, candidate);
  json(res, 200, { success: true, message: 'Candidate status updated successfully.', data: candidate });
}

async function handleLogout(req, res) {
  const token = getBearerToken(req);
  if (token) {
    tokens.delete(token);
  }
  json(res, 200, { success: true, message: 'Logged out successfully.' });
}

function roleFromPath(pathname) {
  const match = pathname.match(/^\/api\/v1\/([^/]+)\/me$/);
  if (!match) return '';
  return match[1];
}

function meHandler(req, res, pathname) {
  const role = roleFromPath(pathname);
  const user = authUserFromRequest(req);

  if (!user) {
    json(res, 401, { success: false, message: 'Unauthorized.' });
    return;
  }

  const expectedRole = role === 'transport-authorities' ? 'transport_authority' : role.replace(/-/g, '_').replace(/s$/, '');
  if (user.role !== expectedRole) {
    json(res, 403, { success: false, message: 'Forbidden.' });
    return;
  }

  if (req.method === 'PATCH') {
    json(res, 200, { success: true, data: toSafeUser(user) });
    return;
  }

  if (req.method === 'DELETE') {
    json(res, 200, { success: true, message: 'Account deleted successfully.' });
    return;
  }

  json(res, 200, { success: true, data: toSafeUser(user) });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    json(res, 400, { success: false, message: 'Bad request.' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/health') {
    json(res, 200, { success: true, message: 'ok' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    });
    res.end();
    return;
  }

  if (url.pathname === `${API_PREFIX}/auth/login` && req.method === 'POST') {
    await handleAuthLogin(req, res);
    return;
  }

  if (url.pathname === `${API_PREFIX}/auth/register` && req.method === 'POST') {
    await handleAuthRegister(req, res);
    return;
  }

  if (
    (url.pathname === `${API_PREFIX}/auth/forgot-password` ||
      url.pathname === `${API_PREFIX}/auth/password/forgot`) &&
    req.method === 'POST'
  ) {
    await handleForgotPassword(req, res);
    return;
  }

  if (
    (url.pathname === `${API_PREFIX}/auth/reset-password` ||
      url.pathname === `${API_PREFIX}/auth/password/reset`) &&
    req.method === 'POST'
  ) {
    await handleResetPassword(req, res);
    return;
  }

  if (url.pathname === `${API_PREFIX}/auth/logout` && req.method === 'POST') {
    await handleLogout(req, res);
    return;
  }

  if (
    (url.pathname === `${API_PREFIX}/auth/refresh` ||
      url.pathname === `${API_PREFIX}/auth/token/refresh`) &&
    req.method === 'POST'
  ) {
    await handleTokenRefresh(req, res);
    return;
  }

  if (/^\/api\/v1\/(super-admins|admins|candidates|experts|institutes|transport-authorities)\/me$/.test(url.pathname)) {
    meHandler(req, res, url.pathname);
    return;
  }

  if (url.pathname === `${API_PREFIX}/candidates` && req.method === 'GET') {
    const authUser = authUserFromRequest(req);
    if (!authUser) {
      json(res, 401, { success: false, message: 'Unauthorized.' });
      return;
    }
    if (authUser.role !== 'admin' && authUser.role !== 'super_admin') {
      json(res, 403, { success: false, message: 'Forbidden.' });
      return;
    }
    listCandidates(req, res);
    return;
  }

  if (/^\/api\/v1\/candidates\/[^/]+\/status$/.test(url.pathname) && req.method === 'PATCH') {
    await patchCandidateStatus(req, res, url.pathname);
    return;
  }

  json(res, 404, {
    success: false,
    message: `No mock route for ${req.method} ${url.pathname}`,
  });
});

server.listen(PORT, () => {
  console.log(`ADLTS mock backend listening on http://localhost:${PORT}${API_PREFIX}`);
});
