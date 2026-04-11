import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ConsumerSignup() {
  const navigate = useNavigate();
  const { distributors, addConsumer } = useAppContext();
  
  // Filter only Active distributors for selection
  const activeDistributors = distributors.filter(d => d.status === 'Active');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    distributorId: ''
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new consumer entity
    const newConsumer = {
      id: `C-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      number: `CN-${Math.floor(Math.random() * 1000000)}`,
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      status: 'Active',
      distributorId: formData.distributorId
    };

    addConsumer(newConsumer);
    setSuccess(true);
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
            Your profile has been created and securely linked to your chosen G-TRACK Distributor. 
            They can now view your details and process your bookings.
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 border-t-4 border-blue-600">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full text-blue-600">
            <UserPlus size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-[Poppins] font-extrabold text-gray-800 tracking-widest text-center mb-1 uppercase">
          G-TRACK Consumer
        </h1>
        <p className="text-sm text-gray-500 mb-8 text-center">Register Home Profile</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mobile Number</label>
            <input
              type="text" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              placeholder="e.g. 98451XXXXX"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Residential Address</label>
            <textarea
              required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors h-20 resize-none"
              placeholder="Full house address"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Select Gas Distributor</label>
            <select
              required value={formData.distributorId} onChange={(e) => setFormData({...formData, distributorId: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            >
              <option value="" disabled>Choose your distributor...</option>
              {activeDistributors.map(dist => (
                <option key={dist.id} value={dist.id}>{dist.name} - {dist.id}</option>
              ))}
            </select>
            {activeDistributors.length === 0 && (
              <p className="text-xs text-red-500 mt-1">No active distributors available currently.</p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={activeDistributors.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded transition-colors"
            >
              Register & Link to Distributor
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
