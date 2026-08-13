import React, { useEffect, useState } from 'react';
import { getSalesData } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { ChevronLeft, ChevronRight, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Sales = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSalesData(filters, page, 12);
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
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { kpis, category_performance, orders_table } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Sales Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Detailed sales order transactions, category revenue breakdown, and order metrics.
        </p>
      </div>

      {/* KPI Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL REVENUE</span>
          <div className="mt-1.5 text-2xl font-extrabold text-slate-900">{formatCurrency(kpis?.total_sales)}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL ORDERS</span>
          <div className="mt-1.5 text-2xl font-extrabold text-slate-900">{kpis?.total_orders?.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AVERAGE ORDER VALUE</span>
          <div className="mt-1.5 text-2xl font-extrabold text-slate-900">{formatCurrency(kpis?.avg_order_value)}</div>
        </div>
      </div>

      {/* Category Performance Bar Chart */}
      <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs">
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight mb-0.5">Category Revenue Breakdown</h3>
        <p className="text-xs text-slate-500 mb-4">Total revenue generated per product category (INR)</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={category_performance} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
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
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Sales Order Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Individual line-item sales records</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Showing {orders_table?.data?.length || 0} of {orders_table?.total_records || 0} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {orders_table?.data?.map((ord) => (
                <tr key={ord.Order_ID} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{ord.Order_ID}</td>
                  <td className="py-3 px-4 text-slate-500">{ord.Order_Date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{ord.Customer_Name}</td>
                  <td className="py-3 px-4 text-slate-700">{ord.Product}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {ord.Category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{ord.Region}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(ord.Sales)}
                  </td>
                  <td className={`py-3 px-4 text-right font-semibold ${ord.Profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(ord.Profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            Page {orders_table?.page} of {orders_table?.total_pages}
          </span>
          <button
            disabled={page >= (orders_table?.total_pages || 1)}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;
