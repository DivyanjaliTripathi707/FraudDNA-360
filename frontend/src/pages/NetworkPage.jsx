import React, { useState, useEffect } from 'react';
import { networkService } from '../services/api';
import { Share2, Search, Filter, ShieldAlert, Layers, ZoomIn, Info } from 'lucide-react';

export default function NetworkPage() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [traceResult, setTraceResult] = useState(null);
  const [searchAccountId, setSearchAccountId] = useState('1002');
  const [depth, setDepth] = useState('3');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGraph();
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

  const getNodeColor = (type, riskScore) => {
    if (type === 'MULE_ACCOUNT') return '#EF4444'; // Red
    if (type === 'VICTIM_ACCOUNT') return '#F59E0B'; // Amber
    if (type === 'ATM') return '#06B6D4'; // Cyan
    if (type === 'LOCATION') return '#8B5CF6'; // Purple
    return '#10B981'; // Green
  };

  if (loading && graph.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-mono text-xs gap-3">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Constructing Network & Graph Adjacency Matrix...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Network Graph Analysis</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Multi-Entity Mule Network Visualizer & Tracer</h1>
          <p className="text-xs text-slate-400">Map direct transfers, shared IP signatures, phone numbers, and physical ATM clusters.</p>
        </div>

        {/* Search & Trace Form */}
        <form onSubmit={handleTrace} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Account ID (e.g. 1002)"
              value={searchAccountId}
              onChange={(e) => setSearchAccountId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="1">1-Hop</option>
            <option value="2">2-Hop</option>
            <option value="3">3-Hop Depth</option>
          </select>
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Trace Network
          </button>
        </form>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph Display Canvas */}
        <div className="lg:col-span-8 bg-[#131B29] border border-slate-800 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2 z-10">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Mule Account
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Victim Source
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> ATM Node
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Location Cluster
              </span>
            </div>
            <button onClick={fetchGraph} className="text-xs text-slate-400 hover:text-slate-200">Reset View</button>
          </div>

          {/* SVG Interactive Canvas representation */}
          <div className="flex-1 relative flex items-center justify-center my-4">
            <svg className="w-full h-80 overflow-visible" viewBox="0 0 800 350">
              {/* Edges */}
              {graph.edges.map((edge, idx) => {
                // Approximate coordinate positions for visualization nodes
                const nodePositions = {
                  'ACC-1001': { x: 100, y: 175 },
                  'ACC-1002': { x: 280, y: 175 },
                  'ACC-1003': { x: 460, y: 80 },
                  'ACC-1004': { x: 460, y: 175 },
                  'ACC-1005': { x: 460, y: 270 },
                  'ACC-1006': { x: 350, y: 290 },
                  'ACC-1007': { x: 200, y: 60 },
                  'ATM-101': { x: 640, y: 80 },
                  'ATM-102': { x: 640, y: 175 },
                  'ATM-103': { x: 640, y: 270 },
                  'ATM-104': { x: 740, y: 60 },
                  'LOC-1': { x: 740, y: 175 },
                  'LOC-2': { x: 740, y: 270 },
                  'LOC-3': { x: 100, y: 60 },
                  'LOC-4': { x: 100, y: 290 }
                };

                const src = nodePositions[edge.source] || { x: 150 + (idx * 30), y: 100 };
                const tgt = nodePositions[edge.target] || { x: 250 + (idx * 30), y: 200 };

                return (
                  <g key={edge.id || idx}>
                    <line
                      x1={src.x}
                      y1={src.y}
                      x2={tgt.x}
                      y2={tgt.y}
                      stroke={edge.label === 'DIRECT_TRANSFER' ? '#06B6D4' : '#64748B'}
                      strokeWidth={edge.strength || 2}
                      strokeDasharray={edge.label === 'SHARED_IP' ? '4 4' : 'none'}
                      opacity={0.6}
                    />
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 5}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {graph.nodes.map((node, idx) => {
                const nodePositions = {
                  'ACC-1001': { x: 100, y: 175 },
                  'ACC-1002': { x: 280, y: 175 },
                  'ACC-1003': { x: 460, y: 80 },
                  'ACC-1004': { x: 460, y: 175 },
                  'ACC-1005': { x: 460, y: 270 },
                  'ACC-1006': { x: 350, y: 290 },
                  'ACC-1007': { x: 200, y: 60 },
                  'ATM-101': { x: 640, y: 80 },
                  'ATM-102': { x: 640, y: 175 },
                  'ATM-103': { x: 640, y: 270 },
                  'ATM-104': { x: 740, y: 60 },
                  'LOC-1': { x: 740, y: 175 },
                  'LOC-2': { x: 740, y: 270 },
                  'LOC-3': { x: 100, y: 60 },
                  'LOC-4': { x: 100, y: 290 }
                };

                const pos = nodePositions[node.id] || { x: 100 + (idx * 60) % 700, y: 100 + Math.floor(idx / 10) * 80 };
                const color = getNodeColor(node.type, node.riskScore);
                const isSelected = selectedNode?.id === node.id;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? 20 : 16}
                      fill={color}
                      fillOpacity={0.2}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all"
                    />
                    <circle cx={pos.x} cy={pos.y} r={6} fill={color} />
                    <text
                      x={pos.x}
                      y={pos.y + 28}
                      fill="#E2E8F0"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
            <span className="text-slate-400 font-mono">Nodes: {graph.nodes.length} | Edges: {graph.edges.length}</span>
            <span className="text-cyan-400 font-mono">Click any node to inspect details</span>
          </div>
        </div>

        {/* Node Inspector & Trace Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Node Inspector Card */}
          {selectedNode ? (
            <div className="bg-[#131B29] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{selectedNode.type} NODE</span>
                  <h3 className="text-sm font-bold text-slate-100">{selectedNode.label}</h3>
                  <p className="text-xs text-slate-400">{selectedNode.sublabel}</p>
                </div>
                <div className="text-right font-mono">
                  <span className={`text-xl font-bold ${selectedNode.riskScore >= 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedNode.riskScore}/100
                  </span>
                  <span className="block text-[10px] text-slate-400">Risk Score</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Account Status</span>
                  <span className="font-mono font-bold text-slate-200">{selectedNode.status}</span>
                </div>
                {selectedNode.balance !== undefined && (
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Current Balance</span>
                    <span className="font-mono font-bold text-cyan-400">₹{parseFloat(selectedNode.balance).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSearchAccountId(selectedNode.dbId || selectedNode.id.replace('ACC-', ''));
                  handleTrace();
                }}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold py-2 rounded text-xs border border-cyan-500/40 transition-colors"
              >
                Trace Connected Mule Network (3-Hop)
              </button>
            </div>
          ) : (
            <div className="bg-[#131B29] border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
              <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p>Select any graph node to inspect relationships.</p>
            </div>
          )}

          {/* Trace Results */}
          {traceResult && (
            <div className="bg-[#131B29] border border-cyan-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Network Trace Output</h3>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded">
                  {traceResult.suspectMules?.length || 0} Suspect Mules Found
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {traceResult.suspectMules?.map((mule) => (
                  <div key={mule.id} className="p-2 bg-slate-900 border border-rose-500/30 rounded flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-rose-300">{mule.label}</span>
                      <p className="text-[10px] text-slate-400">{mule.sublabel}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-rose-400">{mule.riskScore} Risk</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
