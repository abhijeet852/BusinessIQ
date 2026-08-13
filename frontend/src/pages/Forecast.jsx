import React, { useEffect, useState } from 'react';
import { getSalesForecastML } from '../services/api';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const Forecast = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [horizon, setHorizon] = useState(3);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getSalesForecastML(horizon, filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load forecast data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, horizon]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { metrics, forecast_data } = data || {};

  return (
    <div className="space-y-6">
      {/* Forecast Controls Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Sales Forecasting Engine (INR)</h3>
          <p className="text-xs text-slate-500">Linear Trend Regression model (y = m * t + c) for future monthly sales projection in Indian Rupees</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Forecast Horizon:</label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={1}>1 Month Ahead</option>
            <option value={3}>3 Months Ahead</option>
            <option value={6}>6 Months Ahead</option>
            <option value={12}>12 Months Ahead</option>
          </select>
        </div>
      </div>

      {/* Model Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">MAE (Mean Abs Error)</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(metrics?.mae)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">RMSE (Root Mean Sq)</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(metrics?.rmse)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Model R² Score</span>
          <div className="mt-1 text-xl font-bold text-slate-900">{metrics?.r2_score}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Monthly Growth Slope</span>
          <div className="mt-1 text-xl font-bold text-blue-600">
            {metrics?.monthly_growth_rate >= 0 ? '+' : ''}{formatCurrency(metrics?.monthly_growth_rate)}/mo
          </div>
        </div>
      </div>

      {/* Recharts Forecast Trend Visualization */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-1">Historical vs. Projected Forecast Sales (INR)</h3>
        <p className="text-xs text-slate-500 mb-4">Historical actuals, in-sample fitted trend line, and future predictions in Indian Rupees</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast_data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="YearMonth" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => formatCompactCurrency(v)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="Actual_Sales" name="Historical Actual Sales (₹)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Fitted_Sales" name="In-Sample Fitted Trend (₹)" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              <Line type="monotone" dataKey="Forecast_Sales" name="Projected Future Forecast (₹)" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Monthly Forecast Output Table (INR)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Year-Month</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Actual Sales (₹)</th>
                <th className="py-3 px-4 text-right">Fitted Trend (₹)</th>
                <th className="py-3 px-4 text-right">Future Forecast (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {forecast_data?.map((row, idx) => (
                <tr key={idx} className={row.Type === 'Forecast' ? 'bg-amber-50/50 font-medium' : 'hover:bg-slate-50'}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.YearMonth}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${row.Type === 'Forecast' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                      {row.Type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{row.Actual_Sales ? formatCurrency(row.Actual_Sales) : '-'}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{row.Fitted_Sales ? formatCurrency(row.Fitted_Sales) : '-'}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-600">{row.Forecast_Sales ? formatCurrency(row.Forecast_Sales) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limitations Box */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
          <Info className="w-4 h-4 text-slate-500" /> Model Limitations & Assumptions
        </div>
        <p>• <strong>Linearity Constraint</strong>: Assumes constant growth rate slope ($m$), ignoring non-linear inflection points.</p>
        <p>• <strong>Seasonality</strong>: Short historical windows (1-2 years) lack multi-year cyclical signals to capture festive surges (e.g. Diwali sales spike).</p>
        <p>• <strong>Macroeconomic Factors</strong>: Does not account for external economic shifts, competitor pricing, or supply chain events.</p>
      </div>
    </div>
  );
};

export default Forecast;
