import { useEffect, useState } from 'react';
import { MailWarning, Clock } from 'lucide-react';
import { apiRequest, readAuth } from '../../lib/api';

export default function LoginRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState('');
  const [reviewInputs, setReviewInputs] = useState({});

  async function loadRequests() {
    setLoading(true);
    setError('');
    const auth = readAuth();
    if (!auth || auth.role !== 'admin' || !auth.token) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest('/api/v1/admin/distributor-requests/pending', {
        method: 'GET',
        token: auth.token,
      });
      const list = Array.isArray(data?.requests) ? data.requests : [];
      setRequests(list);
      setInfo('Pending requests loaded.');

      const nextInputs = {};
      list.forEach((req) => {
        nextInputs[req.request_id] = reviewInputs[req.request_id] || {
          review_comment: '',
          password: '',
        };
      });
      setReviewInputs(nextInputs);
    } catch (apiError) {
      setError(apiError.message);
      setInfo('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const handleResolve = async (requestId, status) => {
    const auth = readAuth();
    if (!auth || !auth.token) {
      return;
    }

    const requestInput = reviewInputs[requestId] || { review_comment: '', password: '' };
    const reviewComment = requestInput.review_comment.trim() || null;
    const payload = {
      status,
      review_comment: reviewComment,
    };

    if (status === 'approved') {
      const password = (requestInput.password || '').trim();
      if (!password) {
        setError('Approval requires a password.');
        return;
      }
      payload.password = password;
    }

    try {
      setProcessingId(requestId);
      await apiRequest(`/api/v1/admin/distributor-requests/${requestId}`, {
        method: 'PATCH',
        token: auth.token,
        body: payload,
      });
      await loadRequests();
      setError('');
      setInfo(`Request ${requestId} ${status} successfully.`);
    } catch (apiError) {
      setError(apiError.message);
      setInfo('');
    } finally {
      setProcessingId('');
    }
  };

  const updateRequestInput = (requestId, key, value) => {
    setReviewInputs((prev) => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || { review_comment: '', password: '' }),
        [key]: value,
      },
    }));
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-6">
        <MailWarning className="text-orange-500" size={28} />
        <h2 className="text-2xl font-semibold text-gray-800">Distributor Account Requests</h2>
      </div>

      <p className="text-slate-500 mb-6 text-sm">
        Review and approve pending distributor account requests.
      </p>
      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
      {info && <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{info}</div>}

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={loadRequests}
          className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded text-sm"
        >
          {loading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      <div className="grid gap-4">
        {requests.map(req => (
          <div key={req.request_id} className="bg-white border text-sm border-slate-200 rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 rounded">{req.request_id}</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 bg-orange-100 text-orange-700">
                  <Clock size={12} /> Pending
                </span>
                <span className="text-slate-400 text-xs">{new Date(req.requested_at).toLocaleDateString()}</span>
              </div>
              
              <h3 className="font-semibold text-slate-800 text-base">{req.company_name} <span className="text-slate-400 font-normal">({req.name})</span></h3>
              <p className="text-slate-600 mt-1"><span className="font-medium text-slate-700">Reason:</span> {req.reason || '-'}</p>
              
              <div className="mt-3 flex gap-4 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-3 py-2 inline-flex">
                <span><strong className="text-slate-700">Contact Email:</strong> {req.email}</span>
                <span><strong className="text-slate-700">Phone:</strong> {req.phone_no}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={reviewInputs[req.request_id]?.review_comment || ''}
                  onChange={(e) => updateRequestInput(req.request_id, 'review_comment', e.target.value)}
                  placeholder="Review comment (optional)"
                  className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <input
                  type="password"
                  value={reviewInputs[req.request_id]?.password || ''}
                  onChange={(e) => updateRequestInput(req.request_id, 'password', e.target.value)}
                  placeholder="Password for approval"
                  className="px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex gap-2">
                <button
                  disabled={processingId === req.request_id}
                  onClick={() => handleResolve(req.request_id, 'approved')}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  {processingId === req.request_id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  disabled={processingId === req.request_id}
                  onClick={() => handleResolve(req.request_id, 'rejected')}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  {processingId === req.request_id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="text-center p-8 bg-white rounded border border-slate-200 text-slate-500">
            No pending distributor account requests.
          </div>
        )}
      </div>
    </div>
  );
}
