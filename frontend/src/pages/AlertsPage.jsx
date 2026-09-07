import React, { useState, useEffect } from 'react';
import { responseService } from '../services/api';
import { Bell, ShieldAlert, ArrowRight, Lightbulb, CheckCircle2, Layers } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await responseService.getAlerts();
      setAlerts(res.data || []);
      if (res.data && res.data.length > 0) {
        handleSelectAlert(res.data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load priority alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlert = async (alert) => {
    setSelectedAlert(alert);
    try {
      const res = await responseService.getLead(alert.id);
      setLeadDetails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Retrieving Priority Alert Queue...</span>
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
            <span>Investigation & Response</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Priority Investigation Alerts & Lead Generator</h1>
          <p className="text-xs text-slate-400">Actionable decision support outputs connecting all 5 intelligence layers into actionable lead recommendations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Alert List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Active Alert Queue ({alerts.length})</h2>
          {alerts.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => handleSelectAlert(alert)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-500/10'
                    : 'bg-[#131B29] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 font-mono font-bold text-[10px] rounded border border-rose-500/30">
                    {alert.priority} PRIORITY
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-400">{alert.risk_score}/100 Risk</span>
                </div>
                <h3 className="text-xs font-bold text-slate-100 mt-2">{alert.title}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Ref: {alert.alert_ref} | Hotspot: {alert.location_name}</p>
              </div>
            );
          })}
        </div>

        {/* Actionable Lead Detail Modal View */}
        <div className="lg:col-span-7">
          {leadDetails ? (
            <div className="bg-[#131B29] border border-cyan-500/40 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-1 bg-rose-500/20 text-rose-400 font-mono font-bold text-xs rounded border border-rose-500/30">
                    HIGH PRIORITY ALERT
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-2">{leadDetails.title}</h2>
                  <p className="text-xs text-slate-400">Alert Ref: {leadDetails.alertRef}</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-black text-rose-400">{leadDetails.riskScore}/100</span>
                  <span className="block text-[10px] text-slate-400">Risk Score ({leadDetails.confidence}% Conf)</span>
                </div>
              </div>

              {/* Spatio-temporal location window */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">LIKELY LOCATION</span>
                  <p className="text-sm font-bold text-cyan-400 mt-0.5">{leadDetails.location}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">LIKELY TIME WINDOW</span>
                  <p className="text-sm font-bold text-amber-400 mt-0.5">{leadDetails.predictedTime}</p>
                </div>
              </div>

              {/* Recommended Lead Card */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900 border border-cyan-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Lightbulb className="w-4 h-4" />
                  <span>RECOMMENDED INVESTIGATION LEAD</span>
                </div>
                <p className="text-xs text-slate-100 font-mono leading-relaxed">
                  "{leadDetails.recommendedLead}"
                </p>
              </div>

              {/* Action items checklist */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Investigator Action Checklist:</h3>
                <div className="space-y-1.5">
                  {leadDetails.actionItems?.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#131B29] border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Select an alert from the queue to view investigator leads.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
