import React, { useEffect, useState } from 'react';
import { getCustomersData } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Customer360Modal from './Customer360Modal';
import { Users, Eye, ArrowUpRight, Award, UserCheck } from 'lucide-react';

const Customers = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

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

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { kpis, top_customers } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Customer account rankings, total monetary spend, order frequency, and 360 customer profile inspection.
        </p>
      </div>

      {/* Customer KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL ACTIVE CUSTOMERS</span>
            <div className="mt-1.5 text-2xl font-extrabold text-slate-900">{kpis?.total_customers?.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AVERAGE CUSTOMER SPEND</span>
            <div className="mt-1.5 text-2xl font-extrabold text-slate-900">{formatCurrency(kpis?.avg_customer_spending)}</div>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 font-extrabold text-xl">
            ₹
          </div>
        </div>
      </div>

      {/* Top Customer Account Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Customer Account Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Click any customer row to inspect their 360 profile and recommendation campaign</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4 text-center">Total Orders</th>
                <th className="py-3 px-4 text-right">Total Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Total Profit (₹)</th>
                <th className="py-3 px-4 text-center">360 Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {top_customers?.map((cust) => (
                <tr
                  key={cust.Customer_ID}
                  onClick={() => setSelectedCustomerId(cust.Customer_ID)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cust.Customer_ID}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cust.Customer_Name}</td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{cust.Order_Count}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatCurrency(cust.Total_Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(cust.Total_Profit)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerId(cust.Customer_ID);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View 360
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Customer 360 Modal when a customer is clicked */}
      {selectedCustomerId && (
        <Customer360Modal customerId={selectedCustomerId} onClose={() => setSelectedCustomerId(null)} />
      )}
    </div>
  );
};

export default Customers;
