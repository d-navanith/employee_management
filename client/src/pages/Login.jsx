import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Eye, Lock, Mail, ArrowRight, AlertCircle, Key, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isSuperAdminSelected, setIsSuperAdminSelected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Automatically detect if user typed an HR / super admin email
  const isHrAccount = isSuperAdminSelected || email.toLowerCase().includes('hr@') || email.toLowerCase().includes('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, secretCode);
      if (user.role === 'VIEWER') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.requiresSecretCode) {
        setIsSuperAdminSelected(true);
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail, rolePass, roleCode = '') => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setSecretCode(roleCode);
    setIsSuperAdminSelected(Boolean(roleCode || roleEmail.includes('hr@')));
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Left Side: Brand & Quick Demo Switcher */}
        <div className="md:col-span-2 bg-[#111827] text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-gray-800 flex items-center justify-center p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-400 stroke-current" fill="none" strokeWidth="6">
                  <polygon points="50 3, 90 25, 90 75, 50 97, 10 75, 10 25" strokeLinejoin="round" />
                  <polygon points="50 18, 80 34, 80 66, 50 82, 20 66, 20 34" strokeLinejoin="round" />
                  <circle cx="50" cy="50" r="10" fill="#34d399" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-lg tracking-wider text-white">SMART_HR</h2>
                <span className="text-[10px] uppercase font-semibold text-emerald-400">Enterprise Portal</span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-base font-semibold text-gray-200">Quick Access:</h3>
              <p className="text-xs text-gray-400 mt-1">
                Select your portal to auto-fill credentials:
              </p>

              <div className="mt-4 space-y-2.5">
                {/* 1. Super Admin (HR) with Secret Token */}
                <button
                  type="button"
                  onClick={() => setDemoCredentials('hr@smarthr.local', 'Admin@123', 'HR-SEC-7788')}
                  className="w-full text-left p-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 hover:border-blue-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <UserCheck size={14} /> Super Admin (HR)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 font-mono">Secret Code</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Requires secret security code. Manages employee details and records.
                  </p>
                </button>

                {/* 2. Viewer */}
                <button
                  type="button"
                  onClick={() => setDemoCredentials('viewer@smarthr.local', 'Viewer@123', '')}
                  className="w-full text-left p-3 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 hover:border-amber-500/50 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Eye size={14} /> Viewer Portal
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-300 font-mono">Overview</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Workforce summary: total employees, day/night shift counts, and staff count.
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 pt-6 border-t border-gray-800">
            Smart HR Management System &copy; 2026
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter your credentials to access the Smart HR workspace.
            </p>

            {error && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hr@smarthr.local"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Super Admin Secret Code / Security Token input */}
              <div className={`p-3.5 rounded-2xl transition-all border ${
                isHrAccount 
                  ? 'bg-blue-50/70 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                    <Key size={14} className={isHrAccount ? 'text-blue-600' : 'text-gray-500'} />
                    Super Admin Secret Security Code
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                    HR 2FA Token
                  </span>
                </div>
                
                <p className="text-[11px] text-gray-500 mb-2">
                  Required only for Super Admin (HR) logins. Matches secret token assigned by System Developer.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    placeholder="Enter Secret Code (e.g. HR-SEC-7788)"
                    className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gray-950 hover:bg-black text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
