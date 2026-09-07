const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useFallbackMemory = false;

// Default bcrypt hash for 'admin123' / 'citizen123':
// Generated with bcryptjs.hashSync('admin123', 10)
const DEFAULT_PASSWORD_HASH = '$2a$10$f66eH1U85W5a.x407U9wtefE/M7R1wV8w0LzPcvH2xS2e3jC2bA.y';

// Fallback in-memory dataset initialized with synthetic enterprise fraud intelligence data
const memoryStore = {
  users: [
    { id: 1, username: 'admin_investigator', email: 'investigator@frauddna360.io', password_hash: DEFAULT_PASSWORD_HASH, role: 'Investigator', full_name: 'Senior Inspector Verma', badge: 'FIN-INV-9902' },
    { id: 2, username: 'analyst_rohit', email: 'rohit@frauddna360.io', password_hash: DEFAULT_PASSWORD_HASH, role: 'Investigator', full_name: 'Rohit K. Analyst', badge: 'FIN-ANL-3341' },
    { id: 3, username: 'chief_admin', email: 'admin@frauddna360.io', password_hash: DEFAULT_PASSWORD_HASH, role: 'Admin', full_name: 'Director S. Nambiar', badge: 'FIN-ADM-0001' },
    { id: 4, username: 'citizen_user', email: 'citizen@frauddna360.io', password_hash: DEFAULT_PASSWORD_HASH, role: 'Citizen', full_name: 'Rajesh Sharma (Verified Citizen)', phone: '+91 98214 55102' }
  ],
  accounts: [
    { id: 1001, account_number: 'ACC-98214-SOURCE', holder_name: 'Rajesh Sharma (Victim Source)', account_type: 'Current', status: 'ACTIVE', current_balance: 1250000.00, risk_score: 15, phone: '+91 98214 55102', upi_id: 'rajesh.sharma@okaxis', device_fingerprint: 'DEV-WIN-A882', ip_address: '103.22.45.19', masked_account: 'ACC-XXXX-SOURCE' },
    { id: 1002, account_number: 'ACC-44102-MULE-A', holder_name: 'Vikram Mule-Primary (Layer 1 Mule)', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 100000.00, risk_score: 92, phone: '+91 91234 56780', upi_id: 'vikram.quick@paytm', device_fingerprint: 'DEV-AND-M991', ip_address: '182.72.10.45', masked_account: 'ACC-XXXX-44102' },
    { id: 1003, account_number: 'ACC-44103-MULE-B', holder_name: 'Sanjay Mule-Secondary (Layer 2 Mule)', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 75000.00, risk_score: 87, phone: '+91 98765 43210', upi_id: 'sanjay.trans@ybl', device_fingerprint: 'DEV-AND-M991', ip_address: '182.72.10.45', masked_account: 'ACC-XXXX-44103' },
    { id: 1004, account_number: 'ACC-44104-MULE-C', holder_name: 'Anil Mule-Secondary (Layer 2 Mule)', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 50000.00, risk_score: 82, phone: '+91 98765 43210', upi_id: 'anil.fast@okhdfc', device_fingerprint: 'DEV-AND-M992', ip_address: '182.72.10.46', masked_account: 'ACC-XXXX-44104' },
    { id: 1005, account_number: 'ACC-44105-MULE-D', holder_name: 'Priya Mule-Secondary (Layer 2 Mule)', account_type: 'Savings', status: 'MULE_SUSPECT', current_balance: 40000.00, risk_score: 79, phone: '+91 97112 34567', upi_id: 'priya.split@ibl', device_fingerprint: 'DEV-AND-M993', ip_address: '182.72.10.48', masked_account: 'ACC-XXXX-44105' },
    { id: 1006, account_number: 'ACC-88301-CLEAN-E', holder_name: 'Sunita Clean Merchant Store', account_type: 'Savings', status: 'ACTIVE', current_balance: 150000.00, risk_score: 12, phone: '+91 98111 22334', upi_id: 'sunita.store@icici', device_fingerprint: 'DEV-IOS-C441', ip_address: '103.55.12.8', masked_account: 'ACC-XXXX-88301' },
    { id: 1007, account_number: 'ACC-88302-CLEAN-F', holder_name: 'Amit Commerce Corp', account_type: 'Business', status: 'ACTIVE', current_balance: 4500000.00, risk_score: 8, phone: '+91 99222 33445', upi_id: 'amitcorp@hdfcbank', device_fingerprint: 'DEV-WIN-B102', ip_address: '103.55.12.9', masked_account: 'ACC-XXXX-88302' },
    { id: 1008, account_number: 'ACC-77401-HUB', holder_name: 'Central Shadow Aggregator Hub', account_type: 'Current', status: 'BLOCKED', current_balance: 890000.00, risk_score: 98, phone: '+91 93333 44556', upi_id: 'shadowhub@fakeupi', device_fingerprint: 'DEV-EMU-X999', ip_address: '194.26.29.112', masked_account: 'ACC-XXXX-77401' }
  ],
  locations: [
    { id: 1, name: 'ATM Cluster A - North Hub', city: 'Mumbai', region: 'Western Region', risk_level: 'High', risk_score: 88, latitude: 19.0760, longitude: 72.8777, historical_incidents: 14, surveillance_status: 'ELEVATED_WATCH' },
    { id: 2, name: 'Metro Station Plaza Kiosk', city: 'Mumbai', region: 'Central Region', risk_level: 'Medium', risk_score: 56, latitude: 19.1176, longitude: 72.8468, historical_incidents: 6, surveillance_status: 'STANDARD' },
    { id: 3, name: 'Financial District South Branch', city: 'Mumbai', region: 'South Region', risk_level: 'Low', risk_score: 22, latitude: 18.9388, longitude: 72.8353, historical_incidents: 1, surveillance_status: 'SECURE' },
    { id: 4, name: 'Suburban Commercial Market Hub', city: 'Thane', region: 'North Region', risk_level: 'Medium', risk_score: 64, latitude: 19.2183, longitude: 72.9781, historical_incidents: 8, surveillance_status: 'ELEVATED_WATCH' }
  ],
  atms: [
    { id: 101, atm_code: 'ATM-MUM-101', name: 'North Hub Express ATM 1', location_id: 1, latitude: 19.0765, longitude: 72.8780, status: 'SUSPICIOUS', bank_name: 'Demo State Bank', cash_capacity: 1500000, last_withdrawal_ref: 'TXN-88006' },
    { id: 102, atm_code: 'ATM-MUM-102', name: 'North Hub Express ATM 2', location_id: 1, latitude: 19.0762, longitude: 72.8775, status: 'SUSPICIOUS', bank_name: 'Demo National Bank', cash_capacity: 1800000, last_withdrawal_ref: 'TXN-88007' },
    { id: 103, atm_code: 'ATM-MUM-201', name: 'Metro Station Kiosk 1', location_id: 2, latitude: 19.1180, longitude: 72.8472, status: 'ACTIVE', bank_name: 'Demo Commercial Bank', cash_capacity: 1200000, last_withdrawal_ref: null },
    { id: 104, atm_code: 'ATM-MUM-301', name: 'Financial Tower Lobby ATM', location_id: 3, latitude: 18.9390, longitude: 72.8355, status: 'ACTIVE', bank_name: 'Demo Urban Bank', cash_capacity: 2500000, last_withdrawal_ref: null }
  ],
  fraud_patterns: [
    { id: 1, pattern_name: 'Transaction Splitting / Structuring', description: 'Rapid redistribution of large primary inflows into sub-50,000 transfers to evade threshold monitoring.', severity: 'Critical', detection_rule: 'Single inward transfer >= 200,000 followed by >= 3 outward transfers within 30 minutes.' },
    { id: 2, pattern_name: 'Rapid Mule Propagation', description: 'Immediate onward transfer from mule accounts to multiple non-verified secondary channels.', severity: 'High', detection_rule: 'Outward transfer executed within 180 seconds of receiving funds.' },
    { id: 3, pattern_name: 'ATM Cash-Out Clustering', description: 'Sequential physical cash withdrawals at the same physical ATM cluster within a tight time window.', severity: 'High', detection_rule: '3 or more high-value ATM withdrawals within 60 minutes at same ATM cluster.' },
    { id: 4, pattern_name: 'Shared Device / IP Signature Hopping', description: 'Multiple distinct accounts transacting from identical device fingerprints and subnet signatures.', severity: 'Medium', detection_rule: 'Distinct account IDs sharing device MAC/IP signature > 2 times.' }
  ],
  transactions: [
    { id: 5001, transaction_ref: 'TXN-88001', source_account_id: 1001, target_account_id: 1002, amount: 500000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 50 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'High-value uncharacteristic lump sum transfer from victim source account.' },
    { id: 5002, transaction_ref: 'TXN-88002', source_account_id: 1002, target_account_id: 1003, amount: 100000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 42 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Transaction splitting / structuring pattern detected.' },
    { id: 5003, transaction_ref: 'TXN-88003', source_account_id: 1002, target_account_id: 1004, amount: 75000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 38 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Rapid sequential transfer to secondary mule account.' },
    { id: 5004, transaction_ref: 'TXN-88004', source_account_id: 1002, target_account_id: 1005, amount: 50000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 32 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Structuring below 50,000 threshold.' },
    { id: 5005, transaction_ref: 'TXN-88005', source_account_id: 1002, target_account_id: 1006, amount: 40000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 25 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Multiple distinct recipient account propagation.' },
    { id: 5006, transaction_ref: 'TXN-88006', source_account_id: 1003, target_account_id: 1003, amount: 40000.00, transaction_type: 'ATM_WITHDRAWAL', status: 'COMPLETED', location_id: 1, atm_id: 101, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Physical ATM Cash withdrawal at predicted hotspot cluster.' },
    { id: 5007, transaction_ref: 'TXN-88007', source_account_id: 1004, target_account_id: 1004, amount: 30000.00, transaction_type: 'ATM_WITHDRAWAL', status: 'COMPLETED', location_id: 1, atm_id: 102, timestamp: new Date(Date.now() - 10 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Physical ATM Cash withdrawal at predicted hotspot cluster.' },
    { id: 5008, transaction_ref: 'TXN-88008', source_account_id: 1005, target_account_id: 1008, amount: 35000.00, transaction_type: 'TRANSFER', status: 'COMPLETED', location_id: 1, atm_id: null, timestamp: new Date(Date.now() - 8 * 60000).toISOString(), is_suspicious: 1, suspicious_reasons: 'Funnel transfer into central shadow aggregator hub.' }
  ],
  complaints: [
    { id: 1, complaint_ref: 'CMP-2026-901', victim_account_id: 1001, reported_amount: 500000.00, description: 'Victim reported unauthorized online banking transfer initiated under phishing pretext regarding utility bill disconnection.', status: 'INVESTIGATING', location_id: 1, reported_phone: '+91 98214 55102', suspect_phone: '+91 91234 56780', suspect_upi: 'vikram.quick@paytm', created_at: new Date(Date.now() - 60 * 60000).toISOString() }
  ],
  network_relationships: [
    { id: 1, source_account_id: 1001, target_account_id: 1002, relationship_type: 'DIRECT_TRANSFER', strength: 5, shared_attribute: 'High Value Direct Inflow ₹5,00,000' },
    { id: 2, source_account_id: 1002, target_account_id: 1003, relationship_type: 'DIRECT_TRANSFER', strength: 4, shared_attribute: 'Rapid Split Outflow ₹1,00,000' },
    { id: 3, source_account_id: 1002, target_account_id: 1004, relationship_type: 'DIRECT_TRANSFER', strength: 4, shared_attribute: 'Rapid Split Outflow ₹75,000' },
    { id: 4, source_account_id: 1002, target_account_id: 1005, relationship_type: 'DIRECT_TRANSFER', strength: 3, shared_attribute: 'Rapid Split Outflow ₹50,000' },
    { id: 5, source_account_id: 1003, target_account_id: 1004, relationship_type: 'SHARED_IP', strength: 4, shared_attribute: 'IP Subnet: 182.72.10.x' },
    { id: 6, source_account_id: 1004, target_account_id: 1005, relationship_type: 'SHARED_PHONE', strength: 3, shared_attribute: 'Device ID: DEV-AND-M991' },
    { id: 7, source_account_id: 1003, target_account_id: 1002, relationship_type: 'ATM_CLUSTER', strength: 5, shared_attribute: 'Common Usage: ATM Cluster A' },
    { id: 8, source_account_id: 1005, target_account_id: 1008, relationship_type: 'AGGREGATOR_FUNNEL', strength: 5, shared_attribute: 'Funnel Transfer into Shadow Hub' }
  ],
  predictions: [
    { id: 1, prediction_ref: 'PRED-2026-001', location_id: 1, atm_cluster: 'ATM Cluster A - North Hub', predicted_time_window: '18:00 - 21:00', confidence_score: 93, cash_out_risk: 'CRITICAL', contributing_factors: JSON.stringify(["Rapid structuring sequence detected", "Mule account historical cash-out behavior", "Peak evening ATM cluster activity window", "Connected complaint filed for source account", "Known high-risk geographic cluster"]), model_version: 'v2.1-fused', created_at: new Date().toISOString() }
  ],
  risk_scores: [
    { id: 1, entity_type: 'LOCATION', entity_id: 1, old_score: 58, new_score: 88, risk_level: 'High', confidence_score: 93, contributing_reasons: 'Risk escalated: newly detected transaction splitting patterns matched active mule network and verified victim complaint CMP-2026-901.', recalculated_at: new Date().toISOString() },
    { id: 2, entity_type: 'ACCOUNT', entity_id: 1002, old_score: 62, new_score: 92, risk_level: 'Critical', confidence_score: 96, contributing_reasons: 'Critical mule risk: 4 rapid outgoing transfers following single 500,000 deposit, short 8-minute holding duration, and linkage to 3 suspect secondary nodes.', recalculated_at: new Date().toISOString() }
  ],
  alerts: [
    { id: 1, alert_ref: 'ALT-2026-9001', title: 'CRITICAL FRAUD NETWORK: Structuring & Imminent ATM Cash-Out', priority: 'CRITICAL', risk_score: 92, confidence: 94, location_name: 'ATM Cluster A - North Hub', predicted_time: '18:00 - 21:00', reasons: JSON.stringify(["Transaction splitting detected (₹5,00,000 distributed into 4 accounts)", "Direct connection to 3 verified mule accounts", "Predictive model forecasts cash-out at ATM Cluster A", "Recent victim complaint filed"]), status: 'ACTIVE', autopilot_triggered: 1, created_at: new Date().toISOString() }
  ],
  investigations: [
    { id: 1, case_ref: 'CASE-2026-101', alert_id: 1, account_id: 1002, investigator_id: 1, title: 'Autonomous Case: Mule Network ACC-44102-MULE-A & ATM Cluster A', status: 'IN_PROGRESS', priority: 'HIGH', lead_recommendation: 'Trace connected mule accounts B, C, D; issue simulated bank freeze advisory on destination nodes; coordinate video log verification at ATM Cluster A between 18:00 and 21:00.', notes: 'Fraud Case Autopilot triggered. ₹5,00,000 split across 4 sub-accounts. Multi-hop money flow traced to ATM-MUM-101 & ATM-MUM-102. Evidence package assembled.', evidence_package_id: 'EVP-2026-001', updated_at: new Date().toISOString(), created_at: new Date().toISOString() }
  ],
  evidence_packages: [
    {
      id: 1,
      package_ref: 'EVP-2026-001',
      case_ref: 'CASE-2026-101',
      title: 'Evidence Package: ₹5,00,000 Phishing-to-Mule Structuring Flow',
      sha256_hash: '3f786850e387550fdab836ed7e6dc881de23001b70e87038c0136221509b3808',
      item_count: 5,
      items: [
        { type: 'TRANSACTION_RECORDS', ref: 'TXN-88001 to TXN-88008', count: 8, integrity: 'VERIFIED_CHAIN', timestamp: new Date(Date.now() - 40 * 60000).toISOString() },
        { type: 'GRAPH_SNAPSHOT', ref: 'GRAPH-SNAP-01', nodes: 7, edges: 8, integrity: 'HASH_SEALED', timestamp: new Date(Date.now() - 35 * 60000).toISOString() },
        { type: 'COMPLAINT_STATEMENT', ref: 'CMP-2026-901', victim: 'Rajesh Sharma', integrity: 'DIGITALLY_SIGNED', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
        { type: 'PREDICTIVE_HOTSPOT', ref: 'PRED-2026-001', cluster: 'ATM Cluster A', integrity: 'MODEL_LOGGED', timestamp: new Date(Date.now() - 20 * 60000).toISOString() },
        { type: 'AI_INVESTIGATION_SUMMARY', ref: 'SUM-2026-001', model: 'FraudDNA-Llama-Grounding-v2', integrity: 'EVIDENCE_LOCKED', timestamp: new Date().toISOString() }
      ],
      chain_of_custody: [
        { step: 1, actor: 'Fraud Case Autopilot (System)', action: 'AUTO_ASSEMBLE_EVIDENCE', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), notes: 'Evidence package created from high-risk alert ALT-2026-9001' },
        { step: 2, actor: 'Senior Inspector Verma (Investigator)', action: 'CASE_ASSIGNMENT_CONFIRMED', timestamp: new Date(Date.now() - 20 * 60000).toISOString(), notes: 'Assigned to case CASE-2026-101' },
        { step: 3, actor: 'Senior Inspector Verma (Investigator)', action: 'EVIDENCE_INTEGRITY_VERIFIED', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), notes: 'SHA-256 hash verified match' }
      ],
      created_at: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ],
  recovery_cases: [
    {
      id: 1,
      recovery_ref: 'REC-2026-701',
      case_ref: 'CASE-2026-101',
      victim_account: 'ACC-98214-SOURCE',
      victim_name: 'Rajesh Sharma',
      disputed_amount: 500000.00,
      traceable_amount: 430000.00,
      recovered_amount: 175000.00,
      verification_status: 'UNAUTHORIZED_CONFIRMED', // PENDING, UNAUTHORIZED_CONFIRMED, LEGITIMATE_CONFIRMED
      recovery_status: 'ACTION_REQUESTED', // PENDING, UNDER_REVIEW, FUNDS_TRACEABLE, ACTION_REQUESTED, PARTIALLY_RECOVERED, RECOVERED, NOT_RECOVERABLE
      simulated_bank_response: {
        status: 'LEIN_MARKED_SIMULATED',
        bank_name: 'Demo State Bank & Demo National Bank',
        response_code: 'SIM-RES-200',
        message: '⚠ SIMULATED BANK RESPONSE: Temporary lien marked on destination accounts ACC-44102-MULE-A and ACC-44103-MULE-B. Fund dissipation slowed.',
        timestamp: new Date().toISOString()
      },
      timeline: [
        { time: '10:01', event: 'Suspicious transfer TXN-88001 of ₹5,00,000 flagged by Layer 1 Early Detection.' },
        { time: '10:02', event: 'Victim digital notification sent: "Suspicious transfer detected. Please verify."' },
        { time: '10:04', event: 'Victim confirmed transaction was UNAUTHORIZED via Digital Recovery Portal.' },
        { time: '10:05', event: 'Autonomous Recovery Case REC-2026-701 generated; funds traced across 4 downstream mule hops.' },
        { time: '10:07', event: 'Simulated lien request broadcast to partner institutions for ₹4,30,000 traceable funds.' },
        { time: '10:12', event: '⚠ SIMULATED BANK ACTION: Partial simulated recovery of ₹1,75,000 secured from Layer 1 & 2 accounts.' }
      ],
      created_at: new Date(Date.now() - 45 * 60000).toISOString()
    }
  ],
  threat_indicators: [
    { id: 1, type: 'URL', indicator: 'http://sbi-kyc-update-portal.security-verification.xyz', risk_level: 'CRITICAL', confidence: 96, category: 'Phishing / Credential Harvesting', matched_patterns: ['Look-alike domain "sbi-kyc"', 'Unregistered suspicious TLD ".xyz"', 'Urgent verification lure'], source: 'Demo Threat Intel Feed' },
    { id: 2, type: 'URL', indicator: 'http://electricity-bill-pay-urgent.online', risk_level: 'HIGH', confidence: 91, category: 'Utility Bill Impersonation Scam', matched_patterns: ['Electricity disconnection lure', 'Unsecured HTTP', 'Look-alike payment gateway'], source: 'Synthetic Scam Indicator Database' },
    { id: 3, type: 'PHONE', indicator: '+91 91234 56780', risk_level: 'CRITICAL', confidence: 95, category: 'Known Scam Call / Mule Operator', matched_patterns: ['Linked to 3 reported cyber complaints', 'Rapid SIM activation anomaly'], source: 'Simulated Telecom Risk Intelligence' },
    { id: 4, type: 'IP', indicator: '182.72.10.45', risk_level: 'HIGH', confidence: 89, category: 'Shared Mule Proxy / VPN Subnet', matched_patterns: ['12 distinct accounts logged within 24 hours', 'Known hosting range'], source: 'Network Threat Intelligence' }
  ],
  fraud_campaigns: [
    {
      id: 1,
      campaign_ref: 'CAMP-2026-POWERGRID',
      name: 'PowerGrid Utility Bill Disconnection Phishing Ring',
      confidence: 89,
      status: 'ACTIVE_SYNDICATE',
      complaints_count: 7,
      phone_numbers_count: 4,
      urls_count: 3,
      accounts_count: 6,
      total_stolen_estimate: 2450000.00,
      indicators: ['http://electricity-bill-pay-urgent.online', '+91 91234 56780', 'ACC-44102-MULE-A', 'ACC-77401-HUB'],
      lead_summary: 'Coordinated campaign distributing urgent SMS warnings threatening power cut within 2 hours, directing victims to fake payment portals and mule routing accounts.'
    }
  ],
  entity_links: [
    { id: 1, source_entity: '+919876543210', target_entity: '+91 98765 43210', entity_type: 'PHONE', match_confidence: 99, match_method: 'EXACT_NORMALIZED', status: 'LINKED' },
    { id: 2, source_entity: 'sanjay.trans@ybl', target_entity: 'sanjay.trans@okaxis', entity_type: 'UPI_HANDLE', match_confidence: 88, match_method: 'FUZZY_USER_HANDLE', status: 'PENDING_REVIEW' },
    { id: 3, source_entity: 'DEV-AND-M991', target_entity: 'DEV-AND-M992', entity_type: 'DEVICE', match_confidence: 84, match_method: 'CANVAS_HARDWARE_SIMILARITY', status: 'LINKED' }
  ],
  risk_weights: {
    ai_score_weight: 0.25,
    graph_score_weight: 0.25,
    transaction_score_weight: 0.25,
    behavior_score_weight: 0.15,
    threat_intel_score_weight: 0.10,
    version: 'v2.1-dynamic'
  },
  audit_logs: [
    { id: 1, actor: 'system', action: 'STARTUP_INITIALIZATION', target: 'FraudDNA 360 Core Engine', ip: '127.0.0.1', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
    { id: 2, actor: 'admin_investigator', action: 'USER_LOGIN', target: 'AUTH_SERVICE', ip: '127.0.0.1', timestamp: new Date(Date.now() - 55 * 60000).toISOString() },
    { id: 3, actor: 'system_autopilot', action: 'AUTOPILOT_TRIGGERED', target: 'CASE-2026-101', ip: 'internal', timestamp: new Date(Date.now() - 30 * 60000).toISOString() }
  ]
};

// By default, enable in-memory store for instant, zero-dependency demo execution
useFallbackMemory = true;

if (process.env.ENABLE_MYSQL === 'true' || process.env.DB_HOST) {
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
    pool.getConnection().then(conn => {
      useFallbackMemory = false;
      conn.release();
      console.log('[DATABASE] Connected to MySQL successfully.');
    }).catch(() => {
      useFallbackMemory = true;
    });
  } catch (err) {
    useFallbackMemory = true;
  }
}

module.exports = {
  getPool: () => pool,
  isFallback: () => useFallbackMemory,
  setFallback: (val) => { useFallbackMemory = val; },
  memoryStore
};

