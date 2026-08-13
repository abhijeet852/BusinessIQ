import React, { useEffect, useState } from 'react';
import { getProductsData, getProfitabilityMatrix } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Package, Star, TrendingUp, AlertTriangle, Layers } from 'lucide-react';

const Products = ({ filters }) => {
  const [data, setData] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, matRes] = await Promise.all([
          getProductsData(filters),
          getProfitabilityMatrix(filters),
        ]);
        setData(prodRes);
        setMatrix(matRes);
      } catch (err) {
        console.error('Failed to load product data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters]);

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  const { total_products, products } = data || {};
  const quadrants = matrix?.quadrants || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Product Analytics & Profitability</h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Product performance catalog, unit volumes, profit margins, and 2x2 Profitability Matrix positioning.
        </p>
      </div>

      {/* 2x2 Profitability Matrix Quadrants */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Catalog Profitability Matrix (2x2)</h3>
          <span className="text-xs text-slate-400 font-semibold">Revenue vs Profit Margin Quadrants</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quadrant 1: Stars */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">STARS (HIGH REV / HIGH MARGIN)</span>
              <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-950">{quadrants.stars?.length || 0} Products</div>
            <p className="text-[11px] text-emerald-800">High revenue drivers with healthy profit margins.</p>
          </div>

          {/* Quadrant 2: Volume Drivers */}
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">VOLUME DRIVERS (HIGH REV / LOW MARGIN)</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-extrabold text-blue-950">{quadrants.volume_drivers?.length || 0} Products</div>
            <p className="text-[11px] text-blue-800">High volume sales; optimization needed for margins.</p>
          </div>

          {/* Quadrant 3: Niche Growth */}
          <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">NICHE GROWTH (LOW REV / HIGH MARGIN)</span>
              <Package className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-extrabold text-purple-950">{quadrants.niche_growth?.length || 0} Products</div>
            <p className="text-[11px] text-purple-800">High profit margin per unit; scale marketing reach.</p>
          </div>

          {/* Quadrant 4: Underperformers */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">UNDERPERFORMERS (LOW REV / LOW MARGIN)</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-extrabold text-amber-950">{quadrants.underperformers?.length || 0} Products</div>
            <p className="text-[11px] text-amber-800">Low revenue & margin; review pricing or discontinue.</p>
          </div>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Product Performance Catalog</h3>
            <p className="text-xs text-slate-500 mt-0.5">Revenue, units sold, and profit margins per product in Indian Rupees</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{total_products} Catalog Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Profit (₹)</th>
                <th className="py-3 px-4 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {products?.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{prod.Product}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {prod.Category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{prod.Quantity}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatCurrency(prod.Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(prod.Profit)}</td>
                  <td className="py-3.5 px-4 text-right">
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
  );
};

export default Products;
