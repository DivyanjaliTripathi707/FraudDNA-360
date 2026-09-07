import React, { useState, useEffect } from 'react';
import { dataService } from '../services/api';
import { ArrowRightLeft, Search, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSuspicious, setFilterSuspicious] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filterSuspicious]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await dataService.getTransactions(filterSuspicious);
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Transaction Audit Ledger</h1>
          <p className="text-xs text-slate-400">Complete immutable record of audited transaction streams and suspicious flags.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSuspicious(!filterSuspicious)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              filterSuspicious
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            {filterSuspicious ? 'Showing Flagged Only' : 'Show All Transactions'}
          </button>
        </div>
      </div>

      <div className="bg-[#131B29] border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
              <th className="p-3">Ref ID</th>
              <th className="p-3">Source Account</th>
              <th className="p-3">Target Account</th>
              <th className="p-3 text-right">Amount (₹)</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Audit Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                <td className="p-3 font-bold text-cyan-400">{t.transaction_ref}</td>
                <td className="p-3 text-slate-300">{t.source_acc || t.source_account_id}</td>
                <td className="p-3 text-slate-300">{t.target_acc || t.target_account_id}</td>
                <td className="p-3 text-right font-bold text-slate-100">₹{parseFloat(t.amount).toLocaleString()}</td>
                <td className="p-3 text-slate-400">{t.transaction_type}</td>
                <td className="p-3 text-emerald-400 font-bold">{t.status}</td>
                <td className="p-3">
                  {t.is_suspicious ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-[10px] font-bold border border-rose-500/30">
                      <AlertTriangle className="w-3 h-3" /> Structuring Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> Clean Pass
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
