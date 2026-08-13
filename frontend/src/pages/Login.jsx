import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { Zap, Lock, Mail, AlertTriangle, KeyRound } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = () => {
    setEmail('user@datapulse.com');
    setPassword('datapulse123');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-white mx-auto shadow-md">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">DATAPULSE</h1>
          <p className="text-xs text-slate-400 font-medium">Business Data Intelligence & Prediction Platform</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@datapulse.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all shadow-xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to DataPulse'}
          </button>

          {/* Quick Demo Autofill Credentials */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-semibold text-slate-700">Autofill Demo Credentials</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">user@datapulse.com</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
