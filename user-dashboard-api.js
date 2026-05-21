document.addEventListener('DOMContentLoaded', async () => {
  const auth = window.GTrackApi ? window.GTrackApi.readAuth() : null;

  if (!auth || auth.role !== 'user' || !auth.token) {
    window.location.href = 'index.html';
    return;
  }

  // Tell legacy UI script to skip random dashboard simulations when live API data is available.
  window.__GTRACK_LIVE_DASHBOARD__ = true;

  const userNameEl = document.getElementById('dashboard-user-name');
  const userSubtitleEl = document.getElementById('dashboard-user-subtitle');
  const gasWeightValueEl = document.getElementById('gas-weight-value');
  const gasWeightFillEl = document.getElementById('gas-weight-fill');
  const refillDayEl = document.getElementById('refill-day');
  const refillMonthTextEl = document.getElementById('refill-month-text');
  const activeDeviceCountEl = document.getElementById('dashboard-active-device-count');
  const activeDeviceLabelEl = document.getElementById('dashboard-active-device-label');
  const totalDaysEl = document.getElementById('dashboard-total-days');
  const usageChartContainer = document.getElementById('dashboard-usage-chart');
  const usageMonthText = document.getElementById('usage-month');

  const MAX_CYLINDER_WEIGHT = 14;

  function setStatusFallback(message) {
    if (userSubtitleEl) {
      userSubtitleEl.textContent = message;
    }
  }

  try {
    const me = await window.GTrackApi.request('/api/v1/users/me', {
      method: 'GET',
      token: auth.token,
    });

    if (userNameEl) {
      userNameEl.textContent = me.name || auth.name || 'User';
    }
    if (userSubtitleEl) {
      userSubtitleEl.textContent = me.email || auth.email || 'Consumer';
    }

    const hasDevice = !!me.device_id;
    if (activeDeviceCountEl) {
      activeDeviceCountEl.textContent = hasDevice ? '1' : '0';
    }
    if (activeDeviceLabelEl) {
      activeDeviceLabelEl.textContent = hasDevice ? 'Device' : 'Devices';
    }

    if (hasDevice) {
      const summary = await window.GTrackApi.request(
        `/api/v1/dashboard/summary?device_id=${encodeURIComponent(me.device_id)}`,
        { method: 'GET' }
      );

      const remainingGas = Number(summary.remaining_gas || 0);
      const normalizedWidth = Math.max(0, Math.min(100, (remainingGas / MAX_CYLINDER_WEIGHT) * 100));

      if (gasWeightValueEl) {
        gasWeightValueEl.textContent = `${remainingGas.toFixed(2)} kg`;
      }
      if (gasWeightFillEl) {
        gasWeightFillEl.style.width = `${normalizedWidth}%`;
        gasWeightFillEl.style.backgroundColor = normalizedWidth <= 20 ? '#ff3a3a' : 'var(--black)';
      }

      let predictedDate = summary.predicted_empty_date;
      
      // Fallback to data-overview if dashboard summary lacks predicted date but gas remains
      if (!predictedDate && remainingGas > 0) {
        try {
          const overview = await window.GTrackApi.request(`/api/v1/reports/device/data-overview?device_id=${encodeURIComponent(me.device_id)}`, { method: 'GET' });
          const consumption = overview?.latest_feature?.rolling_7day_avg_consumption || 0.8;
          if (consumption > 0) {
            const daysLeft = remainingGas / consumption;
            const date = new Date();
            date.setDate(date.getDate() + Math.round(daysLeft));
            predictedDate = date.toISOString();
          }
        } catch (e) {
          console.warn('Fallback predicted date calculation failed', e);
        }
      }

      if (predictedDate && refillDayEl && refillMonthTextEl) {
        const refillDate = new Date(predictedDate);
        refillDayEl.textContent = String(refillDate.getDate());
        refillMonthTextEl.innerHTML = `<strong>${refillDate.toLocaleDateString('en-US', { weekday: 'short' })},</strong><br>${refillDate.toLocaleDateString('en-US', { month: 'long' })}`;
      } else if (refillDayEl && refillMonthTextEl) {
        refillDayEl.textContent = '--';
        refillMonthTextEl.innerHTML = `<strong>No usage</strong><br>detected`;
      }
    } else {
      if (gasWeightValueEl) {
        gasWeightValueEl.textContent = 'No device linked';
      }
      if (gasWeightFillEl) {
        gasWeightFillEl.style.width = '0%';
      }
      if (refillDayEl && refillMonthTextEl) {
        refillDayEl.textContent = '--';
        refillMonthTextEl.innerHTML = '<strong>--</strong><br>Link device';
      }
    }

    const refillHistory = await window.GTrackApi.request(`/api/v1/refill/user/${encodeURIComponent(me.user_id)}`, {
      method: 'GET',
    });

    if (Array.isArray(refillHistory) && totalDaysEl) {
      totalDaysEl.textContent = String(refillHistory.length);
    }

    if (hasDevice && usageChartContainer) {
      try {
        const now = new Date();
        if (usageMonthText) {
           usageMonthText.textContent = now.toLocaleDateString('en-US', { month: 'long' });
        }
        
        // Fetch daily usage stats for the current year
        const stats = await window.GTrackApi.request(
          `/api/v1/reports/gas-usage/stats?device_id=${encodeURIComponent(me.device_id)}&granularity=daily&year=${now.getFullYear()}`,
          { method: 'GET' }
        );

        if (Array.isArray(stats) && stats.length > 0) {
          // Filter stats to only show the current month
          const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
          const currentYearStr = String(now.getFullYear());
          const prefix = `${currentYearStr}-${currentMonth}-`;
          
          let monthData = stats.filter(s => s.period.startsWith(prefix));
          
          if (monthData.length === 0) {
            // fallback to last 30 days if no data this month
            monthData = stats.slice(-30);
          }

          const maxUsage = Math.max(...monthData.map(s => Number(s.usage) || 0), 0.1);
          
          usageChartContainer.innerHTML = monthData.map((s, idx) => {
            const usage = Number(s.usage) || 0;
            const heightPct = Math.max(5, Math.min(100, Math.round((usage / maxUsage) * 100)));
            const dateStr = s.period; // e.g. "2026-05-21"
            const dayNum = parseInt(dateStr.split('-')[2], 10);
            
            let barColorClass = "bar-green";
            if (heightPct > 80) barColorClass = "bar-red";
            else if (heightPct > 50) barColorClass = "bar-yellow";
            
            const isToday = (dayNum === now.getDate() && dateStr.startsWith(prefix));
            const liveId = isToday ? 'id="live-bar-fill"' : '';
            const liveColId = isToday ? 'id="live-bar-col"' : '';
            
            return `<div class="bar-col" ${liveColId} data-tooltip="Day ${dayNum} • ${usage.toFixed(2)} kg">
              <div ${liveId} class="bar ${barColorClass}" style="height: ${heightPct}%; transition: height 0.5s ease-out, background-color 0.5s ease;"></div>
            </div>`;
          }).join('');
          
          // Add future cols to pad it out to ~30 if needed (looks better)
          const paddingCount = 30 - monthData.length;
          if (paddingCount > 0) {
             let padHtml = "";
             for(let i=0; i<paddingCount; i++) {
                padHtml += `<div class="bar-col future-col"><div class="bar bar-future" style="height: 50%;"></div></div>`;
             }
             usageChartContainer.innerHTML += padHtml;
          }

        } else {
          usageChartContainer.innerHTML = '<div style="color: var(--text-secondary); width: 100%; text-align: center; padding-top: 40px;">No usage data available</div>';
        }
      } catch (err) {
        console.warn('Failed to load usage stats for dashboard chart', err);
      }
    }

  } catch (error) {
    setStatusFallback(`API error: ${error.message}`);
  }
});
