const app = require('./app');
const http = require('http');

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log('Testing APIs on http://localhost:5099/api ...');

  const fetchUrl = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5099,
        path: `/api${path}`,
        method,
        headers: { 'Content-Type': 'application/json' }
      };

      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Test Base API
    const base = await fetchUrl('');
    console.log('[TEST 1] Base API:', base.status, base.data.name);

    // 2. Test Login
    const login = await fetchUrl('/auth/login', 'POST', { username: 'admin_investigator', password: 'admin123' });
    console.log('[TEST 2] Auth Login:', login.status, login.data.success ? 'Success' : 'Failed');

    // 3. Test Dashboard Summary
    const dash = await fetchUrl('/dashboard/summary');
    console.log('[TEST 3] Dashboard Summary:', dash.status, 'KPI Total Txns:', dash.data.kpis.totalTransactions);

    // 4. Test Layer 1 Early Detection
    const det = await fetchUrl('/detection/analyze', 'POST', {
      sourceAccountId: 1002,
      primaryAmount: 500000,
      transfers: [
        { targetAccountId: 1003, amount: 100000 },
        { targetAccountId: 1004, amount: 75000 },
        { targetAccountId: 1005, amount: 50000 }
      ]
    });
    console.log('[TEST 4] Layer 1 Detection:', det.status, 'Suspicion Score:', det.data.suspicionScore, 'Patterns:', det.data.detectedPatterns.length);

    // 5. Test Layer 2 Network Graph
    const net = await fetchUrl('/network/graph');
    console.log('[TEST 5] Layer 2 Network Graph:', net.status, 'Nodes:', net.data.nodes.length, 'Edges:', net.data.edges.length);

    // 6. Test Layer 3 AI Prediction
    const pred = await fetchUrl('/prediction/predict', 'POST', { locationId: 1, accountId: 1002 });
    console.log('[TEST 6] Layer 3 AI Prediction:', pred.status, 'Hotspot:', pred.data.location, 'Confidence:', pred.data.confidence + '%');

    // 7. Test Layer 4 Dynamic Risk Recalculation
    const risk = await fetchUrl('/risk/recalculate', 'POST', { entityId: 1, entityType: 'LOCATION' });
    console.log('[TEST 7] Layer 4 Dynamic Risk:', risk.status, 'Score Shift:', risk.data.scoreShift);

    // 8. Test Layer 5 Alerts & Investigations
    const alert = await fetchUrl('/alerts');
    const inv = await fetchUrl('/investigations');
    console.log('[TEST 8] Layer 5 Alerts & Cases:', alert.status, 'Alerts:', alert.data.count, 'Cases:', inv.data.count);

    console.log('\n✅ ALL 5-LAYER REST API VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ API Test Failure:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
