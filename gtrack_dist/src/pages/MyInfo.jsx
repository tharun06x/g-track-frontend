import { useEffect, useState } from 'react';
import { apiRequest, readAuth } from '../lib/api';

export default function MyInfo() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const auth = readAuth();
      if (!auth || !auth.token || auth.role !== 'distributor') {
        return;
      }

      try {
        const me = await apiRequest('/api/v1/distributors/me', {
          method: 'GET',
          token: auth.token,
        });
        setProfile(me);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadProfile();
  }, []);

  return (
    <div className="bg-white border rounded shadow-sm w-full font-sans text-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl text-blue-500 font-medium">Welcome {profile?.name || 'Distributor'}</h2>
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Distributor')}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
      {error && <div className="px-4 py-3 text-red-600 bg-red-50 border-b">{error}</div>}
      
      <div className="p-0">
        <div className="flex items-center py-3 px-4 border-b bg-gray-50/50">
          <div className="w-1/3 text-gray-700 font-medium">Cell phone</div>
          <div className="w-2/3 text-gray-800">{profile?.phone_no || '-'}</div>
        </div>
        
        <div className="flex items-center py-3 px-4 border-b">
          <div className="w-1/3 text-gray-700 font-medium">Email</div>
          <div className="w-2/3 text-blue-500">{profile?.email || '-'}</div>
        </div>
        
        <div className="flex items-center py-3 px-4 border-b bg-gray-50/50">
          <div className="w-1/3 text-gray-700 font-medium">District</div>
          <div className="w-2/3 text-green-500">{profile?.district || '-'}</div>
        </div>
        
        <div className="flex items-center py-3 px-4 border-b">
          <div className="w-1/3 text-gray-700 font-medium">State</div>
          <div className="w-2/3 text-blue-500">{profile?.state || '-'}</div>
        </div>
        
        <div className="flex items-center py-3 px-4 border-b bg-gray-50/50">
          <div className="w-1/3 text-gray-700 font-medium">Address</div>
          <div className="w-2/3 text-green-500">{profile?.address || '-'}</div>
        </div>
        
        <div className="flex items-center py-3 px-4 pb-6">
          <div className="w-1/3 text-gray-700 font-medium">Distributor ID</div>
          <div className="w-2/3 text-blue-500">{profile?.distributor_id || '-'}</div>
        </div>
      </div>
    </div>
  );
}
