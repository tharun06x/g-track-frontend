import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, saveAuth } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Trouble form state
  const [view, setView] = useState('login'); // 'login' | 'trouble'
  const [troubleData, setTroubleData] = useState({ 
    distName: '',
    distId: '',
    email: '',
    phone: '',
    issue: ''
  });
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await apiRequest('/api/v1/distributors/login', {
        method: 'POST',
        body: {
          email,
          password,
        },
      });

      saveAuth({
        role: 'distributor',
        token: result.access_token,
        distributor_id: result.distributor_id,
        email: result.email,
        name: result.name,
      });

      setError('');
      navigate('/dashboard');
    } catch (apiError) {
      setError(`${apiError.message}. If you are not approved yet, contact administrator.`);
    }
  };

  const handleTroubleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiRequest('/api/v1/admin/login-trouble-request', {
        method: 'POST',
        body: {
          distributor_id: troubleData.distId,
          distributor_name: troubleData.distName,
          email: troubleData.email,
          phone_no: troubleData.phone,
          issue: troubleData.issue,
        },
      });

      setTroubleData({ distName: '', distId: '', email: '', phone: '', issue: '' });
      setError('Your login trouble request has been submitted to the Administrator successfully.');
      setView('login');
    } catch (apiError) {
      setError(apiError.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded shadow p-8 text-center border-t-4 border-blue-600">
        <h1 className="text-3xl font-[Poppins] font-extrabold text-gray-800 tracking-widest mb-2 uppercase">G-TRACK</h1>
        <p className="text-sm text-gray-500 mb-6">Distributor Portal</p>

        {error && (
          <div className={`mb-4 text-sm ${error.includes('successfully') ? 'text-green-600 bg-green-50 p-2 rounded' : 'text-red-500'}`}>
            {error}
          </div>
        )}

        {view === 'login' ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <input
                  id="distributorEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="Distributor Email"
                  required
                />
              </div>

              <div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 text-sm flex flex-col items-center gap-3">
              <div className="w-full flex justify-between items-center text-gray-500">
                <a href="/admin/login" className="hover:text-gray-800 font-medium transition-colors">
                  Admin Login
                </a>
                <button 
                  onClick={() => { setView('trouble'); setError(''); }} 
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Contact Administrator
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t w-full text-center">
                <span className="text-gray-500">Are you a Home Consumer? </span>
                <a href="/signup" className="text-blue-600 font-semibold hover:underline">
                  Register Profile
                </a>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleTroubleSubmit} className="space-y-4 text-left">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-2">Trouble Logging In?</h2>
            
            <p className="text-xs text-gray-500 mb-4">
              Submit a support ticket and the platform administrator will review your credentials and issue a reset securely.
            </p>

            <div>
              <input
                type="text" required value={troubleData.distId} onChange={(e) => setTroubleData({...troubleData, distId: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Your Distributor ID"
              />
            </div>
            <div>
              <input
                type="text" required value={troubleData.distName} onChange={(e) => setTroubleData({...troubleData, distName: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="Agency Name"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <input
                 type="email" required value={troubleData.email} onChange={(e) => setTroubleData({...troubleData, email: e.target.value})}
                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                 placeholder="Contact Email"
               />
               <input
                 type="text" required value={troubleData.phone} onChange={(e) => setTroubleData({...troubleData, phone: e.target.value})}
                 className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                 placeholder="Phone Number"
               />
            </div>
            <div>
              <textarea
                required value={troubleData.issue} onChange={(e) => setTroubleData({...troubleData, issue: e.target.value})}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 focus:bg-white resize-none h-20"
                placeholder="Describe the issue (e.g., Forgotten password, account locked)"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 rounded transition-colors"
            >
              Submit Ticket to Admin
            </button>
            
            <button
              type="button"
              onClick={() => { setView('login'); setError(''); }}
              className="w-full mt-2 text-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
