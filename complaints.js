// complaints.js - Complaints & Support Page API Integration
// =========================================================

// Initialize page with authentication checks and data loading
async function initializeComplaints() {
  try {
    // Check authentication
    const auth = localStorage.getItem('gtrack_auth');
    if (!auth) {
      window.location.href = 'index.html';
      return;
    }

    const { token, user_id } = JSON.parse(auth);
    if (!token || !user_id) {
      window.location.href = 'index.html';
      return;
    }

    // Load user data and populate form fields
    await loadUserData(user_id, token);

    // Load previous tickets
    await loadPreviousTickets(user_id, token);

    // Set up form submission
    setupComplaintForm(user_id, token);
  } catch (error) {
    console.error('Error initializing complaints page:', error);
    showErrorToast('Failed to load complaints page');
  }
}

// Safe API request wrapper with error handling
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

// Load user data and pre-fill form fields
async function loadUserData(userId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  const userData = await safeRequest(`${baseUrl}/api/v1/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (userData) {
    // Store user info in window for form submission
    window.currentUserData = {
      name: userData.name || 'User',
      email: userData.email || '',
      user_id: userId,
      phone_no: userData.phone_no || ''
    };
    console.log('User data loaded:', window.currentUserData);
  } else {
    console.warn('Failed to load user data');
  }
}

// Load previous complaints
async function loadPreviousTickets(userId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  // Add cache buster to force fresh data
  const cacheTimestamp = Date.now();
  const url = `${baseUrl}/api/v1/complaints/user/${userId}?_t=${cacheTimestamp}`;

  console.log('Loading complaints from:', url);

  const complaints = await safeRequest(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('Complaints received:', complaints);

  if (!complaints || complaints.length === 0) {
    updateTicketList([]);
    return;
  }

  // Update ticket list with complaints
  updateTicketList(complaints);
}

// Update ticket list with complaint data
function updateTicketList(complaints) {
  const ticketList = document.querySelector('.ticket-list');
  if (!ticketList) {
    console.error('Ticket list not found');
    return;
  }

  // Clear existing tickets (except keep the empty state message if needed)
  ticketList.innerHTML = '';

  if (complaints.length === 0) {
    ticketList.innerHTML = `
      <div style="text-align: center; padding: 32px; color: var(--text-secondary);">
        <p>No tickets yet. Submit your first complaint above!</p>
      </div>
    `;
    return;
  }

  // Populate with complaint data
  complaints.forEach(complaint => {
    const ticketItem = document.createElement('div');
    ticketItem.className = 'ticket-item';
    ticketItem.style.cssText = 'border: 1px solid var(--grey); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 8px;';

    // Determine status badge styling
    let badgeClass = 'bg-grey text-black';
    if (complaint.status === 'Resolved') {
      badgeClass = 'bg-lime text-black';
    } else if (complaint.status === 'In Progress') {
      badgeClass = 'text-white';
    }
    let badgeStyle = badgeClass === 'text-white' 
      ? 'background: #FBBF24; font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 100px;'
      : `font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 100px;`;

    const badgeHTML = badgeClass === 'text-white'
      ? `<span class="pill" style="${badgeStyle}">${complaint.status}</span>`
      : `<span class="pill ${badgeClass}" style="font-size: 0.8rem; font-weight: 600; padding: 4px 12px; border-radius: 100px;">${complaint.status}</span>`;

    ticketItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="font-weight: 600; font-size: 1.1rem; color: var(--black);">${complaint.category || 'General Complaint'}</div>
        ${badgeHTML}
      </div>
      <div style="color: var(--text-secondary); font-size: 0.9rem;">Filed on: ${formatDate(complaint.date)}</div>
      <div style="font-size: 0.95rem; color: var(--black);">${complaint.description}</div>
      ${complaint.remark ? `<div style="font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">Remark: ${complaint.remark}</div>` : ''}
    `;

    ticketList.appendChild(ticketItem);
  });
}

// Set up form submission
function setupComplaintForm(userId, token) {
  const form = document.getElementById('complaint-form');
  const submitBtn = form.querySelector('button[type="button"]');

  if (!submitBtn) {
    console.error('Submit button not found');
    return;
  }

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Get form values by ID
    const subjectInput = document.getElementById('complaint-subject');
    const deviceInput = document.getElementById('complaint-device-id');
    const descriptionInput = document.getElementById('complaint-description');

    if (!subjectInput || !deviceInput || !descriptionInput) {
      console.error('Form elements not found', { subjectInput, deviceInput, descriptionInput });
      showErrorToast('Form fields not found');
      return;
    }

    const subject = subjectInput.value?.trim();
    const device = deviceInput.value?.trim();
    const description = descriptionInput.value?.trim();

    // Validate form
    if (!subject) {
      showErrorToast('Subject is required');
      return;
    }

    if (!description) {
      showErrorToast('Description is required');
      return;
    }

    if (description.length < 10) {
      showErrorToast('Description must be at least 10 characters');
      return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';

    try {
      // Submit complaint
      const result = await submitComplaint(userId, token, subject, device, description);
      console.log('Complaint submitted:', result);

      // Reset form
      subjectInput.value = '';
      deviceInput.value = '';
      descriptionInput.value = '';

      // Reload tickets
      await loadPreviousTickets(userId, token);

      showSuccessToast('Complaint submitted successfully');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showErrorToast(`Failed to submit complaint: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Submit a new complaint
async function submitComplaint(userId, token, subject, device, description) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';

  // Ensure we have user data
  if (!window.currentUserData) {
    throw new Error('User data not loaded');
  }

  const complaintData = {
    category: subject,
    description: `Device: ${device || 'Not specified'}\n\n${description}`,
    consumer_name: window.currentUserData.name,
    consumer_email: window.currentUserData.email,
    consumer_phone: window.currentUserData.phone_no || ''
  };

  console.log('Submitting complaint:', complaintData);

  const response = await fetch(`${baseUrl}/api/v1/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(complaintData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to submit complaint');
  }

  return await response.json();
}

// Format date helper
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch {
    return dateString;
  }
}

// Toast notification utilities
function showErrorToast(message) {
  console.error('Error:', message);
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ff4444; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 500; z-index: 9999; max-width: 400px;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function showSuccessToast(message) {
  console.log('Success:', message);
  // Create toast notification
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #22c55e; color: white; padding: 16px 24px; border-radius: 8px; font-weight: 500; z-index: 9999; max-width: 400px;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeComplaints);
