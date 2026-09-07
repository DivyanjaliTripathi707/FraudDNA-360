import React, { useState, useEffect } from 'react';
import { detectionService } from '../services/api';
import { Search, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Layers } from 'lucide-react';

export default function DetectionPage() {
  const [sourceAccountId, setSourceAccountId] = useState('1002');
  const [primaryAmount, setPrimaryAmount] = useState('500000');
  const [transfers, setTransfers] = useState([
    { targetAccountId: '1003', amount: '100000' },
    { targetAccountId: '1004', amount: '75000' },
    { targetAccountId: '1005', amount: '50000' },
    { targetAccountId: '1006', amount: '40000' }
  ]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suspiciousList, setSuspiciousList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSuspiciousFeed();
  }, []);

  const fetchSuspiciousFeed = async () => {
    try {
      const res = await detectionService.getSuspicious();
      setSuspiciousList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferChange = (index, field, value) => {
    const updated = [...transfers];
    updated[index][field] = value;
    setTransfers(updated);
  };

  const addTransferRow = () => {
    setTransfers([...transfers, { targetAccountId: `100${transfers.length + 3}`, amount: '30000' }]);
  };

  const removeTransferRow = (index) => {
    setTransfers(transfers.filter((_, i) => i !== index));
  };

  const runAnalysis = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await detectionService.analyzeTransaction({
        sourceAccountId: parseInt(sourceAccountId),
        primaryAmount: parseFloat(primaryAmount),
        transfers: transfers.map(t => ({ targetAccountId: parseInt(t.targetAccountId), amount: parseFloat(t.amount) }))
      });
      setAnalysisResult(res);
      fetchSuspiciousFeed();
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoStructuring = () => {
    setSourceAccountId('1002');
    setPrimaryAmount('500000');
    setTransfers([
      { targetAccountId: '1003', amount: '100000' },
      { targetAccountId: '1004', amount: '75000' },
      { targetAccountId: '1005', amount: '50000' },
      { targetAccountId: '1006', amount: '40000' }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Early Fraud Detection</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Transaction Structuring & Velocity Analyzer</h1>
          <p className="text-xs text-slate-400">Detect suspicious transaction behavior before funds propagate further across mule networks.</p>
        </div>
        <button
          onClick={loadDemoStructuring}
          className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load ₹5,00,000 Structuring Demo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Analyzer Form */}
        <div className="lg:col-span-7 bg-[#131B29] border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Simulate / Analyze Incoming Transaction Stream</span>
          </h2>

          <form onSubmit={runAnalysis} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Account ID</label>
                <input
                  type="text"
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Primary Deposit Amount (₹)</label>
                <input
                  type="number"
                  value={primaryAmount}
                  onChange={(e) => setPrimaryAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            {/* Split Transfers Sub-Form */}
            <div className="border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Outgoing Sequential Transfers (Splitting)</span>
                <button
                  type="button"
                  onClick={addTransferRow}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  + Add Recipient
                </button>
              </div>

              <div className="space-y-2">
                {transfers.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 w-4">{idx + 1}.</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Target Account ID"
                        value={t.targetAccountId}
                        onChange={(e) => handleTransferChange(idx, 'targetAccountId', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={t.amount}
                        onChange={(e) => handleTransferChange(idx, 'amount', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-amber-400"
                      />
                    </div>
                    {transfers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransferRow(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {loading ? 'Analyzing Behavior Patterns...' : 'Execute Early Detection Algorithm'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Output Result Card */}
        <div className="lg:col-span-5 space-y-4">
          {analysisResult ? (
            <div className={`border rounded-xl p-5 ${analysisResult.suspicious ? 'bg-rose-950/20 border-rose-500/40' : 'bg-emerald-950/20 border-emerald-500/40'}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  {analysisResult.suspicious ? (
                    <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                  <div>
                    <h3 className={`text-sm font-bold ${analysisResult.suspicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {analysisResult.suspicious ? 'SUSPICIOUS PATTERN DETECTED' : 'NORMAL TRANSACTION STREAM'}
                    </h3>
                    <p className="text-[10px] text-slate-400">Real-time Audit Output</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className={`text-2xl font-black ${analysisResult.suspicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {analysisResult.suspicionScore}/100
                  </span>
                  <span className="block text-[10px] text-slate-400">Suspicion Score</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-300 block mb-1">Detected Fraud Patterns:</span>
                  {analysisResult.detectedPatterns.length > 0 ? (
                    <div className="space-y-1.5">
                      {analysisResult.detectedPatterns.map((pattern, pIdx) => (
                        <div key={pIdx} className="p-2 bg-slate-900/80 border border-rose-500/20 rounded text-xs text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span>{pattern}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No anomalous structuring triggers detected.</p>
                  )}
                </div>

                <div className="pt-2 text-xs text-slate-400 border-t border-slate-800">
                  <p>Analyzed Amount: <span className="font-mono text-slate-200">₹{analysisResult.primaryAmount?.toLocaleString()}</span></p>
                  <p>Sequential Recipients: <span className="font-mono text-slate-200">{analysisResult.transfersAnalyzed} Accounts</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#131B29] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Run the analysis or click <span className="text-cyan-400 cursor-pointer underline" onClick={loadDemoStructuring}>Load ₹5,00,000 Structuring Demo</span> to evaluate early detection rules.</p>
            </div>
          )}

          {/* Flagged Feed */}
          <div className="bg-[#131B29] border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center justify-between">
              <span>Recently Flagged Structuring Feed</span>
              <span className="font-mono text-[10px] text-rose-400">{suspiciousList.length} Flagged</span>
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {suspiciousList.map((tx) => (
                <div key={tx.id} className="p-2.5 bg-slate-900/70 border border-slate-800 rounded text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-200">{tx.transaction_ref}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.suspicious_reasons || 'Structuring detected'}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-400">₹{parseFloat(tx.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
