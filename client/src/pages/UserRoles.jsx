import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, UserPlus, UserCheck, Eye, EyeOff, Trash2, Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const UserRoles = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Create user form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER'
  });

  const loadUsers = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/system/users');
      setUsers(res.data);
      if (isManual) {
        setSuccessMsg('User accounts refreshed successfully.');
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load user accounts.');
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers(false);
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/system/users/${userId}`, { role: newRole });
      setSuccessMsg(`Role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(''), 2500);
      loadUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update role.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/system/users/${userId}`, { status: nextStatus });
      setSuccessMsg(`Account status set to ${nextStatus}`);
      setTimeout(() => setSuccessMsg(''), 2500);
      loadUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update account status.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to remove user account ${email}?`)) return;
    try {
      await api.delete(`/system/users/${userId}`);
      setSuccessMsg(`User deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 2500);
      loadUsers();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/system/users', newUser);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'VIEWER' });
      setSuccessMsg('New user created successfully.');
      setTimeout(() => setSuccessMsg(''), 2500);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950 flex items-center gap-2">
            <Shield className="text-blue-600" /> User Roles & Access Delegation
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Super Admin governance: Manage user accounts and assign Super Admin or Viewer roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadUsers(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh user accounts"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <UserPlus size={15} /> Add New User
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-blue-50/60 border border-blue-100 rounded-2xl">
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">Super Admin (HR)</div>
          <p className="text-[11px] text-blue-800 mt-1.5 leading-relaxed">
            Full system authority. Manages system settings, maintenance, audit logs, employee master records, and sensitive compensation files.
          </p>
        </div>

        <div className="p-5 bg-amber-50/60 border border-amber-100 rounded-2xl">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">Viewer</div>
          <p className="text-[11px] text-amber-800 mt-1.5 leading-relaxed">
            Restricted analytics only. Views total headcount, shift counts (day/night workers) and staff numbers. All sensitive fields are blocked.
          </p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-5">Name & Email</th>
              <th className="py-3 px-5">Current Role</th>
              <th className="py-3 px-5">Assign Role</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const isSelf = u.email === 'hr@smarthr.local';
              return (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-gray-900">{u.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'SUPER_ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {isSelf ? (
                      <span className="text-gray-400 text-xs italic">Primary Super Admin</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="soft-input py-1 text-xs max-w-[170px]"
                      >
                        <option value="VIEWER">VIEWER</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN (HR)</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => !isSelf && handleStatusChange(u.id, u.status)}
                      disabled={isSelf}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-red-50 text-red-700'
                      } ${!isSelf ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    >
                      {u.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete user account"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Add New User</h3>
            <p className="text-xs text-gray-400 mt-0.5">Create a team account and assign login credentials.</p>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="soft-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="soft-input"
                />
              </div>

              <div>
                <label className="soft-label">Password</label>
                <div className="relative">
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="soft-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    title={showNewUserPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="soft-label">Role Privilege</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="soft-input"
                >
                  <option value="VIEWER">Viewer (Public metrics only)</option>
                  <option value="SUPER_ADMIN">Super Admin / HR (Full system & employee management)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black hover:bg-gray-900 text-white font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
