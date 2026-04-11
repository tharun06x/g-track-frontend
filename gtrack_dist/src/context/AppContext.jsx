import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Global State for Distributors
  const [distributors, setDistributors] = useState([
    { id: 'DIST-001', name: 'ABC Bharatgas Ernakulam', phone: '+91 9876543210', email: 'contact@abcbharatgas.in', address: 'Building No 45/A, MG Road, Ernakulam, Kerala', status: 'Active', password: 'password123' },
    { id: 'DIST-002', name: 'XYZ Gas Agency', phone: '+91 98765 43210', email: 'info@xyzgas.co.in', address: '12 Kaloor Road, Kochi', status: 'Inactive', password: 'password123' },
  ]);

  // Global State for Consumers
  const [consumers, setConsumers] = useState([
    { id: 'C-001', number: 'CN-884920', name: 'Alen Anto', address: 'Villa 3, Kaloor, Kochi', phone: '9845123456', status: 'Active', distributorId: 'DIST-001' },
    { id: 'C-002', number: 'CN-884921', name: 'Maria Thomas', address: 'Flat 4B, Edappally', phone: '9845123457', status: 'Active', distributorId: 'DIST-001' },
    { id: 'C-003', number: 'CN-884922', name: 'Ramesh Krishnan', address: 'House 55, Vyttila', phone: '9845123458', status: 'Inactive', distributorId: 'DIST-002' },
  ]);

  const [complaints, setComplaints] = useState([
    { id: 'CMP-101', distributorId: 'DIST-001', date: '2026-03-24', category: 'Delivery Delay', description: 'Refill not delivered after 3 days of booking.', status: 'Open', consumerName: 'John Doe', consumerMobile: '+91 98765 43210', consumerEmail: 'john.doe@example.com', remark: '' }
  ]);
  
  const [loginRequests, setLoginRequests] = useState([
    { id: 'REQ-504', distId: 'DIST-08', distName: 'DEF Distributors', date: '2026-03-24', issue: 'Forgot Password / Trouble Login', status: 'Pending', email: 'contact@def.in', phone: '9845123999' }
  ]);

  // Action methods bridging state modifiers securely
  const addConsumer = (newConsumer) => {
    setConsumers([...consumers, newConsumer]);
  };

  const addDistributor = (newDistributor) => {
    setDistributors([...distributors, newDistributor]);
  };

  const updateDistributor = (updatedDistributor) => {
    setDistributors(distributors.map(d => d.id === updatedDistributor.id ? updatedDistributor : d));
  };
  
  const updateLoginRequest = (id, newStatus) => {
    setLoginRequests(loginRequests.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  const addLoginRequest = (newRequest) => {
    setLoginRequests([...loginRequests, newRequest]);
  };

  const updateComplaint = (id, updatedComplaint) => {
    setComplaints(complaints.map(c => c.id === id ? updatedComplaint : c));
  }

  // Active globally authenticated user mock
  const [currentDistributor, setCurrentDistributor] = useState('DIST-001');

  const value = {
    distributors, addDistributor, updateDistributor,
    consumers, addConsumer,
    complaints, updateComplaint,
    loginRequests, updateLoginRequest, addLoginRequest,
    currentDistributor, setCurrentDistributor
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
