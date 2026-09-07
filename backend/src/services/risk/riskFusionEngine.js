const db = require('../../config/db');

class RiskFusionEngine {
  /**
   * Get Current Configurable Risk Weights
   */
  static getWeights() {
    return db.memoryStore.risk_weights || {
      ai_score_weight: 0.25,
      graph_score_weight: 0.25,
      transaction_score_weight: 0.25,
      behavior_score_weight: 0.15,
      threat_intel_score_weight: 0.10,
      version: 'v2.1-dynamic'
    };
  }

  /**
   * Update Configurable Risk Weights (Admin role)
   */
  static updateWeights(newWeights) {
    const current = this.getWeights();
    db.memoryStore.risk_weights = {
      ...current,
      ...newWeights,
      version: `v2.1-custom-${Date.now()}`
    };
    return db.memoryStore.risk_weights;
  }

  /**
   * Calculate Multi-Factor Fused Risk Score
   * FINAL RISK = (w_ai * AI) + (w_graph * Graph) + (w_tx * Tx) + (w_beh * Behavior) + (w_intel * ThreatIntel)
   */
  static calculateFusedRisk(context = {}) {
    const weights = this.getWeights();

    // Context scores (0-100)
    const aiScore = context.aiScore !== undefined ? context.aiScore : 88;
    const graphScore = context.graphScore !== undefined ? context.graphScore : 94;
    const txScore = context.txScore !== undefined ? context.txScore : 89;
    const behaviorScore = context.behaviorScore !== undefined ? context.behaviorScore : 85;
    const threatIntelScore = context.threatIntelScore !== undefined ? context.threatIntelScore : 92;

    const weightedSum = (
      (aiScore * weights.ai_score_weight) +
      (graphScore * weights.graph_score_weight) +
      (txScore * weights.transaction_score_weight) +
      (behaviorScore * weights.behavior_score_weight) +
      (threatIntelScore * weights.threat_intel_score_weight)
    );

    const finalScore = Math.round(Math.min(100, Math.max(0, weightedSum)));

    let riskLevel = 'LOW';
    if (finalScore >= 85) riskLevel = 'CRITICAL';
    else if (finalScore >= 70) riskLevel = 'HIGH';
    else if (finalScore >= 40) riskLevel = 'MEDIUM';

    // Explainable alert cards
    const explainableCards = [
      {
        factor: 'GRAPH CONNECTION',
        score: graphScore,
        weight: `${Math.round(weights.graph_score_weight * 100)}%`,
        signal: 'High-risk multi-hop neighborhood topology',
        evidence: 'Direct 1-hop and 2-hop links to 4 suspect mule nodes and 2 ATM cash-out endpoints.'
      },
      {
        factor: 'TRANSACTION BEHAVIOR',
        score: txScore,
        weight: `${Math.round(weights.transaction_score_weight * 100)}%`,
        signal: 'Structuring / Sub-threshold fund splitting',
        evidence: 'Single primary deposit of ₹5,00,000 rapidly divided into 4 sequential sub-50k disbursements.'
      },
      {
        factor: 'AI PREDICTIVE DETECTION',
        score: aiScore,
        weight: `${Math.round(weights.ai_score_weight * 100)}%`,
        signal: 'Anomalous velocity and temporal window spike',
        evidence: 'Spatiotemporal prediction model correlates evening ATM withdrawal clustering with 93% confidence.'
      },
      {
        factor: 'BEHAVIORAL VELOCITY',
        score: behaviorScore,
        weight: `${Math.round(weights.behavior_score_weight * 100)}%`,
        signal: 'Short money holding duration (< 9 mins)',
        evidence: 'Unusual rapid churn: Account funds moved downstream within minutes of initial credit.'
      },
      {
        factor: 'THREAT INTELLIGENCE',
        score: threatIntelScore,
        weight: `${Math.round(weights.threat_intel_score_weight * 100)}%`,
        signal: 'Matched phishing campaign indicators',
        evidence: 'Inflow attributed to verified utility bill phishing lure CAMP-2026-POWERGRID.'
      }
    ];

    return {
      final_risk_score: finalScore,
      risk_level: riskLevel,
      data_confidence: 'HIGH', // HIGH, MEDIUM, LOW
      confidence_percent: 94,
      model_version: weights.version,
      feature_version: 'v2.4-fused-features',
      weights_applied: weights,
      components: {
        ai_score: aiScore,
        graph_score: graphScore,
        transaction_score: txScore,
        behavior_score: behaviorScore,
        threat_intel_score: threatIntelScore
      },
      explainable_cards: explainableCards,
      summary_reason: `CRITICAL RISK (${finalScore}/100): Compounded by high graph centrality (score ${graphScore}), transaction structuring pattern (${txScore}), and threat intelligence campaign match (${threatIntelScore}).`
    };
  }
}

module.exports = RiskFusionEngine;
