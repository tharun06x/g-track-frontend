import { useState } from 'react';
import { ShieldCheck, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { apiRequest, readAuth } from '../../lib/api';

export default function AdminProfile() {
  const auth = readAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({
    admin_id: '',
    name: '',
    email: '',
    phone_no: '',
    password: '',
  });

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    setInfo('');

    try {
      await apiRequest('/api/v1/admin/register', {
        method: 'POST',
        body: {
          admin_id: form.admin_id,
          name: form.name,
          email: form.email,
          phone_no: form.phone_no || null,
          password: form.password,
        },
      });

      setInfo('New administrator account created successfully.');
      setForm({ admin_id: '', name: '', email: '', phone_no: '', password: '' });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <ShieldAlert className="text-red-600" size={28} /> System Administrator Profile
      </h2>

      <div className="bg-white border text-sm border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="bg-slate-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
              A
            </div>
            <div>
              <h3 className="text-lg font-bold">{auth?.name || 'G-TRACK Master Admin'}</h3>
              <p className="text-slate-300 text-xs tracking-wider">Level 1 Clearance</p>
            </div>
          </div>
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <ShieldCheck size={14} /> Active Session
          </span>
        </div>

        <div className="p-6 divide-y divide-slate-100">
          <div className="py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-1/3 text-slate-500 font-medium tracking-wide text-xs uppercase">Administrator ID</div>
            <div className="w-2/3 text-slate-800 font-semibold font-mono">{auth?.admin_id || '-'}</div>
          </div>
          
          <div className="py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-1/3 text-slate-500 font-medium tracking-wide text-xs uppercase">Official Support Email</div>
            <div className="w-2/3 text-slate-800 flex items-center gap-2">
              <Mail size={16} className="text-slate-400" /> {auth?.email || 'admin@gtrack.app'}
            </div>
          </div>

          <div className="py-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-1/3 text-slate-500 font-medium tracking-wide text-xs uppercase">Assigned Region</div>
            <div className="w-2/3 text-slate-800">Kerala, India - Central Hub</div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4">
        <div className="bg-white p-2 rounded shadow-sm text-red-600 border border-red-100 flex-shrink-0 mt-1">
          <KeyRound size={24} />
        </div>
        <div>
          <h4 className="text-red-900 font-semibold mb-1">Security Credentials</h4>
          <p className="text-sm text-red-800/80 mb-3">
            You hold the master credentials for the G-TRACK portal. Do not share your login details or session cookies with any distributor. 
            All modifications done on this account are strictly logged.
          </p>
          <button className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium transition-colors">
            Rotate Master Key (Change Password)
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Create Additional Admin</h4>
        <p className="text-sm text-slate-500 mb-4">This form maps to the backend admin registration schema.</p>
        {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
        {info && <div className="mb-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{info}</div>}

        <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            value={form.admin_id}
            onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
            placeholder="Admin ID"
            className="px-3 py-2 border border-slate-300 rounded text-sm"
          />
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="px-3 py-2 border border-slate-300 rounded text-sm"
          />
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="px-3 py-2 border border-slate-300 rounded text-sm"
          />
          <input
            value={form.phone_no}
            onChange={(e) => setForm({ ...form, phone_no: e.target.value })}
            placeholder="Phone (optional)"
            className="px-3 py-2 border border-slate-300 rounded text-sm"
          />
          <input
            required
            type="password"
            minLength={8}
            maxLength={20}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Password (8-20 chars)"
            className="px-3 py-2 border border-slate-300 rounded text-sm md:col-span-2"
          />

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded text-sm font-medium"
            >
              {creating ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
