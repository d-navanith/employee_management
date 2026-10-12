import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Eye } from 'lucide-react';

const Layout = () => {
  const { user, isDeveloper, isSuperAdmin, isViewer } = useAuth();

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
