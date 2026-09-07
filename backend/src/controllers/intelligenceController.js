const MuleService = require('../services/detection/muleService');
const ThreatIntelService = require('../services/detection/threatIntelService');
const GraphService = require('../services/graph/graphService');
const EntityResolutionService = require('../services/graph/entityResolutionService');
const PredictionService = require('../services/prediction/predictionService');
const RiskFusionEngine = require('../services/risk/riskFusionEngine');
const AutopilotService = require('../services/response/autopilotService');
const EvidenceService = require('../services/response/evidenceService');

// Mule Intelligence
exports.evaluateMuleRisk = async (req, res, next) => {
  try {
    const { accountId } = req.body;
    const result = await MuleService.evaluateMuleRisk(accountId || 1002);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getMuleSuspects = async (req, res, next) => {
  try {
    const suspects = await MuleService.getAllMuleSuspects();
    res.json({ success: true, count: suspects.length, data: suspects });
  } catch (err) {
    next(err);
  }
};

// Threat Intelligence
exports.analyzeUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    const result = await ThreatIntelService.analyzeUrl(url);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.analyzeScamText = async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = await ThreatIntelService.analyzeScamText(text);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.analyzeVoiceDemo = async (req, res, next) => {
  try {
    const result = await ThreatIntelService.analyzeVoiceDemo(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.sendFamilySafetyAlert = async (req, res, next) => {
  try {
    const result = await ThreatIntelService.sendFamilySafetyAlert(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Money Flow & Graph Intelligence
exports.getMoneyFlow = async (req, res, next) => {
  try {
    const sourceAcc = req.query.source || 1001;
    const result = await GraphService.traceMoneyFlow(sourceAcc);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getNetworkImpact = async (req, res, next) => {
  try {
    const entity = req.query.entity || 1002;
    const result = await GraphService.getNetworkImpact(entity);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Entity Resolution
exports.extractEntities = async (req, res, next) => {
  try {
    const { text } = req.body;
    const result = EntityResolutionService.extractEntities(text);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.resolveEntities = async (req, res, next) => {
  try {
    const { entityA, entityB, entityType } = req.body;
    const result = EntityResolutionService.resolveAndLink(entityA, entityB, entityType);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getEntityLinks = async (req, res, next) => {
  try {
    const links = EntityResolutionService.getAllLinks();
    res.json({ success: true, count: links.length, data: links });
  } catch (err) {
    next(err);
  }
};

// Risk Fusion Engine
exports.calculateRiskFusion = async (req, res, next) => {
  try {
    const result = RiskFusionEngine.calculateFusedRisk(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getRiskWeights = async (req, res, next) => {
  try {
    const weights = RiskFusionEngine.getWeights();
    res.json({ success: true, weights });
  } catch (err) {
    next(err);
  }
};

exports.updateRiskWeights = async (req, res, next) => {
  try {
    const updated = RiskFusionEngine.updateWeights(req.body);
    res.json({ success: true, message: 'Risk fusion weights updated successfully', weights: updated });
  } catch (err) {
    next(err);
  }
};

// Autopilot & Investigations
exports.triggerAutopilot = async (req, res, next) => {
  try {
    const result = await AutopilotService.triggerAutopilot(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Evidence & Search
exports.getEvidencePackages = async (req, res, next) => {
  try {
    const pkgs = EvidenceService.getPackages();
    res.json({ success: true, count: pkgs.length, data: pkgs });
  } catch (err) {
    next(err);
  }
};

exports.getEvidencePackageByRef = async (req, res, next) => {
  try {
    const pkg = EvidenceService.getPackageByRef(req.params.ref);
    if (!pkg) return res.status(404).json({ success: false, message: 'Evidence package not found' });
    res.json({ success: true, package: pkg });
  } catch (err) {
    next(err);
  }
};

exports.addCustodyLog = async (req, res, next) => {
  try {
    const updated = EvidenceService.addChainOfCustodyEntry(req.params.ref, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Chain-of-custody entry logged', package: updated });
  } catch (err) {
    next(err);
  }
};

exports.unifiedSearch = async (req, res, next) => {
  try {
    const result = EvidenceService.unifiedSearch(req.query.q || '');
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Fraud Campaigns
exports.getCampaigns = async (req, res, next) => {
  try {
    const result = await PredictionService.detectCampaigns();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
