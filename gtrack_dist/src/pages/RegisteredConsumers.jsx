import { useEffect, useMemo, useState } from 'react';
import { Search, Users } from 'lucide-react';
import { apiRequest, readAuth } from '../lib/api';

export default function RegisteredConsumers() {
  const [query, setQuery] = useState('');
  const [consumers, setConsumers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConsumers() {
      const auth = readAuth();
      if (!auth || auth.role !== 'distributor' || !auth.distributor_id) {
        return;
      }

      try {
        const result = await apiRequest(`/api/v1/distributors/${encodeURIComponent(auth.distributor_id)}/consumers`, {
          method: 'GET',
        });
        setConsumers(Array.isArray(result) ? result : []);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadConsumers();
  }, []);

  const mappedConsumers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return consumers;
    }

    return consumers.filter((consumer) =>
      [consumer.name, consumer.consumer_no, consumer.email, consumer.phone_no]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }, [consumers, query]);

  return (
    <div className="bg-white border rounded shadow-sm w-full p-6">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users size={20} />
            <span className="font-semibold text-sm tracking-widest uppercase">G-TRACK Network</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Registered Consumers</h2>
          <p className="text-sm text-gray-500 mt-1">Consumers who have selected this agency as their distributor.</p>
        </div>
        
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search consumer..." 
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="overflow-x-auto rounded-md border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Consumer No.</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone Number</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mappedConsumers.map((consumer) => (
              <tr key={consumer.user_id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{consumer.consumer_no || '-'}</td>
                <td className="px-4 py-3 text-gray-700 font-medium">{consumer.name}</td>
                <td className="px-4 py-3 text-gray-600">{consumer.phone_no || '-'}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{consumer.address}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                </td>
              </tr>
            ))}
            {mappedConsumers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 font-medium">
                  No consumers have registered using this distributor yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
