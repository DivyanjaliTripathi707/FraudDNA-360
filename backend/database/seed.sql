-- ====================================================
-- FraudDNA 360 - Seed Data
-- ====================================================

USE frauddna360;

-- 1. Users Seed
INSERT INTO users (id, username, email, password_hash, role) VALUES
(1, 'admin_investigator', 'admin@frauddna360.io', '$2a$10$X86Z2E3g19nZ.4eY3Mh/x.QdG7hGgqGqGqGqGqGqGqGqGqGqGqGqG', 'Senior Investigator'),
(2, 'analyst_rohit', 'rohit@frauddna360.io', '$2a$10$X86Z2E3g19nZ.4eY3Mh/x.QdG7hGgqGqGqGqGqGqGqGqGqGqGqGqG', 'Fraud Analyst');

-- 2. Locations Seed
INSERT INTO locations (id, name, city, region, risk_level, risk_score, latitude, longitude) VALUES
(1, 'ATM Cluster A - North Hub', 'Mumbai', 'Western Region', 'High', 82, 19.0760, 72.8777),
(2, 'Metro Station Plaza', 'Mumbai', 'Central Region', 'Medium', 54, 19.1176, 72.8468),
(3, 'Financial District South', 'Mumbai', 'South Region', 'Low', 24, 18.9388, 72.8353),
(4, 'Suburban Commercial Hub', 'Thane', 'North Region', 'Medium', 61, 19.2183, 72.9781);

-- 3. ATMs Seed
INSERT INTO atms (id, atm_code, name, location_id, latitude, longitude, status) VALUES
(101, 'ATM-MUM-101', 'North Hub Express ATM 1', 1, 19.0765, 72.8780, 'ACTIVE'),
(102, 'ATM-MUM-102', 'North Hub Express ATM 2', 1, 19.0762, 72.8775, 'SUSPICIOUS'),
(103, 'ATM-MUM-201', 'Metro Station Kiosk 1', 2, 19.1180, 72.8472, 'ACTIVE'),
(104, 'ATM-MUM-301', 'Financial Tower Lobby ATM', 3, 18.9390, 72.8355, 'ACTIVE');

-- 4. Fraud Patterns Seed
INSERT INTO fraud_patterns (id, pattern_name, description, severity, detection_rule) VALUES
(1, 'Transaction Splitting / Structuring', 'Rapid redistribution of a large primary deposit into smaller sub-50k transfers to evade audit thresholds.', 'Critical', 'Single inward transfer > 200,000 followed by >= 3 outward transfers within 30 minutes.'),
(2, 'Rapid Mule Propagation', 'Immediate secondary transfer from mule accounts to non-verified crypto/remittance channels.', 'High', 'Outward transfer executed within 180 seconds of receiving funds.'),
(3, 'ATM Withdrawal Clustering', 'Sequential physical cash withdrawals at the same physical ATM cluster within a tight time window.', 'High', '3 or more high-value ATM withdrawals within 60 minutes at same ATM cluster.'),
(4, 'Shared Device / IP Hopping', 'Multiple distinct accounts transacting from identical MAC/IP signatures within 10 minutes.', 'Medium', 'Distinct account IDs sharing IP signature > 3 times.');

-- 5. Accounts Seed
INSERT INTO accounts (id, account_number, holder_name, account_type, status, current_balance, risk_score) VALUES
(1001, 'ACC-98214-SOURCE', 'Rajesh Sharma (Victim Source)', 'Current', 'ACTIVE', 1250000.00, 15),
(1002, 'ACC-44102-MULE-A', 'Vikram Mule-Primary', 'Savings', 'MULE_SUSPECT', 100000.00, 89),
(1003, 'ACC-44103-MULE-B', 'Sanjay Mule-Secondary', 'Savings', 'MULE_SUSPECT', 75000.00, 84),
(1004, 'ACC-44104-MULE-C', 'Anil Mule-Secondary', 'Savings', 'MULE_SUSPECT', 50000.00, 78),
(1005, 'ACC-44105-MULE-D', 'Priya Mule-Secondary', 'Savings', 'MULE_SUSPECT', 40000.00, 76),
(1006, 'ACC-88301-CLEAN-E', 'Sunita Clean Account', 'Savings', 'ACTIVE', 150000.00, 12),
(1007, 'ACC-88302-CLEAN-F', 'Amit Commerce Corp', 'Business', 'ACTIVE', 4500000.00, 8);

-- 6. Transactions Seed
INSERT INTO transactions (id, transaction_ref, source_account_id, target_account_id, amount, transaction_type, status, location_id, atm_id, timestamp, is_suspicious, suspicious_reasons) VALUES
(5001, 'TXN-88001', 1001, 1002, 500000.00, 'TRANSFER', 'COMPLETED', 1, NULL, DATE_SUB(NOW(), INTERVAL 45 MINUTE), 1, 'Large lump sum transfer from victim source account.'),
(5002, 'TXN-88002', 1002, 1003, 100000.00, 'TRANSFER', 'COMPLETED', 1, NULL, DATE_SUB(NOW(), INTERVAL 40 MINUTE), 1, 'Transaction splitting / structuring pattern detected.'),
(5003, 'TXN-88003', 1002, 1004, 75000.00, 'TRANSFER', 'COMPLETED', 1, NULL, DATE_SUB(NOW(), INTERVAL 35 MINUTE), 1, 'Rapid sequential transfer to secondary mule account.'),
(5004, 'TXN-88004', 1002, 1005, 50000.00, 'TRANSFER', 'COMPLETED', 1, NULL, DATE_SUB(NOW(), INTERVAL 30 MINUTE), 1, 'Structuring below 50,000 threshold.'),
(5005, 'TXN-88005', 1002, 1006, 40000.00, 'TRANSFER', 'COMPLETED', 1, NULL, DATE_SUB(NOW(), INTERVAL 25 MINUTE), 1, 'Multiple distinct account propagation.'),
(5006, 'TXN-88006', 1003, 1003, 40000.00, 'ATM_WITHDRAWAL', 'COMPLETED', 1, 101, DATE_SUB(NOW(), INTERVAL 15 MINUTE), 1, 'ATM Cash withdrawal at predicted hotspot cluster.'),
(5007, 'TXN-88007', 1004, 1004, 30000.00, 'ATM_WITHDRAWAL', 'COMPLETED', 1, 102, DATE_SUB(NOW(), INTERVAL 10 MINUTE), 1, 'ATM Cash withdrawal at predicted hotspot cluster.');

-- 7. Complaints Seed
INSERT INTO complaints (id, complaint_ref, victim_account_id, reported_amount, description, status, location_id, created_at) VALUES
(1, 'CMP-2026-901', 1001, 500000.00, 'Victim reported unauthorized online banking transfer initiated under phishing pretext.', 'INVESTIGATING', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 8. Network Relationships Seed
INSERT INTO network_relationships (id, source_account_id, target_account_id, relationship_type, strength, shared_attribute) VALUES
(1, 1001, 1002, 'DIRECT_TRANSFER', 5, 'High Value Direct Transfer'),
(2, 1002, 1003, 'DIRECT_TRANSFER', 4, 'Rapid Split Transfer'),
(3, 1002, 1004, 'DIRECT_TRANSFER', 4, 'Rapid Split Transfer'),
(4, 1002, 1005, 'DIRECT_TRANSFER', 3, 'Rapid Split Transfer'),
(5, 1003, 1004, 'SHARED_IP', 4, 'IP: 182.72.10.45'),
(6, 1004, 1005, 'SHARED_PHONE', 3, 'Phone: +91-9876543210'),
(7, 1003, 1002, 'ATM_CLUSTER', 5, 'Common Usage: ATM Cluster A');

-- 9. Predictions Seed
INSERT INTO predictions (id, prediction_ref, location_id, atm_cluster, predicted_time_window, confidence_score, contributing_factors, model_version) VALUES
(1, 'PRED-2026-001', 1, 'ATM Cluster A - North Hub', '18:00 - 21:00', 91, '["Rapid structuring sequence detected", "Mule account historical cash-out behavior", "Peak evening ATM cluster activity window", "Connected complaint filed for source account"]', 'v1.2-prototype');

-- 10. Risk Scores Seed
INSERT INTO risk_scores (id, entity_type, entity_id, old_score, new_score, risk_level, confidence_score, contributing_reasons, recalculated_at) VALUES
(1, 'LOCATION', 1, 58, 82, 'High', 92, 'Risk increased because newly detected transaction splitting patterns matched an active mule network and recent victim complaint CMP-2026-901.', NOW()),
(2, 'ACCOUNT', 1002, 62, 89, 'High', 95, 'High risk due to 4 rapid outgoing transfers following a 500,000 deposit and direct linkage to 3 suspect mule nodes.', NOW());

-- 11. Alerts Seed
INSERT INTO alerts (id, alert_ref, title, priority, risk_score, confidence, location_name, predicted_time, reasons, status) VALUES
(1, 'ALT-2026-9001', 'CRITICAL FRAUD NETWORK: Structuring & Imminent ATM Cash-Out', 'HIGH', 89, 92, 'ATM Cluster A - North Hub', '18:00 - 21:00', '["Transaction splitting detected (₹5,00,000 into 4 accounts)", "Direct connection to 3 known mule accounts", "Predictive model forecasts cash-out at ATM Cluster A", "Recent victim complaint filed"]', 'ACTIVE');

-- 12. Investigations Seed
INSERT INTO investigations (id, case_ref, alert_id, account_id, investigator_id, title, status, priority, lead_recommendation, notes) VALUES
(1, 'CASE-2026-101', 1, 1002, 1, 'Investigation: Mule Network ACC-44102-MULE-A & ATM Cluster A', 'IN_PROGRESS', 'HIGH', 'Trace connected mule accounts B, C, D and request physical surveillance or video log freeze at ATM Cluster A between 18:00 and 21:00.', 'Initial structuring verified. ₹5,00,000 split across 4 sub-accounts. Alert sent to field response team.');
