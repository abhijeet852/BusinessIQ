import React, { useEffect, useState } from 'react';
import { getProductsData } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Package } from 'lucide-react';

const Products = ({ filters }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getProductsData(filters);
        setData(res);
      } catch (err) {
        console.error('Failed to load product data', err);
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

  const { total_products, products } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Banner Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Catalog Products</span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{total_products} Products</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
          <Package className="w-6 h-6" />
        </div>
      </div>

      {/* Product Catalog Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Product Performance Catalog (INR)</h3>
            <p className="text-xs text-slate-500">Revenue, units sold, and profit margins per product in Indian Rupees</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Profit (₹)</th>
                <th className="py-3 px-4 text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {products?.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{prod.Product}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {prod.Category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-600 font-medium">{prod.Quantity}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">{formatCurrency(prod.Sales)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(prod.Profit)}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">{prod['Profit_Margin_%']}%</td>
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
