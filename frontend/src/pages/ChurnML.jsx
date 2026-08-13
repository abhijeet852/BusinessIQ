import React, { useEffect, useState } from 'react';
import { getChurnPredictionML, getChurnModelComparison } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Customer360Modal from './Customer360Modal';
import { ShieldAlert, Info, Award, CheckCircle2, Eye, HelpCircle } from 'lucide-react';

const ChurnML = ({ filters }) => {
  const [data, setData] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(90);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [churnRes, compRes] = await Promise.all([
          getChurnPredictionML(threshold, filters),
          getChurnModelComparison(threshold),
        ]);
        setData(churnRes);
        setComparison(compRes);
      } catch (err) {
        console.error('Failed to load churn ML data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, threshold]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { metrics, customers } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Churn Prediction & Model Evaluation</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Predict customer churn probabilities based on historical transaction recency and spending features.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Inactivity Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value={60}>60 Days Inactive</option>
            <option value={90}>90 Days Inactive</option>
            <option value={120}>120 Days Inactive</option>
          </select>
        </div>
      </div>

      {/* Model Performance Comparison (Logistic Regression vs Random Forest) */}
      {comparison && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Model Comparison (Logistic Regression vs Random Forest)</h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {comparison.selected_model}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Algorithm</th>
                  <th className="pb-2 text-center">Accuracy</th>
                  <th className="pb-2 text-center">Precision</th>
                  <th className="pb-2 text-center">Recall</th>
                  <th className="pb-2 text-center">F1-Score</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {comparison.comparison_table?.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-bold text-slate-900">{row.Algorithm}</td>
                    <td className="py-2.5 text-center text-slate-800 font-semibold">{(row.Accuracy * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-slate-800 font-semibold">{(row.Precision * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-slate-800 font-semibold">{(row.Recall * 100).toFixed(1)}%</td>
                    <td className="py-2.5 text-center text-blue-600 font-extrabold">{row['F1-Score']}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.Status.includes('Selected') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {row.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Churn Risk Assessment Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Customer Churn Risk Assessment</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any customer row to inspect their 360 profile, feature explainability, and action plan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Churn Probability</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Recency (Days)</th>
                <th className="py-3 px-4 text-right">Total Spending (₹)</th>
                <th className="py-3 px-4 text-center">360 Explainability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {customers?.map((cust) => (
                <tr
                  key={cust.Customer_ID}
                  onClick={() => setSelectedCustomerId(cust.Customer_ID)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cust.Customer_ID}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cust.Customer_Name}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{cust.Churn_Probability}%</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      cust.Risk_Level.includes('High')
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : cust.Risk_Level.includes('Medium')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {cust.Risk_Level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600 font-semibold">{cust.Recency_Days} days</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatCurrency(cust.Total_Spending)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerId(cust.Customer_ID);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Explain
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Disclaimer Box */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
          <Info className="w-4 h-4 text-slate-500" /> Probabilistic Model Estimation Disclaimer
        </div>
        <p>• <strong>Probabilistic Prediction</strong>: Churn probabilities represent statistical estimations based on historical customer recency and spending patterns.</p>
        <p>• <strong>Feature Explainability</strong>: Factors listed are model feature contributions and do not imply direct physical causation.</p>
      </div>

      {/* Customer 360 View Modal */}
      {selectedCustomerId && (
        <Customer360Modal customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
      )}
    </div>
  );
};

export default ChurnML;
