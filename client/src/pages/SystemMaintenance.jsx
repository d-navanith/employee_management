import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShieldAlert, 
  Database, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Server
} from 'lucide-react';

const SystemMaintenance = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceNotice: '',
    systemVersion: 'v1.0.0',
    lastBackupAt: null
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        api.get('/system/settings'),
        api.get('/system/logs')
      ]);
      setSettings(settingsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load system maintenance info', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleMaintenance = async () => {
    setSavingSettings(true);
    try {
      const updated = {
        ...settings,
        maintenanceMode: !settings.maintenanceMode
      };
      const res = await api.put('/system/settings', updated);
      setSettings(res.data);
      setNoticeMessage(`Maintenance mode ${res.data.maintenanceMode ? 'ENABLED' : 'DISABLED'}`);
      setTimeout(() => setNoticeMessage(''), 3000);
      loadData();
    } catch (err) {
      alert('Failed to update maintenance setting');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await api.put('/system/settings', settings);
      setSettings(res.data);
      setNoticeMessage('Maintenance notice updated successfully.');
      setTimeout(() => setNoticeMessage(''), 3000);
    } catch (err) {
      alert('Failed to update notice');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.post('/system/backup');
      setNoticeMessage(res.data.message);
      setTimeout(() => setNoticeMessage(''), 3500);
      loadData();
    } catch (err) {
      alert('Backup execution failed.');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950 flex items-center gap-2.5">
            <Server className="text-blue-600" /> Super Admin: System Maintenance & Operations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Central administration console for system availability, database maintenance snapshots, and audit trail.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {noticeMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle size={15} /> {noticeMessage}
        </div>
      )}

      {/* Grid: Maintenance Mode Control, Database Snapshot & Secret Code Manager */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Maintenance Mode Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className={settings.maintenanceMode ? 'text-amber-500' : 'text-gray-400'} />
                System Maintenance
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.maintenanceMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {settings.maintenanceMode ? 'ACTIVE' : 'NORMAL'}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Locks non-administrative users out with a maintenance message.
            </p>

            <form onSubmit={handleSaveNotice} className="mt-4 space-y-3">
              <div>
                <label className="soft-label">Maintenance Notice Banner</label>
                <input
                  type="text"
                  value={settings.maintenanceNotice || ''}
                  onChange={(e) => setSettings({ ...settings, maintenanceNotice: e.target.value })}
                  placeholder="System undergoing scheduled maintenance..."
                  className="soft-input text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Save Notice
              </button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Toggle</span>
            <button
              onClick={handleToggleMaintenance}
              disabled={savingSettings}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer ${
                settings.maintenanceMode
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-gray-900 hover:bg-black'
              }`}
            >
              {settings.maintenanceMode ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {/* Card 2: Super Admin Secret Token Manager */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-blue-500" /> Super Admin Secret Token
              </span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                HR 2FA
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Secret security token required for Super Admin (HR) logins. Super Admin can only sign in if their token matches this value.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="soft-label">Active Secret Code</label>
                <input
                  type="text"
                  value={settings.superAdminSecretCode || 'HR7788'}
                  onChange={(e) => setSettings({ ...settings, superAdminSecretCode: e.target.value })}
                  className="soft-input text-xs font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Controls HR Access</span>
            <button
              onClick={handleSaveNotice}
              disabled={savingSettings}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Update Secret Token
            </button>
          </div>
        </div>

        {/* Card 3: Database Health & Snapshot Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Database size={18} className="text-emerald-500" /> Database & Health
              </span>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {settings.systemVersion}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Prisma ORM engine and relational integrity verification.
            </p>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Database Driver</span>
                <span className="font-mono font-medium text-gray-800">Prisma Client</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Last Snapshot</span>
                <span className="font-mono text-gray-700 text-[11px]">
                  {settings.lastBackupAt ? new Date(settings.lastBackupAt).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Snapshot</span>
            <button
              onClick={handleTriggerBackup}
              disabled={backupLoading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {backupLoading ? 'Running...' : 'Create Snapshot'}
            </button>
          </div>
        </div>

      </div>

      {/* System Audit Logs */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> System Audit Trail
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Live audit events recorded by backend controller triggers
            </p>
          </div>
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
            {logs.length} logged events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/70">
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Performed By</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4">Level</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-gray-900">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                    {log.performedBy}
                  </td>
                  <td className="py-3 px-4 text-gray-700 max-w-md truncate">
                    {log.details || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.level === 'WARN' ? 'bg-amber-100 text-amber-800' :
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString()}
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

export default SystemMaintenance;
