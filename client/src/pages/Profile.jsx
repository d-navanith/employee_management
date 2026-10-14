import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  Save, 
  RefreshCw,
  BadgeCheck
} from 'lucide-react';

const Profile = () => {
  const { user, updateUser, isSuperAdmin } = useAuth();

  // Profile Information State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Management State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 2FA Secret Code Management State (Super Admin only)
  const [currentSecretCode, setCurrentSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [newSecretCode, setNewSecretCode] = useState('');
  const [secretAuthPassword, setSecretAuthPassword] = useState('');
  const [secretLoading, setSecretLoading] = useState(false);
  const [secretSuccess, setSecretSuccess] = useState('');
  const [secretError, setSecretError] = useState('');

  // Load latest profile & secret code
  const loadProfileDetails = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setProfileData({
          name: res.data.user.name || '',
          email: res.data.user.email || ''
        });
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    }

    if (isSuperAdmin) {
      try {
        const secretRes = await api.get('/auth/secret-code');
        if (secretRes.data?.secretCode) {
          setCurrentSecretCode(secretRes.data.secretCode);
        }
      } catch (err) {
        console.error('Failed to load secret code', err);
      }
    }
  };

  useEffect(() => {
    loadProfileDetails();
  }, []);

  // Handle Profile Information Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', profileData);
      setProfileSuccess(res.data?.message || 'Profile information updated successfully!');
      updateUser(res.data.user);
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile information.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/auth/change-password', passwordData);
      setPasswordSuccess(res.data?.message || 'Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Secret Code Update (Super Admin)
  const handleSecretCodeSubmit = async (e) => {
    e.preventDefault();
    setSecretError('');
    setSecretSuccess('');

    if (!newSecretCode.trim()) {
      setSecretError('Please provide a new secret code.');
      return;
    }

    if (!secretAuthPassword) {
      setSecretError('Current password is required to verify your identity.');
      return;
    }

    setSecretLoading(true);

    try {
      const res = await api.put('/auth/secret-code', {
        newSecretCode: newSecretCode.trim(),
        currentPassword: secretAuthPassword
      });
      setSecretSuccess(res.data?.message || 'Super Admin Secret Code updated successfully!');
      setCurrentSecretCode(res.data.secretCode);
      setNewSecretCode('');
      setSecretAuthPassword('');
      setTimeout(() => setSecretSuccess(''), 5000);
    } catch (err) {
      setSecretError(err.response?.data?.message || 'Failed to update secret code.');
    } finally {
      setSecretLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">
                  {user?.name || 'Administrator'}
                </h1>
                <BadgeCheck size={22} className="text-blue-600 shrink-0" />
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                <span>•</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isSuperAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
                }`}>
                  {isSuperAdmin ? 'SUPER ADMIN' : 'VIEWER'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={loadProfileDetails}
            className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Profile Information */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">Profile Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your display name and login email address
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-sm animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{profileError}</span>
              </div>
            )}

            <form id="profile-info-form" onSubmit={handleProfileSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g. Super Admin (HR)"
                  className="soft-input font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="e.g. hr@smarthr.local"
                    className="soft-input font-medium pr-10"
                  />
                  <Mail size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  This email is used to log in to the Smart HR system.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">User Role</span>
                  <div className="font-semibold text-sm bg-gray-100 text-gray-800 px-3 py-2 rounded-xl border border-gray-200">
                    {user?.role || 'SUPER_ADMIN'}
                  </div>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 mb-1">Account State</span>
                  <div className="font-semibold text-sm bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-200">
                    Active & Verified
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              type="submit"
              form="profile-info-form"
              disabled={profileLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              <span>{profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Password Management */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">Password Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Change your administrator password securely
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm animate-in fade-in">
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-sm animate-in fade-in">
                <AlertCircle size={18} className="shrink-0 text-red-600" />
                <span>{passwordError}</span>
              </div>
            )}

            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    placeholder="Enter current password"
                    className="soft-input pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    placeholder="At least 6 characters"
                    className="soft-input pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    placeholder="Re-type new password"
                    className="soft-input pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <button
              type="submit"
              form="password-form"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white py-3 px-5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <KeyRound size={16} />
              <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Super Admin 2FA Secret Security Code (Exclusive to Super Admin) */}
      {isSuperAdmin && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">Super Admin 2FA Secret Security Code</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                This secret code is required as a second factor whenever the Super Admin signs in
              </p>
            </div>
          </div>

          {secretSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 text-sm mt-6 animate-in fade-in">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{secretSuccess}</span>
            </div>
          )}

          {secretError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 text-sm mt-6 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{secretError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Left: View Current Secret Code */}
            <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Active Secret Code
                </span>
                <p className="text-xs text-gray-400 mt-1 mb-4">
                  Currently configured 2FA sign-in verification code
                </p>

                <div className="flex items-center gap-3">
                  <div className="font-mono text-xl font-bold tracking-widest bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-gray-900 select-all shadow-2xs">
                    {showSecretCode ? currentSecretCode : '••••••••'}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSecretCode(!showSecretCode)}
                    className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white transition-colors cursor-pointer"
                    title={showSecretCode ? 'Hide Code' : 'Reveal Code'}
                  >
                    {showSecretCode ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-6 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <span>
                  Keep this code secure. You will be prompted to enter it whenever you sign in to the Super Admin portal.
                </span>
              </div>
            </div>

            {/* Right: Update Secret Code Form */}
            <form onSubmit={handleSecretCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  New Secret Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSecretCode}
                  onChange={(e) => setNewSecretCode(e.target.value)}
                  placeholder="e.g. HR7788 or new custom code"
                  required
                  className="soft-input font-mono font-bold tracking-wider"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Current Password (for Security Verification) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={secretAuthPassword}
                  onChange={(e) => setSecretAuthPassword(e.target.value)}
                  placeholder="Enter your current password to confirm"
                  required
                  className="soft-input font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={secretLoading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl text-sm font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck size={16} />
                <span>{secretLoading ? 'Updating Secret Code...' : 'Update Secret Code'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
