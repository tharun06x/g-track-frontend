import { useEffect, useState } from 'react';
import { Plus, ArrowLeft, Save, ShieldCheck, RefreshCw, Search } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function DistributorManagement() {
  const [distributors, setDistributors] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [view, setView] = useState('list'); // 'list', 'create'

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', address: '', password: '', state: '', district: '', status: 'Active'
  });

  async function loadDistributors() {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/v1/distributors', { method: 'GET' });
      setDistributors(Array.isArray(data) ? data : []);
      setInfo('Distributor list refreshed.');
    } catch (apiError) {
      setError(apiError.message);
      setInfo('');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDistributors();
  }, []);

  const handleCreateNew = () => {
    setError('');
    setInfo('');
    setFormData({ name: '', phone: '', email: '', address: '', password: '', state: '', district: '', status: 'Active' });
    setView('create');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiRequest('/api/v1/distributors/register', {
        method: 'POST',
        body: {
          email: formData.email,
          password: formData.password,
          retry_password: formData.password,
          name: formData.name,
          phone_no: formData.phone,
          address: formData.address,
          state: formData.state,
          district: formData.district,
        },
      });

      await loadDistributors();
      setView('list');
      setInfo('Distributor account created successfully.');
    } catch (apiError) {
      setError(apiError.message);
      setInfo('');
    } finally {
      setSaving(false);
    }
  };

  const visibleDistributors = distributors.filter((dist) => {
    const haystack = `${dist.id || ''} ${dist.name || ''} ${dist.email || ''} ${dist.phone_no || ''} ${dist.state || ''} ${dist.district || ''}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Distributor Management</h2>
        <div className="flex items-center gap-2">
          {view === 'list' && (
            <button
              type="button"
              onClick={loadDistributors}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          )}
          {view === 'list' && (
            <button 
              onClick={handleCreateNew}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
            >
              <Plus size={18} /> Add New Distributor
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
      {info && <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{info}</div>}

      {view === 'list' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-600">
              {loading ? 'Loading distributors...' : `Total distributors: ${distributors.length}`}
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, name, email, phone..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <table className="w-full text-sm text-left align-middle">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Dist ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleDistributors.map(dist => (
                <tr key={dist.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-800">{dist.id}</td>
                  <td className="px-5 py-4 text-slate-700 font-medium">{dist.name}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    <div>{dist.phone_no}</div>
                    <div>{dist.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    <div>{dist.district || '-'}</div>
                    <div>{dist.state || '-'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {visibleDistributors.length === 0 && (
                <tr><td colSpan="5" className="text-center py-6 text-slate-500">No distributors found for current search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'create' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 max-w-2xl">
          <button 
            onClick={() => setView('list')}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium mb-6"
          >
            <ArrowLeft size={16} /> Back to List
          </button>

          <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            <ShieldCheck className="text-red-500" />
            Register New Distributor
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Distributor Name</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm" placeholder="Agency Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Password</label>
                <input 
                  type="text" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm bg-red-50" placeholder="Secure Password"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm" placeholder="State"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                <input
                  type="text" required value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm" placeholder="District"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm" placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="text" required pattern="^\+?[1-9]\d{7,14}$" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm" placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
              <textarea 
                required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-2.5 border border-slate-300 rounded focus:border-red-500 focus:outline-none text-sm resize-none h-24" placeholder="Full physical address"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t mt-6">
              <button 
                type="submit"
                disabled={saving}
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded font-medium flex items-center gap-2 transition"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Create Distributor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
