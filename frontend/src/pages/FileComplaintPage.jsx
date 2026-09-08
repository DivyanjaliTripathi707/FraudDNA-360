import React, { useState } from 'react';
import { networkService, recoveryService } from '../services/api';
import { ShieldAlert, Send, FileText, CheckCircle2, AlertTriangle, UserCheck, Phone, Hash } from 'lucide-react';

export default function FileComplaintPage() {
  const currentUser = JSON.parse(localStorage.getItem('frauddna_user') || '{"full_name": "Citizen User", "phone": "+91 98214 55102"}');

  const [formData, setFormData] = useState({
    complainant_name: currentUser.full_name || '',
    contact_phone: currentUser.phone || '+91 98214 55102',
    complaint_type: 'PHISHING_ONLINE_FRAUD',
    suspect_phone: '+91 98765 11002',
    suspect_upi: 'scammer88@upi',
    suspect_bank_acc: 'ACC-9901-SUSPECT',
    disputed_amount: '50000',
    incident_details: 'Received an urgent OTP request SMS pretending to be bank KYC update. After sharing OTP, ₹50,000 was deducted from account.'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessResult(null);

    try {
      // 1. Submit complaint text to entity resolution pipeline
      const entityRes = await networkService.extractEntities({ complaintText: formData.incident_details });

      // 2. Initiate dispute & recovery case on behalf of victim
      const disputeRes = await recoveryService.processDispute({
        transaction_id: `TXN-CMP-${Date.now().toString().slice(-6)}`,
        victim_account: currentUser.phone || 'ACC-98214-SOURCE',
        disputed_amount: parseFloat(formData.disputed_amount),
        is_authorized: false,
        reason: `${formData.complaint_type}: ${formData.incident_details}`
      });

      setSuccessResult({
        complaint_ref: `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        extractedEntities: entityRes.entities || [],
        linkedEntities: entityRes.linkedEntities || [],
        recoveryCase: disputeRes.recoveryCase || null,
        message: 'Official Cybercrime Complaint Logged & Autonomous Containment Initiated!'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
            <FileText className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">File Cybercrime Complaint on Behalf of Citizen</h1>
            <p className="text-xs text-slate-400">Direct Citizen Incident Intake Portal — Instantly feeds into Layer 2 Entity Linker & Layer 5 Autopilot</p>
          </div>
        </div>
      </div>

      {successResult ? (
        <div className="bg-[#0D1322] border border-emerald-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-100">{successResult.message}</h3>
              <p className="text-xs text-slate-400">Reference Number: <strong className="text-cyan-400 font-mono text-sm">{successResult.complaint_ref}</strong></p>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span>Automated Entity Extraction:</span>
              <span className="text-cyan-400 font-bold">{successResult.extractedEntities.length} entities extracted</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Cross-Bank Linked Entities:</span>
              <span className="text-purple-400 font-bold">{successResult.linkedEntities.length} linked nodes</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Simulated Bank Lien Advisory:</span>
              <span className="text-amber-400 font-bold">BROADCASTED</span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs flex items-center justify-between">
            <span>⚠ SIMULATED ACTION: Emergency containment alert broadcasted to law enforcement & partner banks.</span>
            <button
              onClick={() => setSuccessResult(null)}
              className="px-3 py-1 bg-amber-500/20 rounded font-bold hover:bg-amber-500/30"
            >
              File Another Complaint
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Complainant / Citizen Name</label>
              <input
                type="text"
                value={formData.complainant_name}
                onChange={(e) => setFormData({ ...formData, complainant_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone Number</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fraud Category</label>
              <select
                value={formData.complaint_type}
                onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="PHISHING_ONLINE_FRAUD">Phishing / Fake Link Fraud</option>
                <option value="OTP_BANK_IMPERSONATION">OTP / Bank Impersonation Scam</option>
                <option value="MULE_TRANSFER_UNAUTHORIZED">Unauthorized Account Transfer</option>
                <option value="DEEPFAKE_VOICE_CLONE">AI Voice Clone / Family Emergency Scam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Disputed Amount (₹)</label>
              <input
                type="number"
                value={formData.disputed_amount}
                onChange={(e) => setFormData({ ...formData, disputed_amount: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Suspect Phone (if known)</label>
              <input
                type="text"
                value={formData.suspect_phone}
                onChange={(e) => setFormData({ ...formData, suspect_phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-cyan-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Suspect UPI ID (if known)</label>
              <input
                type="text"
                value={formData.suspect_upi}
                onChange={(e) => setFormData({ ...formData, suspect_upi: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-cyan-300 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Suspect Bank Acc (if known)</label>
              <input
                type="text"
                value={formData.suspect_bank_acc}
                onChange={(e) => setFormData({ ...formData, suspect_bank_acc: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-cyan-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Description / Evidence Text</label>
            <textarea
              rows={4}
              value={formData.incident_details}
              onChange={(e) => setFormData({ ...formData, incident_details: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Extracting Entities & Logging Complaint...' : 'Submit Official Cybercrime Complaint & Trigger Autopilot'}
          </button>
        </form>
      )}
    </div>
  );
}
