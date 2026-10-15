import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  Bot, 
  Shield, 
  Cpu, 
  Globe, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const SecurityCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'auto' (one-click checkbox) or 'puzzle' (code challenge)
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInputCode, setUserInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [rayId, setRayId] = useState('');
  const [showPuzzle, setShowPuzzle] = useState(false);

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserInputCode('');
    setCodeError('');
  };

  useEffect(() => {
    // Generate simulated Ray ID
    const randomHex = Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
    setRayId(randomHex);
    generateCaptcha();

    // If already verified in this session, immediately allow redirect
    if (sessionStorage.getItem('smarthr_security_passed') === 'true') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Complete verification and proceed to login
  const completeVerification = () => {
    setVerified(true);
    setVerifying(false);
    sessionStorage.setItem('smarthr_security_passed', 'true');
    sessionStorage.setItem('smarthr_security_timestamp', new Date().toISOString());

    setTimeout(() => {
      const destination = location.state?.from || '/login';
      navigate(destination, { replace: true });
    }, 700);
  };

  // One-click "I am not a robot" check handler
  const handleCheckboxClick = () => {
    if (verified || verifying) return;

    setVerifying(true);
    // Simulate smart environmental browser & SSL challenge inspection
    setTimeout(() => {
      completeVerification();
    }, 1200);
  };

  // Code challenge verification handler
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (userInputCode.trim().toUpperCase() === captchaCode) {
      completeVerification();
    } else {
      setCodeError('Incorrect security code. Please try again.');
      generateCaptcha();
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#2370ea] overflow-hidden select-none">
      {/* Background radial gradients matching login page branding */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1d64e0] via-[#2a77f0] to-[#124db5]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4f95fc] rounded-full filter blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#0a3d99] rounded-full filter blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-[#60a5fa] rounded-full filter blur-[100px] opacity-25 pointer-events-none" />

      {/* Main Security Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white rounded-[38px] shadow-2xl shadow-blue-950/30 p-8 sm:p-10 border border-white/70">
        
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 text-[#2b78f4] border border-blue-100 shadow-xs mb-1">
            <ShieldCheck size={32} className="stroke-[2.2]" />
          </div>

          <h1 className="text-2xl sm:text-[26px] font-bold text-gray-950 tracking-tight">
            Security Checkpoint
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            SmartHR Web Application Firewall is verifying that your connection is secure before loading the employee portal.
          </p>
        </div>

        {/* Verification Box (Standard Cloudflare / reCAPTCHA styled interactive widget) */}
        <div className="mt-8 bg-gray-50/90 border border-gray-200/90 rounded-2xl p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between gap-4">
            
            {/* Interactive Checkbox */}
            <div 
              onClick={handleCheckboxClick}
              className={`flex items-center gap-3.5 cursor-pointer group ${
                verifying ? 'pointer-events-none opacity-80' : ''
              }`}
            >
              <div 
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                  verified 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : verifying
                      ? 'bg-white border-blue-500'
                      : 'bg-white border-gray-300 group-hover:border-blue-500 group-hover:shadow-xs'
                }`}
              >
                {verified ? (
                  <CheckCircle2 size={20} className="stroke-[3] animate-in zoom-in" />
                ) : verifying ? (
                  <RefreshCw size={16} className="text-blue-600 animate-spin" />
                ) : null}
              </div>

              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {verified 
                    ? 'Success! Redirecting...' 
                    : verifying 
                      ? 'Verifying browser...' 
                      : 'I am not a robot'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {verified ? 'Human verification confirmed' : 'Click the checkbox to confirm'}
                </span>
              </div>
            </div>

            {/* SmartHR Security Badge */}
            <div className="flex flex-col items-center justify-center pl-4 border-l border-gray-200 text-center shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                <Shield size={17} />
              </div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1">SmartGuard</span>
              <span className="text-[8px] text-gray-300">Privacy • Terms</span>
            </div>
          </div>
        </div>

        {/* Alternative Code Challenge Accordion */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setShowPuzzle(!showPuzzle);
              if (!showPuzzle) generateCaptcha();
            }}
            className="text-xs font-semibold text-[#2b78f4] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{showPuzzle ? 'Use one-click verification instead' : 'Having trouble? Verify with security code'}</span>
          </button>
        </div>

        {/* Security Code Challenge Form */}
        {showPuzzle && (
          <form onSubmit={handleCodeSubmit} className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Enter characters below:</span>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> New Code
              </button>
            </div>

            {/* Captcha Noise Display */}
            <div className="h-12 bg-gray-900 rounded-xl flex items-center justify-center tracking-[0.4em] font-mono text-xl font-extrabold text-emerald-400 select-none shadow-inner border border-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
              <span className="relative z-10 italic transform -skew-x-6">{captchaCode}</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={5}
                placeholder="Type 5-letter code"
                value={userInputCode}
                onChange={(e) => {
                  setUserInputCode(e.target.value);
                  setCodeError('');
                }}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Verify
              </button>
            </div>

            {codeError && (
              <p className="text-[11px] text-red-600 font-medium">{codeError}</p>
            )}
          </form>
        )}

        {/* Security Telemetry Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center justify-center text-center gap-1.5">
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <Lock size={11} className="text-emerald-500" />
            <span>256-bit TLS Encrypted Session</span>
            <span>•</span>
            <span>Ray ID: <span className="font-mono text-gray-500">{rayId}</span></span>
          </div>
          <p className="text-[10px] text-gray-400">
            Performance & Security protected by SmartHR Shield Engine
          </p>
        </div>

      </div>
    </div>
  );
};

export default SecurityCheck;
