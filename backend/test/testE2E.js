const http = require('http');
const assert = require('assert');
const app = require('../src/server');

const PORT = 5055;
let server;

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data && { 'Content-Length': Buffer.byteLength(data) }),
          ...(token && { Authorization: `Bearer ${token}` })
        }
      },
      (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(resData);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, body: resData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Starting End-to-End API Integration Verification...\n');

  server = app.listen(PORT);

  try {
    // 1. Health Check
    const health = await makeRequest('/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.database, 'connected');
    console.log('✓ Health check passed (Database connected)');

    // 2. Auth: Send OTP
    const testEmail = `motion_test_${Date.now()}@scriptify.dev`;
    const otpRes = await makeRequest('/api/auth/send-otp', 'POST', { email: testEmail });
    assert.strictEqual(otpRes.status, 200);
    assert(otpRes.body.devOtp, 'Dev OTP should be returned in development mode');
    const otp = otpRes.body.devOtp;
    console.log(`✓ OTP dispatched to ${testEmail} (Code: ${otp})`);

    // 3. Auth: Verify OTP
    const verifyRes = await makeRequest('/api/auth/verify-otp', 'POST', { email: testEmail, otp });
    assert.strictEqual(verifyRes.status, 200);
    assert(verifyRes.body.token, 'Token must be issued');
    assert.strictEqual(verifyRes.body.walletBalance, 100, 'Initial balance must be 100 credits');
    const token = verifyRes.body.token;
    console.log(`✓ User verified and created in Users (D1) & CreditWallet (D2) with 100 credits`);

    // 4. Wallet: Check Balance
    const balanceRes = await makeRequest('/api/wallet/balance', 'GET', null, token);
    assert.strictEqual(balanceRes.status, 200);
    assert.strictEqual(balanceRes.body.wallet.balancePoints, 100);
    console.log(`✓ Wallet balance checked: ${balanceRes.body.wallet.balancePoints} points`);

    // 5. Script Generation & Credit Deduction
    const genRes = await makeRequest('/api/scripts/generate', 'POST', {
      scriptType: 'preset',
      presetId: 'layer_stagger',
      scriptName: 'Auto_Stagger_E2E',
      undoName: 'E2E Stagger',
      options: { frameStep: 8, reverseOrder: false }
    }, token);

    assert.strictEqual(genRes.status, 200);
    assert.strictEqual(genRes.body.remainingBalance, 99, 'Balance must be deducted by 1 point');
    assert(genRes.body.scriptCode.includes('app.beginUndoGroup("E2E Stagger");'), 'Code must be wrapped in undo group');
    assert(genRes.body.historyId, 'History ID must be recorded in HistoryLog (D3)');
    console.log(`✓ Script generated, 1 credit deducted atomically (Remaining: ${genRes.body.remainingBalance}), logged to HistoryLog (D3)`);

    // 6. Wallet: Top-up Credits (Table D4: Transactions)
    const topupRes = await makeRequest('/api/wallet/topup', 'POST', {
      amountPaid: 12.00,
      creditPoints: 150,
      paymentMethod: 'stripe_mock'
    }, token);

    assert.strictEqual(topupRes.status, 200);
    assert.strictEqual(topupRes.body.newBalance, 99 + 150, 'New balance must be 249 points');
    console.log(`✓ Top-up processed: $12.00 for 150 credits recorded in Transactions (D4). New balance: ${topupRes.body.newBalance}`);

    // 7. Wallet: Get Transactions
    const txRes = await makeRequest('/api/wallet/transactions', 'GET', null, token);
    assert.strictEqual(txRes.status, 200);
    assert(txRes.body.transactions.length >= 1, 'Transaction must appear in list');
    assert.strictEqual(parseFloat(txRes.body.transactions[0].amountPaid), 12.00);
    console.log(`✓ Transactions ledger verified (${txRes.body.transactions.length} record)`);

    // 8. Script: Get History
    const histRes = await makeRequest('/api/scripts/history', 'GET', null, token);
    assert.strictEqual(histRes.status, 200);
    assert(histRes.body.history.length >= 1, 'History log must have at least 1 record');
    console.log(`✓ Generation history verified (${histRes.body.history.length} record in D3 HistoryLog)`);

    console.log('\n======================================================');
    console.log('🎉 ALL 8 E2E BACKEND & DATABASE INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('Test Failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
