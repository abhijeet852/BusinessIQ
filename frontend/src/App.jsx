import React, { useState, useEffect } from 'react';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Regions from './pages/Regions';
import Forecast from './pages/Forecast';
import SegmentationML from './pages/SegmentationML';
import ChurnML from './pages/ChurnML';
import DataManagement from './pages/DataManagement';
import Reports from './pages/Reports';
import { getFilterOptions } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('datapulse_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterOptions, setFilterOptions] = useState(null);
  const [filters, setFilters] = useState({
    region: 'All',
    category: 'All',
    product: 'All',
  });

  useEffect(() => {
    // Check saved authentication session
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('datapulse_user');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    };
    checkAuth();
  }, [token]);

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

  const handleLoginSuccess = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('datapulse_token', accessToken);
    localStorage.setItem('datapulse_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('datapulse_token');
    localStorage.removeItem('datapulse_user');
  };

  // Standard authentication check: if not logged in, render Login page
  if (!user || !token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
      case 'data_management':
        return <DataManagement />;
      case 'forecast':
        return <Forecast filters={filters} />;
      case 'segmentation':
        return <SegmentationML filters={filters} />;
      case 'churn':
        return <ChurnML filters={filters} />;
      case 'reports':
        return <Reports filters={filters} />;
      case 'settings':
        return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-4">
            <h3 className="font-bold text-slate-900 text-base">DATAPULSE System Settings</h3>
            <div className="text-xs text-slate-600 space-y-2">
              <p>• <strong>API Endpoint Base URL</strong>: <code>https://businessiq.onrender.com/api</code></p>
              <p>• <strong>Authentication Engine</strong>: Signed JWT Bearer Security Tokens + PBKDF2 Password Hashing</p>
              <p>• <strong>Authenticated User</strong>: <code>{user.email}</code> ({user.name})</p>
              <p>• <strong>Database Engine</strong>: Relational MySQL / SQLite Normalized 3NF Schema</p>
            </div>
          </div>
        );
      default:
        return <Dashboard filters={filters} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filters={filters}
      setFilters={setFilters}
      filterOptions={filterOptions}
      user={user}
      onLogout={handleLogout}
    >
      {renderActiveTab()}
    </Layout>
  );
}

export default App;
