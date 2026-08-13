import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataPulse ErrorBoundary caught an exception:', error, errorInfo);
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = window.location.origin + '/?v=' + Date.now();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans selection:bg-blue-600 selection:text-white">
          <div className="max-w-md w-full space-y-5 bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto text-xl font-bold">
              ⚡
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white tracking-tight">DATAPULSE Workspace</h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Click below to load fresh DataPulse workspace.
              </p>
              {this.state.error && (
                <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-[11px] font-mono text-left overflow-auto max-h-24">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Load DataPulse Workspace</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
