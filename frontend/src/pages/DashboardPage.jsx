import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/api';
import { 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Activity, 
  BrainCircuit, 
  ArrowUpRight, 
  Search, 
  Share2, 
  FolderKanban 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getSummary();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Syncing 5-layer intelligence feeds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs flex items-center justify-between">
        <span>{error}</span>
        <button onClick={fetchSummary} className="px-3 py-1 bg-rose-500/20 rounded hover:bg-rose-500/30">Retry</button>
      </div>
    );
  }

  const { kpis, charts, dynamicRiskShift, latestPredictions, recentAlerts } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>FraudDNA 360 Master Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time proactive fraud intelligence and investigative pipeline</p>
        </div>
        <button 
          onClick={fetchSummary} 
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono font-medium transition-colors"
        >
          Refresh Feed ↺
        </button>
      </div>

      {/* Dynamic Risk Score Shift Callout (58 -> 82) */}
      {dynamicRiskShift && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dynamic Risk Alert</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] rounded border border-rose-500/30">HIGH RISK SHIFT</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">{dynamicRiskShift.entity}</p>
              <p className="text-xs text-slate-300 mt-1">{dynamicRiskShift.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800 flex-shrink-0">
            <div className="text-center font-mono">
              <span className="text-[10px] text-slate-400 block">OLD SCORE</span>
              <span className="text-lg font-bold text-slate-400">{dynamicRiskShift.oldScore}</span>
            </div>
            <span className="text-slate-500 font-bold text-lg">→</span>
            <div className="text-center font-mono">
              <span className="text-[10px] text-rose-400 block font-bold">NEW SCORE</span>
              <span className="text-2xl font-black text-rose-400">{dynamicRiskShift.newScore}</span>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-1 rounded">
              {dynamicRiskShift.change}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Transactions</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2 font-mono">{kpis.totalTransactions.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-400 mt-1">Live monitoring active</p>
        </div>

        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Suspicious Activity</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2 font-mono">{kpis.suspiciousTransactions}</p>
          <p className="text-[11px] text-amber-400/80 mt-1">Structuring flagged</p>
        </div>

        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Mule Accounts</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2 font-mono">{kpis.activeMuleAccounts}</p>
          <p className="text-[11px] text-rose-400/80 mt-1">Network Graph linked</p>
        </div>

        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open Investigations</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2 font-mono">{kpis.openInvestigations}</p>
          <p className="text-[11px] text-cyan-400/80 mt-1">Response & Leads assigned</p>
        </div>
      </div>

      {/* 5-Layer Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Link to="/detection" className="bg-[#131B29] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">PREVENT</span>
            <Search className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">Early Detection</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Structuring & Splitting</p>
        </Link>

        <Link to="/network" className="bg-[#131B29] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">CONNECT</span>
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">Network Analysis</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Mule Graph Tracing</p>
        </Link>

        <Link to="/predictions" className="bg-[#131B29] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">PREDICT</span>
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">AI Predictions</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Where & When Forecast</p>
        </Link>

        <Link to="/risk" className="bg-[#131B29] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">EXPLAIN</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">Dynamic Risk</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Explainable Scoring</p>
        </Link>

        <Link to="/alerts" className="bg-[#131B29] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 p-3 rounded-xl transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold">RESPOND</span>
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xs font-bold text-slate-200">Response & Leads</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Investigation Alerts</p>
        </Link>
      </div>

      {/* Main Charts & Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Suspicious Transaction Trend */}
        <div className="lg:col-span-2 bg-[#131B29] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100">Suspicious Transaction Velocity Trend</h2>
              <p className="text-xs text-slate-400">Hourly volume comparing clean transfers vs structuring spikes</p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Structuring Spike @ 18:00
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.transactionTrend}>
                <defs>
                  <linearGradient id="suspiciousGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '12px' }} />
                <Area type="monotone" dataKey="suspicious" stroke="#EF4444" fillOpacity={1} fill="url(#suspiciousGrad)" name="Suspicious Transfers" />
                <Area type="monotone" dataKey="normal" stroke="#06B6D4" fillOpacity={1} fill="url(#normalGrad)" name="Standard Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-bold text-slate-100 mb-1">Entity Risk Distribution</h2>
          <p className="text-xs text-slate-400 mb-4">Accounts & locations grouped by risk score level</p>

          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.riskDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {charts.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#334155', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {charts.riskDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-slate-100 font-bold">{item.count} Entities</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Layer 3 Hotspot Prediction Card & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicted Hotspot Focus */}
        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">AI Hotspot Forecast</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
              91% Model Confidence
            </span>
          </div>

          {latestPredictions.length > 0 && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">PREDICTED LOCATION / WHERE</span>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{latestPredictions[0].atm_cluster}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">PROBABLE TIME WINDOW / WHEN</span>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">{latestPredictions[0].predicted_time_window}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2.5">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Key Contributing Intelligence Signals:</span>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Rapid structuring sequence detected (₹5,00,000 split across 4 sub-accounts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>Mule account historical cash-out behavior at physical ATM cluster</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Link to="/predictions" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
              Open Full AI Prediction Engine <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Priority Alerts List */}
        <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-slate-100">Active Investigation Alerts</h2>
            </div>
            <Link to="/alerts" className="text-xs text-slate-400 hover:text-slate-200">View All ({recentAlerts.length})</Link>
          </div>

          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="p-3 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-lg flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px] rounded">
                      {alert.priority}
                    </span>
                    <span className="text-xs font-bold text-slate-200">{alert.alert_ref}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-300 mt-1">{alert.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Location: {alert.location_name} | Window: {alert.predicted_time}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold font-mono text-rose-400">{alert.risk_score}/100</span>
                  <span className="block text-[10px] text-slate-400">Risk Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
