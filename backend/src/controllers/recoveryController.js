const RecoveryService = require('../services/recovery/recoveryService');

exports.getAllCases = async (req, res, next) => {
  try {
    const cases = await RecoveryService.getAllRecoveryCases();
    res.json({
      success: true,
      count: cases.length,
      data: cases,
      disclaimer: '⚠ RECOVERY DISCLAIMER: Digital fraud recovery support enables authorized fund tracing and dispute tracking. Money recovery is NOT guaranteed; partner bank actions are simulated.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getCaseByRef = async (req, res, next) => {
  try {
    const result = await RecoveryService.getRecoveryCase(req.params.ref);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyTransaction = async (req, res, next) => {
  try {
    const result = await RecoveryService.processVictimVerification(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, actionDetails } = req.body;
    const result = await RecoveryService.updateRecoveryStatus(req.params.ref, status, actionDetails);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
