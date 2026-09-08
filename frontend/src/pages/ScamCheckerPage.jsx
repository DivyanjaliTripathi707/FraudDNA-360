import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  MessageSquareWarning, 
  Mic, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Zap, 
  HelpCircle,
  ExternalLink,
  PhoneCall,
  Lock,
  ArrowRight
} from 'lucide-react';
import { threatIntelService } from '../services/api';
import { Link } from 'react-router-dom';

export default function ScamCheckerPage() {
  const [activeTab, setActiveTab] = useState('sos'); // 'sos' | 'url' | 'text' | 'voice' | 'family'
  
  // URL Scanner State
  const [urlInput, setUrlInput] = useState('http://electricity-bill-pay-urgent.online');
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);

  // Scam Message State
  const [textInput, setTextInput] = useState('URGENT NOTICE: Your electricity will be disconnected tonight by 9:30 PM due to unpaid bill. Call officer immediately at 9123456780 and share the verification OTP.');
  const [textResult, setTextResult] = useState(null);
  const [textLoading, setTextLoading] = useState(false);

  // Voice Demo State
  const [voiceResult, setVoiceResult] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Family Alert State
  const [familySent, setFamilySent] = useState(null);

  const handleScanUrl = async (sample) => {
    try {
      setUrlLoading(true);
      const res = await threatIntelService.analyzeUrl({ url: sample || urlInput });
      setUrlResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setUrlLoading(false);
    }
  };

  const handleAnalyzeText = async (sample) => {
    try {
      setTextLoading(true);
      const res = await threatIntelService.analyzeScamText({ text: sample || textInput });
      setTextResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTextLoading(false);
    }
  };

  const handleVoiceDemo = async () => {
    try {
      setVoiceLoading(true);
      const res = await threatIntelService.analyzeVoiceDemo({ syntheticIndicators: true });
      setVoiceResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleSendFamilyAlert = async () => {
    try {
      const res = await threatIntelService.sendFamilyAlert({
        citizenName: 'Rajesh Sharma',
        trustedContactName: 'Pooja Sharma (Daughter)',
        trustedContactPhone: '+91 98214 XXXXX',
        alertReason: 'Potential Phishing URL Link Clicked'
      });
      setFamilySent(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              Citizen Safety & Victim Protection Portal
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Citizen Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital self-defence: verify suspicious messages, phishing URLs, and simulated voice calls before transferring money.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('sos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'sos' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 animate-pulse' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚠️ EMERGENCY SOS
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'url' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            URL Checker
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'text' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scam Message Analyzer
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'voice' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Deepfake Voice Demo
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'family' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Family Safety Alert
          </button>
        </div>
      </div>

      {/* TAB 1: EMERGENCY SOS (I THINK I AM BEING SCAMMED) */}
      {activeTab === 'sos' && (
        <div className="bg-gradient-to-br from-red-950/40 via-slate-900 to-[#0D1322] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-red-500/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-400 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-red-300">
                ⚠️ I THINK I AM BEING SCAMMED
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Immediate protocol to prevent financial loss. Do not panic — execute these steps in order right now:
              </p>
            </div>
          </div>

          {/* 5 Protective Steps as requested by Master Prompt */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">1</div>
              <h4 className="text-xs font-bold text-slate-100">STOP ALL TRANSFERS</h4>
              <p className="text-[11px] text-slate-400">Do not send money, UPI payments, or approve any QR code scanning requests.</p>
            </div>

            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">2</div>
              <h4 className="text-xs font-bold text-slate-100">NEVER SHARE OTP</h4>
              <p className="text-[11px] text-slate-400">Never read out OTP, PIN, or CVV. No official authority will ever ask for phone verification codes.</p>
            </div>

            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">3</div>
              <h4 className="text-xs font-bold text-slate-100">VERIFY INDEPENDENTLY</h4>
              <p className="text-[11px] text-slate-400">Hang up immediately. Call your bank using the trusted phone number printed on the back of your debit card.</p>
            </div>

            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">4</div>
              <h4 className="text-xs font-bold text-slate-100">PRESERVE EVIDENCE</h4>
              <p className="text-[11px] text-slate-400">Take screenshots of transaction SMS, caller numbers, UPI handles, and payment receipts.</p>
            </div>

            <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-xs flex items-center justify-center">5</div>
              <h4 className="text-xs font-bold text-slate-100">START DIGITAL REPORT</h4>
              <p className="text-[11px] text-slate-400">Trigger immediate digital dispute tracking to initiate autonomous fund tracing.</p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-red-500/20">
            <span className="text-xs text-slate-300">
              Has money already been deducted or scam details received?
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/file-complaint"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>⚡ File Cybercrime Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/recovery"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow-lg shadow-red-500/30 transition-all"
              >
                <span>Launch Recovery Dispute</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUSPICIOUS URL SCANNER */}
      {activeTab === 'url' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Phishing & Look-Alike Domain Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Heuristic threat analysis: scans for typosquatting, credential harvesting keywords, and suspicious TLDs without visiting or attacking websites.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Suspicious URL to Analyze:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleScanUrl()}
                  disabled={urlLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Search className={`w-3.5 h-3.5 ${urlLoading ? 'animate-spin' : ''}`} />
                  Scan URL
                </button>
              </div>
            </div>

            {/* Quick Demo Samples */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1.5">Load Demo Phishing Samples:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setUrlInput('http://sbi-kyc-update-portal.security-verification.xyz'); handleScanUrl('http://sbi-kyc-update-portal.security-verification.xyz'); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-mono"
                >
                  sbi-kyc-update-portal.xyz
                </button>
                <button
                  onClick={() => { setUrlInput('http://electricity-bill-pay-urgent.online'); handleScanUrl('http://electricity-bill-pay-urgent.online'); }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-mono"
                >
                  electricity-bill-pay-urgent.online
                </button>
              </div>
            </div>

            {/* Result Card */}
            {urlResult && (
              <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Threat Verdict</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    urlResult.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    urlResult.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {urlResult.risk_level} (Score: {urlResult.risk_score}/100)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Detection Reasons:</span>
                  {urlResult.reasons?.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                  <strong>Safety Advice:</strong> {urlResult.safety_recommendation}
                </div>
              </div>
            )}
          </div>

          {/* Side Advice */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400">
            <h3 className="text-sm font-bold text-slate-200">Phishing Safety Checklist</h3>
            <p>1. Check the domain carefully: Look for extra hyphens, suspicious extensions (.xyz, .top, .online) instead of official institutional domains (.bank.in, .gov.in).</p>
            <p>2. FraudDNA 360 only classifies and provides defensive alerts. We never interact or exploit external infrastructure.</p>
          </div>
        </div>
      )}

      {/* TAB 3: SCAM MESSAGE TEXT ANALYZER */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-cyan-400" />
              Scam Conversation & SMS Classifier
            </h2>
            <p className="text-xs text-slate-400">
              Evaluates psychological manipulation, artificial deadlines, fake law enforcement threats, and OTP solicitation.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Paste Message / Call Transcript:</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => {
                    const sample = 'DEAR CUSTOMER: Your electricity will be disconnected today at 9:30 PM because bill was not updated. Please immediately call officer Verma at 9123456780.';
                    setTextInput(sample);
                    handleAnalyzeText(sample);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Load PowerGrid Scam SMS Sample
                </button>
                <button
                  onClick={() => handleAnalyzeText()}
                  disabled={textLoading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5"
                >
                  <Search className={`w-3.5 h-3.5 ${textLoading ? 'animate-spin' : ''}`} />
                  Analyze Scam Risk
                </button>
              </div>
            </div>

            {/* Text Analysis Result */}
            {textResult && (
              <div className="mt-4 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Scam Probability</span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    textResult.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    textResult.risk_level === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {textResult.risk_level} ({textResult.scam_risk_score}/100)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Triggers Detected:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {textResult.detected_triggers?.map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                  <strong>Safety Advice:</strong> {textResult.safety_recommendation}
                </div>
              </div>
            )}
          </div>

          {/* Guide */}
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-3 text-xs text-slate-400">
            <h3 className="text-sm font-bold text-slate-200">Red Flags in Scam Messages</h3>
            <p>• Artificial Deadlines: "Within 2 hours", "Tonight by 9 PM"</p>
            <p>• Threat of Service Loss: Electricity disconnection, SIM card block, bank freeze</p>
            <p>• Request to call an unknown mobile number instead of standard 1800 toll-free numbers</p>
          </div>
        </div>
      )}

      {/* TAB 4: DEEPFAKE / AI VOICE SCAM DEMO */}
      {activeTab === 'voice' && (
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
              Safe Consent-Based Feature Demo
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-400" />
              AI Voice & Audio Impersonation Detector (Demo)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulated audio forensic classifier: analyzes acoustic spectral consistency and synthesized breath patterns.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-200">Demo Sample: Emergency Impersonation Call</p>
              <p className="text-[11px] text-slate-400">Caller claiming to be police officer demanding emergency bond payment.</p>
            </div>
            <button
              onClick={handleVoiceDemo}
              disabled={voiceLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs transition-all flex items-center gap-2 shadow"
            >
              <Zap className={`w-3.5 h-3.5 ${voiceLoading ? 'animate-spin' : ''}`} />
              Run Voice Forensics Demo
            </button>
          </div>

          {voiceResult && (
            <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200">Acoustic Analysis Result</span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                  {voiceResult.risk_level} RISK ({voiceResult.impersonation_probability}% Synthesized)
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Forensic Spectral Indicators:</span>
                {voiceResult.reasons?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300">
                {voiceResult.recommendation}
              </div>

              <p className="text-[10px] text-slate-500 font-mono">
                {voiceResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: FAMILY SAFETY ALERT */}
      {activeTab === 'family' && (
        <div className="bg-[#0D1322] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              Opt-In Family Protection
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Family Safety Alert (Simulated Notification)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Allows citizens to designate trusted family contacts to receive simulated alerts if an elder family member encounters an active scam lure.
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Designated Trusted Contact:</span>
              <span className="font-semibold text-slate-200">Pooja Sharma (Daughter)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Contact Number:</span>
              <span className="font-mono text-cyan-300">+91 98214 55102</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Alert Trigger Rule:</span>
              <span className="text-amber-400 font-medium">Critical Scam Lure or Flagged Phishing Transfer</span>
            </div>

            <button
              onClick={handleSendFamilyAlert}
              className="mt-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Send Simulated Family Safety Notification
            </button>
          </div>

          {familySent && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">{familySent.badge}</span>
                <span className="font-mono text-slate-400 text-[10px]">{familySent.status}</span>
              </div>
              <p className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-slate-200 text-xs">
                "{familySent.message_content}"
              </p>
              <p className="text-[10px] text-slate-500">{familySent.disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
