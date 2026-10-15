import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Filter, MoreHorizontal, PieChart as PieIcon, RefreshCw } from 'lucide-react';

const Home = () => {
  const { user, isSuperAdmin, isViewer } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    employeesJoiningThisQuarter: 0,
    employeesRelievingThisQuarter: 0,
    dayShiftWorkers: 0,
    nightShiftWorkers: 0,
    staffCount: 0,
    departmentWiseCount: [],
    lastSynced: 'Just now'
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);

    // Auto-sync dashboard metrics on window focus and every 10 seconds
    const handleFocus = () => fetchStats(true);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const getWelcomeTitle = () => {
    if (isSuperAdmin) return 'Welcome Super Admin';
    if (isViewer) return 'Welcome Viewer';
    return `Welcome ${user?.name || 'User'}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-950 tracking-tight">
          {getWelcomeTitle()}
        </h1>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Top 3 Stat Cards matching screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">Total Employees</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.totalEmployees}
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">Employees Joining (This Quarter)</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.employeesJoiningThisQuarter}
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">Employees Relieving (This Quarter)</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.employeesRelievingThisQuarter}
          </div>
        </div>
      </div>

      {/* Shift & Staff Quick Summary Row (especially important for Viewer requirements!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Day Shift Workers</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.dayShiftWorkers}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Scheduled for standard day shift</p>
        </div>

        <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Night Shift Workers</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.nightShiftWorkers}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Plant & operations night rotation</p>
        </div>

        <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Count</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">
            {stats.staffCount}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Core administrative & engineering staff</p>
        </div>
      </div>

      {/* Department Wise Employee Count Card matching screenshot 4 */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Department Wise Employee Count
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Last synced {stats.lastSynced}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="mt-8">
          {stats.departmentWiseCount && stats.departmentWiseCount.length > 0 ? (
            <div className="space-y-4 max-w-2xl">
              {stats.departmentWiseCount.map((dept) => {
                const percentage = stats.totalEmployees > 0 
                  ? Math.round((dept.count / stats.totalEmployees) * 100) 
                  : 0;
                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                      <span>{dept.name}</span>
                      <span className="text-gray-500">{dept.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-gray-400">
              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 mb-3">
                <PieIcon size={22} />
              </div>
              <span className="text-sm font-medium text-gray-400">No data yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
