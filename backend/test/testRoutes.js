const http = require('http');
const assert = require('assert');
const app = require('../src/server');

const PORT = 5060;
let server;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function testAllRoutes() {
  console.log('Testing Multi-Page HTTP Routes...\n');
  server = app.listen(PORT);

  try {
    const routes = [
      { path: '/', expected: 'Automate After Effects' },
      { path: '/login', expected: 'Studio Sign In' },
      { path: '/dashboard', expected: 'Studio Tools Hub' },
      { path: '/panel-builder', expected: 'Pick your actions' },
      { path: '/text-animator', expected: 'Text Animation Generator' },
      { path: '/presets', expected: 'Marketplace' },
      { path: '/marketplace', expected: 'Marketplace' },
      { path: '/shop', expected: 'Marketplace' },
      { path: '/wallet', expected: 'Credit Balance & Purchases' },
      { path: '/health', expected: '"status":"ok"' }
    ];

    for (const r of routes) {
      const res = await get(r.path);
      assert.strictEqual(res.status, 200, `Route ${r.path} must return status 200`);
      assert(res.body.includes(r.expected), `Route ${r.path} content must match "${r.expected}"`);
      console.log(`✓ ${r.path.padEnd(16)} -> 200 OK (Contains "${r.expected}")`);
    }

    console.log('\nAll Multi-Page Routes Verified Successfully! 🎉\n');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Route test failed:', err);
    if (server) server.close();
    process.exit(1);
  }
}

testAllRoutes();
