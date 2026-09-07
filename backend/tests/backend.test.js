const { test, describe } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');

// Services
const MuleService = require('../src/services/detection/muleService');
const ThreatIntelService = require('../src/services/detection/threatIntelService');
const DetectionService = require('../src/services/detection/detectionService');
const GraphService = require('../src/services/graph/graphService');
const EntityResolutionService = require('../src/services/graph/entityResolutionService');
const PredictionService = require('../src/services/prediction/predictionService');
const RiskFusionEngine = require('../src/services/risk/riskFusionEngine');
const AutopilotService = require('../src/services/response/autopilotService');
const EvidenceService = require('../src/services/response/evidenceService');
const RecoveryService = require('../src/services/recovery/recoveryService');
const { maskString } = require('../src/middleware/auth');
const db = require('../src/config/db');

describe('FraudDNA 360 - Comprehensive Automated Test Suite', () => {

  describe('1. Authentication & RBAC Governance', () => {
    test('should have valid users for Citizen, Investigator, and Admin roles', () => {
      const users = db.memoryStore.users;
      assert.ok(users.some(u => u.role === 'Investigator'), 'Investigator role exists');
      assert.ok(users.some(u => u.role === 'Admin'), 'Admin role exists');
      assert.ok(users.some(u => u.role === 'Citizen'), 'Citizen role exists');
    });

    test('should verify JWT token creation and role claims', () => {
      const payload = { id: 1, username: 'admin_investigator', role: 'Investigator' };
      const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });
      const decoded = jwt.verify(token, 'secret');
      assert.strictEqual(decoded.username, 'admin_investigator');
      assert.strictEqual(decoded.role, 'Investigator');
    });

    test('should properly mask sensitive financial identifiers for privacy protection', () => {
      const maskedAcc = maskString('ACC-44102-MULE-A', 4);
      assert.ok(maskedAcc.includes('XXXX'), 'Account number is masked');
      assert.ok(maskedAcc.endsWith('LE-A'), 'Preserves designated trailing characters');

      const maskedPhone = maskString('+919876543210', 4);
      assert.ok(maskedPhone.includes('XXXX'), 'Phone number is masked');
      assert.ok(maskedPhone.endsWith('3210'), 'Last 4 digits visible');
    });
  });

  describe('2. Layer 1: PREVENT (Early Detection & Mule Intelligence)', () => {
    test('should evaluate Mule Account Risk Score on 0-100 scale with itemized reasons', async () => {
      const result = await MuleService.evaluateMuleRisk(1002);
      assert.strictEqual(result.success, true);
      assert.ok(result.mule_risk_score >= 0 && result.mule_risk_score <= 100, 'Score is 0-100');
      assert.ok(result.reasons.length > 0, 'Itemized reasons are provided');
      assert.ok(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(result.risk_level), 'Valid risk level');
      assert.ok(result.metrics.fanOut >= 3, 'High fan-out structuring detected');
    });

    test('should analyze suspicious URL and flag phishing look-alike domains', async () => {
      const phishUrl = 'http://sbi-kyc-update-portal.security-verification.xyz';
      const result = await ThreatIntelService.analyzeUrl(phishUrl);
      assert.strictEqual(result.success, true);
      assert.ok(result.risk_score >= 80, 'High phishing risk score');
      assert.strictEqual(result.risk_level, 'CRITICAL');
      assert.ok(result.reasons.some(r => r.includes('phishing') || r.includes('domain') || r.includes('TLD')), 'Explains domain anomaly');
    });

    test('should detect scam urgency and OTP solicitation in message text', async () => {
      const scamMsg = 'URGENT: Your electricity connection will be disconnected today within 2 hours. Send OTP immediately to prevent blockage.';
      const result = await ThreatIntelService.analyzeScamText(scamMsg);
      assert.strictEqual(result.success, true);
      assert.ok(result.scam_risk_score >= 60, 'Elevated scam risk');
      assert.ok(result.detected_triggers.includes('OTP / Security Credential Solicitation'));
      assert.ok(result.emergency_guidance.length >= 3, 'Provides emergency safety steps');
    });

    test('should demonstrate safe AI Voice / Deepfake scam analysis', async () => {
      const result = await ThreatIntelService.analyzeVoiceDemo({ syntheticIndicators: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.risk_level, 'HIGH');
      assert.ok(result.impersonation_probability > 70);
      assert.ok(result.disclaimer.includes('DEMO FEATURE'));
    });
  });

  describe('3. Layer 2: CONNECT (Unified Graph & FlowScope Tracing)', () => {
    test('should generate full unified graph containing multiple node and edge types', async () => {
      const graph = await GraphService.getFullGraph();
      assert.ok(graph.nodes.length >= 7, 'Graph contains multiple entities');
      assert.ok(graph.edges.length >= 5, 'Graph contains relationship edges');
      assert.ok(graph.nodes.some(n => n.type === 'MULE_ACCOUNT'), 'Includes Mule nodes');
      assert.ok(graph.nodes.some(n => n.type === 'ATM'), 'Includes ATM nodes');
      assert.ok(graph.nodes.some(n => n.type === 'LOCATION'), 'Includes Location nodes');
    });

    test('should trace FlowScope-inspired multi-hop money flow from victim to ATM cash-out', async () => {
      const flow = await GraphService.traceMoneyFlow(1001);
      assert.strictEqual(flow.success, true);
      assert.ok(flow.paths.length >= 2, 'Multiple branching downstream paths');
      assert.strictEqual(flow.total_flow_amount, 500000);
      assert.ok(flow.traceable_in_network > 0, 'Computes traceable amount');
      assert.ok(flow.velocity_summary.avg_hop_interval_minutes > 0, 'Hop timing metrics present');
    });

    test('should compute Fraud Network Impact metrics for suspect entities', async () => {
      const impact = await GraphService.getNetworkImpact(1002);
      assert.strictEqual(impact.success, true);
      assert.ok(impact.metrics.connected_entities_count >= 5, 'Quantifies connected entity count');
      assert.ok(impact.metrics.total_volume_in_flight >= 500000, 'Calculates capital in flight');
    });

    test('should extract and normalize entities from complaint text', () => {
      const text = 'Victim transferred funds to phone +91 91234 56780 and UPI vikram.quick@paytm referencing ACC-44102-MULE-A at IP 182.72.10.45';
      const extracted = EntityResolutionService.extractEntities(text);
      assert.ok(extracted.phones.length >= 1, 'Extracted telephone');
      assert.ok(extracted.upis.includes('vikram.quick@paytm'), 'Extracted UPI');
      assert.ok(extracted.accounts.some(a => a.includes('ACC-44102')), 'Extracted account');
      assert.ok(extracted.ips.includes('182.72.10.45'), 'Extracted IP');
    });

    test('should link entities with confidence score and resolution status', () => {
      const link = EntityResolutionService.resolveAndLink('+919876543210', '+91 98765 43210', 'PHONE');
      assert.ok(link.match_confidence >= 95, 'High confidence digit match');
      assert.strictEqual(link.status, 'AUTO_LINKED');
    });
  });

  describe('4. Layer 3: PREDICT (Predictive Forecasting & Campaign Detection)', () => {
    test('should forecast cash-out hotspot location and time window with confidence', async () => {
      const prediction = await PredictionService.generatePrediction({ locationId: 1, accountId: 1002 });
      assert.strictEqual(prediction.timeWindow, '18:00 - 21:00');
      assert.ok(prediction.confidence >= 75 && prediction.confidence <= 100);
      assert.ok(prediction.cash_out_risk.level, 'Cash-out risk level provided');
    });

    test('should group related fraudulent infrastructure into syndicate campaigns', async () => {
      const campaigns = await PredictionService.detectCampaigns();
      assert.strictEqual(campaigns.success, true);
      assert.ok(campaigns.campaigns.length >= 1);
      assert.ok(campaigns.campaigns[0].indicators.length >= 2, 'Multiple cross-entity indicators');
    });
  });

  describe('5. Layer 4: EXPLAIN (Risk Fusion Engine & Explainability)', () => {
    test('should calculate multi-component fused risk with configurable weights', () => {
      const fusion = RiskFusionEngine.calculateFusedRisk({
        aiScore: 90,
        graphScore: 95,
        txScore: 85,
        behaviorScore: 80,
        threatIntelScore: 90
      });

      assert.ok(fusion.final_risk_score >= 0 && fusion.final_risk_score <= 100);
      assert.strictEqual(fusion.data_confidence, 'HIGH');
      assert.ok(fusion.explainable_cards.length >= 5, 'Has explainable factor breakdown');
      assert.ok(fusion.summary_reason.includes('CRITICAL RISK'), 'Generates human-readable summary');
    });

    test('should allow updating dynamic risk weights with automatic re-normalization', () => {
      const customWeights = { ai_score_weight: 0.30, graph_score_weight: 0.30, transaction_score_weight: 0.20, behavior_score_weight: 0.10, threat_intel_score_weight: 0.10 };
      const updated = RiskFusionEngine.updateWeights(customWeights);
      assert.strictEqual(updated.ai_score_weight, 0.30);
    });
  });

  describe('6. Layer 5: RESPOND (Fraud Case Autopilot & Evidence Integrity)', () => {
    test('should autonomously execute Fraud Case Autopilot and assemble sealed evidence package', async () => {
      const result = await AutopilotService.triggerAutopilot({
        sourceAccountId: 1001,
        targetAccountId: 1002,
        amount: 500000
      });

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.autopilot_status, 'EXECUTION_COMPLETED');
      assert.ok(result.case.case_ref.startsWith('CASE-2026'), 'Created prioritized case');
      assert.ok(result.evidence_package.sha256_hash.length === 64, 'Generated SHA-256 hash');
      assert.ok(result.timeline.length >= 4, 'Reconstructed chronological timeline');
      assert.ok(result.ai_summary.includes('AI-GENERATED INVESTIGATION SUMMARY'), 'Generated grounded summary');
    });

    test('should perform unified intelligence search across accounts, cases, transactions, threats', () => {
      const searchRes = EvidenceService.unifiedSearch('44102');
      assert.strictEqual(searchRes.success, true);
      assert.ok(searchRes.results.accounts.length > 0, 'Found matching accounts');
    });
  });

  describe('7. Layer 6: RECOVER (Digital Fraud Recovery Support)', () => {
    test('should process victim dispute for unauthorized transaction and create recovery case', async () => {
      const verification = await RecoveryService.processVictimVerification({
        transactionRef: 'TXN-88001',
        status: 'UNAUTHORIZED',
        victimNotes: 'I did not initiate this ₹5,00,000 transfer.'
      });

      assert.strictEqual(verification.success, true);
      assert.strictEqual(verification.verification_status, 'UNAUTHORIZED_CONFIRMED');
      assert.ok(verification.recovery_case.recovery_ref.startsWith('REC-2026'), 'Recovery case reference created');
      assert.strictEqual(verification.recovery_case.recovery_status, 'ACTION_REQUESTED');
      assert.ok(verification.recovery_case.simulated_bank_response.message.includes('SIMULATED BANK RESPONSE'));
    });

    test('should update recovery case status through lifecycle', async () => {
      const cases = await RecoveryService.getAllRecoveryCases();
      const ref = cases[0].recovery_ref;
      const updateRes = await RecoveryService.updateRecoveryStatus(ref, 'PARTIALLY_RECOVERED', {
        recoveredAmount: 175000,
        notes: 'Simulated partial retrieval executed from destination accounts.'
      });

      assert.strictEqual(updateRes.success, true);
      assert.strictEqual(updateRes.case.recovery_status, 'PARTIALLY_RECOVERED');
      assert.strictEqual(updateRes.case.recovered_amount, 175000);
    });
  });
});
