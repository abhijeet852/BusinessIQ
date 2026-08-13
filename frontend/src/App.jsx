import React, { useState, useEffect } from 'react';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Regions from './pages/Regions';
import Forecast from './pages/Forecast';
import SegmentationML from './pages/SegmentationML';
import ChurnML from './pages/ChurnML';
import DataUpload from './pages/DataUpload';
import Reports from './pages/Reports';
import { getFilterOptions } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState({
    region: 'All',
    category: 'All',
    product: 'All',
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchOptions();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard filters={filters} setActiveTab={setActiveTab} />;
      case 'sales':
        return <Sales filters={filters} />;
      case 'customers':
        return <Customers filters={filters} />;
      case 'products':
        return <Products filters={filters} />;
      case 'regions':
        return <Regions filters={filters} />;
      case 'forecast':
        return <Forecast filters={filters} />;
      case 'segmentation':
        return <SegmentationML filters={filters} />;
      case 'churn':
        return <ChurnML filters={filters} />;
      case 'upload':
        return <DataUpload />;
      case 'reports':
        return <Reports filters={filters} />;
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Platform Settings</h3>
            <div className="text-xs text-slate-600 space-y-2">
              <p>• <strong>API Endpoint Base URL</strong>: <code>http://localhost:8000/api</code></p>
              <p>• <strong>Database Engine</strong>: Relational MySQL / SQLite Normalized 3NF Schema</p>
              <p>• <strong>Machine Learning Libraries</strong>: Scikit-Learn (1.8.0), Pandas (3.0.2), NumPy (2.4.4)</p>
            </div>
          </div>
        );
      default:
        return <Dashboard filters={filters} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filters={filters}
      setFilters={setFilters}
      filterOptions={filterOptions}
    >
      {renderActiveTab()}
    </Layout>
  );
}

export default App;
