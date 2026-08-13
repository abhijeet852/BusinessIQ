import React, { useEffect, useState } from 'react';
import { getChurnPredictionML } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Info } from 'lucide-react';

const ChurnML = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(90);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getChurnPredictionML(threshold, filters);
        setData(res);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { metrics, customers } = data || {};

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Customer Churn Prediction (INR)</h3>
          <p className="text-xs text-slate-500">Supervised Logistic Regression baseline classification model on customer monetary metrics in Indian Rupees</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Inactivity Threshold:</label>
          <select
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={60}>60 Days Inactive</option>
            <option value={90}>90 Days Inactive</option>
            <option value={120}>120 Days Inactive</option>
          </select>
        </div>
      </div>

      {/* Model Performance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Model Accuracy</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{(metrics?.accuracy * 100)?.toFixed(1)}%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Precision</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{(metrics?.precision * 100)?.toFixed(1)}%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Recall</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{(metrics?.recall * 100)?.toFixed(1)}%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">F1-Score</span>
          <div className="mt-1 text-xl font-bold text-blue-600">{metrics?.f1_score}</div>
        </div>
      </div>

      {/* Confusion Matrix & Customer Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Customer Churn Risk Assessment Table (INR)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Churn Probability</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Recency (Days)</th>
                <th className="py-3 px-4 text-right">Total Spending (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {customers?.map((cust) => (
                <tr key={cust.Customer_ID} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{cust.Customer_ID}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{cust.Customer_Name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{cust.Churn_Probability}%</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                      cust.Risk_Level.includes('High')
                        ? 'bg-red-100 text-red-800'
                        : cust.Risk_Level.includes('Medium')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {cust.Risk_Level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">{cust.Recency_Days} days</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(cust.Total_Spending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations Box */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
          <Info className="w-4 h-4 text-slate-500" /> Model Limitations & Historical Data Disclaimer
        </div>
        <p>• <strong>Lack of Qualitative Feedback</strong>: Does not capture customer sentiment, support tickets, or competitor pricing shifts.</p>
        <p>• <strong>Reactive Metric</strong>: Recency detects churn after a customer has already stopped ordering, rather than predicting intent ahead of time.</p>
        <p>• <strong>Historical Disclaimer</strong>: Predictions are probabilistic estimations based strictly on historical transaction datasets.</p>
      </div>
    </div>
  );
};

export default ChurnML;
