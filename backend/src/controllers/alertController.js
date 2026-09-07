const ResponseService = require('../services/response/responseService');

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await ResponseService.getAlerts();
    res.json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const alert = await ResponseService.createAlert(req.body);
    res.status(201).json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

exports.getLead = async (req, res, next) => {
  try {
    const lead = await ResponseService.generateHighPriorityLead(req.params.id);
    res.json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      data: lead
    });
  } catch (err) {
    next(err);
  }
};
