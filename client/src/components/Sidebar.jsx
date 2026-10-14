import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  Cpu,
  UserCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isSuperAdmin, isViewer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'SUPER ADMIN';
    if (isViewer) return 'VIEWER PORTAL';
    return user?.role || 'USER';
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4 shrink-0">
      <div>
        {/* Brand & Logo matching screenshots */}
        <div className="flex items-center gap-3 px-2 pb-6 border-b border-gray-200">
          <div className="w-11 h-11 rounded-lg bg-black flex items-center justify-center p-1.5 shadow-sm">
            {/* Hexagonal emerald icon */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 stroke-current" fill="none" strokeWidth="6">
              <polygon points="50 3, 90 25, 90 75, 50 97, 10 75, 10 25" strokeLinejoin="round" />
              <polygon points="50 18, 80 34, 80 66, 50 82, 20 66, 20 34" strokeLinejoin="round" />
              <circle cx="50" cy="50" r="10" fill="#34d399" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-gray-950 text-base tracking-wider leading-none">
              SMART_HR
            </h1>
            <span className="text-[10px] tracking-wider font-semibold text-gray-500 uppercase mt-1 block">
              {getRoleLabel()}
            </span>
          </div>
        </div>

        {/* Navigation pill buttons */}
        <nav className="mt-6 flex flex-col gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-semibold shadow-xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-semibold shadow-xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-200 text-gray-900 font-semibold shadow-xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {isViewer ? 'Employee Directory' : 'Employeeee'}
          </NavLink>

          {/* Super Admin System Operations & Role Management */}
          {isSuperAdmin && (
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Administration Tools
              </div>
              <NavLink
                to="/maintenance"
                className={({ isActive }) =>
                  `w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-950 font-semibold shadow-xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
                  }`
                }
              >
                Maintenance & System
              </NavLink>

              <NavLink
                to="/roles"
                className={({ isActive }) =>
                  `w-full text-center py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-950 font-semibold shadow-xs'
                      : 'bg-gray-100/80 text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
                  }`
                }
              >
                Manage User Roles
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* User profile and logout footer */}
      <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
              {user?.name || user?.email}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              isSuperAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
            }`}>
              {isSuperAdmin ? 'ADMIN' : 'VIEW'}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 truncate mt-0.5">
            {user?.email}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
