import React, { useEffect, useState } from 'react';
import { getCustomer360 } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { X, User, ShieldAlert, Award, ShoppingBag, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';

const Customer360Modal = ({ customerId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch360 = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const res = await getCustomer360(customerId);
        setData(res);
      } catch (err) {
        console.error('Failed to fetch customer 360 profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetch360();
  }, [customerId]);

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{data?.customer_name || 'Loading Customer 360...'}</h3>
              <p className="text-xs text-slate-400">Customer ID: {customerId} • Profile & Decision Support</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading Customer 360 profile...</div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top KPI Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL SPEND</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{formatCurrency(data?.total_spending)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">TOTAL ORDERS</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{data?.total_orders}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">SEGMENT</span>
                <div className="text-xs font-bold text-blue-700 mt-1">{data?.segment}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">CHURN RISK</span>
                <div className="text-xs font-bold text-red-600 mt-1">{data?.churn_probability}% ({data?.risk_level})</div>
              </div>
            </div>

            {/* Actionable Business Recommendation Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Lightbulb className="w-4 h-4 text-blue-700" />
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider">RECOMMENDED BUSINESS ACTION</h4>
              </div>
              <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                {data?.recommended_business_action}
              </p>
            </div>

            {/* Feature Explainability Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">CHURN PREDICTION EXPLAINABILITY</h4>
              <div className="space-y-2">
                {data?.explainability_factors?.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-800">{f.feature}</div>
                      <div className="text-[11px] text-slate-500">{f.description}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.direction === 'negative' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction History Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">ORDER TRANSACTION HISTORY</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Product</th>
                      <th className="pb-2">Region</th>
                      <th className="pb-2 text-right">Sales (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.transaction_history?.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 font-semibold text-slate-900">{tx.Order_ID}</td>
                        <td className="py-2 text-slate-600">{tx.Order_Date}</td>
                        <td className="py-2 font-medium text-slate-800">{tx.Product}</td>
                        <td className="py-2 text-slate-600">{tx.Region}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{formatCurrency(tx.Sales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customer360Modal;
