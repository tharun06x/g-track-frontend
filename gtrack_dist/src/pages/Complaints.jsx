import { MessageSquareWarning, ChevronDown, ChevronUp, User, Phone, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest, readAuth } from '../lib/api';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');

  const [expandedId, setExpandedId] = useState(null);
  const [remarkInput, setRemarkInput] = useState({});

  async function loadComplaints() {
    const auth = readAuth();
    if (!auth || auth.role !== 'distributor' || !auth.distributor_id) {
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');
    try {
      const data = await apiRequest(`/api/v1/complaints?distributor_id=${encodeURIComponent(auth.distributor_id)}`, {
        method: 'GET',
      });

      const mapped = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.id,
        date: item.date,
        category: item.category,
        description: item.description,
        status: item.status,
        consumerName: item.consumer_name,
        consumerMobile: item.consumer_phone,
        consumerEmail: item.consumer_email,
        remark: item.remark || '',
      }));

      setComplaints(mapped);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRemarkChange = (id, value) => {
    setRemarkInput(prev => ({ ...prev, [id]: value }));
  };

  const submitRemark = async (id) => {
    const newRemark = remarkInput[id];
    if (!newRemark) return;

    const target = complaints.find((item) => item.id === id);
    if (!target) return;

    setSavingId(id);
    setError('');
    setInfo('');

    try {
      await apiRequest(`/api/v1/complaints/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: {
          status: 'Resolved',
          remark: newRemark,
          consumer_email: target.consumerEmail,
          consumer_name: target.consumerName,
        },
      });

      await loadComplaints();
      setInfo(`Complaint ${id} marked as Resolved.`);
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setSavingId('');
    }

    setRemarkInput(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="bg-white border rounded shadow-sm w-full p-6">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <MessageSquareWarning className="text-orange-500" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Consumer Complaints</h2>
      </div>
      {loading && <div className="mb-4 text-sm text-slate-600">Loading complaints...</div>}
      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
      {info && <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{info}</div>}

      <div className="grid gap-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200">
            {/* Summary Header - Clickable */}
            <div 
              className="p-4 bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-start"
              onClick={() => toggleExpand(complaint.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded">
                    {complaint.id}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    complaint.status === 'Open' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {complaint.status}
                  </span>
                  <span className="text-sm text-gray-400">{complaint.date}</span>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-1">{complaint.category}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{complaint.description}</p>
              </div>
              <div className="mt-2 text-gray-400">
                {expandedId === complaint.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {/* Expanded Detailed View */}
            {expandedId === complaint.id && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2 border-b pb-1">Consumer Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={16} className="text-blue-500" /> {complaint.consumerName}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} className="text-green-500" /> {complaint.consumerMobile}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} className="text-red-500" /> {complaint.consumerEmail}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Full Description</h4>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100">
                    {complaint.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Distributor Remark</h4>
                  {complaint.remark ? (
                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-100">
                      {complaint.remark}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <textarea 
                        className="flex-1 w-full text-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none min-h-[80px]"
                        placeholder="Add your resolution remark here. This will notify the consumer and resolve the complaint."
                        value={remarkInput[complaint.id] || ''}
                        onChange={(e) => handleRemarkChange(complaint.id, e.target.value)}
                      />
                      <button 
                        onClick={() => submitRemark(complaint.id)}
                        disabled={!remarkInput[complaint.id] || savingId === complaint.id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium flex items-center gap-2 transition-colors h-10"
                      >
                        {savingId === complaint.id ? 'Submitting...' : 'Submit'} <Send size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
