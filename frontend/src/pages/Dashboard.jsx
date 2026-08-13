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
  ChevronRight,
  AlertTriangle,
  Zap,
  Lightbulb,
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
    <svg className="w-20 h-9 overflow-visible opacity-80" viewBox="0 0 100 40">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={points} />
    </svg>
  );
};

// Refined Chart Tooltip Component
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sales = payload.find((p) => p.dataKey === 'Sales')?.value || 0;
    const profit = payload.find((p) => p.dataKey === 'Profit')?.value || 0;
    const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800 animate-fade-in font-sans">
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
          <span className="text-slate-400 font-normal">Profit Margin:</span>
          <span className="font-semibold text-amber-400">{margin}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Circular Business Health Gauge Score
const HealthRingGauge = ({ score = 71 }) => {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="36" stroke="#F1F5F9" strokeWidth="7" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke={score >= 80 ? '#10B981' : score >= 60 ? '#2563EB' : '#F59E0B'}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-slate-900 leading-none">{score}</div>
        <div className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">/ 100</div>
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

  // Skeleton Loader while loading
  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 rounded-xl md:col-span-2"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
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
  const topProductOpportunity = productList.length > 0 ? productList[0] : null;

  const highlightList = Array.isArray(business_highlights) ? business_highlights : [];
  const alertList = Array.isArray(alerts) ? alerts : (alerts && Array.isArray(alerts.alerts) ? alerts.alerts : []);

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      {/* =================================================================== */}
      {/* 1. HERO SECTION: BUSINESS OVERVIEW & INTEGRATED HEALTH SCORE       */}
      {/* =================================================================== */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-medium">
            <Zap className="w-3.5 h-3.5 text-blue-600" /> Executive Summary
          </div>

          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            Your business is performing well this period.
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            Revenue is up <strong className="text-slate-800 font-semibold">12.4%</strong>, profit margin is <strong className="text-slate-800 font-semibold">23.9%</strong>, and customer retention is <strong className="text-slate-800 font-semibold">90.9%</strong>.
          </p>

          {/* Compact Factor Indicators (Unboxed) */}
          {healthData?.components && (
            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-normal text-slate-600">
              <span className="px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/60">
                Revenue Trend: <strong className="text-slate-800 font-semibold">{healthData.components.revenue_growth?.score}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/60">
                Profit Margin: <strong className="text-slate-800 font-semibold">{healthData.components.profitability?.score}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/60">
                Retention: <strong className="text-slate-800 font-semibold">{healthData.components.customer_retention?.score}</strong>
              </span>
              <span className="px-2.5 py-1 bg-slate-50 rounded-md border border-slate-200/60">
                Catalog Margin: <strong className="text-slate-800 font-semibold">{healthData.components.catalog_consistency?.score}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Integrated Circular Health Score Gauge */}
        {healthData && (
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-shrink-0">
            <HealthRingGauge score={healthData.health_score} />
            <div className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Health Score</span>
              <div className="text-base font-bold text-slate-900">{healthData.status}</div>
              <span className="text-[10px] text-slate-500 font-normal block">Composite Health Index</span>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. REFINED KPI SECTION (PRIMARY REVENUE + COMPACT SUPPORTING)       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* PRIMARY METRIC: TOTAL REVENUE */}
        <div className="md:col-span-2 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs previous period
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(kpis?.total_sales, true)}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-normal">
                Gross sales revenue generated across all regions
              </p>
            </div>
            <Sparkline color="#60A5FA" data={[12, 15, 18, 14, 22, 28, 25, 32]} />
          </div>

          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Average Order Value: <strong className="text-white font-medium">{formatCurrency(kpis?.avg_order_value)}</strong></span>
            <span>Target Achievement: <strong className="text-emerald-400 font-medium">104.2%</strong></span>
          </div>
        </div>

        {/* SUPPORTING METRIC 1: PROFIT */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Profit</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(kpis?.total_profit, true)}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-emerald-600">
              <ArrowUpRight className="w-3 h-3" /> +8.1% vs previous
            </div>
          </div>
          <Sparkline color="#10B981" data={[8, 10, 12, 11, 16, 20, 19, 24]} />
        </div>

        {/* SUPPORTING METRIC 2: ORDERS & CUSTOMERS */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Orders & Accounts</span>
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2 space-y-1 text-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-500 font-normal">Orders:</span>
              <span className="text-base font-bold text-slate-900">{kpis?.total_orders?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-slate-500 font-normal">Active Customers:</span>
              <span className="text-base font-bold text-slate-900">{kpis?.total_customers?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <Sparkline color="#8B5CF6" data={[5, 8, 10, 7, 12, 15, 14, 18]} />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. REVENUE & PROFIT PERFORMANCE CHART CENTERPIECE                   */}
      {/* =================================================================== */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base tracking-tight">Revenue & Profit Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">How business performance changed over time (INR)</p>
          </div>

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

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 15, right: 20, left: 10, bottom: 0 }}>
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

      {/* =================================================================== */}
      {/* 4. WHAT'S HAPPENING? & PRIORITY ACTIONS (REFINED & COMPACT)         */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHAT'S HAPPENING? INSIGHTS (CLEAN UNBOXED LIST) */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base tracking-tight">What's Happening?</h3>
          </div>

          <div className="space-y-2.5">
            {highlightList.map((hl, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 py-1 border-b border-slate-100 last:border-0 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                <span className="leading-relaxed">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRIORITY ACTIONS (ACCENT INDICATORS) */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-slate-900 text-base tracking-tight">Priority Actions</h3>
          </div>

          <div className="space-y-2.5">
            {alertList.map((al, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 text-xs space-y-1 bg-slate-50 ${
                  al.type === 'warning'
                    ? 'border-l-red-500'
                    : al.type === 'success'
                    ? 'border-l-blue-500'
                    : 'border-l-amber-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-xs">{al.title}</span>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Recommended Action</span>
                </div>
                <p className="text-slate-600 font-normal leading-relaxed">{al.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 5. REGIONAL PERFORMANCE RANKING & CUSTOMER HEALTH                  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REGIONAL PERFORMANCE (CLEAN NUMBERED LIST) */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 text-base tracking-tight">Regional Performance</h3>
            <span className="text-xs text-slate-400 font-normal">Territory Ranking</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {sortedRegions.map((reg, idx) => (
              <div key={reg.Region} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-semibold ${idx === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                    0{idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 text-xs">{reg.Region} Territory</span>
                    <span className="text-[11px] text-slate-500 block font-normal">{reg.Order_Count} Orders</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 text-xs block">{formatCurrency(reg.Sales)}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{reg['Sales_Share_%']}% Share</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMER HEALTH */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-base tracking-tight">Customer Health</h3>
              <button
                onClick={() => setActiveTab && setActiveTab('customers')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
              >
                Inspect Accounts <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-medium text-slate-400 uppercase block">Active</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">{customer_insights?.total_customers}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-medium text-slate-400 uppercase block">Repeat Rate</span>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">{customer_insights?.repeat_customer_pct}%</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-medium text-slate-400 uppercase block">High Churn</span>
                <div className="text-lg font-bold text-red-600 mt-0.5">{customer_insights?.segments?.['At Risk'] || 0}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Account Segments</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="font-medium text-blue-900">High Value</span>
                  <span className="font-bold text-blue-700">{customer_insights?.segments?.['High Value'] || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="font-medium text-emerald-900">Regular</span>
                  <span className="font-bold text-emerald-700">{customer_insights?.segments?.['Regular'] || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('customers')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5"
          >
            Customer 360 Analytics <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 6. PRODUCT PERFORMANCE TABLE & COMPACT TOP OPPORTUNITY             */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCT PERFORMANCE TABLE */}
        <div className="bg-white p-5.5 rounded-xl border border-slate-200/80 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 text-base tracking-tight">Product Performance</h3>
              <p className="text-xs text-slate-500 font-normal">Products driving revenue and profitability</p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('products')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Catalog <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Revenue (₹)</th>
                  <th className="pb-2 text-right">Profit (₹)</th>
                  <th className="pb-2 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-normal">
                {productList.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-900">{prod.Product}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {prod.Category}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(prod.Sales)}</td>
                    <td className="py-2.5 text-right font-medium text-emerald-600">{formatCurrency(prod.Profit)}</td>
                    <td className="py-2.5 text-right">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        {prod['Profit_Margin_%']}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMPACT TOP OPPORTUNITY CALLOUT */}
        {topProductOpportunity && (
          <div className="bg-blue-50/70 p-5.5 rounded-xl border border-blue-100 shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-blue-700 text-[10px] font-medium uppercase tracking-wider block mb-1">Top Opportunity</span>
              <h4 className="text-base font-bold text-blue-950 tracking-tight">{topProductOpportunity.Product}</h4>
              <div className="mt-1.5 text-xs font-semibold text-blue-900">
                {formatCurrency(topProductOpportunity.Sales)} Revenue • {topProductOpportunity['Profit_Margin_%']}% Margin
              </div>
              <p className="text-xs text-blue-900/80 mt-2 leading-relaxed font-normal">
                Strong revenue contribution with room for margin optimization. Consider reviewing catalog bulk volume pricing.
              </p>
            </div>

            <button
              onClick={() => setActiveTab && setActiveTab('products')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1"
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
