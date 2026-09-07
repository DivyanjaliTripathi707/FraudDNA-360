import React, { useState, useEffect } from 'react';
import { predictionService } from '../services/api';
import { BrainCircuit, MapPin, Clock, ShieldCheck, Sparkles, Layers, AlertTriangle } from 'lucide-react';

export default function PredictionsPage() {
  const [locationId, setLocationId] = useState('1');
  const [accountId, setAccountId] = useState('1002');
  const [prediction, setPrediction] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHotspots();
    runInitialPrediction();
  }, []);

  const fetchHotspots = async () => {
    try {
      const res = await predictionService.getHotspots();
      setHotspots(res.hotspots || []);
    } catch (err) {
      console.error(err);
    }
  };

  const runInitialPrediction = async () => {
    try {
      setLoading(true);
      const res = await predictionService.predict({ locationId: 1, accountId: 1002 });
      setPrediction(res);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await predictionService.predict({
        locationId: parseInt(locationId),
        accountId: parseInt(accountId)
      });
      setPrediction(res);
    } catch (err) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>AI Predictive Intelligence</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Spatio-Temporal ATM Cash-Out Prediction Engine</h1>
          <p className="text-xs text-slate-400">Forecast WHERE (ATM Cluster Hotspots) and WHEN (Time Window) cash extraction will occur before completion.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prediction Output Showcase */}
        <div className="lg:col-span-8 space-y-6">
          {prediction && (
            <div className="bg-[#131B29] border border-cyan-500/40 rounded-2xl p-6 relative overflow-hidden space-y-6 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>

              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                    <BrainCircuit className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-100">Live AI Forecast Output</h2>
                    <p className="text-xs font-mono text-slate-400">Ref: {prediction.predictionRef || 'PRED-2026-001'} | Model: {prediction.modelVersion}</p>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-3xl font-black font-mono text-emerald-400">{prediction.confidence}%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Prediction Confidence</span>
                </div>
              </div>

              {/* WHERE & WHEN Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WHERE */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>WHERE: LIKELY ATM HOTSPOT</span>
                  </div>
                  <p className="text-lg font-bold text-slate-100">{prediction.location}</p>
                  <p className="text-xs text-slate-400">High density cluster connected to primary mule transfers.</p>
                </div>

                {/* WHEN */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>WHEN: PROBABLE TIME WINDOW</span>
                  </div>
                  <p className="text-lg font-bold text-amber-400 font-mono">{prediction.timeWindow}</p>
                  <p className="text-xs text-slate-400">Peak evening cash withdrawal probability window.</p>
                </div>
              </div>

              {/* Contributing Intelligence Factors */}
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Model Feature Weighting Factors:</h3>
                <div className="space-y-2">
                  {prediction.factors?.map((factor, fIdx) => (
                    <div key={fIdx} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ML Prototype Transparency Disclaimer */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{prediction.disclaimer || 'Prototype prediction engine based on weighted historical feature signals.'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Config & Hotspots Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form */}
          <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Run Prediction Simulation</span>
            </h2>

            <form onSubmit={handlePredict} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Location ID</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="1">Location 1: ATM Cluster A - North Hub</option>
                  <option value="2">Location 2: Metro Station Plaza</option>
                  <option value="3">Location 3: Financial District South</option>
                  <option value="4">Location 4: Suburban Commercial Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Primary Mule Account ID</label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors"
              >
                {loading ? 'Computing Features...' : 'Execute Predictive Model'}
              </button>
            </form>
          </div>

          {/* Active Hotspots */}
          <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-200">High-Risk Location Hotspots</h3>
            <div className="space-y-2">
              {hotspots.map((h) => (
                <div key={h.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{h.name}</span>
                    <p className="text-[10px] text-slate-400">{h.city}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px] rounded">
                    {h.risk_score}/100 Risk
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
