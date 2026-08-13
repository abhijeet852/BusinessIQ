import React, { useState } from 'react';
import { loginUser } from '../services/api';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  BarChart2,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successRedirect, setSuccessRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      setSuccessRedirect(true);
      setTimeout(() => {
        onLoginSuccess(data.user, data.access_token);
      }, 200); // 200ms smooth transition
    } catch (err) {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setEmail('user@datapulse.com');
    setPassword('datapulse123');
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* =================================================================== */}
      {/* LEFT ~45%: DATAPULSE BRAND & ABSTRACT DATA VISUALIZATION           */}
      {/* =================================================================== */}
      <div className="lg:w-[45%] bg-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Subtle Ambient SVG Data Flow Visualization (DATA -> INSIGHTS -> DECISIONS) */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="w-full h-full stroke-blue-500/30 fill-none" viewBox="0 0 800 800">
            {/* Background Data Grid */}
            <line x1="0" y1="200" x2="800" y2="200" strokeWidth="1" strokeDasharray="4 8" stroke="#334155" />
            <line x1="0" y1="400" x2="800" y2="400" strokeWidth="1" strokeDasharray="4 8" stroke="#334155" />
            <line x1="0" y1="600" x2="800" y2="600" strokeWidth="1" strokeDasharray="4 8" stroke="#334155" />

            {/* Smooth Drawing Revenue Curve Line */}
            <path
              d="M 50 550 Q 200 350, 380 420 T 700 220"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Stage Points: DATA -> INSIGHTS -> DECISIONS */}
            <circle cx="150" cy="460" r="5" fill="#3B82F6" />
            <circle cx="380" cy="420" r="5" fill="#10B981" />
            <circle cx="700" cy="220" r="6" fill="#60A5FA" />
          </svg>
        </div>

        {/* 1. TOP BRANDING */}
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-600/30 border border-blue-400/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">DATAPULSE</h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Business Data Intelligence</p>
            </div>
          </div>

          {/* 2. SIMPLE, POWERFUL HEADLINE & SUBTITLE */}
          <div className="pt-2 space-y-3 max-w-md">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn data into <br />
              <span className="text-blue-400">better decisions.</span>
            </h2>

            <p className="text-slate-300 text-xs lg:text-sm font-medium leading-relaxed">
              Analyze business performance, understand customers and make smarter decisions with data.
            </p>
          </div>

          {/* 3. THREE SMALL INLINE CAPABILITY LABELS */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Analytics</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Predictions</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Insights</span>
            </div>
          </div>
        </div>

        {/* 4. DEVELOPER CREDIT (SUBTLE & PROFESSIONAL) */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FINAL-YEAR CSE PROJECT</div>
            <div className="text-slate-300 font-semibold mt-0.5">
              Developed by <span className="text-white font-bold">ABHIJEET CHOLAKE</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT ~55%: CLEAN, SPACIOUS LOGIN COMPOSITION                       */}
      {/* =================================================================== */}
      <div className="lg:w-[55%] bg-white text-slate-900 p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-[440px] space-y-7 animate-fade-in">
          {/* Header Title */}
          <div className="space-y-1.5">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 font-medium">Sign in to continue to DataPulse.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 animate-fade-in font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@datapulse.com"
                  required
                  className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={loading || successRedirect}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : successRedirect ? (
                <>
                  <span>Authenticated! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Link */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Testing workspace?</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure access to your business intelligence workspace.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
