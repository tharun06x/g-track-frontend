// refill-history.js - Refill History Page API Integration
// ============================================================

// Initialize page with authentication checks and data loading
async function initializeRefillHistory() {
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

    // Load refill history
    await loadRefillHistory(user_id, token);
  } catch (error) {
    console.error('Error initializing refill history:', error);
    showErrorToast('Failed to load refill history');
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

// Load refill history from API
async function loadRefillHistory(userId, token) {
  const baseUrl = window.GTrackApi?.baseUrl || 'https://g-track-backend-94gv.onrender.com';
  
  // Fetch refill history
  const historyUrl = `${baseUrl}/api/v1/refill/history/${userId}`;
  const history = await safeRequest(historyUrl);

  if (!history || history.length === 0) {
    updateRefillTable([]);
    return;
  }

  // Update table with refill history
  updateRefillTable(history);

  // Set up download button
  setupDownloadButton(history);
}

// Update refill history table with data
function updateRefillTable(refills) {
  const tbody = document.querySelector('.sensor-table tbody');
  if (!tbody) {
    console.error('Table tbody not found');
    return;
  }

  // Clear existing rows
  tbody.innerHTML = '';

  if (refills.length === 0) {
    tbody.innerHTML = `
      <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
        <td colspan="5" style="padding: 32px 8px; text-align: center; color: var(--text-secondary);">
          No refill history available
        </td>
      </tr>
    `;
    return;
  }

  // Populate table with refill data
  refills.forEach(refill => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid rgba(0,0,0,0.05)';

    // Determine status icon and color
    let statusIcon = '';
    let statusClass = '';
    
    if (refill.status === 'approved') {
      statusIcon = '<i class="ph-fill ph-check-circle text-lime" style="font-size: 1.2rem;"></i>';
      statusClass = 'text-lime';
    } else if (refill.status === 'pending') {
      statusIcon = '<i class="ph-fill ph-clock-counter-clockwise" style="font-size: 1.2rem; color: #ff9500;"></i>';
      statusClass = 'text-orange';
    } else if (refill.status === 'rejected') {
      statusIcon = '<i class="ph-fill ph-x-circle" style="font-size: 1.2rem; color: #ff3333;"></i>';
      statusClass = 'text-red';
    }

    // Amount cell content
    let amountContent = refill.amount === '--' 
      ? '<span style="color: var(--text-secondary);">--</span>'
      : `<span class="pill bg-lime text-black font-medium" style="padding: 4px 12px;">${refill.amount}</span>`;

    // Delivered by cell content
    let deliveredByContent = refill.delivered_by === '--'
      ? '<span style="color: var(--text-secondary);">Pending</span>'
      : refill.delivered_by;

    row.innerHTML = `
      <td style="padding: 16px 8px; font-weight: 600;">${refill.date}</td>
      <td style="padding: 16px 8px;">${refill.time}</td>
      <td style="padding: 16px 8px;">${amountContent}</td>
      <td style="padding: 16px 8px;">${deliveredByContent}</td>
      <td style="padding: 16px 8px;">${statusIcon}</td>
    `;

    tbody.appendChild(row);
  });
}

// Setup download button functionality
function setupDownloadButton(refills) {
  const downloadBtn = document.querySelector('.pill-btn');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', () => {
    downloadRefillLogs(refills);
  });
}

// Download refill logs as CSV
function downloadRefillLogs(refills) {
  // Prepare CSV data
  const headers = ['Date', 'Time', 'Status', 'Amount Added', 'Delivered By'];
  const rows = refills.map(r => [
    r.date,
    r.time,
    r.status.toUpperCase(),
    r.amount,
    r.delivered_by
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `refill-history-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showSuccessToast('Refill logs downloaded successfully');
}

// Toast notification utilities
function showErrorToast(message) {
  console.error('Error:', message);
  // Could integrate with a toast library here
}

function showSuccessToast(message) {
  console.log('Success:', message);
  // Could integrate with a toast library here
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeRefillHistory);
