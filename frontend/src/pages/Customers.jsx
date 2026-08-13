import React, { useEffect, useState } from 'react';
import { getCustomersData } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Users } from 'lucide-react';

const Customers = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCustomersData(filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load customer data', err);
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

  const { kpis, top_customers } = data || {};

  return (
    <div className="space-y-6">
      {/* Customer KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Customers</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{kpis?.total_customers?.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Customer Spend</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(kpis?.avg_customer_spending)}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 font-bold text-lg">
            ₹
          </div>
        </div>
      </div>

      {/* Top Customer Account Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Customer Accounts Performance (INR)</h3>
            <p className="text-xs text-slate-500">Ranking of customer accounts by monetary spend and profit in Indian Rupees</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-right">Total Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Total Profit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {top_customers?.map((cust) => (
                <tr key={cust.Customer_ID} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{cust.Customer_ID}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{cust.Customer_Name}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{cust.Order_Count}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(cust.Total_Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(cust.Total_Profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;
