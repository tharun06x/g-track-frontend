document.addEventListener('DOMContentLoaded', () => {
  function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  async function safeRequest(path, options) {
    try {
      return await window.GTrackApi.request(path, options);
    } catch {
      return null;
    }
  }

  document.querySelectorAll('.circle-btn, .pill-btn, .nav-item').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (el.tagName.toLowerCase() === 'a' && el.getAttribute('href') !== '#') {
        return;
      }
      if (el.textContent.includes('Modify') || el.textContent.includes('Book Now')) {
        return;
      }
      e.preventDefault();
      showToast('Action triggered');
    });
  });

  const auth = window.GTrackApi.readAuth();
  if (!auth || auth.role !== 'user' || !auth.token) {
    window.location.href = 'index.html';
    return;
  }

  const elements = {
    gasWeight: document.getElementById('gas-weight-value-live'),
    gasPercent: document.getElementById('gas-percent'),
    gaugeFill: document.getElementById('gauge-fill-live'),
    gaugePointer: document.getElementById('gauge-pointer-live'),
    daysRemaining: document.getElementById('days-remaining-value'),
    daysProgress: document.getElementById('days-remaining-progress'),
    thresholdValue: document.getElementById('refill-threshold-value'),
    datasetVersion: document.getElementById('dataset-version-value'),
    lifecycleCount: document.getElementById('lifecycle-count-value'),
    syntheticReadingsCount: document.getElementById('synthetic-readings-count'),
    syntheticFeaturesCount: document.getElementById('synthetic-features-count'),
    ratingValue: document.getElementById('consumption-rating'),
    featureConsumptionDay: document.getElementById('feature-consumption-day'),
    ratingLabel: document.getElementById('consumption-badge-label'),
    ratingDot: document.getElementById('consumption-dot'),
    trendChart: document.getElementById('consumption-trend-chart'),
    activityTimeline: document.getElementById('activity-timeline-list'),
    sensorLastUpdate: document.getElementById('sensor-last-update'),
    frontendLastFetch: document.getElementById('frontend-last-fetch'),
  };

  const pathLength = 251.3;
  let maxCapacityKg = 5; // hardcoded max for testing (5 kg cylinder)

  function updateGauge(weightKg, capacityKg) {
    const cap = Number(capacityKg) > 0 ? Number(capacityKg) : maxCapacityKg;
    const safeWeight = Math.max(0, Number(weightKg) || 0);
    const percent = Math.max(0, Math.min(100, Math.round((safeWeight / cap) * 100)));

    elements.gasWeight.textContent = `${safeWeight.toFixed(2)} kg`;
    elements.gasPercent.textContent = `${percent}%`;

    const percentageDecimal = percent / 100;
    elements.gaugeFill.style.strokeDasharray = pathLength;
    elements.gaugeFill.style.strokeDashoffset = pathLength * (1 - percentageDecimal);

    const angle = percentageDecimal * Math.PI;
    const xTip = 100 - 80 * Math.cos(angle);
    const yTip = 110 - 80 * Math.sin(angle);
    const xCap = xTip + 10 * Math.sin(angle);
    const yCap = yTip - 10 * Math.cos(angle);
    const dx = xCap - 100;
    const dy = yCap - 85;

    let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angleDeg < 100) angleDeg += 360;
    const rotation = angleDeg - 180;

    elements.gaugePointer.style.transformOrigin = '0px 0px';
    elements.gaugePointer.style.transform = `rotate(${rotation}deg)`;

    if (percent <= 15) {
      elements.gaugeFill.style.stroke = '#ff4d00';
      elements.gasWeight.style.color = '#ff4d00';
      elements.gasPercent.style.color = '#ff4d00';
    } else {
      elements.gaugeFill.style.stroke = 'var(--black)';
      elements.gasWeight.style.color = 'var(--black)';
      elements.gasPercent.style.color = 'var(--black)';
    }
  }

  function updateDaysRemaining(predictedDate, remainingWeight, overview) {
    let days = 0;
    if (predictedDate) {
      const now = new Date();
      const target = new Date(predictedDate);
      days = Math.max(0, Math.ceil((target - now) / (24 * 60 * 60 * 1000)));
    } else if (remainingWeight > 0) {
      const consumption = overview?.latest_feature?.rolling_7day_avg_consumption || 0.8;
      days = Math.round(remainingWeight / consumption);
    }

    elements.daysRemaining.textContent = String(days);
    const progress = Math.max(0, Math.min(100, Math.round((days / 30) * 100)));
    elements.daysProgress.style.width = `${progress}%`;
  }

  function updateConsumptionRating(gasUsedToday, avgDailyUsage, featureDailyUsage) {
    const effectiveDaily = Number.isFinite(featureDailyUsage) && featureDailyUsage > 0
      ? featureDailyUsage
      : gasUsedToday;
    let rating = 'Normal';
    let badge = 'Stable';
    let color = 'var(--lime)';

    if (avgDailyUsage > 0 && effectiveDaily > avgDailyUsage * 1.4) {
      rating = 'High';
      badge = 'Watch';
      color = '#f59e0b';
    } else if (avgDailyUsage > 0 && effectiveDaily < avgDailyUsage * 0.6) {
      rating = 'Low';
      badge = 'Efficient';
      color = '#3b82f6';
    }

    elements.ratingValue.textContent = rating;
    elements.ratingLabel.textContent = badge;
    elements.ratingDot.style.background = color;
    if (Number.isFinite(featureDailyUsage) && featureDailyUsage > 0) {
      elements.featureConsumptionDay.textContent = `Feature daily usage: ${featureDailyUsage.toFixed(2)} kg/day`;
    } else {
      elements.featureConsumptionDay.textContent = 'Feature daily usage: --';
    }
  }

  function updateSyntheticMeta(overview) {
    const datasetVersion = overview?.synthetic_device?.dataset_version;
    const lifecycleCount = overview?.synthetic_device?.lifecycle_count;
    const rows = overview?.synthetic_rows || {};

    elements.datasetVersion.textContent = datasetVersion ?? '--';
    elements.lifecycleCount.textContent = lifecycleCount ?? '--';
    elements.syntheticReadingsCount.textContent = Number.isFinite(rows.sensor_readings) ? rows.sensor_readings : '--';
    elements.syntheticFeaturesCount.textContent = Number.isFinite(rows.feature_rows) ? rows.feature_rows : '--';
  }

  function renderTrendBars(period, rows) {
    const isWeekly = period === 'weekly';
    const source = Array.isArray(rows) ? rows : [];

    let labels = [];
    let values = [];

    if (isWeekly) {
      const recent = source.slice(-7);
      labels = recent.map((item) => {
        const d = new Date(item.period);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
      values = recent.map((item) => Number(item.usage || 0));
    } else {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const byMonth = new Map(source.map((item) => [Number(item.period), Number(item.usage || 0)]));
      values = labels.map((_, idx) => byMonth.get(idx + 1) || 0);
    }

    if (values.length === 0) {
      elements.trendChart.innerHTML = '<div style="color: rgba(255,255,255,0.7); font-size: 0.85rem;">No trend data available.</div>';
      return;
    }

    const max = Math.max(...values, 1);
    elements.trendChart.innerHTML = labels
      .map((label, idx) => {
        const pct = Math.max(8, Math.round((values[idx] / max) * 100));
        const activeClass = idx === values.length - 1 ? 'active' : '';
        return `<div class="trend-col ${activeClass}"><div class="trend-bar" style="height: ${pct}%;"></div><span>${label}</span></div>`;
      })
      .join('');
  }

  function renderActivity(refills, summary, overview) {
    const items = [];

    if (summary && Number(summary.remaining_gas || 0) <= 2) {
      items.push({
        icon: 'ph-warning',
        color: '#FBBF24',
        title: 'Low Gas Warning',
        desc: `Remaining level is ${Number(summary.remaining_gas || 0).toFixed(2)} kg`,
        time: 'JUST NOW',
      });
    }

    (refills || []).slice(0, 3).forEach((item) => {
      const status = item.status;
      items.push({
        icon: status === 'approved' ? 'ph-check' : status === 'rejected' ? 'ph-x' : 'ph-clock',
        color: status === 'approved' ? 'var(--lime)' : status === 'rejected' ? '#f87171' : '#94a3b8',
        title: `Refill ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        desc: `Request ID ${item.request_id}`,
        time: new Date(item.requested_date).toLocaleDateString().toUpperCase(),
      });
    });

    const latestSynthetic = overview?.latest_synthetic_reading;
    if (latestSynthetic?.is_refill) {
      items.unshift({
        icon: 'ph-drop-half-bottom',
        color: 'var(--lime)',
        title: 'Synthetic Refill Event',
        desc: `Feature dataset flagged refill at ${Number(latestSynthetic.weight || 0).toFixed(2)} kg`,
        time: new Date(latestSynthetic.timestamp).toLocaleDateString().toUpperCase(),
      });
    }

    const latestFeature = overview?.latest_feature;
    if (latestFeature && Number.isFinite(latestFeature.session_count_today)) {
      items.push({
        icon: 'ph-chart-line-up',
        color: '#3b82f6',
        title: 'Usage Session Snapshot',
        desc: `${latestFeature.session_count_today} sessions today, ${Number(latestFeature.days_since_refill || 0).toFixed(1)} days since refill`,
        time: new Date(latestFeature.timestamp).toLocaleDateString().toUpperCase(),
      });
    }

    if (items.length === 0) {
      items.push({
        icon: 'ph-clock',
        color: '#94a3b8',
        title: 'No Recent Activity',
        desc: 'No refill or alert events found',
        time: 'NOW',
      });
    }

    const line = '<div style="position: absolute; left: 15px; top: 10px; bottom: 10px; border-left: 2px dashed #E2E8F0; z-index: 0;"></div>';
    const rows = items
      .map(
        (item) => `<div class="activity-item" style="display: flex; gap: 16px; position: relative; z-index: 1;">
          <div class="icon-circle" style="background: ${item.color}; color: #fff; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="ph-bold ${item.icon}"></i></div>
          <div>
            <div style="font-weight: 600; font-size: 0.95rem;">${item.title}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;">${item.desc}</div>
            <div style="font-size: 0.7rem; color: #a0a0a0; font-weight: 600; letter-spacing: 0.05em;">${item.time}</div>
          </div>
        </div>`
      )
      .join('');

    elements.activityTimeline.innerHTML = `${line}${rows}`;
  }

  async function loadMonitoringData() {
    // Show loading state on refresh button
    const refreshBtn = document.querySelector('[data-refresh="monitoring"]');
    if (refreshBtn && !refreshBtn.classList.contains('refreshing')) {
      refreshBtn.classList.add('refreshing');
    }

    try {
      const me = await window.GTrackApi.request('/api/v1/users/me', {
        method: 'GET',
        token: auth.token,
      });

      if (!me.device_id) {
        updateGauge(0);
        elements.daysRemaining.textContent = '--';
        elements.thresholdValue.textContent = '--';
        elements.datasetVersion.textContent = '--';
        elements.lifecycleCount.textContent = '--';
        elements.syntheticReadingsCount.textContent = '--';
        elements.syntheticFeaturesCount.textContent = '--';
        elements.featureConsumptionDay.textContent = 'Feature daily usage: --';
        elements.ratingValue.textContent = 'No Device';
        renderTrendBars('weekly', []);
        renderActivity([], null);
        showToast('No device linked to this user yet.');
        return;
      }

      const now = new Date();
      const [overview, summary, weightData, dailyStats, monthlyStats, settings, refills] = await Promise.all([
        safeRequest(`/api/v1/reports/device/data-overview?device_id=${encodeURIComponent(me.device_id)}`, { method: 'GET' }),
        safeRequest(`/api/v1/dashboard/summary?device_id=${encodeURIComponent(me.device_id)}`, { method: 'GET' }),
        safeRequest(`/api/v1/reports/cylinder/remaining-weight?device_id=${encodeURIComponent(me.device_id)}`, { method: 'GET' }),
        safeRequest(`/api/v1/reports/gas-usage/stats?device_id=${encodeURIComponent(me.device_id)}&granularity=daily&year=${now.getFullYear()}`, { method: 'GET' }),
        safeRequest(`/api/v1/reports/gas-usage/stats?device_id=${encodeURIComponent(me.device_id)}&granularity=monthly&year=${now.getFullYear()}`, { method: 'GET' }),
        safeRequest(`/api/v1/settings/${encodeURIComponent(me.user_id)}`, { method: 'GET', token: auth.token }),
        safeRequest(`/api/v1/refill/user/${encodeURIComponent(me.user_id)}`, { method: 'GET' }),
      ]);

      const currentWeight = Number(weightData?.remaining_weight || summary?.remaining_gas || 0);
      const featureDailyUsage = Number(overview?.latest_feature?.consumption_per_day);
      const userCapacityKg = Number(me.gas) > 0 ? Number(me.gas) : 14;
      maxCapacityKg = userCapacityKg; // update global so other calls use correct capacity

      updateGauge(currentWeight, userCapacityKg);
      updateDaysRemaining(summary?.predicted_empty_date, currentWeight, overview);

      // Update timestamps
      if (elements.frontendLastFetch) {
        elements.frontendLastFetch.textContent = `Fetched: ${new Date().toLocaleTimeString()}`;
      }
      if (elements.sensorLastUpdate && weightData?.last_update) {
        const sensorTime = new Date(weightData.last_update);
        elements.sensorLastUpdate.textContent = `Sensor: ${sensorTime.toLocaleTimeString()}`;
      }
      updateSyntheticMeta(overview);
      updateConsumptionRating(
        Number(summary?.gas_used_today || 0),
        Number(summary?.avg_daily_usage || 0),
        featureDailyUsage
      );
      if (settings && Number.isFinite(Number(settings.threshold_limit))) {
        elements.thresholdValue.textContent = `${Number(settings.threshold_limit).toFixed(1)}%`;
      } else {
        elements.thresholdValue.textContent = '--';
      }

      let weeklyData = Array.isArray(dailyStats) ? dailyStats : [];
      let monthlyData = Array.isArray(monthlyStats) ? monthlyStats : [];
      renderTrendBars('weekly', weeklyData);

      const periodToggles = document.querySelectorAll('#trend-period-toggles .pill');
      periodToggles.forEach((button) => {
        button.addEventListener('click', () => {
          periodToggles.forEach((btn) => {
            btn.classList.remove('active', 'bg-white');
            btn.style.color = 'rgba(255,255,255,0.6)';
          });
          button.classList.add('active', 'bg-white');
          button.style.color = 'var(--black)';

          renderTrendBars(button.dataset.period, button.dataset.period === 'weekly' ? weeklyData : monthlyData);
        });
      });

      renderActivity(Array.isArray(refills) ? refills : [], summary || null, overview || null);

      if (!summary && !weightData && !overview) {
        showToast('Could not load live metrics right now. Please try again.');
      }
    } catch (error) {
      showToast(`Monitoring load failed: ${error.message}`);
    } finally {
      // Hide loading state on refresh button
      const refreshBtn = document.querySelector('[data-refresh="monitoring"]');
      if (refreshBtn) {
        refreshBtn.classList.remove('refreshing');
      }
    }
  }

  loadMonitoringData();

  // Auto-refresh monitoring data every 2 seconds
  let refreshInterval = setInterval(() => {
    loadMonitoringData();
  }, 2000); // Refresh every 2 seconds

  // Optional: Add manual refresh button functionality
  const refreshBtn = document.querySelector('[data-refresh="monitoring"]');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadMonitoringData();
      showToast('Data refreshed');
    });
  }
});
