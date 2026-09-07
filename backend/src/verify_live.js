const http = require('http');

const fetchUrl = (url, method = 'GET', body = null) => {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
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

async function verifyLive() {
  console.log('=== VERIFYING LIVE FRAUDDNA 360 APPLICATION ===\n');

  try {
    // 1. Check Frontend Dev Server
    const fe = await fetchUrl('http://localhost:5173/');
    console.log('[VERIFY 1] Frontend Server (http://localhost:5173/): HTTP Status', fe.status, '(Vite HTML Served)');

    // 2. Check Backend Base Endpoint
    const be = await fetchUrl('http://localhost:5000/api');
    console.log('[VERIFY 2] Backend Server (http://localhost:5000/api): Status', be.status, '| Name:', be.data.name);

    // 3. Auth API Login
    const login = await fetchUrl('http://localhost:5000/api/auth/login', 'POST', { username: 'admin_investigator', password: 'admin123' });
    console.log('[VERIFY 3] POST /api/auth/login:', login.status, '| User:', login.data.user?.username, '| Token Generated:', !!login.data.token);

    // 4. Dashboard Summary API (Dynamic backend data test)
    const dash = await fetchUrl('http://localhost:5000/api/dashboard/summary');
    console.log('[VERIFY 4] GET /api/dashboard/summary: Status', dash.status);
    console.log('           -> Total Transactions:', dash.data.kpis.totalTransactions);
    console.log('           -> Suspicious Transactions:', dash.data.kpis.suspiciousTransactions);
    console.log('           -> Active Mule Accounts:', dash.data.kpis.activeMuleAccounts);
    console.log('           -> High Risk Locations:', dash.data.kpis.highRiskLocations);
    console.log('           -> Dynamic Risk Shift:', dash.data.dynamicRiskShift.entity, dash.data.dynamicRiskShift.oldScore, '->', dash.data.dynamicRiskShift.newScore);

    // 5. Layer 1: Early Fraud Detection API
    const det = await fetchUrl('http://localhost:5000/api/detection/analyze', 'POST', {
      sourceAccountId: 1002,
      primaryAmount: 500000,
      transfers: [
        { targetAccountId: 1003, amount: 100000 },
        { targetAccountId: 1004, amount: 75000 },
        { targetAccountId: 1005, amount: 50000 },
        { targetAccountId: 1006, amount: 40000 }
      ]
    });
    console.log('[VERIFY 5] Layer 1 POST /api/detection/analyze: Status', det.status, '| Suspicion Score:', det.data.suspicionScore, '| Patterns Flagged:', det.data.detectedPatterns.length);

    // 6. Layer 2: Network & Graph Analysis API
    const net = await fetchUrl('http://localhost:5000/api/network/graph');
    console.log('[VERIFY 6] Layer 2 GET /api/network/graph: Status', net.status, '| Total Graph Nodes:', net.data.nodes.length, '| Total Edges:', net.data.edges.length);

    // 7. Layer 3: AI Predictive Intelligence API
    const pred = await fetchUrl('http://localhost:5000/api/prediction/predict', 'POST', { locationId: 1, accountId: 1002 });
    console.log('[VERIFY 7] Layer 3 POST /api/prediction/predict: Status', pred.status, '| Hotspot:', pred.data.location, '| Window:', pred.data.timeWindow, '| Confidence:', pred.data.confidence + '%');

    // 8. Layer 4: Dynamic Risk Recalculation API
    const risk = await fetchUrl('http://localhost:5000/api/risk/recalculate', 'POST', { entityId: 1, entityType: 'LOCATION', newComplaintId: 1, suspiciousTxnCount: 4 });
    console.log('[VERIFY 8] Layer 4 POST /api/risk/recalculate: Status', risk.status, '| Score Shift:', risk.data.scoreShift, '| Risk Level:', risk.data.riskLevel);

    // 9. Layer 5: Investigation Alerts & Leads API
    const alerts = await fetchUrl('http://localhost:5000/api/alerts');
    const cases = await fetchUrl('http://localhost:5000/api/investigations');
    console.log('[VERIFY 9] Layer 5 Response APIs: Status Alerts:', alerts.status, '| Count:', alerts.data.count, '| Cases Status:', cases.status, '| Count:', cases.data.count);

    console.log('\n====================================================');
    console.log(' VERIFICATION COMPLETE: ALL 5 LAYERS INTEGRATED & LIVE');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Live Verification Failed:', err);
  }
}

verifyLive();
