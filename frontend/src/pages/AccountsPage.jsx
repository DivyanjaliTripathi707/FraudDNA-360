import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/network/graph');
      // Filter account nodes
      setAccounts(res.nodes?.filter(n => n.type === 'ACCOUNT' || n.type === 'MULE_ACCOUNT' || n.type === 'VICTIM_ACCOUNT') || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Accounts & Mule Registry</h1>
        <p className="text-xs text-slate-400 font-mono">Monitored account entities and suspect mule node registry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-[#131B29] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">{acc.label}</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${acc.type === 'MULE_ACCOUNT' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {acc.type}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-200">{acc.sublabel}</p>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Risk Score:</span>
              <span className="font-mono font-bold text-rose-400">{acc.riskScore}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
