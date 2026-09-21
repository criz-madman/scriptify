const http = require('http');
const assert = require('assert');
const app = require('../src/server');

const PORT = 5065;
let server;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runFirebaseTests() {
  console.log('Testing Firebase Authentication Integration...\n');
  server = app.listen(PORT);

  try {
    // Test 1: Reject missing/invalid email
    console.log('Test 1: Reject invalid payload missing email');
    const badRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/firebase-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { uid: 'some_uid' });

    assert.strictEqual(badRes.status, 400, 'Should return status 400');
    assert.strictEqual(badRes.data.success, false);
    console.log('✓ Rejected missing email correctly with 400');

    // Test 2: Successful Firebase Login / Registration
    console.log('\nTest 2: Successful Firebase Login with email and uid');
    const testEmail = `firebase.user.${Date.now()}@example.com`;
    const loginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/firebase-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      uid: 'firebase_test_uid_999',
      displayName: 'Test Firebase User'
    });

    assert.strictEqual(loginRes.status, 200, 'Should return 200 OK');
    assert.strictEqual(loginRes.data.success, true, 'Response should indicate success');
    assert(loginRes.data.token, 'Should return a signed JWT token');
    assert.strictEqual(loginRes.data.user.email, testEmail, 'Email should match');
    assert.strictEqual(loginRes.data.walletBalance, 100, 'New user should receive 100 initial starter credits');
    console.log(`✓ Created user & wallet with 100 credits: ${testEmail}`);
    console.log(`✓ Received valid Scriptify JWT: ${loginRes.data.token.substring(0, 20)}...`);

    // Test 3: Authenticated /api/auth/me check with the returned JWT token
    console.log('\nTest 3: Fetching /api/auth/me using Scriptify token');
    const meRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginRes.data.token}`
      }
    });

    assert.strictEqual(meRes.status, 200, 'Should return 200 OK');
    assert.strictEqual(meRes.data.user.email, testEmail);
    assert.strictEqual(meRes.data.walletBalance, 100);
    console.log('✓ Token validated successfully against PostgreSQL 3NF Users & CreditWallet');

    // Test 4: Existing user re-login
    console.log('\nTest 4: Existing user re-login with Firebase');
    const reLoginRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/firebase-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      uid: 'firebase_test_uid_999'
    });

    assert.strictEqual(reLoginRes.status, 200);
    assert.strictEqual(reLoginRes.data.user.email, testEmail);
    console.log('✓ Re-login handled gracefully for existing user');

    console.log('\n🎉 ALL FIREBASE AUTHENTICATION TESTS PASSED!\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Firebase test failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runFirebaseTests();
