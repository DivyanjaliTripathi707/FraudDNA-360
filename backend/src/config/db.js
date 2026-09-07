const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useFallbackMemory = false;

// Fallback in-memory dataset initialized from seed.sql definitions
const memoryStore = {
  users: [
    { id: 1, username: 'admin_investigator', email: 'admin@frauddna360.io', password_hash: '$2a$10$X86Z2E3g19nZ.4eY3Mh/x.QdG7hGgqGqGqGqGqGqGqGqGqGqGqGqG', role: 'Senior Investigator' },
    { id: 2, username: 'analyst_rohit', email: 'rohit@frauddna360.io', password_hash: '$2a$10$X86Z2E3g19nZ.4eY3Mh/x.QdG7hGgqGqGqGqGqGqGqGqGqGqGqGqG', role: 'Fraud Analyst' }
  ],
  accounts: [
    { id: 1001, account_number: 'ACC-98214-SOURCE', holder_name: 'Rajesh Sharma (Victim Source)', account_type: 'Current', status: 'ACTIVE', current_balance: 1250000.00, risk_score: 15 },
    { id: 1002, account_number: 'ACC-44102-MULE-A', holder_name: 'Vikram Mule-Primary', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 100000.00, risk_score: 89 },
    { id: 1003, account_number: 'ACC-44103-MULE-B', holder_name: 'Sanjay Mule-Secondary', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 75000.00, risk_score: 84 },
    { id: 1004, account_number: 'ACC-44104-MULE-C', holder_name: 'Anil Mule-Secondary', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 50000.00, risk_score: 78 },
    { id: 1005, account_number: 'ACC-44105-MULE-D', holder_name: 'Priya Mule-Secondary', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 40000.00, risk_score: 76 },
    { id: 1006, account_number: 'ACC-88301-CLEAN-E', holder_name: 'Sunita Clean Account', account_type: 'Savings', status: 'ACTIVE', current_balance: 150000.00, risk_score: 12 },
    { id: 1007, account_number: 'ACC-88302-CLEAN-F', holder_name: 'Amit Commerce Corp', account_type: 'Business', status: 'ACTIVE', current_balance: 4500000.00, risk_score: 8 }
  ],
  locations: [
    { id: 1, name: 'ATM Cluster A - North Hub', city: 'Mumbai', region: 'Western Region', risk_level: 'High', risk_score: 82, latitude: 19.0760, longitude: 72.8777 },
    { id: 2, name: 'Metro Station Plaza', city: 'Mumbai', region: 'Central Region', risk_level: 'Medium', risk_score: 54, latitude: 19.1176, longitude: 72.8468 },
    { id: 3, name: 'Financial District South', city: 'Mumbai', region: 'South Region', risk_level: 'Low', risk_score: 24, latitude: 18.9388, longitude: 72.8353 },
    { id: 4, name: 'Suburban Commercial Hub', city: 'Thane', region: 'North Region', risk_level: 'Medium', risk_score: 61, latitude: 19.2183, longitude: 72.9781 }
  ],
  atms: [
    { id: 101, atm_code: 'ATM-MUM-101', name: 'North Hub Express ATM 1', location_id: 1, latitude: 19.0765, longitude: 72.8780, status: 'ACTIVE' },
    { id: 102, atm_code: 'ATM-MUM-102', name: 'North Hub Express ATM 2', location_id: 1, latitude: 19.0762, longitude: 72.8775, status: 'SUSPICIOUS' },
    { id: 103, atm_code: 'ATM-MUM-201', name: 'Metro Station Kiosk 1', location_id: 2, latitude: 19.1180, longitude: 72.8472, status: 'ACTIVE' },
    { id: 104, atm_code: 'ATM-MUM-301', name: 'Financial Tower Lobby ATM', location_id: 3, latitude: 18.9390, longitude: 72.8355, status: 'ACTIVE' }
  ],
  fraud_patterns: [
    { id: 1, pattern_name: 'Transaction Splitting / Structuring', description: 'Rapid redistribution of a large primary deposit into smaller sub-50k transfers to evade audit thresholds.', severity: 'Critical', detection_rule: 'Single inward transfer > 200,000 followed by >= 3 outward transfers within 30 minutes.' },
    { id: 2, pattern_name: 'Rapid Mule Propagation', description: 'Immediate secondary transfer from mule accounts to non-verified crypto/remittance channels.', severity: 'High', detection_rule: 'Outward transfer executed within 180 seconds of receiving funds.' },
    { id: 3, pattern_name: 'ATM Withdrawal Clustering', description: 'Sequential physical cash withdrawals at the same physical ATM cluster within a tight time window.', severity: 'High', detection_rule: '3 or more high-value ATM withdrawals within 60 minutes at same ATM cluster.' },
    { id: 4, pattern_name: 'Shared Device / IP Hopping', description: 'Multiple distinct accounts transacting from identical MAC/IP signatures within 10 minutes.', severity: 'Medium', detection_rule: 'Distinct account IDs sharing IP signature > 3 times.' }
  ],
  transactions: [
    { id: 5001, transaction_ref: 'TXN-88001', source_account_id: 1001, target_account_id: 1002, amount: 500000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 45 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Large lump sum transfer from victim source account.' },
    { id: 5002, transaction_ref: 'TXN-88002', source_account_id: 1002, target_account_id: 1003, amount: 100000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 40 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Transaction splitting / structuring pattern detected.' },
    { id: 5003, transaction_ref: 'TXN-88003', source_account_id: 1002, target_account_id: 1004, amount: 75000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 35 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Rapid sequential transfer to secondary mule account.' },
    { id: 5004, transaction_ref: 'TXN-88004', source_account_id: 1002, target_account_id: 1005, amount: 50000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 30 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Structuring below 50,000 threshold.' },
    { id: 5005, transaction_ref: 'TXN-88005', source_account_id: 1002, target_account_id: 1006, amount: 40000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 25 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Multiple distinct account propagation.' },
    { id: 5006, transaction_ref: 'TXN-88006', source_account_id: 1003, target_account_id: 1003, amount: 40000.00, transaction_type: 'ATM_WITHDRAWAL', status: 'COMPLETED', location_id: 1, atm_id: 101, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'ATM Cash withdrawal at predicted hotspot cluster.' },
    { id: 5007, transaction_ref: 'TXN-88007', source_account_id: 1004, target_account_id: 1004, amount: 30000.00, transaction_type: 'ATM_WITHDRAWAL', status: 'COMPLETED', location_id: 1, atm_id: 102, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'ATM Cash withdrawal at predicted hotspot cluster.' }
  ],
  complaints: [
    { id: 1, complaint_ref: 'CMP-2026-901', victim_account_id: 1001, reported_amount: 500000.00, description: 'Victim reported unauthorized online banking transfer initiated under phishing pretext.', status: 'INVESTIGATING', location_id: 1, created_at: new Date(Date.now() - 60 * 60000).toISOString() }
  ],
  network_relationships: [
    { id: 1, source_account_id: 1001, target_account_id: 1002, relationship_type: 'DIRECT_TRANSFER', strength: 5, shared_attribute: 'High Value Direct Transfer' },
    { id: 2, source_account_id: 1002, target_account_id: 1003, relationship_type: 'DIRECT_TRANSFER', strength: 4, shared_attribute: 'Rapid Split Transfer' },
    { id: 3, source_account_id: 1002, target_account_id: 1004, relationship_type: 'DIRECT_TRANSFER', strength: 4, shared_attribute: 'Rapid Split Transfer' },
    { id: 4, source_account_id: 1002, target_account_id: 1005, relationship_type: 'DIRECT_TRANSFER', strength: 3, shared_attribute: 'Rapid Split Transfer' },
    { id: 5, source_account_id: 1003, target_account_id: 1004, relationship_type: 'SHARED_IP', strength: 4, shared_attribute: 'IP: 182.72.10.45' },
    { id: 6, source_account_id: 1004, target_account_id: 1005, relationship_type: 'SHARED_PHONE', strength: 3, shared_attribute: 'Phone: +91-9876543210' },
    { id: 7, source_account_id: 1003, target_account_id: 1002, relationship_type: 'ATM_CLUSTER', strength: 5, shared_attribute: 'Common Usage: ATM Cluster A' }
  ],
  predictions: [
    { id: 1, prediction_ref: 'PRED-2026-001', location_id: 1, atm_cluster: 'ATM Cluster A - North Hub', predicted_time_window: '18:00 - 21:00', confidence_score: 91, contributing_factors: JSON.stringify(["Rapid structuring sequence detected", "Mule account historical cash-out behavior", "Peak evening ATM cluster activity window", "Connected complaint filed for source account"]), model_version: 'v1.2-prototype', created_at: new Date().toISOString() }
  ],
  risk_scores: [
    { id: 1, entity_type: 'LOCATION', entity_id: 1, old_score: 58, new_score: 82, risk_level: 'High', confidence_score: 92, contributing_reasons: 'Risk increased because newly detected transaction splitting patterns matched an active mule network and recent victim complaint CMP-2026-901.', recalculated_at: new Date().toISOString() },
    { id: 2, entity_type: 'ACCOUNT', entity_id: 1002, old_score: 62, new_score: 89, risk_level: 'High', confidence_score: 95, contributing_reasons: 'High risk due to 4 rapid outgoing transfers following a 500,000 deposit and direct linkage to 3 suspect mule nodes.', recalculated_at: new Date().toISOString() }
  ],
  alerts: [
    { id: 1, alert_ref: 'ALT-2026-9001', title: 'CRITICAL FRAUD NETWORK: Structuring & Imminent ATM Cash-Out', priority: 'HIGH', risk_score: 89, confidence: 92, location_name: 'ATM Cluster A - North Hub', predicted_time: '18:00 - 21:00', reasons: JSON.stringify(["Transaction splitting detected (₹5,00,000 into 4 accounts)", "Direct connection to 3 known mule accounts", "Predictive model forecasts cash-out at ATM Cluster A", "Recent victim complaint filed"]), status: 'ACTIVE', created_at: new Date().toISOString() }
  ],
  investigations: [
    { id: 1, case_ref: 'CASE-2026-101', alert_id: 1, account_id: 1002, investigator_id: 1, title: 'Investigation: Mule Network ACC-44102-MULE-A & ATM Cluster A', status: 'IN_PROGRESS', priority: 'HIGH', lead_recommendation: 'Trace connected mule accounts B, C, D and request physical surveillance or video log freeze at ATM Cluster A between 18:00 and 21:00.', notes: 'Initial structuring verified. ₹5,00,000 split across 4 sub-accounts. Alert sent to field response team.', updated_at: new Date().toISOString(), created_at: new Date().toISOString() }
  ]
};

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'frauddna360',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 1000
  });
} catch (err) {
  useFallbackMemory = true;
}

module.exports = {
  getPool: () => pool,
  isFallback: () => useFallbackMemory,
  setFallback: (val) => { useFallbackMemory = val; },
  memoryStore
};
