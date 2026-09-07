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
  FolderKanban,
  LifeBuoy,
  GitFork,
  Radio,
  FileText
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
        <span>Syncing 6-layer intelligence telemetry...</span>
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

  const { masterKpis, charts, dynamicRiskShift, latestPredictions, recentAlerts, openInvestigations, recoveryCases } = data;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              FraudDNA 360 Unified Command Center
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              6-LAYER CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactive cyber fraud defence, spatio-temporal predictions, FlowScope money-flow tracing, and digital recovery.
          </p>
        </div>
        <button 
          onClick={fetchSummary} 
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 self-start"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          Refresh Live Stream
        </button>
      </div>

      {/* Dynamic Risk Score Shift Callout (58 -> 88) */}
      {dynamicRiskShift && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 mt-0.5">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Dynamic Risk Fusion Alert</span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-mono font-bold text-[10px] rounded border border-rose-500/30">CRITICAL SHIFT</span>
              </div>
              <p className="text-sm font-bold text-slate-100 mt-1">{dynamicRiskShift.entity}</p>
              <p className="text-xs text-slate-300 mt-0.5">{dynamicRiskShift.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex-shrink-0">
            <div className="text-center font-mono">
              <span className="text-[10px] text-slate-400 block font-semibold">PREVIOUS</span>
              <span className="text-lg font-bold text-slate-400">{dynamicRiskShift.oldScore}</span>
            </div>
            <span className="text-slate-500 font-bold text-lg">→</span>
            <div className="text-center font-mono">
              <span className="text-[10px] text-rose-400 block font-bold">RECALCULATED</span>
              <span className="text-2xl font-black text-rose-400">{dynamicRiskShift.newScore}</span>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2 py-1 rounded">
              {dynamicRiskShift.change}
            </span>
          </div>
        </div>
      )}

      {/* Master KPI Cards Grid - The 6 Cards Required in Master Prompt */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. TOTAL RISK SIGNALS */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Risk Signals</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-300 mt-2 font-mono">
            {masterKpis?.totalRiskSignals || 12}
          </p>
          <span className="text-[10px] text-cyan-400/80 font-medium mt-1 block">Live telemetry feeds</span>
        </div>

        {/* 2. CRITICAL ALERTS */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Critical Alerts</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-400 mt-2 font-mono">
            {masterKpis?.criticalAlerts || 3}
          </p>
          <span className="text-[10px] text-red-400/80 font-medium mt-1 block">Requiring immediate action</span>
        </div>

        {/* 3. SUSPICIOUS NETWORKS */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Suspicious Networks</span>
            <Share2 className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2 font-mono">
            {masterKpis?.suspiciousNetworks || 3}
          </p>
          <span className="text-[10px] text-purple-400/80 font-medium mt-1 block">Coordinated syndicates</span>
        </div>

        {/* 4. HIGH-RISK MULE ACCOUNTS */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">High-Risk Mules</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">
            {masterKpis?.highRiskMuleAccounts || 4}
          </p>
          <span className="text-[10px] text-amber-400/80 font-medium mt-1 block">Avg Risk: 86/100</span>
        </div>

        {/* 5. ACTIVE CASES */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Active Cases</span>
            <FolderKanban className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            {masterKpis?.activeCases || 2}
          </p>
          <span className="text-[10px] text-emerald-400/80 font-medium mt-1 block">Autopilot assisted</span>
        </div>

        {/* 6. RECOVERY CASES */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Recovery Cases</span>
            <LifeBuoy className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 mt-2 font-mono">
            {masterKpis?.recoveryCases || 1}
          </p>
          <span className="text-[10px] text-cyan-400/80 font-medium mt-1 block">₹4.3L traceable funds</span>
        </div>
      </div>

      {/* Quick Launchpad to All 6 Layers */}
      <div className="p-4 bg-[#0D1322] border border-slate-800 rounded-2xl space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Integrated 6-Layer Lifecycle Navigation
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <Link to="/detection" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-semibold flex items-center justify-between">
            <span>L1: Detection</span>
            <Search className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link to="/money-flow" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-semibold flex items-center justify-between">
            <span>L2: FlowScope</span>
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link to="/predictions" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-semibold flex items-center justify-between">
            <span>L3: Predictions</span>
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link to="/risk" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-semibold flex items-center justify-between">
            <span>L4: Risk Fusion</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link to="/investigations" className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-semibold flex items-center justify-between">
            <span>L5: Autopilot</span>
            <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
          <Link to="/recovery" className="p-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-between shadow-sm shadow-cyan-500/10">
            <span>L6: Recovery</span>
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Volume & Anomaly Velocity */}
        <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transaction Volume & Anomaly Inflow
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Rapid structuring peak detected at 18:00 (₹5,00,000)</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Hourly Velocity</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.transactionTrend}>
                <defs>
                  <linearGradient id="suspiciousGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="suspicious" stroke="#EF4444" fillOpacity={1} fill="url(#suspiciousGrad)" name="Suspicious Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Risk Severity Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Entities categorized by multi-factor score</p>
          </div>
          <div className="h-44 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-around text-[11px] font-medium text-slate-300 border-t border-slate-800/80 pt-3">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Low</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400"></span> Critical</span>
          </div>
        </div>
      </div>

      {/* Recent Alerts & Recovery Queue Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts Queue */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Alerts Feed</h3>
            <Link to="/alerts" className="text-xs text-cyan-400 hover:underline">View All →</Link>
          </div>
          <div className="space-y-2">
            {recentAlerts?.map((alert) => (
              <div key={alert.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">{alert.alert_ref}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium mt-1">{alert.title}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-bold text-red-400 text-sm">{alert.risk_score}/100</span>
                  <span className="text-[10px] text-slate-500 block">Risk Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Recovery Cases Queue */}
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Recovery Requests</h3>
            <Link to="/recovery" className="text-xs text-cyan-400 hover:underline">Open Recovery Portal →</Link>
          </div>
          <div className="space-y-2">
            {recoveryCases?.map((rec) => (
              <div key={rec.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">{rec.recovery_ref}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {rec.recovery_status}
                    </span>
                  </div>
                  <p className="text-slate-200 font-medium mt-1">Victim: {rec.victim_name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-mono font-bold text-emerald-400 text-xs">₹{parseFloat(rec.recovered_amount).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 block">Secured / ₹{parseFloat(rec.traceable_amount).toLocaleString('en-IN')} Traceable</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
