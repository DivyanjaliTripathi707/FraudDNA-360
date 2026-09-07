const DetectionService = require('../services/detection/detectionService');

exports.analyze = async (req, res, next) => {
  try {
    const result = await DetectionService.analyzeTransaction(req.body);
    res.json({
      success: true,
      layer: 'Layer 1: Early Fraud Detection',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

exports.getSuspicious = async (req, res, next) => {
  try {
    const data = await DetectionService.getSuspiciousTransactions();
    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};
