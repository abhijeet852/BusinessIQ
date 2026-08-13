import React, { useState } from 'react';
import { uploadEtlRun } from '../services/api';
import {
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Award,
  Database,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const DataQuality = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [etlResult, setEtlResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRunEtl = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadEtlRun(file);
      setEtlResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute ETL pipeline and quality audit.');
    } finally {
      setLoading(false);
    }
  };

  const report = etlResult?.quality_report;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Quality & Audit Engine</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated schema validation, missing cell imputation, deduplication, and quality scoring (0–100).
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs font-semibold">
            Stage 2: Validation & Quality
          </div>
        </div>
      </div>

      {/* Upload & Run ETL Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Upload Dataset for Quality Audit</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            className="text-xs text-slate-600 border border-slate-300 rounded-lg p-2 w-full sm:w-auto focus:outline-none"
          />
          <button
            onClick={handleRunEtl}
            disabled={!file || loading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            {loading ? 'Running ETL Pipeline...' : 'Run Data Quality Audit'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quality Audit Report Card */}
      {report && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA QUALITY SCORE</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {report.quality_score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated across {report.total_rows?.toLocaleString('en-IN')} rows and {report.total_cols} columns.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">MISSING CELLS</div>
                <div className="text-base font-bold text-slate-800 mt-1">{report.missing_pct}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">DUPLICATES</div>
                <div className="text-base font-bold text-slate-800 mt-1">{report.duplicate_rows_count}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">INVALID DATES</div>
                <div className="text-base font-bold text-slate-800 mt-1">{report.invalid_dates_count}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="text-xs text-slate-400 font-semibold uppercase">OUTLIERS</div>
                <div className="text-base font-bold text-slate-800 mt-1">{report.outlier_count}</div>
              </div>
            </div>
          </div>

          {/* Transformation Audit Logs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Transformation Audit Trail</h3>
            <div className="space-y-2">
              {report.transformations_applied?.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQuality;
