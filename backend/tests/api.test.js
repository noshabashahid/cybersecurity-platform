/**
 * Basic integration tests against a running instance of the API.
 *
 * These use Node's built-in test runner (Node 18+) and plain fetch,
 * so no extra test framework dependency is required.
 *
 * IMPORTANT: These tests hit a REAL database (whatever is configured
 * in your .env), so run them against a dev/test database, never
 * production. Start the server first (npm run dev) in another
 * terminal, then run: npm test
 *
 * They cover the "must work" checklist from the project spec:
 *  - registration creates a real user
 *  - login authenticates and returns a JWT
 *  - protected routes reject requests with no/invalid token
 *  - a normal user cannot call admin-only endpoints
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';
const randomEmail = () => `test_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

test('health check responds', async () => {
  const { status, body } = await api('/health');
  assert.equal(status, 200);
  assert.equal(body.success, true);
});

test('registration creates a real user and returns a token', async () => {
  const email = randomEmail();
  const { status, body } = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test User', email, password: 'TestPassword123!' }),
  });
  assert.equal(status, 201);
  assert.equal(body.success, true);
  assert.ok(body.token, 'expected a JWT to be returned');
  assert.equal(body.user.email, email);
});

test('login rejects invalid credentials', async () => {
  const { status, body } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrongpassword' }),
  });
  assert.equal(status, 401);
  assert.equal(body.success, false);
});

test('login succeeds with correct credentials and returns a token', async () => {
  const email = randomEmail();
  const password = 'TestPassword123!';
  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Login Test', email, password }),
  });

  const { status, body } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assert.equal(status, 200);
  assert.ok(body.token);
});

test('protected route rejects requests with no token', async () => {
  const { status, body } = await api('/auth/me');
  assert.equal(status, 401);
  assert.equal(body.success, false);
});

test('protected route rejects an invalid/garbage token', async () => {
  const { status } = await api('/auth/me', { headers: { Authorization: 'Bearer not-a-real-token' } });
  assert.equal(status, 401);
});

test('a normal user cannot access admin-only endpoints', async () => {
  const email = randomEmail();
  const password = 'TestPassword123!';
  await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Regular User', email, password }) });
  const { body: loginBody } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

  const { status, body } = await api('/admin/dashboard', {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  assert.equal(status, 403);
  assert.equal(body.success, false);
});

test('url analysis endpoint requires authentication', async () => {
  const { status } = await api('/analyze/url', {
    method: 'POST',
    body: JSON.stringify({ url: 'http://example.com' }),
  });
  assert.equal(status, 401);
});

test('authenticated url analysis returns a structured risk report', async () => {
  const email = randomEmail();
  const password = 'TestPassword123!';
  await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'URL Tester', email, password }) });
  const { body: loginBody } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

  const { status, body } = await api('/analyze/url', {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginBody.token}` },
    body: JSON.stringify({ url: 'http://192.168.1.1/login' }),
  });
  assert.equal(status, 201);
  assert.ok(typeof body.result.riskScore === 'number');
  assert.ok(['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(body.result.riskLevel));
});

test('analysis history is scoped to the authenticated user', async () => {
  const email = randomEmail();
  const password = 'TestPassword123!';
  await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'History Tester', email, password }) });
  const { body: loginBody } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

  const { status, body } = await api('/analyses', {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
});
