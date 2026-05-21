// distributor-complaints.js - Distributor Complaint Management
// ==========================================================

// Initialize page with authentication checks and data loading
async function initializeDistributorComplaints() {
  try {
    // Check authentication
    const auth = localStorage.getItem('gtrack_auth');
    if (!auth) {
      window.location.href = 'distributor-login.html';
      return;
    }

    const { token, distributor_id } = JSON.parse(auth);
    if (!token || !distributor_id) {
      window.location.href = 'distributor-login.html';
      return;
    }

    // Load complaints
    await loadDistributorComplaints(distributor_id, token);

    // Set up filter listener
    setupFilterListener(distributor_id, token);
  } catch (error) {
    console.error('Error initializing distributor complaints:', error);
    showErrorToast('Failed to load complaints');
  }
}

// Safe API request wrapper
async function safeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("gtrack_auth");
        window.location.href = '/index.html';
        return null;
      }
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

// Load complaints for distributor
async function loadDistributorComplaints(distributorId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  const complaints = await safeRequest(`${baseUrl}/api/v1/complaints/distributor/${distributorId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!complaints) {
    showErrorToast('Failed to load complaints');
    updateComplaintsList([]);
    return;
  }

  // Store complaints globally for filtering
  window.allComplaints = complaints;

  // Update display
  updateComplaintsList(complaints);
  updateStatistics(complaints);
}

// Update statistics
function updateStatistics(complaints) {
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  document.getElementById('stat-open').textContent = openCount;
  document.getElementById('stat-in-progress').textContent = inProgressCount;
  document.getElementById('stat-resolved').textContent = resolvedCount;
  document.getElementById('stat-total').textContent = complaints.length;
}

// Update complaints list display
function updateComplaintsList(complaints) {
  const complaintsList = document.getElementById('complaints-list');
  if (!complaintsList) {
    console.error('Complaints list container not found');
    return;
  }

  complaintsList.innerHTML = '';

  if (complaints.length === 0) {
    complaintsList.innerHTML = `
      <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
        <i class="ph ph-check-circle" style="font-size: 3rem; margin-bottom: 16px;"></i>
        <p style="font-size: 1.1rem;">No complaints found</p>
        <p>All complaints have been resolved or there are currently no complaints.</p>
      </div>
    `;
    return;
  }

  // Populate with complaint cards
  complaints.forEach(complaint => {
    const complaintCard = document.createElement('div');
    complaintCard.className = 'complaint-card';
    complaintCard.style.cssText = `
      border: 1px solid var(--grey);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all 0.3s ease;
    `;

    // Status badge
    const statusBadge = getStatusBadge(complaint.status);
    const priorityClass = complaint.status === 'Open' ? 'high-priority' : '';

    complaintCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
        <div style="flex: 1;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="font-weight: 700; font-size: 1.1rem; color: var(--black);">${complaint.id}</div>
            ${statusBadge}
          </div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">Filed on: ${formatDate(complaint.date)}</div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.02); border-radius: 8px; padding: 16px; display: flex; gap: 16px;">
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Consumer</div>
          <div style="font-weight: 600; color: var(--black);">${complaint.consumer_name}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary);">${complaint.consumer_email}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary);">${complaint.consumer_phone}</div>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Category</div>
          <div style="font-weight: 600; color: var(--black);">${complaint.category}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px;">Reference: ${complaint.distributor_id}</div>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.02); border-radius: 8px; padding: 16px;">
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">Description</div>
        <div style="color: var(--black); line-height: 1.5;">${complaint.description}</div>
      </div>

      ${complaint.remark ? `
      <div style="background: var(--lime); background: rgba(200, 255, 115, 0.1); border-left: 3px solid var(--lime); border-radius: 8px; padding: 16px;">
        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">Remark</div>
        <div style="color: var(--black);">${complaint.remark}</div>
      </div>
      ` : ''}

      <div style="display: flex; gap: 12px; margin-top: 12px;">
        <button class="action-btn in-progress-btn" data-complaint-id="${complaint.id}" data-consumer-name="${complaint.consumer_name}" data-consumer-email="${complaint.consumer_email}" style="padding: 10px 16px; border: 1px solid var(--grey); border-radius: 8px; background: transparent; cursor: pointer; font-weight: 500; transition: all 0.3s;">
          Mark In Progress
        </button>
        <button class="action-btn resolve-btn" data-complaint-id="${complaint.id}" data-consumer-name="${complaint.consumer_name}" data-consumer-email="${complaint.consumer_email}" style="padding: 10px 16px; border: 1px solid var(--grey); border-radius: 8px; background: transparent; cursor: pointer; font-weight: 500; transition: all 0.3s;">
          Mark Resolved
        </button>
        <button class="action-btn add-remark-btn" data-complaint-id="${complaint.id}" style="padding: 10px 16px; border: 1px solid var(--grey); border-radius: 8px; background: transparent; cursor: pointer; font-weight: 500; transition: all 0.3s;">
          Add Remark
        </button>
      </div>
    `;

    complaintsList.appendChild(complaintCard);
  });

  // Attach event listeners to action buttons
  attachActionListeners();
}

// Get status badge HTML
function getStatusBadge(status) {
  let badgeClass = 'bg-grey text-black';
  let badgeText = status;

  if (status === 'Open') {
    badgeClass = 'text-white';
    return `<span style="background: #ff3333; color: white; font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 100px;">${badgeText}</span>`;
  } else if (status === 'In Progress') {
    return `<span style="background: #FBBF24; color: white; font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 100px;">${badgeText}</span>`;
  } else if (status === 'Resolved') {
    return `<span class="pill bg-lime text-black" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 100px;">${badgeText}</span>`;
  } else if (status === 'Closed') {
    return `<span class="pill bg-grey text-black" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 100px;">${badgeText}</span>`;
  }

  return `<span class="pill bg-grey text-black" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; border-radius: 100px;">${badgeText}</span>`;
}

// Attach event listeners to action buttons
function attachActionListeners() {
  // In Progress buttons
  document.querySelectorAll('.in-progress-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const complaintId = btn.dataset.complaintId;
      const consumerName = btn.dataset.consumerName;
      const consumerEmail = btn.dataset.consumerEmail;
      const remark = prompt('Add a remark (optional):');
      
      await updateComplaintStatus(
        complaintId,
        'In Progress',
        remark || '',
        consumerName,
        consumerEmail,
        localStorage.getItem('gtrack_auth') ? JSON.parse(localStorage.getItem('gtrack_auth')).token : ''
      );
    });
  });

  // Resolve buttons
  document.querySelectorAll('.resolve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const complaintId = btn.dataset.complaintId;
      const consumerName = btn.dataset.consumerName;
      const consumerEmail = btn.dataset.consumerEmail;
      const remark = prompt('Add resolution remark:');
      
      if (!remark) {
        showErrorToast('Please provide a resolution remark');
        return;
      }

      await updateComplaintStatus(
        complaintId,
        'Resolved',
        remark,
        consumerName,
        consumerEmail,
        localStorage.getItem('gtrack_auth') ? JSON.parse(localStorage.getItem('gtrack_auth')).token : ''
      );
    });
  });

  // Add Remark buttons
  document.querySelectorAll('.add-remark-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const complaintId = btn.dataset.complaintId;
      const complaint = window.allComplaints.find(c => c.id === complaintId);
      const remark = prompt('Add a remark:', complaint?.remark || '');
      
      if (remark !== null) {
        await updateComplaintStatus(
          complaintId,
          complaint.status,
          remark,
          complaint.consumer_name,
          complaint.consumer_email,
          localStorage.getItem('gtrack_auth') ? JSON.parse(localStorage.getItem('gtrack_auth')).token : ''
        );
      }
    });
  });
}

// Update complaint status
async function updateComplaintStatus(complaintId, status, remark, consumerName, consumerEmail, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  const updateData = {
    status,
    remark,
    consumer_name: consumerName,
    consumer_email: consumerEmail
  };

  const response = await fetch(`${baseUrl}/api/v1/complaints/${complaintId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    showErrorToast('Failed to update complaint');
    return;
  }

  const result = await response.json();
  showSuccessToast(`Complaint updated to ${status}`);

  // Reload complaints
  const auth = localStorage.getItem('gtrack_auth');
  if (auth) {
    const { distributor_id, token: authToken } = JSON.parse(auth);
    await loadDistributorComplaints(distributor_id, authToken);
  }
}

// Setup filter listener
function setupFilterListener(distributorId, token) {
  const filterSelect = document.getElementById('status-filter');
  if (!filterSelect) return;

  filterSelect.addEventListener('change', (e) => {
    const selectedStatus = e.target.value;
    
    if (selectedStatus === '') {
      updateComplaintsList(window.allComplaints);
    } else {
      const filtered = window.allComplaints.filter(c => c.status === selectedStatus);
      updateComplaintsList(filtered);
    }
  });
}

// Format date helper
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

// Toast notifications
function showErrorToast(message) {
  console.error('Error:', message);
  alert(message);
}

function showSuccessToast(message) {
  console.log('Success:', message);
  alert(message);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeDistributorComplaints);
