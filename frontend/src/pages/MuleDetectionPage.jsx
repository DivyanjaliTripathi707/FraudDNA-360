import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  ShieldAlert, 
  Zap, 
  UserCheck 
} from 'lucide-react';
import { detectionService } from '../services/api';

export default function MuleDetectionPage() {
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMule, setSelectedMule] = useState(null);
  const [evaluatingAcc, setEvaluatingAcc] = useState('1002');
  const [evalLoading, setEvalLoading] = useState(false);

  useEffect(() => {
    fetchMuleSuspects();
  }, []);

  const fetchMuleSuspects = async () => {
    try {
      setLoading(true);
      const res = await detectionService.getMuleSuspects();
      if (res.data) {
        setSuspects(res.data);
        if (res.data.length > 0) {
          setSelectedMule(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunEvaluation = async (accId) => {
    try {
      setEvalLoading(true);
      const res = await detectionService.evaluateMuleRisk({ accountId: accId || evaluatingAcc });
      if (res.success) {
        setSelectedMule(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEvalLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">MEDIUM</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              Layer 1: Mule Account Intelligence & Scoring
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              0–100 Behavioral Risk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing fan-in/fan-out ratios, rapid dispersal velocities, holding durations, and multi-hop routing patterns.
          </p>
        </div>

        {/* Quick Account Evaluation Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={evaluatingAcc}
            onChange={(e) => setEvaluatingAcc(e.target.value)}
            placeholder="Enter Account ID / Ref..."
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono w-44"
          />
          <button
            onClick={() => handleRunEvaluation(evaluatingAcc)}
            disabled={evalLoading}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 ${evalLoading ? 'animate-spin' : ''}`} />
            Evaluate Mule Risk
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspect Accounts Queue */}
        <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Mule Nodes ({suspects.length})</h2>
            <span className="text-[10px] text-red-400 font-mono">PRIORITY AUDIT</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Evaluating suspect nodes...</div>
          ) : (
            <div className="space-y-2.5">
              {suspects.map((mule) => (
                <div
                  key={mule.account_id}
                  onClick={() => setSelectedMule(mule)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMule?.account_id === mule.account_id
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-300">{mule.account_number}</span>
                    {getRiskBadge(mule.risk_level)}
                  </div>
                  <p className="text-xs font-semibold text-slate-200">{mule.holder_name}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Mule Risk Score:</span>
                    <span className="font-mono font-bold text-red-400">{mule.mule_risk_score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Mule Account Risk Scorecard */}
        <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedMule ? (
            <>
              {/* Account Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-100 font-mono">{selectedMule.account_number}</h3>
                    {getRiskBadge(selectedMule.risk_level)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Holder: <strong className="text-slate-200">{selectedMule.holder_name}</strong> | Status: <span className="text-amber-300 font-mono">{selectedMule.status}</span>
                  </p>
                </div>

                {/* Big Score Gauge */}
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
                  <div className="w-14 h-14 rounded-full border-4 border-red-500/80 flex items-center justify-center font-mono font-black text-lg text-red-400">
                    {selectedMule.mule_risk_score}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">MULE RISK SCORE</span>
                    <span className="text-xs text-slate-300 font-semibold">{selectedMule.risk_level} SEVERITY</span>
                  </div>
                </div>
              </div>

              {/* Key Behavioral Metrics */}
              {selectedMule.metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fan-In vs Fan-Out</span>
                    <p className="text-sm font-bold font-mono text-cyan-300 mt-1">
                      {selectedMule.metrics.fanIn} in → {selectedMule.metrics.fanOut} out
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Holding Time</span>
                    <p className="text-sm font-bold font-mono text-amber-400 mt-1">
                      {selectedMule.metrics.avgHoldingMinutes} mins
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Topology Tier</span>
                    <p className="text-sm font-bold text-purple-300 mt-1">
                      {selectedMule.metrics.hopTier}
                    </p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Structuring Flag</span>
                    <p className="text-sm font-bold text-red-400 mt-1">
                      {selectedMule.metrics.structuringDetected ? 'DETECTED' : 'CLEARED'}
                    </p>
                  </div>
                </div>
              )}

              {/* Itemized Reasons as strictly required by Master Prompt */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Why Was This Node Flagged? (Itemized Evidence Reasons)
                </h4>
                <div className="space-y-2">
                  {selectedMule.reasons?.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Operational Next Action */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl space-y-1 text-xs">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
                  Automated Recommendation
                </span>
                <p className="text-slate-300">
                  {selectedMule.recommended_action}
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">Select an account from the queue or evaluate an account identifier.</div>
          )}
        </div>
      </div>
    </div>
  );
}
