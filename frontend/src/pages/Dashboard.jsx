import React, { useEffect, useState } from 'react';
import { getDashboardData } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

// SVG Sparkline Renderer component
const Sparkline = ({ color = '#2563EB', data = [10, 15, 12, 18, 20, 25, 22, 30] }) => {
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 90 + 5;
      const y = 35 - (val / 35) * 25;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-20 h-9 overflow-visible opacity-90" viewBox="0 0 100 40">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" points={points} />
    </svg>
  );
};

const Dashboard = ({ filters, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeResolution, setTimeResolution] = useState('monthly'); // 'monthly' | 'quarterly'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDashboardData(filters);
        setData(res);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard metrics. Please ensure backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl lg:col-span-2"></div>
          <div className="h-72 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
        {error}
      </div>
    );
  }

  const {
    kpis,
    monthly_trend,
    quarterly_trend,
    sales_by_category,
    sales_by_region,
    top_products,
    customer_insights,
    business_highlights,
  } = data || {};

  const trendData = timeResolution === 'quarterly' ? quarterly_trend : monthly_trend;
  const sortedRegions = sales_by_region ? [...sales_by_region].sort((a, b) => b.Sales - a.Sales) : [];

  return (
    <div className="space-y-6">
      {/* ROW 1: 4 Compact KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(kpis?.total_sales, true)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight className="w-3 h-3" /> 12.4%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#2563EB" data={[12, 15, 18, 14, 22, 28, 25, 32]} />
          </div>
        </div>

        {/* Card 2: Total Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PROFIT</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(kpis?.total_profit, true)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight className="w-3 h-3" /> 8.1%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#10B981" data={[8, 10, 12, 11, 16, 20, 19, 24]} />
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ORDERS</span>
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {kpis?.total_orders?.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight className="w-3 h-3" /> 5.2%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#8B5CF6" data={[5, 8, 10, 7, 12, 15, 14, 18]} />
          </div>
        </div>

        {/* Card 4: Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CUSTOMERS</span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900 tracking-tight">
                {kpis?.total_customers?.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  <ArrowUpRight className="w-3 h-3" /> 3.7%
                </span>
                <span className="text-[10px] text-slate-400">active accounts</span>
              </div>
            </div>
            <Sparkline color="#F59E0B" data={[2, 3, 4, 4, 6, 7, 8, 10]} />
          </div>
        </div>
      </div>

      {/* ROW 2: Main Revenue Chart + Regional Horizontal Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue & Profit Performance Line Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Revenue & Profit Performance</h3>
              <p className="text-xs text-slate-500">Monthly performance over the selected period (INR)</p>
            </div>

            {/* Monthly / Quarterly Toggle Switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs self-start">
              <button
                onClick={() => setTimeResolution('monthly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeResolution === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeResolution('quarterly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeResolution === 'quarterly'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="Month_Name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="Sales" name="Revenue (₹)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Profit" name="Profit (₹)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Performance Horizontal Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Regional Performance</h3>
              <p className="text-xs text-slate-500">Revenue breakdown by sales territory</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedRegions} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
                  <YAxis type="category" dataKey="Region" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={55} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="Sales" name="Revenue (₹)" fill="#2563EB" radius={[0, 4, 4, 0]}>
                    {sortedRegions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1D4ED8' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Top Products Table + Customer Insights Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Table (2 cols) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Top Selling Products</h3>
                <p className="text-xs text-slate-500">Highest revenue generating products in catalog</p>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('products')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View All Products <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                    <th className="pb-2">Product Name</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2 text-center">Units</th>
                    <th className="pb-2 text-right">Revenue (₹)</th>
                    <th className="pb-2 text-right">Profit (₹)</th>
                    <th className="pb-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {top_products?.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 font-semibold text-slate-800">{prod.Product}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                          {prod.Category}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-medium text-slate-600">{prod.Quantity}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(prod.Sales)}</td>
                      <td className="py-2.5 text-right font-semibold text-emerald-600">{formatCurrency(prod.Profit)}</td>
                      <td className="py-2.5 text-right font-medium">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {prod['Profit_Margin_%']}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Insights Card (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Customer Insights</h3>
                <p className="text-xs text-slate-500">Account segment & engagement health</p>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('customers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">AVG CUSTOMER VALUE</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatCurrency(customer_insights?.avg_customer_value, true)}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">REPEAT ORDER %</span>
                <div className="text-sm font-bold text-emerald-600 mt-0.5">
                  {customer_insights?.repeat_customer_pct}%
                </div>
              </div>
            </div>

            {/* Segment Breakdown Badges */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEGMENT DISTRIBUTION</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="font-medium text-blue-900">High Value</span>
                  <span className="font-bold text-blue-700">{customer_insights?.segments?.['High Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="font-medium text-emerald-900">Regular</span>
                  <span className="font-bold text-emerald-700">{customer_insights?.segments?.['Regular'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                  <span className="font-medium text-amber-900">Low Value</span>
                  <span className="font-bold text-amber-700">{customer_insights?.segments?.['Low Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-100">
                  <span className="font-medium text-red-900">At Risk</span>
                  <span className="font-bold text-red-700">{customer_insights?.segments?.['At Risk'] || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('customers')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
          >
            View Customer Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 4: Business Highlights Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Key Business Highlights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {business_highlights?.map((highlight, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
