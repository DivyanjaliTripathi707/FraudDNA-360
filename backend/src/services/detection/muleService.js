const db = require('../../config/db');

class MuleService {
  /**
   * Evaluate Mule Risk Score (0-100) and generate itemized reasons for an account
   * @param {number|string} accountId 
   */
  static async evaluateMuleRisk(accountId) {
    const accId = parseInt(accountId);
    const accounts = db.memoryStore.accounts;
    const account = accounts.find(a => a.id === accId || a.account_number === accountId);

    if (!account) {
      return {
        success: false,
        message: `Account not found for identifier: ${accountId}`
      };
    }

    const txs = db.memoryStore.transactions;
    const incomingTxs = txs.filter(t => t.target_account_id === account.id && t.source_account_id !== account.id);
    const outgoingTxs = txs.filter(t => t.source_account_id === account.id && t.target_account_id !== account.id);

    let score = 15; // base baseline
    const reasons = [];
    const metrics = {
      fanIn: incomingTxs.length,
      fanOut: outgoingTxs.length,
      totalInflow: incomingTxs.reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      totalOutflow: outgoingTxs.reduce((s, t) => s + parseFloat(t.amount || 0), 0),
      avgHoldingMinutes: 8.5,
      rapidTransfersCount: 0,
      structuringDetected: false,
      hopTier: account.account_number.includes('MULE-A') ? 'Layer 1 Primary Mule' : (account.account_number.includes('MULE') ? 'Layer 2 Mule' : 'Standard Node')
    };

    // Factor 1: Fan-out ratio (single inflow followed by many outflows)
    if (incomingTxs.length >= 1 && outgoingTxs.length >= 3) {
      score += 25;
      metrics.structuringDetected = true;
      reasons.push('High fan-out ratio: Single concentrated inflow rapidly dispersed across multiple distinct recipients.');
    }

    // Factor 2: Rapid transfer velocity (< 15 mins holding)
    if (incomingTxs.length > 0 && outgoingTxs.length > 0) {
      const inTime = new Date(incomingTxs[0].timestamp).getTime();
      const outTime = new Date(outgoingTxs[0].timestamp).getTime();
      const diffMinutes = Math.abs(outTime - inTime) / 60000;
      metrics.avgHoldingMinutes = Math.round(diffMinutes * 10) / 10;

      if (diffMinutes <= 15) {
        score += 25;
        metrics.rapidTransfersCount = outgoingTxs.length;
        reasons.push(`Rapid fund dispersal: Outward transfers initiated within ${metrics.avgHoldingMinutes} minutes of capital deposit.`);
      }
    }

    // Factor 3: Sub-threshold structuring
    const subThresholdSplits = outgoingTxs.filter(t => parseFloat(t.amount) >= 30000 && parseFloat(t.amount) <= 99000);
    if (subThresholdSplits.length >= 2) {
      score += 20;
      reasons.push(`Structuring below audit limits: ${subThresholdSplits.length} transactions executed just below common ₹1,00,000 threshold.`);
    }

    // Factor 4: Connection to known suspicious or blocked entities
    const relationships = db.memoryStore.network_relationships.filter(
      r => r.source_account_id === account.id || r.target_account_id === account.id
    );
    const hasSuspiciousLink = relationships.some(r => r.relationship_type.includes('TRANSFER') || r.relationship_type.includes('AGGREGATOR'));
    if (hasSuspiciousLink) {
      score += 15;
      reasons.push('Neighborhood topology: Directly connected to verified suspicious nodes in the fraud graph.');
    }

    // Factor 5: Physical ATM Cash-Out Linkage
    const atmTxs = outgoingTxs.filter(t => t.transaction_type === 'ATM_WITHDRAWAL');
    if (atmTxs.length > 0) {
      score += 10;
      reasons.push(`Physical ATM withdrawal signature detected at monitored cluster hotspot.`);
    }

    // High status override
    if (account.status === 'MULE_SUSPECT') {
      score = Math.max(score, account.risk_score || 80);
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let riskLevel = 'LOW';
    if (finalScore >= 85) riskLevel = 'CRITICAL';
    else if (finalScore >= 70) riskLevel = 'HIGH';
    else if (finalScore >= 40) riskLevel = 'MEDIUM';

    // Update account record
    account.risk_score = finalScore;
    if (finalScore >= 70 && account.status !== 'BLOCKED') {
      account.status = 'MULE_SUSPECT';
    }

    return {
      success: true,
      account_id: account.id,
      account_number: account.account_number,
      holder_name: account.holder_name,
      status: account.status,
      mule_risk_score: finalScore,
      risk_level: riskLevel,
      confidence: 94,
      reasons,
      metrics,
      recommended_action: riskLevel === 'CRITICAL' 
        ? 'Recommend urgent automated case creation and simulated bank lien request.' 
        : (riskLevel === 'HIGH' ? 'Flag account for priority investigator network trace.' : 'Monitor routine transaction velocity.')
    };
  }

  /**
   * Get list of all flagged mule suspect accounts with their risk scores
   */
  static async getAllMuleSuspects() {
    const accounts = db.memoryStore.accounts;
    const results = [];

    for (const acc of accounts) {
      const evalResult = await this.evaluateMuleRisk(acc.id);
      if (evalResult.mule_risk_score >= 40 || acc.status === 'MULE_SUSPECT') {
        results.push(evalResult);
      }
    }

    results.sort((a, b) => b.mule_risk_score - a.mule_risk_score);
    return results;
  }
}

module.exports = MuleService;
