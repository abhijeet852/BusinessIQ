import React, { useEffect, useState } from 'react';
import { getPipelineStatus } from '../services/api';
import { Activity, CheckCircle2, Clock, Server, AlertCircle, RefreshCw } from 'lucide-react';

const PipelineMonitor = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getPipelineStatus();
      setStatus(res);
    } catch (err) {
      console.error('Failed to load pipeline status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">ETL Pipeline Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stage-by-stage health monitor, record processing counts, and execution latency.
          </p>
        </div>
        <button
          onClick={fetchStatus}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Monitor
        </button>
      </div>

      {/* Overall Summary Bar */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">PIPELINE HEALTH</span>
            <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {status.overall_status}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">RECORDS PROCESSED</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{status.total_records?.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL LATENCY</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{status.total_duration_ms} ms</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase">ACTIVE WARNINGS</span>
            <div className="text-lg font-bold text-slate-900 mt-1">{status.active_warnings}</div>
          </div>
        </div>
      )}

      {/* Stage Status Cards List */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Stage Execution Health</h3>

        <div className="space-y-3">
          {status?.stages?.map((st) => (
            <div key={st.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  #{st.id}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{st.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{st.details}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> {st.status}
                </span>
                <span className="text-slate-600">{st.records_processed} records</span>
                <span className="text-slate-400">{st.latency_ms} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineMonitor;
