import React, { useEffect, useState } from 'react';
import { getRegionsData } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { regions } = data || {};

  return (
    <div className="space-y-6">
      {/* Regional Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Regional Sales & Profit Comparison (INR)</h3>
        <p className="text-xs text-slate-500 mb-4">Comparison of revenue across North, South, East, and West territories in Indian Rupees</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regions}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="Region" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="Sales" name="Sales (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" name="Profit (₹)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Regional Market Share & Performance (INR)</h3>
            <p className="text-xs text-slate-500">Summary metrics broken down by sales region in Indian Rupees</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Market Share (%)</th>
                <th className="py-3 px-4 text-right">Profit (₹)</th>
                <th className="py-3 px-4 text-right">Profit Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {regions?.map((reg, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{reg.Region}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{reg.Order_Count}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(reg.Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-blue-600">{reg['Sales_Share_%']}%</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(reg.Profit)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">{reg['Profit_Margin_%']}%</td>
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
