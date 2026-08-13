import React, { useState } from 'react';
import { loginUser } from '../services/api';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Award,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  BarChart2,
  LineChart,
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
      setError('Incorrect email or password. Please check your credentials and try again.');
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
      {/* LEFT ~58%: PRODUCT SHOWCASE & VISUAL BI CANVAS PREVIEW               */}
      {/* =================================================================== */}
      <div className="lg:w-[58%] bg-slate-900 text-white p-8 lg:p-12 xl:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Layered Background Depth: Radial Blue Glow + Subtle Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl"></div>
          
          {/* Subtle Analytics Canvas Grid Lines */}
          <svg className="w-full h-full stroke-slate-800/60 fill-none" viewBox="0 0 800 800">
            <defs>
              <pattern id="login-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        {/* 1. BRANDING & MAIN HEADLINE */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/30 border border-blue-400/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-tight leading-none">DATAPULSE</h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Business Data Intelligence</p>
            </div>
          </div>

          <div className="pt-2 space-y-2.5 max-w-xl">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Turn data into <br />
              <span className="text-blue-400">better decisions.</span>
            </h2>

            <p className="text-slate-300 text-xs lg:text-sm font-medium leading-relaxed max-w-md">
              Analyze performance, understand customers and discover opportunities through data.
            </p>
          </div>
        </div>

        {/* 2. MAIN VISUAL: PRODUCT SHOWCASE BI ANALYTICS PREVIEW CANVAS */}
        <div className="relative z-10 py-6 my-auto">
          {/* Main Visual Card Container */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-2xl space-y-4 max-w-xl mx-auto lg:mx-0">
            {/* Canvas Header */}
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">BUSINESS PERFORMANCE</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                <span>+12.4% Revenue Growth</span>
              </div>
            </div>

            {/* KPI Metric Showcase */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTAL REVENUE</span>
                <div className="text-2xl font-extrabold text-white mt-0.5">₹80.24 L</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PERIOD</span>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">2025 → 2026</div>
              </div>
            </div>

            {/* SVG Product Illustration Curve & Area Chart */}
            <div className="h-32 w-full pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path
                  d="M 10 100 Q 120 40, 250 60 T 490 20 L 490 120 L 10 120 Z"
                  fill="url(#chartGradient)"
                />

                {/* Trend Line */}
                <path
                  d="M 10 100 Q 120 40, 250 60 T 490 20"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="10" cy="100" r="4" fill="#3B82F6" />
                <circle cx="130" cy="48" r="4" fill="#3B82F6" />
                <circle cx="250" cy="60" r="4" fill="#3B82F6" />
                <circle cx="370" cy="35" r="4" fill="#3B82F6" />
                <circle cx="490" cy="20" r="5" fill="#60A5FA" className="animate-ping" />
                <circle cx="490" cy="20" r="5" fill="#3B82F6" />
              </svg>
            </div>
          </div>

          {/* 3 Small Floating Information Badges (Layered Depth around Canvas) */}
          <div className="hidden sm:flex items-center gap-3 mt-3 max-w-xl mx-auto lg:mx-0">
            <div className="flex-1 bg-slate-800/60 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between shadow-xs">
              <span className="text-slate-400 text-[11px] font-medium">Business Health:</span>
              <span className="font-bold text-white text-xs">71 / 100</span>
            </div>

            <div className="flex-1 bg-slate-800/60 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between shadow-xs">
              <span className="text-slate-400 text-[11px] font-medium">Sales Forecast:</span>
              <span className="font-bold text-emerald-400 text-xs">+12.7%</span>
            </div>

            <div className="flex-1 bg-slate-800/60 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between shadow-xs">
              <span className="text-slate-400 text-[11px] font-medium">Churn Risk:</span>
              <span className="font-bold text-blue-400 text-xs">Logistic / RF</span>
            </div>
          </div>
        </div>

        {/* 3. DEVELOPER CREDIT (ELEGANT & NOTICEABLE) */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">FINAL-YEAR CSE PROJECT</div>
            <div className="text-slate-300 font-semibold mt-0.5">
              Developed by <span className="text-white font-bold">ABHIJEET CHOLAKE</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-medium hidden sm:block">B.Tech Computer Science & Engineering</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT ~42%: FOCUSED PREMIUM AUTHENTICATION COMPOSITION              */}
      {/* =================================================================== */}
      <div className="lg:w-[42%] bg-slate-50 text-slate-900 p-8 lg:p-14 flex flex-col justify-center items-center">
        <div className="w-full max-w-[420px] space-y-7 animate-fade-in">
          {/* Header */}
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
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@datapulse.com"
                  required
                  className="w-full h-[52px] pl-11 pr-4 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-semibold shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-[52px] pl-11 pr-11 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-semibold shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || successRedirect}
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
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

          {/* Quick Demo Autofill Credentials Helper */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
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
