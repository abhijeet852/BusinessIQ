import React, { useEffect, useState } from 'react';
import { getSegmentationML } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#10B981', '#2563EB', '#EF4444', '#F59E0B', '#8B5CF6'];

const SegmentationML = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clusters, setClusters] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSegmentationML(clusters, filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load segmentation ML data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, clusters]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { metrics, segment_summaries, segmented_customers } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Customer Behavioral Segmentation (INR)</h3>
          <p className="text-xs text-slate-500">Unsupervised K-Means Machine Learning Clustering & StandardScaler Normalization on Indian Rupee Feature Matrices</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Clusters (K):</label>
          <input
            type="range"
            min="2"
            max="5"
            value={clusters}
            onChange={(e) => setClusters(Number(e.target.value))}
            className="w-28 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
            K = {clusters}
          </span>
        </div>
      </div>

      {/* Model Performance Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Segmented Accounts</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{metrics?.total_customers_segmented}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Silhouette Score</span>
          <div className="mt-1 text-xl font-bold text-emerald-600">{metrics?.silhouette_score}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Model Inertia</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{metrics?.inertia?.toFixed(1)}</div>
        </div>
      </div>

      {/* Segment Summary Cards & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segment Table Profile */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Cluster Segment Profiles (INR)</h3>
          <p className="text-xs text-slate-500 mb-4">Average customer behavioral features per cluster in Indian Rupees</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                  <th className="pb-2">Segment</th>
                  <th className="pb-2 text-center">Accounts</th>
                  <th className="pb-2 text-right">Avg Total Spend (₹)</th>
                  <th className="pb-2 text-right">Avg Orders</th>
                  <th className="pb-2 text-right">Avg Recency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {segment_summaries?.map((seg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">{seg.Segment}</td>
                    <td className="py-3 text-center text-slate-600 font-medium">{seg.Customer_Count}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(seg.Avg_Total_Spending)}</td>
                    <td className="py-3 text-right text-slate-700">{seg.Avg_Order_Count?.toFixed(1)}</td>
                    <td className="py-3 text-right text-slate-600">{seg.Avg_Recency_Days?.toFixed(1)} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cluster Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Customer Share</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of customer clusters</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segment_summaries}
                  dataKey="Customer_Count"
                  nameKey="Segment"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {segment_summaries?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Cluster Assignment List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Customer Account Segment Assignment (INR)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Assigned Segment</th>
                <th className="py-3 px-4 text-right">Total Spend (₹)</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Recency (Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {segmented_customers?.map((cust) => (
                <tr key={cust.Customer_ID} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{cust.Customer_ID}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{cust.Customer_Name}</td>
                  <td className="py-3 px-4 font-medium text-blue-700">{cust.Segment}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(cust.Total_Spending)}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{cust.Order_Count}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{cust.Recency_Days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SegmentationML;
