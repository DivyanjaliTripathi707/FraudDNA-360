const ResponseService = require('../services/response/responseService');

exports.getInvestigations = async (req, res, next) => {
  try {
    const list = await ResponseService.getInvestigations();
    res.json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

exports.createInvestigation = async (req, res, next) => {
  try {
    const inv = await ResponseService.createInvestigation(req.body);
    res.status(201).json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      data: inv
    });
  } catch (err) {
    next(err);
  }
};

exports.updateInvestigation = async (req, res, next) => {
  try {
    const inv = await ResponseService.updateInvestigation(req.params.id, req.body);
    res.json({
      success: true,
      layer: 'Layer 5: Investigation & Response',
      data: inv
    });
  } catch (err) {
    next(err);
  }
};
