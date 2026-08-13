import React, { useEffect, useState } from 'react';
import { getSalesData } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Sales = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSalesData(filters, page, 10);
        setData(res);
      } catch (err) {
        console.error('Failed to load sales data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, page]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { kpis, category_performance, orders_table } = data || {};

  return (
    <div className="space-y-6">
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(kpis?.total_sales)}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis?.total_orders?.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(kpis?.avg_order_value)}</div>
        </div>
      </div>

      {/* Category Performance Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Category Revenue Breakdown (INR)</h3>
        <p className="text-xs text-slate-500 mb-4">Total revenue generated per product category in Indian Rupees</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={category_performance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="Category" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="Sales" name="Sales (₹)" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clean Sales Orders Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Sales Transactions (INR)</h3>
            <p className="text-xs text-slate-500">Detailed list of customer order transactions</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {orders_table?.data?.length || 0} of {orders_table?.total_records || 0} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-right">Sales (₹)</th>
                <th className="py-3 px-4 text-right">Profit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {orders_table?.data?.map((ord) => (
                <tr key={ord.Order_ID} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{ord.Order_ID}</td>
                  <td className="py-3 px-4 text-slate-500">{ord.Order_Date}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{ord.Customer_Name}</td>
                  <td className="py-3 px-4 text-slate-700">{ord.Product}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {ord.Category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{ord.Region}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(ord.Sales)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${ord.Profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(ord.Profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs text-slate-500 font-medium">
            Page {orders_table?.page} of {orders_table?.total_pages}
          </span>
          <button
            disabled={page >= (orders_table?.total_pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;
