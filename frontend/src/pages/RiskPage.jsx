import React, { useState, useEffect } from 'react';
import { riskService } from '../services/api';
import { TrendingUp, RefreshCw, AlertCircle, ShieldAlert, Layers, CheckCircle } from 'lucide-react';

export default function RiskPage() {
  const [entityId, setEntityId] = useState('1');
  const [entityType, setEntityType] = useState('LOCATION');
  const [riskData, setRiskData] = useState(null);
  const [recalculateResult, setRecalculateResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRiskDetails();
  }, [entityId, entityType]);

  const fetchRiskDetails = async () => {
    try {
      setLoading(true);
      const res = await riskService.getRisk(entityId, entityType);
      setRiskData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch risk score');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError('');
      const res = await riskService.recalculateRisk({
        entityId: parseInt(entityId),
        entityType,
        newComplaintId: 1,
        suspiciousTxnCount: 4
      });
      setRecalculateResult(res);
      fetchRiskDetails();
    } catch (err) {
      setError(err.message || 'Risk recalculation failed');
    } finally {
      setRecalculating(false);
    }
  };

  const getRiskBadge = (level) => {
    if (level === 'High') return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (level === 'Medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  };

  if (loading && !riskData) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Evaluating Multi-signal Dynamic Risk Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Dynamic Risk & Explainability</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Real-Time Risk Scoring & Explainability Engine</h1>
          <p className="text-xs text-slate-400">Risk scores update dynamically as new victim complaints, structuring alerts, and network signals arrive.</p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20"
        >
          <RefreshCw className={`w-4 h-4 ${recalculating ? 'animate-spin' : ''}`} />
          {recalculating ? 'Recalculating Risk...' : 'Trigger Dynamic Recalculation (58 → 82)'}
        </button>
      </div>

      {/* Dynamic Recalculation Shift Banner */}
      {recalculateResult && (
        <div className="p-4 bg-gradient-to-r from-rose-950/40 via-amber-950/40 to-slate-900 border border-rose-500/40 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>SCORE RECALCULATED IN REAL TIME</span>
            </div>
            <span className="font-mono text-xs text-slate-400">Confidence: {recalculateResult.confidenceScore}%</span>
          </div>

          <div className="flex items-center gap-4 py-2 border-y border-slate-800">
            <span className="text-xs text-slate-300">Score Shift:</span>
            <div className="flex items-center gap-2 font-mono font-bold">
              <span className="text-slate-400 text-base">{recalculateResult.oldScore}</span>
              <span className="text-slate-500">→</span>
              <span className="text-2xl text-rose-400">{recalculateResult.newScore}</span>
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-xs rounded ml-2">
                {recalculateResult.scoreShift}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 pt-1 font-mono">{recalculateResult.explanation}</p>
        </div>
      )}

      {/* Main Score Showcase */}
      {riskData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Card */}
          <div className="lg:col-span-8 bg-[#131B29] border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{riskData.entityType} ENTITY</span>
                <h2 className="text-lg font-bold text-slate-100">{riskData.name}</h2>
                <p className="text-xs text-slate-400">Data Quality: {riskData.dataQuality}</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-mono font-bold rounded-full border ${getRiskBadge(riskData.riskLevel)}`}>
                  {riskData.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* Score Big Display */}
            <div className="grid grid-cols-3 gap-4 text-center bg-slate-900/80 p-5 rounded-xl border border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">CURRENT RISK SCORE</span>
                <span className="text-4xl font-black font-mono text-rose-400">{riskData.currentScore}</span>
                <span className="text-[10px] text-slate-500 block">Out of 100</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">PREVIOUS SCORE</span>
                <span className="text-3xl font-bold font-mono text-slate-400 mt-1 block">{riskData.oldScore}</span>
                <span className="text-[10px] text-slate-500 block">Baseline</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">CONFIDENCE SCORE</span>
                <span className="text-3xl font-bold font-mono text-emerald-400 mt-1 block">{riskData.confidenceScore}%</span>
                <span className="text-[10px] text-slate-500 block">Multi-source</span>
              </div>
            </div>

            {/* Natural Language Explainability */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Natural Language Explainability Digest:</h3>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 leading-relaxed font-mono">
                "{riskData.reasons}"
              </div>
            </div>
          </div>

          {/* Scale & Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Standard Risk Scale Thresholds</h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-rose-400">70 — 100</span>
                  <span className="font-semibold text-rose-300">HIGH RISK</span>
                </div>
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-amber-400">40 — 69</span>
                  <span className="font-semibold text-amber-300">MEDIUM RISK</span>
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-emerald-400">0 — 39</span>
                  <span className="font-semibold text-emerald-300">LOW RISK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
