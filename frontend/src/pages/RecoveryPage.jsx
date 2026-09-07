import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Banknote,
  RotateCcw,
  Building,
  Lock,
  Download,
  Search
} from 'lucide-react';
import { recoveryService } from '../services/api';

export default function RecoveryPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [disputeNotes, setDisputeNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState('tracker'); // 'tracker' | 'verify'

  useEffect(() => {
    fetchRecoveryCases();
  }, []);

  const fetchRecoveryCases = async () => {
    try {
      setLoading(true);
      const res = await recoveryService.getAllCases();
      if (res.data) {
        setCases(res.data);
        if (res.data.length > 0) {
          setSelectedCase(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVictimDispute = async (status) => {
    try {
      setActionSuccess('');
      setActionError('');
      const res = await recoveryService.verifyTransaction({
        transactionRef: 'TXN-88001',
        status,
        victimNotes: disputeNotes || (status === 'UNAUTHORIZED' ? 'Victim reported unauthorized phishing transfer.' : 'Verified legitimate.')
      });
      setActionSuccess(res.message);
      fetchRecoveryCases();
    } catch (err) {
      setActionError(err.message || 'Failed to submit verification');
    }
  };

  const handleSimulateBankAction = async (recoveryRef, newStatus, amount) => {
    try {
      setActionSuccess('');
      const res = await recoveryService.updateStatus(recoveryRef, newStatus, {
        recoveredAmount: amount || 175000,
        notes: `Simulated bank recovery action applied: ${newStatus}`
      });
      setActionSuccess(res.message);
      fetchRecoveryCases();
    } catch (err) {
      setActionError(err.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTION_REQUESTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">ACTION REQUESTED</span>;
      case 'PARTIALLY_RECOVERED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">PARTIALLY RECOVERED</span>;
      case 'RECOVERED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">RECOVERED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">UNDER REVIEW</span>;
      case 'FUNDS_TRACEABLE':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">FUNDS TRACEABLE</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Positioning Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-cyan-400" />
              Layer 6: Digital Fraud Recovery Support
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Recovery Workflow
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empowering victims with direct digital reporting, rapid fund tracing, and authorized simulated bank response coordination.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'tracker' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Recovery Cases
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'verify' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Victim Dispute Portal
          </button>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer Card */}
      <div className="p-3.5 bg-slate-900/60 border border-amber-500/30 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold uppercase tracking-wider block">Critical Regulatory Notice</strong>
          Money recovery is <span className="underline font-bold text-amber-200">never guaranteed</span>. FraudDNA 360 acts as an investigation and authorized intelligence bridge to rapidly trace illicit fund flows. All partner bank actions, liens, and holds shown in this dashboard are <span className="text-amber-300 font-semibold">simulated demonstration responses</span>.
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* TAB 1: VICTIM DISPUTE VERIFICATION PORTAL */}
      {activeTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Victim Notification Simulator
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-2">
                "⚠️ We detected a potentially suspicious transaction. Please verify."
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Citizen verification enables immediate autonomous dispute triage without physical visit to a station.
              </p>
            </div>

            {/* Flagged Transaction Details */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Transaction Reference:</span>
                <span className="font-mono font-bold text-cyan-300">TXN-88001</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Amount Flagged:</span>
                <span className="font-mono font-bold text-red-400 text-sm">₹5,00,000.00</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Source Account:</span>
                <span className="font-mono text-slate-200">ACC-98214-SOURCE (Rajesh Sharma)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Destination Account:</span>
                <span className="font-mono text-amber-300">ACC-44102-MULE-A (Vikram Mule)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Detection Trigger:</span>
                <span className="text-red-400 font-semibold">Structuring & Transaction Splitting (Layer 1 Anomaly)</span>
              </div>
            </div>

            {/* Victim Optional Notes */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Incident Statement / Pretext Context:</label>
              <textarea
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="E.g. Received call from fake electricity board threatening disconnection within 2 hours. Asked to install screen sharing APK..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Dual Action Buttons as required by Master Prompt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleVictimDispute('LEGITIMATE')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                [THIS TRANSACTION IS LEGITIMATE]
              </button>

              <button
                onClick={() => handleVictimDispute('UNAUTHORIZED')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-500/40 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs shadow-lg shadow-red-500/10 transition-all"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                [THIS TRANSACTION WAS NOT AUTHORIZED]
              </button>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Automated Digital Workflow
            </h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <p className="font-semibold text-slate-200 mb-1">1. Autonomous Trace</p>
                <p>Upon clicking UNAUTHORIZED, downstream money flow is dynamically traced through FlowScope graph analysis.</p>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <p className="font-semibold text-slate-200 mb-1">2. Evidence Sealed</p>
                <p>Digital evidence package is generated with SHA-256 integrity seal and linked to the investigation file.</p>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
                <p className="font-semibold text-slate-200 mb-1">3. Simulated Bank Action</p>
                <p>Simulated advisory freeze dispatched to partner nodal desks for remaining traceable funds.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE RECOVERY CASES TRACKER */}
      {activeTab === 'tracker' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recovery Cases List */}
          <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recovery Queue ({cases.length})</h2>
              <span className="text-[10px] text-cyan-400 font-mono">LIVE FEED</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No active recovery cases.</div>
            ) : (
              <div className="space-y-2">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedCase?.id === c.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-300">{c.recovery_ref}</span>
                      {getStatusBadge(c.recovery_status)}
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{c.victim_name}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Disputed: <strong className="text-red-400">₹{parseFloat(c.disputed_amount).toLocaleString('en-IN')}</strong></span>
                      <span>Recovered: <strong className="text-emerald-400">₹{parseFloat(c.recovered_amount).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Case Inspection Card */}
          {selectedCase && (
            <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100 font-mono">{selectedCase.recovery_ref}</h3>
                    {getStatusBadge(selectedCase.recovery_status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Linked Case: <span className="text-cyan-400 font-mono">{selectedCase.case_ref}</span> | Victim: {selectedCase.victim_name}
                  </p>
                </div>

                {/* Amount Badges */}
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Traceable</span>
                    <span className="font-bold text-purple-300">₹{parseFloat(selectedCase.traceable_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Secured</span>
                    <span className="font-bold text-emerald-400">₹{parseFloat(selectedCase.recovered_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Bank Response Notification Card */}
              {selectedCase.simulated_bank_response && (
                <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-cyan-400" />
                      ⚠ SIMULATED BANK RESPONSE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{selectedCase.simulated_bank_response.response_code}</span>
                  </div>
                  <p className="text-xs text-cyan-200 font-medium leading-relaxed">
                    {selectedCase.simulated_bank_response.message}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Partner Institution: <span className="text-slate-300">{selectedCase.simulated_bank_response.bank_name}</span>
                  </p>
                </div>
              )}

              {/* Case Action Controls (Investigator/Admin) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Simulate Authorized Partner Actions
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSimulateBankAction(selectedCase.recovery_ref, 'FUNDS_TRACEABLE', selectedCase.recovered_amount)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
                  >
                    Mark Funds Traceable
                  </button>
                  <button
                    onClick={() => handleSimulateBankAction(selectedCase.recovery_ref, 'PARTIALLY_RECOVERED', 175000)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                  >
                    Simulate Partial Recovery (₹1,75,000)
                  </button>
                  <button
                    onClick={() => handleSimulateBankAction(selectedCase.recovery_ref, 'RECOVERED', selectedCase.traceable_amount)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                  >
                    Simulate Full Recovery (₹4,30,000)
                  </button>
                </div>
              </div>

              {/* Recovery Event Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recovery Event Chronology
                </h4>
                <div className="border-l-2 border-slate-800 ml-2 pl-4 space-y-3 text-xs">
                  {selectedCase.timeline?.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900" />
                      <span className="text-[10px] font-mono text-cyan-400 block">{item.time}</span>
                      <p className="text-slate-300 mt-0.5">{item.event}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
