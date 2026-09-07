const db = require('../../config/db');

class EvidenceService {
  /**
   * Get all evidence packages
   */
  static getPackages() {
    return db.memoryStore.evidence_packages || [];
  }

  /**
   * Get specific evidence package by ID or Ref
   */
  static getPackageByRef(ref) {
    const packages = db.memoryStore.evidence_packages || [];
    return packages.find(p => p.package_ref === ref || p.case_ref === ref || p.id === parseInt(ref)) || null;
  }

  /**
   * Add chain-of-custody audit log to evidence package
   */
  static addChainOfCustodyEntry(packageRef, entry) {
    const pkg = this.getPackageByRef(packageRef);
    if (!pkg) return null;

    const newStep = {
      step: pkg.chain_of_custody.length + 1,
      actor: entry.actor || 'Authorized Investigator',
      action: entry.action || 'EVIDENCE_ACCESSED',
      timestamp: new Date().toISOString(),
      notes: entry.notes || 'Routine evidence access log'
    };
    pkg.chain_of_custody.push(newStep);

    // Audit log
    db.memoryStore.audit_logs.unshift({
      id: db.memoryStore.audit_logs.length + 1,
      actor: entry.actor || 'investigator',
      action: 'EVIDENCE_ACCESSED',
      target: packageRef,
      ip: '127.0.0.1',
      timestamp: new Date().toISOString()
    });

    return pkg;
  }

  /**
   * Unified Intelligence Search across All Entities
   * Search across: Case ID, Account, UPI, Phone, Device, URL, IP, Complaint Ref
   */
  static unifiedSearch(queryStr = '') {
    if (!queryStr || typeof queryStr !== 'string') {
      return { success: false, message: 'Search query is required' };
    }

    const q = queryStr.trim().toLowerCase();
    const accounts = db.memoryStore.accounts || [];
    const transactions = db.memoryStore.transactions || [];
    const cases = db.memoryStore.investigations || [];
    const alerts = db.memoryStore.alerts || [];
    const threats = db.memoryStore.threat_indicators || [];
    const complaints = db.memoryStore.complaints || [];

    const matchedAccounts = accounts.filter(a => 
      a.account_number.toLowerCase().includes(q) ||
      a.holder_name.toLowerCase().includes(q) ||
      (a.upi_id && a.upi_id.toLowerCase().includes(q)) ||
      (a.phone && a.phone.includes(q)) ||
      (a.ip_address && a.ip_address.includes(q))
    );

    const matchedTransactions = transactions.filter(t => 
      t.transaction_ref.toLowerCase().includes(q) ||
      (t.suspicious_reasons && t.suspicious_reasons.toLowerCase().includes(q))
    );

    const matchedCases = cases.filter(c => 
      c.case_ref.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );

    const matchedAlerts = alerts.filter(al => 
      al.alert_ref.toLowerCase().includes(q) ||
      al.title.toLowerCase().includes(q)
    );

    const matchedThreats = threats.filter(th => 
      th.indicator.toLowerCase().includes(q) ||
      th.category.toLowerCase().includes(q)
    );

    const matchedComplaints = complaints.filter(cmp => 
      cmp.complaint_ref.toLowerCase().includes(q) ||
      cmp.description.toLowerCase().includes(q)
    );

    return {
      success: true,
      query: queryStr,
      results: {
        accounts: matchedAccounts,
        transactions: matchedTransactions,
        cases: matchedCases,
        alerts: matchedAlerts,
        threat_indicators: matchedThreats,
        complaints: matchedComplaints
      },
      total_matches: (
        matchedAccounts.length +
        matchedTransactions.length +
        matchedCases.length +
        matchedAlerts.length +
        matchedThreats.length +
        matchedComplaints.length
      )
    };
  }
}

module.exports = EvidenceService;
