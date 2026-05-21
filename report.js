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
    totalDeliveries: document.getElementById('stat-total-deliveries'),
    activeSensors: document.getElementById('stat-active-sensors'),
    totalGasUsage: document.getElementById('stat-total-gas-usage'),
    analyticsAvg: document.getElementById('analytics-avg'),
    analyticsLine: document.getElementById('analytics-line'),
    analyticsArea: document.getElementById('analytics-area'),
    alertsList: document.getElementById('alerts-list'),
    sensorTableBody: document.querySelector('.sensor-table tbody'),
    yearlyTrendChart: document.getElementById('yearly-trend-chart'),
  };

  let userDeviceId = null;
  let userId = null;

  async function loadReportData() {
    try {
      // Load user and device info
      const me = await window.GTrackApi.request('/api/v1/users/me', {
        method: 'GET',
        token: auth.token,
      });

      userId = me.user_id;
      userDeviceId = me.device_id;

      if (!userDeviceId) {
        showToast('No device linked to your account yet.', 'warning');
        return;
      }

      // Load daily, monthly stats, and refills in parallel
      const [overview, dailyStats, monthlyStats, refills] = await Promise.all([
        safeRequest(`/api/v1/reports/device/data-overview?device_id=${encodeURIComponent(userDeviceId)}`),
        safeRequest(`/api/v1/reports/gas-usage/stats?device_id=${encodeURIComponent(userDeviceId)}&granularity=daily&month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`, { method: 'GET' }),
        safeRequest(`/api/v1/reports/gas-usage/stats?device_id=${encodeURIComponent(userDeviceId)}&granularity=monthly&year=${new Date().getFullYear()}`, { method: 'GET' }),
        safeRequest(`/api/v1/refill/user/${encodeURIComponent(userId)}`, { method: 'GET' }),
      ]);

      // Update banner stats
      updateBannerStats(overview, refills, monthlyStats);

      // Update yearly trend using monthlyStats (for 12 months)
      if (monthlyStats) {
        updateYearlyTrendChart(monthlyStats);
      }

      // Update alerts
      updateAlerts(overview);

      // Update sensor table
      updateSensorTable(overview);

      // Update analytics chart (using daily data)
      if (dailyStats) {
        updateAnalyticsChart(dailyStats);
      }
    } catch (error) {
      showToast(`Failed to load report: ${error.message}`, 'error');
    }
  }

  async function safeRequest(path, options = {}) {
    try {
      return await window.GTrackApi.request(path, {
        ...options,
        token: options.token || auth.token,
      });
    } catch {
      return null;
    }
  }

  function updateBannerStats(overview, refills, monthlyStats) {
    // Total deliveries (refill requests count)
    if (elements.totalDeliveries) {
      const total = Array.isArray(refills) ? refills.length : 0;
      elements.totalDeliveries.textContent = total.toString();
    }

    // Active sensors (based on device presence)
    if (elements.activeSensors) {
      elements.activeSensors.textContent = overview?.has_live_sensor_data ? '1' : '0';
    }

    // Total gas usage (lifecycle count or sum of monthly data)
    if (elements.totalGasUsage) {
      let totalUsage = 0;
      if (overview?.synthetic_device?.lifecycle_count > 0) {
        totalUsage = overview.synthetic_device.lifecycle_count * 12;
      } else if (Array.isArray(monthlyStats) && monthlyStats.length > 0) {
        totalUsage = monthlyStats.reduce((sum, m) => sum + (Number(m.usage) || 0), 0);
      }
      elements.totalGasUsage.textContent = `${Math.round(totalUsage)} kg`;
    }
  }

  function updateAnalyticsChart(dailyStats) {
    if (!elements.analyticsAvg) return;

    const dataPoints = Array.isArray(dailyStats) ? dailyStats : [];
    if (dataPoints.length === 0) {
      elements.analyticsAvg.textContent = `0 kg avg`;
      if (elements.analyticsLine) elements.analyticsLine.removeAttribute('d');
      if (elements.analyticsArea) elements.analyticsArea.removeAttribute('d');
      return;
    }

    // Calculate average
    const avgUsage = dataPoints.reduce((sum, d) => sum + (Number(d.usage) || 0), 0) / dataPoints.length;
    elements.analyticsAvg.textContent = `${avgUsage.toFixed(1)} kg/day`;

    // Try to draw a very simple curve based on data points
    const maxVal = Math.max(...dataPoints.map((d) => Number(d.usage) || 0), 1);
    const width = 1000;
    const height = 160;
    const padding = 20;

    let points = '';
    dataPoints.forEach((d, i) => {
      const x = (i / (dataPoints.length - 1 || 1)) * width;
      const y = height - padding - ((Number(d.usage) || 0) / maxVal) * (height - 2 * padding);
      points += `${x},${y} `;
    });

    if (points) {
      const d = generateSmoothPath(points.trim());
      if (d) {
        if (elements.analyticsLine) elements.analyticsLine.setAttribute('d', d);
        if (elements.analyticsArea) elements.analyticsArea.setAttribute('d', `${d} L1000,200 L0,200 Z`);
      } else {
        if (elements.analyticsLine) elements.analyticsLine.removeAttribute('d');
        if (elements.analyticsArea) elements.analyticsArea.removeAttribute('d');
      }
    }
  }

  function generateSmoothPath(pointsString) {
    const points = pointsString.split(' ').map((p) => {
      const [x, y] = p.split(',').map(Number);
      return { x, y };
    });

    if (points.length < 2) return '';

    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const controlX1 = current.x + (next.x - current.x) / 3;
      const controlY1 = current.y;
      const controlX2 = current.x + ((next.x - current.x) * 2) / 3;
      const controlY2 = next.y;
      path += ` C${controlX1},${controlY1} ${controlX2},${controlY2} ${next.x},${next.y}`;
    }
    return path;
  }

  function updateYearlyTrendChart(yearlyStats) {
    if (!elements.yearlyTrendChart) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const yearlyData = Array.isArray(yearlyStats) ? yearlyStats : [];

    // Create map of month to usage
    const usageByMonth = new Map();
    yearlyData.forEach((item) => {
      const month = Number(item.period);
      if (month >= 1 && month <= 12) {
        usageByMonth.set(month, Number(item.usage) || 0);
      }
    });

    const maxUsage = Math.max(...Array.from(usageByMonth.values()), 1);

    // Find and update all trend columns
    const trendCols = elements.yearlyTrendChart.querySelectorAll('.trend-month-col');
    trendCols.forEach((col, idx) => {
      const monthNum = idx + 1;
      const usage = usageByMonth.get(monthNum) || 0;
      const percentHeight = yearlyData.length === 0 ? 0 : (usage / maxUsage) * 100;

      const bar = col.querySelector('.trend-bar');
      if (bar) {
        bar.style.height = `${percentHeight}%`;
        bar.setAttribute('data-target', `${Math.round(percentHeight)}%`);
        bar.setAttribute('title', `${months[idx]}: ${Math.round(percentHeight)}%`);
      }
    });
  }

  function updateAlerts(overview) {
    if (!elements.alertsList) return;

    const alerts = [];

    // Device health alert
    if (overview?.has_live_sensor_data) {
      alerts.push({
        priority: 'ok',
        sensorId: 'SENSOR #' + (userDeviceId?.substring(0, 4) || 'D001').toUpperCase(),
        desc: 'All systems optimal',
        icon: 'ph-check-circle',
        color: 'var(--lime)',
      });
    }

    // Low weight warning
    if (overview?.live_latest?.current_weight !== null && Number(overview?.live_latest?.current_weight) < 2) {
      alerts.push({
        priority: 'warning',
        sensorId: 'WEIGHT CHECK',
        desc: 'Gas level critically low',
        icon: 'ph-warning',
        color: '#ff4d00',
      });
    }

    // Feature-based alerts
    if (overview?.latest_feature?.idle_drop_rate > 0.01) {
      alerts.push({
        priority: 'warning',
        sensorId: 'LEAK DETECTION',
        desc: 'Unusual drop rate detected',
        icon: 'ph-warning',
        color: '#fbbf24',
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        priority: 'ok',
        sensorId: 'SYSTEM STATUS',
        desc: 'No critical alerts',
        icon: 'ph-check-circle',
        color: 'var(--lime)',
      });
    }

    const html = alerts
      .map(
        (alert) => `
      <div class="alert-row">
        <div class="alert-icon" style="color: ${alert.color};"><i class="ph-bold ${alert.icon}"></i></div>
        <div class="alert-text">
          <div class="id">${alert.sensorId}</div>
          <div class="desc">${alert.desc}</div>
        </div>
        <i class="ph-bold ${alert.priority === 'ok' ? 'ph-check-circle' : 'ph-x-circle'}" style="color: ${alert.color}; font-size: 1.2rem;"></i>
      </div>
    `
      )
      .join('');

    elements.alertsList.innerHTML = html;
  }

  function updateSensorTable(overview) {
    if (!elements.sensorTableBody) return;

    if (!overview?.has_live_sensor_data) {
      elements.sensorTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px; color: var(--text-secondary);">
            No active sensors connected yet.
          </td>
        </tr>
      `;
      return;
    }

    const health = overview?.live_latest?.current_weight
      ? Math.min(100, Math.max(0, Number(overview.live_latest.current_weight) * 7))
      : 0;
    const connectionStatus = overview?.live_latest?.connection_status ? 'Strong' : 'Weak';
    const signalIcon = overview?.live_latest?.connection_status ? 'ph-wifi-high' : 'ph-wifi-low';

    const html = `
      <tr>
        <td><strong>№1</strong></td>
        <td><div class="radial-sm" style="border-right-color: var(--lime); border-top-color: var(--lime);">${Math.round(health)}%</div></td>
        <td><div style="display: flex; align-items: center; gap: 8px;"><i class="ph-fill ph-drop"></i>${Math.round(Number(overview.live_latest.current_weight || 0) * 7)}%</div></td>
        <td><div style="display: flex; align-items: center; gap: 8px;"><i class="ph-bold ${signalIcon}"></i> ${connectionStatus}</div></td>
        <td><div style="display: flex; align-items: center; gap: 8px;">
          <i class="ph-bold ph-clock"></i>
          <span>${Math.round((Number(overview.live_latest.current_weight || 0) / 0.05))} mins</span>
        </div></td>
        <td><button class="pill-btn bg-lime text-black" style="padding: 6px 16px; font-size: 0.8rem;" onclick="alert('Detailed view coming soon');">Details</button></td>
      </tr>
    `;

    elements.sensorTableBody.innerHTML = html;
  }

  // Initialize
  loadReportData();
});
