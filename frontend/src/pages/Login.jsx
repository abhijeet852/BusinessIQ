import React, { useState } from 'react';
import { loginUser } from '../services/api';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Award,
  CheckCircle2,
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
      }, 200); // Fast 200ms smooth transition
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
    <div className="min-h-screen w-full bg-slate-900 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* =================================================================== */}
      {/* LEFT ~55%: DATAPULSE BRAND & VISUAL DATA EXPERIENCE                 */}
      {/* =================================================================== */}
      <div className="lg:w-[55%] bg-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
        
        {/* Subtle Ambient Depth Gradients & Data Line Visualizations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
          
          {/* SVG Animated Data Stream */}
          <svg className="w-full h-full stroke-blue-500/30 fill-none" viewBox="0 0 1000 1000">
            <line x1="0" y1="200" x2="1000" y2="200" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="400" x2="1000" y2="400" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="600" x2="1000" y2="600" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="800" x2="1000" y2="800" strokeWidth="1" strokeDasharray="6 6" />
            
            {/* Animated Flowing Revenue Graph Curve */}
            <path
              d="M 50 700 Q 250 450, 450 550 T 850 250 T 1000 200"
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-pulse"
            />
            <path
              d="M 50 800 Q 300 650, 550 700 T 950 400"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* 1. TOP LOGO BRANDING */}
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-600/30 border border-blue-400/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-xl tracking-tight leading-none">DATAPULSE</h1>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold tracking-wide">
                Business Data Intelligence & Prediction
              </p>
            </div>
          </div>

          {/* 2. MAIN BOLD HEADLINE & SUBTITLE */}
          <div className="pt-4 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              Enterprise Intelligence Pipeline
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] uppercase">
              TURN BUSINESS DATA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                INTO DECISIONS.
              </span>
            </h2>

            <p className="text-slate-300 text-xs lg:text-sm font-medium leading-relaxed max-w-lg">
              Transform raw business data into analytics, predictions and actionable insights through validated ETL pipelines, 3NF database storage, and explainable machine learning.
            </p>
          </div>
        </div>

        {/* 3. INTERACTIVE DATA PREVIEW BADGES & CAPABILITIES */}
        <div className="relative z-10 py-8 space-y-5">
          {/* Mini Live Data Preview Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>REVENUE TREND</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">₹80.24 L <span className="text-[10px] text-emerald-400 font-bold">+12.4%</span></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs backdrop-blur-xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>DATA QUALITY</span>
                <Award className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">94 / 100 <span className="text-[10px] text-blue-400 font-bold">Good</span></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs backdrop-blur-xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>ML CHURN RISK</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm font-bold text-white mt-1">RF Model <span className="text-[10px] text-emerald-400 font-bold">88% F1</span></div>
            </div>
          </div>

          {/* 3 Compact Capability Rows */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">ANALYTICS</h4>
                <p className="text-slate-400 text-[11px]">Sales, customer segments & product margin performance</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">PREDICTION</h4>
                <p className="text-slate-400 text-[11px]">Customer churn risk model comparison & sales forecasting</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">INSIGHTS</h4>
                <p className="text-slate-400 text-[11px]">Automated Business Health Score (0–100) & decision support</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. DEVELOPER CREDIT (ELEGANT & PROFESSIONAL) */}
        <div className="relative z-10 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FINAL-YEAR CSE PROJECT</div>
            <div className="text-slate-200 font-bold mt-0.5">
              Developed by <span className="text-blue-400 font-extrabold">ABHIJEET CHOLAKE</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">B.Tech Computer Science & Engineering</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT ~45%: REFINED LIGHT AUTHENTICATION COMPOSITION               */}
      {/* =================================================================== */}
      <div className="lg:w-[45%] bg-slate-50 lg:bg-white text-slate-900 p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-7">
          {/* Header Title */}
          <div className="space-y-1.5">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 font-semibold">Sign in to continue to DataPulse.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 animate-fade-in font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
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
                  className="w-full pl-10 pr-3.5 py-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-semibold shadow-2xs"
                />
              </div>
            </div>

            {/* Password Input */}
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
                  className="w-full pl-10 pr-10 py-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-semibold shadow-2xs"
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
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
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

          {/* Quick Demo Autofill Credentials */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Testing DataPulse Workspace?</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure access to your business intelligence workspace.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
