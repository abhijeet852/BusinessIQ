import React, { useState, useEffect } from 'react';
import { uploadEtlRun, getPipelineStatus, getDataLineage } from '../services/api';
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  Award,
  Database,
  GitCommit,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const DataManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState('workflow'); // 'workflow' | 'history' | 'lineage'
  const [file, setFile] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [etlResult, setEtlResult] = useState(null);
  const [error, setError] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [lineage, setLineage] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [st, lin] = await Promise.all([getPipelineStatus(), getDataLineage()]);
        setPipelineStatus(st);
        setLineage(lin);
      } catch (err) {
        console.error('Failed to load Data Management metadata', err);
      }
    };
    loadMetadata();
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setFileMeta({
        name: selected.name,
        size_kb: (selected.size / 1024).toFixed(1),
        type: selected.name.endsWith('.csv') ? 'CSV File' : 'Excel Spreadsheet',
      });
      setEtlResult(null);
    }
  };

  const handleRunETL = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const res = await uploadEtlRun(file);
      setEtlResult(res);
      const updatedStatus = await getPipelineStatus();
      setPipelineStatus(updatedStatus);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to execute ETL pipeline and database import.');
    } finally {
      setLoading(false);
    }
  };

  const report = etlResult?.quality_report;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Unified Data Management Hub</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingestion, schema validation, Data Quality engine (0–100), cleaning, 3NF database import & lineage audit.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start">
          <button
            onClick={() => setActiveSubTab('workflow')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeSubTab === 'workflow' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ETL & Quality Workflow
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeSubTab === 'history' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Processing History
          </button>
          <button
            onClick={() => setActiveSubTab('lineage')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeSubTab === 'lineage' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Data Lineage DAG
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: WORKFLOW */}
      {activeSubTab === 'workflow' && (
        <div className="space-y-6">
          {/* Step 1: Upload Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Step 1: Upload & Validate Dataset</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileSelect}
                  className="text-xs text-slate-600 border border-slate-300 rounded-lg p-2.5 w-full focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">Supported formats: CSV (.csv), Excel (.xlsx, .xls). Max file size: 25MB.</p>
              </div>

              {fileMeta && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800 truncate">{fileMeta.name}</div>
                  <div className="text-slate-500">Size: {fileMeta.size_kb} KB • {fileMeta.type}</div>
                </div>
              )}
            </div>

            <button
              onClick={handleRunETL}
              disabled={!file || loading}
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {loading ? 'Executing 5-Stage ETL Pipeline...' : 'Run Validate, Clean & Import Pipeline'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Step 2: Quality Score Banner & Audit Log */}
          {report && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DATA QUALITY SCORE</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                      {report.quality_score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">MISSING CELLS</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{report.missing_pct}%</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">DUPLICATES</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{report.duplicate_rows_count}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">INVALID DATES</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{report.invalid_dates_count}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">OUTLIERS</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{report.outlier_count}</div>
                  </div>
                </div>
              </div>

              {/* Success Database Import Summary */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold">Database Import Successful ✓</div>
                    <div className="text-emerald-700 text-[11px] mt-0.5">
                      Imported {etlResult.rows_cleaned?.toLocaleString('en-IN')} clean records into 3NF database tables in {etlResult.total_duration_ms} ms.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: PROCESSING HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">ETL Pipeline Processing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                  <th className="pb-2">Dataset Name</th>
                  <th className="pb-2">Execution Time</th>
                  <th className="pb-2 text-center">Records</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 font-semibold text-slate-900">sales.csv (Default Baseline)</td>
                  <td className="py-2.5 text-slate-600">{pipelineStatus?.last_execution}</td>
                  <td className="py-2.5 text-center text-slate-800">{pipelineStatus?.total_records}</td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </td>
                  <td className="py-2.5 text-right text-slate-700 font-semibold">{pipelineStatus?.total_duration_ms} ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DATA LINEAGE DAG */}
      {activeSubTab === 'lineage' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Data Lineage DAG Topology</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {lineage?.nodes?.map((node, idx) => (
              <div key={node.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {node.stage}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-1">{node.label}</h4>
                <p className="text-[11px] text-slate-500">Stage #{idx + 1} Data Pulse Node</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
