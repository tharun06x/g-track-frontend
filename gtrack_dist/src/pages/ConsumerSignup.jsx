import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function ConsumerSignup() {
  const navigate = useNavigate();
  
  const [activeDistributors, setActiveDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDistributors() {
      try {
        const data = await apiRequest('/api/v1/distributors');
        const list = Array.isArray(data) ? data : (Array.isArray(data.distributors) ? data.distributors : []);
        setActiveDistributors(list);
      } catch (err) {
        console.error('Failed to load distributors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDistributors();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    retrypassword: '',
    phone: '',
    address: '',
    consumer_number: '',
    state: '',
    district: '',
    distributorId: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (formData.password !== formData.retrypassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedDist = activeDistributors.find(d => d.id === formData.distributorId);
      const distributorName = selectedDist ? (selectedDist.name || selectedDist.id) : formData.distributorId;

      await apiRequest('/api/v1/users/register', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          retrypassword: formData.retrypassword,
          consumer_number: formData.consumer_number,
          mobile: formData.phone,
          address: formData.address,
          state: formData.state,
          district: formData.district,
          distributor: distributorName
        }
      });
      
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center border-t-4 border-green-500">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your profile has been created securely. 
            You can now log in to the G-TRACK portal.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-600">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full text-blue-600">
            <UserPlus size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-[Poppins] font-extrabold text-gray-800 tracking-widest text-center mb-1 uppercase">
          G-TRACK Consumer
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Register Home Profile</p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email Address</label>
              <input
                type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Password</label>
              <input
                type="password" required minLength="8" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Retype Password</label>
              <input
                type="password" required minLength="8" value={formData.retrypassword} onChange={(e) => setFormData({...formData, retrypassword: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
              <input
                type="text" required pattern="^\+?[1-9]\d{7,14}$" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="+91..."
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Consumer No.</label>
              <input
                type="text" required value={formData.consumer_number} onChange={(e) => setFormData({...formData, consumer_number: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="GAS-12345"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Residential Address</label>
            <textarea
              required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors h-20 resize-none"
              placeholder="Full house address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">State</label>
              <input
                type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">District</label>
              <input
                type="text" required value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Gas Distributor</label>
            <select
              required value={formData.distributorId} onChange={(e) => setFormData({...formData, distributorId: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            >
              <option value="" disabled>{loading ? 'Loading...' : 'Choose your distributor...'}</option>
              {activeDistributors.map(dist => (
                <option key={dist.id} value={dist.id}>{dist.name || dist.id}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded transition-colors"
            >
              {isSubmitting ? 'Registering...' : 'Register & Link to Distributor'}
            </button>
          </div>
          
          <div className="text-center pt-2">
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="text-gray-500 hover:text-gray-800 font-medium text-sm transition-colors"
            >
              Cancel & Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

