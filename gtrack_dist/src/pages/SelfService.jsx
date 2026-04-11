import { Link } from 'react-router-dom';
import { UserCircle, KeyRound, ChevronRight } from 'lucide-react';

export default function SelfService() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Self Service Center</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Profile View Link */}
        <Link to="/user-profile" className="bg-white border rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <UserCircle size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 mb-1">User Profile Details</h3>
            <p className="text-sm text-gray-500 mb-4">View your distributor information including address and identity details.</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              View Profile <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </Link>

        {/* Password Change Card (Placeholder) */}
        <div className="bg-white border rounded shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0">
            <KeyRound size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 mb-1">Password Change</h3>
            <p className="text-sm text-gray-500 mb-4">Update your account password. We recommend changing it periodically for security.</p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Update Password <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
