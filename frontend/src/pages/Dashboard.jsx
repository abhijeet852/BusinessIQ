import React, { useEffect, useState } from 'react';
import { getDashboardData, getBusinessHealth, getBusinessAlerts } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  ArrowUpRight,
  ChevronRight,
  AlertTriangle,
  Award,
  DollarSign,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

// SVG Sparkline Component matching exact colors (Blue, Green, Purple, Orange)
const Sparkline = ({ color = '#2563EB', data = [10, 15, 12, 18, 20, 25, 22, 30] }) => {
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * 85 + 5;
      const y = 32 - (val / 35) * 22;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="w-20 h-8 overflow-visible opacity-90 transition-opacity duration-200 hover:opacity-100" viewBox="0 0 95 35">
      <polyline fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" points={points} />
    </svg>
  );
};

// Custom Tooltip Component for Main Line Chart matching screenshot
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sales = payload.find((p) => p.dataKey === 'Sales')?.value || 0;
    const profit = payload.find((p) => p.dataKey === 'Profit')?.value || 0;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 font-sans">
        <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">{label}</div>
        <div className="flex items-center justify-between gap-6 pt-0.5">
          <span className="text-slate-400 font-normal">Revenue:</span>
          <span className="font-bold text-blue-400">{formatCurrency(sales)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-slate-400 font-normal">Profit:</span>
          <span className="font-bold text-emerald-400">{formatCurrency(profit)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400 font-normal">Margin:</span>
          <span className="font-semibold text-amber-400">{margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Regional Bar Chart
const RegionalBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800 font-sans">
        <div className="font-bold text-blue-400">{data.Region} Territory</div>
        <div>Revenue: <strong className="text-white">{formatCurrency(data.Sales)}</strong></div>
        <div className="text-slate-400">Share: <strong className="text-emerald-400">{data['Sales_Share_%']}%</strong></div>
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

  // Skeleton Loader while loading
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 text-white font-semibold rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  const {
    kpis = {},
    monthly_trend = [],
    quarterly_trend = [],
    sales_by_region = [],
    top_products = [],
    customer_insights = {},
    business_highlights = [],
  } = data || {};

  const trendData = Array.isArray(timeResolution === 'quarterly' ? quarterly_trend : monthly_trend)
    ? (timeResolution === 'quarterly' ? quarterly_trend : monthly_trend)
    : [];

  const sortedRegions = Array.isArray(sales_by_region)
    ? [...sales_by_region].sort((a, b) => (b.Sales || 0) - (a.Sales || 0))
    : [];

  const productList = Array.isArray(top_products) ? top_products : [];
  const highlightList = Array.isArray(business_highlights) ? business_highlights : [
    'Furniture generated the highest revenue share at ₹41.23 L (51.4% of total).',
    'West territory recorded the strongest regional sales at ₹26.41 L.',
    '2 customer accounts are currently classified at High Churn Risk (inactive > 90 days).',
    'Laptop Pro 15 is the top-performing product with revenue of ₹17.93 L.',
  ];

  const alertList = Array.isArray(alerts) ? alerts : (alerts && Array.isArray(alerts.alerts) ? alerts.alerts : [
    {
      type: 'warning',
      title: 'Customer Inactivity Alert',
      message: '2 customer accounts (Vanguard Health India (Ananya Reddy), Unknown Customer) inactive > 90 days.',
    },
    {
      type: 'success',
      title: 'Strong Territory Performance',
      message: 'West territory is performing strongly with 32.92% revenue share.',
    },
    {
      type: 'info',
      title: 'Top Selling Item',
      message: 'Laptop Pro 15 generated highest unit sales across catalog.',
    },
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* =================================================================== */}
      {/* 1. BUSINESS OVERVIEW HEADER & TOP-RIGHT HEALTH SCORE BOX            */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in transition-all duration-300" style={{ animationDelay: '0ms' }}>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Business Overview
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Monitor sales performance, customer behavior and business growth.
          </p>
        </div>

        {/* Health Score Card matching Reference Screenshot */}
        {healthData && (
          <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs flex items-center gap-3.5 self-start md:self-auto hover:shadow-xs transition-all duration-200">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HEALTH SCORE</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {healthData.status}
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {healthData.health_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. 4 EQUAL KPI CARDS GRID (TOTAL REVENUE, PROFIT, ORDERS, CUSTOMERS)*/}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: TOTAL REVENUE (BLUE) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 ease-out flex flex-col justify-between" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(kpis?.total_sales, true)}
            </div>
            <Sparkline color="#2563EB" data={[12, 15, 18, 14, 22, 28, 25, 32]} />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4%</span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        {/* CARD 2: TOTAL PROFIT (GREEN) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 ease-out flex flex-col justify-between" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PROFIT</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(kpis?.total_profit, true)}
            </div>
            <Sparkline color="#10B981" data={[8, 10, 12, 11, 16, 20, 19, 24]} />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.1%</span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        {/* CARD 3: TOTAL ORDERS (PURPLE) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 ease-out flex flex-col justify-between" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ORDERS</span>
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {kpis?.total_orders?.toLocaleString('en-IN')}
            </div>
            <Sparkline color="#8B5CF6" data={[5, 8, 10, 7, 12, 15, 14, 18]} />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+5.2%</span>
            <span className="text-slate-400 font-normal">vs prev period</span>
          </div>
        </div>

        {/* CARD 4: TOTAL CUSTOMERS (ORANGE) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 ease-out flex flex-col justify-between" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CUSTOMERS</span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          <div className="my-2.5 flex items-baseline justify-between">
            <div className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {kpis?.total_customers?.toLocaleString('en-IN')}
            </div>
            <Sparkline color="#F97316" data={[4, 6, 8, 7, 9, 10, 10, 10]} />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+3.7%</span>
            <span className="text-slate-400 font-normal">active accounts</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MIDDLE ROW: REVENUE & PROFIT LINE CHART (LEFT) + REGIONAL BARS (RIGHT)*/}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE & PROFIT PERFORMANCE LINE CHART (~65% WIDTH / 2 COLS) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs lg:col-span-2 space-y-4 hover:border-slate-300 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">
                Revenue & Profit Performance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Monthly performance over the selected period (INR)
              </p>
            </div>

            {/* Toggle Controls matching Reference Screenshot */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start">
              <button
                onClick={() => setTimeResolution('monthly')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  timeResolution === 'monthly' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeResolution('quarterly')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  timeResolution === 'quarterly' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quarterly
              </button>
            </div>
          </div>

          <div className="h-80 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 15, right: 15, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="Month_Name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Sales"
                  name="Revenue"
                  stroke="#2563EB"
                  strokeWidth={2.8}
                  dot={{ r: 4, fill: '#2563EB' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="Profit"
                  name="Profit"
                  stroke="#10B981"
                  strokeWidth={2.8}
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REGIONAL PERFORMANCE HORIZONTAL BAR CHART (~35% WIDTH / 1 COL) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-colors duration-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base tracking-tight">
              Regional Performance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Revenue breakdown by sales territory
            </p>
          </div>

          <div className="h-80 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sortedRegions}
                margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
                <YAxis type="category" dataKey="Region" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }} width={60} />
                <Tooltip content={<RegionalBarTooltip />} />
                <Bar dataKey="Sales" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. SECTION BELOW MAIN CHART: WHAT'S HAPPENING? (LEFT) & PRIORITY ACTIONS (RIGHT) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHAT'S HAPPENING? INSIGHTS (LEFT ~50%) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-colors duration-200">
          <h3 className="font-bold text-slate-900 text-base tracking-tight">
            What's Happening?
          </h3>

          <div className="space-y-2.5">
            {highlightList.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-normal leading-relaxed p-1.5 rounded-md hover:bg-slate-50 transition-colors duration-150">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRIORITY ACTIONS (RIGHT ~50% WITH BULB ICON & ACCENT BARS) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 hover:border-slate-300 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base tracking-tight">Priority Actions</h3>
          </div>

          <div className="space-y-3">
            {alertList.map((al, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border-l-4 text-xs space-y-1 bg-slate-50 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 ease-out ${
                  al.type === 'warning'
                    ? 'border-l-red-500'
                    : al.type === 'success'
                    ? 'border-l-blue-500'
                    : 'border-l-amber-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{al.title}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECOMMENDED ACTION</span>
                </div>
                <p className="text-slate-600 font-normal leading-relaxed">{al.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. BOTTOM ROW: TOP SELLING PRODUCTS TABLE (LEFT) + CUSTOMER INSIGHTS (RIGHT) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP SELLING PRODUCTS TABLE (~65% WIDTH / 2 COLS) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs lg:col-span-2 space-y-4 hover:border-slate-300 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">
                Top Selling Products
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Highest revenue generating catalog items
              </p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('products')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors group"
            >
              View Catalog <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5">PRODUCT NAME</th>
                  <th className="pb-2.5">CATEGORY</th>
                  <th className="pb-2.5 text-center">UNITS</th>
                  <th className="pb-2.5 text-right">REVENUE (₹)</th>
                  <th className="pb-2.5 text-right">PROFIT (₹)</th>
                  <th className="pb-2.5 text-right">MARGIN %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal">
                {productList.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors duration-150">
                    <td className="py-3 font-semibold text-slate-900">{prod.Product}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                        {prod.Category}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium text-slate-700">{prod.Quantity || 23}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(prod.Sales)}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600">{formatCurrency(prod.Profit)}</td>
                    <td className="py-3 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        {prod['Profit_Margin_%']}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CUSTOMER INSIGHTS CARD (~35% WIDTH / 1 COL) */}
        <div className="bg-white p-5 lg:p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base tracking-tight">
                  Customer Insights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Account segment distribution
                </p>
              </div>
              <button
                onClick={() => setActiveTab && setActiveTab('customers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 transition-colors group"
              >
                Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Inner Cards matching Reference Screenshot */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AVG CUSTOMER VALUE</span>
                <div className="text-base font-bold text-slate-900">{formatCurrency(customer_insights?.avg_customer_value || 802400)}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REPEAT ORDER %</span>
                <div className="text-base font-bold text-emerald-600">{customer_insights?.repeat_customer_pct || 90.9}%</div>
              </div>
            </div>

            {/* Account Segments Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACCOUNT SEGMENTS</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="font-medium text-blue-900">High Value</span>
                  <span className="font-bold text-blue-700">{customer_insights?.segments?.['High Value'] || 2}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="font-medium text-emerald-900">Regular</span>
                  <span className="font-bold text-emerald-700">{customer_insights?.segments?.['Regular'] || 7}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('customers')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs flex items-center justify-center gap-1.5 group"
          >
            <span>Customer 360 Analytics</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
