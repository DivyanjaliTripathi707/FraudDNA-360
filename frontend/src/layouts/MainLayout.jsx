import React, { useState, useEffect } from 'react';
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
  Layers,
  GitFork,
  Activity,
  LifeBuoy,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('frauddna_user') || localStorage.getItem('frauddna_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!currentUser) {
      sessionStorage.clear();
      localStorage.clear();
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login');
  };

  // Dynamic Navigation filtered by Role
  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, roles: ['Investigator', 'Admin'] }
      ]
    },
    {
      title: 'CITIZEN PORTAL',
      items: [
        { path: '/scam-checker', label: 'Scam & URL Checker', icon: ShieldAlert, roles: ['Citizen', 'Investigator', 'Admin'], highlight: true },
        { path: '/file-complaint', label: 'File Cyber Crime Complaint', icon: FileText, roles: ['Citizen', 'Investigator', 'Admin'], highlight: true },
        { path: '/recovery', label: 'Digital Recovery Portal', icon: LifeBuoy, roles: ['Citizen', 'Investigator', 'Admin'], highlight: true }
      ]
    },
    {
      title: 'LAYER 1: PREVENT',
      items: [
        { path: '/detection', label: 'Early Detection (L1)', icon: Search, roles: ['Investigator', 'Admin'] },
        { path: '/mule-detection', label: 'Mule Risk Scorecard', icon: Activity, roles: ['Investigator', 'Admin'] }
      ]
    },
    {
      title: 'LAYER 2: CONNECT',
      items: [
        { path: '/network', label: 'Fraud Network Graph', icon: Share2, roles: ['Investigator', 'Admin'] },
        { path: '/money-flow', label: 'FlowScope Money Flow', icon: GitFork, roles: ['Investigator', 'Admin'], highlight: true }
      ]
    },
    {
      title: 'LAYER 3: PREDICT',
      items: [
        { path: '/predictions', label: 'Cash-Out Hotspots', icon: BrainCircuit, roles: ['Investigator', 'Admin'] }
      ]
    },
    {
      title: 'LAYER 4: EXPLAIN',
      items: [
        { path: '/risk', label: 'Risk Fusion Engine', icon: TrendingUp, roles: ['Investigator', 'Admin'] }
      ]
    },
    {
      title: 'LAYER 5: RESPOND',
      items: [
        { path: '/alerts', label: 'Alerts & Leads', icon: Bell, roles: ['Investigator', 'Admin'] },
        { path: '/investigations', label: 'Cases & Autopilot', icon: FolderKanban, roles: ['Investigator', 'Admin'] }
      ]
    },
    {
      title: 'REGISTRY LEDGERS',
      items: [
        { path: '/transactions', label: 'Transactions Ledger', icon: ArrowRightLeft, roles: ['Investigator', 'Admin'] },
        { path: '/accounts', label: 'Accounts & Mules', icon: UserCheck, roles: ['Investigator', 'Admin'] },
        { path: '/locations', label: 'Locations & ATMs', icon: MapPin, roles: ['Investigator', 'Admin'] }
      ]
    }
  ];

  if (!currentUser) return null;

  return (
    <div className="flex h-screen bg-[#070B12] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D1322] border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0 z-20">
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shadow-lg shadow-cyan-500/10">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FraudDNA 360</h1>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">v2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Proactive Cyber Defence</p>
            </div>
          </div>

          {/* Defense Engine Status Badge */}
          <div className="mx-3 my-3 px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono font-medium text-slate-300">Defense Engine Active</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">ONLINE</span>
          </div>

          {/* Role Status Tag */}
          <div className="mx-3 mb-3 px-2.5 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Active Role:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
              currentUser.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
              currentUser.role === 'Citizen' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}>
              {currentUser.role}
            </span>
          </div>

          {/* Navigation Sections */}
          <nav className="px-3 space-y-4 pb-4">
            {navSections.map((section, idx) => {
              const allowedItems = section.items.filter(it => it.roles.includes(currentUser.role));
              if (allowedItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </p>
                  {allowedItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm shadow-cyan-500/20'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        } ${item.highlight && !isActive ? 'border-l-2 border-l-cyan-400' : ''}`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Demo Switcher Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#080D18]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser.full_name || currentUser.username}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Control Bar with Simulation Disclaimer & Quick Role Switcher */}
        <header className="h-14 bg-[#0D1322] border-b border-slate-800/80 px-5 flex items-center justify-between gap-4 flex-shrink-0 z-10">
          {/* Left Header Badges */}
          <div className="flex items-center gap-3">
            {/* Simulation Disclaimer Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
              <span className="truncate">
                <strong className="font-semibold">DEMO SIMULATION:</strong> Bank actions & alerts are simulated.
              </span>
            </div>
          </div>

          {/* Interactive Header Controls */}
          <div className="flex items-center gap-3">
            {/* Privacy Mode Toggle */}
            <button
              onClick={() => setPrivacyMask(!privacyMask)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
              title="Toggle Privacy Data Masking"
            >
              {privacyMask ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="text-[11px] font-mono">{privacyMask ? 'PII MASKED' : 'FULL VIEW'}</span>
            </button>

            {/* Active Role Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-medium">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Role:</span>
              <span className={`font-extrabold text-[11px] px-2 py-0.5 rounded ${
                currentUser.role === 'Admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                currentUser.role === 'Citizen' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Page Body Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#070B12]">
          {children}
        </main>
      </div>
    </div>
  );
}
