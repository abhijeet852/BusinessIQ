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
  Layers,
  Lightbulb,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800 animate-fade-in">
        <div className="font-bold text-slate-300 pb-1 border-b border-slate-800">{label}</div>
        <div className="flex items-center justify-between gap-6 pt-0.5">
          <span className="text-slate-400">Revenue:</span>
          <span className="font-extrabold text-blue-400">{formatCurrency(sales)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-slate-400">Profit:</span>
          <span className="font-extrabold text-emerald-400">{formatCurrency(profit)}</span>
        </div>
        <div className="flex items-center justify-between gap-6 pt-1 border-t border-slate-800/80">
          <span className="text-slate-400">Profit Margin:</span>
          <span className="font-bold text-amber-400">{margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Circular Business Health Gauge Score
const HealthRingGauge = ({ score = 71, status = 'Moderate' }) => {
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke={score >= 80 ? '#10B981' : score >= 60 ? '#2563EB' : '#F59E0B'}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-black text-slate-900 leading-none">{score}</div>
        <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">/ 100</div>
      </div>
    </div>
  );
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

  // Skeleton Loader for initial fetch
  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-36 bg-slate-200 rounded-xl md:col-span-2"></div>
          <div className="h-36 bg-slate-200 rounded-xl"></div>
          <div className="h-36 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl"></div>
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
  const topProductOpportunity = top_products && top_products.length > 0 ? top_products[0] : null;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* =================================================================== */}
      {/* 1. HERO SECTION: BUSINESS OVERVIEW & BUSINESS HEALTH GAUGE SCORE   */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3 text-blue-600" /> Business Overview
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Your business is performing well this period.
          </h1>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Revenue is up <strong className="text-slate-900">12.4%</strong>, net profit margin stands at <strong className="text-slate-900">23.9%</strong>, and customer retention remains strong at <strong className="text-slate-900">90.9%</strong>.
          </p>

          {/* Health Score Component Factors Pills */}
          {healthData?.components && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
              <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-600">
                Revenue Trend: <strong className="text-slate-900">{healthData.components.revenue_growth?.score}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-600">
                Profit Margin: <strong className="text-slate-900">{healthData.components.profitability?.score}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-600">
                Retention: <strong className="text-slate-900">{healthData.components.customer_retention?.score}</strong>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium text-slate-600">
                Catalog Consistency: <strong className="text-slate-900">{healthData.components.catalog_consistency?.score}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Business Health Gauge Ring Score */}
        {healthData && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-shrink-0">
            <HealthRingGauge score={healthData.health_score} status={healthData.status} />
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">BUSINESS HEALTH</span>
              <div className="text-base font-extrabold text-slate-900">{healthData.status}</div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                Score Formula 0–100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. RE-ENGINEERED KPI SECTION (VISUAL HIERARCHY)                     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* PRIMARY HERO KPI: TOTAL REVENUE (VISUALLY DOMINANT CARD) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRIMARY METRIC • TOTAL REVENUE</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs prev period
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                {formatCurrency(kpis?.total_sales, true)}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Gross sales revenue generated across all regions and categories
              </p>
            </div>
            <Sparkline color="#60A5FA" data={[12, 15, 18, 14, 22, 28, 25, 32]} />
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Average Order Value: <strong className="text-white">{formatCurrency(kpis?.avg_order_value)}</strong></span>
            <span>Target Achievement: <strong className="text-emerald-400">104.2%</strong></span>
          </div>
        </div>

        {/* SECONDARY KPI 1: TOTAL PROFIT */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PROFIT</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis?.total_profit, true)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" /> +8.1% vs prev period
            </div>
          </div>
          <Sparkline color="#10B981" data={[8, 10, 12, 11, 16, 20, 19, 24]} />
        </div>

        {/* SECONDARY KPI 2: ORDERS & CUSTOMERS */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ORDERS & ACCOUNTS</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-semibold">Orders:</span>
              <span className="text-lg font-black text-slate-900">{kpis?.total_orders?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-semibold">Customers:</span>
              <span className="text-lg font-black text-slate-900">{kpis?.total_customers?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Sparkline color="#8B5CF6" data={[5, 8, 10, 7, 12, 15, 14, 18]} />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN PERFORMANCE CENTERPIECE (REVENUE & PROFIT LINE CHART)       */}
      {/* =================================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-black text-slate-900 text-base tracking-tight">Revenue & Profit Performance</h2>
            <p className="text-xs text-slate-500 mt-0.5">How business performance changed over time (INR)</p>
          </div>

          {/* Controls: Monthly / Quarterly Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs self-start">
            <button
              onClick={() => setTimeResolution('monthly')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                timeResolution === 'monthly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeResolution('quarterly')}
              className={`px-3 py-1 rounded-md font-semibold transition-all ${
                timeResolution === 'quarterly' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 15, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="Month_Name" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip content={<CustomChartTooltip />} />
              <Line type="monotone" dataKey="Sales" name="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="Profit" name="Profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. WHAT'S HAPPENING? (INTELLIGENT OBSERVATIONS) & PRIORITY ACTIONS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHAT'S HAPPENING? INSIGHTS */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-black text-slate-900 text-sm tracking-tight">WHAT'S HAPPENING?</h3>
          </div>

          <div className="space-y-3">
            {business_highlights?.map((hl, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span className="text-slate-700 font-medium leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRIORITY RECOMMENDED ACTIONS */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h3 className="font-black text-slate-900 text-sm tracking-tight">PRIORITY ACTIONS</h3>
          </div>

          <div className="space-y-3">
            {alerts?.map((al, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">{al.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200/60 text-amber-950">Recommended Action</span>
                </div>
                <p className="text-amber-950 font-medium leading-relaxed">{al.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. REGIONAL PERFORMANCE RANKING & CUSTOMER HEALTH                  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REGIONAL PERFORMANCE RANKING (CUSTOM LIST LAYOUT) */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm tracking-tight">REGIONAL PERFORMANCE</h3>
            <span className="text-xs text-slate-400 font-semibold">Territory Revenue Ranking</span>
          </div>

          <div className="space-y-3">
            {sortedRegions.map((reg, idx) => (
              <div key={reg.Region} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                    idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{reg.Region} Territory</div>
                    <div className="text-[11px] text-slate-500">{reg.Order_Count} Orders • {reg['Sales_Share_%']}% Market Share</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-slate-900 text-sm">{formatCurrency(reg.Sales)}</div>
                  <div className="text-[10px] font-bold text-emerald-600">Margin {reg['Profit_Margin_%']}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMER HEALTH */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm tracking-tight">CUSTOMER HEALTH</h3>
              <button
                onClick={() => setActiveTab && setActiveTab('customers')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                View Customer Analytics <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ACTIVE</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{customer_insights?.total_customers}</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">REPEAT RATE</span>
                <div className="text-lg font-black text-emerald-600 mt-0.5">{customer_insights?.repeat_customer_pct}%</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">HIGH CHURN</span>
                <div className="text-lg font-black text-red-600 mt-0.5">{customer_insights?.segments?.['At Risk'] || 0}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACCOUNT SEGMENTS</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="font-bold text-blue-900">High Value</span>
                  <span className="font-extrabold text-blue-700">{customer_insights?.segments?.['High Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="font-bold text-emerald-900">Regular</span>
                  <span className="font-extrabold text-emerald-700">{customer_insights?.segments?.['Regular'] || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('customers')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            Inspect Customer 360 Profiles <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. PRODUCT PERFORMANCE TABLE & TOP OPPORTUNITY INSIGHT CALLOUT     */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCT PERFORMANCE TABLE (2 COLS) */}
        <div className="bg-white p-5.5 rounded-2xl border border-slate-200/90 shadow-2xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm tracking-tight">PRODUCT PERFORMANCE</h3>
                <p className="text-xs text-slate-500 mt-0.5">Products driving revenue and profitability</p>
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
                    <th className="pb-2.5 text-right">Revenue (₹)</th>
                    <th className="pb-2.5 text-right">Profit (₹)</th>
                    <th className="pb-2.5 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {top_products?.map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{prod.Product}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {prod.Category}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold text-slate-900">{formatCurrency(prod.Sales)}</td>
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

        {/* TOP PRODUCT OPPORTUNITY CALLOUT CARD (1 COL) */}
        {topProductOpportunity && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5.5 rounded-2xl border border-blue-200/80 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> TOP OPPORTUNITY
              </div>
              <h4 className="text-base font-black text-blue-950 tracking-tight">{topProductOpportunity.Product}</h4>
              <div className="mt-2 text-xs font-bold text-blue-900">
                {formatCurrency(topProductOpportunity.Sales)} Revenue • {topProductOpportunity['Profit_Margin_%']}% Margin
              </div>
              <p className="text-xs text-blue-900/80 mt-2 leading-relaxed font-medium">
                Strong revenue contribution with room for margin optimization. Consider reviewing catalog bulk volume discounts.
              </p>
            </div>

            <button
              onClick={() => setActiveTab && setActiveTab('products')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
            >
              Analyze Product Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
