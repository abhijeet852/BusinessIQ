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
      }, 250); // Short 250ms smooth transition
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
      {/* LEFT 50%: DataPulse Brand Experience (Desktop Only / Top on Mobile) */}
      <div className="lg:w-1/2 bg-slate-900 text-white p-8 lg:p-16 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Subtle Background SVG Data Visualization */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
            <path d="M50 400 Q 200 200, 400 400 T 750 400" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" />
            <path d="M50 500 Q 300 300, 500 500 T 750 300" stroke="#10B981" strokeWidth="2" />
            <circle cx="200" cy="300" r="6" fill="#3B82F6" />
            <circle cx="400" cy="400" r="6" fill="#10B981" />
            <circle cx="600" cy="350" r="6" fill="#F59E0B" />
          </svg>
        </div>

        {/* Top Logo & Title */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-xl tracking-tight leading-none">DATAPULSE</h1>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Data Intelligence & Prediction</p>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Turn business data into decisions.
            </h2>
            <p className="text-slate-400 text-xs lg:text-sm leading-relaxed max-w-lg font-medium">
              Upload, analyze and transform raw business datasets into trusted, actionable insights and machine-learning predictions.
            </p>
          </div>
        </div>

        {/* 3 Compact Capabilities (Subtle & Data Focused) */}
        <div className="relative z-10 py-8 lg:py-0 space-y-3.5">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 backdrop-blur-xs">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs">Analytics</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Understand sales trends, customer performance, and product margins</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 backdrop-blur-xs">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs">Predictions</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Forecast future sales revenue and detect customer churn risk early</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800 backdrop-blur-xs">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-xs">Insights</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">Automate data quality scores, anomaly alerts, and recommendation rules</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-500 font-medium">
          DataPulse B.Tech CSE Final-Year Engineering Architecture
        </div>
      </div>

      {/* RIGHT 50%: Clean Light Authentication Experience */}
      <div className="lg:w-1/2 bg-white text-slate-900 p-8 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-500 font-medium">Sign in to continue to DataPulse</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@datapulse.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || successRedirect}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-xs rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : successRedirect ? (
                <>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Single Quick Autofill Helper */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Testing DataPulse?</span>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Autofill Credentials
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure access to your business intelligence workspace.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
