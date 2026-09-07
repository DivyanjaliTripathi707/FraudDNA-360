const PredictionService = require('../services/prediction/predictionService');

exports.predict = async (req, res, next) => {
  try {
    const result = await PredictionService.generatePrediction(req.body);
    res.json({
      success: true,
      layer: 'Layer 3: AI Predictive Intelligence',
      ...result
    });
  } catch (err) {
    next(err);
  }
};

exports.getHotspots = async (req, res, next) => {
  try {
    const data = await PredictionService.getHotspots();
    res.json({
      success: true,
      layer: 'Layer 3: AI Predictive Intelligence',
      ...data
    });
  } catch (err) {
    next(err);
  }
};
