const TransactionModel = require('../../models/transactionModel');
const AccountModel = require('../../models/accountModel');

class DetectionService {
  static async analyzeTransaction(data) {
    const { sourceAccountId, transfers = [], primaryAmount } = data;

    let suspicionScore = 0;
    const detectedPatterns = [];

    const totalAmount = primaryAmount 
      ? parseFloat(primaryAmount) 
      : transfers.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    // Rule 1: Large primary amount divided into multiple smaller transfers (Structuring)
    if (totalAmount >= 200000 && transfers.length >= 3) {
      suspicionScore += 45;
      detectedPatterns.push('Transaction splitting / Structuring pattern detected');
    }

    // Rule 2: Sub-threshold transfers (amounts like 40,000, 50,000, 75,000 to avoid 100k audit limits)
    const hasSubThreshold = transfers.some(t => parseFloat(t.amount) >= 40000 && parseFloat(t.amount) <= 99000);
    if (hasSubThreshold) {
      suspicionScore += 25;
      detectedPatterns.push('Structuring below audit monitoring thresholds');
    }

    // Rule 3: Rapid sequential transfers / multiple distinct accounts
    const uniqueRecipients = new Set(transfers.map(t => t.targetAccountId)).size;
    if (uniqueRecipients >= 3) {
      suspicionScore += 20;
      detectedPatterns.push('Multiple distinct recipient accounts targeted');
    }

    // Rule 4: High velocity
    if (transfers.length >= 4) {
      suspicionScore += 10;
      detectedPatterns.push('Unusual high-frequency velocity spike');
    }

    const isSuspicious = suspicionScore >= 50;

    // Record transactions into system if requested
    const createdTransactions = [];
    if (transfers.length > 0) {
      for (const tr of transfers) {
        const created = await TransactionModel.create({
          source_account_id: sourceAccountId || 1002,
          target_account_id: tr.targetAccountId,
          amount: tr.amount,
          transaction_type: 'TRANSFER',
          is_suspicious: isSuspicious ? 1 : 0,
          suspicious_reasons: detectedPatterns.join(' | ')
        });
        createdTransactions.push(created);
      }

      // Update target accounts to MULE_SUSPECT if score is high
      if (isSuspicious) {
        for (const tr of transfers) {
          await AccountModel.updateRiskScore(tr.targetAccountId, Math.min(89, 60 + suspicionScore / 2), 'MULE_SUSPECT');
        }
      }
    }

    return {
      suspicious: isSuspicious,
      suspicionScore: Math.min(100, suspicionScore),
      detectedPatterns,
      primaryAmount: totalAmount,
      transfersAnalyzed: transfers.length,
      createdTransactions
    };
  }

  static async getSuspiciousTransactions() {
    return await TransactionModel.getAll({ suspicious: true });
  }
}

module.exports = DetectionService;
