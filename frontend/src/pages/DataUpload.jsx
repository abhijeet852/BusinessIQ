import React, { useState } from 'react';
import { uploadDatasetFile } from '../services/api';
import { UploadCloud, FileCheck, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const DataUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [error, setError] = useState(null);
  const [imported, setImported] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAuditResult(null);
      setError(null);
      setImported(false);
    }
  };

  const handleUploadAudit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const result = await uploadDatasetFile(selectedFile);
      setAuditResult(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and validate file. Ensure it is a valid CSV or Excel dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Title Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">Dataset Ingestion & Validation</h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload custom CSV or Excel dataset files to validate schema structure, audit missing values, and update platform metrics.
        </p>
      </div>

      {/* Upload Drag Drop Area */}
      <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h4 className="font-semibold text-slate-800 text-sm">Upload Sales Dataset</h4>
        <p className="text-xs text-slate-400 mt-1 mb-4">Supports .CSV and .XLSX Excel files up to 10MB</p>

        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />

        <div className="flex items-center gap-3">
          <label
            htmlFor="file-upload-input"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-all"
          >
            Choose File
          </label>

          {selectedFile && (
            <button
              onClick={handleUploadAudit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Validate Dataset'}
            </button>
          )}
        </div>

        {selectedFile && (
          <div className="mt-3 text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-500" /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {/* Error Message Notification */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold">Validation Error</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Audit Validation Report */}
      {auditResult && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-sm">Validation Audit Report</h4>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                auditResult.is_schema_valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {auditResult.is_schema_valid ? 'Schema Verified Valid' : 'Schema Incomplete'}
            </span>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">File Name</span>
              <div className="text-xs font-bold text-slate-800 truncate mt-0.5">{auditResult.filename}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Rows</span>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{auditResult.total_rows?.toLocaleString()}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Missing Cells</span>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{auditResult.missing_values_count}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Duplicate Rows</span>
              <div className="text-xs font-bold text-slate-800 mt-0.5">{auditResult.duplicate_rows_count}</div>
            </div>
          </div>

          {/* Confirmation Button */}
          {imported ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Dataset successfully validated and imported!
            </div>
          ) : (
            <button
              onClick={() => setImported(true)}
              disabled={!auditResult.is_schema_valid}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
            >
              Confirm Import Dataset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DataUpload;
