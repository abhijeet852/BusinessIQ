import React from 'react';
import { getReportDownloadUrl } from '../services/api';
import { FileSpreadsheet, Download, FileText, Check } from 'lucide-react';

const Reports = ({ filters }) => {
  const downloadUrl = getReportDownloadUrl(filters);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Reports Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base">Analytical Business Reports Exporter (INR)</h3>
        <p className="text-xs text-slate-500 mt-1">
          Export customized transactional datasets and business executive summaries in Indian Rupees (INR) based on your active sidebar filters.
        </p>
      </div>

      {/* Active Filters Summary Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" /> Currently Selected Export Scope
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-400 uppercase text-[10px]">Region Filter</span>
            <div className="font-bold text-slate-800 mt-0.5">{filters.region || 'All Regions'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-400 uppercase text-[10px]">Category Filter</span>
            <div className="font-bold text-slate-800 mt-0.5">{filters.category || 'All Categories'}</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-400 uppercase text-[10px]">Export Currency</span>
            <div className="font-bold text-slate-800 mt-0.5">Indian Rupee (INR - ₹)</div>
          </div>
        </div>

        {/* Download Action Button */}
        <div className="pt-2">
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Download Filtered CSV Report (INR)
          </a>
        </div>
      </div>

      {/* Included Report Fields List */}
      <div className="bg-slate-100 p-5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="font-semibold text-slate-800 mb-1">Included Transactional Data Attributes</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Order_ID & Order_Date</div>
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Customer_ID & Customer_Name</div>
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Product & Category</div>
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Region & Quantity</div>
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Sales (₹) & Discount</div>
          <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Net Profit (₹)</div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
