document.addEventListener('DOMContentLoaded', () => {
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  const auth = window.GTrackApi.readAuth();
  if (!auth || auth.role !== 'user' || !auth.token) {
    window.location.href = 'index.html';
    return;
  }

  const elements = {
    currentLevel: document.getElementById('current-level-value'),
    currentProgress: document.getElementById('current-level-progress'),
    currentWarning: document.getElementById('current-level-warning'),
    deliveryAddress: document.getElementById('delivery-address'),
    bookingForm: document.getElementById('booking-form'),
    confirmBtn: document.querySelector('[data-action="confirm-booking"]'),
    refillHistoryList: document.getElementById('refill-history-list'),
  };

  async function loadUserData() {
    try {
      const me = await window.GTrackApi.request('/api/v1/users/me', {
        method: 'GET',
        token: auth.token,
      });

      if (!me.device_id) {
        showToast('No device linked to your account yet.', 'warning');
        if (elements.currentLevel) elements.currentLevel.textContent = '--';
        return;
      }

      // Load current gas level
      const summary = await window.GTrackApi.request(
        `/api/v1/dashboard/summary?device_id=${encodeURIComponent(me.device_id)}`,
        { method: 'GET' }
      );

      const currentWeight = Number(summary?.remaining_gas || 0);
      const percent = Math.max(0, Math.min(100, Math.round((currentWeight / 14) * 100)));

      if (elements.currentLevel) {
        elements.currentLevel.textContent = `${percent}%`;
      }

      if (elements.currentProgress) {
        elements.currentProgress.style.width = `${percent}%`;
        if (percent <= 20) {
          elements.currentProgress.style.background = '#ff3a3a';
        } else if (percent <= 50) {
          elements.currentProgress.style.background = '#fbbf24';
        } else {
          elements.currentProgress.style.background = 'var(--lime)';
        }
      }

      if (elements.currentWarning) {
        if (percent <= 15) {
          elements.currentWarning.textContent =
            'Your gas level is critically low. We recommend booking immediately.';
          elements.currentWarning.style.color = '#ff3a3a';
        } else if (percent <= 30) {
          elements.currentWarning.textContent =
            'Your gas level is low. Consider booking a refill soon.';
          elements.currentWarning.style.color = '#fbbf24';
        } else {
          elements.currentWarning.textContent =
            'Your gas level is healthy. Book refill as needed.';
          elements.currentWarning.style.color = 'rgba(255,255,255,0.7)';
        }
      }

      // Load user settings (address)
      const settings = await window.GTrackApi.request(
        `/api/v1/settings/${encodeURIComponent(me.user_id)}`,
        { method: 'GET', token: auth.token }
      );

      if (elements.deliveryAddress && settings?.address) {
        elements.deliveryAddress.value = settings.address;
      }

      // Load refill history
      const refills = await window.GTrackApi.request(
        `/api/v1/refill/user/${encodeURIComponent(me.user_id)}`,
        { method: 'GET' }
      );

      renderRefillHistory(Array.isArray(refills) ? refills : []);

      // Store user_id for form submission
      elements.bookingForm.dataset.userId = me.user_id;
    } catch (error) {
      showToast(`Failed to load user data: ${error.message}`, 'error');
    }
  }

  function renderRefillHistory(refills) {
    if (!elements.refillHistoryList) return;

    if (refills.length === 0) {
      elements.refillHistoryList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
          No refill history yet.
        </div>
      `;
      return;
    }

    const html = refills
      .slice(0, 5)
      .map((item) => {
        const statusColor =
          item.status === 'approved'
            ? 'var(--lime)'
            : item.status === 'rejected'
              ? '#f87171'
              : '#94a3b8';
        const statusLabel = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        const requestDate = new Date(item.requested_date).toLocaleDateString();

        return `
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.95rem;">Request ${item.request_id}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">${requestDate}</div>
            </div>
            <div style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 600;">
              ${statusLabel}
            </div>
          </div>
        `;
      })
      .join('');

    elements.refillHistoryList.innerHTML = html;
  }

  async function submitBooking(e) {
    e.preventDefault();

    const userId = elements.bookingForm.dataset.userId;
    if (!userId) {
      showToast('User ID not found. Please reload the page.', 'error');
      return;
    }

    if (elements.confirmBtn) {
      elements.confirmBtn.disabled = true;
      const originalText = elements.confirmBtn.textContent;
      elements.confirmBtn.textContent = 'Submitting...';

      try {
        const result = await window.GTrackApi.request(
          `/api/v1/refill/request?user_id=${encodeURIComponent(userId)}`,
          {
            method: 'POST',
            token: auth.token,
          }
        );

        showToast(
          `Refill booking submitted! Request ID: ${result.request_id}`,
          'success'
        );

        // Reset form
        elements.bookingForm.reset();

        // Reload refill history
        await loadUserData();
      } catch (error) {
        showToast(`Failed to submit booking: ${error.message}`, 'error');
      } finally {
        elements.confirmBtn.disabled = false;
        elements.confirmBtn.textContent = originalText;
      }
    }
  }

  if (elements.confirmBtn) {
    elements.confirmBtn.addEventListener('click', submitBooking);
  }

  // Load initial data
  loadUserData();
});
