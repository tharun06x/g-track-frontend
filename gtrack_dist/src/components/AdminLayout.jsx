import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { clearAuth, readAuth } from '../lib/api';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = readAuth();

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem('gtrack_auth');
    navigate('/admin/login');
  };

  useEffect(() => {
    if (!auth || auth.role !== 'admin' || !auth.token) {
      navigate('/admin/login');
    }
  }, [auth, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Admin Top Header - Distinct Red/Dark theme */}
      <header className="bg-slate-900 text-white flex justify-between items-center px-6 py-3 shadow-md border-b-4 border-red-600">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={24} />
          <span className="text-xl font-bold tracking-widest flex items-center gap-1 font-[Poppins] uppercase">
            G-TRACK <span className="text-xs align-top ml-1 text-red-500 font-extrabold uppercase tracking-widest">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-slate-300">
            System Admin: <span className="text-white font-bold ml-1">{auth?.name || auth?.email || 'Administrator'}</span>
          </span>
          <button 
            onClick={handleLogout}
            className="px-3 h-9 bg-red-600 hover:bg-red-700 text-white font-medium rounded flex items-center gap-2 transition-colors shadow-sm ml-2"
            title="Terminate Session"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Admin Navbar */}
      <nav className="bg-slate-800 text-white text-sm shadow-md z-10 sticky top-0">
        <ul className="flex items-center">
          <li>
            <Link
              to="/admin/dashboard"
              className={`flex items-center h-full px-5 py-3 border-r border-slate-700 hover:bg-slate-700 transition-colors ${
                location.pathname === '/admin/dashboard' ? 'bg-slate-700 font-semibold border-b-2 border-b-red-500' : ''
              }`}
            >
              Info
            </Link>
          </li>
          
          <li>
            <Link
              to="/admin/distributors"
              className={`flex items-center h-full px-5 py-3 border-r border-slate-700 hover:bg-slate-700 transition-colors ${
                location.pathname.startsWith('/admin/distributor') ? 'bg-slate-700 font-semibold border-b-2 border-b-red-500' : ''
              }`}
            >
              Distributor Option
            </Link>
          </li>

          <li>
            <Link
              to="/admin/requests"
              className={`flex items-center h-full px-5 py-3 border-r border-slate-700 hover:bg-slate-700 transition-colors ${
                location.pathname === '/admin/requests' ? 'bg-slate-700 font-semibold border-b-2 border-b-red-500' : ''
              }`}
            >
              Requests
            </Link>
          </li>

          <li>
            <Link
              to="/admin/profile"
              className={`flex items-center h-full px-5 py-3 border-r border-slate-700 hover:bg-slate-700 transition-colors ${
                location.pathname === '/admin/profile' ? 'bg-slate-700 font-semibold border-b-2 border-b-red-500' : ''
              }`}
            >
              Admin Profile
            </Link>
          </li>
        </ul>
      </nav>

      {/* Admin Main Content Area */}
      <main className="flex-1 p-6 md:p-8 flex justify-center w-full">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
