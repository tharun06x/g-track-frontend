import { ArrowLeft, UserCircle2, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiRequest, readAuth } from '../lib/api';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const auth = readAuth();
      if (!auth || auth.role !== 'distributor' || !auth.token) {
        return;
      }

      try {
        const data = await apiRequest('/api/v1/distributors/me', {
          method: 'GET',
          token: auth.token,
        });
        setProfile(data);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/self-service" className="text-blue-600 hover:text-blue-800">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-800">Distributor Profile</h2>
      </div>

      <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-md mb-6 flex items-start gap-3 text-sm">
        <Info className="flex-shrink-0 mt-0.5" size={18} />
        <p>
          <strong>Read Only:</strong> This information is administrative property. 
          It can only be edited by the G-TRACK System Administrator.
        </p>
      </div>
      {error && <div className="mb-6 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
          <UserCircle2 className="text-gray-400" size={24} />
          <h3 className="text-lg font-medium text-gray-800">Agency Information</h3>
        </div>
        
        <div className="divide-y">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500">Distributor ID</div>
            <div className="w-2/3 text-gray-800 font-medium">{profile?.distributor_id || '-'}</div>
          </div>
          
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500">Distributor Name</div>
            <div className="w-2/3 text-gray-800">{profile?.name || '-'}</div>
          </div>

          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500">Email</div>
            <div className="w-2/3 text-gray-800">{profile?.email || '-'}</div>
          </div>

          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500">Primary Contact</div>
            <div className="w-2/3 text-gray-800">{profile?.phone_no || '-'}</div>
          </div>

          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500">Location</div>
            <div className="w-2/3 text-gray-800">{profile?.district || '-'}, {profile?.state || '-'}</div>
          </div>
          
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-start gap-1 md:gap-4">
            <div className="w-1/3 text-sm font-medium text-gray-500 pt-1">Registered Address</div>
            <div className="w-2/3 text-gray-800 bg-gray-50 p-3 rounded text-sm italic border border-gray-100">
              {profile?.address || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
