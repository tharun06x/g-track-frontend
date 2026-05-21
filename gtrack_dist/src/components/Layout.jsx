import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { clearAuth, readAuth } from '../lib/api';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const auth = readAuth();

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem('gtrack_auth');
    window.location.href = '../../distributor-login.html';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!auth || auth.role !== 'distributor' || !auth.token) {
      window.location.href = '../../distributor-login.html';
    }
  }, [auth]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white flex justify-between items-center px-6 py-3 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-widest flex items-center gap-1 font-[Poppins] uppercase">
            G-TRACK
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">Welcome {auth?.name || 'Distributor'}</span>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            title="Logout"
          >
            <LogOut size={20} className="text-red-400" />
          </button>
        </div>
      </header>

      {/* Navbar */}
      <nav className="bg-blue-800 text-white text-sm shadow-md z-10">
        <ul className="flex items-center">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors ${
                location.pathname === '/dashboard' ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              My Info
            </Link>
          </li>
          
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
              className={`flex items-center gap-1 h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors w-full ${
                ['/registered-consumers', '/booking-refills'].includes(location.pathname) ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              My Applications <ChevronDown size={14} className={`transform transition-transform ${isAppMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isAppMenuOpen && (
              <ul className="absolute left-0 mt-0 w-64 bg-white text-gray-800 shadow-xl border border-gray-100 rounded-b-md overflow-hidden z-20">
                <li>
                  <Link
                    to="/registered-consumers"
                    onClick={() => setIsAppMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 text-sm"
                  >
                    GTrack Registered Consumer details
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking-refills"
                    onClick={() => setIsAppMenuOpen(false)}
                    className="block px-4 py-3 hover:bg-blue-50 hover:text-blue-700 text-sm"
                  >
                    Refill booking
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/complaints"
              className={`flex items-center h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors ${
                location.pathname === '/complaints' ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              Complaints
            </Link>
          </li>
          <li>
            <Link
              to="/self-service"
              className={`flex items-center h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors ${
                location.pathname.startsWith('/self-service') || location.pathname === '/user-profile' ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              Self Service Center
            </Link>
          </li>
          <li>
            <Link
              to="/report"
              className={`flex items-center h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors ${
                location.pathname === '/report' ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              Report
            </Link>
          </li>
          <li>
            <Link
              to="/help"
              className={`flex items-center h-full px-5 py-3 border-r border-blue-700 hover:bg-blue-700 transition-colors ${
                location.pathname === '/help' ? 'bg-blue-900 font-semibold' : ''
              }`}
            >
              Help
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 flex justify-center w-full">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
