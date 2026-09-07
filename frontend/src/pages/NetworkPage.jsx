import React, { useState, useEffect } from 'react';
import { networkService } from '../services/api';
import { 
  Share2, 
  Search, 
  Filter, 
  ShieldAlert, 
  Layers, 
  ZoomIn, 
  Info, 
  Link as LinkIcon, 
  GitMerge, 
  Activity, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function NetworkPage() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [traceResult, setTraceResult] = useState(null);
  const [networkImpact, setNetworkImpact] = useState(null);
  const [searchAccountId, setSearchAccountId] = useState('1002');
  const [depth, setDepth] = useState('3');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('graph'); // 'graph' | 'impact' | 'entities'

  // Entity Extraction & Linking state
  const [extractText, setExtractText] = useState('Victim stated caller used phone +91 91234 56780 and requested ₹5,00,000 transfer to UPI vikram.quick@paytm referencing ACC-44102-MULE-A from IP 182.72.10.45.');
  const [extractedEntities, setExtractedEntities] = useState(null);
  const [entityLinks, setEntityLinks] = useState([]);

  useEffect(() => {
    fetchGraph();
    fetchLinks();
  }, []);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await networkService.getFullGraph();
      setGraph(res);
      if (res.nodes && res.nodes.length > 0) {
        setSelectedNode(res.nodes[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch network graph');
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const res = await networkService.getEntityLinks();
      if (res.data) setEntityLinks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrace = async (e) => {
    if (e) e.preventDefault();
    if (!searchAccountId) return;
    try {
      setLoading(true);
      const trace = await networkService.traceNetwork(searchAccountId, depth);
      setTraceResult(trace);
      if (trace.rootAccount) {
        setSelectedNode(trace.rootAccount);
      }
    } catch (err) {
      setError(err.message || 'Trace failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchImpact = async () => {
    try {
      const res = await networkService.getNetworkImpact(searchAccountId);
      setNetworkImpact(res);
      setActiveTab('impact');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtractEntities = async () => {
    try {
      const res = await networkService.extractEntities({ text: extractText });
      setExtractedEntities(res);
    } catch (err) {
      console.error(err);
    }
  };

  const getNodeColor = (type, riskScore) => {
    if (type === 'MULE_ACCOUNT') return '#EF4444'; // Red
    if (type === 'VICTIM_ACCOUNT') return '#F59E0B'; // Amber
    if (type === 'FRAUD_HUB') return '#DC2626'; // Deep Red
    if (type === 'ATM') return '#06B6D4'; // Cyan
    if (type === 'LOCATION') return '#8B5CF6'; // Purple
    if (type === 'THREAT_URL' || type === 'THREAT_IP') return '#EC4899'; // Pink
    return '#10B981'; // Green
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <Share2 className="w-6 h-6 text-cyan-400" />
              Layer 2: Unified Fraud Intelligence Graph
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Connected Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing multi-entity topologies: Victims, Mules, Shared Devices, IPs, Threat URLs, and ATM Cluster Nodes.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs self-start">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'graph' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Graph
          </button>
          <button
            onClick={handleFetchImpact}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'impact' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Network Impact View
          </button>
          <button
            onClick={() => setActiveTab('entities')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'entities' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entity Resolution ({entityLinks.length})
          </button>
        </div>
      </div>

      {/* TAB 1: INTERACTIVE NETWORK GRAPH */}
      {activeTab === 'graph' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls & Search Sidebar */}
          <div className="lg:col-span-1 bg-[#0D1322] border border-slate-800 rounded-2xl p-5 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Hop Trace Controls</h2>

            <form onSubmit={handleTrace} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Target Account / Entity:</label>
                <input
                  type="text"
                  value={searchAccountId}
                  onChange={(e) => setSearchAccountId(e.target.value)}
                  placeholder="E.g. 1002"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Trace Depth (Hops):</label>
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="1">1 Hop (Direct Neighbors)</option>
                  <option value="2">2 Hops (Mule Secondary)</option>
                  <option value="3">3 Hops (Full Syndicate Cluster)</option>
                  <option value="4">4 Hops (Deep Infrastructure)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/10"
              >
                Execute Multi-Hop Trace
              </button>
            </form>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Entity Classification Legend</span>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Mule Suspect Account</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Victim Source Account</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Physical ATM Terminal</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>Hotspot Location Cluster</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Threat URL / Shared IP</span>
              </div>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] text-cyan-400 uppercase font-bold block">Selected Node Telemetry</span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200">{selectedNode.label}</span>
                    <span className="text-red-400 font-bold font-mono">{selectedNode.riskScore}/100</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{selectedNode.sublabel}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex justify-between">
                    <span>Type: {selectedNode.type}</span>
                    <span className="text-amber-300">{selectedNode.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SVG Canvas Visualizer */}
          <div className="lg:col-span-3 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Topology Canvas</h3>
                <span className="text-[10px] font-mono text-cyan-400">
                  {graph.nodes.length} Nodes • {graph.edges.length} Edges
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Interactive SVG Click-to-Inspect</span>
            </div>

            {/* Render Nodes as SVG */}
            <div className="w-full h-full my-auto flex items-center justify-center overflow-auto py-6">
              <svg width="100%" height="440" viewBox="0 0 800 440" className="mx-auto select-none">
                {/* Defs for gradients & markers */}
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                  </marker>
                </defs>

                {/* Draw Edges */}
                <g stroke="#334155" strokeWidth="1.5" strokeOpacity="0.8">
                  {/* Victim to Mule A */}
                  <line x1="120" y1="200" x2="320" y2="200" markerEnd="url(#arrow)" stroke="#F59E0B" strokeWidth="2.5" />
                  {/* Mule A to Mule B */}
                  <line x1="320" y1="200" x2="520" y2="100" markerEnd="url(#arrow)" stroke="#EF4444" strokeWidth="2" />
                  {/* Mule A to Mule C */}
                  <line x1="320" y1="200" x2="520" y2="200" markerEnd="url(#arrow)" stroke="#EF4444" strokeWidth="2" />
                  {/* Mule A to Mule D */}
                  <line x1="320" y1="200" x2="520" y2="300" markerEnd="url(#arrow)" stroke="#EF4444" strokeWidth="2" />
                  {/* Mule B to ATM 101 */}
                  <line x1="520" y1="100" x2="700" y2="100" markerEnd="url(#arrow)" stroke="#06B6D4" strokeDasharray="4" />
                  {/* Mule C to ATM 102 */}
                  <line x1="520" y1="200" x2="700" y2="200" markerEnd="url(#arrow)" stroke="#06B6D4" strokeDasharray="4" />
                  {/* Mule D to Shadow Hub */}
                  <line x1="520" y1="300" x2="700" y2="300" markerEnd="url(#arrow)" stroke="#DC2626" strokeWidth="2.5" />
                </g>

                {/* Edge Labels */}
                <text x="200" y="190" fill="#F59E0B" fontSize="10" textAnchor="middle" fontFamily="monospace">Direct ₹5L Inflow</text>
                <text x="410" y="140" fill="#EF4444" fontSize="9" textAnchor="middle" fontFamily="monospace">Split ₹1L</text>
                <text x="410" y="195" fill="#EF4444" fontSize="9" textAnchor="middle" fontFamily="monospace">Split ₹75K</text>
                <text x="410" y="260" fill="#EF4444" fontSize="9" textAnchor="middle" fontFamily="monospace">Split ₹50K</text>
                <text x="610" y="90" fill="#06B6D4" fontSize="9" textAnchor="middle" fontFamily="monospace">ATM Cash-Out</text>
                <text x="610" y="190" fill="#06B6D4" fontSize="9" textAnchor="middle" fontFamily="monospace">ATM Cash-Out</text>
                <text x="610" y="290" fill="#DC2626" fontSize="9" textAnchor="middle" fontFamily="monospace">Funnel to Hub</text>

                {/* Node 1: Victim Source */}
                <g 
                  onClick={() => setSelectedNode(graph.nodes.find(n => n.id === 'ACC-1001') || { label: 'ACC-98214-SOURCE', type: 'VICTIM_ACCOUNT', riskScore: 15, sublabel: 'Rajesh Sharma' })}
                  className="cursor-pointer"
                >
                  <circle cx="120" cy="200" r="24" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" />
                  <text x="120" y="204" fill="#F59E0B" fontSize="10" fontWeight="bold" textAnchor="middle">Victim</text>
                  <text x="120" y="240" fill="#94A3B8" fontSize="9" textAnchor="middle">ACC-98214</text>
                </g>

                {/* Node 2: Primary Mule A */}
                <g 
                  onClick={() => setSelectedNode(graph.nodes.find(n => n.id === 'ACC-1002') || { label: 'ACC-44102-MULE-A', type: 'MULE_ACCOUNT', riskScore: 92, sublabel: 'Vikram Mule' })}
                  className="cursor-pointer"
                >
                  <circle cx="320" cy="200" r="28" fill="#EF4444" fillOpacity="0.25" stroke="#EF4444" strokeWidth="3" />
                  <text x="320" y="204" fill="#EF4444" fontSize="11" fontWeight="bold" textAnchor="middle">Mule A</text>
                  <text x="320" y="245" fill="#EF4444" fontSize="9" fontWeight="bold" textAnchor="middle">Risk: 92/100</text>
                </g>

                {/* Node 3: Secondary Mule B */}
                <g 
                  onClick={() => setSelectedNode(graph.nodes.find(n => n.id === 'ACC-1003') || { label: 'ACC-44103-MULE-B', type: 'MULE_ACCOUNT', riskScore: 87, sublabel: 'Sanjay Mule' })}
                  className="cursor-pointer"
                >
                  <circle cx="520" cy="100" r="22" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
                  <text x="520" y="104" fill="#EF4444" fontSize="10" textAnchor="middle">Mule B</text>
                  <text x="520" y="135" fill="#94A3B8" fontSize="8" textAnchor="middle">₹1,00,000</text>
                </g>

                {/* Node 4: Secondary Mule C */}
                <g 
                  onClick={() => setSelectedNode(graph.nodes.find(n => n.id === 'ACC-1004') || { label: 'ACC-44104-MULE-C', type: 'MULE_ACCOUNT', riskScore: 82, sublabel: 'Anil Mule' })}
                  className="cursor-pointer"
                >
                  <circle cx="520" cy="200" r="22" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
                  <text x="520" y="204" fill="#EF4444" fontSize="10" textAnchor="middle">Mule C</text>
                  <text x="520" y="235" fill="#94A3B8" fontSize="8" textAnchor="middle">₹75,000</text>
                </g>

                {/* Node 5: Secondary Mule D */}
                <g 
                  onClick={() => setSelectedNode(graph.nodes.find(n => n.id === 'ACC-1005') || { label: 'ACC-44105-MULE-D', type: 'MULE_ACCOUNT', riskScore: 79, sublabel: 'Priya Mule' })}
                  className="cursor-pointer"
                >
                  <circle cx="520" cy="300" r="22" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
                  <text x="520" y="304" fill="#EF4444" fontSize="10" textAnchor="middle">Mule D</text>
                  <text x="520" y="335" fill="#94A3B8" fontSize="8" textAnchor="middle">₹50,000</text>
                </g>

                {/* Node 6: ATM 101 */}
                <g 
                  onClick={() => setSelectedNode({ label: 'ATM-MUM-101', type: 'ATM', riskScore: 85, sublabel: 'North Hub Express ATM 1' })}
                  className="cursor-pointer"
                >
                  <circle cx="700" cy="100" r="22" fill="#06B6D4" fillOpacity="0.2" stroke="#06B6D4" strokeWidth="2" />
                  <text x="700" y="104" fill="#06B6D4" fontSize="10" textAnchor="middle">ATM 1</text>
                  <text x="700" y="135" fill="#06B6D4" fontSize="8" textAnchor="middle">Hotspot A</text>
                </g>

                {/* Node 7: ATM 102 */}
                <g 
                  onClick={() => setSelectedNode({ label: 'ATM-MUM-102', type: 'ATM', riskScore: 85, sublabel: 'North Hub Express ATM 2' })}
                  className="cursor-pointer"
                >
                  <circle cx="700" cy="200" r="22" fill="#06B6D4" fillOpacity="0.2" stroke="#06B6D4" strokeWidth="2" />
                  <text x="700" y="204" fill="#06B6D4" fontSize="10" textAnchor="middle">ATM 2</text>
                  <text x="700" y="235" fill="#06B6D4" fontSize="8" textAnchor="middle">Hotspot A</text>
                </g>

                {/* Node 8: Shadow Hub */}
                <g 
                  onClick={() => setSelectedNode({ label: 'ACC-77401-HUB', type: 'FRAUD_HUB', riskScore: 98, sublabel: 'Central Shadow Aggregator Hub' })}
                  className="cursor-pointer"
                >
                  <circle cx="700" cy="300" r="24" fill="#DC2626" fillOpacity="0.3" stroke="#DC2626" strokeWidth="2.5" />
                  <text x="700" y="304" fill="#F87171" fontSize="10" fontWeight="bold" textAnchor="middle">HUB</text>
                  <text x="700" y="335" fill="#DC2626" fontSize="8" textAnchor="middle">Shadow Hub</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FRAUD NETWORK IMPACT VIEW */}
      {activeTab === 'impact' && (
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              Network Impact Intelligence
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-2">
              Beyond Isolated Alerts: Total Fraud Network Impact
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Shows systemic collateral impact across connected accounts, victims, physical ATMs, and threat infrastructure.
            </p>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">1 Suspicious Node</span>
              <p className="text-xl font-bold font-mono text-cyan-300 mt-1">ACC-44102-MULE-A</p>
              <span className="text-[10px] text-slate-500">Primary Concentrator</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Connected Entities</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">8 Entities</p>
              <span className="text-[10px] text-slate-500">4 Mules + 2 ATMs + 2 URLs</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Dispersed Capital</span>
              <p className="text-xl font-bold font-mono text-purple-400 mt-1">₹8,65,000</p>
              <span className="text-[10px] text-slate-500">Across 8 Transactions</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cash-Out Risk</span>
              <p className="text-xl font-bold text-red-400 mt-1">CRITICAL</p>
              <span className="text-[10px] text-red-300 font-mono">18:00 - 21:00 Window</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-2">
            <h4 className="font-bold text-slate-200">Associated Syndicate Campaign</h4>
            <p className="text-slate-300 leading-relaxed">
              <strong>PowerGrid Utility Bill Disconnection Phishing Ring:</strong> Targets retail citizens with urgent disconnection SMS, funneling unauthorized transfers into Layer 1 mule ACC-44102-MULE-A, which immediately redistributes funds to secondary cashiers at ATM Cluster A.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ENTITY RESOLUTION & LINKING */}
      {activeTab === 'entities' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entity Extractor */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-cyan-400" />
              Automated Entity Extraction
            </h3>
            <p className="text-xs text-slate-400">
              Paste complaint text or scam narrative to automatically isolate phones, UPI handles, account numbers, and IP addresses.
            </p>

            <textarea
              value={extractText}
              onChange={(e) => setExtractText(e.target.value)}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleExtractEntities}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Extract & Link Entities
            </button>

            {extractedEntities && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-cyan-400 uppercase block">Extracted Entities:</span>
                <div className="space-y-1 text-slate-300">
                  <p>Phones: <span className="font-mono text-cyan-300">{extractedEntities.phones?.join(', ') || 'None'}</span></p>
                  <p>UPI IDs: <span className="font-mono text-cyan-300">{extractedEntities.upis?.join(', ') || 'None'}</span></p>
                  <p>Accounts: <span className="font-mono text-cyan-300">{extractedEntities.accounts?.join(', ') || 'None'}</span></p>
                  <p>IPs: <span className="font-mono text-cyan-300">{extractedEntities.ips?.join(', ') || 'None'}</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Stored Entity Links & Match Confidence */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-cyan-400" />
              Entity Linking & Deduplication
            </h3>
            <p className="text-xs text-slate-400">
              Confidence-scored identity resolution across formatting variants. Uncertain matches are flagged for human review.
            </p>

            <div className="space-y-2.5">
              {entityLinks.map((link) => (
                <div key={link.id} className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-200">{link.source_entity} ↔ {link.target_entity}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                      Match: {link.match_confidence}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Method: {link.match_method}</span>
                    <span className="text-amber-300">{link.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
