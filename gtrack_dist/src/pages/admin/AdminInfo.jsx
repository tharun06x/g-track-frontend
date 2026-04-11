import { useEffect, useMemo, useState } from 'react';
import { Users, AlertTriangle, FileText } from 'lucide-react';
import { apiRequest, readAuth } from '../../lib/api';

export default function AdminInfo() {
  const [distributors, setDistributors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminInfo() {
      const auth = readAuth();
      if (!auth || auth.role !== 'admin') {
        return;
      }

      try {
        const [distributorsData, pendingData] = await Promise.all([
          apiRequest('/api/v1/distributors', {
            method: 'GET',
            token: auth.token,
          }),
          apiRequest('/api/v1/admin/distributor-requests/pending', {
            method: 'GET',
            token: auth.token,
          }),
        ]);

        setDistributors(Array.isArray(distributorsData) ? distributorsData : []);
        setPendingRequests(Array.isArray(pendingData?.requests) ? pendingData.requests : []);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadAdminInfo();
  }, []);

  const recentDistributor = useMemo(() => distributors[distributors.length - 1], [distributors]);
  const recentRequest = useMemo(() => pendingRequests[0], [pendingRequests]);

  const stats = [
    { title: 'Total Distributors', value: distributors.length, icon: <Users size={24} className="text-blue-500" /> },
    { title: 'Pending Requests', value: pendingRequests.length, icon: <AlertTriangle size={24} className="text-orange-500" /> },
    { title: 'System Logs', value: '1.2k', icon: <FileText size={24} className="text-purple-500" /> },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-2">Welcome, System Administrator</h1>
      <p className="text-slate-500 mb-8">Here is the high-level live snapshot of the G-TRACK distribution network.</p>
      {error && <div className="mb-6 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border text-sm border-slate-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-3">Recent System Activity</h3>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-slate-700 font-medium">Context Store Initialized globally</p>
              <p className="text-xs text-slate-400">Just now</p>
            </div>
          </li>
          {recentDistributor && (
             <li className="flex items-start gap-3">
             <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
             <div>
               <p className="text-slate-700 font-medium">Distributor Captured: {recentDistributor.name}</p>
               <p className="text-xs text-slate-400">System Sync</p>
             </div>
           </li>
          )}
          {recentRequest && (
            <li className="flex items-start gap-3">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500"></div>
            <div>
              <p className="text-slate-700 font-medium">Pending Distributor Request: {recentRequest.company_name}</p>
              <p className="text-xs text-slate-400">{new Date(recentRequest.requested_at).toLocaleDateString()}</p>
            </div>
          </li>
          )}
        </ul>
      </div>
    </div>
  );
}
