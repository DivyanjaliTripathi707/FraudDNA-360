import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { ShieldAlert, Lock, User, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('Investigator');
  const [username, setUsername] = useState('admin_investigator');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'Citizen') {
      setUsername('citizen_user');
      setPassword('citizen123');
    } else if (role === 'Admin') {
      setUsername('chief_admin');
      setPassword('admin123');
    } else {
      setUsername('admin_investigator');
      setPassword('admin123');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login({ username, password });
      if (res.token) {
        localStorage.setItem('frauddna_token', res.token);
        localStorage.setItem('frauddna_user', JSON.stringify(res.user));

        // Role-based routing: Citizen lands on Scam & URL Checker, Investigators/Admins on Dashboard
        if (res.user.role === 'Citizen') {
          navigate('/scam-checker');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D1322] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 mb-2">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-wide">FraudDNA 360</h1>
          <p className="text-xs text-slate-400 mt-1">Proactive Fraud Intelligence & Citizen Safety Portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
            Select Portal Access
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('Citizen')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'Citizen'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 Citizen
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('Investigator')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'Investigator'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔍 Investigator
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('Admin')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                selectedRole === 'Admin'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👑 Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username / Security ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
              selectedRole === 'Citizen'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/20'
                : selectedRole === 'Admin'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {loading ? 'Authenticating...' : `Access ${selectedRole} Portal`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
          <span>Need a new account?</span>
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            Register New User
          </Link>
        </div>
      </div>
    </div>
  );
}
