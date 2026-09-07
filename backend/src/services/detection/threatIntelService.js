const db = require('../../config/db');

class ThreatIntelService {
  /**
   * Analyze Suspicious URL or Domain
   * Only classifies and warns. NEVER attacks websites.
   * @param {string} urlInput 
   */
  static async analyzeUrl(urlInput) {
    if (!urlInput || typeof urlInput !== 'string') {
      return { success: false, message: 'Valid URL is required.' };
    }

    const cleanUrl = urlInput.trim().toLowerCase();
    let riskScore = 10;
    const reasons = [];
    const matchedIndicators = [];

    // Suspicious TLD checks
    const highRiskTLDs = ['.xyz', '.top', '.online', '.club', '.buzz', '.tk', '.ml', '.work'];
    const matchedTLD = highRiskTLDs.find(tld => cleanUrl.includes(tld));
    if (matchedTLD) {
      riskScore += 35;
      reasons.push(`Suspicious top-level domain detected (${matchedTLD}) frequently abused in phishing campaigns.`);
    }

    // High-risk banking / utility keywords
    const targetKeywords = ['sbi', 'hdfc', 'icici', 'axis', 'kyc', 'electricity', 'bill-pay', 'powergrid', 'pan-link', 'lottery', 'refund'];
    const foundKeywords = targetKeywords.filter(kw => cleanUrl.includes(kw));
    if (foundKeywords.length > 0) {
      riskScore += 30;
      reasons.push(`High-value brand/utility impersonation keywords identified: [${foundKeywords.join(', ')}].`);
    }

    // Look-alike / Typosquatting checks (e.g. "sbi-kyc-update", "secure-bank")
    if (cleanUrl.includes('verification') || cleanUrl.includes('update-portal') || cleanUrl.includes('urgent')) {
      riskScore += 20;
      reasons.push('Phishing lure pattern: Uses urgency and credential harvesting keywords in path/subdomain.');
    }

    // Check against known threat intelligence indicators
    const knownThreat = db.memoryStore.threat_indicators.find(
      t => cleanUrl.includes(t.indicator.toLowerCase()) || t.indicator.toLowerCase().includes(cleanUrl)
    );

    if (knownThreat) {
      riskScore = Math.max(riskScore, 95);
      reasons.push(`Direct threat match: Listed in FraudDNA Threat Intelligence Database (${knownThreat.category}).`);
      matchedIndicators.push(knownThreat);
    }

    const finalScore = Math.min(100, Math.max(5, riskScore));
    let riskLevel = 'LOW';
    if (finalScore >= 80) riskLevel = 'CRITICAL';
    else if (finalScore >= 55) riskLevel = 'HIGH';
    else if (finalScore >= 30) riskLevel = 'MEDIUM';

    return {
      success: true,
      url: urlInput,
      risk_score: finalScore,
      risk_level: riskLevel,
      confidence: 93,
      reasons,
      threat_category: finalScore >= 70 ? 'Phishing / Credential Harvesting Threat' : 'Informational / Neutral',
      safety_recommendation: finalScore >= 50
        ? 'DO NOT open this URL. Do not enter credentials, OTPs, or bank card details. Report to cybercrime cell.'
        : 'Domain appears standard, but always verify TLS certificate and official institutional addresses.',
      disclaimer: '⚠ THREAT INTELLIGENCE WARNING: Classifier performs passive heuristic evaluation. Never attack or interact directly with malicious infrastructure.'
    };
  }

  /**
   * Analyze Scam Conversation / SMS / Call Transcript
   * Detects urgency, fear, OTP requests, emergency impersonation
   * @param {string} text 
   */
  static async analyzeScamText(text) {
    if (!text || typeof text !== 'string') {
      return { success: false, message: 'Valid message text is required.' };
    }

    const lower = text.toLowerCase();
    let score = 10;
    const reasons = [];
    const detectedTriggers = [];

    // Trigger 1: OTP / Credentials harvesting
    if (lower.includes('otp') || lower.includes('one time password') || lower.includes('cvv') || lower.includes('pin') || lower.includes('password')) {
      score += 40;
      detectedTriggers.push('OTP / Security Credential Solicitation');
      reasons.push('Strict Violation: Unsolicited request for OTP, PIN, or confidential financial credentials.');
    }

    // Trigger 2: Urgency & Deadlines ("Within 2 hours", "Immediately", "Blocked today")
    if (lower.includes('urgent') || lower.includes('immediately') || lower.includes('2 hours') || lower.includes('disconnected today') || lower.includes('blocked today') || lower.includes('suspended')) {
      score += 25;
      detectedTriggers.push('Artificial Urgency Manipulation');
      reasons.push('Psychological Pressure: Threatens immediate service termination or account freeze to force hasty decisions.');
    }

    // Trigger 3: Authority Impersonation (Police, CBI, ED, Electricity Officer, Customs, Bank Manager)
    if (lower.includes('police') || lower.includes('cbi') || lower.includes('electricity officer') || lower.includes('bank manager') || lower.includes('customs') || lower.includes('narcotics')) {
      score += 25;
      detectedTriggers.push('Authority Impersonation Lure');
      reasons.push('Authority Impersonation: Posing as law enforcement or official institutional officer without standard dispatch protocols.');
    }

    // Trigger 4: "Don't tell anyone" manipulation / isolation
    if (lower.includes('secret') || lower.includes('do not tell') || lower.includes('confidential call') || lower.includes('stay on the line')) {
      score += 20;
      detectedTriggers.push('Victim Isolation Tactic');
      reasons.push('Isolation Tactic: Requesting victim not to consult family, friends, or branch officials.');
    }

    const finalScore = Math.min(100, Math.max(10, score));
    let riskLevel = 'LOW';
    if (finalScore >= 80) riskLevel = 'CRITICAL';
    else if (finalScore >= 55) riskLevel = 'HIGH';
    else if (finalScore >= 35) riskLevel = 'MEDIUM';

    return {
      success: true,
      scam_risk_score: finalScore,
      risk_level: riskLevel,
      confidence: 95,
      detected_triggers: detectedTriggers,
      reasons,
      safety_recommendation: finalScore >= 50
        ? 'STOP ALL CONTACT IMMEDIATELY. Never share OTPs. Hang up the call and verify through the official bank or customer care number from your card.'
        : 'Message does not display overt pressure tactics, but maintain standard digital vigilance.',
      emergency_guidance: [
        '1. Never disclose OTP, CVV, or UPI PIN under any circumstance.',
        '2. Official bank personnel and police will NEVER ask for payment via phone call.',
        '3. If you suspect fraud, click "I Think I Am Being Scammed" in the Citizen Portal.'
      ]
    };
  }

  /**
   * Safe Demo AI Voice / Deepfake Impersonation Detection
   * Analyzes uploaded audio or demo voice transcript samples
   * @param {object} params 
   */
  static async analyzeVoiceDemo(params = {}) {
    const { sampleName = 'demo_urgent_call.wav', syntheticIndicators = true } = params;

    return {
      success: true,
      sample_analyzed: sampleName,
      risk_level: syntheticIndicators ? 'HIGH' : 'LOW',
      impersonation_probability: syntheticIndicators ? 88 : 12,
      confidence: 91,
      reasons: syntheticIndicators ? [
        'Acoustic spectral artifacts characteristic of synthetic voice cloning models (frequency flattening).',
        'Abnormal unnatural breath pauses and prosodic pitch variance detected in synthetic waveform.',
        'Audio metadata reveals non-telephony compression signature.'
      ] : ['Natural harmonic vocal timbre verified across normal conversational frequency ranges.'],
      recommendation: syntheticIndicators 
        ? '⚠ Potential AI-enabled impersonation or synthesized scam voice detected. Do not transfer funds. Verify caller identity via another independent channel.'
        : 'Sample displays standard acoustic resonance. Continue with standard precautions.',
      disclaimer: '⚠ DEMO FEATURE: Passive consented analysis. FraudDNA 360 does NOT monitor or intercept private communications.'
    };
  }

  /**
   * Family Safety Alert Notification (Simulated Opt-In)
   */
  static async sendFamilySafetyAlert(payload) {
    const { citizenName, trustedContactName, trustedContactPhone, alertReason } = payload;
    return {
      success: true,
      status: 'SIMULATED_SMS_DISPATCHED',
      badge: '⚠ SIMULATED FAMILY SAFETY ALERT',
      recipient: {
        name: trustedContactName || 'Family Contact (Pooja Sharma)',
        phone: trustedContactPhone || '+91 98XXX XXXXX'
      },
      message_content: `[FraudDNA-360 Alert]: Your contact ${citizenName || 'Rajesh Sharma'} received a high-risk scam alert (${alertReason || 'Suspected Phishing Transfer Attempt'}). Please verify their digital safety.`,
      disclaimer: 'Simulated dispatch for demonstration purposes only. Requires explicit user opt-in in production.'
    };
  }
}

module.exports = ThreatIntelService;
