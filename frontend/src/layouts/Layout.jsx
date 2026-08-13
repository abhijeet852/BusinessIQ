import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  Globe,
  LineChart,
  UserCheck,
  ShieldAlert,
  Database,
  FileSpreadsheet,
  Settings,
  User,
  Menu,
  X,
  Zap,
  Filter,
  Calendar,
  LogOut,
  Shield,
} from 'lucide-react';

const Layout = ({ activeTab, setActiveTab, children, filters, setFilters, filterOptions, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Grouped Navigation Structure for DataPulse
  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'sales', name: 'Sales Analytics', icon: TrendingUp },
        { id: 'customers', name: 'Customer Analytics', icon: Users },
        { id: 'products', name: 'Product Analytics', icon: Package },
        { id: 'regions', name: 'Regional Analysis', icon: Globe },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'segmentation', name: 'Customer Segments', icon: UserCheck },
        { id: 'churn', name: 'Churn Prediction', icon: ShieldAlert },
        { id: 'forecast', name: 'Sales Forecast', icon: LineChart },
      ],
    },
    {
      title: 'DATA',
      items: [{ id: 'data_management', name: 'Data Management', icon: Database }],
    },
    {
      title: 'REPORTING',
      items: [{ id: 'reports', name: 'Reports', icon: FileSpreadsheet }],
    },
    {
      title: 'SYSTEM',
      items: [{ id: 'settings', name: 'Settings', icon: Settings }],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight">DATAPULSE</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Dark Navy Grouped Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800 z-30`}
      >
        <div className="overflow-y-auto">
          {/* Logo & Platform Title */}
          <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-slate-800/80">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-extrabold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none">DATAPULSE</h1>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Business Data Intelligence</p>
            </div>
          </div>

          {/* Grouped Navigation */}
          <nav className="px-3 py-4 space-y-4">
            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Footer & Logout Button */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-700/80 flex items-center justify-center text-slate-300 font-semibold text-xs border border-slate-600/60">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
              <div className="text-xs truncate">
                <div className="font-semibold text-slate-200 text-[11px] truncate">{user?.name || 'Abhijeet Admin'}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    user?.role === 'ADMIN' ? 'bg-purple-900/80 text-purple-200 border border-purple-700' : 'bg-blue-900/80 text-blue-200 border border-blue-700'
                  }`}>
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              DATA PULSE — Executive Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sales, customer analytics, data quality, and machine-learning decision support.
            </p>
          </div>

          {/* Unified Filter Area Bar */}
          {filterOptions && (
            <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filters</span>
              </div>

              {/* Date Preset Filter */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filters.date_preset || 'all'}
                  onChange={(e) => setFilters({ ...filters, date_preset: e.target.value })}
                  className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">This Year</option>
                </select>
              </div>

              {/* Region Selector */}
              <div className="bg-white border border-slate-200 rounded-md px-2 py-1 shadow-2xs">
                <select
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                  className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  {filterOptions.regions?.map((r) => (
                    <option key={r} value={r}>
                      {r === 'All' ? 'All Regions' : r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="bg-white border border-slate-200 rounded-md px-2 py-1 shadow-2xs">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="bg-transparent text-slate-700 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  {filterOptions.categories?.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              {(filters.region !== 'All' || filters.category !== 'All' || (filters.date_preset && filters.date_preset !== 'all')) && (
                <button
                  onClick={() => setFilters({ ...filters, region: 'All', category: 'All', product: 'All', date_preset: 'all' })}
                  className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:bg-blue-50 rounded transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </header>

        <div className="p-6 flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
