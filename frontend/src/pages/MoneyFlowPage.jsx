import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  ArrowRight, 
  Clock, 
  AlertOctagon, 
  Building2, 
  UserX, 
  RefreshCw, 
  ShieldAlert, 
  DollarSign, 
  Layers,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { networkService } from '../services/api';

export default function MoneyFlowPage() {
  const [moneyFlow, setMoneyFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    fetchMoneyFlow();
  }, []);

  const fetchMoneyFlow = async () => {
    try {
      setLoading(true);
      const res = await networkService.getMoneyFlow(1001);
      setMoneyFlow(res);
      if (res.paths && res.paths.length > 0) {
        setSelectedPath(res.paths[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'VICTIM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">VICTIM</span>;
      case 'PRIMARY_MULE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">LAYER 1 MULE</span>;
      case 'SECONDARY_MULE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">LAYER 2 MULE</span>;
      case 'CASH_OUT_ATM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">HOTSPOT ATM</span>;
      case 'FRAUD_HUB':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/30 text-red-200 border border-red-500/40">SHADOW HUB</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">NODE</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <GitFork className="w-6 h-6 text-cyan-400" />
              Layer 2: FlowScope Multi-Hop Money Flow Tracing
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              End-to-End Tracing
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing complete money-flow topologies: from victim deposit through multi-tier mule splitters to physical ATM cash-outs.
          </p>
        </div>

        <button
          onClick={fetchMoneyFlow}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Flow Graph
        </button>
      </div>

      {/* Metric Cards Summary */}
      {moneyFlow && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Stolen Inflow</span>
            <p className="text-xl font-black text-red-400 mt-1">₹{moneyFlow.total_flow_amount?.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">From Source Account</span>
          </div>

          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Traceable In Network</span>
            <p className="text-xl font-black text-cyan-400 mt-1">₹{moneyFlow.traceable_in_network?.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Subject to Simulated Lien</span>
          </div>

          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cash Extracted (ATM)</span>
            <p className="text-xl font-black text-purple-400 mt-1">₹{moneyFlow.cash_extracted_atm?.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-purple-300 mt-1 block">ATM Clusters 101 & 102</span>
          </div>

          <div className="bg-[#0D1322] border border-slate-800 rounded-xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average Hop Velocity</span>
            <p className="text-xl font-black text-amber-400 mt-1">{moneyFlow.velocity_summary?.avg_hop_interval_minutes} mins</p>
            <span className="text-[10px] text-amber-300 mt-1 block">Fast Rapid Churn</span>
          </div>
        </div>
      )}

      {/* Main FlowScope Interactive Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paths List */}
        <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Traced Flow Paths ({moneyFlow?.paths?.length || 0})</h2>
            <span className="text-[10px] text-cyan-400 font-mono">FLOWSCOPE ENGINE</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-slate-500">Computing graph money flow...</div>
          ) : (
            <div className="space-y-2.5">
              {moneyFlow?.paths?.map((path) => (
                <div
                  key={path.pathId}
                  onClick={() => setSelectedPath(path)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPath?.pathId === path.pathId
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-cyan-300">{path.pathId}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {path.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{path.title}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Dispersed Volume:</span>
                    <span className="font-mono font-bold text-slate-100">₹{path.totalDispersed.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Circular Flow Alert Box */}
          {moneyFlow?.circularFlowsDetected && moneyFlow.circularFlowsDetected.length > 0 && (
            <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                Circular Flow / Rebound Detected
              </div>
              <p className="text-slate-300 text-[11px]">
                Micro-amount test rebound detected between <span className="font-mono text-cyan-300">ACC-1002</span> and <span className="font-mono text-cyan-300">ACC-1003</span> prior to primary split.
              </p>
            </div>
          )}
        </div>

        {/* Selected Path Visual Chain */}
        <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedPath ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">{selectedPath.title}</h3>
                    <span className="font-mono text-xs text-cyan-400">({selectedPath.pathId})</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Multi-hop chain tracing capital disbursement from origin to terminus endpoint.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Dispersed Capital</span>
                  <span className="text-lg font-mono font-bold text-red-400">₹{selectedPath.totalDispersed.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Hop Step-by-Step Horizontal / Vertical Visualizer */}
              <div className="space-y-4">
                {selectedPath.stages.map((stage, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Hop Index Marker */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 shadow-md">
                        {stage.hop}
                      </div>
                      {idx < selectedPath.stages.length - 1 && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-500/40 to-slate-700 my-1" />
                      )}
                    </div>

                    {/* Hop Content Card */}
                    <div className="flex-1 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{stage.tier}</span>
                          {getRoleBadge(stage.role)}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-mono text-slate-400">{stage.timeOffset}</span>
                          <span className="font-mono font-bold text-red-400">₹{stage.amount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-cyan-300">{stage.entity}</span>
                        {stage.holdingDuration && (
                          <span className="text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Holding: {stage.holdingDuration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Recommendation */}
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs space-y-1">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px] block">
                  Automated Investigator Advisory
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {moneyFlow?.recommended_response}
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">Select a flow path to inspect multi-hop nodes.</div>
          )}
        </div>
      </div>
    </div>
  );
}
