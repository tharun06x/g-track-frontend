import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { apiRequest, saveAuth } from '../../lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mock Captcha generator
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha());

  function generateCaptcha() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  const handleRefreshCaptcha = () => {
    setCaptchaValue(generateCaptcha());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await apiRequest('/api/v1/admin/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      });

      saveAuth({
        role: 'admin',
        token: result.access_token,
        admin_id: result.admin_id,
        email,
        name: result.name,
      });

      setError('');
      navigate('/admin/dashboard');
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (captchaInput !== captchaValue) {
      setError('Captcha validation failed. Please try again.');
      handleRefreshCaptcha();
      return;
    }
    // Simulate password change
    setError('Password reset link has been securely mailed to the registered administrator email.');
    setView('login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded shadow-xl p-8 border-t-4 border-red-600">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 flex items-center justify-center rounded-full text-red-600">
            <ShieldAlert size={36} />
          </div>
        </div>
        
        <h1 className="text-2xl font-[Poppins] font-extrabold text-gray-800 tracking-widest text-center mb-1 uppercase">
          G-TRACK Admin
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Secure Administrative Gateway</p>

        {error && (
          <div className={`mb-6 text-sm p-3 rounded text-center ${error.includes('mailed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}

        {view === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                placeholder="Administrator Email"
                required
              />
            </div>

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                placeholder="Secure Password"
                required
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => { setView('forgot'); setError(''); handleRefreshCaptcha(); }}
                className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
              >
                Change or Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded transition-colors"
            >
              Verify & Log In
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <p className="text-sm text-gray-600 text-center mb-4">
              Enter your Administrator ID below. A password reset instruction will be sent.
            </p>
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-red-500 focus:bg-white transition-colors"
                placeholder="Administrator ID"
                required
              />
            </div>

            <div className="flex flex-col gap-2 p-4 bg-gray-100/50 rounded border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Security Captcha</span>
              <div className="flex gap-2 h-12">
                <div className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded flex items-center justify-center pointer-events-none relative overflow-hidden select-none">
                  {/* Fake captcha noise lines */}
                  <div className="absolute top-2 w-full h-0.5 bg-gray-400 rotate-2"></div>
                  <div className="absolute bottom-3 w-full h-0.5 bg-gray-400 -rotate-3"></div>
                  <span className="text-2xl font-bold tracking-[0.3em] font-mono text-gray-700 skew-x-[-10deg] opacity-80">{captchaValue}</span>
                </div>
                <button 
                  type="button" 
                  onClick={handleRefreshCaptcha} 
                  className="w-12 h-12 flex-shrink-0 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                className="w-full mt-2 px-4 py-3 bg-white border border-gray-300 rounded text-sm focus:outline-none font-mono placeholder-sans focus:border-red-500 transition-colors"
                placeholder="Enter captcha text"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded transition-colors"
            >
              Request Password Change
            </button>
            
            <button
              type="button"
              onClick={() => { setView('login'); setError(''); }}
              className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Back to Secure Login
            </button>
          </form>
        )}
      </div>
      <div className="mt-8 text-center text-sm text-slate-500 font-medium">
        Unauthorized access to this portal is strictly prohibited and logged.
      </div>
    </div>
  );
}
