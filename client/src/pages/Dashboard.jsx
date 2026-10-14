import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Filter, MoreHorizontal, PieChart as PieIcon, RefreshCw, Moon, Sun, Briefcase, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHiresThisYear: 0,
    employeeExitsThisYear: 0,
    employeesJoiningThisQuarter: 0,
    employeesRelievingThisQuarter: 0,
    dayShiftWorkers: 0,
    nightShiftWorkers: 0,
    generalShiftWorkers: 0,
    staffCount: 0,
    workerCount: 0,
    designationWiseCount: [],
    departmentWiseCount: [],
    lastSynced: 'Just now'
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');

  const fetchStats = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/stats/dashboard');
      setStats(res.data);
      if (isManual) {
        setSyncNotice('Dashboard analytics synchronized!');
        setTimeout(() => setSyncNotice(''), 2500);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
      if (isManual) {
        setSyncNotice('Failed to sync dashboard.');
        setTimeout(() => setSyncNotice(''), 2500);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Analytics Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Workforce overview, shift allocation, and structural metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {syncNotice && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              {syncNotice}
            </span>
          )}
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-950 bg-white border border-gray-200 hover:bg-gray-50 px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>

      {/* Row 1: 3 Stat Cards matching screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">Total Employees</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.totalEmployees}
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">New Hires (This Year)</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.newHiresThisYear}
          </div>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="text-sm font-medium text-gray-500">Employee Exits (This Year)</div>
          <div className="text-4xl font-semibold text-gray-900 mt-3">
            {stats.employeeExitsThisYear}
          </div>
        </div>
      </div>

      {/* Row 2: 2 Stat Cards matching screenshot 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

      {/* Shift & Staff Workforce Distribution Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Day Shift</span>
            <Sun size={18} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.dayShiftWorkers}</div>
          <span className="text-xs font-medium text-amber-800">Operational morning shift</span>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Night Shift</span>
            <Moon size={18} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.nightShiftWorkers}</div>
          <span className="text-xs font-medium text-indigo-800">Overnight manufacturing rotation</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff Members</span>
            <Briefcase size={18} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.staffCount}</div>
          <span className="text-xs font-medium text-emerald-800">Core administrative & executive</span>
        </div>

        <div className="bg-sky-50/70 border border-sky-200/60 rounded-2xl p-5">
          <div className="flex items-center justify-between text-sky-700">
            <span className="text-xs font-semibold uppercase tracking-wider">Shift Workers</span>
            <Users size={18} />
          </div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.workerCount}</div>
          <span className="text-xs font-medium text-sky-800">Plant & field workforce</span>
        </div>
      </div>

      {/* Row 3: Designation & Department Wise Count Cards matching screenshot 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designation Wise */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Designation Wise Employee Count
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

          <div className="mt-6">
            {stats.designationWiseCount && stats.designationWiseCount.length > 0 ? (
              <div className="space-y-3.5">
                {stats.designationWiseCount.map((item) => {
                  const pct = stats.totalEmployees > 0 
                    ? Math.round((item.count / stats.totalEmployees) * 100) 
                    : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="text-gray-500 shrink-0">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-gray-400">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 mb-2">
                  <PieIcon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-400">No data yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Department Wise */}
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

          <div className="mt-6">
            {stats.departmentWiseCount && stats.departmentWiseCount.length > 0 ? (
              <div className="space-y-3.5">
                {stats.departmentWiseCount.map((item) => {
                  const pct = stats.totalEmployees > 0 
                    ? Math.round((item.count / stats.totalEmployees) * 100) 
                    : 0;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="text-gray-500 shrink-0">{item.count}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-gray-400">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-300 mb-2">
                  <PieIcon size={20} />
                </div>
                <span className="text-xs font-medium text-gray-400">No data yet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
