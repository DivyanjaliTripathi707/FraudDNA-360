import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin } from 'lucide-react';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/prediction/hotspots');
      setLocations(res.hotspots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100">Locations & ATM Hotspot Clusters</h1>
        <p className="text-xs text-slate-400 font-mono">Geographic region risk monitoring and physical ATM node registry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-[#131B29] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase">{loc.city}</span>
            </div>

            <h3 className="text-sm font-bold text-slate-100">{loc.name}</h3>
            <p className="text-xs text-slate-400">{loc.region}</p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Risk Score:</span>
              <span className="font-bold text-rose-400">{loc.risk_score}/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
