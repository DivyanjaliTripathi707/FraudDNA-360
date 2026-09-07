import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Search, 
  Share2, 
  BrainCircuit, 
  TrendingUp, 
  Bell, 
  FolderKanban, 
  ArrowRightLeft, 
  LogOut, 
  UserCheck, 
  MapPin, 
  Layers 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/detection', label: 'Early Detection', icon: Search },
  { path: '/network', label: 'Network Graph', icon: Share2 },
  { path: '/predictions', label: 'AI Predictions', icon: BrainCircuit },
  { path: '/risk', label: 'Dynamic Risk', icon: TrendingUp },
  { path: '/alerts', label: 'Alerts & Leads', icon: Bell },
  { path: '/investigations', label: 'Investigations', icon: FolderKanban },
  { path: '/transactions', label: 'Transactions Ledger', icon: ArrowRightLeft },
  { path: '/accounts', label: 'Accounts & Mules', icon: UserCheck },
  { path: '/locations', label: 'Locations & ATMs', icon: MapPin },
];

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('frauddna_token');
    localStorage.removeItem('frauddna_user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('frauddna_user') || '{"username": "Analyst", "role": "Senior Investigator"}');

  return (
    <div className="flex h-screen bg-[#0B0F17] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#131B29] border-r border-slate-800 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider text-cyan-400">FraudDNA 360</h1>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Proactive Intelligence</p>
            </div>
          </div>

          {/* Pipeline Badge */}
          <div className="mx-4 my-4 p-2.5 bg-slate-900/80 border border-cyan-500/20 rounded-lg text-xs font-mono text-cyan-300/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>5-Layer Active</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </div>

          {/* Navigation links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
                {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.username || 'Investigator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.role || 'Senior Investigator'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-[#131B29]/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-cyan-400/90 font-medium bg-cyan-950/50 border border-cyan-800/50 px-2.5 py-1 rounded">
              PIPELINE: PREVENT → CONNECT → PREDICT → EXPLAIN → RESPOND
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>MySQL Live Pool</span>
            </div>
            <div className="text-slate-400 font-mono">
              System Time: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B0F17]">
          {children}
        </main>
      </div>
    </div>
  );
}
