const RiskService = require('../services/risk/riskService');

exports.getRisk = async (req, res, next) => {
  try {
    const entityType = req.query.type || 'LOCATION';
    const data = await RiskService.getEntityRisk(req.params.id, entityType);
    res.json({
      success: true,
      layer: 'Layer 4: Dynamic Risk & Explainability',
      data
    });
  } catch (err) {
    next(err);
  }
};

exports.recalculateRisk = async (req, res, next) => {
  try {
    const result = await RiskService.recalculateRisk(req.body);
    res.json({
      success: true,
      layer: 'Layer 4: Dynamic Risk & Explainability',
      ...result
    });
  } catch (err) {
    next(err);
  }
};
