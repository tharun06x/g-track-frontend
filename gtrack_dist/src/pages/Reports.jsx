import { FileCheck, XCircle, Clock, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, readAuth } from '../lib/api';

export default function Reports() {
  const [dateFilter, setDateFilter] = useState('This Month');
  const [refills, setRefills] = useState([]);
  const [consumers, setConsumers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      const auth = readAuth();
      if (!auth || auth.role !== 'distributor' || !auth.distributor_id) {
        return;
      }

      try {
        const [refillsData, consumersData] = await Promise.all([
          apiRequest(`/api/v1/refill/distributor/${encodeURIComponent(auth.distributor_id)}`, { method: 'GET' }),
          apiRequest(`/api/v1/distributors/${encodeURIComponent(auth.distributor_id)}/consumers`, { method: 'GET' }),
        ]);
        setRefills(Array.isArray(refillsData) ? refillsData : []);
        setConsumers(Array.isArray(consumersData) ? consumersData : []);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    loadData();
  }, []);

  function isInCurrentFilter(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();

    if (dateFilter === 'Today') {
      return date.toDateString() === now.toDateString();
    }
    if (dateFilter === 'Yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return date.toDateString() === yesterday.toDateString();
    }
    if (dateFilter === 'Last 7 Days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return date >= sevenDaysAgo;
    }
    if (dateFilter === 'Last 30 Days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return date >= thirtyDaysAgo;
    }
    if (dateFilter === 'This Month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  }

  const filteredRefills = useMemo(
    () => refills.filter((item) => isInCurrentFilter(item.requested_date)),
    [refills, dateFilter]
  );

  const approvedCount = filteredRefills.filter((item) => item.status === 'approved').length;
  const rejectedCount = filteredRefills.filter((item) => item.status === 'rejected').length;
  const pendingCount = filteredRefills.filter((item) => item.status === 'pending').length;

  const consumerMap = useMemo(() => {
    const map = new Map();
    consumers.forEach((item) => map.set(item.user_id, item));
    return map;
  }, [consumers]);

  const metrics = [
    {
      title: 'Bills Generated',
      value: String(approvedCount),
      trend: `Approved in ${dateFilter}`,
      icon: <FileCheck size={28} className="text-green-600" />,
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      title: 'Bills Cancelled',
      value: String(rejectedCount),
      trend: `Rejected in ${dateFilter}`,
      icon: <XCircle size={28} className="text-red-600" />,
      bg: 'bg-red-50',
      border: 'border-red-100',
    },
    {
      title: 'Pending Bookings',
      value: String(pendingCount),
      trend: 'Needs attention',
      icon: <Clock size={28} className="text-orange-600" />,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
  ];

  const exportCsv = () => {
    const rows = filteredRefills.map((item) => {
      const consumer = consumerMap.get(item.user_id);
      return {
        request_id: item.request_id,
        consumer_name: consumer?.name || item.user_id,
        consumer_no: consumer?.consumer_no || '',
        status: item.status,
        requested_date: item.requested_date,
        approved_by: item.approved_by || '',
      };
    });

    const headers = ['request_id', 'consumer_name', 'consumer_no', 'status', 'requested_date', 'approved_by'];
    const csv = [
      headers.join(','),
      ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replaceAll('"', '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gtrack_refill_report_${dateFilter.replaceAll(' ', '_').toLowerCase()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold text-gray-800">Operations Report</h2>
        
        {/* Date Filter Dropdown */}
        <div className="mt-4 md:mt-0 flex items-center gap-2 bg-white border border-gray-200 rounded-md py-1.5 px-3 shadow-sm">
          <Calendar size={16} className="text-blue-500" />
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="text-sm font-medium text-gray-700 bg-transparent outline-none focus:ring-0 cursor-pointer"
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-6 bg-blue-50/50 inline-block px-3 py-1 rounded-md border border-blue-100">
        <span className="font-semibold text-blue-700">Note:</span> Showing only the bills and bookings generated using your specific distributor login.
      </p>
      {error && <div className="mb-6 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <div key={idx} className={`bg-white border ${metric.border} hover:shadow-md transition-shadow rounded-lg shadow-sm p-6 flex items-start justify-between`}>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{metric.title}</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2 transition-all">{metric.value}</h3>
              <p className="text-xs font-medium text-gray-400">{metric.trend}</p>
            </div>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${metric.bg}`}>
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded shadow-sm">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">Transaction Logs ({dateFilter})</h3>
          <button onClick={exportCsv} className="text-sm text-blue-600 font-medium hover:underline">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Request ID</th>
                <th className="px-4 py-3 font-medium">Consumer</th>
                <th className="px-4 py-3 font-medium">Consumer No.</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefills.map((item) => {
                const consumer = consumerMap.get(item.user_id);
                return (
                  <tr key={item.request_id} className="border-b hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-blue-600">{item.request_id}</td>
                    <td className="px-4 py-3 text-gray-700">{consumer?.name || item.user_id}</td>
                    <td className="px-4 py-3 text-gray-600">{consumer?.consumer_no || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{item.status}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(item.requested_date).toLocaleString()}</td>
                  </tr>
                );
              })}
              {filteredRefills.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No refill transactions found for selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
