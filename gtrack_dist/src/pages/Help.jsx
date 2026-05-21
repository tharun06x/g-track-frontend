import { useState, useEffect } from 'react';
import { PhoneCall, Mail, LifeBuoy, ShieldAlert, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest, readAuth } from '../lib/api';

export default function Help() {
  const [activeDistInfo, setActiveDistInfo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchDistributor() {
      try {
        const auth = readAuth();
        if (!auth || !auth.token) return;
        
        // Use /me to get active dist info
        const me = await apiRequest('/api/v1/distributors/me', {
          token: auth.token
        });
        setActiveDistInfo(me);
      } catch (err) {
        console.error('Failed to load distributor details for Help page:', err);
      }
    }
    fetchDistributor();
  }, []);

  const handleTroubleLogin = async () => {
    if (!activeDistInfo) return;
    setErrorMsg('');

    try {
      await apiRequest('/api/v1/admin/login-trouble-request', {
        method: 'POST',
        body: {
          email: activeDistInfo.email,
          phone: activeDistInfo.phone_no,
          issue: 'Authenticated Account - Trouble Login / Sync Issue',
          distId: activeDistInfo.distributor_id || activeDistInfo.id
        }
      });
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit trouble request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy size={32} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Help & Support Center</h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm">
          If you are experiencing issues with the portal or need structural changes to your registered distributor details, please reach out directly to the G-TRACK technical administrator.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Administrator Email Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">Email Administrator</h3>
          <p className="text-sm text-gray-500 mb-4">Send a detailed email regarding your issue or edit request.</p>
          <a href="mailto:admin@gtrack.app" className="text-blue-600 font-semibold text-lg hover:underline mt-auto">
            admin@gtrack.app
          </a>
          <p className="text-xs text-gray-400 mt-2">Response time: 24 - 48 hours</p>
        </div>

        {/* Administrator Phone Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
            <PhoneCall size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">Call Support</h3>
          <p className="text-sm text-gray-500 mb-4">For urgent delivery tracking issues or portal errors.</p>
          <a href="tel:+9118004567890" className="text-green-600 font-semibold text-lg hover:underline mt-auto">
            +91 1800-456-7890
          </a>
          <p className="text-xs text-gray-400 mt-2">Available Mon-Sat, 9AM to 6PM</p>
        </div>
      </div>

      {/* Internal Trouble Login Reporting System */}
      <div className="mt-8 max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 text-gray-800">
              <AlertCircle size={20} className="text-orange-500" />
              <h3 className="text-lg font-semibold">Report 'Trouble Login' internally</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              If your account is randomly disconnecting or you're experiencing 'trouble login' issues, click the button to automatically send your profile details to the Administrator's Requests queue.
            </p>
           
            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border border-gray-100 flex gap-4">
              <span><strong>Sending Dist ID:</strong> {activeDistInfo?.distributor_id || activeDistInfo?.id || 'Unknown'}</span>
              <span><strong>Contact:</strong> {activeDistInfo?.email || 'N/A'}</span>
            </div>
            
            {errorMsg && (
              <div className="mt-3 text-sm text-red-500 font-medium">
                {errorMsg}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            {submitted ? (
              <button disabled className="bg-green-100 text-green-700 px-6 py-3 rounded-md font-medium flex items-center gap-2 transition cursor-default">
                <CheckCircle size={18} /> Ticket Submitted
              </button>
            ) : (
              <button 
                onClick={handleTroubleLogin}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-md font-medium transition whitespace-nowrap"
              >
                Submit Trouble Request
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-3xl mx-auto bg-orange-50 border border-orange-100 rounded-lg p-5 flex items-start gap-4">
        <ShieldAlert className="text-orange-500 flex-shrink-0 mt-0.5" size={24} />
        <div>
          <h4 className="font-medium text-orange-800 mb-1">Security Notice</h4>
          <p className="text-sm text-orange-700/80">
            For security reasons, administrators will never ask for your Distributor login password. If you receive such requests on behalf of G-TRACK, report them immediately using the contact information above.
          </p>
        </div>
      </div>
    </div>
  );
}
