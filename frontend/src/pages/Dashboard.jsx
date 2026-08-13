import React, { useEffect, useState } from 'react';
import { getDashboardData, getBusinessHealth, getBusinessAlerts } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  AlertTriangle,
  Zap,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  Activity,
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

// SVG Sparkline Component
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

// Rich Custom Tooltip Component for Main Line Chart
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sales = payload.find((p) => p.dataKey === 'Sales')?.value || 0;
    const profit = payload.find((p) => p.dataKey === 'Profit')?.value || 0;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800 animate-fade-in">
        <div className="font-bold text-slate-300 pb-1 border-b border-slate-800">{label}</div>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="text-slate-400">Revenue:</span>
          <span className="font-bold text-blue-400">{formatCurrency(sales)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Profit:</span>
          <span className="font-bold text-emerald-400">{formatCurrency(profit)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">Profit Margin:</span>
          <span className="font-bold text-amber-400">{margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ filters, setActiveTab }) => {
  const [data, setData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeResolution, setTimeResolution] = useState('monthly'); // 'monthly' | 'quarterly'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, healthRes, alertRes] = await Promise.all([
          getDashboardData(filters),
          getBusinessHealth(filters),
          getBusinessAlerts(filters),
        ]);
        setData(dashRes);
        setHealthData(healthRes);
        setAlerts(alertRes || []);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard metrics. Please verify backend connectivity.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  // Skeleton Loader for smooth layout stability
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl lg:col-span-2"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
        <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 text-white font-semibold rounded-md">
          Retry
        </button>
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
    <div className="space-y-6 animate-fade-in">
      {/* 1. Page Header & First Impression */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Business Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor sales performance, customer behavior and business growth.
          </p>
        </div>

        {/* Business Health Score Badge (0-100) */}
        {healthData && (
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">HEALTH SCORE</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {healthData.status}
                </span>
              </div>
              <div className="text-base font-extrabold text-slate-900">
                {healthData.health_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. KPI Cards Grid (Priority 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Revenue */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis?.total_sales, true)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                  <ArrowUpRight className="w-3 h-3" /> +12.4%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#2563EB" data={[12, 15, 18, 14, 22, 28, 25, 32]} />
          </div>
        </div>

        {/* KPI 2: Profit */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PROFIT</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(kpis?.total_profit, true)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                  <ArrowUpRight className="w-3 h-3" /> +8.1%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#10B981" data={[8, 10, 12, 11, 16, 20, 19, 24]} />
          </div>
        </div>

        {/* KPI 3: Orders */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ORDERS</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {kpis?.total_orders?.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                  <ArrowUpRight className="w-3 h-3" /> +5.2%
                </span>
                <span className="text-[10px] text-slate-400">vs prev period</span>
              </div>
            </div>
            <Sparkline color="#8B5CF6" data={[5, 8, 10, 7, 12, 15, 14, 18]} />
          </div>
        </div>

        {/* KPI 4: Customers */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CUSTOMERS</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {kpis?.total_customers?.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                  <ArrowUpRight className="w-3 h-3" /> +3.7%
                </span>
                <span className="text-[10px] text-slate-400">active accounts</span>
              </div>
            </div>
            <Sparkline color="#F59E0B" data={[2, 3, 4, 4, 6, 7, 8, 10]} />
          </div>
        </div>
      </div>

      {/* 3. Main Revenue & Profit Line Chart (Priority 2 centerpiece) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">Revenue & Profit Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly performance over the selected period (INR)</p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs self-start">
              <button
                onClick={() => setTimeResolution('monthly')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  timeResolution === 'monthly'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeResolution('quarterly')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  timeResolution === 'quarterly'
                    ? 'bg-white text-slate-900 shadow-2xs'
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
                <Tooltip content={<CustomChartTooltip />} />
                <Line type="monotone" dataKey="Sales" name="Revenue" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3.5, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Profit" name="Profit" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3.5, fill: '#10B981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Performance Ranking Horizontal Bar Chart */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">Regional Performance</h2>
              <p className="text-xs text-slate-500 mt-0.5">Revenue breakdown by sales territory</p>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedRegions} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
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

      {/* 4. Business Alerts & Highlights Section */}
      {alerts.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Automated Business Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {alerts.map((al, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  al.type === 'risk' || al.type === 'warning'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${al.type === 'risk' ? 'text-amber-600' : 'text-emerald-600'}`} />
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-wider">{al.title}</div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">{al.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Top Products Table & Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Table */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Top Selling Products</h3>
                <p className="text-xs text-slate-500 mt-0.5">Highest revenue generating catalog items</p>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('products')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View Catalog <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5">Product Name</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5 text-center">Units</th>
                    <th className="pb-2.5 text-right">Revenue (₹)</th>
                    <th className="pb-2.5 text-right">Profit (₹)</th>
                    <th className="pb-2.5 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {top_products?.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-semibold text-slate-900">{prod.Product}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.Category}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-600">{prod.Quantity}</td>
                      <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(prod.Sales)}</td>
                      <td className="py-3 text-right font-semibold text-emerald-600">{formatCurrency(prod.Profit)}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
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

        {/* Customer Insights Card */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Customer Insights</h3>
                <p className="text-xs text-slate-500 mt-0.5">Account segment distribution</p>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('customers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

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

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CUSTOMER SEGMENTS</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="font-semibold text-blue-900">High Value</span>
                  <span className="font-extrabold text-blue-700">{customer_insights?.segments?.['High Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="font-semibold text-emerald-900">Regular</span>
                  <span className="font-extrabold text-emerald-700">{customer_insights?.segments?.['Regular'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                  <span className="font-semibold text-amber-900">Low Value</span>
                  <span className="font-extrabold text-amber-700">{customer_insights?.segments?.['Low Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-red-50/60 border border-red-100">
                  <span className="font-semibold text-red-900">At Risk</span>
                  <span className="font-extrabold text-red-700">{customer_insights?.segments?.['At Risk'] || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('customers')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            View Customer Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
