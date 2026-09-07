import React, { useState, useEffect } from 'react';
import { riskService } from '../services/api';
import { 
  TrendingUp, 
  RefreshCw, 
  AlertCircle, 
  ShieldAlert, 
  Layers, 
  CheckCircle, 
  Sliders, 
  Cpu, 
  Share2, 
  ArrowRightLeft, 
  Activity, 
  Shield 
} from 'lucide-react';

export default function RiskPage() {
  const [entityId, setEntityId] = useState('1');
  const [entityType, setEntityType] = useState('LOCATION');
  const [riskData, setRiskData] = useState(null);
  const [recalculateResult, setRecalculateResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('fusion'); // 'fusion' | 'dynamic'

  // Risk Fusion Engine state
  const [fusionResult, setFusionResult] = useState(null);
  const [weights, setWeights] = useState({
    ai_score_weight: 0.25,
    graph_score_weight: 0.25,
    transaction_score_weight: 0.25,
    behavior_score_weight: 0.15,
    threat_intel_score_weight: 0.10
  });

  useEffect(() => {
    fetchRiskDetails();
    fetchRiskFusion();
  }, [entityId, entityType]);

  const fetchRiskDetails = async () => {
    try {
      setLoading(true);
      const res = await riskService.getRisk(entityId, entityType);
      setRiskData(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to fetch risk score');
    } finally {
      setLoading(false);
    }
  };

  const fetchRiskFusion = async () => {
    try {
      const res = await riskService.calculateRiskFusion({
        aiScore: 88,
        graphScore: 94,
        txScore: 89,
        behaviorScore: 85,
        threatIntelScore: 92
      });
      setFusionResult(res);
      if (res.weights_applied) {
        setWeights(res.weights_applied);
      }
    } catch (err) {
      console.error(err);
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
      fetchRiskFusion();
    } catch (err) {
      setError(err.message || 'Risk recalculation failed');
    } finally {
      setRecalculating(false);
    }
  };

  const handleWeightChange = async (key, val) => {
    const updated = { ...weights, [key]: parseFloat(val) };
    setWeights(updated);
    try {
      const res = await riskService.calculateRiskFusion({
        aiScore: 88,
        graphScore: 94,
        txScore: 89,
        behaviorScore: 85,
        threatIntelScore: 92
      });
      setFusionResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Layer 4: Risk Fusion Engine & Explainability
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Explainable AI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Combining multi-source components: AI Predictive, Graph Centrality, Transaction Structuring, Behavioral Churn, and Threat Intel.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs self-start">
          <button
            onClick={() => setActiveTab('fusion')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'fusion' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Multi-Model Risk Fusion
          </button>
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'dynamic' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dynamic Score Recalculator
          </button>
        </div>
      </div>

      {/* TAB 1: MULTI-MODEL RISK FUSION ENGINE */}
      {activeTab === 'fusion' && fusionResult && (
        <div className="space-y-6">
          {/* Top Verdict Card */}
          <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-[#0D1322] border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded border border-red-500/30">
                  {fusionResult.risk_level} SEVERITY
                </span>
                <span className="text-[10px] uppercase font-mono font-bold bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/30">
                  Data Confidence: {fusionResult.data_confidence} ({fusionResult.confidence_percent}%)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100">
                CRITICAL RISK — {fusionResult.final_risk_score}/100
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {fusionResult.summary_reason}
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex-shrink-0">
              <div className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center font-mono font-black text-2xl text-red-400">
                {fusionResult.final_risk_score}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">FUSED COMPOSITE</span>
                <span className="text-xs font-mono text-cyan-400">{fusionResult.model_version}</span>
              </div>
            </div>
          </div>

          {/* Component Score Breakdown & Interactive Weights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weight Configuration Sliders */}
            <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  Configurable Component Weights
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>AI Predictive Model:</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weights.ai_score_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={weights.ai_score_weight}
                    onChange={(e) => handleWeightChange('ai_score_weight', e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Graph Topology Centrality:</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weights.graph_score_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={weights.graph_score_weight}
                    onChange={(e) => handleWeightChange('graph_score_weight', e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Transaction Structuring:</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weights.transaction_score_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={weights.transaction_score_weight}
                    onChange={(e) => handleWeightChange('transaction_score_weight', e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Behavioral Churn Velocity:</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weights.behavior_score_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.40"
                    step="0.05"
                    value={weights.behavior_score_weight}
                    onChange={(e) => handleWeightChange('behavior_score_weight', e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Threat Intelligence Feed:</span>
                    <span className="font-mono font-bold text-cyan-400">{Math.round(weights.threat_intel_score_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.05"
                    value={weights.threat_intel_score_weight}
                    onChange={(e) => handleWeightChange('threat_intel_score_weight', e.target.value)}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Explainable Factor Cards as strictly required by Master Prompt */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                WHY WAS THIS FLAGGED? (EXPLAINABLE EVIDENCE BREAKDOWN)
              </h3>

              <div className="space-y-2.5">
                {fusionResult.explainable_cards?.map((card, idx) => (
                  <div key={idx} className="bg-[#0D1322] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        [{card.factor}]
                      </span>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-400">Weight: {card.weight}</span>
                        <span className="text-red-400 font-bold">{card.score}/100</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">{card.signal}</p>
                    <p className="text-[11px] text-slate-400">{card.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC RISK RECALCULATOR */}
      {activeTab === 'dynamic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recalculation Inputs</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Entity Type:</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="LOCATION">LOCATION (ATM Clusters)</option>
                  <option value="ACCOUNT">ACCOUNT (Mule Suspects)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Entity Identifier:</label>
                <input
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                >
                </input>
              </div>

              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
                <span>Simulate Dynamic Risk Event</span>
              </button>
            </div>
          </div>

          {/* Current Score Display */}
          <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
            {recalculateResult ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
                <span className="text-xs font-bold text-rose-400 uppercase">Score Shift Registered</span>
                <div className="flex items-center gap-4 text-slate-200">
                  <span className="text-lg font-mono">{recalculateResult.oldScore}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-2xl font-mono font-bold text-rose-400">{recalculateResult.newScore}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300">
                    +{recalculateResult.newScore - recalculateResult.oldScore} Elevated
                  </span>
                </div>
                <p className="text-xs text-slate-300">{recalculateResult.explanation}</p>
              </div>
            ) : riskData ? (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-100">{riskData.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold text-cyan-400">{riskData.currentScore}/100</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                    {riskData.riskLevel}
                  </span>
                </div>
                <p className="text-slate-400">{riskData.reasons}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
