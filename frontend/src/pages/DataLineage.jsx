import React, { useEffect, useState } from 'react';
import { getDataLineage } from '../services/api';
import { GitCommit, ArrowRight, Database, Server, CheckCircle2, Clock } from 'lucide-react';

const DataLineage = () => {
  const [lineage, setLineage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLineage = async () => {
      try {
        const res = await getDataLineage();
        setLineage(res);
      } catch (err) {
        console.error('Failed to load data lineage', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLineage();
  }, []);

  if (loading) {
    return <div className="p-6 bg-white rounded-xl border border-slate-200 animate-pulse h-64"></div>;
  }

  const { nodes, edges, metadata } = lineage || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Lineage & Pipeline Topology</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          End-to-end data processing DAG tracing raw file ingestion to database storage and ML predictions.
        </p>
      </div>

      {/* Visual Pipeline Topology DAG */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        <h3 className="font-bold text-slate-900 text-sm">Lineage DAG Flow</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {nodes?.map((node, idx) => (
            <div key={node.id} className="relative bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {node.stage}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Node #{idx + 1}</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs">{node.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Data Pulse Lineage Process</p>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold pt-2 border-t border-slate-200/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Lineage Stage
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Lineage Metadata Card */}
      {metadata && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Dataset Lineage Audit Summary</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">DATASET NAME</span>
              <div className="font-bold text-slate-900 mt-1">{metadata.dataset_name}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">ROWS INGESTED</span>
              <div className="font-bold text-slate-900 mt-1">{metadata.rows_received}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">CLEANED ROWS</span>
              <div className="font-bold text-emerald-600 mt-1">{metadata.rows_after_cleaning}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">PROCESSING DURATION</span>
              <div className="font-bold text-slate-900 mt-1">{metadata.processing_duration_ms} ms</div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPLIED LINEAGE OPERATIONS</span>
            {metadata.cleaning_operations?.map((op, i) => (
              <div key={i} className="text-xs text-slate-700 p-2.5 rounded bg-slate-50 border border-slate-100 flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>{op}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataLineage;
