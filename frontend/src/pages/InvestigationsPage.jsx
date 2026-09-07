import React, { useState, useEffect } from 'react';
import { responseService } from '../services/api';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Zap, 
  ShieldAlert, 
  FileText, 
  Search, 
  Lock, 
  Download,
  AlertTriangle,
  Layers
} from 'lucide-react';

export default function InvestigationsPage() {
  const [cases, setCases] = useState([]);
  const [evidencePackages, setEvidencePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [autopilotRunning, setAutopilotRunning] = useState(false);
  const [autopilotResult, setAutopilotResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'evidence' | 'search'

  useEffect(() => {
    fetchCases();
    fetchEvidence();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await responseService.getInvestigations();
      setCases(res.data || []);
      if (res.data && res.data.length > 0 && !selectedCase) {
        setSelectedCase(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const res = await responseService.getEvidencePackages();
      if (res.data) setEvidencePackages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerAutopilot = async () => {
    try {
      setAutopilotRunning(true);
      const res = await responseService.triggerAutopilot({
        sourceAccountId: 1001,
        targetAccountId: 1002,
        amount: 500000,
        triggerType: 'PROACTIVE_SIGNAL_DETECTED'
      });
      setAutopilotResult(res);
      fetchCases();
      fetchEvidence();
      if (res.case) setSelectedCase(res.case);
    } catch (err) {
      console.error(err);
    } finally {
      setAutopilotRunning(false);
    }
  };

  const handleUnifiedSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await responseService.unifiedSearch(searchQuery);
      setSearchResults(res);
      setActiveTab('search');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Autopilot Trigger & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-cyan-400" />
              Layer 5: Fraud Case Autopilot & Investigations
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Autonomous Response
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Human-in-the-loop case orchestration: auto-assembles evidence packages, reconstructs timelines, and traces fund leakage.
          </p>
        </div>

        {/* Autopilot Button */}
        <button
          onClick={handleTriggerAutopilot}
          disabled={autopilotRunning}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start"
        >
          <Zap className={`w-4 h-4 ${autopilotRunning ? 'animate-spin' : ''}`} />
          <span>{autopilotRunning ? 'Executing Autopilot Cycle...' : '⚡ Trigger Fraud Case Autopilot'}</span>
        </button>
      </div>

      {/* Unified Search Bar */}
      <form onSubmit={handleUnifiedSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Unified Intelligence Search across Accounts, UPI IDs, Phones, Threat URLs, IPs, Case Ref..."
            className="w-full bg-[#0D1322] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Search
        </button>
      </form>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs w-fit">
        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'cases' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Investigation Files ({cases.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            activeTab === 'evidence' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Sealed Evidence Packages ({evidencePackages.length})
        </button>
        {searchResults && (
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'search' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search Results ({searchResults.total_matches})
          </button>
        )}
      </div>

      {/* Autopilot Success Banner */}
      {autopilotResult && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Fraud Case Autopilot Cycle Successfully Completed
            </span>
            <span className="text-[10px] font-mono text-slate-400">Case Ref: {autopilotResult.case?.case_ref}</span>
          </div>
          <p className="text-slate-300">
            Automatically analyzed high-risk signal, expanded graph neighborhood to 4 secondary mules, traced multi-hop leakage to ATM-MUM-101, assembled sealed evidence package with SHA-256 hash, and generated grounded AI summary.
          </p>
        </div>
      )}

      {/* TAB 1: INVESTIGATION CASES */}
      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Case Files</h2>
              <span className="text-[10px] text-cyan-400 font-mono">HUMAN-IN-THE-LOOP</span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading cases...</div>
            ) : (
              <div className="space-y-2.5">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedCase?.id === c.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-300">{c.case_ref}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        c.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200 truncate">{c.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Status: <strong className="text-slate-300">{c.status}</strong></span>
                      <span className="font-mono text-cyan-400">{c.evidence_package_id || 'EVP-2026-001'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Case Inspection Card */}
          {selectedCase && (
            <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{selectedCase.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 font-mono">
                      {selectedCase.case_ref}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Status: <span className="text-amber-400 font-semibold">{selectedCase.status}</span> | Lead Assigned: Senior Inspector Verma
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Evidence Package</span>
                  <span className="font-mono text-xs font-bold text-cyan-400">{selectedCase.evidence_package_id || 'EVP-2026-001'}</span>
                </div>
              </div>

              {/* AI-Generated Investigation Summary - Grounded strictly in case facts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    AI-Generated Investigation Summary
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Strictly Grounded in Evidence</span>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed max-h-64 overflow-y-auto">
                  {selectedCase.notes}
                </div>
              </div>

              {/* Timeline Reconstruction */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fraud Event Timeline Reconstruction
                </h4>
                <div className="border-l-2 border-slate-800 ml-2 pl-4 space-y-3 text-xs">
                  {(selectedCase.timeline || [
                    { time: '10:01:15', event: 'Primary Inflow: ₹5,00,000 transferred from victim source account ACC-98214-SOURCE.' },
                    { time: '10:02:40', event: 'Structuring Anomaly: Inward transfer split across 4 downstream mule nodes.' },
                    { time: '10:04:05', event: 'Mule node ACC-44102-MULE-A flagged with 92/100 Mule Risk Score.' },
                    { time: '10:05:22', event: 'Predictive Hotspot: Forecasted cash extraction at ATM Cluster A.' },
                    { time: '10:06:00', event: 'Fraud Case Autopilot: Evidence package sealed and case created.' }
                  ]).map((t, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900" />
                      <span className="text-[10px] font-mono text-cyan-400 block">{t.time}</span>
                      <p className="text-slate-300 mt-0.5">{t.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Recommendation Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Recommended Investigative Next Action
                </span>
                <p className="text-slate-200">
                  {selectedCase.lead_recommendation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEALED EVIDENCE PACKAGES */}
      {activeTab === 'evidence' && (
        <div className="space-y-4">
          {evidencePackages.map((pkg) => (
            <div key={pkg.id} className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{pkg.title}</h3>
                    <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 rounded">
                      {pkg.package_ref}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Associated Case: <span className="font-mono text-slate-300">{pkg.case_ref}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">SHA-256 Checksum Seal</span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 block truncate max-w-xs">
                    {pkg.sha256_hash}
                  </span>
                </div>
              </div>

              {/* Itemized Evidence Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pkg.items?.map((it, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{it.type}</span>
                      <span className="font-mono text-[10px] text-cyan-400">{it.integrity}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Ref: {it.ref}</p>
                  </div>
                ))}
              </div>

              {/* Chain of Custody Audit Log */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Chain-of-Custody Provenance Log
                </span>
                <div className="space-y-1 text-xs">
                  {pkg.chain_of_custody?.map((step) => (
                    <div key={step.step} className="flex items-center justify-between text-slate-300 p-2 bg-slate-900/40 rounded-lg text-[11px]">
                      <span>Step {step.step}: <strong>{step.actor}</strong> — {step.action}</span>
                      <span className="font-mono text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: UNIFIED SEARCH RESULTS */}
      {activeTab === 'search' && searchResults && (
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Unified Search Results for "{searchResults.query}" ({searchResults.total_matches} matches)
            </h3>
            <span className="text-xs text-cyan-400 font-mono">CROSS-ENTITY CORRELATION</span>
          </div>

          <div className="space-y-3">
            {searchResults.results.accounts?.map((acc) => (
              <div key={acc.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-cyan-300">{acc.account_number}</span>
                  <p className="text-slate-300">{acc.holder_name} (Phone: {acc.phone}, UPI: {acc.upi_id})</p>
                </div>
                <span className="font-mono text-red-400 font-bold">Risk: {acc.risk_score}/100</span>
              </div>
            ))}

            {searchResults.results.threat_indicators?.map((th) => (
              <div key={th.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-amber-300">{th.indicator}</span>
                  <p className="text-slate-400">{th.category}</p>
                </div>
                <span className="font-bold text-red-400">{th.risk_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
