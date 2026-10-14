import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Key, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresCode, setRequiresCode] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-reveal secret code field if user enters HR/Super Admin email or if server requested it
  const isHrAccount = requiresCode || email.toLowerCase().includes('hr@') || email.toLowerCase().includes('admin');

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
        setRequiresCode(true);
      }
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#2370ea] overflow-hidden">
      {/* Background radial blurs matching the reference image */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1d64e0] via-[#2a77f0] to-[#124db5]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4f95fc] rounded-full filter blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0a3d99] rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#60a5fa] rounded-full filter blur-[100px] opacity-25 pointer-events-none" />

      {/* Main Login Card matching the reference UI */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[38px] shadow-2xl shadow-blue-950/30 p-8 sm:p-11 border border-white/60">
        <div className="text-left">
          {/* Title */}
          <h1 className="text-[32px] font-medium text-[#2b78f4] tracking-tight leading-tight">
            Sign in
          </h1>

          {/* Subtitle */}
          <p className="text-xs text-gray-400 mt-1.5 font-normal">
            Not registered?{' '}
            <button
              type="button"
              onClick={() => alert('Registration can be configured by Super Admin in System Settings.')}
              className="text-[#2b78f4] hover:underline cursor-pointer"
            >
              Click here to register.
            </button>
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Username / Email field with user icon */}
          <div className="relative">
            <div className="w-full flex items-center px-4 py-3 rounded-full border border-gray-200/90 bg-white focus-within:border-[#2b78f4] focus-within:ring-2 focus-within:ring-[#2b78f4]/15 transition-all">
              <User size={18} className="text-gray-400 shrink-0 mr-3 stroke-[1.75]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-normal"
              />
            </div>
          </div>

          {/* Password field with key icon and eye toggle */}
          <div className="relative">
            <div className="w-full flex items-center px-4 py-3 rounded-full border border-gray-200/90 bg-white focus-within:border-[#2b78f4] focus-within:ring-2 focus-within:ring-[#2b78f4]/15 transition-all">
              <Key size={18} className="text-gray-400 shrink-0 mr-3 stroke-[1.75]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-normal pr-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-0.5 shrink-0 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Secret Code field with shield icon and eye toggle */}
          {isHrAccount && (
            <div className="relative animate-fadeIn">
              <div className="w-full flex items-center px-4 py-3 rounded-full border border-blue-200 bg-blue-50/40 focus-within:border-[#2b78f4] focus-within:ring-2 focus-within:ring-[#2b78f4]/15 transition-all">
                <ShieldCheck size={18} className="text-[#2b78f4] shrink-0 mr-3 stroke-[1.75]" />
                <input
                  type={showSecretCode ? 'text' : 'password'}
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="Secret Code (HR 2FA)"
                  className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-mono pr-2"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="text-blue-500 hover:text-blue-700 cursor-pointer p-0.5 shrink-0 transition-colors"
                  title={showSecretCode ? 'Hide secret code' : 'Show secret code'}
                >
                  {showSecretCode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Options: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2b78f4] focus:ring-0 cursor-pointer accent-[#2b78f4]"
              />
              <span className="text-gray-400 hover:text-gray-600 transition-colors">Remember Me</span>
            </label>

            <button
              type="button"
              onClick={() => alert('Please contact the Super Admin to reset your account password.')}
              className="text-[#2b78f4] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-[#2b78f4] hover:bg-[#2069dc] active:bg-[#1a5bc2] text-white text-base font-normal tracking-wide shadow-md shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
