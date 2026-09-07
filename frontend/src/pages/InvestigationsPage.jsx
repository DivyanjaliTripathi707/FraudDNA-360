import React, { useState, useEffect } from 'react';
import { responseService } from '../services/api';
import { FolderKanban, Plus, CheckCircle2, Clock, Edit3, Layers } from 'lucide-react';

export default function InvestigationsPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRecommendation, setNewRecommendation] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await responseService.getInvestigations();
      setCases(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await responseService.createInvestigation({
        title: newTitle,
        lead_recommendation: newRecommendation,
        notes: newNotes,
        priority: 'HIGH'
      });
      setShowModal(false);
      setNewTitle('');
      setNewRecommendation('');
      setNewNotes('');
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCase = async (id) => {
    try {
      await responseService.updateInvestigation(id, {
        notes: editNotes,
        status: editStatus
      });
      setSelectedCase(null);
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Case Management</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Investigator Case Tracker & Case Notes</h1>
          <p className="text-xs text-slate-400">Track active fraud case files, record investigator notes, and manage case statuses.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Create New Investigation Case
        </button>
      </div>

      {/* Case Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <div key={c.id} className="bg-[#131B29] border border-slate-800 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400">{c.case_ref}</span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${c.status === 'OPEN' ? 'bg-amber-500/20 text-amber-400' : c.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {c.status}
              </span>
            </div>

            <h3 className="text-xs font-bold text-slate-100">{c.title}</h3>
            
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 font-mono">
              <span className="text-slate-400 block text-[10px] uppercase">Lead Recommendation:</span>
              "{c.lead_recommendation}"
            </div>

            <div className="text-[11px] text-slate-400">
              <span className="block font-semibold text-slate-300">Investigator Notes:</span>
              <p className="mt-0.5 line-clamp-2">{c.notes || 'No notes added.'}</p>
            </div>

            <button
              onClick={() => {
                setSelectedCase(c);
                setEditNotes(c.notes || '');
                setEditStatus(c.status);
              }}
              className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              Update Case Notes / Status
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#131B29] border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Create Investigation Case</h2>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Case Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Lead Recommendation</label>
                <textarea
                  value={newRecommendation}
                  onChange={(e) => setNewRecommendation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 h-20"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Initial Investigator Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#131B29] border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-100">Update Case: {selectedCase.case_ref}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Investigator Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 h-24"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateCase(selectedCase.id)}
                  className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded"
                >
                  Update Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
