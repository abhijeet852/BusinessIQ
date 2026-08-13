import React, { useEffect, useState } from 'react';
import { getRegionsData } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const Regions = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getRegionsData(filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load region data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { regions } = data || {};
  const sortedRegions = regions ? [...regions].sort((a, b) => b.Sales - a.Sales) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Regional Analysis</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Territory revenue ranking, market share distribution, and profit margin analysis.
        </p>
      </div>

      {/* Horizontal Bar Chart for Territory Ranking */}
      <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight mb-0.5">Regional Sales & Profit Comparison</h3>
        <p className="text-xs text-slate-500 mb-4">Revenue & Profit breakdown across North, West, South, and East territories (INR)</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedRegions} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="Region" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="Sales" name="Revenue (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" name="Profit (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Share Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Regional Market Share & Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Summary metrics broken down by sales region in Indian Rupees</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Market Share (%)</th>
                <th className="py-3 px-4 text-right">Profit (₹)</th>
                <th className="py-3 px-4 text-right">Profit Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {sortedRegions?.map((reg, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{reg.Region}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{reg.Order_Count}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatCurrency(reg.Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-blue-600">{reg['Sales_Share_%']}%</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(reg.Profit)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {reg['Profit_Margin_%']}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Regions;
