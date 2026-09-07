const express = require('express');
const router = express.Router();
const intelCtrl = require('../controllers/intelligenceController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

// Layer 1: PREVENT
router.post('/mule/evaluate', intelCtrl.evaluateMuleRisk);
router.get('/mule/suspects', intelCtrl.getMuleSuspects);
router.post('/threat/url', intelCtrl.analyzeUrl);
router.post('/threat/scam-text', intelCtrl.analyzeScamText);
router.post('/threat/voice-demo', intelCtrl.analyzeVoiceDemo);
router.post('/family-alert', intelCtrl.sendFamilySafetyAlert);

// Layer 2: CONNECT
router.get('/money-flow', intelCtrl.getMoneyFlow);
router.get('/network-impact', intelCtrl.getNetworkImpact);
router.post('/entity-extract', intelCtrl.extractEntities);
router.post('/entity-resolve', intelCtrl.resolveEntities);
router.get('/entity-links', intelCtrl.getEntityLinks);

// Layer 3: PREDICT
router.get('/campaigns', intelCtrl.getCampaigns);

// Layer 4: EXPLAIN
router.post('/risk-fusion/calculate', intelCtrl.calculateRiskFusion);
router.get('/risk-fusion/weights', intelCtrl.getRiskWeights);
router.put('/risk-fusion/weights', authenticate, authorizeRoles('Admin'), intelCtrl.updateRiskWeights);

// Layer 5: RESPOND
router.post('/autopilot/trigger', intelCtrl.triggerAutopilot);
router.get('/evidence', intelCtrl.getEvidencePackages);
router.get('/evidence/:ref', intelCtrl.getEvidencePackageByRef);
router.post('/evidence/:ref/custody', authenticate, intelCtrl.addCustodyLog);
router.get('/search', intelCtrl.unifiedSearch);

module.exports = router;
