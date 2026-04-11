import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { apiRequest, readAuth } from '../lib/api';

export default function BookingRefills() {
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState('');

  async function loadBookings() {
    const auth = readAuth();
    if (!auth || auth.role !== 'distributor' || !auth.distributor_id) {
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const [refills, consumers] = await Promise.all([
        apiRequest(`/api/v1/refill/distributor/${encodeURIComponent(auth.distributor_id)}`, { method: 'GET' }),
        apiRequest(`/api/v1/distributors/${encodeURIComponent(auth.distributor_id)}/consumers`, { method: 'GET' }),
      ]);

      const consumerMap = new Map((Array.isArray(consumers) ? consumers : []).map((item) => [item.user_id, item]));
      const mapped = (Array.isArray(refills) ? refills : []).map((item) => {
        const consumer = consumerMap.get(item.user_id);
        return {
          id: item.request_id,
          consumerName: consumer?.name || item.user_id,
          consumerNumber: consumer?.consumer_no || '-',
          date: item.requested_date,
          status: item.status,
        };
      });

      setBookings(mapped);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function normalizeStatus(status) {
    if (status === 'approved') return 'Generated';
    if (status === 'rejected') return 'Cancelled';
    return 'Pending';
  }

  const visibleBookings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return bookings;
    return bookings.filter((booking) =>
      `${booking.id} ${booking.consumerName} ${booking.consumerNumber}`.toLowerCase().includes(normalized)
    );
  }, [bookings, query]);

  const updateRefill = async (id, action) => {
    const auth = readAuth();
    if (!auth || !auth.distributor_id) {
      return;
    }

    setUpdatingId(id);
    setError('');
    setInfo('');

    try {
      await apiRequest(
        `/api/v1/refill/approve/${encodeURIComponent(id)}?distributor_id=${encodeURIComponent(auth.distributor_id)}&action=${encodeURIComponent(action)}`,
        {
          method: 'PATCH',
        }
      );

      setInfo(`Request ${id} updated to ${action}.`);
      await loadBookings();
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="bg-white border rounded shadow-sm w-full p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Booking Refills</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search bookings..." 
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading && <div className="mb-4 text-sm text-slate-600">Loading refill requests...</div>}
      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
      {info && <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{info}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Consumer No.</th>
              <th className="px-4 py-3 font-medium">Consumer Name</th>
              <th className="px-4 py-3 font-medium">Booking No.</th>
              <th className="px-4 py-3 font-medium">Booking Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleBookings.length > 0 ? (
              visibleBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{booking.consumerNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{booking.consumerName}</td>
                  <td className="px-4 py-3 text-blue-600">{booking.id}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(booking.date).toLocaleDateString()} {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      normalizeStatus(booking.status) === 'Generated' ? 'bg-green-100 text-green-700' :
                      normalizeStatus(booking.status) === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {normalizeStatus(booking.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    {booking.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => updateRefill(booking.id, 'approved')}
                          disabled={updatingId === booking.id}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                        >
                          {updatingId === booking.id ? 'Updating...' : 'Generate'}
                        </button>
                        <button 
                          onClick={() => updateRefill(booking.id, 'rejected')}
                          disabled={updatingId === booking.id}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No pending bookings available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
