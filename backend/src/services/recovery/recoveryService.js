const db = require('../../config/db');

class RecoveryService {
  /**
   * Get all active recovery cases
   */
  static async getAllRecoveryCases() {
    return db.memoryStore.recovery_cases || [];
  }

  /**
   * Get specific recovery case by reference or ID
   */
  static async getRecoveryCase(recoveryRef) {
    const cases = db.memoryStore.recovery_cases || [];
    const found = cases.find(c => c.recovery_ref === recoveryRef || c.id === parseInt(recoveryRef));
    if (!found) {
      return { success: false, message: `Recovery case not found for: ${recoveryRef}` };
    }
    return { success: true, case: found };
  }

  /**
   * Victim Verification Workflow:
   * Citizen marks a flagged transaction as either LEGITIMATE or UNAUTHORIZED
   * @param {object} payload { transactionRef, status: 'LEGITIMATE' | 'UNAUTHORIZED', victimNotes }
   */
  static async processVictimVerification(payload) {
    const { transactionRef = 'TXN-88001', status = 'UNAUTHORIZED', victimNotes = '' } = payload;
    const isUnauthorized = status === 'UNAUTHORIZED';

    let recoveryCase = null;

    if (isUnauthorized) {
      const newRef = `REC-2026-${Math.floor(700 + Math.random() * 200)}`;
      recoveryCase = {
        id: db.memoryStore.recovery_cases.length + 1,
        recovery_ref: newRef,
        case_ref: `CASE-2026-${Math.floor(100 + Math.random() * 900)}`,
        victim_account: 'ACC-98214-SOURCE',
        victim_name: 'Rajesh Sharma',
        disputed_amount: 500000.00,
        traceable_amount: 430000.00,
        recovered_amount: 175000.00,
        verification_status: 'UNAUTHORIZED_CONFIRMED',
        recovery_status: 'ACTION_REQUESTED', // PENDING, UNDER_REVIEW, FUNDS_TRACEABLE, ACTION_REQUESTED, PARTIALLY_RECOVERED, RECOVERED, NOT_RECOVERABLE
        simulated_bank_response: {
          status: 'SIMULATED_LIEN_APPLIED',
          bank_name: 'Demo Partner Banking Network',
          response_code: 'SIM-RES-202',
          message: '⚠ SIMULATED BANK RESPONSE: Immediate advisory freeze dispatched to recipient institutions. Traceable ₹4,30,000 flagged.',
          timestamp: new Date().toISOString()
        },
        victim_notes: victimNotes || 'Transaction was not authorized by me. Received fake electricity disconnection threat.',
        timeline: [
          { time: 'Just Now', event: 'Victim confirmed transaction TXN-88001 was UNAUTHORIZED.' },
          { time: 'Just Now', event: `Autonomous Recovery Case ${newRef} generated with immediate fund tracing.` },
          { time: 'Just Now', event: '⚠ SIMULATED BANK NOTICE: Advisory freeze signal sent to destination mule nodes.' }
        ],
        created_at: new Date().toISOString()
      };

      db.memoryStore.recovery_cases.unshift(recoveryCase);

      // Add to audit log
      db.memoryStore.audit_logs.unshift({
        id: db.memoryStore.audit_logs.length + 1,
        actor: 'citizen_user',
        action: 'VICTIM_DISPUTE_UNAUTHORIZED',
        target: transactionRef,
        ip: '127.0.0.1',
        timestamp: new Date().toISOString()
      });
    } else {
      // Mark transaction as legitimate
      const tx = db.memoryStore.transactions.find(t => t.transaction_ref === transactionRef);
      if (tx) {
        tx.is_suspicious = 0;
        tx.suspicious_reasons = 'Cleared by victim verification.';
      }
    }

    return {
      success: true,
      verification_status: isUnauthorized ? 'UNAUTHORIZED_CONFIRMED' : 'LEGITIMATE_CONFIRMED',
      message: isUnauthorized 
        ? 'Dispute filed successfully. Digital Recovery Case has been created and fund tracing initiated.'
        : 'Transaction verified as legitimate by account holder. Alert cleared.',
      recovery_case: recoveryCase,
      disclaimer: '⚠ RECOVERY DISCLAIMER: Recovery is NEVER guaranteed. Digital fraud recovery workflows facilitate authorized communication and tracing; all bank actions shown are simulated demonstration responses.'
    };
  }

  /**
   * Update Recovery Case Status (Investigator or Admin action)
   * @param {string} recoveryRef 
   * @param {string} newStatus 'UNDER_REVIEW' | 'FUNDS_TRACEABLE' | 'ACTION_REQUESTED' | 'PARTIALLY_RECOVERED' | 'RECOVERED' | 'NOT_RECOVERABLE'
   * @param {object} actionDetails 
   */
  static async updateRecoveryStatus(recoveryRef, newStatus, actionDetails = {}) {
    const cases = db.memoryStore.recovery_cases || [];
    const found = cases.find(c => c.recovery_ref === recoveryRef || c.id === parseInt(recoveryRef));

    if (!found) {
      return { success: false, message: `Recovery case not found: ${recoveryRef}` };
    }

    found.recovery_status = newStatus;
    if (actionDetails.recoveredAmount !== undefined) {
      found.recovered_amount = parseFloat(actionDetails.recoveredAmount);
    }

    const eventDesc = actionDetails.notes || `Status updated to ${newStatus} by authorized investigator.`;
    found.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      event: eventDesc
    });

    // Update simulated bank response
    found.simulated_bank_response = {
      status: `SIMULATED_${newStatus}`,
      bank_name: 'Demo Banking Federation',
      response_code: 'SIM-ACK-200',
      message: `⚠ SIMULATED BANK RESPONSE: Action '${newStatus}' confirmed by partner nodal desk.`,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      message: `Recovery case ${found.recovery_ref} updated to ${newStatus}`,
      case: found
    };
  }
}

module.exports = RecoveryService;
