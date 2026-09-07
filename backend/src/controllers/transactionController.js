const TransactionModel = require('../models/transactionModel');
const DetectionService = require('../services/detection/detectionService');

exports.getTransactions = async (req, res, next) => {
  try {
    const suspicious = req.query.suspicious === 'true';
    const transactions = await TransactionModel.getAll({ suspicious: req.query.suspicious ? suspicious : undefined });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.getTransactionById = async (req, res, next) => {
  try {
    const txn = await TransactionModel.getById(req.params.id);
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: txn });
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { sourceAccountId, targetAccountId, amount, transactionType, locationId } = req.body;
    
    // Quick early detection pass
    const analysis = await DetectionService.analyzeTransaction({
      sourceAccountId,
      transfers: [{ targetAccountId, amount }],
      primaryAmount: amount
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created and analyzed',
      detectionResult: analysis,
      transaction: analysis.createdTransactions[0] || null
    });
  } catch (err) {
    next(err);
  }
};
